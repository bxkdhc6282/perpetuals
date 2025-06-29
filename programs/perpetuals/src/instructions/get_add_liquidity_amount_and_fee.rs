//! GetAddLiquidityAmountAndFee instruction handler

use {
    crate::{
        math,
        state::{
            custody::Custody,
            oracle::OraclePrice,
            perpetuals::{AmountAndFee, Perpetuals},
            pool::{AumCalcMode, Pool},
        },
    },
    anchor_lang::{prelude::*, solana_program::program_error::ProgramError},
    anchor_spl::token::Mint,
    pyth_solana_receiver_sdk::price_update::{PriceUpdateV2, TwapUpdate},
};

#[derive(Accounts)]
pub struct GetAddLiquidityAmountAndFee<'info> {
    #[account(
        seeds = [b"perpetuals"],
        bump = perpetuals.perpetuals_bump
    )]
    pub perpetuals: Box<Account<'info, Perpetuals>>,

    #[account(
        // seeds = [b"pool",
        //          pool.name.as_bytes()],
        // bump = pool.bump
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        // seeds = [b"custody",
        //          pool.key().as_ref(),
        //          custody.mint.as_ref()],
        // bump = custody.bump
    )]
    pub custody: Box<Account<'info, Custody>>,

    // #[account(
    //     constraint = custody_oracle_account.key() == custody.oracle.oracle_account
    // )]
    pub custody_oracle_account: Account<'info, PriceUpdateV2>,

    pub custody_twap_account: Option<Account<'info, TwapUpdate>>,

    #[account(
        seeds = [b"lp_token_mint",
                 pool.key().as_ref()],
        bump = pool.lp_token_bump
    )]
    pub lp_token_mint: Box<Account<'info, Mint>>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GetAddLiquidityAmountAndFeeParams {
    amount_in: u64,
    // feed_id: [u8; 32],
}

pub fn get_add_liquidity_amount_and_fee(
    ctx: Context<GetAddLiquidityAmountAndFee>,
    params: &GetAddLiquidityAmountAndFeeParams,
) -> Result<AmountAndFee> {
    // validate inputs
    if params.amount_in == 0 {
        return Err(ProgramError::InvalidArgument.into());
    }
    let pool = &ctx.accounts.pool;
    let custody = &ctx.accounts.custody;
    let token_id = pool.get_token_id(&custody.key())?;

    // compute position price
    let curtime = ctx.accounts.perpetuals.get_time()?;

    let token_price = OraclePrice::new_from_oracle(
        &ctx.accounts.custody_oracle_account,
        ctx.accounts.custody_twap_account.as_ref(),
        &custody.oracle,
        curtime,
        false,
        custody.oracle.feed_id,
    )?;

    let token_ema_price = OraclePrice::new_from_oracle(
        &ctx.accounts.custody_oracle_account,
        ctx.accounts.custody_twap_account.as_ref(),
        &custody.oracle,
        curtime,
        custody.pricing.use_ema,
        custody.oracle.feed_id,
    )?;

    let fee_amount =
        pool.get_add_liquidity_fee(token_id, params.amount_in, custody, &token_price)?;
    let no_fee_amount = math::checked_sub(params.amount_in, fee_amount)?;

    let pool_amount_usd = pool.get_assets_under_management_usd(
        AumCalcMode::Max,
        ctx.remaining_accounts,
        curtime,
        // custody.oracle.feed_id,
    )?;

    let min_price = if token_price < token_ema_price {
        token_price
    } else {
        token_ema_price
    };
    let token_amount_usd = min_price.get_asset_amount_usd(no_fee_amount, custody.decimals)?;

    let lp_amount = if pool_amount_usd == 0 {
        token_amount_usd
    } else {
        math::checked_as_u64(math::checked_div(
            math::checked_mul(
                token_amount_usd as u128,
                ctx.accounts.lp_token_mint.supply as u128,
            )?,
            pool_amount_usd,
        )?)?
    };

    Ok(AmountAndFee {
        amount: lp_amount,
        fee: fee_amount,
    })
}
