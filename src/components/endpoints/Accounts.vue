<script setup lang="ts">
import Notifications from '@/components/Notification.vue'
import NetworkSwitcher from '@/components/NetworkSwitcher.vue'
import useNotifications from '@/compositions/useNotifications'
import { getState, useState } from '@/stores'

import { getSelectedNetworkConfig, NETWORKS } from '@/helpers/config'
import { createBlockScoutLink } from '@/utils/createLinks'
import Web3Utils from 'web3-utils'
import { computed } from 'vue'
import { NetworkInfo } from '@/interfaces/network'
import useWeb3Connection from '@/compositions/useWeb3Connection'
import useUpModal from '@/compositions/useUpModal'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { recalculateAssets } = useState()
const { disconnect } = useWeb3Connection()
const { openUpModal } = useUpModal()
const selectedNetworkConfig = computed<NetworkInfo>(() => {
  const chainId = getState('chainId')
  if (chainId) {
    const match = Object.values(NETWORKS).find(
      n => Number(n.chainId) === chainId
    )
    if (match) return match
  }
  return getSelectedNetworkConfig()
})

const hexChainId = computed(() => {
  return Web3Utils.numberToHex(getState('chainId'))
})

const disconnectWallet = async () => {
  clearNotification()
  const channel = getState('channel')
  await disconnect()
  setNotification(`Disconnected ${channel ?? 'wallet'} channel`, 'info')
}

const connectUpModal = async () => {
  clearNotification()
  try {
    await openUpModal()
    if (getState('address')) {
      setNotification(`Connected to address: ${getState('address')}`, 'info')
    } else {
      setNotification('Open UP Modal to connect your wallet', 'info')
    }
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}

const handleRefresh = (e: Event) => {
  e.stopPropagation()
  recalculateAssets()
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-1">Connect</p>
      <div
        class="is-flex is-align-items-center"
        style="gap: 8px; padding-top: 8px; padding-bottom: 8px"
      >
        <span
          >DApp uses <b>{{ selectedNetworkConfig.name }}</b> network.</span
        >
        <NetworkSwitcher />
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-1"
          :disabled="getState('isConnected')"
          data-testid="connect-up-modal"
          @click="connectUpModal"
        >
          Connect
        </button>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded"
          :disabled="!getState('isConnected')"
          data-testid="disconnect"
          @click="disconnectWallet"
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
