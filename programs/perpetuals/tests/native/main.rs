pub mod instructions;
pub mod tests_suite;
pub mod utils;

use tests_suite::{
    basic_interactions::basic_interactions,
    liquidity::{fixed_fees, insuffisient_fund as liquidity_insuffisient_fund, min_max_ratio},
    lp_token::lp_token_price,
    position::{liquidate_position, max_user_profit, min_max_leverage},
    swap::insuffisient_fund as swap_insuffisient_fund,
};

#[tokio::test]
pub async fn test_integration() {
    basic_interactions().await;

    swap_insuffisient_fund().await;

    fixed_fees().await;
    liquidity_insuffisient_fund().await;
    min_max_ratio().await;

    min_max_leverage().await;
    liquidate_position().await;
    max_user_profit().await;

    lp_token_price().await;
}
