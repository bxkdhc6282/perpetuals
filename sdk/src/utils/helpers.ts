import { FeesMode, OracleType, Side } from '../idl/types/params';

export function stringToOracleType(type: 'none' | 'custom' | 'pyth'): OracleType {
  switch (type.toLowerCase()) {
    case 'none':
      return { none: {} };
    case 'custom':
      return { custom: {} };
    case 'pyth':
      return { pyth: {} };
    default:
      throw new Error('Invalid oracle type');
  }
}

export function stringToSide(side: 'none' | 'long' | 'short'): Side {
  switch (side.toLowerCase()) {
    case 'none':
      return { none: {} };
    case 'long':
      return { long: {} };
    case 'short':
      return { short: {} };
    default:
      throw new Error('Invalid side');
  }
}

export function stringToFeesMode(mode: 'fixed' | 'linear' | 'optimal'): FeesMode {
  switch (mode.toLowerCase()) {
    case 'fixed':
      return { fixed: {} };
    case 'linear':
      return { linear: {} };
    case 'optimal':
      return { optimal: {} };
    default:
      throw new Error('Invalid fees mode');
  }
}

export function toLargeNumber(number: number, decimals: number = 6, maxValue?: number): number {
  const result = number * 10 ** decimals;

  // If maxValue is provided, validate against it
  if (maxValue !== undefined && result > maxValue) {
    throw new Error(`Value ${number} exceeds maximum allowed value ${maxValue / 10 ** decimals}`);
  }

  return result;
}

// Define the interface
interface HelperTokenRatios {
  target: number;
  min: number;
  max: number;
}

// First, define the Fees interface
interface HelperFees {
  swap_in: number;
  swap_out: number;
  stable_swap_in: number;
  stable_swap_out: number;
  add_liquidity: number;
  remove_liquidity: number;
  open_position: number;
  close_position: number;
  liquidation: number;
  protocol_share: number;
  fee_max: number;
  fee_optimal: number;
}

// Define the interfaces
interface HelperPricingParams {
  min_initial_leverage: number;
  max_initial_leverage: number;
  max_leverage: number;
  trade_spread_long: number;
  trade_spread_short: number;
  swap_spread: number;
  max_utilization: number;
  max_position_locked_usd: number;
  max_total_locked_usd: number;
}

interface HelperBorrowRateParams {
  optimal_utilization: number;
}

// Define the BPS_POWER constant (you'll need to get this from your program)
export const BPS_POWER = 10_000; // This should match your Rust program's BPS_POWER
export const RATE_POWER = 1_000_000_000; // Should match your Rust program

// Validation function
export function validateFees(fees: HelperFees): boolean {
  return (
    fees.swap_in <= BPS_POWER &&
    fees.swap_out <= BPS_POWER &&
    fees.stable_swap_in <= BPS_POWER &&
    fees.stable_swap_out <= BPS_POWER &&
    fees.add_liquidity <= BPS_POWER &&
    fees.remove_liquidity <= BPS_POWER &&
    fees.open_position <= BPS_POWER &&
    fees.close_position <= BPS_POWER &&
    fees.liquidation <= BPS_POWER &&
    fees.protocol_share <= BPS_POWER &&
    fees.fee_max <= BPS_POWER &&
    fees.fee_optimal <= BPS_POWER
  );
}

// PricingParams validation
export function validatePricingParams(pricing: HelperPricingParams): boolean {
  console.log('🔍 DEBUG - Pricing validation values:');
  console.log('  min_initial_leverage:', pricing.min_initial_leverage);
  console.log('  max_initial_leverage:', pricing.max_initial_leverage);
  console.log('  max_leverage:', pricing.max_leverage);
  console.log('  trade_spread_long:', pricing.trade_spread_long);
  console.log('  trade_spread_short:', pricing.trade_spread_short);
  console.log('  swap_spread:', pricing.swap_spread);
  console.log('  max_utilization:', pricing.max_utilization);
  console.log('  max_position_locked_usd:', pricing.max_position_locked_usd);
  console.log('  max_total_locked_usd:', pricing.max_total_locked_usd);
  console.log('  BPS_POWER:', BPS_POWER);

  const result =
    pricing.min_initial_leverage >= BPS_POWER &&
    pricing.min_initial_leverage <= pricing.max_initial_leverage &&
    pricing.max_initial_leverage <= pricing.max_leverage &&
    pricing.trade_spread_long < BPS_POWER &&
    pricing.trade_spread_short < BPS_POWER &&
    pricing.swap_spread < BPS_POWER &&
    pricing.max_utilization <= BPS_POWER &&
    pricing.max_position_locked_usd <= pricing.max_total_locked_usd;

  console.log('🔍 DEBUG - Validation result:', result);
  return result;
}

// BorrowRateParams validation
export function validateBorrowRateParams(borrowRate: HelperBorrowRateParams): boolean {
  return borrowRate.optimal_utilization > 0 && borrowRate.optimal_utilization <= RATE_POWER;
}

// TokenRatios validation
export function validateTokenRatios(ratios: HelperTokenRatios): boolean {
  return (
    ratios.target <= BPS_POWER &&
    ratios.min <= BPS_POWER &&
    ratios.max <= BPS_POWER &&
    ratios.min <= ratios.target &&
    ratios.target <= ratios.max
  );
}
