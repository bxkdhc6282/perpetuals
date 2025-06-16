//! GetPnl instruction handler

use {
    crate::state::{
        custody::Custody,
        oracle::OraclePrice,
        perpetuals::{Perpetuals, ProfitAndLoss},
        pool::Pool,
        position::Position,
    },
    anchor_lang::prelude::*,
    pyth_solana_receiver_sdk::price_update::{PriceUpdateV2, TwapUpdate},
};

#[derive(Accounts)]
pub struct GetPnl<'info> {
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
        seeds = [b"position",
                 position.owner.as_ref(),
                 pool.key().as_ref(),
                 custody.key().as_ref(),
                 &[position.side as u8]],
        bump = position.bump
    )]
    pub position: Box<Account<'info, Position>>,

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

    #[account(
        constraint = position.collateral_custody == collateral_custody.key()
    )]
    pub collateral_custody: Box<Account<'info, Custody>>,

    // #[account(
    //     constraint = collateral_custody_oracle_account.key() == collateral_custody.oracle.oracle_account
    // )]
    pub collateral_custody_oracle_account: Account<'info, PriceUpdateV2>,
    pub collateral_custody_twap_account: Option<Account<'info, TwapUpdate>>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GetPnlParams {
    feed_id: [u8; 32],
}

pub fn get_pnl(ctx: Context<GetPnl>, _params: &GetPnlParams) -> Result<ProfitAndLoss> {
    // get oracle prices
    let position = &ctx.accounts.position;
    let pool = &ctx.accounts.pool;
    let curtime = ctx.accounts.perpetuals.get_time()?;
    let custody = &ctx.accounts.custody;
    let collateral_custody = &ctx.accounts.collateral_custody;

    let token_price = OraclePrice::new_from_oracle(
        &ctx.accounts.custody_oracle_account,
        ctx.accounts.custody_twap_account.as_ref(),
        &custody.oracle,
        curtime,
        false,
        _params.feed_id,
    )?;

    let token_ema_price = OraclePrice::new_from_oracle(
        &ctx.accounts.custody_oracle_account,
        ctx.accounts.custody_twap_account.as_ref(),
        &custody.oracle,
        curtime,
        custody.pricing.use_ema,
        _params.feed_id,
    )?;

    let collateral_token_price = OraclePrice::new_from_oracle(
        &ctx.accounts.collateral_custody_oracle_account,
        ctx.accounts.custody_twap_account.as_ref(),
        &custody.oracle,
        curtime,
        false,
        _params.feed_id,
    )?;

    let collateral_token_ema_price = OraclePrice::new_from_oracle(
        &ctx.accounts.custody_oracle_account,
        ctx.accounts.collateral_custody_twap_account.as_ref(),
        &custody.oracle,
        curtime,
        custody.pricing.use_ema,
        _params.feed_id,
    )?;

    // compute pnl
    let (profit, loss, _) = pool.get_pnl_usd(
        position,
        &token_price,
        &token_ema_price,
        custody,
        &collateral_token_price,
        &collateral_token_ema_price,
        collateral_custody,
        curtime,
        false,
    )?;

    Ok(ProfitAndLoss { profit, loss })
}
