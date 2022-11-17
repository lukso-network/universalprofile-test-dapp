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
const transferToken = ref<string>()
const transferReceiver = ref<string>()
const transferAmount = ref(1)
const transferForce = ref(false)

watchEffect(() => {
  transferToken.value = getState('tokenAddress')
})

const transfer = async () => {
  clearNotification()
  const erc725AccountAddress = getState('address')

  myToken.value = contract(LSP7Mintable.abi as any, transferToken.value, {
    gas: DEFAULT_GAS,
    gasPrice: DEFAULT_GAS_PRICE,
  })

  try {
    await myToken.value.methods
      .transfer(
        erc725AccountAddress,
        transferReceiver.value,
        toWei(transferAmount.value.toString()),
        transferForce.value,
        '0x'
      )
      .send({ from: erc725AccountAddress })
      .on('receipt', function (receipt: any) {
        console.log(receipt)
      })
      .once('sending', (payload: any) => {
        console.log(JSON.stringify(payload, null, 2))
      })
    setNotification('Token transferred', 'info')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Transfer</p>
      <div class="field">
        <label class="label">Token address</label>
        <div class="control">
          <input
            v-model="transferToken"
            class="input"
            type="text"
            data-testid="transfer-address"
          />
        </div>
      </div>
      <div class="field">
        <label class="label">Transfer address</label>
        <div class="control">
          <input
            v-model="transferReceiver"
            class="input"
            type="text"
            data-testid="transfer-address"
          />
        </div>
      </div>
      <div class="field">
        <label class="label">Transfer amount</label>
        <div class="control columns">
          <div class="column is-one-third">
            <input
              v-model="transferAmount"
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
          data-testid="transfer"
          @click="transfer"
        >
          Transfer
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