import { PythSolanaReceiver } from '@pythnetwork/pyth-solana-receiver';
import { Connection, PublicKey } from '@solana/web3.js';
import { Environment, IOracleClient, IWallet } from '../types';
import { HermesClient } from '@pythnetwork/hermes-client';

export class OracleClient implements IOracleClient {
  connection: Connection;
  wallet: IWallet;
  environment: Environment;
  pythSolanaReceiver: PythSolanaReceiver;
  hermesClient: HermesClient;

  constructor(connection: Connection, wallet: IWallet, environment: Environment) {
    this.connection = connection;
    this.wallet = wallet;
    this.environment = environment;
    this.pythSolanaReceiver = new PythSolanaReceiver({
      connection: this.connection,
      wallet: this.wallet,
    });
    this.hermesClient = new HermesClient('https://hermes.pyth.network/');
  }

  getRandomShardId(): number {
    return Math.floor(Math.random() * 0x10000); // 0x10000 is 2^16
  }

  async getTwapUpdate(feedIds: string[], twapWindowSeconds: number = 150) {
    const twapUpdateData = await this.hermesClient.getLatestTwaps(feedIds, twapWindowSeconds, {
      encoding: 'base64',
    });
    console.log(twapUpdateData.binary.data);
    return twapUpdateData;
  }

  async getPythUpdate(feedId: string) {
    const priceUpdateData = await this.hermesClient.getLatestPriceUpdates([feedId], {
      encoding: 'base64',
    });
    console.log(priceUpdateData.binary.data);
    return priceUpdateData;
  }

  async getTwapUpdateAccount(feedIds: string[]) {
    const twapUpdateData = await this.getTwapUpdate(feedIds);

    const twapUpdateDataArray = twapUpdateData.binary.data.map((data) => data.toString());

    const res = await this.pythSolanaReceiver.buildPostTwapUpdateInstructions(twapUpdateDataArray);

    return res;
  }

  fetchFeedAccount(feedId: string): PublicKey {
    // const shardId = this.getRandomShardId();
    const feedAccount = this.pythSolanaReceiver.getPriceFeedAccountAddress(0, feedId).toBase58();
    console.log(feedAccount);
    return new PublicKey(feedAccount);
  }

  hexToBytes32(hex: string): Uint8Array | number[] {
    if (hex.startsWith('0x')) hex = hex.slice(2);
    const bytes = Uint8Array.from(Buffer.from(hex, 'hex'));

    if (bytes.length !== 32) {
      throw new Error(`Invalid feed_id length. Expected 32 bytes, got ${bytes.length}`);
    }

    return bytes;
  }
}
