<script setup lang="ts">
import { getState, useState } from '@/stores'
import { ref, onMounted, onUnmounted } from 'vue'
import { EthereumProviderError } from 'eth-rpc-errors'
import useDropdown from '@/compositions/useDropdown'
import useWeb3 from '@/compositions/useWeb3'
import useWalletConnect, {
  WALLET_CONNECT_VERSION as walletConnectVersion,
} from '@/compositions/useWalletConnect'
import { UP_CONNECTED_ADDRESS } from '@/helpers/config'
import { sliceAddress } from '@/utils/sliceAddress'

const { setupWeb3, accounts, requestAccounts } = useWeb3()
const { resetProvider, setupProvider, enableProvider, getProvider } =
  useWalletConnect()
const { setDisconnected, setConnected } = useState()
const { close, toggle } = useDropdown()
const dropdown = ref()
const browserExtensionConnected = localStorage.getItem(UP_CONNECTED_ADDRESS)
const hasExtension = !!window.ethereum

const connectWalletConnect = async () => {
  close(dropdown.value)
  await setupProvider()
  await enableProvider()
}

const connectExtension = async () => {
  try {
    close(dropdown.value)
    setupWeb3(window.ethereum)
    let address = await accounts()

    if (!address) {
      ;[address] = await requestAccounts()
    }

    setConnected(address, 'browserExtension')
    localStorage.setItem(UP_CONNECTED_ADDRESS, address)
    close(dropdown.value)
  } catch (error) {
    const epError = error as EthereumProviderError<Error>

    if (epError.code === 4100) {
      const address = (await requestAccounts())[0]
      setConnected(address, 'browserExtension')
      localStorage.setItem(UP_CONNECTED_ADDRESS, address)
    }
  }
}

const disconnect = async () => {
  if (getState('channel') == 'walletConnect') {
    await resetProvider()
  } else {
    localStorage.removeItem(UP_CONNECTED_ADDRESS)
  }

  setDisconnected()
  setupWeb3(null)
}

const handleAccountsChanged = (accounts: string[]) => {
  console.log('Account changed', accounts)

  if (accounts.length === 0 && getState('isConnected')) {
    disconnect()
  }
}

const handleChainChanged = (chainId: string) => {
  console.log('Chain changed', chainId)

  window.location.reload()
}

const handleConnect = () => {
  console.log('Connected')
}

const handleDisconnect = () => {
  console.log('Disconnected')
}

const addEventListeners = () => {
  window.ethereum?.on('accountsChanged', handleAccountsChanged)
  window.ethereum?.on('chainChanged', handleChainChanged)
  window.ethereum?.on('connect', handleConnect)
  window.ethereum?.on('disconnect', handleDisconnect)
}

const removeEventListeners = () => {
  window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
  window.ethereum?.removeListener('chainChanged', handleChainChanged)
  window.ethereum?.removeListener('connect', handleConnect)
  window.ethereum?.removeListener('disconnect', handleDisconnect)
}

onMounted(async () => {
  await setupProvider()

  const wcProvider = getProvider()
  if (wcProvider && wcProvider.wc.connected) {
    await enableProvider()
  } else if (browserExtensionConnected) {
    await connectExtension()
  }

  addEventListeners()
})

onUnmounted(() => {
  removeEventListeners()
})
</script>

<template>
  <div v-if="getState('isConnected')" class="field has-addons">
    <p class="control">
      <button
        class="button is-static is-small is-rounded"
        data-testid="balance"
      >
        <span>{{ getState('balance') }} LYX</span>
      </button>
    </p>
    <p class="control">
      <button
        class="button is-static is-small is-rounded address"
        data-testid="address"
      >
        <div
          :class="`logo ${
            getState('channel') === 'browserExtension'
              ? 'browser-extension'
              : 'wallet-connect'
          }`"
        />
        <span>{{ sliceAddress(getState('address')) }}</span>
      </button>
    </p>
    <p class="control">
      <button
        class="button is-small is-rounded"
        data-testid="disconnect"
        @click="disconnect"
      >
        <span class="icon is-small">
          <i class="fas fa-sign-out-alt"></i>
        </span>
      </button>
    </p>
  </div>

  <div v-else ref="dropdown" class="dropdown is-right">
    <div class="dropdown-trigger">
      <button
        ref="dropdown"
        class="button is-primary is-small is-rounded has-text-weight-bold"
        aria-haspopup="true"
        aria-controls="dropdown-menu"
        data-testid="connect"
        @click="toggle(dropdown)"
      >
        <span>Connect</span>
      </button>
    </div>
    <div id="dropdown-menu" class="dropdown-menu" role="menu">
      <div class="dropdown-content">
        <button
          class="dropdown-item has-text-weight-bold button is-text"
          data-testid="connect-extension"
          :disabled="hasExtension ? undefined : true"
          @click="connectExtension"
        >
          <div class="logo browser-extension" />
          Browser Extension
        </button>
        <button
          class="dropdown-item has-text-weight-bold button is-text"
          data-testid="connect-wc"
          @click="connectWalletConnect"
        >
          <div class="logo wallet-connect" />
          Wallet Connect {{ walletConnectVersion }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.logo {
  height: 16px;
  width: 30px;
  background-repeat: no-repeat;
  display: inline-flex;
  background-position: center;
  background-size: contain;
  position: relative;
  top: 3px;

  &.wallet-connect {
    background-image: url('/walletconnect-logo.svg');
  }

  &.browser-extension {
    background-image: url('/lukso.png');
  }
}

.dropdown-item {
  &.is-text {
    text-decoration: none;
  }
}

.address {
  .logo {
    top: 0;
    left: -7px;
    width: 20px;
  }
}
</style>
