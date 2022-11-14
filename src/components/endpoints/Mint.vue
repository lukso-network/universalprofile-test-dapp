<script setup lang="ts">
import { getState } from '@/stores'
import { ref, watchEffect } from 'vue'
import { Contract } from 'web3-eth-contract'
import useNotifications from '@/compositions/useNotifications'
import useWeb3 from '@/compositions/useWeb3'
import LSP7Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'
import Notifications from '@/components/Notification.vue'
import { toWei } from 'web3-utils'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { contract } = useWeb3()

const myToken = ref<Contract>()
const mintToken = ref<string>()
const mintReceiver = ref<string>()
const mintAmount = ref(100)

watchEffect(() => {
  mintReceiver.value = getState('address')
  mintToken.value = getState('tokenAddress')
})

const mint = async () => {
  clearNotification()
  const erc725AccountAddress = getState('address')

  try {
    myToken.value = contract(LSP7Mintable.abi as any, mintToken.value, {
      gas: DEFAULT_GAS,
      gasPrice: DEFAULT_GAS_PRICE,
    })

    await myToken.value.methods
      .mint(mintReceiver.value, toWei(mintAmount.value.toString()), false, '0x')
      .send({ from: erc725AccountAddress })
      .on('receipt', function (receipt: any) {
        console.log(receipt)
      })
      .once('sending', (payload: any) => {
        console.log(JSON.stringify(payload, null, 2))
      })
    setNotification('Token minted', 'info')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Mint</p>
      <div class="field">
        <label class="label">Token address</label>
        <div class="control">
          <input
            v-model="mintToken"
            class="input"
            type="text"
            data-testid="transfer-address"
          />
        </div>
      </div>
      <div class="field">
        <label class="label">Mint address</label>
        <div class="control">
          <input
            v-model="mintReceiver"
            class="input"
            type="text"
            data-testid="mint-address"
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
            />
          </div>
        </div>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3 mr-3"
          data-testid="mint"
          @click="mint"
        >
          Mint
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
    </div>
  </div>
</template>
