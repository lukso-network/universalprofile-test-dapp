<script setup lang="ts">
import { getState, useState, setState } from '@/stores'
import { ref, onMounted, onUnmounted, watch } from 'vue'
import useWeb3Connection from '@/compositions/useWeb3Connection'
import useUpModal from '@/compositions/useUpModal'
import { setNetworkConfig } from '@/helpers/config'
import { UP_MODAL } from '@/helpers/config'
import { sliceAddress } from '@/utils/sliceAddress'
import type { Eip1193Provider } from '@/types'

const { setupProviderFromEip1193, disconnect } = useWeb3Connection()
const { initUpModal, openUpModal, provider: upModalProvider } = useUpModal()

const provider = ref<Eip1193Provider>()

const connectUpModal = async () => {
  await openUpModal()
}

const handleAccountsChanged = async (accounts: string[]) => {
  if (!accounts || accounts.length === 0) {
    if (getState('isConnected')) {
      await disconnect()
    }
    return
  }
  const { setConnected } = useState()
  const [address] = accounts
  const meansOfConnection = getState('channel')
  setConnected(address, meansOfConnection)
}

const handleContextAccountsChanged = (accounts: string[]) => {
  setState('contextAccounts', Array.isArray(accounts) ? accounts : [])
}

const handleChainChanged = async (chainId: number | string) => {
  const next =
    typeof chainId === 'string' ? parseInt(chainId, 16) : Number(chainId)
  if (!Number.isFinite(next)) return
  setNetworkConfig(next)
  setState('chainId', next)
}

const handleConnect = async () => {
  const activeProvider = provider.value ?? upModalProvider.value
  if (activeProvider) {
    await setupProviderFromEip1193(activeProvider, UP_MODAL, false)
  }
  setState('isConnected', true)
}

const handleDisconnect = async () => {
  await disconnect()
  setState('isConnected', false)
}

const addEventListeners = (target = provider.value) => {
  target?.on?.('accountsChanged', handleAccountsChanged)
  target?.on?.('contextAccountsChanged', handleContextAccountsChanged)
  target?.on?.('chainChanged', handleChainChanged)
  target?.on?.('connect', handleConnect)
  target?.on?.('disconnect', handleDisconnect)
}

const removeEventListeners = (target = provider.value) => {
  target?.removeListener?.('accountsChanged', handleAccountsChanged)
  target?.removeListener?.(
    'contextAccountsChanged',
    handleContextAccountsChanged
  )
  target?.removeListener?.('chainChanged', handleChainChanged)
  target?.removeListener?.('connect', handleConnect)
  target?.removeListener?.('disconnect', handleDisconnect)
}

onMounted(async () => {
  await initUpModal()
  provider.value = upModalProvider.value
  addEventListeners(provider.value)
})

onUnmounted(() => {
  removeEventListeners()
})

watch(upModalProvider, (nextProvider, previousProvider) => {
  if (previousProvider) {
    removeEventListeners(previousProvider)
  }
  provider.value = nextProvider
  if (nextProvider) {
    addEventListeners(nextProvider)
  }
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
        <div class="logo up-modal" />
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

  <button
    v-else
    class="button is-primary is-small is-rounded has-text-weight-bold"
    data-testid="connect-up-modal"
    :disabled="getState('isConnected')"
    @click="connectUpModal"
  >
    <div class="logo up-modal" />
    <span>Connect</span>
  </button>
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

  &.up-modal {
    background-image: url('/lukso.png');
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
