<script setup lang="ts">
import { getState, useState } from '@/stores'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { provider as Provider } from 'web3-core'
import { EthereumProviderError } from 'eth-rpc-errors'
import useDropdown from '@/compositions/useDropdown'
import useWeb3 from '@/compositions/useWeb3'
import { UP_CONNECTED_ADDRESS } from '@/helpers/config'
import { sliceAddress } from '@/utils/sliceAddress'
import useWalletConnectV2 from '@/compositions/useWalletConnectV2'

const { setupWeb3, accounts, requestAccounts } = useWeb3()

const { resetWCV2Provider, setupWCV2Provider, openWCV2Modal, getWCV2Provider } =
  useWalletConnectV2()
const { setDisconnected, setConnected } = useState()
const { close, toggle } = useDropdown()
const dropdown = ref()
const browserExtensionConnected = localStorage.getItem(UP_CONNECTED_ADDRESS)
const hasExtension = ref<boolean>(!!window.ethereum)

watch(
  () => !!window.ethereum,
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
    await setupWeb3(window.ethereum as unknown as Provider)

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
  if (getState('channel') == 'walletConnectV2') {
    await resetWCV2Provider()
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
  window.ethereum?.on?.('accountsChanged', handleAccountsChanged)
  window.ethereum?.on?.('chainChanged', handleChainChanged)
  window.ethereum?.on?.('connect', handleConnect)
  window.ethereum?.on?.('disconnect', handleDisconnect)
}

const removeEventListeners = () => {
  window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged)
  window.ethereum?.removeListener?.('chainChanged', handleChainChanged)
  window.ethereum?.removeListener?.('connect', handleConnect)
  window.ethereum?.removeListener?.('disconnect', handleDisconnect)
}

onMounted(async () => {
  await setupWCV2Provider()

  const wcv2Provider = getWCV2Provider()
  if (wcv2Provider && wcv2Provider.connected) {
    // All set up already
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
          :disabled="!hasExtension || getState('isConnected')"
          @click="connectExtension"
        >
          <div class="logo browser-extension" />
          Browser Extensiond
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
