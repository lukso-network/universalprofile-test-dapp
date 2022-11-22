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
import {LinkMetdata} from "@lukso/lsp-factory.js";
import {ERC725} from "@erc725/erc725.js";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { contract } = useWeb3()

type Lsp4Metadata = {
  description: string
  links: LinkMetdata[]
  icon?: File
  images?: File[]
}

const tokenType = ref<'LSP7' | 'LSP8'>('LSP7')
const myToken = ref<Contract>()
const mintToken = ref<string>()
const tokenId = ref<string>()
const mintReceiver = ref<string>()
const mintAmount = ref(100)
const metadata = ref<Lsp4Metadata>({
  description: 'My super token id description',
  links: [
    {
      title: 'LUKSO Docs',
      url: 'https://docs.lukso.tech',
    },
  ],
});

const metadataJsonUrl = '0x6f357c6a6143da573459ba01321df3eb223e96b0015c2914a1907df319804573d538c311697066733a2f2f516d51357071797167637a6d6b736e4e434a734a76333453664469776e4676426d64456f74704254337642464865'

watchEffect(() => {
  mintReceiver.value = getState('address')
  mintToken.value = getState('tokenAddress')
})


const handleTokenIcon = (event: Event) => {
  const target = event.target as HTMLInputElement
  metadata.value.icon = (target.files as FileList)[0]
}

const handleTokenImages = (event: Event) => {
  const target = event.target as HTMLInputElement
  metadata.value.images = Array.from(target.files as FileList)
}

const addLink = () => {
  metadata.value.links.push({
    title: '',
    url: '',
  })
}

const removeLink = (index: number) => {
  metadata.value.links.splice(index, 1)
}

const handleLinkTitleChange = (index: number, event: Event) => {
  metadata.value.links[index].title = (event.target as HTMLInputElement).value
}

const handleLinkUrlChange = (index: number, event: Event) => {
  metadata.value.links[index].url = (event.target as HTMLInputElement).value
}

const mint = async () => {
  clearNotification()
  const erc725AccountAddress = getState('address')

  try {
    if (tokenType.value === 'LSP7') {
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
    } else {
      if (!tokenId.value) return; // TODO throw

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

      const metadataKey = ERC725.encodeKeyName('LSP8MetadataJSON:<bytes32>', tokenId.value);
      await myToken.value.methods
          .setData(metadataKey, metadataJsonUrl)
          .send({ from: erc725AccountAddress })
          .on('receipt', function (receipt: any) {
            console.log(receipt)
          })
          .once('sending', (payload: any) => {
            console.log(JSON.stringify(payload, null, 2))
          })
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
        <label class="select">
          <select
              v-model="tokenType"
              name="type"
              :value="tokenType"
          >
            <option value="LSP7" selected>LSP7</option>
            <option value="LSP8">LSP8</option>
          </select>
        </label>
      </div>
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
      <div v-if="tokenType === 'LSP8'" class="field">
        <label class="label">Token id (!: only bytes32, no uint256)</label>
        <div class="control">
          <input
              v-model="tokenId"
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
      <div v-if="tokenType === 'LSP7'" class="field">
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
        <div class="field">
          <label class="label">Token Icon</label>
          <div class="control">
            <input class="input" type="file" disabled @change="handleTokenIcon"/>
          </div>
        </div>
        <div class="field">
          <label class="label">Token Images</label>
          <div class="control">
            <input
                class="input"
                type="file"
                multiple
                disabled
                @change="handleTokenImages"
            />
          </div>
        </div>
        <div class="field">
          <label class="label">Token Description</label>
          <div class="control">
            <textarea v-model="metadata.description" class="input" disabled/>
          </div>
        </div>
        <div class="field">
          <label class="label">Token Links</label>
          <div
              v-for="(link, index) in metadata.links"
              :key="index"
              class="control mb-2 is-flex"
          >
            <input
                :v-model="link.title"
                :value="link.title"
                class="input mr-2"
                type="text"
                placeholder="Title"
                disabled
                @keyup="event => handleLinkTitleChange(index, event)"
            />
            <input
                :v-model="link.url"
                :value="link.url"
                class="input"
                type="text"
                placeholder="URL"
                disabled
                @keyup="event => handleLinkUrlChange(index, event)"
            />
            <button class="button ml-2" disabled @click="removeLink(index)">Remove</button>
          </div>
          <button class="button" data-testid="addLink" disabled @click="addLink">
            Add link
          </button>
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
