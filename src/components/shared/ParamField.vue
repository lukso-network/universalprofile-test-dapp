<script setup lang="ts">
import { TokenInfo } from '@/stores'
import { reactive, computed, watch } from 'vue'
import { toWei, Unit } from 'web3-utils'
import ERC725 from '@erc725/erc725.js'
import LSPSelect from './LSPSelect.vue'
import { MethodType } from '../endpoints/SendTransaction.vue'
import { BN } from 'bn.js'

interface ElementType {
  error?: string | undefined
  value: any
}

type Props = {
  info: MethodType
  modelValue: any
  custom?: boolean
}

type Emits = {
  (event: 'update:modelValue', value: any): void
  (event: 'update:error', value: boolean): void
  (event: 'update:isWei', value?: boolean | Unit): void
  (event: 'remove', index: number): void
  (event: 'add', index: number): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const isArray = computed<boolean>(() => props.info.type.match(/\[\]$/) != null)

function makeWei(value: string, hex = false) {
  try {
    const val =
      typeof props.info.isWei === 'string'
        ? toWei(value, props.info.isWei as Unit)
        : toWei(value)
    if (hex) {
      return `0x${new BN(val).toString('hex')}`
    }
    return val
  } catch (err) {
    return ''
  }
}

function handleUnits(e: Event) {
  const { value } = e.target as HTMLSelectElement
  if (!value) {
    emits('update:isWei')
    return
  }
  emits('update:isWei', value as Unit)
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
    case 'uint128':
    case 'uint64':
    case 'uint32':
    case 'uint16':
    case 'uint8':
      if (props.info.isWei) {
        try {
          const val = makeWei(value)
          if (/^-/.test(val)) {
            throw new Error('Unsigned numbers cannot be negative')
          }
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
        if (!/^[0-9_]+$/.test(value)) {
          throw new Error('Invalid number format')
        }
        const val = new BN(value)
        if (val.toString() !== value) {
          throw new Error('Number did not fully parse')
        }
        if (val.isNeg()) {
          throw new Error('Unsigned numbers cannot be negative')
        }
      } catch (err) {
        return { value, error: (err as Error).message }
      }
      return { value }
    case 'int256':
    case 'int128':
    case 'int64':
    case 'int32':
    case 'int16':
    case 'int8':
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
        if (!/^-?[0-9_]+$/.test(value)) {
          throw new Error('Invalid number format')
        }
        const val = new BN(value)
        if (val.toString() !== value) {
          throw new Error('Number did not fully parse')
        }
      } catch (err) {
        return { value, error: (err as Error).message }
      }
      return { value }
    case 'bool':
      if (typeof value === 'boolean') {
        return { value }
      }
      return { value, error: 'Invalid boolean value' }
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

function convert(modelValue: any): ElementType[] {
  const values = isArray.value ? ((modelValue || []) as any[]) : [modelValue]
  return values.map<ElementType>(value => validate(value))
}

const data = reactive<{
  items: ElementType[]
}>({ items: convert(props.modelValue) })

watch(
  () => props.modelValue,
  value => {
    data.items = convert(value)
  }
)

function handleAdd(index: number) {
  const { value, error } = validate(undefined)
  const items = data.items
  items.splice(index + 1, 0, {
    value,
    error,
  })
}

function handleRemove(index: number) {
  const items = data.items
  items.splice(index, 1)
}

const handleChange = (index: number, e: Event) => {
  const { value: _value, checked } = e.target as HTMLInputElement
  let value = props.info.type === 'bool' ? checked : _value
  const item = data.items[index]
  if (value === item.value) {
    return
  }
  const { value: newValue, error: newError } = validate(value)
  if (newValue !== value) {
    value = newValue
  }
  item.value = value
  if (newError) {
    item.error = newError
    emits('update:error', true)
  } else {
    emits(
      'update:modelValue',
      isArray.value ? data.items.map(({ value }) => value) : item.value
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
  if (error) {
    item.error = error
    emits('update:error', true)
  } else {
    emits(
      'update:modelValue',
      isArray.value ? data.items.map(({ value }) => value) : item.value
    )
    if (item.error) {
      item.error = undefined
      const hasError = data.items.some(({ error }) => error != null)
      emits('update:error', hasError)
    }
  }
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
      }}<select
        v-if="props.custom && props.info.type.match(/^u?int256/)"
        :value="props.info.isWei === true ? 'wei' : props.info.isWei"
        class="ml-1"
        @change="handleUnits"
      >
        <option value="">- number -</option>
        <option value="noether">noether</option>
        <option value="wei">wei</option>
        <option value="kwei">kwei</option>
        <option value="Kwei">Kwei</option>
        <option value="babbage">babbage</option>
        <option value="femtoether">femtoether</option>
        <option value="mwei">mwei</option>
        <option value="Mwei">Mwei</option>
        <option value="lovelace">lovelace</option>
        <option value="picoether">picoether</option>
        <option value="gwei">gwei</option>
        <option value="Gwei">Gwei</option>
        <option value="shannon">shannon</option>
        <option value="nanoether">nanoether</option>
        <option value="nano">nano</option>
        <option value="szabo">szabo</option>
        <option value="microether">microether</option>
        <option value="micro">micro</option>
        <option value="finney">finney</option>
        <option value="milliether">milliether</option>
        <option value="milli">milli</option>
        <option value="ether">ether</option>
        <option value="kether">kether</option>
        <option value="grand">grand</option>
        <option value="mether">mether</option>
        <option value="gether">gether</option>
        <option value="tether">tether</option></select
      >{{
        !props.custom && props.info.isWei
          ? typeof props.info.isWei === 'string'
            ? ` ${props.info.isWei}`
            : ' WEI'
          : ''
      }})
    </label>
    <LSPSelect
      v-if="props.info.type.match(/^address/)"
      :show-types="props.info.hasSpecs"
      :address="item.value"
      @option-selected="e => handleSelected(index, e)"
    />
    <div :class="{ control: true, 'has-icons-right': props.info.isWei }">
      <input
        v-if="props.info.type !== 'bool'"
        :value="item.value"
        class="input is-family-code"
        type="text"
        @input="e => handleChange(index, e)"
      />
      <label v-else class="label"
        ><input
          type="checkbox"
          :checked="item.value"
          @input="e => handleChange(index, e)"
        />{{ props.info.name }}</label
      >
      <span
        v-if="props.info.isWei"
        class="icon is-small is-right"
        style="width: 5em"
      >
        <i class="fas fa-envelope">
          {{
            props.info.isWei
              ? typeof props.info.isWei === 'string'
                ? props.info.isWei
                : 'WEI'
              : ''
          }}</i
        >
      </span>
    </div>

    <p v-if="shouldWei(index)" class="help">
      actual value {{ makeWei(item.value) }} ({{ makeWei(item.value, true) }})
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
