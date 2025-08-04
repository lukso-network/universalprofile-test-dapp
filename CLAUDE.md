# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Development
```bash
yarn dev                    # Start development server (Vite)
yarn preview                # Preview production build
```

### Build & Quality Checks
```bash
yarn build                  # Build for production (runs TypeScript checks + Vite build)
yarn lint                   # Run all linters (JS, CSS, format, types)
yarn lint:js                # ESLint check
yarn lint:css               # Stylelint check
yarn lint:format            # Prettier check
yarn lint:types             # TypeScript type check
yarn test                   # Run Jest unit tests
```

### Code Formatting
```bash
yarn lint:format:fix        # Auto-fix formatting with Prettier
```

## Architecture Overview

This is a Vue 3 + Vite application for interacting with LUKSO Universal Profiles. The codebase follows a modular architecture:

### Core Technologies
- **Vue 3** with Composition API
- **Vite** for bundling and dev server
- **Vue Router** for routing
- **Web3.js** for blockchain interactions
- **@lukso/lsp-factory.js** for deploying Universal Profiles
- **@erc725/erc725.js** for ERC725 data handling

### Project Structure
- `/src/components/` - Vue components organized by feature
  - `/endpoints/` - Components for different web3 operations (accounts, assets, transactions, etc.)
  - `/modals/` - Modal dialog components
  - `/profile/` - Profile-related components
  - `/shared/` - Reusable UI components
- `/src/compositions/` - Vue composables for shared logic
  - `useWeb3Connection.ts` - Core web3 connection management
  - `useWalletConnectV2.ts` - WalletConnect v2 integration
  - `useWeb3Onboard.ts` - Web3-Onboard integration
- `/src/views/` - Page-level components
- `/src/helpers/` - Utility functions and configurations
  - `config.ts` - Network configurations and constants
- `/src/stores/` - State management
- `/src/services/` - External service integrations (IPFS)

### Connection Methods
The app supports multiple wallet connection methods:
1. **window.lukso** - Browser extension injection
2. **WalletConnect V2** - Mobile and desktop wallet connections
3. **Web3-Onboard** - Multi-wallet support
4. **Embedded Wallet** - Iframe-based UP provider (experimental)

### Network Support
Configured networks in `src/helpers/config.ts`:
- LUKSO Testnet (chainId: 4201)
- LUKSO Mainnet (chainId: 42)
- Base Sepolia (chainId: 84532)
- Base Mainnet (chainId: 8453)

### Testing
- Jest with Vue Test Utils for unit tests
- Tests located alongside components in `__tests__` directories
- Test environment configured with jsdom

### Code Style
- ESLint with TypeScript and Vue 3 rules
- Prettier for formatting (no semicolons, single quotes, 80 char width)
- Stylelint for CSS/SCSS
- Pre-commit hooks via Husky and lint-staged

## Linked Projects

This project depends on two other local projects:

### 1. UP Provider (`../tools-up-provider/packages/up-provider`)

- Source code for `@lukso/up-provider` package
- Currently linked via Yarn resolution in package.json
- Local file reference: `lukso-up-provider-0.3.5.tgz`
- Provides the UPClientProvider for embedded wallet functionality

### 2. Service Auth Simple (`../service-auth-simple`)

- Nuxt project providing authentication services
- Contains `/keys` page that displays inside the iframe created by up-provider
- Default development URL: `http://localhost:9100/keys`
- Testing production URL: `https://auth-simple.pages.dev/keys`
- Used for the embedded wallet connection method

### Embedded Wallet Development

When working on embedded wallet features:

1. Ensure `service-auth-simple` is running on port 9100
2. The iframe URL is configured in `src/compositions/useWeb3Connection.ts:64-68`
3. The embedded wallet uses localStorage key `up-provider` for persistence