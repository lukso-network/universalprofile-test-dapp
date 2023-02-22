# Universal Profile Test dApp

![GitHub Workflow Status](https://img.shields.io/github/workflow/status/lukso-network/universalprofile-test-dapp/Build%20and%20Test?label=tests)

A sample app to demonstrate the displaying, deploying and usage of a universal profile inside a web app.

Running version: <http://up-test-dapp.lukso.tech/>

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

## Project setup

```sh
yarn install
yarn prepare
```

Yarn prepare will correctly install husky and lint-staged to validate commits pre-commit.

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

This project supports Wallet Connect V2, a [project ID should be set](https://docs.walletconnect.com/2.0/javascript/sign/installation) in `constants.ts` file.
