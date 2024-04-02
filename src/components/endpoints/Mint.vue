<script setup lang="ts">
import { getState } from '@/stores'
import { onMounted, ref, watchEffect } from 'vue'
import { Contract } from 'web3-eth-contract'
import useNotifications from '@/compositions/useNotifications'
import LSP7Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json'
import LSP8Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP8Mintable.json'
import Notifications from '@/components/Notification.vue'
import { BN } from 'bn.js'
import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js'
import { Lsp4Metadata } from '@/types'
import Lsp4MetadataForm from '@/components/shared/Lsp4MetadataForm.vue'
import {
  ContractStandard,
  LSP8TokenIdTypes,
  LSP8TokenIdTypesData,
} from '@/enums'
import LSPSelect from '@/components/shared/LSPSelect.vue'
import {
  TokenInfo,
  LSPType,
  padTokenId,
  encodeAssetMetadata,
} from '@/helpers/tokenUtils'
import useWeb3Connection from '@/compositions/useWeb3Connection'
import useErc725 from '@/compositions/useErc725'
import LSP8IdentifiableDigitalAsset from '@erc725/erc725.js/schemas/LSP8IdentifiableDigitalAsset.json'
import { isHex } from 'web3-utils'
import { isAddress } from 'ethers/lib/utils'
import { LSP8_TOKEN_ID_FORMAT } from '@lukso/lsp-smart-contracts'
import { uploadAssetData } from '@/utils/uploadAssetData'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { contract } = useWeb3Connection()

const tokenType = ref<ContractStandard>(ContractStandard.LSP7)
const myToken = ref<Contract>()
const mintTokenAddress = ref<string>()
const tokenId = ref<string>()
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
const creators = ref<string[]>([getState('address')])
const tokenIdType = ref()
const tokenIdTypeError = ref<string>()

onMounted(() => {
  mintReceiver.value = getState('address')
  mintTokenAddress.value = getState('tokenAddress')
})

watchEffect(async () => {
  if (mintTokenAddress.value && tokenType.value === ContractStandard.LSP8) {
    const { getInstance } = useErc725()
    const erc725 = getInstance(
      mintTokenAddress.value,
      LSP8IdentifiableDigitalAsset as ERC725JSONSchema[]
    )
    const lsp8DigitalAsset = await erc725.fetchData('LSP8TokenIdType')
    tokenIdType.value = Number(lsp8DigitalAsset.value)
  }
})

const handleNewLsp4Metadata = (
  metadata: Lsp4Metadata,
  newCreators: string[]
) => {
  lsp4Metadata.value = metadata
  creators.value = newCreators
}

const handleTokenSelected = (info: TokenInfo) => {
  tokenType.value =
    info.type === LSPType.LSP7DigitalAsset
      ? ContractStandard.LSP7
      : ContractStandard.LSP8
  if (info.address) {
    mintTokenAddress.value = info.address
  }
}

const handleMintReceiverSelected = (info: TokenInfo) => {
  if (info.address) {
    mintReceiver.value = info.address
  }
}

const handleChangeTokenId = (event: Event) => {
  const value = (event?.target as HTMLInputElement)?.value
  tokenIdTypeError.value = ''

  switch (tokenIdType.value) {
    case LSP8_TOKEN_ID_FORMAT.NUMBER:
      if (isNaN(parseInt(value))) {
        return (tokenIdTypeError.value = 'Must be a number')
      }
      break
    case LSP8_TOKEN_ID_FORMAT.STRING:
      if (value.length > 32) {
        return (tokenIdTypeError.value =
          'Must be a string with less than 32 characters')
      }
      break
    case LSP8_TOKEN_ID_FORMAT.UNIQUE_ID:
      if (!isHex(value)) {
        return (tokenIdTypeError.value = 'Must be a byte string')
      }
      break
    case LSP8_TOKEN_ID_FORMAT.HASH:
      if (value.length !== 66 || !isHex(value)) {
        return (tokenIdTypeError.value = 'Must be a 32byte hash')
      }
      break
    case LSP8_TOKEN_ID_FORMAT.ADDRESS:
      if (!isAddress(value)) {
        return (tokenIdTypeError.value = 'Must be a valid address')
      }
      break
    default:
      return
  }

  tokenId.value = value
}

const mint = async () => {
  clearNotification()
  const erc725AccountAddress = getState('address')

  try {
    switch (tokenType.value) {
      case ContractStandard.LSP7:
        myToken.value = contract(LSP7Mintable.abi as any, mintTokenAddress.value)

        const decimals = await myToken.value.methods.decimals().call()
        const amount = decimals === 0
          ? mintAmount.value.toString()
          : new BN(mintAmount.value).mul(new BN(10).pow(new BN(decimals)))

        await myToken.value.methods
          .mint(mintReceiver.value, amount.toString(), false, '0x')
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
          tokenIdTypeError.value = `Can't be blank`
          return
        }

        const assetMetadata = await uploadAssetData(lsp4Metadata.value)
        const metadataJsonUrl = encodeAssetMetadata(assetMetadata)

        // mint asset
        myToken.value = contract(LSP8Mintable.abi as any, mintTokenAddress.value)
        const tokenIdPadded = padTokenId(tokenIdType.value, tokenId.value)
        await myToken.value.methods
          .mint(mintReceiver.value, tokenIdPadded, false, '0x')
          .send({ from: erc725AccountAddress })
          .on('receipt', function (receipt: any) {
            console.log(receipt)
          })
          .once('sending', (payload: any) => {
            console.log(JSON.stringify(payload, null, 2))
          })

        // set asset metadata
        const tokenIdTypeData = LSP8TokenIdTypesData[tokenIdType.value]
        const metadataKey = ERC725.encodeKeyName(
          `LSP8MetadataTokenURI:<${tokenIdTypeData}>`,
          tokenId.value
        )
        await myToken.value.methods
          .setData(metadataKey, metadataJsonUrl) // TODO replace fixed metadata with values from the form
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
          :address="mintTokenAddress"
          :show-types="[
            LSPType.LSP7DigitalAsset,
            LSPType.LSP8IdentifiableDigitalAsset,
          ]"
          @option-selected="handleTokenSelected"
        />
        <div class="control">
          <input
            v-model="mintTokenAddress"
            class="input is-family-code"
            type="text"
            data-testid="transfer-address"
          />
        </div>
      </div>
      <div v-if="tokenType === ContractStandard.LSP8" class="field">
        <label class="label"
          >Token Id ({{ LSP8TokenIdTypes[tokenIdType] }} in
          {{ LSP8TokenIdTypesData[tokenIdType] }})</label
        >
        <div class="control">
          <input
            v-model="tokenId"
            class="input"
            :class="{ 'is-danger': tokenIdTypeError }"
            type="text"
            data-testid="transfer-address"
            placeholder="Enter token Id"
            @keyup="handleChangeTokenId"
          />
          <p v-if="tokenIdTypeError" class="help is-danger">
            {{ tokenIdTypeError }}
          </p>
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
          <div class="column is-half">
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
        <Lsp4MetadataForm @new-metadata="handleNewLsp4Metadata" />
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
