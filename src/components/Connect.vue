<script setup lang="ts">
import { getState, useState, setState } from '@/stores'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import useDropdown from '@/compositions/useDropdown'
import useWeb3Connection from '@/compositions/useWeb3Connection'
import { WALLET_CONNECT, WEB3_ONBOARD, WINDOW_LUKSO } from '@/helpers/config'
import { sliceAddress } from '@/utils/sliceAddress'

const { setupProvider, disconnect } = useWeb3Connection()

const { close, toggle } = useDropdown()
const dropdown = ref()
const hasExtension = ref(false)
const provider = ref<any>()

watch(
  () => !!window.lukso,
  value => (hasExtension.value = value)
)

const connectExtension = async (meansOfConnection: string) => {
  close(dropdown.value)
  provider.value = await setupProvider(meansOfConnection)
}

const handleAccountsChanged = async (accounts: string[]) => {
  console.log('Account changed', accounts)

  if (accounts.length === 0 && getState('isConnected')) {
    await disconnect()
  }
  const { setConnected } = useState()
  const [address] = accounts
  const meansOfConnection = getState('channel')
  setConnected(address, meansOfConnection)
}

const handleChainChanged = async (chainId: string) => {
  console.log('Chain changed', chainId)
  await disconnect()
  window.location.reload()
}

const handleConnect = async (error: any) => {
  console.log('Connected')
  if (error) {
    throw error
  }
  const meansOfConnection = getState('channel')
  await setupProvider(meansOfConnection)
  setState('isConnected', true)
}

const handleDisconnect = async () => {
  console.log('Disconnected')
  await disconnect()
  setState('isConnected', false)
}

const addEventListeners = () => {
  provider.value?.on?.('accountsChanged', handleAccountsChanged)
  provider.value?.on?.('chainChanged', handleChainChanged)
  provider.value?.on?.('connect', handleConnect)
  provider.value?.on?.('disconnect', handleDisconnect)
}

const removeEventListeners = () => {
  provider.value?.removeListener?.('accountsChanged', handleAccountsChanged)
  provider.value?.removeListener?.('chainChanged', handleChainChanged)
  provider.value?.removeListener?.('connect', handleConnect)
  provider.value?.removeListener?.('disconnect', handleDisconnect)
}

onMounted(async () => {
  const meansOfConnection = getState('channel')
  await setupProvider(meansOfConnection)
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
            getState('channel') === WINDOW_LUKSO ||
            getState('channel') === WEB3_ONBOARD
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
          :disabled="getState('isConnected')"
          @click="connectExtension(WINDOW_LUKSO)"
        >
          <div class="logo browser-extension" />
          Browser Extension
        </button>
        <button
          class="dropdown-item has-text-weight-bold button is-text"
          data-testid="connect-wc-v2"
          :disabled="getState('isConnected')"
          @click="connectExtension(WALLET_CONNECT)"
        >
          <div class="logo wallet-connect" />
          Wallet Connect V2
        </button>
        <button
          class="dropdown-item has-text-weight-bold button is-text"
          data-testid="connect-web3-onboard"
          :disabled="getState('isConnected')"
          @click="connectExtension(WEB3_ONBOARD)"
        >
          <div class="logo browser-extension" />
          Web3 Onboard
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
