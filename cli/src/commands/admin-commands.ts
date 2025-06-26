import { Command } from "commander";
import chalk from "chalk";
import { WalletManager } from "../wallet-manager";
import { ConfigManager } from "../config-manager";
import {
  BPS_POWER,
  Environment,
  PerpetualsInstructions,
  RATE_POWER,
  toLargeNumber,
  // TokenRatios,
} from "@algelabs/sdk";

export class AdminCommands {
  constructor(
    private program: Command,
    private walletManager: WalletManager,
    private configManager: ConfigManager
  ) {
    this.setupCommands();
  }

  private setupCommands() {
    const admin = this.program
      .command("admin")
      .description("Admin commands (requires admin privileges)");

    admin
      .command("init")
      .description("Initialize the perpetuals program")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option(
        "-a, --admins <addresses>",
        "Comma-separated list of admin addresses"
      )
      .option("--min-signatures <number>", "Minimum signatures required", "1")
      .option("--allow-swap", "Allow swap operations", false)
      .option("--allow-add-liquidity", "Allow add liquidity operations", true)
      .option(
        "--allow-remove-liquidity",
        "Allow remove liquidity operations",
        true
      )
      .option("--allow-open-position", "Allow open position operations", true)
      .option("--allow-close-position", "Allow close position operations", true)
      .option("--allow-pnl-withdrawal", "Allow PnL withdrawal operations", true)
      .option(
        "--allow-collateral-withdrawal",
        "Allow collateral withdrawal operations",
        true
      )
      .option("--allow-size-change", "Allow size change operations", true)
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
              name: "admins",
              message: "Admin addresses (comma-separated):",
              default: options.admins || client.wallet.publicKey.toString(),
              when: !options.admins,
              filter: (input: string) =>
                input.split(",").map((addr: string) => addr.trim()),
            },
            {
              type: "number",
              name: "minSignatures",
              message: "Minimum signatures required:",
              default: parseInt(options.minSignatures) || 1,
              when: !options.minSignatures,
            },
            {
              type: "confirm",
              name: "allowSwap",
              message: "Allow swap operations?",
              default: !!options.allowSwap,
              when: options.allowSwap === undefined,
            },
            {
              type: "confirm",
              name: "allowAddLiquidity",
              message: "Allow add liquidity operations?",
              default: !!options.allowAddLiquidity,
              when: options.allowAddLiquidity === undefined,
            },
            {
              type: "confirm",
              name: "allowRemoveLiquidity",
              message: "Allow remove liquidity operations?",
              default: !!options.allowRemoveLiquidity,
              when: options.allowRemoveLiquidity === undefined,
            },
            {
              type: "confirm",
              name: "allowOpenPosition",
              message: "Allow open position operations?",
              default: !!options.allowOpenPosition,
              when: options.allowOpenPosition === undefined,
            },
            {
              type: "confirm",
              name: "allowClosePosition",
              message: "Allow close position operations?",
              default: !!options.allowClosePosition,
              when: options.allowClosePosition === undefined,
            },
            {
              type: "confirm",
              name: "allowPnlWithdrawal",
              message: "Allow PnL withdrawal operations?",
              default: !!options.allowPnlWithdrawal,
              when: options.allowPnlWithdrawal === undefined,
            },
            {
              type: "confirm",
              name: "allowCollateralWithdrawal",
              message: "Allow collateral withdrawal operations?",
              default: !!options.allowCollateralWithdrawal,
              when: options.allowCollateralWithdrawal === undefined,
            },
            {
              type: "confirm",
              name: "allowSizeChange",
              message: "Allow size change operations?",
              default: !!options.allowSizeChange,
              when: options.allowSizeChange === undefined,
            },
          ]);

          const admins = options.admins
            ? options.admins.split(",").map((addr: string) => addr.trim())
            : answers.admins;

          const minSignatures =
            parseInt(options.minSignatures) || answers.minSignatures;
          const permissions = {
            allowSwap:
              options.allowSwap !== undefined
                ? options.allowSwap
                : answers.allowSwap,
            allowAddLiquidity:
              options.allowAddLiquidity !== undefined
                ? options.allowAddLiquidity
                : answers.allowAddLiquidity,
            allowRemoveLiquidity:
              options.allowRemoveLiquidity !== undefined
                ? options.allowRemoveLiquidity
                : answers.allowRemoveLiquidity,
            allowOpenPosition:
              options.allowOpenPosition !== undefined
                ? options.allowOpenPosition
                : answers.allowOpenPosition,
            allowClosePosition:
              options.allowClosePosition !== undefined
                ? options.allowClosePosition
                : answers.allowClosePosition,
            allowPnlWithdrawal:
              options.allowPnlWithdrawal !== undefined
                ? options.allowPnlWithdrawal
                : answers.allowPnlWithdrawal,
            allowCollateralWithdrawal:
              options.allowCollateralWithdrawal !== undefined
                ? options.allowCollateralWithdrawal
                : answers.allowCollateralWithdrawal,
            allowSizeChange:
              options.allowSizeChange !== undefined
                ? options.allowSizeChange
                : answers.allowSizeChange,
          };

          console.log(chalk.bgBlue(client.program.programId.toString()));

          console.log(chalk.blue("\n🚀 Initializing perpetuals program..."));
          console.log(chalk.gray(`Admins: ${admins.join(", ")}`));
          console.log(chalk.gray(`Min signatures: ${minSignatures}`));
          console.log(
            chalk.gray(`Permissions: ${JSON.stringify(permissions, null, 2)}`)
          );

          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const tx = await instructions.init(admins);

          tx.feePayer = client.wallet.publicKey;
          tx.recentBlockhash = (
            await client.connection.getLatestBlockhash()
          ).blockhash;

          const { signature } = await client.wallet.signAndSendTransaction(tx);
          console.log(
            chalk.green(
              `✅ Perpetuals program initialized! Transaction: ${signature}`
            )
          );
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });

    admin
      .command("add-pool <name>")
      .description("Add a new pool")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .action(async (name, options) => {
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
              name: "poolName",
              message: "Pool name:",
              default: name,
              when: !name,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Pool name is required";
                }
                if (input.length > 64) {
                  return "Pool name must be 64 characters or less";
                }
                return true;
              },
            },
          ]);

          const poolName = name || answers.poolName;

          console.log(chalk.blue(`\n🏊 Adding pool: ${poolName}`));
          console.log(
            chalk.gray(
              `Environment: ${options.environment || this.configManager.getDefaultEnvironment()}`
            )
          );

          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const tx = await instructions.addPool(poolName);

          tx.feePayer = client.wallet.publicKey;
          tx.recentBlockhash = (
            await client.connection.getLatestBlockhash()
          ).blockhash;

          const { signature } = await client.wallet.signAndSendTransaction(tx);
          console.log(
            chalk.green(`✅ Pool added successfully! Transaction: ${signature}`)
          );
        } catch (error) {
          console.error(chalk.red("❌ Error adding pool:"), error);
          process.exit(1);
        }
      });

    admin
      .command("remove-pool <name>")
      .description("Remove a pool")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-y, --yes", "Skip confirmation prompt")
      .action(async (name, options) => {
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
              name: "poolName",
              message: "Pool name to remove:",
              default: name,
              when: !name,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Pool name is required";
                }
                return true;
              },
            },
            {
              type: "confirm",
              name: "confirm",
              message: (answers: any) =>
                `Are you sure you want to remove pool "${answers.poolName || name}"? This action cannot be undone.`,
              default: false,
              when: !options.yes,
            },
          ]);

          const poolName = name || answers.poolName;

          // Check confirmation
          if (!options.yes && !answers.confirm) {
            console.log(chalk.yellow("❌ Pool removal cancelled"));
            return;
          }

          console.log(chalk.blue(`\n🏊 Removing pool: ${poolName}`));
          console.log(
            chalk.gray(
              `Environment: ${options.environment || this.configManager.getDefaultEnvironment()}`
            )
          );
          console.log(chalk.yellow("⚠️  This action cannot be undone!"));

          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const tx = await instructions.removePool(poolName);

          tx.feePayer = client.wallet.publicKey;
          tx.recentBlockhash = (
            await client.connection.getLatestBlockhash()
          ).blockhash;

          const { signature } = await client.wallet.signAndSendTransaction(tx);
          console.log(
            chalk.green(
              `✅ Pool removed successfully! Transaction: ${signature}`
            )
          );
        } catch (error) {
          console.error(chalk.red("❌ Error removing pool:"), error);
          process.exit(1);
        }
      });

    admin
      .command("liquidate")
      .description("Liquidate a position")
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
      .option("-w, --wallet <address>", "Wallet address to liquidate")
      .option(
        "--receiving-account <address>",
        "Receiving account for liquidated funds"
      )
      .option("--rewards-account <address>", "Rewards receiving account")
      .option("--feed-id <feed>", "Feed ID")
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
                return true;
              },
            },
            {
              type: "input",
              name: "collateral",
              message: "Collateral mint address:",
              default: options.collateral,
              when: !options.collateral,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Collateral mint address is required";
                }
                return true;
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
              name: "wallet",
              message: "Wallet address to liquidate:",
              default: options.wallet,
              when: !options.wallet,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Wallet address is required";
                }
                return true;
              },
            },
            {
              type: "input",
              name: "receivingAccount",
              message: "Receiving account for liquidated funds:",
              default:
                options.receivingAccount || client.wallet.publicKey.toString(),
              when: !options.receivingAccount,
            },
            {
              type: "input",
              name: "rewardsAccount",
              message: "Rewards receiving account:",
              default:
                options.rewardsAccount || client.wallet.publicKey.toString(),
              when: !options.rewardsAccount,
            },
            {
              type: "input",
              name: "feedId",
              message: "Feed ID:",
              default: options.feedId || "default-feed-id",
              when: !options.feedId,
            },
            {
              type: "confirm",
              name: "confirm",
              message: (answers: any) => {
                const pool = options.pool || answers.pool;
                const token = options.token || answers.token;
                const side = options.side || answers.side;
                const wallet = options.wallet || answers.wallet;
                return `Are you sure you want to liquidate the ${side} position for ${token} in pool ${pool} for wallet ${wallet}?`;
              },
              default: false,
            },
          ]);

          const pool = options.pool || answers.pool;
          const token = options.token || answers.token;
          const collateral = options.collateral || answers.collateral;
          const side = (options.side || answers.side) as
            | "none"
            | "long"
            | "short";
          const wallet = options.wallet || answers.wallet;
          const receivingAccount =
            options.receivingAccount || answers.receivingAccount;
          const rewardsAccount =
            options.rewardsAccount || answers.rewardsAccount;
          const feedId = options.feedId || answers.feedId;

          // Check confirmation
          if (!answers.confirm) {
            console.log(chalk.yellow("❌ Liquidation cancelled"));
            return;
          }

          console.log(chalk.blue("\n💀 Liquidating position..."));
          console.log(chalk.gray(`Pool: ${pool}`));
          console.log(chalk.gray(`Token: ${token}`));
          console.log(chalk.gray(`Collateral: ${collateral}`));
          console.log(chalk.gray(`Side: ${side}`));
          console.log(chalk.gray(`Target wallet: ${wallet}`));
          console.log(chalk.gray(`Receiving account: ${receivingAccount}`));
          console.log(chalk.gray(`Rewards account: ${rewardsAccount}`));
          console.log(chalk.gray(`Feed ID: ${feedId}`));

          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const tx = await instructions.liquidate(
            pool,
            token,
            collateral,
            side,
            receivingAccount,
            rewardsAccount,
            feedId
          );

          tx.feePayer = client.wallet.publicKey;
          tx.recentBlockhash = (
            await client.connection.getLatestBlockhash()
          ).blockhash;

          const { signature } = await client.wallet.signAndSendTransaction(tx);
          console.log(
            chalk.green(
              `✅ Position liquidated successfully! Transaction: ${signature}`
            )
          );
        } catch (error) {
          console.error(chalk.red("❌ Error liquidating position:"), error);
          process.exit(1);
        }
      });

    admin
      .command("add-custody")
      .description("Add custody to a pool")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-p, --pool <name>", "Pool name")
      .option("-t, --token <mint>", "Token mint address")
      .option("--is-stable", "Is stable token")
      .option("--is-virtual", "Is virtual token")
      .option("--feed-id <feed>", "Oracle feed ID")
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
              type: "confirm",
              name: "isVirtual",
              message: "Is this a virtual token?",
              default: !!options.isVirtual,
              when: options.isVirtual === undefined,
            },
            {
              type: "input",
              name: "token",
              message: "Token mint address:",
              default: options.token,
              when: (answers) => {
                const isVirtual =
                  options.isVirtual !== undefined
                    ? options.isVirtual
                    : answers.isVirtual;
                return !isVirtual && !options.token;
              },
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Token mint address is required for non-virtual custody";
                }
                return true;
              },
            },
            {
              type: "confirm",
              name: "isStable",
              message: "Is this a stable token?",
              default: !!options.isStable,
              when: options.isStable === undefined,
            },
            {
              type: "list",
              name: "oracleType",
              message: "Oracle type:",
              choices: ["none", "custom", "pyth"],
              default: "pyth",
              when: !options.oracleType,
            },
            {
              type: "input",
              name: "oracleAuthority",
              message: "Oracle authority pubkey:",
              when: !options.oracleAuthority,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Oracle authority pubkey is required";
                }
                return true;
              },
            },
            {
              type: "number",
              name: "maxPriceError",
              message: "Max price error:",
              default: 1,
              when: !options.maxPriceError,
            },
            {
              type: "number",
              name: "maxPriceAgeSec",
              message: "Max price age (sec):",
              default: 3,
              when: !options.maxPriceAgeSec,
            },
            {
              type: "input",
              name: "feedId",
              message: "Oracle feed ID (hex string):",
              default: options.feedId || "",
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Oracle feed ID is required";
                }
                return true;
              },
            },
            // Pricing config
            {
              type: "confirm",
              name: "useEma",
              message: "Use EMA for pricing?",
              default: true,
            },
            {
              type: "confirm",
              name: "useUnrealizedPnlInAum",
              message: "Use unrealized PnL in AUM?",
              default: true,
            },
            {
              type: "number",
              name: "tradeSpreadLong",
              message: "Trade spread long (basis points):",
              default: 20, // 0.2% in basis points
            },
            {
              type: "number",
              name: "tradeSpreadShort",
              message: "Trade spread short (basis points):",
              default: 40, // 0.4% in basis points
            },
            {
              type: "number",
              name: "swapSpread",
              message: "Swap spread (basis points):",
              default: 50, // 0.5% in basis points
            },
            {
              type: "number",
              name: "minInitialLeverage",
              message: "Min initial leverage (%):",
              default: 100, // 100% (will become 10000 after conversion)
            },
            {
              type: "number",
              name: "maxInitialLeverage",
              message: "Max initial leverage (%):",
              default: 150, // 150% (will become 15000 after conversion)
            },
            {
              type: "number",
              name: "maxLeverage",
              message: "Max leverage (%):",
              default: 200, // 200% (will become 20000 after conversion)
            },
            {
              type: "number",
              name: "maxPayoffMult",
              message: "Max payoff multiplier (%):",
              default: 100, // 100% (will become 10000 after conversion)
            },
            {
              type: "number",
              name: "maxUtilization",
              message: "Max utilization:",
              default: 80, // 0.8% in basis points (will become 8000 after conversion)
            },
            {
              type: "number",
              name: "maxPositionLockedUsd",
              message: "Max position locked USD:",
              default: 10000,
            },
            {
              type: "number",
              name: "maxTotalLockedUsd",
              message: "Max total locked USD:",
              default: 100_000,
            },
            // Permissions
            {
              type: "confirm",
              name: "allowSwap",
              message: "Allow swap?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowAddLiquidity",
              message: "Allow add liquidity?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowRemoveLiquidity",
              message: "Allow remove liquidity?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowOpenPosition",
              message: "Allow open position?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowClosePosition",
              message: "Allow close position?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowPnlWithdrawal",
              message: "Allow PnL withdrawal?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowCollateralWithdrawal",
              message: "Allow collateral withdrawal?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowSizeChange",
              message: "Allow size change?",
              default: true,
            },
            // Fees config
            {
              type: "list",
              name: "feesMode",
              message: "Fees mode:",
              choices: ["fixed", "linear", "optimal"],
              default: "fixed",
            },
            {
              type: "number",
              name: "ratioMult",
              message: "Ratio multiplier:",
              default: 20,
            },
            {
              type: "number",
              name: "utilizationMult",
              message: "Utilization multiplier:",
              default: 20,
            },
            {
              type: "number",
              name: "swapIn",
              message: "Swap in fee:",
              default: 10,
            },
            {
              type: "number",
              name: "swapOut",
              message: "Swap out fee:",
              default: 10,
            },
            {
              type: "number",
              name: "stableSwapIn",
              message: "Stable swap in fee:",
              default: 10,
            },
            {
              type: "number",
              name: "stableSwapOut",
              message: "Stable swap out fee:",
              default: 10,
            },
            {
              type: "number",
              name: "addLiquidity",
              message: "Add liquidity fee:",
              default: 10,
            },
            {
              type: "number",
              name: "removeLiquidity",
              message: "Remove liquidity fee:",
              default: 20,
            },
            {
              type: "number",
              name: "openPosition",
              message: "Open position fee:",
              default: 30,
            },
            {
              type: "number",
              name: "closePosition",
              message: "Close position fee:",
              default: 35,
            },
            {
              type: "number",
              name: "liquidation",
              message: "Liquidation fee:",
              default: 50,
            },
            {
              type: "number",
              name: "protocolShare",
              message: "Protocol share:",
              default: 35,
            },
            {
              type: "number",
              name: "feeMax",
              message: "Fee max:",
              default: 50,
            },
            {
              type: "number",
              name: "feeOptimal",
              message: "Fee optimal:",
              default: 25,
            },
            // Borrow rate config
            {
              type: "number",
              name: "baseRate",
              message: "Base borrow rate:",
              default: 10,
            },
            {
              type: "number",
              name: "slope1",
              message: "Borrow rate slope 1:",
              default: 800,
            },
            {
              type: "number",
              name: "slope2",
              message: "Borrow rate slope 2:",
              default: 1200,
            },
            {
              type: "number",
              name: "optimalUtilization",
              message: "Optimal utilization:",
              default: 800,
            },
            // Ratios config
            {
              type: "input",
              name: "ratios",
              message:
                "Token ratios (target,min,max; separate multiple with |):",
              default: "10000,10,10000",
              filter: (input: string) =>
                input.split("|").map((r: string) => {
                  const [target, min, max] = r.split(",").map(Number);
                  return { target, min, max };
                }),
            },
            {
              type: "confirm",
              name: "confirm",
              message: (answers: any) => {
                const pool = options.pool || answers.pool;
                const token = options.token || answers.token;
                const isStable =
                  options.isStable !== undefined
                    ? options.isStable
                    : answers.isStable;
                const isVirtual =
                  options.isVirtual !== undefined
                    ? options.isVirtual
                    : answers.isVirtual;
                return `Are you sure you want to add custody for token ${token} to pool ${pool}? (Stable: ${isStable}, Virtual: ${isVirtual})`;
              },
              default: false,
              when: !options.yes,
            },
          ]);

          const pool = options.pool || answers.pool;
          const token = options.token || answers.token;
          const isStable =
            options.isStable !== undefined
              ? options.isStable
              : answers.isStable;
          const isVirtual =
            options.isVirtual !== undefined
              ? options.isVirtual
              : answers.isVirtual;

          // Check confirmation
          if (!options.yes && !answers.confirm) {
            console.log(chalk.yellow("❌ Custody addition cancelled"));
            return;
          }

          const oracleAccount = client.oracleClient.fetchFeedAccount(
            options.feedId || answers.feedId
          );

          const feedIdBytes = client.oracleClient.hexToBytes32(
            options.feedId || answers.feedId
          );

          const oracleConfig = {
            oracleAccount:
              options.oracleAccount || answers.oracleAccount || oracleAccount,
            oracleType: options.oracleType || answers.oracleType || "pyth",
            oracleAuthority:
              options.oracleAuthority ||
              answers.oracleAuthority ||
              client.wallet.publicKey.toString(),
            maxPriceError: toLargeNumber(
              options.maxPriceError || answers.maxPriceError || 1,
              6
            ),
            maxPriceAgeSec: toLargeNumber(
              options.maxPriceAgeSec || answers.maxPriceAgeSec || 3,
              2
            ),
            feedId: feedIdBytes as number[],
          };

          const pricingConfig = {
            useEma: answers.useEma,
            useUnrealizedPnlInAum: answers.useUnrealizedPnlInAum,
            tradeSpreadLong: toLargeNumber(
              answers.tradeSpreadLong,
              2,
              BPS_POWER
            ),
            tradeSpreadShort: toLargeNumber(
              answers.tradeSpreadShort,
              2,
              BPS_POWER
            ),
            swapSpread: toLargeNumber(answers.swapSpread, 2, BPS_POWER),
            minInitialLeverage: answers.minInitialLeverage * 100, // Convert % to basis points
            maxInitialLeverage: answers.maxInitialLeverage * 100, // Convert % to basis points
            maxLeverage: answers.maxLeverage * 100, // Convert % to basis points
            maxPayoffMult: answers.maxPayoffMult * 100, // Convert % to basis points
            maxUtilization: toLargeNumber(answers.maxUtilization, 2, BPS_POWER),
            maxPositionLockedUsd: toLargeNumber(
              answers.maxPositionLockedUsd,
              6
            ),
            maxTotalLockedUsd: toLargeNumber(answers.maxTotalLockedUsd, 6),
          };

          const permissions = {
            allowSwap: answers.allowSwap,
            allowAddLiquidity: answers.allowAddLiquidity,
            allowRemoveLiquidity: answers.allowRemoveLiquidity,
            allowOpenPosition: answers.allowOpenPosition,
            allowClosePosition: answers.allowClosePosition,
            allowPnlWithdrawal: answers.allowPnlWithdrawal,
            allowCollateralWithdrawal: answers.allowCollateralWithdrawal,
            allowSizeChange: answers.allowSizeChange,
          };

          const feesConfig = {
            mode: answers.feesMode,
            ratioMult: answers.ratioMult,
            utilizationMult: answers.utilizationMult,
            swapIn: toLargeNumber(answers.swapIn, 2, BPS_POWER),
            swapOut: toLargeNumber(answers.swapOut, 2, BPS_POWER),
            stableSwapIn: toLargeNumber(answers.stableSwapIn, 2, BPS_POWER),
            stableSwapOut: toLargeNumber(answers.stableSwapOut, 2, BPS_POWER),
            addLiquidity: toLargeNumber(answers.addLiquidity, 2, BPS_POWER),
            removeLiquidity: toLargeNumber(
              answers.removeLiquidity,
              2,
              BPS_POWER
            ),
            openPosition: toLargeNumber(answers.openPosition, 2, BPS_POWER),
            closePosition: toLargeNumber(answers.closePosition, 2, BPS_POWER),
            liquidation: toLargeNumber(answers.liquidation, 2, BPS_POWER),
            protocolShare: toLargeNumber(answers.protocolShare, 2, BPS_POWER),
            feeMax: toLargeNumber(answers.feeMax, 2, BPS_POWER),
            feeOptimal: toLargeNumber(answers.feeOptimal, 2, BPS_POWER),
          };

          const borrowRateConfig = {
            baseRate: toLargeNumber(answers.baseRate, 2, RATE_POWER),
            slope1: toLargeNumber(answers.slope1, 2, RATE_POWER),
            slope2: toLargeNumber(answers.slope2, 2, RATE_POWER),
            optimalUtilization: toLargeNumber(
              answers.optimalUtilization,
              6,
              RATE_POWER
            ),
          };

          const ratiosConfig = answers.ratios;

          // Validate ratios
          if (!ratiosConfig || ratiosConfig.length === 0) {
            throw new Error("At least one ratio configuration is required");
          }

          // Validate each ratio
          for (const ratio of ratiosConfig) {
            if (ratio.target <= 0 || ratio.min <= 0 || ratio.max <= 0) {
              throw new Error("Ratio values must be positive");
            }
            if (ratio.min > ratio.target || ratio.target > ratio.max) {
              throw new Error("Ratio must satisfy: min <= target <= max");
            }
            if (
              ratio.target > 10000 ||
              ratio.min > 10000 ||
              ratio.max > 10000
            ) {
              throw new Error("Ratio values must be <= 10000 (BPS_POWER)");
            }
          }

          console.log(chalk.blue(`\n🏦 Adding custody to pool: ${pool}`));
          console.log(chalk.gray(`Token: ${token}`));
          console.log(chalk.gray(`Stable: ${isStable}`));
          console.log(chalk.gray(`Virtual: ${isVirtual}`));
          console.log(chalk.gray(`Oracle type: ${oracleConfig.oracleType}`));
          console.log(
            chalk.gray(
              `Environment: ${options.environment || this.configManager.getDefaultEnvironment()}`
            )
          );

          // Debug pricing config
          console.log(chalk.yellow("\n🔍 DEBUG - Pricing Config Values:"));
          console.log(
            chalk.gray(
              `  minInitialLeverage: ${pricingConfig.minInitialLeverage}`
            )
          );
          console.log(
            chalk.gray(
              `  maxInitialLeverage: ${pricingConfig.maxInitialLeverage}`
            )
          );
          console.log(
            chalk.gray(`  maxLeverage: ${pricingConfig.maxLeverage}`)
          );
          console.log(
            chalk.gray(`  tradeSpreadLong: ${pricingConfig.tradeSpreadLong}`)
          );
          console.log(
            chalk.gray(`  tradeSpreadShort: ${pricingConfig.tradeSpreadShort}`)
          );
          console.log(chalk.gray(`  swapSpread: ${pricingConfig.swapSpread}`));
          console.log(
            chalk.gray(`  maxUtilization: ${pricingConfig.maxUtilization}`)
          );
          console.log(
            chalk.gray(
              `  maxPositionLockedUsd: ${pricingConfig.maxPositionLockedUsd}`
            )
          );
          console.log(
            chalk.gray(
              `  maxTotalLockedUsd: ${pricingConfig.maxTotalLockedUsd}`
            )
          );

          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const { transaction: tx, mint } = await instructions.addCustody(
            pool,
            isStable,
            isVirtual,
            oracleConfig,
            pricingConfig,
            permissions,
            feesConfig,
            borrowRateConfig,
            ratiosConfig,
            token
          );

          tx.feePayer = client.wallet.publicKey;
          tx.recentBlockhash = (
            await client.connection.getLatestBlockhash()
          ).blockhash;

          const signers = [client.wallet.payer];

          if (mint) {
            signers.push(mint);
          }

          const { signature } = await client.wallet.signAndSendTransaction(
            tx,
            signers
          );
          console.log(
            chalk.green(
              `✅ Custody added successfully! Transaction: ${signature}`
            )
          );
        } catch (error) {
          console.error(chalk.red("❌ Error adding custody:"), error);
          process.exit(1);
        }
      });

    admin
      .command("create-usdc-mint")
      .description("Create a USDC mint for testing")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-y, --yes", "Skip confirmation prompt")
      .action(async (options) => {
        try {
          const inquirer = await import("inquirer");
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          // Prompt for confirmation
          const answers = await inquirer.default.prompt([
            {
              type: "confirm",
              name: "confirm",
              message: "Are you sure you want to create a USDC mint?",
              default: false,
              when: !options.yes,
            },
          ]);

          // Check confirmation
          if (!options.yes && !answers.confirm) {
            console.log(chalk.yellow("❌ USDC mint creation cancelled"));
            return;
          }

          console.log(chalk.blue("\n💰 Creating USDC mint..."));
          console.log(
            chalk.gray(
              `Environment: ${options.environment || this.configManager.getDefaultEnvironment()}`
            )
          );

          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const mint = await instructions.createUSDCMint();

          console.log(chalk.green(`✅ USDC mint created successfully!`));
          console.log(chalk.gray(`Mint address: ${mint.toBase58()}`));
          console.log(chalk.gray(`Decimals: 6`));
        } catch (error) {
          console.error(chalk.red("❌ Error creating USDC mint:"), error);
          process.exit(1);
        }
      });

    admin
      .command("remove-custody")
      .description("Remove custody from a pool")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-p, --pool <name>", "Pool name")
      .option("-t, --token <mint>", "Token mint address")
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
                return true;
              },
            },
            {
              type: "input",
              name: "ratios",
              message:
                "Token ratios (target,min,max; separate multiple with |):",
              default: "5000,10,20000",
              filter: (input: string) =>
                input.split("|").map((r: string) => {
                  const [target, min, max] = r.split(",").map(Number);
                  return { target, min, max };
                }),
            },
            {
              type: "confirm",
              name: "confirm",
              message: (answers: any) => {
                const pool = options.pool || answers.pool;
                const token = options.token || answers.token;
                return `Are you sure you want to remove custody for token ${token} from pool ${pool}? This action cannot be undone.`;
              },
              default: false,
              when: !options.yes,
            },
          ]);

          const pool = options.pool || answers.pool;
          const token = options.token || answers.token;
          const ratiosConfig = [] as {
            target: number;
            min: number;
            max: number;
          }[]; /*answers.ratios */

          // Check confirmation
          if (!options.yes && !answers.confirm) {
            console.log(chalk.yellow("❌ Custody removal cancelled"));
            return;
          }

          console.log(chalk.blue(`\n🏦 Removing custody from pool: ${pool}`));
          console.log(chalk.gray(`Token: ${token}`));
          console.log(chalk.yellow("⚠️  This action cannot be undone!"));
          console.log(
            chalk.gray(
              `Environment: ${options.environment || this.configManager.getDefaultEnvironment()}`
            )
          );

          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const tx = await instructions.removeCustody(
            ratiosConfig,
            pool,
            token
          );

          tx.feePayer = client.wallet.publicKey;
          tx.recentBlockhash = (
            await client.connection.getLatestBlockhash()
          ).blockhash;

          const { signature } = await client.wallet.signAndSendTransaction(tx);
          console.log(
            chalk.green(
              `✅ Custody removed successfully! Transaction: ${signature}`
            )
          );
        } catch (error) {
          console.error(chalk.red("❌ Error removing custody:"), error);
          process.exit(1);
        }
      });

    admin
      .command("set-custody-config")
      .description("Update custody configuration")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-p, --pool <name>", "Pool name")
      .option("-t, --token <mint>", "Token mint address")
      .option("--is-stable", "Is stable token")
      .option("--is-virtual", "Is virtual token")
      .option("--feed-id <feed>", "Oracle feed ID")
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
                return true;
              },
            },
            {
              type: "confirm",
              name: "isVirtual",
              message: "Is this a virtual token?",
              default: !!options.isVirtual,
              when: options.isVirtual === undefined,
            },
            {
              type: "confirm",
              name: "isStable",
              message: "Is this a stable token?",
              default: !!options.isStable,
              when: options.isStable === undefined,
            },
            {
              type: "list",
              name: "oracleType",
              message: "Oracle type:",
              choices: ["none", "custom", "pyth"],
              default: "pyth",
              when: !options.oracleType,
            },
            {
              type: "input",
              name: "oracleAuthority",
              message: "Oracle authority pubkey:",
              when: !options.oracleAuthority,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Oracle authority pubkey is required";
                }
                return true;
              },
            },
            {
              type: "number",
              name: "maxPriceError",
              message: "Max price error:",
              default: 1,
              when: !options.maxPriceError,
            },
            {
              type: "number",
              name: "maxPriceAgeSec",
              message: "Max price age (sec):",
              default: 3,
              when: !options.maxPriceAgeSec,
            },
            {
              type: "input",
              name: "feedId",
              message: "Oracle feed ID (hex string):",
              default: options.feedId || "",
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "Oracle feed ID is required";
                }
                return true;
              },
            },
            // Pricing config
            {
              type: "confirm",
              name: "useEma",
              message: "Use EMA for pricing?",
              default: true,
            },
            {
              type: "confirm",
              name: "useUnrealizedPnlInAum",
              message: "Use unrealized PnL in AUM?",
              default: true,
            },
            {
              type: "number",
              name: "tradeSpreadLong",
              message: "Trade spread long (basis points):",
              default: 20, // 0.2% in basis points
            },
            {
              type: "number",
              name: "tradeSpreadShort",
              message: "Trade spread short (basis points):",
              default: 40, // 0.4% in basis points
            },
            {
              type: "number",
              name: "swapSpread",
              message: "Swap spread (basis points):",
              default: 50, // 0.5% in basis points
            },
            {
              type: "number",
              name: "minInitialLeverage",
              message: "Min initial leverage (%):",
              default: 100, // 100% (will become 10000 after conversion)
            },
            {
              type: "number",
              name: "maxInitialLeverage",
              message: "Max initial leverage (%):",
              default: 150, // 150% (will become 15000 after conversion)
            },
            {
              type: "number",
              name: "maxLeverage",
              message: "Max leverage (%):",
              default: 200, // 200% (will become 20000 after conversion)
            },
            {
              type: "number",
              name: "maxPayoffMult",
              message: "Max payoff multiplier (%):",
              default: 100, // 100% (will become 10000 after conversion)
            },
            {
              type: "number",
              name: "maxUtilization",
              message: "Max utilization:",
              default: 80, // 0.8% in basis points (will become 8000 after conversion)
            },
            {
              type: "number",
              name: "maxPositionLockedUsd",
              message: "Max position locked USD:",
              default: 10000,
            },
            {
              type: "number",
              name: "maxTotalLockedUsd",
              message: "Max total locked USD:",
              default: 100_000,
            },
            // Permissions
            {
              type: "confirm",
              name: "allowSwap",
              message: "Allow swap?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowAddLiquidity",
              message: "Allow add liquidity?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowRemoveLiquidity",
              message: "Allow remove liquidity?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowOpenPosition",
              message: "Allow open position?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowClosePosition",
              message: "Allow close position?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowPnlWithdrawal",
              message: "Allow PnL withdrawal?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowCollateralWithdrawal",
              message: "Allow collateral withdrawal?",
              default: true,
            },
            {
              type: "confirm",
              name: "allowSizeChange",
              message: "Allow size change?",
              default: true,
            },
            // Fees config
            {
              type: "list",
              name: "feesMode",
              message: "Fees mode:",
              choices: ["fixed", "linear", "optimal"],
              default: "fixed",
            },
            {
              type: "number",
              name: "ratioMult",
              message: "Ratio multiplier:",
              default: 20,
            },
            {
              type: "number",
              name: "utilizationMult",
              message: "Utilization multiplier:",
              default: 20,
            },
            {
              type: "number",
              name: "swapIn",
              message: "Swap in fee:",
              default: 10,
            },
            {
              type: "number",
              name: "swapOut",
              message: "Swap out fee:",
              default: 10,
            },
            {
              type: "number",
              name: "stableSwapIn",
              message: "Stable swap in fee:",
              default: 10,
            },
            {
              type: "number",
              name: "stableSwapOut",
              message: "Stable swap out fee:",
              default: 10,
            },
            {
              type: "number",
              name: "addLiquidity",
              message: "Add liquidity fee:",
              default: 10,
            },
            {
              type: "number",
              name: "removeLiquidity",
              message: "Remove liquidity fee:",
              default: 20,
            },
            {
              type: "number",
              name: "openPosition",
              message: "Open position fee:",
              default: 30,
            },
            {
              type: "number",
              name: "closePosition",
              message: "Close position fee:",
              default: 35,
            },
            {
              type: "number",
              name: "liquidation",
              message: "Liquidation fee:",
              default: 50,
            },
            {
              type: "number",
              name: "protocolShare",
              message: "Protocol share:",
              default: 35,
            },
            {
              type: "number",
              name: "feeMax",
              message: "Fee max:",
              default: 50,
            },
            {
              type: "number",
              name: "feeOptimal",
              message: "Fee optimal:",
              default: 25,
            },
            // Borrow rate config
            {
              type: "number",
              name: "baseRate",
              message: "Base borrow rate:",
              default: 10,
            },
            {
              type: "number",
              name: "slope1",
              message: "Borrow rate slope 1:",
              default: 800,
            },
            {
              type: "number",
              name: "slope2",
              message: "Borrow rate slope 2:",
              default: 1200,
            },
            {
              type: "number",
              name: "optimalUtilization",
              message: "Optimal utilization:",
              default: 800,
            },
            // Ratios config
            {
              type: "input",
              name: "ratios",
              message:
                "Token ratios (target,min,max; separate multiple with |):",
              default: "10000,10,10000",
              filter: (input: string) =>
                input.split("|").map((r: string) => {
                  const [target, min, max] = r.split(",").map(Number);
                  return { target, min, max };
                }),
            },
            {
              type: "confirm",
              name: "confirm",
              message: (answers: any) => {
                const pool = options.pool || answers.pool;
                const token = options.token || answers.token;
                const isStable =
                  options.isStable !== undefined
                    ? options.isStable
                    : answers.isStable;
                const isVirtual =
                  options.isVirtual !== undefined
                    ? options.isVirtual
                    : answers.isVirtual;
                return `Are you sure you want to update custody configuration for token ${token} in pool ${pool}? (Stable: ${isStable}, Virtual: ${isVirtual})`;
              },
              default: false,
              when: !options.yes,
            },
          ]);

          const pool = options.pool || answers.pool;
          const token = options.token || answers.token;
          const isStable =
            options.isStable !== undefined
              ? options.isStable
              : answers.isStable;
          const isVirtual =
            options.isVirtual !== undefined
              ? options.isVirtual
              : answers.isVirtual;

          // Check confirmation
          if (!options.yes && !answers.confirm) {
            console.log(chalk.yellow("❌ Custody config update cancelled"));
            return;
          }

          const oracleAccount = client.oracleClient.fetchFeedAccount(
            options.feedId || answers.feedId
          );

          const feedIdBytes = client.oracleClient.hexToBytes32(
            options.feedId || answers.feedId
          );

          const oracleConfig = {
            oracleAccount:
              options.oracleAccount || answers.oracleAccount || oracleAccount,
            oracleType: options.oracleType || answers.oracleType || "pyth",
            oracleAuthority:
              options.oracleAuthority ||
              answers.oracleAuthority ||
              client.wallet.publicKey.toString(),
            maxPriceError: toLargeNumber(
              options.maxPriceError || answers.maxPriceError || 1,
              6
            ),
            maxPriceAgeSec: toLargeNumber(
              options.maxPriceAgeSec || answers.maxPriceAgeSec || 3,
              2
            ),
            feedId: feedIdBytes as number[],
          };

          const pricingConfig = {
            useEma: answers.useEma,
            useUnrealizedPnlInAum: answers.useUnrealizedPnlInAum,
            tradeSpreadLong: toLargeNumber(
              answers.tradeSpreadLong,
              2,
              BPS_POWER
            ),
            tradeSpreadShort: toLargeNumber(
              answers.tradeSpreadShort,
              2,
              BPS_POWER
            ),
            swapSpread: toLargeNumber(answers.swapSpread, 2, BPS_POWER),
            minInitialLeverage: answers.minInitialLeverage * 100, // Convert % to basis points
            maxInitialLeverage: answers.maxInitialLeverage * 100, // Convert % to basis points
            maxLeverage: answers.maxLeverage * 100, // Convert % to basis points
            maxPayoffMult: answers.maxPayoffMult * 100, // Convert % to basis points
            maxUtilization: toLargeNumber(answers.maxUtilization, 2, BPS_POWER),
            maxPositionLockedUsd: toLargeNumber(
              answers.maxPositionLockedUsd,
              6
            ),
            maxTotalLockedUsd: toLargeNumber(answers.maxTotalLockedUsd, 6),
          };

          const permissions = {
            allowSwap: answers.allowSwap,
            allowAddLiquidity: answers.allowAddLiquidity,
            allowRemoveLiquidity: answers.allowRemoveLiquidity,
            allowOpenPosition: answers.allowOpenPosition,
            allowClosePosition: answers.allowClosePosition,
            allowPnlWithdrawal: answers.allowPnlWithdrawal,
            allowCollateralWithdrawal: answers.allowCollateralWithdrawal,
            allowSizeChange: answers.allowSizeChange,
          };

          const feesConfig = {
            mode: answers.feesMode,
            ratioMult: answers.ratioMult,
            utilizationMult: answers.utilizationMult,
            swapIn: toLargeNumber(answers.swapIn, 2, BPS_POWER),
            swapOut: toLargeNumber(answers.swapOut, 2, BPS_POWER),
            stableSwapIn: toLargeNumber(answers.stableSwapIn, 2, BPS_POWER),
            stableSwapOut: toLargeNumber(answers.stableSwapOut, 2, BPS_POWER),
            addLiquidity: toLargeNumber(answers.addLiquidity, 2, BPS_POWER),
            removeLiquidity: toLargeNumber(
              answers.removeLiquidity,
              2,
              BPS_POWER
            ),
            openPosition: toLargeNumber(answers.openPosition, 2, BPS_POWER),
            closePosition: toLargeNumber(answers.closePosition, 2, BPS_POWER),
            liquidation: toLargeNumber(answers.liquidation, 2, BPS_POWER),
            protocolShare: toLargeNumber(answers.protocolShare, 2, BPS_POWER),
            feeMax: toLargeNumber(answers.feeMax, 2, BPS_POWER),
            feeOptimal: toLargeNumber(answers.feeOptimal, 2, BPS_POWER),
          };

          const borrowRateConfig = {
            baseRate: toLargeNumber(answers.baseRate, 2, RATE_POWER),
            slope1: toLargeNumber(answers.slope1, 2, RATE_POWER),
            slope2: toLargeNumber(answers.slope2, 2, RATE_POWER),
            optimalUtilization: toLargeNumber(
              answers.optimalUtilization,
              6,
              RATE_POWER
            ),
          };

          const ratiosConfig = answers.ratios;

          // Validate ratios
          if (!ratiosConfig || ratiosConfig.length === 0) {
            throw new Error("At least one ratio configuration is required");
          }

          // Validate each ratio
          // for (const ratio of ratiosConfig) {
          //   if (ratio.target <= 0 || ratio.min <= 0 || ratio.max <= 0) {
          //     throw new Error("Ratio values must be positive");
          //   }
          //   if (ratio.min > ratio.target || ratio.target > ratio.max) {
          //     throw new Error("Ratio must satisfy: min <= target <= max");
          //   }
          //   if (
          //     ratio.target > 10000 ||
          //     ratio.min > 10000 ||
          //     ratio.max > 10000
          //   ) {
          //     throw new Error("Ratio values must be <= 10000 (BPS_POWER)");
          //   }
          // }

          console.log(
            chalk.blue(`\n⚙️  Updating custody configuration for pool: ${pool}`)
          );
          console.log(chalk.gray(`Token: ${token}`));
          console.log(chalk.gray(`Stable: ${isStable}`));
          console.log(chalk.gray(`Virtual: ${isVirtual}`));
          console.log(chalk.gray(`Oracle type: ${oracleConfig.oracleType}`));
          console.log(
            chalk.gray(
              `Environment: ${options.environment || this.configManager.getDefaultEnvironment()}`
            )
          );

          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const tx = await instructions.setCustodyConfig(
            pool,
            isStable,
            isVirtual,
            oracleConfig,
            pricingConfig,
            permissions,
            feesConfig,
            borrowRateConfig,
            ratiosConfig,
            token
          );

          tx.feePayer = client.wallet.publicKey;
          tx.recentBlockhash = (
            await client.connection.getLatestBlockhash()
          ).blockhash;

          const { signature } = await client.wallet.signAndSendTransaction(tx);
          console.log(
            chalk.green(
              `✅ Custody configuration updated successfully! Transaction: ${signature}`
            )
          );
        } catch (error) {
          console.error(
            chalk.red("❌ Error updating custody configuration:"),
            error
          );
          process.exit(1);
        }
      });
  }
}

// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }
