import { BN, Program, Wallet } from '@coral-xyz/anchor';
import { Perpetuals as PerpetualsIdl } from './idl/types/perpetuals';
import {
  Transaction,
  PublicKey,
  AccountMeta,
  Connection,
  // TransactionInstruction,
} from '@solana/web3.js';
import { Custody, Multisig, Position } from './idl/types/accounts';
import {
  AmountAndFee,
  NewPositionPricesAndFee,
  PriceAndFee,
  ProfitAndLoss,
  SwapAmountAndFees,
} from './idl/types/params';
import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';

export type Environment = 'mainnet' | 'devnet' | 'testnet';

export interface IWallet extends Wallet {
  signAndSendTransaction(tx: Transaction): Promise<{ signature: string }>;
  publicKey: PublicKey;
  signAndSendWithOracle(
    tx: Transaction,
    oracle: PythSolanaReceiver
  ): Promise<{ signature: string }>;
}

export interface IPerpetualsClient {
  program: Program<PerpetualsIdl>;
  connection: Connection;
  wallet: IWallet;
  environment: Environment;
  oracleClient: IOracleClient;
  getWallet(): IWallet;
  getEnvironment(): Environment;
  findProgramAddress(
    label: string,
    extraSeeds?: any
  ): {
    publicKey: PublicKey;
    bump: number;
  };
  getPerpetuals(): Promise<{
    permissions: any;
    pools: PublicKey[];
    transferAuthorityBump: number;
    perpetualsBump: number;
    inceptionTime: BN;
  }>;
  getPoolKey(name: string): PublicKey;

  getPool(name: string): Promise<{
    name: string;
    custodies: PublicKey[];
    ratios: any[];
    aumUsd: BN;
    bump: number;
    lpTokenBump: number;
    inceptionTime: BN;
  }>;

  getPools(): Promise<
    ({
      name: string;
      custodies: PublicKey[];
      ratios: any[];
      aumUsd: BN;
      bump: number;
      lpTokenBump: number;
      inceptionTime: BN;
    } | null)[]
  >;

  getPoolLpTokenKey(name: string): PublicKey;

  getCustodyKey(poolName: string, tokenMint: PublicKey): PublicKey;

  getCustodyTokenAccountKey(poolName: string, tokenMint: PublicKey): PublicKey;

  getCustody(poolName: string, tokenMint: PublicKey): Promise<Custody>;

  getCustodyOracleAccountKey(poolName: string, tokenMint: PublicKey): Promise<PublicKey>;

  getCustodyCustomOracleAccountKey(poolName: string, tokenMint: PublicKey): PublicKey;

  getCustodies(poolName: string): Promise<(Custody | null)[]>;

  getCustodyMetas(poolName: string): Promise<AccountMeta[]>;

  getCollateralCustodyMint(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    side: 'none' | 'long' | 'short'
  ): Promise<PublicKey>;

  getMultisig(): Promise<Multisig>;

  getPositionKey(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    side: 'none' | 'long' | 'short'
  ): PublicKey;

  getUserPosition(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    side: 'none' | 'long' | 'short'
  ): Promise<any>;

  getUserPositions(wallet: PublicKey): Promise<Position[]>;

  getPoolTokenPositions(poolName: string, tokenMint: PublicKey): Promise<Position[]>;

  getAllPositions(): Promise<Position[]>;

  getAccountDiscriminator(name: string): Buffer;

  getTime(): number;

  getOraclePrice(poolName: string, tokenMint: PublicKey, ema: boolean): Promise<BN>;

  getAddLiquidityAmountAndFee(
    poolName: string,
    tokenMint: PublicKey,
    amount: BN
  ): Promise<AmountAndFee>;

  getRemoveLiquidityAmountAndFee(
    poolName: string,
    tokenMint: PublicKey,
    lpAmount: BN,
    custodyFeedId: string
  ): Promise<AmountAndFee>;

  getEntryPriceAndFee(
    poolName: string,
    tokenMint: PublicKey,
    collateralMint: PublicKey,
    collateral: BN,
    size: BN,
    side: 'none' | 'long' | 'short'
  ): Promise<NewPositionPricesAndFee>;

  getExitPriceAndFee(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    collateralMint: PublicKey,
    side: 'none' | 'long' | 'short'
  ): Promise<PriceAndFee>;

  getLiquidationPrice(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    collateralMint: PublicKey,
    side: 'none' | 'long' | 'short',
    addCollateral: BN,
    removeCollateral: BN
  ): Promise<BN>;

  getLiquidationState(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    collateralMint: PublicKey,
    side: 'none' | 'long' | 'short'
  ): Promise<number>;

  getPnl(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    collateralMint: PublicKey,
    side: 'none' | 'long' | 'short'
  ): Promise<ProfitAndLoss>;

  getSwapAmountAndFees(
    poolName: string,
    tokenMintIn: PublicKey,
    tokenMintOut: PublicKey,
    amountIn: BN
  ): Promise<SwapAmountAndFees>;

  getAum(poolName: string): Promise<BN>;

  fetchAumWithRetry(poolName: string): Promise<BN>;

  log(...messages: string[]): void;

  prettyPrint(v: any): void;
}

// export interface IPerpetualsInstructions {
//   init(admins: string[]): Promise<TransactionInstruction>;
//   setAdminSigners(admins: string[], minSignatures: number): Promise<TransactionInstruction>;
//   addPool(name: string): Promise<TransactionInstruction>;
//   removePool(name: string): Promise<TransactionInstruction>;
//   addCustodyInit(poolName: string, tokenMint: string): Promise<TransactionInstruction>;
//   addCustody(
//     poolName: string,
//     tokenMint: string,
//     isStable: boolean,
//     isVirtual: boolean,
//     oracleConfig: {
//       oracleAccount: string;
//       oracleType: 'none' | 'custom' | 'pyth';
//       oracleAuthority: string;
//       maxPriceError: number;
//       maxPriceAgeSec: number;
//       feedId: number[];
//     },
//     pricingConfig: {
//       useEma: boolean;
//       useUnrealizedPnlInAum: boolean;
//       tradeSpreadLong: number;
//       tradeSpreadShort: number;
//       swapSpread: number;
//       minInitialLeverage: number;
//       maxInitialLeverage: number;
//       maxLeverage: number;
//       maxPayoffMult: number;
//       maxUtilization: number;
//       maxPositionLockedUsd: number;
//       maxTotalLockedUsd: number;
//     },
//     permissions: Permissions,
//     feesConfig: {
//       mode: 'fixed' | 'linear' | 'optimal';
//       ratioMult: number;
//       utilizationMult: number;
//       swapIn: number;
//       swapOut: number;
//       stableSwapIn: number;
//       stableSwapOut: number;
//       addLiquidity: number;
//       removeLiquidity: number;
//       openPosition: number;
//       closePosition: number;
//       liquidation: number;
//       protocolShare: number;
//       feeMax: number;
//       feeOptimal: number;
//     },
//     borrowRateConfig: {
//       baseRate: number;
//       slope1: number;
//       slope2: number;
//       optimalUtilization: number;
//     },
//     ratiosConfig: {
//       target: number;
//       min: number;
//       max: number;
//     }[]
//   ): Promise<TransactionInstruction>;
//   removeCustody(
//     ratiosConfig: {
//       target: number;
//       min: number;
//       max: number;
//     }[]
//   ): Promise<TransactionInstruction>;
//   upgradeCustody(poolName: string, tokenMint: string): Promise<TransactionInstruction>;
//   setCustomOraclePrice(priceConfig: {
//     price: number;
//     expo: number;
//     conf: number;
//     ema: number;
//     publishTime: number;
//   }): Promise<TransactionInstruction>;
//   addLiquidity(
//     poolName: string,
//     tokenMint: string,
//     amountIn: number,
//     minLpAmountOut: number,
//     feedId: string
//   ): Promise<TransactionInstruction>;
//   liquidate(
//     poolName: string,
//     tokenMint: string,
//     collateralMint: string,
//     side: 'none' | 'long' | 'short',
//     receivingAccount: string,
//     rewardsReceivingAccount: string,
//     feedId: string
//   ): Promise<TransactionInstruction>;
//   openPosition(
//     poolName: string,
//     tokenMint: string,
//     collateralMint: string,
//     side: 'none' | 'long' | 'short',
//     price: number
//   ): Promise<TransactionInstruction>;
//   closePosition(
//     poolName: string,
//     tokenMint: string,
//     collateralMint: string,
//     side: 'none' | 'long' | 'short'
//   ): Promise<TransactionInstruction>;
//   swap(
//     poolName: string,
//     tokenMintIn: string,
//     tokenMintOut: string,
//     amountIn: number
//   ): Promise<TransactionInstruction>;
//   removeLiquidity(
//     poolName: string,
//     tokenMint: string,
//     lpAmount: number,
//     minAmountOut: number,
//     feedId: string
//   ): Promise<TransactionInstruction>;
//   setAdminSigners(admins: string[], minSignatures: number): Promise<TransactionInstruction>;
// }

export interface IOracleClient {
  connection: Connection;
  wallet: IWallet;
  getRandomShardId: () => number;
  environment: Environment;
  pythSolanaReceiver: PythSolanaReceiver;
}

export type AssetType =
  | 'Commodities'
  | 'Crypto'
  | 'Crypto Index'
  | 'Crypto NAV'
  | 'Crypto Redemption Rate'
  | 'Equity'
  | 'FX'
  | 'Metal'
  | 'Rates';

export type Asset = {
  type: AssetType;
  name: string;
  symbol: string;
  mint: string;
  isStable: boolean;
  feedId: string;
  imageUrl?: string;
  decimals?: number;
};
