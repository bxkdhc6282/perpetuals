import { Program, utils } from '@coral-xyz/anchor/dist/cjs';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { IWallet, Environment } from '../types';
import { AusdFaucet } from './idl/ausd_faucet';
import { IAusdFaucetClient } from './types';
import { createConnectionProxy } from '../utils/create-connection-proxy';
import { DEFAULT_RPC_URLS } from '../constants/default-rpc-urls';
import { IDL } from './idl/idl';
import { toBN } from '../utils/bn';
import { MINT_AUTHORITY_SEED, MINT_ACCOUNT, FAUCET_ACCOUNT, MINT_AUTHORITY } from './constants';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';

export class AusdFaucetClient implements IAusdFaucetClient {
  program: Program<AusdFaucet>;
  connection: Connection;
  wallet: IWallet;
  environment: Environment;

  constructor(wallet: IWallet, environment?: Environment) {
    this.environment = environment || 'testnet';
    this.connection = createConnectionProxy(DEFAULT_RPC_URLS[this.environment]);
    this.program = new Program<AusdFaucet>(IDL, {
      connection: this.connection,
    });
    this.wallet = wallet;
  }

  async initialize(): Promise<Transaction> {
    const program = this.program;
    const admin = this.wallet.publicKey;

    const tx = await program.methods
      .initialize()
      .accounts({
        admin,
        mintAccount: new PublicKey(MINT_ACCOUNT),
      })
      .transaction();
    return tx;
  }
  async mintToUser(amount: number, user: string): Promise<Transaction> {
    const program = this.program;
    const userTokenAccount = await getAssociatedTokenAddress(
      new PublicKey(MINT_ACCOUNT),
      new PublicKey(user)
    );

    // Check if the ATA exists
    const accountInfo = await this.connection.getAccountInfo(userTokenAccount);
    const preInstructions = [];

    // If ATA doesn't exist, add create instruction
    if (!accountInfo) {
      const createAtaIx = createAssociatedTokenAccountInstruction(
        this.wallet.publicKey, // payer
        userTokenAccount, // associated token account
        new PublicKey(user), // owner
        new PublicKey(MINT_ACCOUNT) // mint
      );
      preInstructions.push(createAtaIx);
    }

    const tx = await program.methods
      .mintToUser(toBN(amount))
      .accounts({
        faucetConfig: new PublicKey(FAUCET_ACCOUNT),
        mintAccount: new PublicKey(MINT_ACCOUNT),
        userTokenAccount,
        mintAuthority: new PublicKey(MINT_AUTHORITY),
      })
      .preInstructions(preInstructions)
      .transaction();
    return tx;
  }
  async transferMintAuthority(): Promise<Transaction> {
    const program = this.program;
    const tx = await program.methods
      .transferMintAuthority()
      .accounts({
        mintAuthority: this.findProgramAddress(MINT_AUTHORITY_SEED, [new PublicKey(MINT_ACCOUNT)])
          .publicKey,
        mintAccount: new PublicKey(MINT_ACCOUNT),
      })
      .transaction();
    return tx;
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
