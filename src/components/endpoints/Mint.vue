<script setup lang="ts">
import { getState } from '@/stores'
import { ref, watchEffect } from 'vue'
import { Contract } from 'web3-eth-contract'
import useNotifications from '@/compositions/useNotifications'
import useWeb3 from '@/compositions/useWeb3'
import LSP7Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json'
import LSP8Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP8Mintable.json'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'
import Notifications from '@/components/Notification.vue'
import { toWei } from 'web3-utils'
import { ERC725 } from '@erc725/erc725.js'
import { Lsp4Metadata } from '@/types'
import Lsp4MetadataForm from '@/components/shared/Lsp4MetadataForm.vue'
import { ContractStandard } from '@/enums'
import LSPSelect from '@/components/shared/LSPSelect.vue'
import { padLeft } from 'web3-utils'
import { TokenInfo, LSPType } from '@/helpers/tokenUtils'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { contract } = useWeb3()

const tokenType = ref<ContractStandard>(ContractStandard.LSP7)
const myToken = ref<Contract>()
const mintToken = ref<string>()
const tokenId = ref<string>(padLeft(1, 64))
const mintReceiver = ref<string>()
const mintAmount = ref(100)
const lsp4Metadata = ref<Lsp4Metadata>({
  description: 'My super description',
  links: [
    {
      title: 'LUKSO Docs',
      url: 'https://docs.lukso.tech',
    },
  ],
})

const metadataJsonUrl =
  '0x6f357c6a6143da573459ba01321df3eb223e96b0015c2914a1907df319804573d538c311697066733a2f2f516d51357071797167637a6d6b736e4e434a734a76333453664469776e4676426d64456f74704254337642464865'

watchEffect(() => {
  mintReceiver.value = getState('address')
  mintToken.value = getState('tokenAddress')
})

const handleTokenSelected = (info: TokenInfo) => {
  tokenType.value =
    info.type === LSPType.LSP7DigitalAsset
      ? ContractStandard.LSP7
      : ContractStandard.LSP8
  if (info.address) {
    mintToken.value = info.address
  }
}

const handleMintReceiverSelected = (info: TokenInfo) => {
  if (info.address) {
    mintReceiver.value = info.address
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

const mint = async () => {
  clearNotification()
  const erc725AccountAddress = getState('address')

  try {
    switch (tokenType.value) {
      case ContractStandard.LSP7:
        myToken.value = contract(LSP7Mintable.abi as any, mintToken.value, {
          gas: DEFAULT_GAS,
          gasPrice: DEFAULT_GAS_PRICE,
        })

        await myToken.value.methods
          .mint(
            mintReceiver.value,
            toWei(mintAmount.value.toString()),
            false,
            '0x'
          )
          .send({ from: erc725AccountAddress })
          .on('receipt', function (receipt: any) {
            console.log(receipt)
          })
          .once('sending', (payload: any) => {
            console.log(JSON.stringify(payload, null, 2))
          })
        break
      case ContractStandard.LSP8:
        if (!tokenId.value) {
          setNotification('Token ID needs to be filled', 'danger')
          return
        }

        myToken.value = contract(LSP8Mintable.abi as any, mintToken.value, {
          gas: DEFAULT_GAS,
          gasPrice: DEFAULT_GAS_PRICE,
        })

        await myToken.value.methods
          .mint(mintReceiver.value, tokenId.value, false, '0x')
          .send({ from: erc725AccountAddress })
          .on('receipt', function (receipt: any) {
            console.log(receipt)
          })
          .once('sending', (payload: any) => {
            console.log(JSON.stringify(payload, null, 2))
          })

        const metadataKey = ERC725.encodeKeyName(
          'LSP8MetadataJSON:<bytes32>',
          tokenId.value
        )
        await myToken.value.methods
          .setData(metadataKey, metadataJsonUrl)
          .send({ from: erc725AccountAddress })
          .on('receipt', function (receipt: any) {
            console.log(receipt)
          })
          .once('sending', (payload: any) => {
            console.log(JSON.stringify(payload, null, 2))
          })
        break
      default:
        console.log('Standard not supported')
    }

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
        <LSPSelect
          :address="mintToken"
          :show-types="[
            LSPType.LSP7DigitalAsset,
            LSPType.LSP8IdentifiableDigitalAsset,
          ]"
          @option-selected="handleTokenSelected"
        />
        <div class="control">
          <input
            v-model="mintToken"
            class="input is-family-code"
            type="text"
            data-testid="transfer-address"
          />
        </div>
      </div>
      <div v-if="tokenType === ContractStandard.LSP8" class="field">
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
        <label class="label">Mint address</label>
        <LSPSelect
          :show-accounts="true"
          :address="mintReceiver"
          @option-selected="handleMintReceiverSelected"
        />
        <div class="control">
          <input
            v-model="mintReceiver"
            class="input is-family-code"
            type="text"
            data-testid="mint-address"
          />
        </div>
      </div>
      <div v-if="tokenType === ContractStandard.LSP7" class="field">
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
      <div v-else>
        <Lsp4MetadataForm disabled :new-metadata="lsp4Metadata" />
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
