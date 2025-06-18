import { Command } from "commander";
import chalk from "chalk";
import { WalletManager } from "../wallet-manager";
import { ConfigManager } from "../config-manager";
import { Environment, Position } from "@algelabs/sdk";

export class InfoCommands {
  constructor(
    private program: Command,
    private walletManager: WalletManager,
    private configManager: ConfigManager
  ) {
    this.setupCommands();
  }

  private setupCommands() {
    const info = this.program
      .command("info")
      .description("Display protocol information");

    info
      .command("pools")
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

    info
      .command("pool <name>")
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

    info
      .command("positions")
      .description("Get user positions")
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

          const keypair = await this.walletManager.loadKeypair(options.keypair);
          const positions: Position[] = await client.getUserPositions(
            keypair.publicKey
          );

          console.log(chalk.blue("\n📈 Your Positions:"));
          if (positions.length === 0) {
            console.log(chalk.yellow("No positions found"));
          } else {
            positions.forEach((position, index) => {
              console.log(chalk.green(`\n${index + 1}. Position Details:`));
              console.log(`   Pool: ${position.pool.toString()}`);
              console.log(`   Token: ${position.custody.toString()}`);
              console.log(`   Side: ${position.side}`);
              console.log(`   Size: ${position.sizeUsd.toString()}`);
              console.log(
                `   Collateral: ${position.collateralUsd.toString()}`
              );
            });
          }
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });
  }
}
