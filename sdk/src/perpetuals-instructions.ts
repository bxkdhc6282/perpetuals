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
  OpenPositionParams,
  SetCustodyConfigParams,
} from './idl/types/params';
import { toBN } from './utils/bn';
import {
  AccountMeta,
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMint,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { OracleClient } from './oracle/oracle-client';
import {
  stringToFeesMode,
  stringToOracleType,
  stringToSide,
  validateBorrowRateParams,
  validateFees,
  validatePricingParams,
} from './utils/helpers';
import { USD_DECIMALS, VT_DECIMALS } from './math/constants';

export class PerpetualsInstructions {
  constructor(
    private readonly client: IPerpetualsClient,
    private readonly oracleClient: OracleClient
  ) {}

  async init(admins: string[]): Promise<Transaction> {
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

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    const initInstruction = await program.methods
      .init(initParams)
      .accounts({
        upgradeAuthority: this.client.wallet.publicKey,
        perpetualsProgramData: perpetualsProgramData,
      })
      .remainingAccounts(adminMetas)
      .preInstructions([computeBudget])
      .transaction();
    // .instruction();

    return initInstruction;
  }

  async setAdminSigners(admins: string[], minSignatures: number): Promise<Transaction> {
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

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    const setAdminSignersInstruction = await program.methods
      .setAdminSigners(setAdminSignersParams)
      .accounts({
        admin: this.client.wallet.publicKey,
      })
      .remainingAccounts(adminMetas)
      .signers([this.client.wallet.payer]) // TODO: check if this is correct
      .preInstructions([computeBudget])
      .transaction();

    return setAdminSignersInstruction;
  }

  async addPool(name: string): Promise<Transaction> {
    const program = this.client.program;

    const addPoolParams: AddPoolParams = {
      name,
    };

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    const addPoolInstruction = await program.methods
      .addPool(addPoolParams)
      .accounts({ admin: this.client.wallet.publicKey })
      .signers([this.client.wallet.payer]) // TODO: check if this is correct
      .preInstructions([computeBudget])
      .transaction();

    return addPoolInstruction;
  }

  async removePool(name: string): Promise<Transaction> {
    const program = this.client.program;

    const removePoolParams: RemovePoolParams = {
      name,
    };

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    const removePoolInstruction = await program.methods
      .removePool(removePoolParams)
      .accounts({
        pool: this.client.getPoolKey(name),
        admin: this.client.wallet.publicKey,
      })
      .signers([this.client.wallet.payer]) // TODO: check if this is correct
      .preInstructions([computeBudget])
      .transaction();

    return removePoolInstruction;
  }

  private async initCustodyTokenAccount(
    poolName: string,
    custodyTokenMint: PublicKey
  ): Promise<TransactionInstruction> {
    const program = this.client.program;

    const initCustodyTokenAccountInstruction = await program.methods
      .addCustodyTokenAccount()
      .accounts({
        admin: this.client.wallet.publicKey,
        pool: this.client.getPoolKey(poolName),
        custodyTokenMint,
      })
      .instruction();

    return initCustodyTokenAccountInstruction;
  }

  private async createVirtualTokenMint(): Promise<{
    createMintAccountIx: TransactionInstruction;
    initMintIx: TransactionInstruction;
    mint: Keypair;
  }> {
    const connection = this.client.connection;

    const payer = this.client.wallet.publicKey;
    const mint = Keypair.generate();
    const mintAuthority = payer;
    const freezeAuthority = mintAuthority;
    const decimals = VT_DECIMALS;

    const lamportsForMint = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

    const createMintAccountIx = SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports: lamportsForMint,
      programId: TOKEN_PROGRAM_ID,
    });

    const initMintIx = createInitializeMintInstruction(
      mint.publicKey,
      decimals,
      mintAuthority,
      freezeAuthority,
      TOKEN_PROGRAM_ID
    );

    return { createMintAccountIx, initMintIx, mint };
  }

  async addCustody(
    poolName: string,
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
    }[],
    tokenMint?: string
  ): Promise<{
    transaction: Transaction;
    mint?: Keypair;
  }> {
    if (
      !validateFees({
        swap_in: feesConfig.swapIn,
        swap_out: feesConfig.swapOut,
        stable_swap_in: feesConfig.stableSwapIn,
        stable_swap_out: feesConfig.stableSwapOut,
        add_liquidity: feesConfig.addLiquidity,
        remove_liquidity: feesConfig.removeLiquidity,
        open_position: feesConfig.openPosition,
        close_position: feesConfig.closePosition,
        liquidation: feesConfig.liquidation,
        protocol_share: feesConfig.protocolShare,
        fee_max: feesConfig.feeMax,
        fee_optimal: feesConfig.feeOptimal,
      })
    ) {
      throw new Error('Invalid fees config');
    }

    if (
      !validatePricingParams({
        min_initial_leverage: pricingConfig.minInitialLeverage,
        max_initial_leverage: pricingConfig.maxInitialLeverage,
        max_leverage: pricingConfig.maxLeverage,
        trade_spread_long: pricingConfig.tradeSpreadLong,
        trade_spread_short: pricingConfig.tradeSpreadShort,
        swap_spread: pricingConfig.swapSpread,
        max_utilization: pricingConfig.maxUtilization,
        max_position_locked_usd: pricingConfig.maxPositionLockedUsd,
        max_total_locked_usd: pricingConfig.maxTotalLockedUsd,
      })
    ) {
      throw new Error('Invalid pricing config');
    }

    if (
      !validateBorrowRateParams({
        optimal_utilization: borrowRateConfig.optimalUtilization,
      })
    ) {
      throw new Error('Invalid borrow rate config');
    }

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

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    let transaction: Transaction;
    let mint: Keypair | undefined;

    if (isVirtual) {
      const {
        createMintAccountIx,
        initMintIx,
        mint: virtualMint,
      } = await this.createVirtualTokenMint();
      mint = virtualMint;

      const initCustodyTokenAccountIx = await this.initCustodyTokenAccount(
        poolName,
        virtualMint.publicKey
      );

      const preInstructions = [computeBudget, createMintAccountIx, initMintIx];
      if (initCustodyTokenAccountIx) {
        preInstructions.push(initCustodyTokenAccountIx);
      }

      const addCustodyInstruction = await program.methods
        .addCustody(addCustodyParams)
        .accounts({
          admin: this.client.wallet.publicKey,
          pool: this.client.getPoolKey(poolName),
          custodyTokenMint: virtualMint.publicKey,
          custodyTokenAccount: this.client.getCustodyTokenAccountKey(
            poolName,
            virtualMint.publicKey
          ),
        })
        // .signers([this.client.wallet.payer, mint]) // TODO: check if this is correct
        .preInstructions(preInstructions)
        .transaction();

      mint = virtualMint;
      transaction = addCustodyInstruction;
    } else {
      if (!tokenMint) {
        throw new Error('Token mint address is required');
      }

      const initCustodyTokenAccountIx = await this.initCustodyTokenAccount(
        poolName,
        new PublicKey(tokenMint)
      );

      const preInstructions = [computeBudget];
      if (initCustodyTokenAccountIx) {
        preInstructions.push(initCustodyTokenAccountIx);
      }

      const addCustodyInstruction = await program.methods
        .addCustody(addCustodyParams)
        .accounts({
          admin: this.client.wallet.publicKey,
          pool: this.client.getPoolKey(poolName),
          custodyTokenMint: new PublicKey(tokenMint),
          custodyTokenAccount: this.client.getCustodyTokenAccountKey(
            poolName,
            new PublicKey(tokenMint)
          ),
        })
        // .signers([this.client.wallet.payer]) // TODO: check if this is correct
        .preInstructions(preInstructions)
        .transaction();

      transaction = addCustodyInstruction;
    }

    return { transaction, mint };
  }

  // TODO: add poolName and tokenMint something is off here check rust program
  async removeCustody(
    ratiosConfig: {
      target: number;
      min: number;
      max: number;
    }[],
    poolName: string,
    tokenMint: string
  ): Promise<Transaction> {
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

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    const removeCustodyInstruction = await program.methods
      .removeCustody(removeCustodyParams)
      .accounts({
        custodyTokenAccount: this.client.getCustodyTokenAccountKey(
          poolName,
          new PublicKey(tokenMint)
        ),
        custody: this.client.getCustodyKey(poolName, new PublicKey(tokenMint)),
        pool: this.client.getPoolKey(poolName),
        admin: this.client.wallet.publicKey,
      })
      .signers([this.client.wallet.payer]) // TODO: check if this is correct
      .preInstructions([computeBudget])
      .transaction();

    return removeCustodyInstruction;
  }

  async upgradeCustody(poolName: string, tokenMint: string): Promise<Transaction> {
    const program = this.client.program;

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    const upgradeCustodyInstruction = await program.methods
      .upgradeCustody({})
      .accounts({
        pool: this.client.getPoolKey(poolName),
        admin: this.client.wallet.publicKey,
        custody: this.client.getCustodyKey(poolName, new PublicKey(tokenMint)),
      })
      .signers([this.client.wallet.payer]) // TODO: check if this is correct
      .preInstructions([computeBudget])
      .transaction();

    return upgradeCustodyInstruction;
  }

  // TODO: add poolName and tokenMint something is off here check rust program
  async setCustomOraclePrice(
    priceConfig: {
      price: number;
      expo: number;
      conf: number;
      ema: number;
      publishTime: number;
    },
    poolName: string,
    tokenMint: string
  ): Promise<Transaction> {
    const program = this.client.program;

    const setCustomOraclePriceParams: SetCustomOraclePriceParams = {
      price: toBN(priceConfig.price),
      expo: priceConfig.expo,
      conf: toBN(priceConfig.conf),
      ema: toBN(priceConfig.ema),
      publishTime: toBN(priceConfig.publishTime),
    };

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    const setCustomOraclePriceInstruction = await program.methods
      .setCustomOraclePrice(setCustomOraclePriceParams)
      .accounts({
        custody: this.client.getCustodyKey(poolName, new PublicKey(tokenMint)),
        pool: this.client.getPoolKey(poolName),
        admin: this.client.wallet.publicKey,
      })
      .signers([this.client.wallet.payer]) // TODO: check if this is correct
      .preInstructions([computeBudget])
      .transaction();

    return setCustomOraclePriceInstruction;
  }

  async addLiquidity(
    poolName: string,
    tokenMint: string,
    amountIn: number,
    minLpAmountOut: number,
    feedId: string
  ): Promise<Transaction> {
    if (minLpAmountOut > 1) {
      throw new Error('minLpAmountOut must be less than 1');
    }

    const program = this.client.program;

    const feedIdAccount = this.oracleClient.fetchFeedAccount(feedId);

    const tokenAmountRaw = toBN(amountIn).mul(toBN(10).pow(toBN(6)));

    // Get add liquidity amount and fee
    const amountAndFee = await this.client.getAddLiquidityAmountAndFee(
      poolName,
      new PublicKey(tokenMint),
      tokenAmountRaw
    );

    const defaultMinLpAmount = amountAndFee.amount.mul(toBN(minLpAmountOut * 100)).div(toBN(100));

    const addLiquidityParams: AddLiquidityParams = {
      amountIn: amountAndFee.amount,
      minLpAmountOut: defaultMinLpAmount,
    };

    const lpTokenMint = this.client.getPoolLpTokenKey(poolName);

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    // const [transferAuthority] = PublicKey.findProgramAddressSync(
    //   [Buffer.from('transfer_authority')],
    //   program.programId
    // );

    const preInstructions = [computeBudget];
    const lpTokenAccountIx = await this.createInitAccountIfNeededInstruction(
      lpTokenMint,
      this.client.wallet.publicKey,
      this.client.wallet.publicKey
    );
    if (lpTokenAccountIx) {
      preInstructions.push(lpTokenAccountIx);
    }

    const addLiquidityInstruction = await program.methods
      .addLiquidity(addLiquidityParams)
      .accounts({
        custody: this.client.getCustodyKey(poolName, new PublicKey(tokenMint)),
        pool: this.client.getPoolKey(poolName),
        fundingAccount: await getAssociatedTokenAddress(
          new PublicKey(tokenMint),
          this.client.wallet.publicKey
        ),
        lpTokenAccount: await getAssociatedTokenAddress(lpTokenMint, this.client.wallet.publicKey),
        custodyOracleAccount: feedIdAccount,
        custodyTwapAccount: null,
        custodyTokenAccount: this.client.getCustodyTokenAccountKey(
          poolName,
          new PublicKey(tokenMint)
        ),
      })
      .remainingAccounts(await this.client.getCustodyMetas(poolName))
      .preInstructions(preInstructions)
      .transaction();

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
  ): Promise<Transaction> {
    const program = this.client.program;

    const feedIdBytes = this.oracleClient.hexToBytes32(feedId);
    const feedIdAccount = this.oracleClient.fetchFeedAccount(feedId);

    const liquidateParams: LiquidateParams = {
      feedId: feedIdBytes as number[],
    };

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    const liquidateInstruction = await program.methods
      .liquidate(liquidateParams)
      .accounts({
        pool: this.client.getPoolKey(poolName),
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
        collateralCustodyTokenAccount: this.client.getCustodyTokenAccountKey(
          poolName,
          new PublicKey(collateralMint)
        ),
      })
      .preInstructions([computeBudget])
      .transaction();

    return liquidateInstruction;
  }

  private async createInitAccountIfNeededInstruction(
    mint: PublicKey,
    owner: PublicKey,
    payer: PublicKey
  ): Promise<TransactionInstruction | null> {
    try {
      // Get the associated token account address
      const associatedTokenAccount = await getAssociatedTokenAddress(mint, owner);

      // Check if the account exists and is initialized
      const accountInfo = await this.client.connection.getAccountInfo(associatedTokenAccount);

      // If account doesn't exist or is not initialized, create it
      if (!accountInfo) {
        console.log(`Creating associated token account for mint: ${mint.toString()}`);
        return createAssociatedTokenAccountInstruction(
          payer, // payer
          associatedTokenAccount, // associated token account
          owner, // owner
          mint // mint
        );
      }

      // Account already exists and is initialized
      console.log(`Associated token account already exists: ${associatedTokenAccount.toString()}`);
      return null;
    } catch (error) {
      console.error('Error checking/creating associated token account:', error);
      throw error;
    }
  }

  async openPosition(
    poolName: string,
    tokenMint: string,
    collateralMint: string,
    side: 'none' | 'long' | 'short',
    // price: number,
    collateral: number,
    size: number,
    custodyFeedId: string,
    collateralFeedId: string,
    takeProfitPrice: number | null,
    stopLossPrice: number | null
  ): Promise<Transaction> {
    const program = this.client.program;

    const custodyFeedIdAccount = this.oracleClient.fetchFeedAccount(custodyFeedId);
    const collateralFeedIdAccount = this.oracleClient.fetchFeedAccount(collateralFeedId);

    const actualCollateral = collateral * 10 ** USD_DECIMALS;
    const actualSize = size * 10 ** VT_DECIMALS;

    const oraclePrice = await this.client.getEntryPriceAndFee(
      poolName,
      new PublicKey(tokenMint),
      new PublicKey(collateralMint),
      toBN(actualCollateral),
      toBN(actualSize),
      side,
      custodyFeedId,
      collateralFeedId
    );

    const slippageBuffer = 1.01; // 1% buffer
    const priceWithBuffer = oraclePrice.entryPrice
      .mul(toBN(slippageBuffer * 1000000))
      .div(toBN(1000000));

    const openPositionParams: OpenPositionParams = {
      price: priceWithBuffer,
      collateral: toBN(actualCollateral),
      size: toBN(actualSize),
      side: stringToSide(side),
      takeProfitPrice: takeProfitPrice ? toBN(takeProfitPrice) : null,
      stopLossPrice: stopLossPrice ? toBN(stopLossPrice) : null,
    };

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    const openPositionInstruction = await program.methods
      .openPosition(openPositionParams)
      .accounts({
        custody: this.client.getCustodyKey(poolName, new PublicKey(tokenMint)),
        collateralCustody: this.client.getCustodyKey(poolName, new PublicKey(collateralMint)),
        pool: this.client.getPoolKey(poolName),
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
        custodyTwapAccount: null,

        collateralCustodyOracleAccount: collateralFeedIdAccount,
        collateralCustodyTwapAccount: null,
        collateralCustodyTokenAccount: this.client.getCustodyTokenAccountKey(
          poolName,
          new PublicKey(collateralMint)
        ),
      })
      .preInstructions([computeBudget])
      .transaction();

    return openPositionInstruction;
  }

  async createUSDCMint(): Promise<PublicKey> {
    const connection = this.client.connection;

    const decimals = 6;

    const mint = await createMint(
      connection,
      this.client.wallet.payer,
      this.client.wallet.publicKey, // mint authority
      this.client.wallet.publicKey, // freeze authority (can be null)
      decimals
    );

    return mint;
  }

  async setCustodyConfig(
    poolName: string,
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
    }[],
    tokenMint: string
  ) {
    if (
      !validateFees({
        swap_in: feesConfig.swapIn,
        swap_out: feesConfig.swapOut,
        stable_swap_in: feesConfig.stableSwapIn,
        stable_swap_out: feesConfig.stableSwapOut,
        add_liquidity: feesConfig.addLiquidity,
        remove_liquidity: feesConfig.removeLiquidity,
        open_position: feesConfig.openPosition,
        close_position: feesConfig.closePosition,
        liquidation: feesConfig.liquidation,
        protocol_share: feesConfig.protocolShare,
        fee_max: feesConfig.feeMax,
        fee_optimal: feesConfig.feeOptimal,
      })
    ) {
      throw new Error('Invalid fees config');
    }

    if (
      !validatePricingParams({
        min_initial_leverage: pricingConfig.minInitialLeverage,
        max_initial_leverage: pricingConfig.maxInitialLeverage,
        max_leverage: pricingConfig.maxLeverage,
        trade_spread_long: pricingConfig.tradeSpreadLong,
        trade_spread_short: pricingConfig.tradeSpreadShort,
        swap_spread: pricingConfig.swapSpread,
        max_utilization: pricingConfig.maxUtilization,
        max_position_locked_usd: pricingConfig.maxPositionLockedUsd,
        max_total_locked_usd: pricingConfig.maxTotalLockedUsd,
      })
    ) {
      throw new Error('Invalid pricing config');
    }

    if (
      !validateBorrowRateParams({
        optimal_utilization: borrowRateConfig.optimalUtilization,
      })
    ) {
      throw new Error('Invalid borrow rate config');
    }

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

    const addCustodyParams: SetCustodyConfigParams = {
      isStable,
      isVirtual,
      oracle,
      pricing,
      permissions,
      fees,
      borrowRate,
      ratios,
    };

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({
      units: 1000000,
    });

    const setCustodyConfigInstruction = await program.methods
      .setCustodyConfig(addCustodyParams)
      .accounts({
        pool: this.client.getPoolKey(poolName),
        admin: this.client.wallet.publicKey,
        custody: this.client.getCustodyKey(poolName, new PublicKey(tokenMint)),
      })
      .preInstructions([computeBudget])
      .transaction();

    return setCustodyConfigInstruction;
  }

  // UTILS
}
