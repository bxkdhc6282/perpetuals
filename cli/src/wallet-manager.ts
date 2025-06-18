import { Keypair, Connection } from "@solana/web3.js";
import {
  KeypairWalletAdapter,
  PerpetualsClient,
  Environment,
} from "@algelabs/sdk";
import { ConfigManager } from "./config-manager";
import * as fs from "fs";
// import * as path from "path";

export class WalletManager {
  constructor(private configManager: ConfigManager) {}

  async loadKeypair(keypairPath?: string): Promise<Keypair> {
    const pathToUse = keypairPath || this.configManager.getDefaultKeypairPath();

    if (!pathToUse) {
      throw new Error(
        "No keypair path provided. Use --keypair or set default with config."
      );
    }

    try {
      const keypairData = fs.readFileSync(pathToUse, "utf-8");
      const secretKey = Uint8Array.from(JSON.parse(keypairData));
      return Keypair.fromSecretKey(secretKey);
    } catch (error) {
      throw new Error(`Failed to load keypair from ${pathToUse}: ${error}`);
    }
  }

  async createClient(
    keypair: Keypair,
    environment: Environment
  ): Promise<PerpetualsClient> {
    const connection = new Connection(
      this.configManager.getRpcUrl(environment)
    );
    const wallet = new KeypairWalletAdapter(keypair, connection);
    return new PerpetualsClient(wallet, environment);
  }

  async createClientFromPath(
    keypairPath: string,
    environment: Environment
  ): Promise<PerpetualsClient> {
    const keypair = await this.loadKeypair(keypairPath);
    return this.createClient(keypair, environment);
  }
}
