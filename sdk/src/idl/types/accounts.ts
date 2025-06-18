import { BN, IdlAccounts } from '@coral-xyz/anchor';
import { Perpetuals as PerpetualsIdl } from './perpetuals';
import {
  Assets,
  BorrowRateParams,
  Fees,
  FeesStats,
  OracleParams,
  PricingParams,
  Side,
  VolumeStats,
  Permissions,
} from './params';
import { PublicKey } from '@solana/web3.js/lib';

export type CustomOracle = IdlAccounts<PerpetualsIdl>['customOracle'];
export type Multisig = IdlAccounts<PerpetualsIdl>['multisig'];
export type Perpetuals = IdlAccounts<PerpetualsIdl>['perpetuals'];
export type Pool = IdlAccounts<PerpetualsIdl>['pool'];
export type PriceUpdateV2 = IdlAccounts<PerpetualsIdl>['priceUpdateV2'];
export type TwapUpdate = IdlAccounts<PerpetualsIdl>['twapUpdate'];

export type Position = {
  owner: PublicKey;
  pool: PublicKey;
  custody: PublicKey;
  collateralCustody: PublicKey;
  openTime: BN;
  updateTime: BN;
  side: Side;
  price: BN;
  sizeUsd: BN;
  borrowSizeUsd: BN;
  collateralUsd: BN;
  unrealizedProfitUsd: BN;
  unrealizedLossUsd: BN;
  cumulativeInterestSnapshot: BN;
  lockedAmount: BN;
  collateralAmount: BN;
  bump: number;
};

export type Custody = {
  pool: PublicKey;
  mint: PublicKey;
  tokenAccount: PublicKey;
  decimals: number;
  isStable: boolean;
  isVirtual: boolean;
  oracle: OracleParams;
  pricing: PricingParams;
  permissions: Permissions;
  fees: Fees;
  borrowRate: BorrowRateParams;
  assets: Assets;
  collectedFees: FeesStats;
  volumeStats: VolumeStats;
};
