//! Liquidate instruction handler

use {
    crate::{
        error::PerpetualsError,
        math,
        state::{
            custody::Custody,
            oracle::OraclePrice,
            perpetuals::Perpetuals,
            pool::Pool,
            position::{Position, Side},
        },
    },
    anchor_lang::prelude::*,
    anchor_spl::token::{Token, TokenAccount},
    pyth_solana_receiver_sdk::price_update::{PriceUpdateV2, TwapUpdate},
};

#[derive(Accounts)]
#[instruction(params: LiquidateParams)]
pub struct Liquidate<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        constraint = receiving_account.mint == collateral_custody.mint,
        constraint = receiving_account.owner == position.owner
    )]
    pub receiving_account: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = rewards_receiving_account.mint == collateral_custody.mint,
        constraint = rewards_receiving_account.owner == signer.key()
    )]
    pub rewards_receiving_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: empty PDA, authority for token accounts
    #[account(
        seeds = [b"transfer_authority"],
        bump = perpetuals.transfer_authority_bump
    )]
    pub transfer_authority: AccountInfo<'info>,

    #[account(
        seeds = [b"perpetuals"],
        bump = perpetuals.perpetuals_bump
    )]
    pub perpetuals: Box<Account<'info, Perpetuals>>,

    #[account(
        mut,
        // seeds = [b"pool",
        //          pool.name.as_bytes()],
        // bump = pool.bump
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        mut,
        seeds = [b"position",
                 position.owner.as_ref(),
                 pool.key().as_ref(),
                 custody.key().as_ref(),
                 &[position.side as u8]],
        bump = position.bump,
        close = signer
    )]
    pub position: Box<Account<'info, Position>>,

    #[account(
        mut,
        constraint = position.custody == custody.key()
    )]
    pub custody: Box<Account<'info, Custody>>,

    pub custody_oracle_account: Account<'info, PriceUpdateV2>,
    pub custody_twap_account: Option<Account<'info, TwapUpdate>>,

    #[account(
        mut,
        constraint = position.collateral_custody == collateral_custody.key()
    )]
    pub collateral_custody: Box<Account<'info, Custody>>,

    pub collateral_custody_oracle_account: Account<'info, PriceUpdateV2>,
    pub collateral_custody_twap_account: Option<Account<'info, TwapUpdate>>,

    #[account(
        mut,
        // seeds = [b"custody_token_account",
        //          pool.key().as_ref(),
        //          collateral_custody.mint.as_ref()],
        // bump 
    )]
    pub collateral_custody_token_account: Box<Account<'info, TokenAccount>>,

    token_program: Program<'info, Token>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct LiquidateParams {
    // pub feed_id: [u8; 32],
}

pub fn liquidate(ctx: Context<Liquidate>, _params: &LiquidateParams) -> Result<()> {
    // check permissions
    msg!("Check permissions");
    let perpetuals = ctx.accounts.perpetuals.as_mut();
    let custody = ctx.accounts.custody.as_mut();
    let collateral_custody = ctx.accounts.collateral_custody.as_mut();
    require!(
        perpetuals.permissions.allow_close_position && custody.permissions.allow_close_position,
        PerpetualsError::InstructionNotAllowed
    );

    let position = ctx.accounts.position.as_mut();
    let pool = ctx.accounts.pool.as_mut();

    // check if position can be liquidated
    msg!("Check position state");
    let curtime = perpetuals.get_time()?;

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

    require!(
        !pool.check_leverage(
            position,
            &token_price,
            &token_ema_price,
            custody,
            &collateral_token_price,
            &collateral_token_ema_price,
            collateral_custody,
            curtime,
            false
        )?,
        PerpetualsError::InvalidPositionState
    );

    msg!("Settle position");
    let (total_amount_out, mut fee_amount, profit_usd, loss_usd) = pool.get_close_amount(
        position,
        &token_price,
        &token_ema_price,
        custody,
        &collateral_token_price,
        &collateral_token_ema_price,
        collateral_custody,
        curtime,
        true,
    )?;

    let fee_amount_usd = token_ema_price.get_asset_amount_usd(fee_amount, custody.decimals)?;
    if position.side == Side::Short || custody.is_virtual {
        fee_amount = collateral_token_ema_price
            .get_token_amount(fee_amount_usd, collateral_custody.decimals)?;
    }

    msg!("Net profit: {}, loss: {}", profit_usd, loss_usd);
    msg!("Collected fee: {}", fee_amount);

    let reward = Pool::get_fee_amount(custody.fees.liquidation, total_amount_out)?;
    let user_amount = math::checked_sub(total_amount_out, reward)?;

    msg!("Amount out: {}", user_amount);
    msg!("Reward: {}", reward);

    // unlock pool funds
    collateral_custody.unlock_funds(position.locked_amount)?;

    // check pool constraints
    msg!("Check pool constraints");
    require!(
        pool.check_available_amount(total_amount_out, collateral_custody)?,
        PerpetualsError::CustodyAmountLimit
    );

    // transfer tokens
    msg!("Transfer tokens");
    perpetuals.transfer_tokens(
        ctx.accounts
            .collateral_custody_token_account
            .to_account_info(),
        ctx.accounts.receiving_account.to_account_info(),
        ctx.accounts.transfer_authority.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        user_amount,
    )?;

    perpetuals.transfer_tokens(
        ctx.accounts
            .collateral_custody_token_account
            .to_account_info(),
        ctx.accounts.rewards_receiving_account.to_account_info(),
        ctx.accounts.transfer_authority.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        reward,
    )?;

    // update custody stats
    msg!("Update custody stats");
    collateral_custody.collected_fees.liquidation_usd = collateral_custody
        .collected_fees
        .liquidation_usd
        .wrapping_add(fee_amount_usd);

    if total_amount_out > position.collateral_amount {
        let amount_lost = total_amount_out.saturating_sub(position.collateral_amount);
        collateral_custody.assets.owned =
            math::checked_sub(collateral_custody.assets.owned, amount_lost)?;
    } else {
        let amount_gained = position.collateral_amount.saturating_sub(total_amount_out);
        collateral_custody.assets.owned =
            math::checked_add(collateral_custody.assets.owned, amount_gained)?;
    }
    collateral_custody.assets.collateral = math::checked_sub(
        collateral_custody.assets.collateral,
        position.collateral_amount,
    )?;

    let protocol_fee = Pool::get_fee_amount(custody.fees.protocol_share, fee_amount)?;

    // Pay protocol_fee from custody if possible, otherwise no protocol_fee
    if pool.check_available_amount(protocol_fee, collateral_custody)? {
        collateral_custody.assets.protocol_fees =
            math::checked_add(collateral_custody.assets.protocol_fees, protocol_fee)?;

        collateral_custody.assets.owned =
            math::checked_sub(collateral_custody.assets.owned, protocol_fee)?;
    }

    // if custody and collateral_custody accounts are the same, ensure that data is in sync
    if position.side == Side::Long && !custody.is_virtual {
        collateral_custody.volume_stats.liquidation_usd = math::checked_add(
            collateral_custody.volume_stats.liquidation_usd,
            position.size_usd,
        )?;

        if position.side == Side::Long {
            collateral_custody.trade_stats.oi_long_usd = collateral_custody
                .trade_stats
                .oi_long_usd
                .saturating_sub(position.size_usd);
        } else {
            collateral_custody.trade_stats.oi_short_usd = collateral_custody
                .trade_stats
                .oi_short_usd
                .saturating_sub(position.size_usd);
        }

        collateral_custody.trade_stats.profit_usd = collateral_custody
            .trade_stats
            .profit_usd
            .wrapping_add(profit_usd);
        collateral_custody.trade_stats.loss_usd = collateral_custody
            .trade_stats
            .loss_usd
            .wrapping_add(loss_usd);

        collateral_custody.remove_position(position, curtime, None)?;
        collateral_custody.update_borrow_rate(curtime)?;
        *custody = collateral_custody.clone();
    } else {
        custody.volume_stats.liquidation_usd =
            math::checked_add(custody.volume_stats.liquidation_usd, position.size_usd)?;

        if position.side == Side::Long {
            custody.trade_stats.oi_long_usd = custody
                .trade_stats
                .oi_long_usd
                .saturating_sub(position.size_usd);
        } else {
            custody.trade_stats.oi_short_usd = custody
                .trade_stats
                .oi_short_usd
                .saturating_sub(position.size_usd);
        }

        custody.trade_stats.profit_usd = custody.trade_stats.profit_usd.wrapping_add(profit_usd);
        custody.trade_stats.loss_usd = custody.trade_stats.loss_usd.wrapping_add(loss_usd);

        custody.remove_position(position, curtime, Some(collateral_custody))?;
        collateral_custody.update_borrow_rate(curtime)?;
    }

    Ok(())
}
