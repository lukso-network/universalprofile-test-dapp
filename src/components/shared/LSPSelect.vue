<script setup lang="ts">
import {
  getState,
  LSPType,
  TokenInfo,
  sampleUP,
  sampleEoA,
  sampleSC,
  erc20TokenWithEip165,
  erc20TokenWithoutEip165,
  erc777TokenWithEip165,
  erc777TokenWithoutEip165,
  erc721TokenWithEip165,
} from '@/stores'
import { ref, computed, onMounted, watch } from 'vue'

type Props = {
  address?: string
  type?: LSPType
  showUp?: boolean
  showAny?: boolean
  showLspType?: boolean
  showAccounts?: boolean
}

type Emits = {
  (event: 'optionSelected', option: TokenInfo): void
}

const emits = defineEmits<Emits>()
const props = defineProps<Props>()
const selected = ref<string | undefined>()

const data = computed<{ [key: string]: TokenInfo[] }>(() => {
  const data: { [key: string]: TokenInfo[] } = {}
  let items: TokenInfo[]

  if (props.showUp || props.showAccounts) {
    items = data[LSPType.UP] = []
    items.push({
      type: LSPType.UP,
      address: getState('address'),
      label: 'My UP',
    })
    items.push({
      type: LSPType.UP,
      address: sampleUP,
      label: `Sample UP ${sampleUP.substring(0, 10)}...`,
    })
  }

  if (props.showAny || props.showAccounts) {
    items = data[LSPType.SC] = []
    items.push({
      type: LSPType.SC,
      address: sampleSC,
      label: `Sample SC ${sampleSC.substring(0, 10)}...`,
    })

    items = data[LSPType.EoA] = []
    items.push({
      type: LSPType.EoA,
      address: sampleEoA,
      label: `Sample EoA ${sampleEoA.substring(0, 10)}...`,
    })
  }

  if (props.showAny) {
    items = data[LSPType.ERC20] = []
    items.push({
      type: LSPType.ERC20,
      address: erc20TokenWithEip165,
      label: `Sample ERC20+Eip165 ${erc20TokenWithEip165.substring(0, 10)}...`,
    })
    items.push({
      type: LSPType.ERC20,
      address: erc20TokenWithoutEip165,
      label: `Sample ERC20-Eip165 ${erc20TokenWithoutEip165.substring(
        0,
        10
      )}...`,
    })

    items = data[LSPType.ERC777] = []
    items.push({
      type: LSPType.ERC777,
      address: erc777TokenWithEip165,
      label: `Sample ERC777+Eip165 ${erc777TokenWithEip165.substring(
        0,
        10
      )}...`,
    })
    items.push({
      type: LSPType.ERC777,
      address: erc777TokenWithoutEip165,
      label: `Sample ERC777-Eip165 ${erc777TokenWithoutEip165.substring(
        0,
        10
      )}...`,
    })

    items = data[LSPType.ERC721] = []
    items.push({
      type: LSPType.ERC721,
      address: erc721TokenWithEip165,
      label: `Sample ERC721+Eip165 ${erc721TokenWithEip165.substring(
        0,
        10
      )}...`,
    })
  }

  let children = getState('lsp7')
  if (children.length > 0 || props.showLspType) {
    items = data[LSPType.LSP7DigitalAsset] = []
    if (props.showLspType) {
      items.push({ type: LSPType.LSP7DigitalAsset, label: 'Any LSP7' })
    }
    items.push(...children)
  }

  children = getState('lsp8')
  if (children.length > 0 || props.showLspType) {
    items = data[LSPType.LSP8IdentifiableDigitalAsset] = []
    if (props.showLspType) {
      items.push({
        type: LSPType.LSP8IdentifiableDigitalAsset,
        label: 'Any LSP8',
      })
    }
    items.push(...children)
  }

  return data
})

const handleChange = (e: Event) => {
  const item: TokenInfo | undefined = Object.entries(data.value)
    .map(([, items]: [string, TokenInfo[]]) =>
      items.find(
        ({ address, type }) =>
          [address, type].indexOf((e?.target as any)?.value) !== -1
      )
    )
    .find((item: TokenInfo | undefined) => item != null)

  if (item) {
    emits('optionSelected', item)
  }
}

watch(
  () => props.address,
  address => {
    selected.value = address
  }
)

const selectFirst = () => {
  const first = Object.entries(data.value)[0]?.[1]?.find(
    ({ address }) => address
  )
  if (first) {
    selected.value = first.address
    const e = { target: { value: first.address } }
    handleChange(e as any)
  } else {
    const first = Object.entries(data.value)[0]?.[1]?.[0]
    if (first) {
      selected.value = first.type
      const e = { target: { value: first.type } }
      handleChange(e as any)
    }
  }
}

watch(
  () => {
    return getState('lsp7').concat(getState('lsp8'))
  },
  () => {
    if (!selected.value) {
      selectFirst()
    }
  }
)

onMounted(() => {
  selectFirst()
})
</script>

<template>
  <div class="field">
    <div class="select is-fullwidth">
      <select v-model="selected" @change="handleChange">
        <optgroup
          v-for="(items, label) of data"
          :key="label"
          :label="`${label}`"
        >
          <option
            v-for="option in items"
            :key="option.address"
            :value="option.address || option.type"
          >
            {{ option.label }}
          </option>
        </optgroup>
      </select>
    </div>
  </div>
</template>
