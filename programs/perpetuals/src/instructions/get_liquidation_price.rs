//! GetLiquidationPrice instruction handler

use {
    crate::{
        math,
        state::{
            custody::Custody, oracle::OraclePrice, perpetuals::Perpetuals, pool::Pool,
            position::Position,
        },
    },
    anchor_lang::prelude::*,
    pyth_solana_receiver_sdk::price_update::{PriceUpdateV2, TwapUpdate},
};

#[derive(Accounts)]
pub struct GetLiquidationPrice<'info> {
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
    pub collateral_custody_twap_account:
        Option<Account<'info, pyth_solana_receiver_sdk::price_update::TwapUpdate>>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GetLiquidationPriceParams {
    add_collateral: u64,
    remove_collateral: u64,
    // feed_id: [u8; 32],
}

pub fn get_liquidation_price(
    ctx: Context<GetLiquidationPrice>,
    params: &GetLiquidationPriceParams,
) -> Result<u64> {
    let custody = &ctx.accounts.custody;
    let collateral_custody = &ctx.accounts.collateral_custody;
    let curtime = ctx.accounts.perpetuals.get_time()?;

    let token_ema_price = OraclePrice::new_from_oracle(
        &ctx.accounts.custody_oracle_account,
        ctx.accounts.custody_twap_account.as_ref(),
        &custody.oracle,
        curtime,
        custody.pricing.use_ema,
        custody.oracle.feed_id,
    )?;

    let collateral_token_price = OraclePrice::new_from_oracle(
        &ctx.accounts.collateral_custody_oracle_account,
        ctx.accounts.collateral_custody_twap_account.as_ref(),
        &custody.oracle,
        curtime,
        false,
        collateral_custody.oracle.feed_id,
    )?;

    let collateral_token_ema_price = OraclePrice::new_from_oracle(
        &ctx.accounts.custody_oracle_account,
        ctx.accounts.collateral_custody_twap_account.as_ref(),
        &custody.oracle,
        curtime,
        custody.pricing.use_ema,
        collateral_custody.oracle.feed_id,
    )?;

    let min_collateral_price = collateral_token_price
        .get_min_price(&collateral_token_ema_price, collateral_custody.is_stable)?;

    let mut position = ctx.accounts.position.clone();
    position.update_time = ctx.accounts.perpetuals.get_time()?;

    if params.add_collateral > 0 {
        let collateral_usd = min_collateral_price
            .get_asset_amount_usd(params.add_collateral, collateral_custody.decimals)?;
        position.collateral_usd = math::checked_add(position.collateral_usd, collateral_usd)?;
        position.collateral_amount =
            math::checked_add(position.collateral_amount, params.add_collateral)?;
    }
    if params.remove_collateral > 0 {
        let collateral_usd = min_collateral_price
            .get_asset_amount_usd(params.remove_collateral, collateral_custody.decimals)?;
        if collateral_usd >= position.collateral_usd
            || params.remove_collateral >= position.collateral_amount
        {
            return Err(ProgramError::InsufficientFunds.into());
        }
        position.collateral_usd = math::checked_sub(position.collateral_usd, collateral_usd)?;
        position.collateral_amount =
            math::checked_sub(position.collateral_amount, params.remove_collateral)?;
    }

    ctx.accounts.pool.get_liquidation_price(
        &position,
        &token_ema_price,
        custody,
        collateral_custody,
        curtime,
    )
}
