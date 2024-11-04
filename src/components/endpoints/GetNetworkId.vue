<script setup lang="ts">
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import useWeb3Connection from '@/compositions/useWeb3Connection'
import {
  getSelectedNetworkConfig,
  NETWORKS,
  setNetworkConfig,
} from '@/helpers/config'
import { NetworkInfo } from '@/interfaces/network'
import { ref, watch } from 'vue'
import { numberToHex } from 'web3-utils'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const web3 = useWeb3Connection()

const defaultNetworkConfig = getSelectedNetworkConfig()
const defaultNetwork: NetworkInfo = {
  ...defaultNetworkConfig,
}

const networkId = ref('')
const err = ref('')
const activeNetwork = ref<NetworkInfo>(defaultNetwork)
watch(
  () => getSelectedNetworkConfig(),
  () => {
    activeNetwork.value = getSelectedNetworkConfig()
  }
)
const networks = Object.values(NETWORKS)

const getNetworkId = async () => {
  clearNotification()

  try {
    networkId.value = await web3.sendRequest({ method: 'eth_getId' })

    setNotification(networkId.value, 'info')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}

const changeNetwork = async () => {
  try {
    await web3.sendRequest({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: numberToHex(activeNetwork.value.chainId),
        },
      ],
    })
    const chainId = await web3.getChainId()
    activeNetwork.value.chainId = chainId
    setNetworkConfig(chainId)
  } catch (error) {
    console.error(error)
    setNotification((error as unknown as Error).message, 'danger')
  }
}

const changeDappNetwork = async () => {
  try {
    let currentChainId = getSelectedNetworkConfig().chainId
    if (currentChainId !== activeNetwork.value.chainId) {
      setNetworkConfig(activeNetwork.value.chainId)
      currentChainId = getSelectedNetworkConfig().chainId
    }
    location.reload()
  } catch (error) {
    console.error(error)
    setNotification((error as unknown as Error).message, 'danger')
  }
}

const addNetwork = async () => {
  try {
    await web3.sendRequest({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: activeNetwork.value.chainId,
          chainName: activeNetwork.value.name,
          rpcUrls: [activeNetwork.value.http.url],
        },
      ],
    })
  } catch (addError) {
    console.error(addError)

    setNotification((addError as unknown as Error).message, 'danger')
  }
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Change Network</p>
      <div class="p-4">
        <div v-for="(value, key) of activeNetwork" :key="key">
          <span class="has-text-weight-bold mr-6">{{ key }}:</span> {{ value }}
        </div>
      </div>
      <div class="field">
        <div class="select is-fullwidth mb-2">
          <select v-model="activeNetwork" data-testid="preset">
            <option
              v-for="network of networks"
              :key="network.name"
              :value="network"
            >
              {{ network.name }}
            </option>
          </select>
        </div>
      </div>
      <div>
        <button
          class="button is-primary is-rounded mt-4"
          data-testid="getNetworkId"
          @click="changeNetwork"
        >
          Switch Network to {{ activeNetwork.name }}
        </button>
      </div>
      <div>
        <button
          class="button is-primary is-rounded mt-4"
          data-testid="getNetworkId"
          @click="addNetwork"
        >
          Add Network
        </button>
      </div>
      <div>
        <button
          class="button is-primary is-rounded mt-4"
          data-testid="changeDappNetworkButton"
          @click="changeDappNetwork"
        >
          Switch Network in DApp to {{ activeNetwork.name }}
        </button>
        <div style="padding-top: 8px">
          DApp uses <b>{{ defaultNetworkConfig.name }}</b> network.
        </div>
      </div>
      <p class="red">
        {{ err }}
      </p>
      <p class="is-size-5 has-text-weight-bold mb-4 mt-6">Get Network ID</p>
      <div class="field">
        <div class="is-one-third mb-4">
          <button
            class="button is-primary is-rounded mt-4"
            data-testid="getNetworkId"
            @click="getNetworkId"
          >
            Get ID
          </button>
        </div>
      </div>
      <div>Test <code>eth_getId</code> RPC call.</div>
      <div class="field">
        <Notifications
          v-if="hasNotification"
          :notification="notification"
          class="notification is-info is-light mt-5"
          @hide="clearNotification"
        >
        </Notifications>
      </div>
    </div>
  </div>
</template>
