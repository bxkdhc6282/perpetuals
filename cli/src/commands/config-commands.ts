import { Command } from "commander";
import chalk from "chalk";
import { ConfigManager } from "../config-manager";
import { Environment } from "@algelabs/sdk";

export class ConfigCommands {
  constructor(
    private program: Command,
    private configManager: ConfigManager
  ) {
    this.setupCommands();
  }

  private setupCommands() {
    const config = this.program
      .command("config")
      .description("Configuration management");

    config
      .command("set-keypair <path>")
      .description("Set default keypair path")
      .action(async (path) => {
        try {
          this.configManager.setDefaultKeypairPath(path);
          console.log(chalk.green(`✅ Default keypair set to: ${path}`));
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });

    config
      .command("set-environment <env>")
      .description("Set default environment")
      .action(async (env) => {
        try {
          if (!["mainnet", "devnet", "testnet"].includes(env)) {
            throw new Error("Environment must be mainnet, devnet, or testnet");
          }
          this.configManager.setDefaultEnvironment(env as Environment);
          console.log(chalk.green(`✅ Default environment set to: ${env}`));
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });

    config
      .command("set-rpc <env> <url>")
      .description("Set custom RPC URL for environment")
      .action(async (env, url) => {
        try {
          if (!["mainnet", "devnet", "testnet"].includes(env)) {
            throw new Error("Environment must be mainnet, devnet, or testnet");
          }
          this.configManager.setRpcUrl(env as Environment, url);
          console.log(chalk.green(`✅ RPC URL set for ${env}: ${url}`));
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });

    config
      .command("show")
      .description("Show current configuration")
      .action(async () => {
        try {
          console.log(chalk.blue("\n📋 Current Configuration:"));
          console.log(
            chalk.green(
              "Default Environment:",
              this.configManager.getDefaultEnvironment()
            )
          );
          console.log(
            chalk.green(
              "Default Keypair:",
              this.configManager.getDefaultKeypairPath() || "Not set"
            )
          );

          const rpcUrls = {
            mainnet: this.configManager.getRpcUrl("mainnet"),
            devnet: this.configManager.getRpcUrl("devnet"),
            testnet: this.configManager.getRpcUrl("testnet"),
          };

          console.log(chalk.blue("\n🌐 RPC URLs:"));
          Object.entries(rpcUrls).forEach(([env, url]) => {
            console.log(chalk.green(`${env}:`, url));
          });
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });
  }
}
