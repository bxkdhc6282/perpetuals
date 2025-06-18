import { Command } from "commander";
import chalk from "chalk";
import inquirer from "inquirer";
import { WalletManager } from "../wallet-manager";
import { ConfigManager } from "../config-manager";
import { Environment, PerpetualsInstructions, toBN } from "@algelabs/sdk";
import { PublicKey, Transaction, ComputeBudgetProgram } from "@solana/web3.js";

export class PositionCommands {
  constructor(
    private program: Command,
    private walletManager: WalletManager,
    private configManager: ConfigManager
  ) {
    this.setupCommands();
  }

  private setupCommands() {
    const position = this.program
      .command("position")
      .description("Position management commands");

    position
      .command("open")
      .description("Open a new position")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-p, --pool <name>", "Pool name")
      .option("-t, --token <mint>", "Token mint address")
      .option("-c, --collateral <mint>", "Collateral mint address")
      .option("-s, --side <side>", "Position side (long/short)")
      .option("--size <amount>", "Position size")
      .option("--collateral-amount <amount>", "Collateral amount")
      .option("--price <price>", "Entry price")
      .option("--custody-feed-id <feed>", "Custody feed ID")
      .option("--collateral-feed-id <feed>", "Collateral feed ID")
      .action(async (options) => {
        try {
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          // Interactive prompts if not provided
          const answers = await inquirer.prompt([
            {
              type: "input",
              name: "pool",
              message: "Pool name:",
              default: options.pool,
            },
            {
              type: "input",
              name: "token",
              message: "Token mint address:",
              default: options.token,
            },
            {
              type: "input",
              name: "collateral",
              message: "Collateral mint address:",
              default: options.collateral,
            },
            {
              type: "list",
              name: "side",
              message: "Position side:",
              choices: ["long", "short"],
              default: options.side,
            },
            {
              type: "input",
              name: "size",
              message: "Position size:",
              default: options.size,
            },
            {
              type: "input",
              name: "collateralAmount",
              message: "Collateral amount:",
              default: options.collateralAmount,
            },
            {
              type: "input",
              name: "price",
              message: "Entry price:",
              default: options.price,
            },
            {
              type: "input",
              name: "custodyFeedId",
              message: "Custody feed ID:",
              default: options.custodyFeedId,
            },
            {
              type: "input",
              name: "collateralFeedId",
              message: "Collateral feed ID:",
              default: options.collateralFeedId,
            },
          ]);

          console.log(chalk.blue("\n🚀 Opening position..."));

          // Get entry price and fee
          const entryPriceAndFee = await client.getEntryPriceAndFee(
            answers.pool,
            new PublicKey(answers.token),
            new PublicKey(answers.collateral),
            toBN(answers.collateralAmount),
            toBN(answers.size),
            answers.side as any
          );

          console.log(
            chalk.green("Entry Price:", entryPriceAndFee.entryPrice.toString())
          );
          console.log(chalk.green("Fee:", entryPriceAndFee.fee.toString()));

          // Create and send transaction
          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const ix = await instructions.openPosition(
            answers.pool,
            answers.token,
            answers.collateral,
            answers.side as any,
            parseFloat(answers.price),
            parseFloat(answers.collateralAmount),
            parseFloat(answers.size),
            answers.custodyFeedId,
            answers.collateralFeedId,
            null,
            null
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
            chalk.green(`✅ Position opened! Transaction: ${signature}`)
          );
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });

    position
      .command("close")
      .description("Close a position")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-p, --pool <name>", "Pool name")
      .option("-t, --token <mint>", "Token mint address")
      .option("-c, --collateral <mint>", "Collateral mint address")
      .option("-s, --side <side>", "Position side (long/short)")
      .action(async (options) => {
        try {
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          const keypair = await this.walletManager.loadKeypair(options.keypair);

          // Interactive prompts if not provided
          const answers = await inquirer.prompt([
            {
              type: "input",
              name: "pool",
              message: "Pool name:",
              default: options.pool,
            },
            {
              type: "input",
              name: "token",
              message: "Token mint address:",
              default: options.token,
            },
            {
              type: "input",
              name: "collateral",
              message: "Collateral mint address:",
              default: options.collateral,
            },
            {
              type: "list",
              name: "side",
              message: "Position side:",
              choices: ["long", "short"],
              default: options.side,
            },
          ]);

          console.log(chalk.blue("\n🔒 Closing position..."));

          // Get exit price and fee
          const exitPriceAndFee = await client.getExitPriceAndFee(
            keypair.publicKey,
            answers.pool,
            new PublicKey(answers.token),
            new PublicKey(answers.collateral),
            answers.side as any
          );

          console.log(
            chalk.green("Exit Price:", exitPriceAndFee.price.toString())
          );
          console.log(chalk.green("Fee:", exitPriceAndFee.fee.toString()));

          // TODO: Implement close position instruction when available
          console.log(
            chalk.yellow("Close position instruction not yet available in SDK")
          );
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });

    position
      .command("pnl")
      .description("Get position PnL")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-p, --pool <name>", "Pool name")
      .option("-t, --token <mint>", "Token mint address")
      .option("-c, --collateral <mint>", "Collateral mint address")
      .option("-s, --side <side>", "Position side (long/short)")
      .action(async (options) => {
        try {
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          const keypair = await this.walletManager.loadKeypair(options.keypair);

          // Interactive prompts if not provided
          const answers = await inquirer.prompt([
            {
              type: "input",
              name: "pool",
              message: "Pool name:",
              default: options.pool,
            },
            {
              type: "input",
              name: "token",
              message: "Token mint address:",
              default: options.token,
            },
            {
              type: "input",
              name: "collateral",
              message: "Collateral mint address:",
              default: options.collateral,
            },
            {
              type: "list",
              name: "side",
              message: "Position side:",
              choices: ["long", "short"],
              default: options.side,
            },
          ]);

          const pnl = await client.getPnl(
            keypair.publicKey,
            answers.pool,
            new PublicKey(answers.token),
            new PublicKey(answers.collateral),
            answers.side as any
          );

          console.log(chalk.blue("\n💰 Position PnL:"));
          console.log(chalk.green("Profit:", pnl.profit.toString()));
          console.log(chalk.red("Loss:", pnl.loss.toString()));
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });
  }
}
