import { BN, IdlTypes } from '@coral-xyz/anchor';
import { Perpetuals as PerpetualsIdl } from './perpetuals';
import { PublicKey } from '@solana/web3.js/lib';

export type AddCollateralParams = IdlTypes<PerpetualsIdl>['addCollateralParams'];

export type AddCustodyParams = {
  isStable: boolean;
  isVirtual: boolean;
  oracle: OracleParams;
  pricing: PricingParams;
  permissions: Permissions;
  fees: Fees;
  borrowRate: BorrowRateParams;
  ratios: TokenRatios[];
};

export type AddLiquidityParams = IdlTypes<PerpetualsIdl>['addLiquidityParams'];

export type AddPoolParams = IdlTypes<PerpetualsIdl>['addPoolParams'];

export type Assets = IdlTypes<PerpetualsIdl>['assets'];

export type BorrowRateParams = IdlTypes<PerpetualsIdl>['borrowRateParams'];

export type BorrowRateState = IdlTypes<PerpetualsIdl>['borrowRateState'];

export type ClosePositionParams = IdlTypes<PerpetualsIdl>['closePositionParams'];

export type Fees = {
  mode: FeesMode;
  ratioMult: BN; // u64
  utilizationMult: BN; // u64
  swapIn: BN; // u64
  swapOut: BN; // u64
  stableSwapIn: BN; // u64
  stableSwapOut: BN; // u64
  addLiquidity: BN; // u64
  removeLiquidity: BN; // u64
  openPosition: BN; // u64
  closePosition: BN; // u64
  liquidation: BN; // u64
  protocolShare: BN; // u64
  feeMax: BN; // u64
  feeOptimal: BN; // u64
};

export type FeesMode = IdlTypes<PerpetualsIdl>['feesMode'];

export type FeesStats = IdlTypes<PerpetualsIdl>['feesStats'];

export type GetAddLiquidityAmountAndFeeParams =
  IdlTypes<PerpetualsIdl>['getAddLiquidityAmountAndFeeParams'];

export type GetAssetsUnderManagementParams =
  IdlTypes<PerpetualsIdl>['getAssetsUnderManagementParams'];

export type GetEntryPriceAndFeeParams = {
  collateral: BN;
  size: BN;
  side: Side; // Side is likely an enum or union type, e.g. "long" | "short" | "none"
};

export type GetExitPriceAndFeeParams = IdlTypes<PerpetualsIdl>['getExitPriceAndFeeParams'];

export type GetLiquidationPriceParams = IdlTypes<PerpetualsIdl>['getLiquidationPriceParams'];

export type GetLiquidationStateParams = IdlTypes<PerpetualsIdl>['getLiquidationStateParams'];

export type GetLpTokenPriceParams = IdlTypes<PerpetualsIdl>['getLpTokenPriceParams'];

export type GetOraclePriceParams = IdlTypes<PerpetualsIdl>['getOraclePriceParams'];

export type GetPnlParams = IdlTypes<PerpetualsIdl>['getPnlParams'];

export type GetRemoveLiquidityAmountAndFeeParams =
  IdlTypes<PerpetualsIdl>['getRemoveLiquidityAmountAndFeeParams'];

export type GetSwapAmountAndFeesParams = IdlTypes<PerpetualsIdl>['getSwapAmountAndFeesParams'];

export type InitParams = IdlTypes<PerpetualsIdl>['initParams'];

export type LiquidateParams = IdlTypes<PerpetualsIdl>['liquidateParams'];

export type SetAdminSignersParams = IdlTypes<PerpetualsIdl>['setAdminSignersParams'];

export type NewPositionPricesAndFee = IdlTypes<PerpetualsIdl>['newPositionPricesAndFee'];

export type OpenPositionParams = {
  price: BN;
  collateral: BN;
  size: BN;
  side: Side; // Side is likely an enum or union type, e.g. "long" | "short" | "none"
  takeProfitPrice: BN | null;
  stopLossPrice: BN | null;
};

export type OracleParams = {
  oracleAccount: PublicKey;
  oracleType: OracleType; // likely an enum, e.g. "none" | "custom" | "pyth"
  oracleAuthority: PublicKey;
  maxPriceError: BN;
  maxPriceAgeSec: number;
  feedId: number[]; // or Uint8Array, depending on your codegen
};

export type OracleType = IdlTypes<PerpetualsIdl>['oracleType'];

export type Permissions = IdlTypes<PerpetualsIdl>['permissions'];

export type RemovePoolParams = IdlTypes<PerpetualsIdl>['removePoolParams'];

export type AmountAndFee = IdlTypes<PerpetualsIdl>['amountAndFee'];

export type PositionStats = IdlTypes<PerpetualsIdl>['positionStats'];

export type PriceAndFee = IdlTypes<PerpetualsIdl>['priceAndFee'];

export type PricingParams = IdlTypes<PerpetualsIdl>['pricingParams'];

export type ProfitAndLoss = IdlTypes<PerpetualsIdl>['profitAndLoss'];

export type RemoveCollateralParams = IdlTypes<PerpetualsIdl>['removeCollateralParams'];

export type Side = IdlTypes<PerpetualsIdl>['side'];

export type SwapAmountAndFees = IdlTypes<PerpetualsIdl>['swapAmountAndFees'];

export type SwapParams = IdlTypes<PerpetualsIdl>['swapParams'];

export type TokenRatios = IdlTypes<PerpetualsIdl>['tokenRatios'];

export type TradeStats = IdlTypes<PerpetualsIdl>['tradeStats'];

export type VolumeStats = IdlTypes<PerpetualsIdl>['volumeStats'];

export type RemoveCustodyParams = IdlTypes<PerpetualsIdl>['removeCustodyParams'];

export type SetCustomOraclePriceParams = IdlTypes<PerpetualsIdl>['setCustomOraclePriceParams'];

export type SetCustodyConfigParams = IdlTypes<PerpetualsIdl>['setCustodyConfigParams'];
