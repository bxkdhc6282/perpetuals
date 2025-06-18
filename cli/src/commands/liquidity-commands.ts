import { Command } from "commander";
import chalk from "chalk";
import { WalletManager } from "../wallet-manager";
import { ConfigManager } from "../config-manager";
import { Environment, PerpetualsInstructions, toBN } from "@algelabs/sdk";
import { PublicKey, Transaction, ComputeBudgetProgram } from "@solana/web3.js";

export class LiquidityCommands {
  constructor(
    private program: Command,
    private walletManager: WalletManager,
    private configManager: ConfigManager
  ) {
    this.setupCommands();
  }

  private setupCommands() {
    const liquidity = this.program
      .command("liquidity")
      .description("Liquidity management commands");

    liquidity
      .command("add")
      .description("Add liquidity to a pool")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-p, --pool <name>", "Pool name")
      .option("-t, --token <mint>", "Token mint address")
      .option("--amount <amount>", "Amount to add")
      .option("--min-lp-amount <amount>", "Minimum LP tokens to receive")
      .option("--feed-id <feed>", "Feed ID")
      .action(async (options) => {
        try {
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          console.log(chalk.blue("\n💧 Adding liquidity..."));

          // Get add liquidity amount and fee
          const amountAndFee = await client.getAddLiquidityAmountAndFee(
            options.pool,
            new PublicKey(options.token),
            toBN(options.amount)
          );

          console.log(
            chalk.green("LP Tokens Out:", amountAndFee.amount.toString())
          );
          console.log(chalk.green("Fee:", amountAndFee.fee.toString()));

          // Create and send transaction
          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const ix = await instructions.addLiquidity(
            options.pool,
            options.token,
            parseFloat(options.amount),
            parseFloat(options.minLpAmount || "0"),
            options.feedId || "default-feed-id"
          );

          const tx = new Transaction();
          const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({
            units: 1000000,
          });

          tx.add(computeBudget);
          tx.add(ix);

          tx.feePayer = client.wallet.publicKey;
          tx.recentBlockhash = (
            await client.connection.getLatestBlockhash()
          ).blockhash;

          const { signature } = await client.wallet.signAndSendTransaction(tx);
          console.log(
            chalk.green(`✅ Liquidity added! Transaction: ${signature}`)
          );
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });

    liquidity
      .command("remove")
      .description("Remove liquidity from a pool")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-p, --pool <name>", "Pool name")
      .option("-t, --token <mint>", "Token mint address")
      .option("--lp-amount <amount>", "LP token amount to burn")
      .option("--feed-id <feed>", "Feed ID")
      .action(async (options) => {
        try {
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          console.log(chalk.blue("\n💧 Removing liquidity..."));

          // Get remove liquidity amount and fee
          const amountAndFee = await client.getRemoveLiquidityAmountAndFee(
            options.pool,
            new PublicKey(options.token),
            toBN(options.lpAmount),
            options.feedId || "default-feed-id"
          );

          console.log(
            chalk.green("Tokens Out:", amountAndFee.amount.toString())
          );
          console.log(chalk.green("Fee:", amountAndFee.fee.toString()));

          // TODO: Implement remove liquidity instruction when available
          console.log(
            chalk.yellow(
              "Remove liquidity instruction not yet available in SDK"
            )
          );
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });
  }
}
