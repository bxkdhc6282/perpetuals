import { Connection, Transaction } from '@solana/web3.js';
import { AusdFaucet } from './idl/ausd_faucet';
import { IWallet, Environment } from '../types';
import { Program } from '@coral-xyz/anchor';

export interface IAusdFaucetClient {
  program: Program<AusdFaucet>;
  connection: Connection;
  wallet: IWallet;
  environment: Environment;

  initialize(): Promise<Transaction>;
  mintToUser(amount: number, user: string): Promise<Transaction>;
  transferMintAuthority(): Promise<Transaction>;
}
