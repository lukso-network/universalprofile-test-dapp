<script setup lang="ts">
import {
  getState,
  LSPType,
  TokenInfo,
  sampleUP,
  sampleEoA,
  sampleSC,
} from '@/stores'

type Props = {
  address?: string
  type: LSPType
  showUp: boolean
  showAny: boolean
}

type Emits = {
  (event: 'optionSelected', option: TokenInfo): void
}

const emits = defineEmits<Emits>()
const props = defineProps<Props>()

const handleChange = (e: Event) => {
  emits('optionSelected', JSON.parse((e?.target as any)?.value || '{}'))
}

const isSelected = (type: LSPType, address?: string) => {
  const foundAddress =
    (getState('lsp7').concat(getState('lsp8')) as TokenInfo[]).find(
      ({ address }) => props.address === address
    ) != null
  if (!foundAddress) {
    return props.type === type && address == null
  }
  return props.type === type && props.address === address
}
</script>

<template>
  <div class="field">
    <div class="select is-fullwidth mb-2">
      <select data-testid="preset" @change="handleChange">
        <optgroup label="UP">
          <option
            v-if="props.showAny"
            :value="
              JSON.stringify({ type: LSPType.UP, address: getState('address') })
            "
            :selected="isSelected(LSPType.UP, getState('address'))"
          >
            current UP
          </option>
          <option
            v-if="props.showAny"
            :value="
              JSON.stringify({ type: LSPType.UP, address: getState('address') })
            "
            :selected="isSelected(LSPType.UP, sampleUP)"
          >
            sample UP
          </option>
        </optgroup>
        <optgroup label="SC">
          <option
            v-if="props.showAny"
            :value="JSON.stringify({ type: LSPType.SC, address: sampleSC })"
            :selected="isSelected(LSPType.SC, sampleSC)"
          >
            sample SC
          </option>
        </optgroup>
        <optgroup label="'EOA'">
          <option
            v-if="props.showAny"
            :value="JSON.stringify({ type: LSPType.EoA, address: sampleEoA })"
            :selected="isSelected(LSPType.EoA, sampleEoA)"
          >
            sample SC
          </option>
        </optgroup>
        <optgroup label="LSP7">
          <option
            v-if="props.showAny"
            :value="JSON.stringify({ type: 'LSP7DigitalAsset' })"
            :selected="isSelected(LSPType.LSP7DigitalAsset)"
          >
            Any LSP7
          </option>
          <option
            v-for="option in getState('lsp7')"
            :key="option.address"
            :value="JSON.stringify(option)"
            :selected="isSelected(option.type, option.address)"
          >
            LSP7 {{ option.name }} ({{ option.symbol }}) @ {{ option.address }}
          </option>
        </optgroup>
        <optgroup label="LSP8">
          <option
            v-if="props.showAny"
            :value="JSON.stringify({ type: 'LSP8IdentifiableDigitalAsset' })"
            :selected="isSelected(LSPType.LSP8IdentifiableDigitalAsset)"
          >
            Any LSP8
          </option>
          <option
            v-for="option in getState('lsp8')"
            :key="option.address"
            :value="JSON.stringify(option)"
            :selected="isSelected(option.type, option.address)"
          >
            LSP8 {{ option.name }} ({{ option.symbol }}) @ {{ option.address }}
          </option>
        </optgroup>
      </select>
    </div>
  </div>
</template>
