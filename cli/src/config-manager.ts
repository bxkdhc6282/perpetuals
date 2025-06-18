import Conf from "conf";
import { Environment } from "@algelabs/sdk";

export interface CliConfig {
  defaultEnvironment: Environment;
  defaultKeypairPath?: string;
  rpcUrls: Record<Environment, string>;
}

export class ConfigManager {
  private config: Conf<CliConfig>;

  constructor() {
    this.config = new Conf<CliConfig>({
      schema: {
        defaultEnvironment: {
          type: "string",
          enum: ["mainnet", "devnet", "testnet"],
          default: "testnet",
        },
        defaultKeypairPath: {
          type: "string",
          default: undefined,
        },
        rpcUrls: {
          type: "object",
          default: {
            mainnet: "https://mainnetbeta-rpc.eclipse.xyz",
            devnet: "https://staging-rpc.dev2.eclipsenetwork.xyz",
            testnet: "https://testnet.dev2.eclipsenetwork.xyz",
          },
        },
      },
    });
  }

  getDefaultEnvironment(): Environment {
    return this.config.get("defaultEnvironment") as Environment;
  }

  setDefaultEnvironment(environment: Environment): void {
    this.config.set("defaultEnvironment", environment);
  }

  getDefaultKeypairPath(): string | undefined {
    return this.config.get("defaultKeypairPath");
  }

  setDefaultKeypairPath(path: string): void {
    this.config.set("defaultKeypairPath", path);
  }

  getRpcUrl(environment: Environment): string {
    const rpcUrls = this.config.get("rpcUrls");
    return rpcUrls[environment];
  }

  setRpcUrl(environment: Environment, url: string): void {
    const rpcUrls = this.config.get("rpcUrls");
    rpcUrls[environment] = url;
    this.config.set("rpcUrls", rpcUrls);
  }
}
