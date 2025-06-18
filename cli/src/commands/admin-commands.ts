import { Command } from "commander";
import chalk from "chalk";
import { WalletManager } from "../wallet-manager";
import { ConfigManager } from "../config-manager";
import { Environment, PerpetualsInstructions } from "@algelabs/sdk";
import { ComputeBudgetProgram, Transaction } from "@solana/web3.js";

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
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          console.log(chalk.blue(`\n🏊 Adding pool: ${name}`));

          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const ix = await instructions.addPool(name);

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
          console.log(chalk.green(`✅ Pool added! Transaction: ${signature}`));
        } catch (error) {
          console.error(chalk.red("Error:"), error);
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
      .action(async (name, options) => {
        try {
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          console.log(chalk.blue(`\n🏊 Removing pool: ${name}`));

          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const ix = await instructions.removePool(name);

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
            chalk.green(`✅ Pool removed! Transaction: ${signature}`)
          );
        } catch (error) {
          console.error(chalk.red("Error:"), error);
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
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          console.log(chalk.blue("\n💀 Liquidating position..."));

          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const ix = await instructions.liquidate(
            options.pool,
            options.token,
            options.collateral,
            options.side as "none" | "long" | "short",
            options.receivingAccount || client.wallet.publicKey.toString(),
            options.rewardsAccount || client.wallet.publicKey.toString(),
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
            chalk.green(`✅ Position liquidated! Transaction: ${signature}`)
          );
        } catch (error) {
          console.error(chalk.red("Error:"), error);
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
            },
            {
              type: "input",
              name: "token",
              message: "Token mint address:",
              default: options.token,
              when: !options.token,
            },
            {
              type: "confirm",
              name: "isStable",
              message: "Is this a stable token?",
              default: !!options.isStable,
              when: options.isStable === undefined,
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
              name: "oracleAccount",
              message: "Oracle account pubkey:",
              when: !options.oracleAccount,
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
            },
            {
              type: "number",
              name: "maxPriceError",
              message: "Max price error:",
              default: 0,
              when: !options.maxPriceError,
            },
            {
              type: "number",
              name: "maxPriceAgeSec",
              message: "Max price age (sec):",
              default: 60,
              when: !options.maxPriceAgeSec,
            },
            {
              type: "input",
              name: "feedId",
              message: "Oracle feed ID (comma-separated 32 bytes):",
              default: options.feedId || "",
              when: !options.feedId,
              filter: (input: string) =>
                input.split(",").map((v: string) => Number(v.trim())),
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
              message: "Trade spread long:",
              default: 0,
            },
            {
              type: "number",
              name: "tradeSpreadShort",
              message: "Trade spread short:",
              default: 0,
            },
            {
              type: "number",
              name: "swapSpread",
              message: "Swap spread:",
              default: 0,
            },
            {
              type: "number",
              name: "minInitialLeverage",
              message: "Min initial leverage:",
              default: 1,
            },
            {
              type: "number",
              name: "maxInitialLeverage",
              message: "Max initial leverage:",
              default: 10,
            },
            {
              type: "number",
              name: "maxLeverage",
              message: "Max leverage:",
              default: 20,
            },
            {
              type: "number",
              name: "maxPayoffMult",
              message: "Max payoff multiplier:",
              default: 10,
            },
            {
              type: "number",
              name: "maxUtilization",
              message: "Max utilization:",
              default: 1000000,
            },
            {
              type: "number",
              name: "maxPositionLockedUsd",
              message: "Max position locked USD:",
              default: 1000000,
            },
            {
              type: "number",
              name: "maxTotalLockedUsd",
              message: "Max total locked USD:",
              default: 10000000,
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
              default: 1,
            },
            {
              type: "number",
              name: "utilizationMult",
              message: "Utilization multiplier:",
              default: 1,
            },
            {
              type: "number",
              name: "swapIn",
              message: "Swap in fee:",
              default: 0,
            },
            {
              type: "number",
              name: "swapOut",
              message: "Swap out fee:",
              default: 0,
            },
            {
              type: "number",
              name: "stableSwapIn",
              message: "Stable swap in fee:",
              default: 0,
            },
            {
              type: "number",
              name: "stableSwapOut",
              message: "Stable swap out fee:",
              default: 0,
            },
            {
              type: "number",
              name: "addLiquidity",
              message: "Add liquidity fee:",
              default: 0,
            },
            {
              type: "number",
              name: "removeLiquidity",
              message: "Remove liquidity fee:",
              default: 0,
            },
            {
              type: "number",
              name: "openPosition",
              message: "Open position fee:",
              default: 0,
            },
            {
              type: "number",
              name: "closePosition",
              message: "Close position fee:",
              default: 0,
            },
            {
              type: "number",
              name: "liquidation",
              message: "Liquidation fee:",
              default: 0,
            },
            {
              type: "number",
              name: "protocolShare",
              message: "Protocol share:",
              default: 0,
            },
            {
              type: "number",
              name: "feeMax",
              message: "Fee max:",
              default: 0,
            },
            {
              type: "number",
              name: "feeOptimal",
              message: "Fee optimal:",
              default: 0,
            },
            // Borrow rate config
            {
              type: "number",
              name: "baseRate",
              message: "Base borrow rate:",
              default: 0,
            },
            {
              type: "number",
              name: "slope1",
              message: "Borrow rate slope 1:",
              default: 0,
            },
            {
              type: "number",
              name: "slope2",
              message: "Borrow rate slope 2:",
              default: 0,
            },
            {
              type: "number",
              name: "optimalUtilization",
              message: "Optimal utilization:",
              default: 80,
            },
            // Ratios config
            {
              type: "input",
              name: "ratios",
              message:
                "Token ratios (target,min,max; separate multiple with |):",
              default: "1,0.5,2",
              filter: (input: string) =>
                input.split("|").map((r: string) => {
                  const [target, min, max] = r.split(",").map(Number);
                  return { target, min, max };
                }),
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

          const oracleConfig = {
            oracleAccount: options.oracleAccount || answers.oracleAccount,
            oracleType: options.oracleType || answers.oracleType,
            oracleAuthority: options.oracleAuthority || answers.oracleAuthority,
            maxPriceError: options.maxPriceError || answers.maxPriceError,
            maxPriceAgeSec: options.maxPriceAgeSec || answers.maxPriceAgeSec,
            feedId: options.feedId
              ? options.feedId.split(",").map((v: string) => Number(v.trim()))
              : answers.feedId,
          };

          const pricingConfig = {
            useEma: answers.useEma,
            useUnrealizedPnlInAum: answers.useUnrealizedPnlInAum,
            tradeSpreadLong: answers.tradeSpreadLong,
            tradeSpreadShort: answers.tradeSpreadShort,
            swapSpread: answers.swapSpread,
            minInitialLeverage: answers.minInitialLeverage,
            maxInitialLeverage: answers.maxInitialLeverage,
            maxLeverage: answers.maxLeverage,
            maxPayoffMult: answers.maxPayoffMult,
            maxUtilization: answers.maxUtilization,
            maxPositionLockedUsd: answers.maxPositionLockedUsd,
            maxTotalLockedUsd: answers.maxTotalLockedUsd,
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
            swapIn: answers.swapIn,
            swapOut: answers.swapOut,
            stableSwapIn: answers.stableSwapIn,
            stableSwapOut: answers.stableSwapOut,
            addLiquidity: answers.addLiquidity,
            removeLiquidity: answers.removeLiquidity,
            openPosition: answers.openPosition,
            closePosition: answers.closePosition,
            liquidation: answers.liquidation,
            protocolShare: answers.protocolShare,
            feeMax: answers.feeMax,
            feeOptimal: answers.feeOptimal,
          };

          const borrowRateConfig = {
            baseRate: answers.baseRate,
            slope1: answers.slope1,
            slope2: answers.slope2,
            optimalUtilization: answers.optimalUtilization,
          };

          const ratiosConfig = answers.ratios;

          console.log(chalk.blue(`\n🏦 Adding custody to pool: ${pool}`));

          const instructions = new PerpetualsInstructions(
            client,
            client.oracleClient
          );
          const ix = await instructions.addCustody(
            pool,
            token,
            isStable,
            isVirtual,
            oracleConfig,
            pricingConfig,
            permissions,
            feesConfig,
            borrowRateConfig,
            ratiosConfig
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
            chalk.green(`✅ Custody added! Transaction: ${signature}`)
          );
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });
  }
}
