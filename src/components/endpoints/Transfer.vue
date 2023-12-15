<script setup lang="ts">
import { getState } from '@/stores'
import { ref } from 'vue'
import { Contract } from 'web3-eth-contract'
import useNotifications from '@/compositions/useNotifications'
import LSP7Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json'
import LSP8Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP8Mintable.json'
import Notifications from '@/components/Notification.vue'
import { toWei } from 'web3-utils'
import { ContractStandard } from '@/enums'
import LSPSelect from '@/components/shared/LSPSelect.vue'
import { padLeft } from 'web3-utils'
import { LSPType, TokenInfo } from '@/helpers/tokenUtils'
import useWeb3Connection from '@/compositions/useWeb3Connection'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { contract } = useWeb3Connection()

const tokenType = ref<ContractStandard>(ContractStandard.LSP7)
const tokenId = ref<string>('')
const myToken = ref<Contract>()
const transferToken = ref<string>()
const transferReceiver = ref<string>()
const transferAmount = ref(1)
const transferForce = ref(false)

const handleTokenSelected = (info: TokenInfo) => {
  tokenType.value =
    info.type === LSPType.LSP7DigitalAsset
      ? ContractStandard.LSP7
      : ContractStandard.LSP8
  if (info.address) {
    transferToken.value = info.address
  }
}

const handleTokenReceiverSelected = (info: TokenInfo) => {
  if (info.address) {
    transferReceiver.value = info.address
  }
}
const handleBlurTokenId = (event: Event) => {
  const value = (event?.target as HTMLInputElement)?.value
  try {
    const newVal = padLeft(value, 64)
    if (newVal !== value) {
      tokenId.value = newVal
    }
  } catch (err) {
    console.error(err)
    // ignore
  }
}

const transfer = async () => {
  clearNotification()
  const erc725AccountAddress = getState('address')
  switch (tokenType.value) {
    case ContractStandard.LSP7:
      myToken.value = contract(LSP7Mintable.abi as any, transferToken.value)

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
      break
    case ContractStandard.LSP8:
      if (!tokenId.value) {
        setNotification('Token ID needs to be filled', 'danger')
        return
      }

      myToken.value = contract(LSP8Mintable.abi as any, transferToken.value)

      try {
        await myToken.value.methods
          .transfer(
            erc725AccountAddress,
            transferReceiver.value,
            tokenId.value,
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
      break
    default:
      console.log('Standard not supported')
  }
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Transfer</p>

      <div class="field">
        <label class="label">Token address</label>
        <LSPSelect
          :address="transferToken"
          :show-types="[
            LSPType.LSP7DigitalAsset,
            LSPType.LSP8IdentifiableDigitalAsset,
            LSPType.ERC20,
            LSPType.ERC777,
          ]"
          @option-selected="handleTokenSelected"
        />
        <div class="control">
          <input
            v-model="transferToken"
            class="input is-family-code"
            type="text"
            data-testid="transfer-address"
          />
        </div>
      </div>
      <div class="field">
        <label class="label">Transfer address</label>
        <LSPSelect
          :show-accounts="true"
          :address="transferReceiver"
          @option-selected="handleTokenReceiverSelected"
        />
        <div class="control">
          <input
            v-model="transferReceiver"
            class="input is-family-code"
            type="text"
            data-testid="transfer-address"
          />
        </div>
      </div>
      <div v-if="tokenType === ContractStandard.LSP7" class="field">
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
      <div v-else class="field">
        <label class="label">Token id (on blur converts to bytes32)</label>
        <div class="control">
          <input
            v-model="tokenId"
            class="input"
            type="text"
            data-testid="transfer-address"
            placeholder="0xbb204573da1a42ab80f38995444b17124110b946ba189157ffcc7ba2b3375bf8"
            @blur="handleBlurTokenId"
          />
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
