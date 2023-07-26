<script setup lang="ts">
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import { DEFAULT_NETWORK, NETWORKS } from '@/helpers/config'
import { sendRequest } from '@/helpers/customRequest'
import { ref } from 'vue'

export type NetworkInfo = {
  id: string
  name: string
  isCustom: boolean
  http: { url: string }
  ws: { url: string }
  chainId: string
  relayer?: { url?: string }
  explorer?: { url?: string }
}

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()

const defaultNetwork: NetworkInfo = {
  name: NETWORKS[DEFAULT_NETWORK].name,
  http: NETWORKS[DEFAULT_NETWORK].rpc,
  ws: {
    url: 'wss://ws-rpc.testnet.lukso.network',
  },
  relayer: {
    url: 'https://relayer.testnet.lukso.network/api',
  },
  explorer: NETWORKS[DEFAULT_NETWORK].blockscout,
  isCustom: false,
  id: 'testnet',
  chainId: '0x1069',
}

const networkId = ref('')
const err = ref('')
const activeNetwork = ref<NetworkInfo>(defaultNetwork)

const networks = [
  {
    name: 'Lukso Testnet',
    http: {
      url: 'https://rpc.testnet.lukso.network/',
    },
    ws: {
      url: 'wss://ws-rpc.testnet.lukso.network',
    },
    relayer: {
      url: 'https://relayer.testnet.lukso.network/api',
    },
    explorer: {
      url: 'https://explorer.execution.testnet.lukso.network/tx/{transactionId}/internal-transactions',
    },
    isCustom: false,
    id: 'testnet',
    chainId: '0x1069',
  },
  {
    name: 'Lukso Mainnet',
    http: {
      url: 'https://rpc.mainnet.lukso.network/',
    },
    ws: {
      url: 'wss://ws-rpc.mainnet.lukso.network',
    },
    relayer: {
      url: 'https://relayer.mainnet.lukso.network/api',
    },
    explorer: {
      url: 'https://explorer.execution.mainnet.lukso.network/tx/{transactionId}/internal-transactions',
    },
    isCustom: false,
    id: 'mainnet',
    chainId: '0x2a',
  },
  {
    name: 'L16 Testnet',
    http: {
      url: 'https://rpc.l16.lukso.network',
    },
    ws: {
      url: 'wss://ws.rpc.l16.lukso.network',
    },
    relayer: {
      url: 'https://service-relayer.staging.lukso.dev/api',
    },
    explorer: {
      url: 'https://explorer.execution.l16.lukso.network/tx/{transactionId}/internal-transactions',
    },
    isCustom: false,
    id: 'l16',
    chainId: '0xb0c',
  },
]

const getNetworkId = async () => {
  clearNotification()

  try {
    networkId.value = await sendRequest({ method: 'eth_getId' })

    setNotification(networkId.value, 'info')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}

const changeNetwork = async () => {
  try {
    await sendRequest({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: activeNetwork.value.chainId,
        },
      ],
    })
  } catch (error) {
    console.error(error)
    setNotification((error as unknown as Error).message, 'danger')
  }
}

const addNetwork = async () => {
  try {
    await sendRequest({
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
