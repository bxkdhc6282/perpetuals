# Alge Labs CLI

A command-line interface for the Alge Labs Perpetuals Protocol.

## Installation

```bash
# Install dependencies
yarn install

# Build the CLI
yarn build

# Link globally (optional)
yarn link
```

## Usage

### Basic Commands

```bash
# Show help
alge --help

# List all pools
alge info pools

# Get pool information
alge info pool <pool-name>

# Get your positions
alge info positions
```

### Position Management

```bash
# Open a new position
alge position open

# Close a position
alge position close

# Get position PnL
alge position pnl
```

### Liquidity Management

```bash
# Add liquidity to a pool
alge liquidity add

# Remove liquidity from a pool
alge liquidity remove
```

### Pool Management

```bash
# List all pools
alge pool list

# Get pool information
alge pool info <name>

# Get pool AUM
alge pool aum <name>
```

### Admin Commands

```bash
# Add a new pool (admin only)
alge admin add-pool <name>

# Remove a pool (admin only)
alge admin remove-pool <name>

# Liquidate a position (admin only)
alge admin liquidate
```

## Configuration

The CLI uses a configuration file to store default settings. You can configure:

- Default environment (mainnet, devnet, testnet)
- Default keypair path
- Custom RPC URLs

### Setting Default Keypair

```bash
# Set default keypair path
alge config set-keypair /path/to/keypair.json
```

### Setting Default Environment

```bash
# Set default environment
alge config set-environment devnet
```

## Environment Options

- `-e, --environment <env>`: Specify environment (mainnet, devnet, testnet)
- `-k, --keypair <path>`: Path to keypair file
- `-v, --verbose`: Enable verbose logging

## Examples

### Opening a Position

```bash
alge position open \
  --pool "BTC-PERP" \
  --token "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" \
  --collateral "So11111111111111111111111111111111111111112" \
  --side long \
  --size 1000000 \
  --collateral-amount 1000000000
```

### Adding Liquidity

```bash
alge liquidity add \
  --pool "BTC-PERP" \
  --token "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" \
  --amount 1000000000
```

## Development

```bash
# Run in development mode
yarn dev

# Run tests
yarn test

# Lint code
yarn lint

# Format code
yarn format
```

alge admin add-custody \
 --pool-name forex \
 --virtual \
 --oracle-type pyth \
 --oracle-authority DK1wKG1kVExnn1TMjQexwHy31EXST6zpztGB8hZAiUN \
--max-price-error 10000 \
 --max-price-age 60 \
 --oracle-feed-id 0x67a6f93030420c1c9e3fe37c1ab6b77966af82f995944a9fefce357a22854a80 \
 --use-ema \
 --use-unrealized-pnl-in-aum \
 --trade-spread-long 100 \
 --trade-spread-short 100 \
 --swap-spread 300 \
 --min-initial-leverage 10000 \
 --max-initial-leverage 1000000 \
 --max-leverage 1000000 \
 --max-payoff-multiplier 10000 \
 --max-utilization 10000 \
 --max-position-locked-usd 1000000000 \
 --max-total-locked-usd 1000000000 \
 --allow-swap \
 --allow-add-liquidity \
 --allow-remove-liquidity \
 --allow-open-position \
 --allow-close-position \
 --allow-pnl-withdrawal \
 --allow-collateral-withdrawal \
 --allow-size-change \
 --fees-mode optimal \
 --ratio-multiplier 20000 \
 --utilization-multiplier 20000 \
 --swap-in-fee 100 \
 --swap-out-fee 100 \
 --stable-swap-in-fee 100 \
 --stable-swap-out-fee 100 \
 --add-liquidity-fee 100 \
 --remove-liquidity-fee 100 \
 --open-position-fee 100 \
 --close-position-fee 100 \
 --liquidation-fee 100 \
 --protocol-share 30 \
 --fee-max 250 \
 --fee-optimal 10 \
 --base-borrow-rate 0 \
 --borrow-rate-slope-1 80000 \
 --borrow-rate-slope-2 120000 \
 --optimal-utilization 800000000 \
 --token-ratio 10000,10,10000

## Architecture

The CLI is built with:

- **Commander.js**: Command-line interface framework
- **Inquirer.js**: Interactive prompts
- **Chalk**: Colored terminal output
- **Conf**: Configuration management
- **TypeScript**: Type safety

### Command Structure

- `info`: Display protocol information
- `position`: Position management
- `liquidity`: Liquidity management
- `pool`: Pool management
- `admin`: Admin operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

ISC
