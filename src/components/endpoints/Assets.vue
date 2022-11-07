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
import { useLspFactory } from '@/compositions/useLspFactory'
import type { LinkMetdata } from '@lukso/lsp-factory.js'

type Token = {
  name: string
  symbol: string
  isNFT: boolean
  description: string
  links: LinkMetdata[]
  icon?: File
  images?: File[]
}

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { contract } = useWeb3()

const myToken = ref<Contract>()
const isTokenCreated = ref(false)
const isTokenMinted = ref(false)
const isTokenPending = ref(false)
const token = ref<Token>({
  name: 'My LSP7 Token',
  symbol: 'LSP7',
  description: 'My test Token description',
  links: [
    {
      title: 'LUKSO Docs',
      url: 'https://docs.lukso.tech',
    },
  ],
  isNFT: false,
})
const mintReceiver = ref<string>()
const mintAmount = ref(100)
const tokenAddress = ref<string>()
const { deployLSP7DigitalAsset } = useLspFactory()

watchEffect(() => {
  mintReceiver.value = getState('address')
})

const handleTokenIcon = (event: Event) => {
  const target = event.target as HTMLInputElement
  token.value.icon = (target.files as FileList)[0]
}

const handleTokenImages = (event: Event) => {
  const target = event.target as HTMLInputElement
  token.value.images = Array.from(target.files as FileList)
}

const addLink = () => {
  token.value.links.push({
    title: '',
    url: '',
  })
}

const removeLink = (index: number) => {
  token.value.links.splice(index, 1)
}

const handleLinkTitleChange = (index: number, event: Event) => {
  token.value.links[index].title = (event.target as HTMLInputElement).value
}

const handleLinkUrlChange = (index: number, event: Event) => {
  token.value.links[index].url = (event.target as HTMLInputElement).value
}

const create = async () => {
  if (isTokenPending.value) {
    return
  }

  const erc725AccountAddress = getState('address')
  isTokenPending.value = true

  try {
    const deployedAsset = await deployLSP7DigitalAsset({
      isNFT: token.value.isNFT,
      controllerAddress: erc725AccountAddress,
      name: token.value.name,
      symbol: token.value.symbol,
      digitalAssetMetadata: {
        LSP4Metadata: {
          description: token.value.description,
          links: token.value.links,
          icon: token.value.icon,
          images: token.value.images,
        },
      },
    })
    console.log('Deployed asset', deployedAsset.LSP7DigitalAsset)
    tokenAddress.value = deployedAsset.LSP7DigitalAsset.address
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

  try {
    myToken.value = contract(LSP7Mintable.abi as any, tokenAddress.value, {
      gas: DEFAULT_GAS,
      gasPrice: DEFAULT_GAS_PRICE,
    })

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
        <label class="label">Token Icon</label>
        <div class="control">
          <input class="input" type="file" @change="handleTokenIcon" />
        </div>
      </div>
      <div class="field">
        <label class="label">Token Images</label>
        <div class="control">
          <input
            class="input"
            type="file"
            multiple
            @change="handleTokenImages"
          />
        </div>
      </div>
      <div class="field">
        <label class="label">Token Description</label>
        <div class="control">
          <textarea v-model="token.description" class="input" />
        </div>
      </div>
      <div class="field">
        <label class="label">Token Links</label>
        <div
          v-for="(link, index) in token.links"
          :key="index"
          class="control mb-2 is-flex"
        >
          <input
            :v-model="link.title"
            :value="link.title"
            class="input mr-2"
            type="text"
            placeholder="Title"
            @keyup="event => handleLinkTitleChange(index, event)"
          />
          <input
            :v-model="link.url"
            :value="link.url"
            class="input"
            type="text"
            placeholder="URL"
            @keyup="event => handleLinkUrlChange(index, event)"
          />
          <button class="button ml-2" @click="removeLink(index)">Remove</button>
        </div>
        <button class="button" data-testid="addLink" @click="addLink">
          Add link
        </button>
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
          v-if="isTokenCreated"
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
