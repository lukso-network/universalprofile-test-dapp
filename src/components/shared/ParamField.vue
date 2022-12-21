<script setup lang="ts">
import { TokenInfo } from '@/stores'
import { reactive } from 'vue'
import { toWei, Unit } from 'web3-utils'
import ERC725 from '@erc725/erc725.js'
import LSPSelect from './LSPSelect.vue'
import { MethodType } from '../endpoints/SendTransaction.vue'
import { BN } from 'bn.js'

interface ElementType {
  error: string | undefined
  value: any
}
type Props = {
  info: MethodType
  modelValue: any
}

type Emits = {
  (event: 'update:modelValue', value: any): void
  (event: 'update:error', value: boolean): void
  (event: 'remove', index: number): void
  (event: 'add', index: number): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const isArray = props.info.type.match(/\[\]$/)

function makeWei(value: string) {
  if (typeof props.info.isWei === 'string') {
    return toWei(value, props.info.isWei as Unit)
  }
  return toWei(value)
}

function validate(value: any): { value: any; error?: string } {
  switch (props.info.type.replace(/\[\]$/, '')) {
    case 'address':
      if (/^(0x)?[0-9a-f]{40}/i.test(value)) {
        if (!/^0x/.test(value)) {
          return { value: `0x${value}` }
        }
        return { value }
      }
      return { value, error: 'Invalid address value' }
    case 'bytes':
      if (/^0x([0-9a-f][0-9a-f])*/i.test(value)) {
        return { value }
      }
      return { value, error: 'Invalid bytes value' }
    case 'uint256':
      if (props.info.isWei) {
        try {
          makeWei(value)
        } catch (err) {
          return { value, error: (err as Error).message }
        }
        return { value }
      }
      if (/^(0x)?[0-9a-f]{64}$/i.test(value)) {
        if (!/^0x/.test(value)) {
          return { value: `0x${value}` }
        }
        return { value }
      }
      try {
        const val = new BN(value)
        if (val.toString() !== value) {
          throw new Error('Number did not fully parse')
        }
      } catch (err) {
        return { value, error: (err as Error).message }
      }
      return { value }
    case 'string':
      return { value }
    case 'bytes32':
      if (props.info.isKey) {
        try {
          ERC725.encodeKeyName(value)
        } catch (err) {
          return { value, error: (err as Error).message }
        }
        return { value }
      }
      if (/^(0x)?[0-9a-f]{64}$/i.test(value)) {
        if (!/^0x/.test(value)) {
          return { value: `0x${value}` }
        }
        return { value }
      }
      return { value, error: 'Invalid data format' }
  }
  return { value, error: `Unsupported type ${props.info.type}` }
}

function convert() {
  const values = isArray
    ? ((props.modelValue || []) as any[])
    : [props.modelValue]
  const items = values.map(value => ({ value, error: undefined }))
  return { items }
}

const data = reactive<{
  items: ElementType[]
}>(convert())

function handleAdd(index: number) {
  const { value, error } = validate(undefined)
  const items = data.items
  items.splice(index, 0, {
    value,
    error,
  })
}

function handleRemove(index: number) {
  const items = data.items
  items.splice(index, 1)
}

const handleChange = (index: number, e: Event) => {
  let { value } = e.target as HTMLInputElement
  const { value: newValue, error: newError } = validate(value)
  if (newValue !== value) {
    value = newValue
  }
  const item = data.items[index]
  item.value = value
  if (newError) {
    item.error = newError
    emits('update:error', true)
  } else {
    emits(
      'update:modelValue',
      isArray ? data.items.map(({ value }) => value) : item.value
    )
    if (item.error) {
      item.error = undefined
      const hasError = data.items.some(({ error }) => error != null)
      emits('update:error', hasError)
    }
  }
}

const handleSelected = (index: number, info: TokenInfo) => {
  const item = data.items[index]
  const { value, error } = validate(info.address)
  item.value = value
  item.error = error
}

const shouldWei = (index: number) => {
  const item = data.items[index]
  return props.info.isWei && !item.error && item.value
}

const hasError = (index: number) => {
  const item = data.items[index]
  return item.error
}
</script>

<template>
  <div v-for="(item, index) of data.items" :key="index" class="field">
    <label class="label"
      >{{
        props.info.label
          ? props.info.label
          : isArray
          ? `${props.info.name}[${index + 1}]`
          : props.info.name
      }}
      ({{ props.info.type.replace(/\[\]$/, '')
      }}{{
        props.info.isWei
          ? typeof props.info.isWei === 'string'
            ? ` ${props.info.isWei}`
            : ' WEI'
          : ''
      }})</label
    >
    <LSPSelect
      v-if="props.info.type.match(/^address/)"
      :show-types="props.info.hasSpecs"
      :address="item.value"
      @option-selected="e => handleSelected(index, e)"
    />
    <div :class="{ control: true, 'has-icons-right': props.info.isWei }">
      <input
        :value="item.value"
        class="input is-family-code"
        type="text"
        @input="e => handleChange(index, e)"
      />
      <span v-if="props.info.isWei" class="icon is-small is-right">
        <i class="fas fa-envelope">{{
          props.info.isWei
            ? typeof props.info.isWei === 'string'
              ? props.info.isWei
              : 'WEI'
            : ''
        }}</i>
      </span>
    </div>

    <p v-if="shouldWei(index)" class="help">
      actual value {{ makeWei(item.value) }}
    </p>
    <p v-if="hasError(index)" class="help is-danger">{{ hasError(index) }}</p>
    <div v-if="isArray" class="mt-1">
      <button @click="handleAdd(index)">Add</button
      ><button v-if="data.items.length > 0" @click="handleRemove(index)">
        Remove
      </button>
    </div>
  </div>
  <div v-if="isArray && data.items.length === 0">
    <label class="label">{{
      props.info.label
        ? props.info.label
        : isArray
        ? `${props.info.name}`
        : props.info.name
    }}</label>
    <button @click="handleAdd(0)">Add</button>
  </div>
</template>
