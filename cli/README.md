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
