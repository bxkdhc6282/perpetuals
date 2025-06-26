import { Command } from "commander";
import chalk from "chalk";
import { WalletManager } from "../wallet-manager";
import { ConfigManager } from "../config-manager";
import {
  AssetManager,
  Environment,
  PerpetualsInstructions,
  toBN,
  // toLargeNumber,
} from "@algelabs/sdk";
import { PublicKey } from "@solana/web3.js";

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
      .option(
        "-t, --token <symbol>",
        "Token symbol (e.g., BTC, ETH, SOL, USDC)"
      )
      .option("--amount <usd>", "Amount in USD to add")
      .option("--min-lp-amount <amount>", "Minimum LP tokens to receive")
      .option("-y, --yes", "Skip confirmation prompt")
      .action(async (options) => {
        try {
          const inquirer = await import("inquirer");
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          const assetManager = AssetManager.getInstance();

          // Prompt for missing parameters
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
              message: "Token symbol (e.g., BTC, ETH, SOL, USDC):",
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
                  return `Invalid token symbol: ${input}. Please use a valid symbol like BTC, ETH, SOL, USDC, etc.`;
                }
              },
            },
            {
              type: "input",
              name: "amount",
              message: "Amount in USD to add:",
              default: options.amount,
              when: !options.amount,
              validate: (input: string) => {
                const num = parseFloat(input);
                if (isNaN(num) || num <= 0) {
                  return "Amount must be a positive number";
                }
                return true;
              },
            },
            {
              type: "input",
              name: "minLpAmount",
              message: "Minimum LP tokens to receive (optional):",
              default: options.minLpAmount || "0",
              when: !options.minLpAmount,
              validate: (input: string) => {
                const num = parseFloat(input);
                if (isNaN(num) || num < 0) {
                  return "Minimum LP amount must be a non-negative number";
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
                const amount = options.amount || answers.amount;
                return `Are you sure you want to add $${amount} USD worth of ${token} to pool ${pool}?`;
              },
              default: false,
              when: !options.yes,
            },
          ]);

          const pool = options.pool || answers.pool;
          const tokenSymbol = (options.token || answers.token)
            .trim()
            .toUpperCase();
          const usdAmount = parseFloat(options.amount || answers.amount);
          const minLpAmount = options.minLpAmount || answers.minLpAmount;

          // Get asset information from AssetManager
          const tokenAsset = assetManager.getAssetBySymbol(tokenSymbol);

          // Check confirmation
          if (!options.yes && !answers.confirm) {
            console.log(chalk.yellow("❌ Liquidity addition cancelled"));
            return;
          }

          console.log(chalk.blue("\n💧 Adding liquidity..."));
          console.log(chalk.gray(`Pool: ${pool}`));
          console.log(chalk.gray(`Token: ${tokenSymbol} (${tokenAsset.mint})`));
          console.log(chalk.gray(`USD Amount: $${usdAmount}`));
          console.log(chalk.gray(`Token Decimals: ${tokenAsset.decimals}`));
          console.log(
            chalk.gray(
              `Environment: ${options.environment || this.configManager.getDefaultEnvironment()}`
            )
          );

          try {
            // Convert USD amount to token amount using toLargeNumber
            // const tokenAmountRaw = toLargeNumber(
            //   usdAmount,
            //   tokenAsset.decimals
            // );

            const tokenAmountRaw = toBN(usdAmount).mul(toBN(10).pow(toBN(6)));

            console.log(chalk.gray(`Token Amount Raw: ${tokenAmountRaw}`));

            // Get add liquidity amount and fee
            const amountAndFee = await client.getAddLiquidityAmountAndFee(
              pool,
              new PublicKey(tokenAsset.mint),
              tokenAmountRaw
            );

            console.log(
              chalk.green("LP Tokens In:", amountAndFee.amount.toString())
            );
            console.log(chalk.green("Fee:", amountAndFee.fee.toString()));

            // Create and send transaction
            const instructions = new PerpetualsInstructions(
              client,
              client.oracleClient
            );
            const tx = await instructions.addLiquidity(
              pool,
              tokenAsset.mint,
              usdAmount,
              parseFloat(minLpAmount),
              tokenAsset.feedId
            );

            tx.feePayer = client.wallet.publicKey;
            tx.recentBlockhash = (
              await client.connection.getLatestBlockhash()
            ).blockhash;

            const { signature } =
              await client.wallet.signAndSendTransaction(tx);
            console.log(
              chalk.green(
                `✅ Liquidity added successfully! Transaction: ${signature}`
              )
            );
          } catch (error) {
            console.error(chalk.red("❌ Error adding liquidity:"), error);
            process.exit(1);
          }
        } catch (error) {
          console.error(chalk.red("❌ Error:"), error);
          process.exit(1);
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
      .option("-y, --yes", "Skip confirmation prompt")
      .action(async (options) => {
        try {
          const inquirer = await import("inquirer");
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          // Prompt for missing parameters
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
              message: "Token mint address:",
              default: options.token,
              when: !options.token,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Token mint address is required";
                }
                try {
                  new PublicKey(input);
                  return true;
                } catch (error) {
                  return "Invalid public key format";
                }
              },
            },
            {
              type: "input",
              name: "lpAmount",
              message: "LP token amount to burn:",
              default: options.lpAmount,
              when: !options.lpAmount,
              validate: (input: string) => {
                const num = parseFloat(input);
                if (isNaN(num) || num <= 0) {
                  return "LP amount must be a positive number";
                }
                return true;
              },
            },
            {
              type: "input",
              name: "feedId",
              message: "Feed ID (optional):",
              default: options.feedId || "default-feed-id",
              when: !options.feedId,
            },
            {
              type: "confirm",
              name: "confirm",
              message: (answers: any) => {
                const pool = options.pool || answers.pool;
                const token = options.token || answers.token;
                const lpAmount = options.lpAmount || answers.lpAmount;
                return `Are you sure you want to remove ${lpAmount} LP tokens from pool ${pool} for token ${token}?`;
              },
              default: false,
              when: !options.yes,
            },
          ]);

          const pool = options.pool || answers.pool;
          const token = options.token || answers.token;
          const lpAmount = options.lpAmount || answers.lpAmount;
          const feedId = options.feedId || answers.feedId;

          // Check confirmation
          if (!options.yes && !answers.confirm) {
            console.log(chalk.yellow("❌ Liquidity removal cancelled"));
            return;
          }

          console.log(chalk.blue("\n💧 Removing liquidity..."));
          console.log(chalk.gray(`Pool: ${pool}`));
          console.log(chalk.gray(`Token: ${token}`));
          console.log(chalk.gray(`LP Amount: ${lpAmount}`));
          console.log(
            chalk.gray(
              `Environment: ${options.environment || this.configManager.getDefaultEnvironment()}`
            )
          );

          try {
            // Get remove liquidity amount and fee
            const amountAndFee = await client.getRemoveLiquidityAmountAndFee(
              pool,
              new PublicKey(token),
              toBN(lpAmount),
              feedId
            );

            console.log(
              chalk.green("Tokens Out:", amountAndFee.amount.toString())
            );
            console.log(chalk.green("Fee:", amountAndFee.fee.toString()));

            // TODO: Remove liquidity instruction not yet available in SDK
            console.log(
              chalk.yellow(
                "❌ Remove liquidity instruction not yet available in SDK"
              )
            );
            console.log(
              chalk.gray(
                "The removeLiquidity method needs to be implemented in the PerpetualsInstructions class"
              )
            );
          } catch (error) {
            console.error(chalk.red("❌ Error removing liquidity:"), error);
            process.exit(1);
          }
        } catch (error) {
          console.error(chalk.red("❌ Error:"), error);
          process.exit(1);
        }
      });

    liquidity
      .command("info")
      .description("Get liquidity information for a pool")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-p, --pool <name>", "Pool name")
      .action(async (options) => {
        try {
          const inquirer = await import("inquirer");
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          // Prompt for missing parameters
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
          ]);

          const pool = options.pool || answers.pool;

          console.log(
            chalk.blue(`\n💧 Liquidity Information for Pool: ${pool}`)
          );
          console.log(
            chalk.gray(
              `Environment: ${options.environment || this.configManager.getDefaultEnvironment()}`
            )
          );

          try {
            // Get pool information
            const poolInfo = await client.getPool(pool);
            console.log(chalk.green(`\nPool Details:`));
            console.log(`   Name: ${poolInfo.name}`);
            console.log(`   Custodies: ${poolInfo.custodies.length}`);
            console.log(`   AUM: $${poolInfo.aumUsd.toString()}`);

            // Get custodies information
            const custodies = await client.getCustodies(pool);
            console.log(chalk.green(`\nCustody Details:`));

            for (let i = 0; i < custodies.length; i++) {
              const custody = custodies[i];
              if (custody) {
                console.log(
                  chalk.blue(`\n${i + 1}. Token: ${custody.mint.toString()}`)
                );
                console.log(`   Decimals: ${custody.decimals}`);
                console.log(`   Is Stable: ${custody.isStable}`);
                console.log(`   Is Virtual: ${custody.isVirtual}`);

                // Assets information
                console.log(`   Assets:`);
                console.log(`     Locked: ${custody.assets.locked.toString()}`);
                console.log(`     Owned: ${custody.assets.owned.toString()}`);
                console.log(
                  `     Collateral: ${custody.assets.collateral.toString()}`
                );
                console.log(
                  `     Protocol Fees: ${custody.assets.protocolFees.toString()}`
                );

                // Calculate total assets
                const totalAssets =
                  custody.assets.locked.toNumber() +
                  custody.assets.owned.toNumber() +
                  custody.assets.collateral.toNumber();
                console.log(`     Total: ${totalAssets}`);
              }
            }
          } catch (error) {
            console.error(chalk.red("❌ Error getting liquidity info:"), error);
            process.exit(1);
          }
        } catch (error) {
          console.error(chalk.red("❌ Error:"), error);
          process.exit(1);
        }
      });
  }
}
