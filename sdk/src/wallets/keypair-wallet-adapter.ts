import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';
import { IWallet } from '../types';
import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
  VersionedTransaction,
} from '@solana/web3.js';

export class KeypairWalletAdapter implements IWallet {
  publicKey: PublicKey;
  payer: Keypair;
  connection: Connection;

  constructor(keypair: Keypair, connection: Connection) {
    this.payer = keypair;
    this.publicKey = keypair.publicKey;
    this.connection = connection;
  }
  signAndSendWithOracle(
    _tx: Transaction,
    _oracle: PythSolanaReceiver
  ): Promise<{ signature: string }> {
    throw new Error('Method not implemented.');
  }
  async signTransaction<T extends Transaction | VersionedTransaction>(tx: T): Promise<T> {
    if (tx instanceof VersionedTransaction) {
      throw new Error('Versioned transactions are not supported');
    }

    tx.partialSign(this.payer);
    return tx;
  }
  async signAllTransactions<T extends Transaction | VersionedTransaction>(txs: T[]): Promise<T[]> {
    return txs.map((t) => {
      if (t instanceof VersionedTransaction) {
        throw new Error('Versioned transactions are not supported');
      }
      t.partialSign(this.payer);
      return t;
    });
  }

  async signAndSendTransaction(tx: Transaction): Promise<{ signature: string }> {
    tx.sign(this.payer);
    const txHash = await sendAndConfirmTransaction(this.connection, tx, [this.payer]);
    return { signature: txHash };
  }
}
