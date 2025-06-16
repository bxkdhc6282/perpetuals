//! GetOraclePrice instruction handler

use {
    crate::state::{custody::Custody, oracle::OraclePrice, perpetuals::Perpetuals, pool::Pool},
    anchor_lang::prelude::*,
    pyth_solana_receiver_sdk::price_update::{PriceUpdateV2, TwapUpdate},
};

#[derive(Accounts)]
pub struct GetOraclePrice<'info> {
    #[account(
        seeds = [b"perpetuals"],
        bump = perpetuals.perpetuals_bump
    )]
    pub perpetuals: Box<Account<'info, Perpetuals>>,

    #[account(
        seeds = [b"pool",
                 pool.name.as_bytes()],
        bump = pool.bump
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        seeds = [b"custody",
                 pool.key().as_ref(),
                 custody.mint.as_ref()],
        bump = custody.bump
    )]
    pub custody: Box<Account<'info, Custody>>,

    // #[account(
    //     constraint = custody_oracle_account.key() == custody.oracle.oracle_account
    // )]
    pub custody_oracle_account: Account<'info, PriceUpdateV2>,
    pub custody_twap_account: Option<Account<'info, TwapUpdate>>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GetOraclePriceParams {
    ema: bool,
    feed_id: [u8; 32],
}

pub fn get_oracle_price(
    ctx: Context<GetOraclePrice>,
    params: &GetOraclePriceParams,
) -> Result<u64> {
    let custody = &ctx.accounts.custody;
    let curtime = ctx.accounts.perpetuals.get_time()?;

    let price = OraclePrice::new_from_oracle(
        &ctx.accounts.custody_oracle_account,
        ctx.accounts.custody_twap_account.as_ref(),
        &custody.oracle,
        curtime,
        params.ema,
        params.feed_id,
    )?;

    Ok(price
        .scale_to_exponent(-(Perpetuals::PRICE_DECIMALS as i32))?
        .price)
}
