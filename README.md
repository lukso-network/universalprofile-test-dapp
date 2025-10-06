# Universal Profile Test dApp

A sample app to demonstrate the displaying, deploying and usage of a [Universal Profile](https://docs.lukso.tech/standards/universal-profile/lsp0-erc725account) inside a web app.

If you are a developer, check out the [LUKSO Technical Documentation](https://docs.lukso.tech/).

Stack:

- [Vite 3](https://vitejs.dev/guide/)
- [Vue 3](https://vuejs.org/guide/introduction.html)
- [web3.js](https://web3js.readthedocs.io/)
- [erc725.js](https://docs.lukso.tech/tools/erc725js/getting-started/)
- [lsp-factory.js](https://docs.lukso.tech/tools/lsp-factoryjs/getting-started/)
- [Bulma](https://bulma.io/)
- [Vue Router](https://github.com/vuejs/router)
- [Prettier](https://prettier.io/)
- [Eslint](https://eslint.org/)
- [Jest](https://jestjs.io/)

## 🚀 Deployments

This project is deployed via [Cloudflare pages](https://pages.cloudflare.com/). The CI is setup in the GitHub Action side.

### Preview

When you create a PR, a preview URL will be appended to the PR discussion.

### Production

Branch: `main`

- <https://up-test-dapp.lukso.tech/>

## 🧑🏻‍💻 Getting Started

### Prerequisites

1. **Install GitHub CLI** (if not already installed):

   ```sh
   # macOS
   brew install gh

   # Linux
   curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
   ```

   Then authenticate:
   ```sh
   gh auth login
   ```

2. **Install mise** (if not already installed):

   This project uses [mise](https://mise.jdx.dev/) to manage tools and environment setup.
   ```sh
   curl https://mise.run | sh
   ```
   See [mise installation docs](https://mise.jdx.dev/getting-started.html) for other installation methods.

3. **Install tools and dependencies**:
   ```sh
   mise install
   ```
   This will:
   - Install Node.js, Yarn, and Python
   - Configure GitHub Packages access (if hooks are enabled)
   - Install project dependencies

4. **Configure GitHub Packages** (if not done automatically):

   If you see "✓ GitHub Packages already configured", you're all set. Otherwise, run:
   ```sh
   mise run setup-github-packages
   ```

   Note: Mise hooks are experimental and may not run automatically on all systems. The setup script will:
   - Check GitHub CLI authentication (run `gh auth login` if needed)
   - Verify token has `read:packages` or `write:packages` scope
   - Generate `.yarnrc.yml` with GitHub Packages configuration (token embedded directly)
   - Generate `.npmrc` with GitHub Packages configuration

   **Security Note**: `.yarnrc.yml` is not committed to the repository as it contains your GitHub token. A `.yarnrc.yml.template` file is provided to show the expected structure. The token is embedded directly in the file rather than exposed as an environment variable to prevent malicious postinstall scripts from accessing it.

### Post-Setup

After mise install completes, husky and lint-staged will be configured to validate commits pre-commit.

### Development

```sh
yarn dev
```

### Tests/linters

```sh
yarn test:unit
yarn lint
```

For checking production version:

```sh
yarn preview
```

### Upgrades

```sh
yarn upgrade-interactive
```

> NOTE: Current all jest related npms are still on version 28. Please do not upgrade to 29 as it's a very
> large piece of work

## Wallet Connect V2

This project supports Wallet Connect V2, a [project ID should be set](https://docs.walletconnect.com/web3modal/javascript/about#installation) in `constants.ts` file.
