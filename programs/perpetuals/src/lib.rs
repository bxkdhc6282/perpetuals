//! Perpetuals program entrypoint

#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

pub mod error;
pub mod instructions;
pub mod macros;
pub mod math;
pub mod state;

use {
    anchor_lang::prelude::*,
    instructions::*,
    state::perpetuals::{
        AmountAndFee, NewPositionPricesAndFee, PriceAndFee, ProfitAndLoss, SwapAmountAndFees,
    },
};

solana_security_txt::security_txt! {
    name: "Perpetuals",
    project_url: "https://github.com/bxkdhc6282/perpetuals",
    contacts: "email:bxkdhc6282@gmail.com",
    policy: "",
    preferred_languages: "en",
    auditors: "Halborn"
}

declare_id!("6RfdxdBjsqLmgBtJizGSAu4NyXTctDGPRYJB8YmeqGio");

#[program]
pub mod perpetuals {
    use super::*;

    // admin instructions
    pub fn init(ctx: Context<Init>, params: InitParams) -> Result<()> {
        instructions::init(ctx, &params)
    }

    pub fn add_pool<'info>(
        ctx: Context<'_, '_, '_, 'info, AddPool<'info>>,
        params: AddPoolParams,
    ) -> Result<u8> {
        instructions::add_pool(ctx, &params)
    }

    pub fn remove_pool<'info>(
        ctx: Context<'_, '_, '_, 'info, RemovePool<'info>>,
        params: RemovePoolParams,
    ) -> Result<u8> {
        instructions::remove_pool(ctx, &params)
    }

    pub fn add_custody<'info>(
        ctx: Context<'_, '_, '_, 'info, AddCustody<'info>>,
        params: AddCustodyParams,
    ) -> Result<u8> {
        instructions::add_custody(ctx, &params)
    }

    // !THIS IS MEANT TO BE USED WITH ADD CUSTODY INSTRUCTION
    // !ADD IN SAME TRANSACTION ONLY

    pub fn add_custody_token_account<'info>(
        ctx: Context<'_, '_, '_, 'info, AddCustodyTokenAccount<'info>>,
    ) -> Result<()> {
        instructions::add_custody_token_account(ctx)
    }

    // pub fn add_custody_init<'info>(
    //     ctx: Context<'_, '_, '_, 'info, AddCustodyInit<'info>>,
    //     params: AddCustodyInitParams,
    // ) -> Result<u8> {
    //     instructions::add_custody_init(ctx, &params)
    // }

    pub fn remove_custody<'info>(
        ctx: Context<'_, '_, '_, 'info, RemoveCustody<'info>>,
        params: RemoveCustodyParams,
    ) -> Result<u8> {
        instructions::remove_custody(ctx, &params)
    }

    pub fn set_admin_signers<'info>(
        ctx: Context<'_, '_, '_, 'info, SetAdminSigners<'info>>,
        params: SetAdminSignersParams,
    ) -> Result<u8> {
        instructions::set_admin_signers(ctx, &params)
    }

    pub fn set_custody_config<'info>(
        ctx: Context<'_, '_, '_, 'info, SetCustodyConfig<'info>>,
        params: SetCustodyConfigParams,
    ) -> Result<u8> {
        instructions::set_custody_config(ctx, &params)
    }

    pub fn set_permissions<'info>(
        ctx: Context<'_, '_, '_, 'info, SetPermissions<'info>>,
        params: SetPermissionsParams,
    ) -> Result<u8> {
        instructions::set_permissions(ctx, &params)
    }

    pub fn withdraw_fees<'info>(
        ctx: Context<'_, '_, '_, 'info, WithdrawFees<'info>>,
        params: WithdrawFeesParams,
    ) -> Result<u8> {
        instructions::withdraw_fees(ctx, &params)
    }

    pub fn withdraw_sol_fees<'info>(
        ctx: Context<'_, '_, '_, 'info, WithdrawSolFees<'info>>,
        params: WithdrawSolFeesParams,
    ) -> Result<u8> {
        instructions::withdraw_sol_fees(ctx, &params)
    }

    pub fn upgrade_custody<'info>(
        ctx: Context<'_, '_, '_, 'info, UpgradeCustody<'info>>,
        params: UpgradeCustodyParams,
    ) -> Result<u8> {
        instructions::upgrade_custody(ctx, &params)
    }

    pub fn set_custom_oracle_price<'info>(
        ctx: Context<'_, '_, '_, 'info, SetCustomOraclePrice<'info>>,
        params: SetCustomOraclePriceParams,
    ) -> Result<u8> {
        instructions::set_custom_oracle_price(ctx, &params)
    }

    // test instructions

    pub fn set_test_time<'info>(
        ctx: Context<'_, '_, '_, 'info, SetTestTime<'info>>,
        params: SetTestTimeParams,
    ) -> Result<u8> {
        instructions::set_test_time(ctx, &params)
    }

    // public instructions

    pub fn swap(ctx: Context<Swap>, params: SwapParams) -> Result<()> {
        instructions::swap(ctx, &params)
    }

    pub fn add_liquidity(ctx: Context<AddLiquidity>, params: AddLiquidityParams) -> Result<()> {
        instructions::add_liquidity(ctx, &params)
    }

    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        params: RemoveLiquidityParams,
    ) -> Result<()> {
        instructions::remove_liquidity(ctx, &params)
    }

    pub fn open_position(ctx: Context<OpenPosition>, params: OpenPositionParams) -> Result<()> {
        instructions::open_position(ctx, &params)
    }

    pub fn add_collateral(ctx: Context<AddCollateral>, params: AddCollateralParams) -> Result<()> {
        instructions::add_collateral(ctx, &params)
    }

    pub fn remove_collateral(
        ctx: Context<RemoveCollateral>,
        params: RemoveCollateralParams,
    ) -> Result<()> {
        instructions::remove_collateral(ctx, &params)
    }

    pub fn close_position(ctx: Context<ClosePosition>, params: ClosePositionParams) -> Result<()> {
        instructions::close_position(ctx, &params)
    }

    pub fn liquidate(ctx: Context<Liquidate>, params: LiquidateParams) -> Result<()> {
        instructions::liquidate(ctx, &params)
    }

    pub fn update_pool_aum(ctx: Context<UpdatePoolAum>) -> Result<u128> {
        instructions::update_pool_aum(ctx)
    }

    pub fn get_add_liquidity_amount_and_fee(
        ctx: Context<GetAddLiquidityAmountAndFee>,
        params: GetAddLiquidityAmountAndFeeParams,
    ) -> Result<AmountAndFee> {
        instructions::get_add_liquidity_amount_and_fee(ctx, &params)
    }

    pub fn get_remove_liquidity_amount_and_fee(
        ctx: Context<GetRemoveLiquidityAmountAndFee>,
        params: GetRemoveLiquidityAmountAndFeeParams,
    ) -> Result<AmountAndFee> {
        instructions::get_remove_liquidity_amount_and_fee(ctx, &params)
    }

    pub fn get_entry_price_and_fee(
        ctx: Context<GetEntryPriceAndFee>,
        params: GetEntryPriceAndFeeParams,
    ) -> Result<NewPositionPricesAndFee> {
        instructions::get_entry_price_and_fee(ctx, &params)
    }

    pub fn get_exit_price_and_fee(
        ctx: Context<GetExitPriceAndFee>,
        params: GetExitPriceAndFeeParams,
    ) -> Result<PriceAndFee> {
        instructions::get_exit_price_and_fee(ctx, &params)
    }

    pub fn get_pnl(ctx: Context<GetPnl>, params: GetPnlParams) -> Result<ProfitAndLoss> {
        instructions::get_pnl(ctx, &params)
    }

    pub fn get_liquidation_price(
        ctx: Context<GetLiquidationPrice>,
        params: GetLiquidationPriceParams,
    ) -> Result<u64> {
        instructions::get_liquidation_price(ctx, &params)
    }

    pub fn get_liquidation_state(
        ctx: Context<GetLiquidationState>,
        params: GetLiquidationStateParams,
    ) -> Result<u8> {
        instructions::get_liquidation_state(ctx, &params)
    }

    pub fn get_oracle_price(
        ctx: Context<GetOraclePrice>,
        params: GetOraclePriceParams,
    ) -> Result<u64> {
        instructions::get_oracle_price(ctx, &params)
    }

    pub fn get_swap_amount_and_fees(
        ctx: Context<GetSwapAmountAndFees>,
        params: GetSwapAmountAndFeesParams,
    ) -> Result<SwapAmountAndFees> {
        instructions::get_swap_amount_and_fees(ctx, &params)
    }

    pub fn get_assets_under_management(
        ctx: Context<GetAssetsUnderManagement>,
        params: GetAssetsUnderManagementParams,
    ) -> Result<u128> {
        instructions::get_assets_under_management(ctx, &params)
    }

    pub fn get_lp_token_price(
        ctx: Context<GetLpTokenPrice>,
        params: GetLpTokenPriceParams,
    ) -> Result<u64> {
        instructions::get_lp_token_price(ctx, &params)
    }

    // This instruction must be part of a larger transaction where the **first** instruction
    // is an ed25519 verification of the serialized oracle price update params.
    pub fn set_custom_oracle_price_permissionless(
        ctx: Context<SetCustomOraclePricePermissionless>,
        params: SetCustomOraclePricePermissionlessParams,
    ) -> Result<()> {
        instructions::set_custom_oracle_price_permissionless(ctx, &params)
    }
}
