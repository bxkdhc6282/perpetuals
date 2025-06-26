import { Command } from "commander";
import chalk from "chalk";
import { WalletManager } from "../wallet-manager";
import { ConfigManager } from "../config-manager";
import { Environment, Position } from "@algelabs/sdk";
import { AssetManager } from "@algelabs/sdk";

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
              console.log(`   LP Token Bump: ${pool.lpTokenBump}`);
              console.log(
                `   Inception Time: ${new Date(pool.inceptionTime.toNumber() * 1000)}`
              );

              // Display ratios in a readable format
              if (pool.ratios && pool.ratios.length > 0) {
                console.log(chalk.yellow(`   Token Ratios:`));
                pool.ratios.forEach((ratio, ratioIndex) => {
                  if (ratio) {
                    const targetPercent = (
                      ratio.target.toNumber() / 100
                    ).toFixed(2);
                    const minPercent = (ratio.min.toNumber() / 100).toFixed(2);
                    const maxPercent = (ratio.max.toNumber() / 100).toFixed(2);

                    console.log(
                      `     ${ratioIndex + 1}. Target: ${targetPercent}% | Min: ${minPercent}% | Max: ${maxPercent}%`
                    );
                  }
                });
              } else {
                console.log(chalk.gray(`   Token Ratios: Not configured`));
              }
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
      .command("custodies <poolName>")
      .description("List all custodies in a pool")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .action(async (poolName, options) => {
        try {
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          const custodies = await client.getCustodies(poolName);
          console.log(chalk.blue(`\n🏦 Custodies in Pool: ${poolName}`));

          if (custodies.length === 0) {
            console.log(chalk.yellow("No custodies found"));
          } else {
            custodies.forEach((custody, index) => {
              if (custody) {
                console.log(chalk.green(`\n${index + 1}. Custody Details:`));
                console.log(`   Mint: ${custody.mint.toString()}`);
                console.log(
                  `   Token Account: ${custody.tokenAccount.toString()}`
                );
                console.log(`   Decimals: ${custody.decimals}`);
                console.log(`   Is Stable: ${custody.isStable}`);
                console.log(`   Is Virtual: ${custody.isVirtual}`);
                console.log(
                  `   Oracle Account: ${custody.oracle.oracleAccount.toString()}`
                );
                console.log(
                  `   Oracle Type: ${Object.keys(custody.oracle.oracleType)[0]}`
                );
                console.log(
                  `   Max Price Error: ${custody.oracle.maxPriceError.toString()}`
                );
                console.log(
                  `   Max Price Age: ${custody.oracle.maxPriceAgeSec} seconds`
                );

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

                // Volume stats
                console.log(`   Volume Stats:`);
                console.log(
                  `     Swap USD: ${custody.volumeStats.swapUsd.toString()}`
                );
                console.log(
                  `     Add Liquidity USD: ${custody.volumeStats.addLiquidityUsd.toString()}`
                );
                console.log(
                  `     Remove Liquidity USD: ${custody.volumeStats.removeLiquidityUsd.toString()}`
                );
                console.log(
                  `     Open Position USD: ${custody.volumeStats.openPositionUsd.toString()}`
                );
                console.log(
                  `     Close Position USD: ${custody.volumeStats.closePositionUsd.toString()}`
                );
                console.log(
                  `     Liquidation USD: ${custody.volumeStats.liquidationUsd.toString()}`
                );

                // Collected fees
                console.log(`   Collected Fees:`);
                console.log(
                  `     Swap USD: ${custody.collectedFees.swapUsd.toString()}`
                );
                console.log(
                  `     Add Liquidity USD: ${custody.collectedFees.addLiquidityUsd.toString()}`
                );
                console.log(
                  `     Remove Liquidity USD: ${custody.collectedFees.removeLiquidityUsd.toString()}`
                );
                console.log(
                  `     Open Position USD: ${custody.collectedFees.openPositionUsd.toString()}`
                );
                console.log(
                  `     Close Position USD: ${custody.collectedFees.closePositionUsd.toString()}`
                );
                console.log(
                  `     Liquidation USD: ${custody.collectedFees.liquidationUsd.toString()}`
                );
              }
            });
          }
        } catch (error) {
          console.error(chalk.red("Error:"), error);
        }
      });

    info
      .command("custody <poolName> <tokenMint>")
      .description("Get detailed custody information")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .action(async (poolName, tokenMint, options) => {
        try {
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          const { PublicKey } = await import("@solana/web3.js");
          const custody = await client.getCustody(
            poolName,
            new PublicKey(tokenMint)
          );

          console.log(chalk.blue(`\n🏦 Custody Details:`));
          console.log(`Pool: ${poolName}`);
          console.log(`Token Mint: ${custody.mint.toString()}`);
          console.log(`Token Account: ${custody.tokenAccount.toString()}`);
          console.log(`Decimals: ${custody.decimals}`);
          console.log(`Is Stable: ${custody.isStable}`);
          console.log(`Is Virtual: ${custody.isVirtual}`);

          // Oracle information
          console.log(chalk.yellow(`\n📡 Oracle Configuration:`));
          console.log(
            `Oracle Account: ${custody.oracle.oracleAccount.toString()}`
          );
          console.log(
            `Oracle Type: ${Object.keys(custody.oracle.oracleType)[0]}`
          );
          console.log(
            `Oracle Authority: ${custody.oracle.oracleAuthority.toString()}`
          );
          console.log(
            `Max Price Error: ${custody.oracle.maxPriceError.toString()}`
          );
          console.log(
            `Max Price Age: ${custody.oracle.maxPriceAgeSec} seconds`
          );
          console.log(`Feed ID: [${custody.oracle.feedId.join(", ")}]`);

          // Pricing configuration
          console.log(chalk.yellow(`\n💰 Pricing Configuration:`));
          console.log(`Use EMA: ${custody.pricing.useEma}`);
          console.log(
            `Use Unrealized PnL in AUM: ${custody.pricing.useUnrealizedPnlInAum}`
          );
          console.log(
            `Trade Spread Long: ${custody.pricing.tradeSpreadLong.toString()}`
          );
          console.log(
            `Trade Spread Short: ${custody.pricing.tradeSpreadShort.toString()}`
          );
          console.log(`Swap Spread: ${custody.pricing.swapSpread.toString()}`);
          console.log(
            `Min Initial Leverage: ${custody.pricing.minInitialLeverage.toString()}`
          );
          console.log(
            `Max Initial Leverage: ${custody.pricing.maxInitialLeverage.toString()}`
          );
          console.log(
            `Max Leverage: ${custody.pricing.maxLeverage.toString()}`
          );
          console.log(
            `Max Payoff Multiplier: ${custody.pricing.maxPayoffMult.toString()}`
          );
          console.log(
            `Max Utilization: ${custody.pricing.maxUtilization.toString()}`
          );
          console.log(
            `Max Position Locked USD: ${custody.pricing.maxPositionLockedUsd.toString()}`
          );
          console.log(
            `Max Total Locked USD: ${custody.pricing.maxTotalLockedUsd.toString()}`
          );

          // Permissions
          console.log(chalk.yellow(`\n🔐 Permissions:`));
          console.log(`Allow Swap: ${custody.permissions.allowSwap}`);
          console.log(
            `Allow Add Liquidity: ${custody.permissions.allowAddLiquidity}`
          );
          console.log(
            `Allow Remove Liquidity: ${custody.permissions.allowRemoveLiquidity}`
          );
          console.log(
            `Allow Open Position: ${custody.permissions.allowOpenPosition}`
          );
          console.log(
            `Allow Close Position: ${custody.permissions.allowClosePosition}`
          );
          console.log(
            `Allow PnL Withdrawal: ${custody.permissions.allowPnlWithdrawal}`
          );
          console.log(
            `Allow Collateral Withdrawal: ${custody.permissions.allowCollateralWithdrawal}`
          );
          console.log(
            `Allow Size Change: ${custody.permissions.allowSizeChange}`
          );

          // Fees configuration
          console.log(chalk.yellow(`\n💸 Fees Configuration:`));
          console.log(`Fee Mode: ${Object.keys(custody.fees.mode)[0]}`);
          console.log(`Ratio Multiplier: ${custody.fees.ratioMult.toString()}`);
          console.log(
            `Utilization Multiplier: ${custody.fees.utilizationMult.toString()}`
          );
          console.log(`Swap In Fee: ${custody.fees.swapIn.toString()}`);
          console.log(`Swap Out Fee: ${custody.fees.swapOut.toString()}`);
          console.log(
            `Stable Swap In Fee: ${custody.fees.stableSwapIn.toString()}`
          );
          console.log(
            `Stable Swap Out Fee: ${custody.fees.stableSwapOut.toString()}`
          );
          console.log(
            `Add Liquidity Fee: ${custody.fees.addLiquidity.toString()}`
          );
          console.log(
            `Remove Liquidity Fee: ${custody.fees.removeLiquidity.toString()}`
          );
          console.log(
            `Open Position Fee: ${custody.fees.openPosition.toString()}`
          );
          console.log(
            `Close Position Fee: ${custody.fees.closePosition.toString()}`
          );
          console.log(
            `Liquidation Fee: ${custody.fees.liquidation.toString()}`
          );
          console.log(
            `Protocol Share: ${custody.fees.protocolShare.toString()}`
          );
          console.log(`Fee Max: ${custody.fees.feeMax.toString()}`);
          console.log(`Fee Optimal: ${custody.fees.feeOptimal.toString()}`);

          // Borrow rate configuration
          console.log(chalk.yellow(`\n📈 Borrow Rate Configuration:`));
          console.log(`Base Rate: ${custody.borrowRate.baseRate.toString()}`);
          console.log(`Slope 1: ${custody.borrowRate.slope1.toString()}`);
          console.log(`Slope 2: ${custody.borrowRate.slope2.toString()}`);
          console.log(
            `Optimal Utilization: ${custody.borrowRate.optimalUtilization.toString()}`
          );

          // Assets
          console.log(chalk.yellow(`\n💼 Assets:`));
          console.log(`Locked: ${custody.assets.locked.toString()}`);
          console.log(`Owned: ${custody.assets.owned.toString()}`);
          console.log(`Collateral: ${custody.assets.collateral.toString()}`);
          console.log(
            `Protocol Fees: ${custody.assets.protocolFees.toString()}`
          );

          // Volume stats
          console.log(chalk.yellow(`\n📊 Volume Statistics:`));
          console.log(`Swap USD: ${custody.volumeStats.swapUsd.toString()}`);
          console.log(
            `Add Liquidity USD: ${custody.volumeStats.addLiquidityUsd.toString()}`
          );
          console.log(
            `Remove Liquidity USD: ${custody.volumeStats.removeLiquidityUsd.toString()}`
          );
          console.log(
            `Open Position USD: ${custody.volumeStats.openPositionUsd.toString()}`
          );
          console.log(
            `Close Position USD: ${custody.volumeStats.closePositionUsd.toString()}`
          );
          console.log(
            `Liquidation USD: ${custody.volumeStats.liquidationUsd.toString()}`
          );

          // Collected fees
          console.log(chalk.yellow(`\n💰 Collected Fees:`));
          console.log(`Swap USD: ${custody.collectedFees.swapUsd.toString()}`);
          console.log(
            `Add Liquidity USD: ${custody.collectedFees.addLiquidityUsd.toString()}`
          );
          console.log(
            `Remove Liquidity USD: ${custody.collectedFees.removeLiquidityUsd.toString()}`
          );
          console.log(
            `Open Position USD: ${custody.collectedFees.openPositionUsd.toString()}`
          );
          console.log(
            `Close Position USD: ${custody.collectedFees.closePositionUsd.toString()}`
          );
          console.log(
            `Liquidation USD: ${custody.collectedFees.liquidationUsd.toString()}`
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

    info
      .command("get-oracle-price")
      .description("Get oracle price for a token")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-p, --pool <name>", "Pool name")
      .option("-t, --token <symbol>", "Token symbol (e.g., BTC, ETH, SOL)")
      .option("--ema", "Return EMA price instead of spot price")
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
              type: "confirm",
              name: "ema",
              message: "Use EMA price instead of spot price?",
              default: options.ema || false,
              when: options.ema === undefined,
            },
          ]);

          const pool = options.pool || answers.pool;
          const tokenSymbol = (options.token || answers.token)
            .trim()
            .toUpperCase();
          const useEma = options.ema !== undefined ? options.ema : answers.ema;

          // Get asset information from AssetManager
          const tokenAsset = assetManager.getAssetBySymbol(tokenSymbol);

          console.log(chalk.blue("\n📊 Getting oracle price..."));
          console.log(chalk.gray(`Pool: ${pool}`));
          console.log(chalk.gray(`Token: ${tokenSymbol} (${tokenAsset.mint})`));
          console.log(chalk.gray(`Price Type: ${useEma ? "EMA" : "Spot"}`));

          const { PublicKey } = await import("@solana/web3.js");
          const oraclePrice = await client.getOraclePrice(
            pool,
            new PublicKey(tokenAsset.mint),
            useEma,
            tokenAsset.feedId
          );

          // Convert price to readable format (assuming 6 decimal places for price)
          const priceInUsd = oraclePrice.toNumber() / 1000000;

          console.log(chalk.green("\n💰 Oracle Price:"));
          console.log(chalk.green(`Price: $${priceInUsd.toFixed(6)} USD`));
          console.log(chalk.green(`Raw Price: ${oraclePrice.toString()}`));
          console.log(chalk.gray(`Feed ID: ${tokenAsset.feedId}`));
        } catch (error) {
          console.error(chalk.red("❌ Error getting oracle price:"), error);
          process.exit(1);
        }
      });

    info
      .command("get-entry-price-and-fee")
      .description("Get entry price and fee for opening a position")
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
      .option("--collateral-amount <amount>", "Collateral amount")
      .option("--size <amount>", "Position size")
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
          ]);

          const pool = options.pool || answers.pool;
          const tokenSymbol = (options.token || answers.token)
            .trim()
            .toUpperCase();
          const collateralSymbol = (options.collateral || answers.collateral)
            .trim()
            .toUpperCase();
          const side = (options.side || answers.side) as "long" | "short";
          const collateralAmount =
            options.collateralAmount || answers.collateralAmount;
          const size = options.size || answers.size;

          // Get asset information from AssetManager
          const tokenAsset = assetManager.getAssetBySymbol(tokenSymbol);
          const collateralAsset =
            assetManager.getAssetBySymbol(collateralSymbol);

          console.log(chalk.blue("\n📊 Getting entry price and fee..."));
          console.log(chalk.gray(`Pool: ${pool}`));
          console.log(chalk.gray(`Token: ${tokenSymbol} (${tokenAsset.mint})`));
          console.log(
            chalk.gray(
              `Collateral: ${collateralSymbol} (${collateralAsset.mint})`
            )
          );
          console.log(chalk.gray(`Side: ${side}`));
          console.log(chalk.gray(`Collateral Amount: ${collateralAmount}`));
          console.log(chalk.gray(`Position Size: ${size}`));

          const { PublicKey } = await import("@solana/web3.js");
          const { toBN } = await import("@algelabs/sdk");

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

          // Convert prices to readable format (assuming 6 decimal places for price)
          const entryPriceInUsd =
            entryPriceAndFee.entryPrice.toNumber() / 1000000;
          const liquidationPriceInUsd =
            entryPriceAndFee.liquidationPrice.toNumber() / 1000000;
          const feeInUsd = entryPriceAndFee.fee.toNumber() / 1000000;

          console.log(chalk.green("\n💰 Entry Price and Fee:"));
          console.log(
            chalk.green(`Entry Price: $${entryPriceInUsd.toFixed(6)} USD`)
          );
          console.log(
            chalk.green(
              `Liquidation Price: $${liquidationPriceInUsd.toFixed(6)} USD`
            )
          );
          console.log(chalk.green(`Fee: $${feeInUsd.toFixed(6)} USD`));
          console.log(
            chalk.gray(
              `Raw Entry Price: ${entryPriceAndFee.entryPrice.toString()}`
            )
          );
          console.log(
            chalk.gray(
              `Raw Liquidation Price: ${entryPriceAndFee.liquidationPrice.toString()}`
            )
          );
          console.log(
            chalk.gray(`Raw Fee: ${entryPriceAndFee.fee.toString()}`)
          );
        } catch (error) {
          console.error(
            chalk.red("❌ Error getting entry price and fee:"),
            error
          );
          process.exit(1);
        }
      });

    info
      .command("calculate-max-size")
      .description("Calculate maximum safe position size for given collateral")
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
          ]);

          const pool = options.pool || answers.pool;
          const tokenSymbol = (options.token || answers.token)
            .trim()
            .toUpperCase();
          const collateralSymbol = (options.collateral || answers.collateral)
            .trim()
            .toUpperCase();
          const side = (options.side || answers.side) as "long" | "short";
          const collateralAmount = parseFloat(
            options.collateralAmount || answers.collateralAmount
          );

          // Get asset information from AssetManager
          const tokenAsset = assetManager.getAssetBySymbol(tokenSymbol);
          const collateralAsset =
            assetManager.getAssetBySymbol(collateralSymbol);

          // Convert collateral amount to raw token units (considering decimals)
          const collateralDecimals = collateralAsset.decimals || 6; // Default to 6 decimals for USD
          const collateralAmountRaw = Math.floor(
            collateralAmount * Math.pow(10, collateralDecimals)
          );

          console.log(
            chalk.blue("\n🔍 Calculating maximum safe position size...")
          );
          console.log(chalk.gray(`Pool: ${pool}`));
          console.log(chalk.gray(`Token: ${tokenSymbol} (${tokenAsset.mint})`));
          console.log(
            chalk.gray(
              `Collateral: ${collateralSymbol} (${collateralAsset.mint})`
            )
          );
          console.log(chalk.gray(`Side: ${side}`));
          console.log(
            chalk.gray(
              `Collateral Amount: ${collateralAmount} ${collateralSymbol}`
            )
          );
          console.log(
            chalk.gray(`Collateral Amount Raw: ${collateralAmountRaw}`)
          );

          const { PublicKey } = await import("@solana/web3.js");
          const { toBN } = await import("@algelabs/sdk");

          // Binary search to find maximum safe position size
          let minSize = 0.1; // Start with 0.1 token
          let maxSize = collateralAmount * 100; // Start with 100x leverage as upper bound
          let bestSize = 0;
          let bestFee = 0;
          let bestEntryPrice = 0;

          console.log(chalk.yellow("\n⏳ Searching for maximum safe size..."));

          while (maxSize - minSize > 0.01) {
            const testSize = (minSize + maxSize) / 2;

            try {
              const entryPriceAndFee = await client.getEntryPriceAndFee(
                pool,
                new PublicKey(tokenAsset.mint),
                new PublicKey(collateralAsset.mint),
                toBN(collateralAmountRaw), // Use raw collateral amount
                toBN(testSize),
                side,
                tokenAsset.feedId,
                collateralAsset.feedId
              );

              // Calculate effective leverage after fees
              const feeInUsd =
                entryPriceAndFee.fee.toNumber() /
                Math.pow(10, collateralDecimals);
              const effectiveCollateral = collateralAmount - feeInUsd;
              const positionValue =
                testSize * (entryPriceAndFee.entryPrice.toNumber() / 1000000);
              const effectiveLeverage = positionValue / effectiveCollateral;

              // Check if leverage is within acceptable range (1x to 2x for EUR)
              if (effectiveLeverage >= 1.0 && effectiveLeverage <= 1.5) {
                bestSize = testSize;
                bestFee = feeInUsd;
                bestEntryPrice =
                  entryPriceAndFee.entryPrice.toNumber() / 1000000;
                minSize = testSize; // Try to find a larger size
              } else {
                maxSize = testSize; // Leverage too high, reduce size
              }
            } catch (error) {
              // If error occurs, reduce the size
              maxSize = testSize;
            }
          }

          if (bestSize > 0) {
            console.log(chalk.green("\n✅ Maximum Safe Position Size Found:"));
            console.log(
              chalk.green(
                `Position Size: ${bestSize.toFixed(4)} ${tokenSymbol}`
              )
            );
            console.log(
              chalk.green(`Entry Price: $${bestEntryPrice.toFixed(6)} USD`)
            );
            console.log(chalk.green(`Fee: $${bestFee.toFixed(6)} USD`));
            console.log(
              chalk.green(
                `Effective Collateral: $${(collateralAmount - bestFee).toFixed(6)} USD`
              )
            );

            const positionValue = bestSize * bestEntryPrice;
            const effectiveLeverage =
              positionValue / (collateralAmount - bestFee);
            console.log(
              chalk.green(`Position Value: $${positionValue.toFixed(6)} USD`)
            );
            console.log(
              chalk.green(
                `Effective Leverage: ${effectiveLeverage.toFixed(2)}x`
              )
            );
          } else {
            console.log(chalk.red("\n❌ No safe position size found"));
            console.log(chalk.yellow("Try increasing your collateral amount"));
          }
        } catch (error) {
          console.error(chalk.red("❌ Error calculating maximum size:"), error);
          process.exit(1);
        }
      });

    info
      .command("balance")
      .description("Check wallet balances")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-t, --token <mint>", "Check specific token balance")
      .action(async (options) => {
        try {
          const { PublicKey } = await import("@solana/web3.js");
          const { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = await import(
            "@solana/spl-token"
          );

          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          const connection = client.connection;
          const walletAddress = client.wallet.publicKey;

          console.log(chalk.blue(`\n💰 Wallet Balance Check`));
          console.log(chalk.gray(`Wallet: ${walletAddress.toString()}`));
          console.log(
            chalk.gray(
              `Environment: ${options.environment || this.configManager.getDefaultEnvironment()}`
            )
          );

          // Check SOL balance
          const solBalance = await connection.getBalance(walletAddress);
          const solBalanceSol = solBalance / 1e9; // Convert lamports to SOL
          console.log(
            chalk.green(`\nSOL Balance: ${solBalanceSol.toFixed(6)} SOL`)
          );
          console.log(chalk.gray(`Raw: ${solBalance} lamports`));

          if (options.token) {
            // Check specific token balance
            try {
              const tokenMint = new PublicKey(options.token);
              const tokenAccount = await getAssociatedTokenAddress(
                tokenMint,
                walletAddress
              );

              const tokenBalance =
                await connection.getTokenAccountBalance(tokenAccount);
              if (tokenBalance.value) {
                const balance = tokenBalance.value.uiAmount || 0;
                const decimals = tokenBalance.value.decimals;
                console.log(chalk.green(`\nToken Balance (${options.token}):`));
                console.log(`   Amount: ${balance.toFixed(decimals)}`);
                console.log(`   Decimals: ${decimals}`);
                console.log(`   Raw: ${tokenBalance.value.amount}`);
              } else {
                console.log(
                  chalk.yellow(`\nNo token account found for ${options.token}`)
                );
              }
            } catch (error) {
              console.log(
                chalk.red(`\nError checking token ${options.token}:`),
                error
              );
            }
          } else {
            // Check all token accounts
            console.log(chalk.blue(`\n🔍 Checking all token accounts...`));

            try {
              const tokenAccounts =
                await connection.getParsedTokenAccountsByOwner(walletAddress, {
                  programId: TOKEN_PROGRAM_ID,
                });

              if (tokenAccounts.value.length === 0) {
                console.log(chalk.yellow("No token accounts found"));
              } else {
                console.log(
                  chalk.green(
                    `\nFound ${tokenAccounts.value.length} token account(s):`
                  )
                );

                for (const account of tokenAccounts.value) {
                  const accountInfo = account.account.data.parsed.info;
                  const mint = accountInfo.mint;
                  const balance = accountInfo.tokenAmount;

                  if (balance.uiAmount && balance.uiAmount > 0) {
                    console.log(chalk.green(`\n${mint}:`));
                    console.log(
                      `   Amount: ${balance.uiAmount.toFixed(balance.decimals)}`
                    );
                    console.log(`   Decimals: ${balance.decimals}`);
                    console.log(`   Raw: ${balance.amount}`);
                  }
                }
              }
            } catch (error) {
              console.log(chalk.red("Error fetching token accounts:"), error);
            }
          }

          // Check if SOL balance is sufficient for transactions
          const minSolForTransaction = 0.001; // 0.001 SOL minimum
          if (solBalanceSol < minSolForTransaction) {
            console.log(
              chalk.red(
                `\n⚠️  Warning: Low SOL balance (${solBalanceSol.toFixed(6)} SOL)`
              )
            );
            console.log(
              chalk.yellow(
                `   Minimum recommended: ${minSolForTransaction} SOL for transactions`
              )
            );
            console.log(chalk.blue(`   Use: alge faucet sol`));
          } else {
            console.log(
              chalk.green(`\n✅ SOL balance sufficient for transactions`)
            );
          }
        } catch (error) {
          console.error(chalk.red("❌ Error checking balance:"), error);
          process.exit(1);
        }
      });

    info
      .command("ratios <poolName>")
      .description("Show current token ratios in a pool")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .action(async (poolName, options) => {
        try {
          const client = await this.walletManager.createClientFromPath(
            options.keypair,
            options.environment as Environment
          );

          // const { PublicKey } = await import("@solana/web3.js");

          // Get pool information
          const pool = await client.getPool(poolName);
          const custodies = await client.getCustodies(poolName);

          console.log(chalk.blue(`\n📊 Token Ratios for Pool: ${poolName}`));
          console.log(chalk.gray(`Total AUM: $${pool.aumUsd.toString()}`));
          console.log(
            chalk.gray(`Number of Custodies: ${pool.custodies.length}`)
          );

          if (pool.ratios && pool.ratios.length > 0) {
            console.log(chalk.yellow(`\n🎯 Configured Ratios:`));
            pool.ratios.forEach((ratio, index) => {
              if (ratio && custodies[index]) {
                const custody = custodies[index];
                const targetPercent = (ratio.target.toNumber() / 100).toFixed(
                  2
                );
                const minPercent = (ratio.min.toNumber() / 100).toFixed(2);
                const maxPercent = (ratio.max.toNumber() / 100).toFixed(2);

                console.log(
                  chalk.green(
                    `\n${index + 1}. Token: ${custody.mint.toString()}`
                  )
                );
                console.log(
                  `   Target: ${targetPercent}% | Min: ${minPercent}% | Max: ${maxPercent}%`
                );
                console.log(
                  `   Decimals: ${custody.decimals} | Stable: ${custody.isStable} | Virtual: ${custody.isVirtual}`
                );

                // Show assets info
                const totalAssets =
                  custody.assets.locked.toNumber() +
                  custody.assets.owned.toNumber() +
                  custody.assets.collateral.toNumber();
                console.log(
                  `   Assets: ${totalAssets} (Locked: ${custody.assets.locked.toString()}, Owned: ${custody.assets.owned.toString()})`
                );
              }
            });
          } else {
            console.log(
              chalk.yellow(`\n⚠️  No ratios configured for this pool`)
            );
          }

          // Show summary
          console.log(chalk.blue(`\n📈 Summary:`));
          const totalTarget = pool.ratios.reduce(
            (sum, ratio) => sum + ratio.target.toNumber(),
            0
          );
          console.log(`Total Target Ratio: ${(totalTarget / 100).toFixed(2)}%`);

          if (totalTarget !== 10000) {
            console.log(
              chalk.red(
                `⚠️  Warning: Total target ratio should be 100% (currently ${(totalTarget / 100).toFixed(2)}%)`
              )
            );
          } else {
            console.log(
              chalk.green(`✅ Total target ratio is correctly set to 100%`)
            );
          }
        } catch (error) {
          console.error(chalk.red("❌ Error getting ratios:"), error);
          process.exit(1);
        }
      });
  }
}
