import { IPerpetualsClient } from './types';
import {
  AddCustodyParams,
  AddLiquidityParams,
  Permissions,
  AddPoolParams,
  BorrowRateParams,
  Fees,
  InitParams,
  OracleParams,
  PricingParams,
  RemovePoolParams,
  SetAdminSignersParams,
  TokenRatios,
  RemoveCustodyParams,
  SetCustomOraclePriceParams,
  LiquidateParams,
  AddCustodyInitParams,
  OpenPositionParams,
} from './idl/types/params';
import { toBN } from './utils/bn';
import { AccountMeta, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { OracleClient } from './oracle/oracle-client';
import { stringToFeesMode, stringToOracleType, stringToSide } from './utils/helpers';

export class PerpetualsInstructions {
  constructor(
    private readonly client: IPerpetualsClient,
    private readonly oracleClient: OracleClient
  ) {}

  async init(admins: string[]): Promise<TransactionInstruction> {
    const program = this.client.program;

    const perpetualsProgramData = PublicKey.findProgramAddressSync(
      [program.programId.toBuffer()],
      new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
    )[0];

    const adminMetas: AccountMeta[] = [];
    for (const admin of admins) {
      adminMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: new PublicKey(admin),
      });
    }

    const initParams: InitParams = {
      minSignatures: 1,
      allowSwap: false,
      allowAddLiquidity: true,
      allowRemoveLiquidity: true,
      allowOpenPosition: true,
      allowClosePosition: true,
      allowPnlWithdrawal: true,
      allowCollateralWithdrawal: true,
      allowSizeChange: true,
    };

    const initInstruction = await program.methods
      .init(initParams)
      .accounts({
        upgradeAuthority: this.client.wallet.publicKey,
        perpetualsProgramData: perpetualsProgramData,
      })
      .remainingAccounts(adminMetas)
      .instruction();

    return initInstruction;
  }

  async setAdminSigners(admins: string[], minSignatures: number): Promise<TransactionInstruction> {
    const program = this.client.program;

    const setAdminSignersParams: SetAdminSignersParams = {
      minSignatures,
    };

    const adminMetas: AccountMeta[] = [];
    for (const admin of admins) {
      adminMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: new PublicKey(admin),
      });
    }

    const setAdminSignersInstruction = await program.methods
      .setAdminSigners(setAdminSignersParams)
      .accounts({
        admin: this.client.wallet.publicKey,
      })
      .remainingAccounts(adminMetas)
      .signers([this.client.wallet.payer]) // TODO: check if this is correct
      .instruction();

    return setAdminSignersInstruction;
  }

  async addPool(name: string): Promise<TransactionInstruction> {
    const program = this.client.program;

    const addPoolParams: AddPoolParams = {
      name,
    };

    const addPoolInstruction = await program.methods
      .addPool(addPoolParams)
      .accounts({ admin: this.client.wallet.publicKey })
      .signers([this.client.wallet.payer]) // TODO: check if this is correct
      .instruction();

    return addPoolInstruction;
  }

  async removePool(name: string): Promise<TransactionInstruction> {
    const program = this.client.program;

    const removePoolParams: RemovePoolParams = {
      name,
    };

    const removePoolInstruction = await program.methods
      .removePool(removePoolParams)
      .accounts({
        admin: this.client.wallet.publicKey,
      })
      .signers([this.client.wallet.payer]) // TODO: check if this is correct
      .instruction();

    return removePoolInstruction;
  }
  private async addCustodyInit(
    poolName: string,
    tokenMint: string
  ): Promise<TransactionInstruction> {
    const program = this.client.program;

    const addCustodyInitParams: AddCustodyInitParams = {};

    const addCustodyInitInstruction = await program.methods
      .addCustodyInit(addCustodyInitParams)
      .accounts({
        admin: this.client.wallet.publicKey,
        pool: this.client.getPoolKey(poolName),
        custodyTokenMint: new PublicKey(tokenMint),
      })
      .instruction();

    return addCustodyInitInstruction;
  }

  async addCustody(
    poolName: string,
    tokenMint: string,
    isStable: boolean,
    isVirtual: boolean,
    oracleConfig: {
      oracleAccount: string;
      oracleType: 'none' | 'custom' | 'pyth';
      oracleAuthority: string;
      maxPriceError: number;
      maxPriceAgeSec: number;
      feedId: number[];
    },
    pricingConfig: {
      useEma: boolean;
      useUnrealizedPnlInAum: boolean;
      tradeSpreadLong: number;
      tradeSpreadShort: number;
      swapSpread: number;
      minInitialLeverage: number;
      maxInitialLeverage: number;
      maxLeverage: number;
      maxPayoffMult: number;
      maxUtilization: number;
      maxPositionLockedUsd: number;
      maxTotalLockedUsd: number;
    },
    permissions: Permissions,
    feesConfig: {
      mode: 'fixed' | 'linear' | 'optimal';
      ratioMult: number;
      utilizationMult: number;
      swapIn: number;
      swapOut: number;
      stableSwapIn: number;
      stableSwapOut: number;
      addLiquidity: number;
      removeLiquidity: number;
      openPosition: number;
      closePosition: number;
      liquidation: number;
      protocolShare: number;
      feeMax: number;
      feeOptimal: number;
    },
    borrowRateConfig: {
      baseRate: number;
      slope1: number;
      slope2: number;
      optimalUtilization: number;
    },
    ratiosConfig: {
      target: number;
      min: number;
      max: number;
    }[]
  ): Promise<TransactionInstruction> {
    const program = this.client.program;

    const oracleType = stringToOracleType(oracleConfig.oracleType);
    const feesMode = stringToFeesMode(feesConfig.mode);

    const oracle: OracleParams = {
      oracleAccount: new PublicKey(oracleConfig.oracleAccount),
      oracleType: oracleType,
      oracleAuthority: new PublicKey(oracleConfig.oracleAuthority),
      maxPriceError: toBN(oracleConfig.maxPriceError),
      maxPriceAgeSec: oracleConfig.maxPriceAgeSec,
      feedId: oracleConfig.feedId,
    };

    const fees: Fees = {
      mode: feesMode,
      ratioMult: toBN(feesConfig.ratioMult),
      utilizationMult: toBN(feesConfig.utilizationMult),
      swapIn: toBN(feesConfig.swapIn),
      swapOut: toBN(feesConfig.swapOut),
      stableSwapIn: toBN(feesConfig.stableSwapIn),
      stableSwapOut: toBN(feesConfig.stableSwapOut),
      addLiquidity: toBN(feesConfig.addLiquidity),
      removeLiquidity: toBN(feesConfig.removeLiquidity),
      openPosition: toBN(feesConfig.openPosition),
      closePosition: toBN(feesConfig.closePosition),
      liquidation: toBN(feesConfig.liquidation),
      protocolShare: toBN(feesConfig.protocolShare),
      feeMax: toBN(feesConfig.feeMax),
      feeOptimal: toBN(feesConfig.feeOptimal),
    };

    const pricing: PricingParams = {
      useEma: pricingConfig.useEma,
      useUnrealizedPnlInAum: pricingConfig.useUnrealizedPnlInAum,
      tradeSpreadLong: toBN(pricingConfig.tradeSpreadLong),
      tradeSpreadShort: toBN(pricingConfig.tradeSpreadShort),
      swapSpread: toBN(pricingConfig.swapSpread),
      minInitialLeverage: toBN(pricingConfig.minInitialLeverage),
      maxInitialLeverage: toBN(pricingConfig.maxInitialLeverage),
      maxLeverage: toBN(pricingConfig.maxLeverage),
      maxPayoffMult: toBN(pricingConfig.maxPayoffMult),
      maxUtilization: toBN(pricingConfig.maxUtilization),
      maxPositionLockedUsd: toBN(pricingConfig.maxPositionLockedUsd),
      maxTotalLockedUsd: toBN(pricingConfig.maxTotalLockedUsd),
    };

    const borrowRate: BorrowRateParams = {
      baseRate: toBN(borrowRateConfig.baseRate),
      slope1: toBN(borrowRateConfig.slope1),
      slope2: toBN(borrowRateConfig.slope2),
      optimalUtilization: toBN(borrowRateConfig.optimalUtilization),
    };

    const ratios: TokenRatios[] = ratiosConfig.map((ratio) => {
      return {
        target: toBN(ratio.target),
        min: toBN(ratio.min),
        max: toBN(ratio.max),
      };
    });

    const addCustodyInitInstruction = await this.addCustodyInit(poolName, tokenMint);

    const addCustodyParams: AddCustodyParams = {
      isStable,
      isVirtual,
      oracle,
      pricing,
      permissions,
      fees,
      borrowRate,
      ratios,
    };

    const addCustodyInstruction = await program.methods
      .addCustody(addCustodyParams)
      .accounts({
        admin: this.client.wallet.publicKey,
        pool: this.client.getPoolKey(poolName),
        custodyTokenMint: new PublicKey(tokenMint),
      })
      .preInstructions([addCustodyInitInstruction])
      .signers([this.client.wallet.payer]) // TODO: check if this is correct
      .instruction();

    return addCustodyInstruction;
  }

  // TODO: add poolName and tokenMint something is off here check rust program
  async removeCustody(
    ratiosConfig: {
      target: number;
      min: number;
      max: number;
    }[]
  ): Promise<TransactionInstruction> {
    const program = this.client.program;

    const ratios: TokenRatios[] = ratiosConfig.map((ratio) => {
      return {
        target: toBN(ratio.target),
        min: toBN(ratio.min),
        max: toBN(ratio.max),
      };
    });

    const removeCustodyParams: RemoveCustodyParams = {
      ratios,
    };

    const removeCustodyInstruction = await program.methods
      .removeCustody(removeCustodyParams)
      .accounts({
        admin: this.client.wallet.publicKey,
      })
      .signers([this.client.wallet.payer]) // TODO: check if this is correct
      .instruction();

    return removeCustodyInstruction;
  }

  async upgradeCustody(poolName: string, tokenMint: string): Promise<TransactionInstruction> {
    const program = this.client.program;

    const upgradeCustodyInstruction = await program.methods
      .upgradeCustody({})
      .accounts({
        admin: this.client.wallet.publicKey,
        custody: this.client.getCustodyKey(poolName, new PublicKey(tokenMint)),
      })
      .signers([this.client.wallet.payer]) // TODO: check if this is correct
      .instruction();

    return upgradeCustodyInstruction;
  }

  // TODO: add poolName and tokenMint something is off here check rust program
  async setCustomOraclePrice(priceConfig: {
    price: number;
    expo: number;
    conf: number;
    ema: number;
    publishTime: number;
  }): Promise<TransactionInstruction> {
    const program = this.client.program;

    const setCustomOraclePriceParams: SetCustomOraclePriceParams = {
      price: toBN(priceConfig.price),
      expo: priceConfig.expo,
      conf: toBN(priceConfig.conf),
      ema: toBN(priceConfig.ema),
      publishTime: toBN(priceConfig.publishTime),
    };

    const setCustomOraclePriceInstruction = await program.methods
      .setCustomOraclePrice(setCustomOraclePriceParams)
      .accounts({
        admin: this.client.wallet.publicKey,
      })
      .signers([this.client.wallet.payer]) // TODO: check if this is correct
      .instruction();

    return setCustomOraclePriceInstruction;
  }

  async addLiquidity(
    poolName: string,
    tokenMint: string,
    amountIn: number,
    minLpAmountOut: number,
    feedId: string
  ): Promise<TransactionInstruction> {
    const program = this.client.program;

    const feedIdAccount = this.oracleClient.fetchFeedAccount(feedId);

    const addLiquidityParams: AddLiquidityParams = {
      amountIn: toBN(amountIn),
      minLpAmountOut: toBN(minLpAmountOut),
    };

    const lpTokenMint = this.client.getPoolLpTokenKey(poolName);

    const addLiquidityInstruction = await program.methods
      .addLiquidity(addLiquidityParams)
      .accounts({
        fundingAccount: await getAssociatedTokenAddress(
          new PublicKey(tokenMint),
          this.client.wallet.publicKey
        ),
        lpTokenAccount: await getAssociatedTokenAddress(lpTokenMint, this.client.wallet.publicKey),
        custodyOracleAccount: feedIdAccount,
        custodyTwapAccount: feedIdAccount,
      })
      .instruction();

    return addLiquidityInstruction;
  }

  async liquidate(
    poolName: string,
    tokenMint: string,
    collateralMint: string,
    side: 'none' | 'long' | 'short',
    receivingAccount: string,
    rewardsReceivingAccount: string,
    feedId: string
  ): Promise<TransactionInstruction> {
    const program = this.client.program;

    const feedIdBytes = this.oracleClient.hexToBytes32(feedId);
    const feedIdAccount = this.oracleClient.fetchFeedAccount(feedId);

    const liquidateParams: LiquidateParams = {
      feedId: feedIdBytes as number[],
    };

    const liquidateInstruction = await program.methods
      .liquidate(liquidateParams)
      .accounts({
        signer: this.client.wallet.publicKey,
        receivingAccount: new PublicKey(receivingAccount),
        rewardsReceivingAccount: new PublicKey(rewardsReceivingAccount),
        position: this.client.getPositionKey(
          this.client.wallet.publicKey,
          poolName,
          new PublicKey(tokenMint),
          side
        ),
        collateralCustody: this.client.getCustodyKey(poolName, new PublicKey(collateralMint)),
        collateralCustodyOracleAccount: feedIdAccount,
        collateralCustodyTwapAccount: feedIdAccount,
        custody: this.client.getCustodyKey(poolName, new PublicKey(tokenMint)),
        custodyOracleAccount: feedIdAccount,
        custodyTwapAccount: feedIdAccount,
      })
      .instruction();

    return liquidateInstruction;
  }

  async openPosition(
    poolName: string,
    tokenMint: string,
    collateralMint: string,
    side: 'none' | 'long' | 'short',
    price: number,
    collateral: number,
    size: number,
    custodyFeedId: string,
    collateralFeedId: string,
    takeProfitPrice: number | null,
    stopLossPrice: number | null
  ): Promise<TransactionInstruction> {
    const program = this.client.program;

    const custodyFeedIdAccount = this.oracleClient.fetchFeedAccount(custodyFeedId);
    const collateralFeedIdAccount = this.oracleClient.fetchFeedAccount(collateralFeedId);

    const openPositionParams: OpenPositionParams = {
      price: toBN(price),
      collateral: toBN(collateral),
      size: toBN(size),
      side: stringToSide(side),
      takeProfitPrice: takeProfitPrice ? toBN(takeProfitPrice) : null,
      stopLossPrice: stopLossPrice ? toBN(stopLossPrice) : null,
    };

    const openPositionInstruction = await program.methods
      .openPosition(openPositionParams)
      .accounts({
        fundingAccount: await getAssociatedTokenAddress(
          new PublicKey(collateralMint),
          this.client.wallet.publicKey
        ),
        position: this.client.getPositionKey(
          this.client.wallet.publicKey,
          poolName,
          new PublicKey(tokenMint),
          side
        ),
        custodyOracleAccount: custodyFeedIdAccount,
        custodyTwapAccount: custodyFeedIdAccount,

        collateralCustodyOracleAccount: collateralFeedIdAccount,
        collateralCustodyTwapAccount: collateralFeedIdAccount,
      })
      .instruction();

    return openPositionInstruction;
  }
}
