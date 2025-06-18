import { BN, Program, utils } from '@coral-xyz/anchor';
import { Perpetuals as PerpetualsIdl } from './idl/types/perpetuals';
import { AccountMeta, Connection, PublicKey } from '@solana/web3.js';
import { IDL } from './idl/idl';
import { Environment, IPerpetualsClient, IWallet } from './types';
import { createConnectionProxy } from './utils/create-connection-proxy';
import { DEFAULT_RPC_URLS } from './constants/default-rpc-urls';
import { Custody, Multisig, Position } from './idl/types/accounts';
import {
  AmountAndFee,
  NewPositionPricesAndFee,
  PriceAndFee,
  ProfitAndLoss,
  SwapAmountAndFees,
} from './idl/types/params';
import { OracleClient } from './oracle/oracle-client';
import bs58 from 'bs58';
import { sha256 } from 'js-sha256';
import { stringToSide } from './utils/helpers';

export class PerpetualsClient implements IPerpetualsClient {
  public program: Program<PerpetualsIdl>;
  public connection: Connection;

  wallet: IWallet;
  environment: Environment;

  oracleClient: OracleClient;

  constructor(wallet: IWallet, environment?: Environment) {
    this.environment = environment || 'testnet';
    this.connection = createConnectionProxy(DEFAULT_RPC_URLS[this.environment]);
    this.program = new Program<PerpetualsIdl>(IDL, {
      connection: this.connection,
    });
    this.wallet = wallet;
    this.oracleClient = new OracleClient(this.connection, this.wallet, this.environment);
  }
  getPerpetuals(): Promise<{
    permissions: any;
    pools: PublicKey[];
    transferAuthorityBump: number;
    perpetualsBump: number;
    inceptionTime: BN;
  }> {
    const perpetuals = this.findProgramAddress('perpetuals');
    return this.program.account.perpetuals.fetch(perpetuals.publicKey);
  }
  getWallet(): IWallet {
    return this.wallet;
  }
  getEnvironment(): Environment {
    return this.environment;
  }

  getPoolKey(name: string): PublicKey {
    return this.findProgramAddress('pool', name).publicKey;
  }
  getPool(name: string): Promise<{
    name: string;
    custodies: PublicKey[];
    ratios: any[];
    aumUsd: BN;
    bump: number;
    lpTokenBump: number;
    inceptionTime: BN;
  }> {
    const pool = this.getPoolKey(name);
    return this.program.account.pool.fetch(pool);
  }
  async getPools(): Promise<
    ({
      name: string;
      custodies: PublicKey[];
      ratios: any[];
      aumUsd: BN;
      bump: number;
      lpTokenBump: number;
      inceptionTime: BN;
    } | null)[]
  > {
    const perpetuals = await this.getPerpetuals();
    return this.program.account.pool.fetchMultiple(perpetuals.pools);
  }
  getPoolLpTokenKey(name: string): PublicKey {
    return this.findProgramAddress('lp_token_mint', [this.getPoolKey(name)]).publicKey;
  }
  getCustodyKey(poolName: string, tokenMint: PublicKey): PublicKey {
    return this.findProgramAddress('custody', [this.getPoolKey(poolName), tokenMint]).publicKey;
  }
  getCustodyTokenAccountKey(poolName: string, tokenMint: PublicKey): PublicKey {
    return this.findProgramAddress('custody_token_account', [this.getPoolKey(poolName), tokenMint])
      .publicKey;
  }
  async getCustody(poolName: string, tokenMint: PublicKey): Promise<Custody> {
    const custody = this.getCustodyKey(poolName, tokenMint);
    const res = await this.program.account.custody.fetch(custody);
    return res;
  }
  async getCustodyOracleAccountKey(poolName: string, tokenMint: PublicKey): Promise<PublicKey> {
    return (await this.getCustody(poolName, tokenMint)).oracle.oracleAccount;
  }
  getCustodyCustomOracleAccountKey(poolName: string, tokenMint: PublicKey): PublicKey {
    return this.findProgramAddress('oracle_account', [this.getPoolKey(poolName), tokenMint])
      .publicKey;
  }
  async getCustodies(poolName: string): Promise<(Custody | null)[]> {
    const pool = await this.getPool(poolName);
    const custodies = (await this.program.account.custody.fetchMultiple(
      pool.custodies
    )) as (Custody | null)[];

    if (custodies.some((custody) => !custody)) {
      throw new Error('Error loading custodies');
    }

    return custodies;
  }

  async getCustodyMetas(poolName: string): Promise<AccountMeta[]> {
    const pool = await this.getPool(poolName);
    const custodies = (await this.program.account.custody.fetchMultiple(
      pool.custodies
    )) as (Custody | null)[];

    if (custodies.some((custody) => !custody)) {
      throw new Error('Error loading custodies');
    }

    const custodyMetas: AccountMeta[] = [];

    for (const custody of pool.custodies) {
      custodyMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: custody,
      });
    }

    for (const custody of custodies) {
      if (!custody) {
        continue;
      }
      custodyMetas.push({
        isSigner: false,
        isWritable: false,
        pubkey: custody.oracle.oracleAccount,
      });
    }

    return custodyMetas;
  }

  async getCollateralCustodyMint(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    side: 'none' | 'long' | 'short'
  ): Promise<PublicKey> {
    const custodyAccount = (await this.getUserPosition(wallet, poolName, tokenMint, side))
      .collateralCustody;

    return (await this.program.account.custody.fetch(custodyAccount)).mint;
  }
  async getMultisig(): Promise<Multisig> {
    const multisig = this.findProgramAddress('multisig');
    return this.program.account.multisig.fetch(multisig.publicKey);
  }

  getPositionKey(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    side: 'none' | 'long' | 'short'
  ): PublicKey {
    const pool = this.getPoolKey(poolName);
    const custody = this.getCustodyKey(poolName, tokenMint);

    return this.findProgramAddress('position', [wallet, pool, custody, side === 'long' ? [1] : [0]])
      .publicKey;
  }

  getUserPosition(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    side: 'none' | 'long' | 'short'
  ): Promise<any> {
    return this.program.account.position.fetch(
      this.getPositionKey(wallet, poolName, tokenMint, side)
    );
  }

  async getUserPositions(wallet: PublicKey): Promise<Position[]> {
    const data = bs58.encode(
      Buffer.concat([this.getAccountDiscriminator('Position'), wallet.toBuffer()])
    );

    const positions = await this.connection.getProgramAccounts(this.program.programId, {
      filters: [{ dataSize: 232 }, { memcmp: { bytes: data, offset: 0 } }],
    });

    return Promise.all(
      positions.map((position) => {
        return this.program.account.position.fetch(position.pubkey);
      })
    );
  }

  async getPoolTokenPositions(poolName: string, tokenMint: PublicKey): Promise<Position[]> {
    const poolKey = this.getPoolKey(poolName);
    const custodyKey = this.getCustodyKey(poolName, tokenMint);
    const data = bs58.encode(Buffer.concat([poolKey.toBuffer(), custodyKey.toBuffer()]));
    const positions = await this.connection.getProgramAccounts(this.program.programId, {
      filters: [{ dataSize: 232 }, { memcmp: { bytes: data, offset: 40 } }],
    });

    return Promise.all(
      positions.map((position) => {
        return this.program.account.position.fetch(position.pubkey);
      })
    );
  }

  async getAllPositions(): Promise<Position[]> {
    const positions = await this.program.account.position.all();
    return positions.map((position) => position.account); // TODO if publickey is needed return position.pubkey
  }
  getAccountDiscriminator(name: string): Buffer {
    return Buffer.from(sha256.digest(`account:${name}`)).subarray(0, 8);
  }
  getTime(): number {
    const now = new Date();
    const utcMilllisecondsSinceEpoch = now.getTime() + now.getTimezoneOffset() * 60 * 1_000;

    return utcMilllisecondsSinceEpoch / 1_000;
  }

  async getOraclePrice(poolName: string, tokenMint: PublicKey, ema: boolean): Promise<BN> {
    return await this.program.methods
      .getOraclePrice({
        ema,
      })
      .accounts({
        custodyOracleAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
        custodyTwapAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
      })
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }
  async getAddLiquidityAmountAndFee(
    poolName: string,
    tokenMint: PublicKey,
    amount: BN
  ): Promise<AmountAndFee> {
    return await this.program.methods
      .getAddLiquidityAmountAndFee({
        amountIn: amount,
      })
      .accounts({
        custodyOracleAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
        custodyTwapAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
      })
      .remainingAccounts(await this.getCustodyMetas(poolName))
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }
  async getRemoveLiquidityAmountAndFee(
    poolName: string,
    tokenMint: PublicKey,
    lpAmount: BN,
    _custodyFeedId: string // TODO: add this to the params
  ): Promise<AmountAndFee> {
    return await this.program.methods
      .getRemoveLiquidityAmountAndFee({
        lpAmountIn: lpAmount,
      })
      .accounts({
        custodyOracleAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
        custodyTwapAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
      })
      .remainingAccounts(await this.getCustodyMetas(poolName))
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }
  async getEntryPriceAndFee(
    poolName: string,
    tokenMint: PublicKey,
    collateralMint: PublicKey,
    collateral: BN,
    size: BN,
    side: 'none' | 'long' | 'short'
  ): Promise<NewPositionPricesAndFee> {
    return await this.program.methods
      .getEntryPriceAndFee({
        collateral,
        size,
        side: stringToSide(side),
      })
      .accounts({
        custodyOracleAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
        custodyTwapAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
        collateralCustodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          collateralMint
        ),
        collateralCustodyTwapAccount: await this.getCustodyOracleAccountKey(
          poolName,
          collateralMint
        ),
      })
      // .remainingAccounts(await this.getCustodyMetas(poolName))
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }
  async getExitPriceAndFee(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    collateralMint: PublicKey,
    side: 'none' | 'long' | 'short'
  ): Promise<PriceAndFee> {
    return await this.program.methods
      .getExitPriceAndFee({
        side,
      })
      .accounts({
        custodyOracleAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
        custodyTwapAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
        position: this.getPositionKey(wallet, poolName, tokenMint, side),
        collateralCustodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          collateralMint
        ),
        collateralCustodyTwapAccount: await this.getCustodyOracleAccountKey(
          poolName,
          collateralMint
        ),
      })
      .remainingAccounts(await this.getCustodyMetas(poolName))
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }
  async getLiquidationPrice(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    collateralMint: PublicKey,
    side: 'none' | 'long' | 'short',
    addCollateral: BN,
    removeCollateral: BN
  ): Promise<BN> {
    return await this.program.methods
      .getLiquidationPrice({
        addCollateral,
        removeCollateral,
      })
      .accounts({
        position: this.getPositionKey(wallet, poolName, tokenMint, side),
        collateralCustody: this.getCustodyKey(poolName, collateralMint),
        custodyOracleAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
        custodyTwapAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
        collateralCustodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          collateralMint
        ),
        collateralCustodyTwapAccount: await this.getCustodyOracleAccountKey(
          poolName,
          collateralMint
        ),
      })
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }
  async getLiquidationState(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    collateralMint: PublicKey,
    side: 'none' | 'long' | 'short'
  ): Promise<number> {
    return await this.program.methods
      .getLiquidationState({
        side,
      })
      .accounts({
        position: this.getPositionKey(wallet, poolName, tokenMint, side),
        collateralCustody: this.getCustodyKey(poolName, collateralMint),
        custodyOracleAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
        custodyTwapAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
        collateralCustodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          collateralMint
        ),
        collateralCustodyTwapAccount: await this.getCustodyOracleAccountKey(
          poolName,
          collateralMint
        ),
      })
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }

  async getPnl(
    wallet: PublicKey,
    poolName: string,
    tokenMint: PublicKey,
    collateralMint: PublicKey,
    side: 'none' | 'long' | 'short'
  ): Promise<ProfitAndLoss> {
    return await this.program.methods
      .getPnl({
        side,
      })
      .accounts({
        position: this.getPositionKey(wallet, poolName, tokenMint, side),
        collateralCustody: this.getCustodyKey(poolName, collateralMint),
        custodyOracleAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
        custodyTwapAccount: await this.getCustodyOracleAccountKey(poolName, tokenMint),
        collateralCustodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          collateralMint
        ),
        collateralCustodyTwapAccount: await this.getCustodyOracleAccountKey(
          poolName,
          collateralMint
        ),
      })
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }
  async getSwapAmountAndFees(
    poolName: string,
    tokenMintIn: PublicKey,
    tokenMintOut: PublicKey,
    amountIn: BN
  ): Promise<SwapAmountAndFees> {
    return await this.program.methods
      .getSwapAmountAndFees({
        amountIn,
      })
      .accounts({
        receivingCustodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMintOut
        ),
        receivingCustodyTwapAccount: await this.getCustodyOracleAccountKey(poolName, tokenMintOut),
        dispensingCustodyOracleAccount: await this.getCustodyOracleAccountKey(
          poolName,
          tokenMintIn
        ),
        dispensingCustodyTwapAccount: await this.getCustodyOracleAccountKey(poolName, tokenMintIn),
      })
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }
  async getAum(poolName: string): Promise<BN> {
    return await this.program.methods
      .getAssetsUnderManagement({})
      .accounts({
        perpetuals: this.findProgramAddress('perpetuals').publicKey,
        pool: this.getPoolKey(poolName),
      })
      .remainingAccounts(await this.getCustodyMetas(poolName))
      .view()
      .catch((err) => {
        console.error(err);
        throw err;
      });
  }
  fetchAumWithRetry(_poolName: string): Promise<BN> {
    throw new Error('Method not implemented.');
  }
  log(...messages: string[]): void {
    const date = new Date();
    const dateStr = date.toDateString();
    const time = date.toLocaleTimeString();

    console.log(`[${dateStr} ${time}] ${messages.join(', ')}`);
  }
  prettyPrint(v: any): void {
    console.log(JSON.stringify(v, null, 2));
  }

  findProgramAddress = (
    label: string,
    extraSeeds: any = null
  ): {
    publicKey: PublicKey;
    bump: number;
  } => {
    const seeds = [Buffer.from(utils.bytes.utf8.encode(label))];

    if (extraSeeds) {
      for (const extraSeed of extraSeeds) {
        if (typeof extraSeed === 'string') {
          seeds.push(Buffer.from(utils.bytes.utf8.encode(extraSeed)));
        } else if (Array.isArray(extraSeed)) {
          seeds.push(Buffer.from(extraSeed));
        } else {
          seeds.push(extraSeed.toBuffer());
        }
      }
    }

    const [publicKey, bump] = PublicKey.findProgramAddressSync(seeds, this.program.programId);

    return { publicKey, bump };
  };
}
