import { Command } from "commander";
import chalk from "chalk";
import { WalletManager } from "../wallet-manager";
import { ConfigManager } from "../config-manager";
import {
  AssetManager,
  Environment,
  PerpetualsInstructions,
  toBN,
} from "@algelabs/sdk";
import { PublicKey } from "@solana/web3.js";

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
      .option("-t, --token <symbol>", "Token symbol (e.g., BTC, ETH, SOL)")
      .option(
        "-c, --collateral <symbol>",
        "Collateral symbol (e.g., USDC, USDT)"
      )
      .option("-s, --side <side>", "Position side (long/short)")
      .option("--size <amount>", "Position size")
      .option("--collateral-amount <amount>", "Collateral amount")
      .action(async (options) => {
        try {
          const inquirer = await import("inquirer");
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          const assetManager = AssetManager.getInstance();

          // Interactive prompts if not provided
          const answers = await inquirer.default.prompt([
            {
              type: "input",
              name: "pool",
              message: "Pool name:",
              default: options.pool,
              when: !options.pool,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Pool name is required";
                }
                return true;
              },
            },
            {
              type: "input",
              name: "token",
              message: "Token symbol (e.g., BTC, ETH, SOL):",
              default: options.token,
              when: !options.token,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Token symbol is required";
                }
                try {
                  assetManager.getAssetBySymbol(input.trim().toUpperCase());
                  return true;
                } catch (error) {
                  return `Invalid token symbol: ${input}. Please use a valid symbol like BTC, ETH, SOL, etc.`;
                }
              },
            },
            {
              type: "input",
              name: "collateral",
              message: "Collateral symbol (e.g., USDC, USDT):",
              default: options.collateral,
              when: !options.collateral,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Collateral symbol is required";
                }
                try {
                  assetManager.getAssetBySymbol(input.trim().toUpperCase());
                  return true;
                } catch (error) {
                  return `Invalid collateral symbol: ${input}. Please use a valid symbol like USDC, USDT, etc.`;
                }
              },
            },
            {
              type: "list",
              name: "side",
              message: "Position side:",
              choices: ["long", "short"],
              default: options.side || "long",
              when: !options.side,
            },
            {
              type: "input",
              name: "size",
              message: "Position size:",
              default: options.size,
              when: !options.size,
              validate: (input: string) => {
                const num = parseFloat(input);
                if (isNaN(num) || num <= 0) {
                  return "Position size must be a positive number";
                }
                return true;
              },
            },
            {
              type: "input",
              name: "collateralAmount",
              message: "Collateral amount:",
              default: options.collateralAmount,
              when: !options.collateralAmount,
              validate: (input: string) => {
                const num = parseFloat(input);
                if (isNaN(num) || num <= 0) {
                  return "Collateral amount must be a positive number";
                }
                return true;
              },
            },
            {
              type: "confirm",
              name: "confirm",
              message: (answers: any) => {
                const pool = options.pool || answers.pool;
                const token = options.token || answers.token;
                const side = options.side || answers.side;
                const size = options.size || answers.size;
                return `Are you sure you want to open a ${side} position of ${size} for ${token} in pool ${pool}?`;
              },
              default: false,
            },
          ]);

          const pool = options.pool || answers.pool;
          const tokenSymbol = (options.token || answers.token)
            .trim()
            .toUpperCase();
          const collateralSymbol = (options.collateral || answers.collateral)
            .trim()
            .toUpperCase();
          const side = (options.side || answers.side) as "long" | "short";
          const size = options.size || answers.size;
          const collateralAmount =
            options.collateralAmount || answers.collateralAmount;

          // Get asset information from AssetManager
          const tokenAsset = assetManager.getAssetBySymbol(tokenSymbol);
          const collateralAsset =
            assetManager.getAssetBySymbol(collateralSymbol);

          // Check confirmation
          if (!answers.confirm) {
            console.log(chalk.yellow("❌ Position opening cancelled"));
            return;
          }

          console.log(chalk.blue("\n🚀 Opening position..."));
          console.log(chalk.gray(`Pool: ${pool}`));
          console.log(chalk.gray(`Token: ${tokenSymbol} (${tokenAsset.mint})`));
          console.log(
            chalk.gray(
              `Collateral: ${collateralSymbol} (${collateralAsset.mint})`
            )
          );
          console.log(chalk.gray(`Side: ${side}`));
          console.log(chalk.gray(`Size: ${size}`));
          console.log(chalk.gray(`Collateral amount: ${collateralAmount}`));

          // Get entry price and fee
          const entryPriceAndFee = await client.getEntryPriceAndFee(
            pool,
            new PublicKey(tokenAsset.mint),
            new PublicKey(collateralAsset.mint),
            toBN(collateralAmount),
            toBN(size),
            side,
            tokenAsset.feedId,
            collateralAsset.feedId
          );

          console.log(
            chalk.green(
              "📊 Calculated Entry Price:",
              entryPriceAndFee.entryPrice.toString()
            )
          );
          console.log(chalk.green("💰 Fee:", entryPriceAndFee.fee.toString()));

          // Create and send transaction
          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const tx = await instructions.openPosition(
            pool,
            tokenAsset.mint,
            collateralAsset.mint,
            side,
            parseFloat(collateralAmount),
            parseFloat(size),
            tokenAsset.feedId,
            collateralAsset.feedId,
            null,
            null
          );

          tx.feePayer = client.wallet.publicKey;
          tx.recentBlockhash = (
            await client.connection.getLatestBlockhash()
          ).blockhash;

          const { signature } = await client.wallet.signAndSendTransaction(tx);
          console.log(
            chalk.green(
              `✅ Position opened successfully! Transaction: ${signature}`
            )
          );
        } catch (error) {
          console.error(chalk.red("❌ Error opening position:"), error);
          process.exit(1);
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
      .option("-t, --token <symbol>", "Token symbol (e.g., BTC, ETH, SOL)")
      .option(
        "-c, --collateral <symbol>",
        "Collateral symbol (e.g., USDC, USDT)"
      )
      .option("-s, --side <side>", "Position side (long/short)")
      .action(async (options) => {
        try {
          const inquirer = await import("inquirer");
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          const keypair = await this.walletManager.loadKeypair(options.keypair);
          const assetManager = AssetManager.getInstance();

          // Interactive prompts if not provided
          const answers = await inquirer.default.prompt([
            {
              type: "input",
              name: "pool",
              message: "Pool name:",
              default: options.pool,
              when: !options.pool,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Pool name is required";
                }
                return true;
              },
            },
            {
              type: "input",
              name: "token",
              message: "Token symbol (e.g., BTC, ETH, SOL):",
              default: options.token,
              when: !options.token,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Token symbol is required";
                }
                try {
                  assetManager.getAssetBySymbol(input.trim().toUpperCase());
                  return true;
                } catch (error) {
                  return `Invalid token symbol: ${input}. Please use a valid symbol like BTC, ETH, SOL, etc.`;
                }
              },
            },
            {
              type: "input",
              name: "collateral",
              message: "Collateral symbol (e.g., USDC, USDT):",
              default: options.collateral,
              when: !options.collateral,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Collateral symbol is required";
                }
                try {
                  assetManager.getAssetBySymbol(input.trim().toUpperCase());
                  return true;
                } catch (error) {
                  return `Invalid collateral symbol: ${input}. Please use a valid symbol like USDC, USDT, etc.`;
                }
              },
            },
            {
              type: "list",
              name: "side",
              message: "Position side:",
              choices: ["long", "short"],
              default: options.side || "long",
              when: !options.side,
            },
            {
              type: "confirm",
              name: "confirm",
              message: (answers: any) => {
                const pool = options.pool || answers.pool;
                const token = options.token || answers.token;
                const side = options.side || answers.side;
                return `Are you sure you want to close the ${side} position for ${token} in pool ${pool}?`;
              },
              default: false,
            },
          ]);

          const pool = options.pool || answers.pool;
          const tokenSymbol = (options.token || answers.token)
            .trim()
            .toUpperCase();
          const collateralSymbol = (options.collateral || answers.collateral)
            .trim()
            .toUpperCase();
          const side = (options.side || answers.side) as "long" | "short";

          // Get asset information from AssetManager
          const tokenAsset = assetManager.getAssetBySymbol(tokenSymbol);
          const collateralAsset =
            assetManager.getAssetBySymbol(collateralSymbol);

          // Check confirmation
          if (!answers.confirm) {
            console.log(chalk.yellow("❌ Position closing cancelled"));
            return;
          }

          console.log(chalk.blue("\n🔒 Closing position..."));
          console.log(chalk.gray(`Pool: ${pool}`));
          console.log(chalk.gray(`Token: ${tokenSymbol} (${tokenAsset.mint})`));
          console.log(
            chalk.gray(
              `Collateral: ${collateralSymbol} (${collateralAsset.mint})`
            )
          );
          console.log(chalk.gray(`Side: ${side}`));

          // Get exit price and fee
          const exitPriceAndFee = await client.getExitPriceAndFee(
            keypair.publicKey,
            pool,
            new PublicKey(tokenAsset.mint),
            new PublicKey(collateralAsset.mint),
            side,
            tokenAsset.feedId,
            collateralAsset.feedId
          );

          console.log(
            chalk.green("📊 Exit Price:", exitPriceAndFee.price.toString())
          );
          console.log(chalk.green("💰 Fee:", exitPriceAndFee.fee.toString()));

          // TODO: Implement close position instruction when available
          console.log(
            chalk.yellow(
              "⚠️  Close position instruction not yet available in SDK"
            )
          );
        } catch (error) {
          console.error(chalk.red("❌ Error closing position:"), error);
          process.exit(1);
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
      .option("-t, --token <symbol>", "Token symbol (e.g., BTC, ETH, SOL)")
      .option(
        "-c, --collateral <symbol>",
        "Collateral symbol (e.g., USDC, USDT)"
      )
      .option("-s, --side <side>", "Position side (long/short)")
      .action(async (options) => {
        try {
          const inquirer = await import("inquirer");
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          const keypair = await this.walletManager.loadKeypair(options.keypair);
          const assetManager = AssetManager.getInstance();

          // Interactive prompts if not provided
          const answers = await inquirer.default.prompt([
            {
              type: "input",
              name: "pool",
              message: "Pool name:",
              default: options.pool,
              when: !options.pool,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Pool name is required";
                }
                return true;
              },
            },
            {
              type: "input",
              name: "token",
              message: "Token symbol (e.g., BTC, ETH, SOL):",
              default: options.token,
              when: !options.token,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Token symbol is required";
                }
                try {
                  assetManager.getAssetBySymbol(input.trim().toUpperCase());
                  return true;
                } catch (error) {
                  return `Invalid token symbol: ${input}. Please use a valid symbol like BTC, ETH, SOL, etc.`;
                }
              },
            },
            {
              type: "input",
              name: "collateral",
              message: "Collateral symbol (e.g., USDC, USDT):",
              default: options.collateral,
              when: !options.collateral,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Collateral symbol is required";
                }
                try {
                  assetManager.getAssetBySymbol(input.trim().toUpperCase());
                  return true;
                } catch (error) {
                  return `Invalid collateral symbol: ${input}. Please use a valid symbol like USDC, USDT, etc.`;
                }
              },
            },
            {
              type: "list",
              name: "side",
              message: "Position side:",
              choices: ["long", "short"],
              default: options.side || "long",
              when: !options.side,
            },
          ]);

          const pool = options.pool || answers.pool;
          const tokenSymbol = (options.token || answers.token)
            .trim()
            .toUpperCase();
          const collateralSymbol = (options.collateral || answers.collateral)
            .trim()
            .toUpperCase();
          const side = (options.side || answers.side) as "long" | "short";

          // Get asset information from AssetManager
          const tokenAsset = assetManager.getAssetBySymbol(tokenSymbol);
          const collateralAsset =
            assetManager.getAssetBySymbol(collateralSymbol);

          console.log(chalk.blue("\n💰 Calculating position PnL..."));
          console.log(chalk.gray(`Pool: ${pool}`));
          console.log(chalk.gray(`Token: ${tokenSymbol} (${tokenAsset.mint})`));
          console.log(
            chalk.gray(
              `Collateral: ${collateralSymbol} (${collateralAsset.mint})`
            )
          );
          console.log(chalk.gray(`Side: ${side}`));

          const pnl = await client.getPnl(
            keypair.publicKey,
            pool,
            new PublicKey(tokenAsset.mint),
            new PublicKey(collateralAsset.mint),
            side
          );

          console.log(chalk.blue("\n📊 Position PnL:"));
          console.log(chalk.green("✅ Profit:", pnl.profit.toString()));
          console.log(chalk.red("❌ Loss:", pnl.loss.toString()));

          const netPnl = pnl.profit.sub(pnl.loss);
          if (netPnl.gt(toBN(0))) {
            console.log(chalk.green(`💰 Net PnL: +${netPnl.toString()}`));
          } else if (netPnl.lt(toBN(0))) {
            console.log(chalk.red(`💰 Net PnL: ${netPnl.toString()}`));
          } else {
            console.log(chalk.gray(`💰 Net PnL: ${netPnl.toString()}`));
          }
        } catch (error) {
          console.error(chalk.red("❌ Error getting position PnL:"), error);
          process.exit(1);
        }
      });
  }
}
