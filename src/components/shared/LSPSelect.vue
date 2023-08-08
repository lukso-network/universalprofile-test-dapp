<script setup lang="ts">
import { getState } from '@/stores'
import { LSPType, TokenInfo } from '@/helpers/tokenUtils'
import { getSelectedNetworkConfig } from '@/helpers/config'
import { ref, computed, onMounted, watch } from 'vue'

type Props = {
  address?: string
  type?: LSPType
  showTypes?: LSPType[]
  showUp?: boolean
  showAny?: boolean
  showLspType?: boolean
  showAccounts?: boolean
}

type Emits = {
  (event: 'optionSelected', option: TokenInfo): void
}

const {
  sampleUP,
  sampleEoA,
  sampleSC,
  erc20TokenWithEip165,
  erc20TokenWithoutEip165,
  erc777TokenWithEip165,
  erc777TokenWithoutEip165,
  erc721TokenWithEip165,
} = getSelectedNetworkConfig()
const emits = defineEmits<Emits>()
const props = defineProps<Props>()
const selected = ref<string | undefined>(props.address)

const data = computed<{ [key: string]: TokenInfo[] }>(() => {
  const data: { [key: string]: TokenInfo[] } = {}
  let items: TokenInfo[]

  if (
    props.showUp ||
    props.showAccounts ||
    props.showTypes?.includes(LSPType.UP) ||
    props.showTypes == null
  ) {
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

  if (
    props.showAny ||
    props.showAccounts ||
    props.showTypes?.includes(LSPType.SC) ||
    props.showTypes == null
  ) {
    items = data[LSPType.SC] = []
    items.push({
      type: LSPType.SC,
      address: sampleSC,
      label: `Sample SC ${sampleSC.substring(0, 10)}...`,
    })
  }
  if (
    props.showAny ||
    props.showAccounts ||
    props.showTypes?.includes(LSPType.EoA) ||
    props.showTypes == null
  ) {
    items = data[LSPType.EoA] = []
    items.push({
      type: LSPType.EoA,
      address: sampleEoA,
      label: `Sample EoA ${sampleEoA.substring(0, 10)}...`,
    })
  }

  if (
    props.showAny ||
    props.showTypes?.includes(LSPType.ERC20) ||
    props.showTypes == null
  ) {
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
  }
  if (
    props.showAny ||
    props.showTypes?.includes(LSPType.ERC777) ||
    props.showTypes == null
  ) {
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
  }
  if (
    props.showAny ||
    props.showTypes?.includes(LSPType.ERC721) ||
    props.showTypes == null
  ) {
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

  let children
  if (
    props.showTypes ? props.showTypes.includes(LSPType.LSP7DigitalAsset) : true
  ) {
    children = getState('lsp7')
    if (children.length > 0 || props.showLspType) {
      items = data[LSPType.LSP7DigitalAsset] = []
      if (props.showLspType) {
        items.push({ type: LSPType.LSP7DigitalAsset, label: 'Any LSP7' })
      }
      items.push(...children)
    }
  }
  if (
    props.showTypes
      ? props.showTypes.includes(LSPType.LSP8IdentifiableDigitalAsset)
      : true
  ) {
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
  }
  return data
})

const findItem = (value: string): TokenInfo | undefined => {
  const items = Object.entries(data.value)
    .map(([, items]: [string, TokenInfo[]]) => {
      const found = items.find(
        ({ address, type }) =>
          address?.toLowerCase() === value.toLowerCase() || type === value
      )
      return found
    })
    .find((item: TokenInfo | undefined) => item != null)
  return items
}

const handleChange = (e: Event) => {
  const item = findItem((e?.target as any)?.value)
  if (item) {
    emits('optionSelected', item)
  }
}

const selectFirst = () => {
  const first: undefined | TokenInfo = Object.entries(data.value).reduce(
    (first: undefined | TokenInfo, [, items]) => {
      if (first) {
        return first
      }
      const found = items.find(({ address }) => address != null)
      return found
    },
    undefined
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

let timeout: NodeJS.Timeout | undefined
function triggerSelectFirst() {
  if (timeout) {
    clearTimeout(timeout)
  }
  timeout = setTimeout(() => {
    timeout = undefined
    if (selected.value) {
      return
    }
    selectFirst()
  }, 2)
}

watch(
  () => data.value,
  () => {
    if (selected.value) {
      const item = findItem(selected.value)
      if (item) {
        selected.value = item.address
      }
    } else {
      triggerSelectFirst()
    }
  }
)

watch(
  () => {
    return getState('lsp7')
      .concat(getState('lsp8'))
      .concat([getState('address')])
  },
  () => {
    setTimeout(() => {
      if (!selected.value) {
        triggerSelectFirst()
      }
    }, 100)
  }
)

watch(
  () => props.showTypes,
  () => {
    triggerSelectFirst()
  }
)

onMounted(() => {
  triggerSelectFirst()
})
</script>

<template>
  <div class="field">
    <div class="select is-fullwidth">
      <select v-model="selected" @change="handleChange">
        <option value="">Empty</option>
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
