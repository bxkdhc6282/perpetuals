import { IWallet } from '../types';
import { Keypair, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { isSolanaWallet } from '@dynamic-labs/solana';
import { WalletConnectorCore, Wallet } from '@dynamic-labs/wallet-connector-core';
import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';

export class DynamicWalletAdapter implements IWallet {
  publicKey: PublicKey;
  dynamicWallet: Wallet<WalletConnectorCore.WalletConnector>;
  payer: Keypair;

  constructor(dynamicWallet: Wallet<WalletConnectorCore.WalletConnector>) {
    this.dynamicWallet = dynamicWallet;
    this.publicKey = new PublicKey(dynamicWallet.address);
    this.payer = null as unknown as Keypair;
  }

  signAndSendWithOracle(
    _tx: Transaction,
    _oracle: PythSolanaReceiver
  ): Promise<{ signature: string }> {
    throw new Error('Method not implemented.');
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    if (!this.dynamicWallet || !isSolanaWallet(this.dynamicWallet)) {
      throw new Error('Wallet is not a Solana wallet');
    }
    const signer = await this.dynamicWallet.getSigner();
    return signer.signTransaction(tx);
  }
  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    if (!this.dynamicWallet || !isSolanaWallet(this.dynamicWallet)) {
      throw new Error('Wallet is not a Solana wallet');
    }
    const signer = await this.dynamicWallet.getSigner();
    return signer.signAllTransactions(txs);
  }
  async signAndSendTransaction(tx: Transaction): Promise<{ signature: string }> {
    if (!this.dynamicWallet || !isSolanaWallet(this.dynamicWallet)) {
      throw new Error('Wallet is not a Solana wallet');
    }
    const signer = await this.dynamicWallet.getSigner();
    return signer.signAndSendTransaction(tx);
  }
}
