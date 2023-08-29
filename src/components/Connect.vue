<script setup lang="ts">
import { getState, useState } from '@/stores'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { provider as Provider } from 'web3-core'
import { EthereumProviderError } from 'eth-rpc-errors'
import useDropdown from '@/compositions/useDropdown'
import useWeb3 from '@/compositions/useWeb3'
import {
  MEANS_OF_CONNECTION,
  UP_CONNECTED_ADDRESS,
  WALLET_CONNECT,
  WEB3_ONBOARD,
  WINDOW_LUKSO,
} from '@/helpers/config'
import useWalletConnectV2 from '@/compositions/useWalletConnectV2'
import { sliceAddress } from '@/utils/sliceAddress'
import useWeb3Onboard from '@/compositions/useWeb3Onboard'

const { setupWeb3, accounts, requestAccounts } = useWeb3()

const { resetWCV2Provider, setupWCV2Provider, openWCV2Modal } =
  useWalletConnectV2()
const {
  setupWeb3Onboard,
  connectWallet,
  disconnect: disconnectWeb3Onboard,
} = useWeb3Onboard()
const { setDisconnected, setConnected } = useState()
const { close, toggle } = useDropdown()
const dropdown = ref()
const hasExtension = ref<boolean>(!!window.lukso)

watch(
  () => !!window.lukso,
  value => (hasExtension.value = value)
)

const connectWalletConnectV2 = async () => {
  close(dropdown.value)
  await setupWCV2Provider()
  await openWCV2Modal()
}

const connectExtension = async () => {
  try {
    close(dropdown.value)
    await setupWeb3(window.lukso as unknown as Provider)

    let address = await accounts()

    if (!address) {
      ;[address] = await requestAccounts()
    }

    setConnected(address, WINDOW_LUKSO)
    localStorage.setItem(UP_CONNECTED_ADDRESS, address)
    close(dropdown.value)
  } catch (error) {
    const epError = error as EthereumProviderError<Error>

    if (epError.code === 4100) {
      const address = (await requestAccounts())[0]
      setConnected(address, WINDOW_LUKSO)
      localStorage.setItem(UP_CONNECTED_ADDRESS, address)
    }
  }
}

const connectWeb3Onboard = async () => {
  setupWeb3Onboard()
  try {
    const [primaryWallet] = await connectWallet()
    const connectedAddress = primaryWallet.accounts[0].address
    setConnected(connectedAddress, WEB3_ONBOARD)
  } catch (error) {
    const epError = error as EthereumProviderError<Error>

    if (epError.code === 4100) {
      const address = (await requestAccounts())[0]
      setConnected(address, WEB3_ONBOARD)
    }
  }
}

const disconnect = async () => {
  if (getState('channel') == WALLET_CONNECT) {
    await resetWCV2Provider()
  } else if (getState('channel') == WEB3_ONBOARD) {
    await disconnectWeb3Onboard()
  } else {
    localStorage.removeItem(UP_CONNECTED_ADDRESS)
  }

  setDisconnected()
  await setupWeb3(null)
}

const handleAccountsChanged = (accounts: string[]) => {
  console.log('Account changed', accounts)

  if (accounts.length === 0 && getState('isConnected')) {
    disconnect()
  }
}

const handleChainChanged = async (chainId: string) => {
  console.log('Chain changed', chainId)
  await disconnect()
  window.location.reload()
}

const handleConnect = () => {
  console.log('Connected')
}

const handleDisconnect = () => {
  console.log('Disconnected')
}

const addEventListeners = () => {
  window.lukso?.on?.('accountsChanged', handleAccountsChanged)
  window.lukso?.on?.('chainChanged', handleChainChanged)
  window.lukso?.on?.('connect', handleConnect)
  window.lukso?.on?.('disconnect', handleDisconnect)
}

const removeEventListeners = () => {
  window.lukso?.removeListener?.('accountsChanged', handleAccountsChanged)
  window.lukso?.removeListener?.('chainChanged', handleChainChanged)
  window.lukso?.removeListener?.('connect', handleConnect)
  window.lukso?.removeListener?.('disconnect', handleDisconnect)
}

onMounted(async () => {
  const channel = localStorage.getItem(MEANS_OF_CONNECTION)
  const isWalletConnectUsed = channel === WALLET_CONNECT
  const isWeb3OnboardUsed = channel === WEB3_ONBOARD

  if (!channel) {
    return
  }

  if (isWalletConnectUsed) {
    await setupWCV2Provider()
  } else if (isWeb3OnboardUsed) {
    await connectWeb3Onboard()
  } else {
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
            getState('channel') === WINDOW_LUKSO
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
          :disabled="!hasExtension || getState('isConnected')"
          @click="connectExtension"
        >
          <div class="logo browser-extension" />
          Browser Extension
        </button>
        <button
          class="dropdown-item has-text-weight-bold button is-text"
          data-testid="connect-wc-v2"
          :disabled="getState('isConnected')"
          @click="connectWalletConnectV2"
        >
          <div class="logo wallet-connect" />
          Wallet Connect V2
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
