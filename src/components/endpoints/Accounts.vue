<script setup lang="ts">
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import useWalletConnect, {
  WALLET_CONNECT_VERSION as walletConnectVersion,
} from '@/compositions/useWalletConnect'
import { getState, useState } from '@/stores'
import useWeb3 from '@/compositions/useWeb3'
import { UP_CONNECTED_ADDRESS } from '@/helpers/config'
import { createBlockScoutLink } from '@/utils/createLinks'
import Web3Utils from 'web3-utils'
import { computed } from 'vue'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { setDisconnected, setConnected, recalcTokens } = useState()
const { setupWeb3, requestAccounts } = useWeb3()
const { resetProvider, enableProvider, setupProvider } = useWalletConnect()
const hasExtension = !!window.ethereum

const hexChainId = computed(() => {
  return Web3Utils.numberToHex(getState('chainId'))
})

const connectExtension = async () => {
  clearNotification()
  setupWeb3(window.ethereum)

  try {
    const [address] = await requestAccounts()
    setConnected(address, 'browserExtension')
    localStorage.setItem(UP_CONNECTED_ADDRESS, address)
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}

const connectWalletconnect = async () => {
  clearNotification()

  try {
    await setupProvider()
    await enableProvider()
    setConnected(getState('address'), 'walletConnect')
    setNotification(`Connected to address: ${getState('address')}`, 'info')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}

const disconnect = async () => {
  clearNotification()

  if (getState('channel') == 'walletConnect') {
    await resetProvider()
  } else {
    localStorage.removeItem(UP_CONNECTED_ADDRESS)
  }

  setNotification(`Disconnected ${getState('channel')} channel`, 'info')

  setDisconnected()
  setupWeb3(null)
}
const handleRefresh = (e: Event) => {
  e.stopPropagation()
  recalcTokens()
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-1">Connect</p>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-1"
          :disabled="getState('address') || !hasExtension ? true : undefined"
          data-testid="connect-extension"
          @click="connectExtension"
        >
          Browser Extension
        </button>
        <span
          v-if="
            getState('channel') === 'browserExtension' &&
            getState('isConnected')
          "
          class="icon ml-3 mt-1 has-text-primary"
        >
          <i class="fas fa-check"></i>
        </span>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-1"
          :disabled="getState('address') ? true : undefined"
          data-testid="connect-wc"
          @click="connectWalletconnect"
        >
          Wallet Connect {{ walletConnectVersion }}
        </button>
        <span
          v-if="
            getState('channel') === 'walletConnect' && getState('isConnected')
          "
          class="icon ml-3 mt-4 has-text-primary"
        >
          <i class="fas fa-check"></i>
        </span>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded"
          :disabled="getState('isConnected') ? undefined : true"
          data-testid="disconnect"
          @click="disconnect"
        >
          Disconnect
        </button>
      </div>
      <div class="field">
        <Notifications
          v-if="hasNotification"
          :notification="notification"
          class="mt-4"
          @hide="clearNotification"
        >
        </Notifications>
      </div>
      <div class="field">
        <div
          v-if="getState('isConnected')"
          class="notification is-info is-light mt-1"
          data-testid="info"
        >
          <p>Connected to address:</p>
          <p class="text-center">
            <b>
              <a
                :href="createBlockScoutLink(getState('address'))"
                target="_blank"
                class="is-family-code is-size-7"
                >{{ getState('address') }}</a
              >
            </b>
          </p>
          <p class="mb-1">
            Balance: <b class="is-family-code">{{ getState('balance') }} LYX</b>
          </p>
          <p data-testid="chain">
            Chain ID:
            <b class="is-family-code"
              >{{ getState('chainId') }} ({{ hexChainId }})</b
            >
          </p>
          <ul>
            <li v-for="item in getState('lsp7')" :key="item.address + '_lsp7'">
              <p>
                {{ item.balance }} {{ item.symbol }} of {{ item.name }} (LSP7)
              </p>
              <b>
                <p class="text-center">
                  <a
                    :href="createBlockScoutLink(item.address)"
                    target="_blank"
                    class="is-family-code is-size-7"
                    >{{ item.address }}</a
                  >
                </p></b
              >
            </li>
            <li v-for="item in getState('lsp8')" :key="item.address + '_lsp8'">
              <p>
                {{ item.balance }} {{ item.symbol }} of {{ item.name }} (LSP8)
              </p>
              <b>
                <p class="text-center">
                  <a
                    :href="createBlockScoutLink(item.address)"
                    target="_blank"
                    class="is-family-code is-size-7"
                    >{{ item.address }}</a
                  >
                </p></b
              >
            </li>
          </ul>
          <button
            :disabled="!getState('address')"
            class="mt-2 button is-primary is-rounded"
            @click="handleRefresh"
          >
            Refetch Tokens
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.notification {
  word-break: break-all;
}

.text-center {
  width: 100%;
  text-align: center;
}
</style>
