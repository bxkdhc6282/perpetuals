#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { WalletManager } from "./wallet-manager";
import { ConfigManager } from "./config-manager";
import { PoolCommands } from "./commands/pool-commands";
import { PositionCommands } from "./commands/position-commands";
import { LiquidityCommands } from "./commands/liquidity-commands";
import { AdminCommands } from "./commands/admin-commands";
import { InfoCommands } from "./commands/info-commands";
import { ConfigCommands } from "./commands/config-commands";

const program = new Command();

// Set up the CLI
program
  .name("alge")
  .description("CLI for Alge Labs Perpetuals Protocol")
  .version("1.0.0");

// Global options
program
  .option(
    "-e, --environment <env>",
    "Environment (mainnet, devnet, testnet)",
    "testnet"
  )
  .option("-k, --keypair <path>", "Path to keypair file")
  .option("-v, --verbose", "Enable verbose logging");

// Initialize managers
const configManager = new ConfigManager();
const walletManager = new WalletManager(configManager);

// Add command groups
new PoolCommands(program, walletManager, configManager);
new PositionCommands(program, walletManager, configManager);
new LiquidityCommands(program, walletManager, configManager);
new AdminCommands(program, walletManager, configManager);
new InfoCommands(program, walletManager, configManager);
new ConfigCommands(program, configManager);

// Global error handling
program.exitOverride();

try {
  program.parse();
} catch (err: any) {
  if (err.code === "commander.help") {
    process.exit(0);
  }
  console.error(chalk.red("Error:"), err.message);
  process.exit(1);
}
