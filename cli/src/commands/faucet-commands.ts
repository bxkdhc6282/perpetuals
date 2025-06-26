import { Command } from "commander";
import chalk from "chalk";
import { WalletManager } from "../wallet-manager";
import { ConfigManager } from "../config-manager";
import { Environment, AusdFaucetClient } from "@algelabs/sdk";

export class FaucetCommands {
  constructor(
    private program: Command,
    private walletManager: WalletManager,
    private configManager: ConfigManager
  ) {
    this.setupCommands();
  }

  private setupCommands() {
    const faucet = this.program
      .command("faucet")
      .description("AUSD Faucet commands");

    faucet
      .command("initialize")
      .description("Initialize the AUSD faucet")
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
              message: "Are you sure you want to initialize the AUSD faucet?",
              default: false,
              when: !options.yes,
            },
          ]);

          // Check confirmation
          if (!options.yes && !answers.confirm) {
            console.log(chalk.yellow("❌ Faucet initialization cancelled"));
            return;
          }

          console.log(chalk.blue("\n🚰 Initializing AUSD faucet..."));
          console.log(
            chalk.gray(
              `Environment: ${options.environment || this.configManager.getDefaultEnvironment()}`
            )
          );

          const faucetClient = new AusdFaucetClient(
            client.wallet,
            options.environment as Environment
          );
          const tx = await faucetClient.initialize();

          tx.feePayer = client.wallet.publicKey;
          tx.recentBlockhash = (
            await client.connection.getLatestBlockhash()
          ).blockhash;

          const { signature } = await client.wallet.signAndSendTransaction(tx);
          console.log(
            chalk.green(
              `✅ AUSD faucet initialized successfully! Transaction: ${signature}`
            )
          );
        } catch (error) {
          console.error(chalk.red("❌ Error initializing faucet:"), error);
          process.exit(1);
        }
      });

    faucet
      .command("mint")
      .description("Mint AUSD tokens to a user")
      .option(
        "-e, --environment <env>",
        "Environment",
        this.configManager.getDefaultEnvironment()
      )
      .option("-k, --keypair <path>", "Path to keypair file")
      .option("-u, --user <address>", "User wallet address")
      .option("-a, --amount <number>", "Amount to mint", "1000000")
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
              name: "user",
              message: "User wallet address:",
              default: options.user,
              when: !options.user,
              validate: (input: string) => {
                if (!input || input.trim().length === 0) {
                  return "User wallet address is required";
                }
                return true;
              },
            },
            {
              type: "number",
              name: "amount",
              message: "Amount to mint (in smallest units):",
              default: parseInt(options.amount) || 1000000,
              when: !options.amount,
            },
            {
              type: "confirm",
              name: "confirm",
              message: (answers: any) => {
                const user = options.user || answers.user;
                const amount = options.amount || answers.amount;
                return `Are you sure you want to mint ${amount} AUSD tokens to ${user}?`;
              },
              default: false,
              when: !options.yes,
            },
          ]);

          const user = options.user || answers.user;
          const amount = parseInt(options.amount) || answers.amount;

          // Check confirmation
          if (!options.yes && !answers.confirm) {
            console.log(chalk.yellow("❌ Minting cancelled"));
            return;
          }

          console.log(chalk.blue("\n💰 Minting AUSD tokens..."));
          console.log(chalk.gray(`User: ${user}`));
          console.log(chalk.gray(`Amount: ${amount}`));
          console.log(
            chalk.gray(
              `Environment: ${options.environment || this.configManager.getDefaultEnvironment()}`
            )
          );

          const faucetClient = new AusdFaucetClient(
            client.wallet,
            options.environment as Environment
          );
          const tx = await faucetClient.mintToUser(amount, user);

          tx.feePayer = client.wallet.publicKey;
          tx.recentBlockhash = (
            await client.connection.getLatestBlockhash()
          ).blockhash;

          const { signature } = await client.wallet.signAndSendTransaction(tx);
          console.log(
            chalk.green(
              `✅ AUSD tokens minted successfully! Transaction: ${signature}`
            )
          );
        } catch (error) {
          console.error(chalk.red("❌ Error minting tokens:"), error);
          process.exit(1);
        }
      });

    faucet
      .command("transfer-authority")
      .description("Transfer mint authority back to admin")
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
              message:
                "Are you sure you want to transfer mint authority back to admin?",
              default: false,
              when: !options.yes,
            },
          ]);

          // Check confirmation
          if (!options.yes && !answers.confirm) {
            console.log(chalk.yellow("❌ Authority transfer cancelled"));
            return;
          }

          console.log(chalk.blue("\n🔐 Transferring mint authority..."));
          console.log(
            chalk.gray(
              `Environment: ${options.environment || this.configManager.getDefaultEnvironment()}`
            )
          );

          const faucetClient = new AusdFaucetClient(
            client.wallet,
            options.environment as Environment
          );
          const tx = await faucetClient.transferMintAuthority();

          tx.feePayer = client.wallet.publicKey;
          tx.recentBlockhash = (
            await client.connection.getLatestBlockhash()
          ).blockhash;

          const { signature } = await client.wallet.signAndSendTransaction(tx);
          console.log(
            chalk.green(
              `✅ Mint authority transferred successfully! Transaction: ${signature}`
            )
          );
        } catch (error) {
          console.error(chalk.red("❌ Error transferring authority:"), error);
          process.exit(1);
        }
      });
  }
}
