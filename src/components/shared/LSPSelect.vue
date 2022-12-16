<script setup lang="ts">
import { getState, LSPType, TokenInfo } from '@/stores'
import { ref } from 'vue'

type Props = {
  address?: string
  type: LSPType
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
        <optgroup label="LSP7">
          <option
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
