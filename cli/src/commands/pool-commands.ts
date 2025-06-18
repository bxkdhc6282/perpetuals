import { Command } from "commander";
import chalk from "chalk";
import { WalletManager } from "../wallet-manager";
import { ConfigManager } from "../config-manager";
import { Environment } from "@algelabs/sdk";

export class PoolCommands {
  constructor(
    private program: Command,
    private walletManager: WalletManager,
    private configManager: ConfigManager
  ) {
    this.setupCommands();
  }

  private setupCommands() {
    const pool = this.program
      .command("pool")
      .description("Pool management commands");

    pool
      .command("list")
      .description("List all pools")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .action(async (options) => {
        try {
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          const pools = await client.getPools();
          console.log(chalk.blue("\n📊 Available Pools:"));
          pools.forEach((pool, index) => {
            if (pool) {
              console.log(chalk.green(`\n${index + 1}. ${pool.name}`));
              console.log(`   Custodies: ${pool.custodies.length}`);
              console.log(`   AUM: $${pool.aumUsd.toString()}`);
            }
          });
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });

    pool
      .command("info <name>")
      .description("Get detailed pool information")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .action(async (name, options) => {
        try {
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          const pool = await client.getPool(name);
          console.log(chalk.blue(`\n📊 Pool: ${pool.name}`));
          console.log(`Custodies: ${pool.custodies.length}`);
          console.log(`AUM: $${pool.aumUsd.toString()}`);
          console.log(`LP Token Bump: ${pool.lpTokenBump}`);
          console.log(
            `Inception Time: ${new Date(pool.inceptionTime.toNumber() * 1000)}`
          );
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });

    pool
      .command("aum <name>")
      .description("Get pool AUM (Assets Under Management)")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .action(async (name, options) => {
        try {
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          const aum = await client.getAum(name);
          console.log(chalk.blue(`\n💰 Pool AUM: $${aum.toString()}`));
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });
  }
}
