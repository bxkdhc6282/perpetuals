//! Oracle price service handling

use {
    crate::{error::PerpetualsError, math, state::perpetuals::Perpetuals, try_from},
    anchor_lang::prelude::*,
    core::cmp::Ordering,
    pyth_solana_receiver_sdk::price_update::{PriceUpdateV2, TwapUpdate},
};

const ORACLE_EXPONENT_SCALE: i32 = -9;
const ORACLE_PRICE_SCALE: u64 = 1_000_000_000;
const ORACLE_MAX_PRICE: u64 = (1 << 28) - 1;

#[derive(Copy, Clone, PartialEq, AnchorSerialize, AnchorDeserialize, Debug)]
pub enum OracleType {
    None,
    Custom,
    Pyth,
}

impl Default for OracleType {
    fn default() -> Self {
        Self::Pyth
    }
}

#[derive(Copy, Clone, Eq, PartialEq, AnchorSerialize, AnchorDeserialize, Default, Debug)]
pub struct OraclePrice {
    pub price: u64,
    pub exponent: i32,
}

#[derive(Copy, Clone, PartialEq, AnchorSerialize, AnchorDeserialize, Default, Debug)]
pub struct OracleParams {
    pub oracle_account: Pubkey,
    pub oracle_type: OracleType,
    // The oracle_authority pubkey is allowed to sign permissionless off-chain price updates.
    pub oracle_authority: Pubkey,
    pub max_price_error: u64,
    pub max_price_age_sec: u32,
    pub feed_id: [u8; 32],
}

#[account]
#[derive(Default, Debug)]
pub struct CustomOracle {
    pub price: u64,
    pub expo: i32,
    pub conf: u64,
    pub ema: u64,
    pub publish_time: i64,
}

impl CustomOracle {
    pub const LEN: usize = 8 + std::mem::size_of::<CustomOracle>();

    pub fn set(&mut self, price: u64, expo: i32, conf: u64, ema: u64, publish_time: i64) {
        self.price = price;
        self.expo = expo;
        self.conf = conf;
        self.ema = ema;
        self.publish_time = publish_time;
    }
}

impl PartialOrd for OraclePrice {
    fn partial_cmp(&self, other: &OraclePrice) -> Option<Ordering> {
        let (lhs, rhs) = if self.exponent == other.exponent {
            (self.price, other.price)
        } else if self.exponent < other.exponent {
            if let Ok(scaled_price) = other.scale_to_exponent(self.exponent) {
                (self.price, scaled_price.price)
            } else {
                return None;
            }
        } else if let Ok(scaled_price) = self.scale_to_exponent(other.exponent) {
            (scaled_price.price, other.price)
        } else {
            return None;
        };
        lhs.partial_cmp(&rhs)
    }
}

#[allow(dead_code)]
impl OraclePrice {
    pub fn new(price: u64, exponent: i32) -> Self {
        Self { price, exponent }
    }

    pub fn new_from_token(amount_and_decimals: (u64, u8)) -> Self {
        Self {
            price: amount_and_decimals.0,
            exponent: -(amount_and_decimals.1 as i32),
        }
    }

    pub fn new_from_oracle(
        price_update: &Account<PriceUpdateV2>,
        twap_update: Option<&Account<TwapUpdate>>,
        oracle_params: &OracleParams,
        current_time: i64,
        _use_ema: bool,
        feed_id: [u8; 32],
    ) -> Result<Self> {
        match oracle_params.oracle_type {
            OracleType::Custom => Self::get_custom_price(
                &price_update.to_account_info(),
                oracle_params.max_price_error,
                oracle_params.max_price_age_sec,
                current_time,
                false,
            ),
            OracleType::Pyth => Self::get_pyth_price(
                price_update,
                twap_update,
                oracle_params.max_price_error,
                oracle_params.max_price_age_sec,
                current_time,
                false,
                feed_id,
            ),
            _ => err!(PerpetualsError::UnsupportedOracle),
        }
    }

    // Converts token amount to USD with implied USD_DECIMALS decimals using oracle price
    pub fn get_asset_amount_usd(&self, token_amount: u64, token_decimals: u8) -> Result<u64> {
        if token_amount == 0 || self.price == 0 {
            return Ok(0);
        }
        math::checked_decimal_mul(
            token_amount,
            -(token_decimals as i32),
            self.price,
            self.exponent,
            -(Perpetuals::USD_DECIMALS as i32),
        )
    }

    // Converts USD amount with implied USD_DECIMALS decimals to token amount
    pub fn get_token_amount(&self, asset_amount_usd: u64, token_decimals: u8) -> Result<u64> {
        if asset_amount_usd == 0 || self.price == 0 {
            return Ok(0);
        }
        math::checked_decimal_div(
            asset_amount_usd,
            -(Perpetuals::USD_DECIMALS as i32),
            self.price,
            self.exponent,
            -(token_decimals as i32),
        )
    }

    /// Returns price with mantissa normalized to be less than ORACLE_MAX_PRICE
    pub fn normalize(&self) -> Result<OraclePrice> {
        let mut p = self.price;
        let mut e = self.exponent;

        while p > ORACLE_MAX_PRICE {
            p = math::checked_div(p, 10)?;
            e = math::checked_add(e, 1)?;
        }

        Ok(OraclePrice {
            price: p,
            exponent: e,
        })
    }

    pub fn checked_div(&self, other: &OraclePrice) -> Result<OraclePrice> {
        let base = self.normalize()?;
        let other = other.normalize()?;

        Ok(OraclePrice {
            price: math::checked_div(
                math::checked_mul(base.price, ORACLE_PRICE_SCALE)?,
                other.price,
            )?,
            exponent: math::checked_sub(
                math::checked_add(base.exponent, ORACLE_EXPONENT_SCALE)?,
                other.exponent,
            )?,
        })
    }

    pub fn checked_mul(&self, other: &OraclePrice) -> Result<OraclePrice> {
        Ok(OraclePrice {
            price: math::checked_mul(self.price, other.price)?,
            exponent: math::checked_add(self.exponent, other.exponent)?,
        })
    }

    pub fn scale_to_exponent(&self, target_exponent: i32) -> Result<OraclePrice> {
        if target_exponent == self.exponent {
            return Ok(*self);
        }
        let delta = math::checked_sub(target_exponent, self.exponent)?;
        if delta > 0 {
            Ok(OraclePrice {
                price: math::checked_div(self.price, math::checked_pow(10, delta as usize)?)?,
                exponent: target_exponent,
            })
        } else {
            Ok(OraclePrice {
                price: math::checked_mul(self.price, math::checked_pow(10, (-delta) as usize)?)?,
                exponent: target_exponent,
            })
        }
    }

    pub fn checked_as_f64(&self) -> Result<f64> {
        math::checked_float_mul(
            math::checked_as_f64(self.price)?,
            math::checked_powi(10.0, self.exponent)?,
        )
    }

    pub fn get_min_price(&self, other: &OraclePrice, is_stable: bool) -> Result<OraclePrice> {
        let min_price = if self < other { self } else { other };
        if is_stable {
            if min_price.exponent > 0 {
                if min_price.price == 0 {
                    return Ok(*min_price);
                } else {
                    return Ok(OraclePrice {
                        price: 1000000u64,
                        exponent: -6,
                    });
                }
            }
            let one_usd = math::checked_pow(10u64, (-min_price.exponent) as usize)?;
            if min_price.price > one_usd {
                Ok(OraclePrice {
                    price: one_usd,
                    exponent: min_price.exponent,
                })
            } else {
                Ok(*min_price)
            }
        } else {
            Ok(*min_price)
        }
    }

    // private helpers
    fn get_custom_price(
        custom_price_info: &AccountInfo,
        max_price_error: u64,
        max_price_age_sec: u32,
        current_time: i64,
        use_ema: bool,
    ) -> Result<OraclePrice> {
        require!(
            !Perpetuals::is_empty_account(custom_price_info)?,
            PerpetualsError::InvalidOracleAccount
        );

        let oracle_acc = try_from!(Account<CustomOracle>, custom_price_info)?;

        let last_update_age_sec = math::checked_sub(current_time, oracle_acc.publish_time)?;
        if last_update_age_sec > max_price_age_sec as i64 {
            msg!("Error: Custom oracle price is stale");
            return err!(PerpetualsError::StaleOraclePrice);
        }
        let price = if use_ema {
            oracle_acc.ema
        } else {
            oracle_acc.price
        };

        if price == 0
            || math::checked_div(
                math::checked_mul(oracle_acc.conf as u128, Perpetuals::BPS_POWER)?,
                price as u128,
            )? > max_price_error as u128
        {
            msg!("Error: Custom oracle price is out of bounds");
            return err!(PerpetualsError::InvalidOraclePrice);
        }

        Ok(OraclePrice {
            // price is i64 and > 0 per check above
            price,
            exponent: oracle_acc.expo,
        })
    }

    fn get_pyth_price(
        price_update: &Account<PriceUpdateV2>,
        twap_update: Option<&Account<TwapUpdate>>,
        max_price_error: u64,
        max_price_age_sec: u32,
        current_time: i64,
        use_ema: bool,
        feed_id: [u8; 32],
    ) -> Result<OraclePrice> {
        require!(
            !Perpetuals::is_empty_account(&price_update.to_account_info())?,
            PerpetualsError::InvalidOracleAccount
        );

        let maximum_age: u64 = 300;

        let twap_price = match twap_update {
            Some(twap) => Some(twap.get_twap_no_older_than(
                &Clock::get()?,
                maximum_age,
                max_price_age_sec as u64,
                &feed_id,
            )?),
            None => None,
        };

        let price = price_update.get_price_no_older_than(&Clock::get()?, maximum_age, &feed_id)?;

        let final_price = if use_ema {
            twap_price.ok_or(PerpetualsError::MissingTwap)?.price
        } else {
            let publish_time: i64 = price.publish_time;

            let last_update_age_sec = math::checked_sub(current_time, publish_time)?;

            if last_update_age_sec > max_price_age_sec as i64 {
                msg!("Error: Pyth oracle price is stale");
                return err!(PerpetualsError::StaleOraclePrice);
            }

            price.price
        };

        let final_exponent: i32 = if use_ema {
            twap_price.ok_or(PerpetualsError::MissingTwap)?.exponent
        } else {
            price.exponent
        };

        let conf_value = if use_ema {
            twap_price.ok_or(PerpetualsError::MissingTwap)?.conf
        } else {
            price.conf
        };

        if final_price <= 0
            || math::checked_div(
                math::checked_mul(conf_value as u128, Perpetuals::BPS_POWER)?,
                final_price as u128,
            )? > max_price_error as u128
        {
            msg!("Error: Pyth oracle price is out of bounds");
            return err!(PerpetualsError::InvalidOraclePrice);
        }

        msg!(
            "The price is ({} ± {}) * 10^{}",
            final_price,
            conf_value,
            final_exponent
        );

        Ok(OraclePrice {
            price: final_price as u64,
            exponent: final_exponent,
        })
    }
}

#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn test_checked_as_f64() {
        let price = OraclePrice::new(12300, -3);
        assert_eq!(12.3, price.checked_as_f64().unwrap());

        let price = OraclePrice::new(12300, 3);
        assert_eq!(12300000.0, price.checked_as_f64().unwrap());
    }

    #[test]
    fn test_scale_to_exponent() {
        let price = OraclePrice::new(12300, -3);
        let scaled = price.scale_to_exponent(-6).unwrap();
        assert_eq!(12300000, scaled.price);
        assert_eq!(-6, scaled.exponent);

        let scaled = price.scale_to_exponent(-1).unwrap();
        assert_eq!(123, scaled.price);
        assert_eq!(-1, scaled.exponent);

        let scaled = price.scale_to_exponent(1).unwrap();
        assert_eq!(1, scaled.price);
        assert_eq!(1, scaled.exponent);
    }
}
