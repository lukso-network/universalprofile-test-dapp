<script setup lang="ts">
import { getState, setState } from '@/stores'
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import { ref } from 'vue'
import { createBlockScoutLink } from '@/utils/createLinks'
import { useLspFactory } from '@/compositions/useLspFactory'
import Lsp4MetadataForm from '@/components/shared/Lsp4MetadataForm.vue'
import LSP8Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP8Mintable.json'
import { Lsp4Metadata } from '@/types'
import { ContractStandard } from '@/enums'
import CustomSelect from '@/components/shared/CustomSelect.vue'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'
import useWeb3 from '@/compositions/useWeb3'

type Token = {
  type: ContractStandard
  name: string
  symbol: string
  isNonDivisible: boolean
}

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { contract } = useWeb3()

const isTokenCreated = ref(false)
const isTokenPending = ref(false)
const token = ref<Token>({
  type: ContractStandard.LSP7,
  name: 'My Token',
  symbol: 'MYT',
  isNonDivisible: false,
})
const lsp4Metadata = ref<Lsp4Metadata>({
  description: 'My super description',
  links: [
    {
      title: 'LUKSO Docs',
      url: 'https://docs.lukso.tech',
    },
  ],
})
const tokenAddress = ref<string>()
const { deployLSP7DigitalAsset, deployLSP8IdentifiableDigitalAsset } =
  useLspFactory()

const handleNewLsp4Metadata = (metadata: Lsp4Metadata) => {
  lsp4Metadata.value = metadata
}

const handleStandardSelected = (standard: string) => {
  token.value.type = standard as ContractStandard
}

const create = async () => {
  clearNotification()

  if (isTokenPending.value) {
    return
  }

  const erc725AccountAddress = getState('address')
  isTokenPending.value = true

  try {
    let deployedAsset
    switch (token.value.type) {
      case ContractStandard.LSP7:
        deployedAsset = await deployLSP7DigitalAsset({
          isNFT: token.value.isNonDivisible,
          controllerAddress: erc725AccountAddress,
          name: token.value.name,
          symbol: token.value.symbol,
          digitalAssetMetadata: {
            LSP4Metadata: {
              ...lsp4Metadata.value,
            },
          },
        })
        console.log('Deployed asset', deployedAsset.LSP7DigitalAsset)
        tokenAddress.value = deployedAsset.LSP7DigitalAsset.address
        break
      case ContractStandard.LSP8:
        deployedAsset = await deployLSP8IdentifiableDigitalAsset({
          controllerAddress: erc725AccountAddress,
          name: token.value.name,
          symbol: token.value.symbol,
          digitalAssetMetadata: {
            LSP4Metadata: {
              ...lsp4Metadata.value,
            },
          },
        })
        console.log(
          'Deployed asset',
          deployedAsset.LSP8IdentifiableDigitalAsset
        )
        tokenAddress.value = deployedAsset.LSP8IdentifiableDigitalAsset.address
        const deployedContract = contract(
          LSP8Mintable.abi as any,
          tokenAddress.value,
          {
            gas: DEFAULT_GAS,
            gasPrice: DEFAULT_GAS_PRICE,
          }
        )
        await deployedContract.methods
          .setData(
            '0x715f248956de7ce65e94d9d836bfead479f7e70d69b718d47bfe7b00e05b4fe4', //LSP8TokenIdType
            3
          )
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
    isTokenCreated.value = true
    setState('tokenAddress', tokenAddress.value)
    setNotification('Token created', 'info')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  } finally {
    isTokenPending.value = false
  }
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Assets</p>
      <CustomSelect
        :options="[
          {
            display: ContractStandard.LSP7,
            value: ContractStandard.LSP7,
          },
          {
            display: ContractStandard.LSP8,
            value: ContractStandard.LSP8,
          },
        ]"
        @option-selected="handleStandardSelected"
      />
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
      <Lsp4MetadataForm @new-metadata="handleNewLsp4Metadata" />

      <div v-if="token.type === ContractStandard.LSP7" class="field">
        <label class="checkbox">
          <input
            v-model="token.isNonDivisible"
            type="checkbox"
            :value="token.isNonDivisible"
          />
          is non divisible
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
        <div
          v-if="isTokenCreated"
          class="notification is-info is-light mt-5"
          data-testid="info"
        >
          <p class="">
            Token address:
            <b
              ><a
                :href="createBlockScoutLink(tokenAddress ?? '')"
                target="_blank"
                data-testid="token-address"
                >{{ tokenAddress }}</a
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
