<script setup lang="ts">
import { getState } from '@/stores'
import { LSPType, TokenInfo } from '@/helpers/tokenUtils'
import { getSelectedNetworkConfig } from '@/helpers/config'
import { ref, onMounted, watch } from 'vue'

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
  errorContract,
} = getSelectedNetworkConfig()
const emits = defineEmits<Emits>()
const props = defineProps<Props>()
// eslint-disable-next-line vue/no-setup-props-destructure
const selected = ref<string | undefined>(props.address)

const data = ref<{ [key: string]: TokenInfo[] }>({})

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
  if (props.address) {
    const corresponding: undefined | TokenInfo = Object.entries(
      data.value
    ).reduce((first: undefined | TokenInfo, [, items]) => {
      if (first) {
        return first
      }
      const found = items.find(({ address }) => address === props.address)
      return found
    }, undefined)
    if (corresponding && selected.value !== corresponding.type) {
      selected.value = corresponding.address
      const e = { target: { value: corresponding.address } }
      handleChange(e as any)
    }
  } else {
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
}

let timeout: NodeJS.Timeout | undefined
function triggerSelectFirst() {
  if (timeout) {
    clearTimeout(timeout)
  }
  timeout = setTimeout(() => {
    timeout = undefined
    selectFirst()
  }, 2)
}

watch(
  () => data.value,
  () => {
    triggerSelectFirst()
  }
)

watch(
  () => {
    return [
      getState('lsp7'),
      getState('lsp8'),
      getState('address'),
      props.address,
    ]
  },
  ([lsp7, lsp8, address]) => {
    const newData: { [key: string]: TokenInfo[] } = {}
    let items: TokenInfo[]
    if (
      props.showUp ||
      props.showAccounts ||
      props.showTypes?.includes(LSPType.UP) ||
      props.showTypes == null
    ) {
      items = newData[LSPType.UP] = []
      items.push({
        type: LSPType.UP,
        address,
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
      items = newData[LSPType.SC] = []
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
      items = newData[LSPType.EoA] = []
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
      items = newData[LSPType.ERC20] = []
      items.push({
        type: LSPType.ERC20,
        address: erc20TokenWithEip165,
        label: `Sample ERC20+Eip165 ${erc20TokenWithEip165.substring(0, 10)}...`,
      })
      items.push({
        type: LSPType.ERC20,
        address: erc20TokenWithoutEip165,
        label: `Sample ERC20-Eip165 ${erc20TokenWithoutEip165.substring(0, 10)}...`,
      })
    }
    if (
      props.showAny ||
      props.showTypes?.includes(LSPType.ERC777) ||
      props.showTypes == null
    ) {
      items = newData[LSPType.ERC777] = []
      items.push({
        type: LSPType.ERC777,
        address: erc777TokenWithEip165,
        label: `Sample ERC777+Eip165 ${erc777TokenWithEip165.substring(0, 10)}...`,
      })
      items.push({
        type: LSPType.ERC777,
        address: erc777TokenWithoutEip165,
        label: `Sample ERC777-Eip165 ${erc777TokenWithoutEip165.substring(0, 10)}...`,
      })
    }
    if (
      props.showAny ||
      props.showTypes?.includes(LSPType.ERC721) ||
      props.showTypes == null
    ) {
      items = newData[LSPType.ERC721] = []
      items.push({
        type: LSPType.ERC721,
        address: erc721TokenWithEip165,
        label: `Sample ERC721+Eip165 ${erc721TokenWithEip165.substring(0, 10)}...`,
      })
    }
    if (
      props.showAny ||
      props.showTypes?.includes(LSPType.ERROR_TEST) ||
      props.showTypes == null
    ) {
      items = newData[LSPType.ERROR_TEST] = []
      items.push({
        type: LSPType.ERROR_TEST,
        address: errorContract,
        label: 'ErrorTesting Contract...',
      })
    }

    let children: Array<{ type: LSPType; label: string }>
    if (
      props.showTypes
        ? props.showTypes.includes(LSPType.LSP7DigitalAsset)
        : true
    ) {
      children = lsp7
      if (children.length > 0 || props.showLspType) {
        items = newData[LSPType.LSP7DigitalAsset] = []
        if (props.showLspType) {
          items.push({ type: LSPType.LSP7DigitalAsset, label: 'Any LSP7' })
        }
        items.push({
          type: LSPType.LSP7DigitalAsset,
          label: 'LUKSO Community Token (LYXC)',
          address: '0x6395b330F063F96579aA8F7b59f2584fb9b6c3a5',
        })
        items.push(...children)
      }
    }

    if (
      props.showTypes
        ? props.showTypes.includes(LSPType.LSP8IdentifiableDigitalAsset)
        : true
    ) {
      children = lsp8
      if (children.length > 0 || props.showLspType) {
        items = newData[LSPType.LSP8IdentifiableDigitalAsset] = []
        if (props.showLspType) {
          items.push({
            type: LSPType.LSP8IdentifiableDigitalAsset,
            label: 'Any LSP8',
          })
        }
        items.push(...children)
      }
    }
    data.value = newData

    setTimeout(() => {
      timeout = undefined
      triggerSelectFirst()
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
