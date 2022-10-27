<script setup lang="ts">
import { getState } from '@/stores'
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import LSP7Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json'
import useWeb3 from '@/compositions/useWeb3'
import { ref, watchEffect } from 'vue'
import { Contract } from 'web3-eth-contract'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'
import { createBlockScoutLink } from '@/utils/createLinks'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { contract } = useWeb3()

const myToken = ref<Contract>()
const isTokenCreated = ref(false)
const isTokenMinted = ref(false)
const isTokenPending = ref(false)
const token = ref({
  name: 'My LSP7 Token',
  symbol: 'LSP7',
  isNFT: false,
})
const mintReceiver = ref<string>()
const mintAmount = ref(100)

watchEffect(() => {
  mintReceiver.value = getState('address')
})

const create = async () => {
  if (isTokenPending.value) {
    return
  }

  // NOTE: We remove validation as we want to test the extension with wrong, missing parameters.
  // if (!token.value.name) {
  //   return setNotification('Enter token name', 'danger')
  // }

  // if (!token.value.symbol) {
  //   return setNotification('Enter token symbol', 'danger')
  // }

  const erc725AccountAddress = getState('address')
  const tokenParams = [
    token.value.name, // token name
    token.value.symbol, // token symbol
    erc725AccountAddress, // new owner
    token.value.isNFT, // make your token divisible or not
  ]
  isTokenPending.value = true

  try {
    // create an instance
    myToken.value = contract(LSP7Mintable.abi as any, '', {
      gas: DEFAULT_GAS,
      gasPrice: DEFAULT_GAS_PRICE,
    }) // address is empty because we are deploying the contract

    // deploy the token contract
    myToken.value = await myToken.value
      .deploy({ data: LSP7Mintable.bytecode, arguments: tokenParams })
      .send({ from: erc725AccountAddress })
      .on('receipt', function (receipt: any) {
        console.log(receipt)
      })
      .once('sending', (payload: any) => {
        console.log(JSON.stringify(payload, null, 2))
      })
    isTokenCreated.value = true
    setNotification('Token created', 'info')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  } finally {
    isTokenPending.value = false
  }
}

const mint = async () => {
  const erc725AccountAddress = getState('address')

  if (!myToken.value) {
    return setNotification('No token specified', 'danger')
  }

  // NOTE: We remove validation as we want to test the extension with wrong, missing parameters.
  // if (!mintReceiver.value) {
  //   return setNotification('Enter mint address', 'danger')
  // }

  // if (!mintAmount.value) {
  //   return setNotification('Enter mint amount', 'danger')
  // }

  try {
    await myToken.value.methods
      .mint(mintReceiver.value, mintAmount.value, false, '0x')
      .send({ from: erc725AccountAddress })
      .on('receipt', function (receipt: any) {
        console.log(receipt)
      })
      .once('sending', (payload: any) => {
        console.log(JSON.stringify(payload, null, 2))
      })
    isTokenMinted.value = true
    setNotification('Token minted', 'info')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Assets (LSP 7)</p>
      <div class="field">
        <label class="label">Token name</label>
        <div class="control">
          <input v-model="token.name" class="input" type="text" />
        </div>
      </div>
      <div class="field">
        <label class="label">Token symbol</label>
        <div class="control">
          <input v-model="token.symbol" class="input" type="text" />
        </div>
      </div>
      <div class="field">
        <label class="checkbox">
          <input v-model="token.isNFT" type="checkbox" :value="token.isNFT" />
          is NFT
        </label>
      </div>
      <div class="field">
        <button
          :class="`button is-primary is-rounded mb-3 mr-3 ${
            isTokenPending ? 'is-loading' : ''
          }`"
          data-testid="create"
          @click="create"
        >
          Create token
        </button>
      </div>
      <div class="field">
        <label class="label">Mint address</label>
        <div class="control">
          <input
            v-model="mintReceiver"
            class="input"
            type="text"
            data-testid="mint-address"
            :disabled="isTokenCreated ? undefined : true"
          />
        </div>
      </div>
      <div class="field">
        <label class="label">Mint amount</label>
        <div class="control columns">
          <div class="column is-one-third">
            <input
              v-model="mintAmount"
              class="input"
              type="number"
              placeholder="0"
              :disabled="isTokenCreated ? undefined : true"
            />
          </div>
        </div>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3 mr-3"
          :disabled="isTokenCreated ? undefined : true"
          data-testid="mint"
          @click="mint"
        >
          Mint
        </button>
      </div>
      <div class="field">
        <div
          v-if="getState('isConnected') && isTokenCreated"
          class="notification is-info is-light mt-5"
          data-testid="info"
        >
          <p class="">
            Token address:
            <b
              ><a
                :href="createBlockScoutLink(myToken?.options.address ?? '')"
                target="_blank"
                data-testid="token-address"
                >{{ myToken?.options.address }}</a
              ></b
            >
          </p>
        </div>
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
    </div>
  </div>
</template>

<style scoped lang="scss">
.notification {
  word-break: break-all;
}
</style>
