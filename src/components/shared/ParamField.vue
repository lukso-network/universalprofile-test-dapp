<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import {
  toWei,
  Unit,
  padLeft,
  padRight,
  numberToHex,
  hexToNumber,
} from 'web3-utils'
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js'
import LSPSelect from '@/components/shared/LSPSelect.vue'
import { BN } from 'bn.js'
import { MethodType } from '@/helpers/functionUtils'
import { TokenInfo } from '@/helpers/tokenUtils'
import LSP3ProfileMetadata from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json'
import LSP4DigitalAsset from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json'
import LSP9Vault from '@erc725/erc725.js/schemas/LSP9Vault.json'

const schemas = [...LSP3ProfileMetadata, ...LSP4DigitalAsset, ...LSP9Vault]

interface ElementType {
  error?: string | undefined
  value: any
  decoder?: string
  decoded?: any
  decodedError?: string
}

type Props = {
  info: MethodType
  modelValue: any
  custom?: boolean
  testidPrefix?: string
  dataDecoder?: boolean
}

type Emits = {
  (event: 'update:modelValue', value: any): void
  (event: 'update:error', value: boolean): void
  (event: 'update:isWei', value?: Unit): void
  (event: 'update:isKey', value?: boolean): void
  (event: 'remove', index: number): void
  (event: 'add', index: number): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const methodInfo = computed<MethodType>(() => props.info || {})
const isArray = computed<boolean>(
  () => methodInfo.value.type?.match(/\[\]$/) != null
)

function makeWei(_value: string, hex = false) {
  try {
    const value =
      typeof _value === 'string' && _value.startsWith('0x')
        ? _value
        : numberToHex(_value)
    const val = methodInfo.value.isWei
      ? toWei(
          hexToNumber(value, true).toString(),
          methodInfo.value.isWei as Unit
        )
      : value
    if (hex) {
      return padLeft(val, 64)
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

function handleIsKey(e: Event) {
  const { checked } = e.target as HTMLInputElement
  emits('update:isKey', checked)
}

function validate(value: any): { value: any; error?: string } {
  switch (methodInfo.value.type.replace(/\[\]$/, '')) {
    case 'address':
      if (/^(0x)?[0-9a-f]{40}/i.test(value)) {
        if (!value.startsWith('0x')) {
          return { value: `0x${value}` }
        }
        return { value }
      }
      return { value, error: 'Invalid address value' }
    case 'bytes':
      if (/^0x([0-9a-f][0-9a-f])*/i.test(value)) {
        return { value }
      }
      if (!value) {
        return { value: '0x' }
      }
      return { value, error: 'Invalid bytes value' }
    case 'uint256':
    case 'uint128':
    case 'uint64':
    case 'uint32':
    case 'uint16':
    case 'uint8':
      if (methodInfo.value.isWei) {
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
        if (!value.startsWith('0x')) {
          return { value: `0x${value}` }
        }
        return { value }
      }
      try {
        if (!/^[0-9_]+$/.test(value)) {
          throw new Error('Invalid number format')
        }
        const val = new BN(value) // Validate parsing so no numberToHex
        if (val.toString() !== value) {
          console.log(
            'not parsed',
            val.toString(),
            value,
            typeof val.toString(),
            typeof value
          )
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
      if (methodInfo.value.isWei) {
        try {
          makeWei(value)
        } catch (err) {
          return { value, error: (err as Error).message }
        }
        return { value }
      }
      if (/^(0x)?[0-9a-f]{64}$/i.test(value)) {
        if (!value.startsWith('0x')) {
          return { value: `0x${value}` }
        }
        return { value }
      }
      try {
        if (!/^-?[0-9_]+$/.test(value)) {
          throw new Error('Invalid number format')
        }
        const val = new BN(value) // Validate parsing so no numberToHex
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
    case 'bytes31':
    case 'bytes30':
    case 'bytes29':
    case 'bytes28':
    case 'bytes27':
    case 'bytes26':
    case 'bytes25':
    case 'bytes24':
    case 'bytes23':
    case 'bytes22':
    case 'bytes21':
    case 'bytes20':
    case 'bytes19':
    case 'bytes18':
    case 'bytes17':
    case 'bytes16':
    case 'bytes15':
    case 'bytes14':
    case 'bytes13':
    case 'bytes12':
    case 'bytes11':
    case 'bytes10':
    case 'bytes9':
    case 'bytes8':
    case 'bytes7':
    case 'bytes6':
    case 'bytes5':
    case 'bytes4':
    case 'bytes3':
    case 'bytes2':
    case 'bytes1':
      if (methodInfo.value.isKey) {
        try {
          const items = (value || '').split(',')
          ERC725.encodeKeyName(items[0], items.slice(1))
        } catch (err) {
          return { value, error: (err as Error).message }
        }
        return { value }
      }
      if (/^(0x)?[0-9a-f]{64}$/i.test(value)) {
        if (!value.startsWith('0x')) {
          return { value: `0x${value}` }
        }
        return { value }
      }
      if (/[0-9]+/.test(value)) {
        return { value }
      }
      return { value, error: 'Invalid data format' }
  }
  return { value, error: `Unsupported type ${methodInfo.value.type}` }
}

function convert(modelValue: any): ElementType[] {
  const values = isArray.value ? ((modelValue || []) as any[]) : [modelValue]
  return values.map<ElementType>(value => validate(value))
}

// eslint-disable-next-line vue/no-setup-props-destructure
const data = reactive<{
  items: ElementType[]
  // eslint-disable-next-line vue/no-setup-props-destructure
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
  let value = methodInfo.value.type === 'bool' ? checked : _value
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

const handleLSP = (index: number, e: Event) => {
  const { value } = e.target as HTMLInputElement
  const item = data.items[index]
  item.decoder = value
  try {
    const [keyName] = value.split(',')
    item.decodedError = undefined

    const output = ERC725.decodeData(
      [{ keyName, value: item.value }],
      schemas as ERC725JSONSchema[]
    )
    const decoded = (output as any[]).find(
      ({ name }) => name === keyName
    )?.value
    if (decoded) {
      if (typeof decoded === 'object') {
        item.decoded = JSON.stringify(decoded, null, 2)
      } else {
        item.decoded = decoded
      }
    }
  } catch (error: any) {
    item.decodedError = error.message
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
  return methodInfo.value.isWei && !item.error && item.value
}

const shouldBytes32 = (index: number) => {
  const item = data.items[index]
  if (/^bytes32/.test(methodInfo.value.type)) {
    if (
      /^[0-9]+$/.test(item.value) ||
      (methodInfo.value.isKey && !item.value?.startsWith('0x'))
    ) {
      return true
    }
  }
  return false
}

const makeBytes32 = (index: number, force = false) => {
  const item = data.items[index]
  if (/^bytes32/.test(methodInfo.value.type)) {
    if (
      (force || methodInfo.value.isKey) &&
      !item.value?.startsWith('0x') &&
      /^[a-z0-9]+$/i.test(item.value)
    ) {
      const items = (item.value || '').split(',')
      try {
        return ERC725.encodeKeyName(items[0], items.slice(1))
      } catch (err) {
        return (err as Error).message
      }
    }
    if (/^0x[0-9a-f]*$/i.test(item.value)) {
      return padRight(item.value, 64)
    }
    if (/^[0-9]*$/.test(item.value)) {
      return padLeft(item.value, 64)
    }
  }
  return item.value
}

const hasError = (index: number) => {
  const item = data.items[index]
  return item.error
}
</script>

<template>
  <div
    v-for="(item, index) of data.items"
    :key="index"
    class="field"
    style="max-width: 100%"
  >
    <label v-if="methodInfo.type !== 'bool'" class="label"
      >{{
        methodInfo.label
          ? methodInfo.label
          : isArray
            ? `${methodInfo.name}[${index + 1}]`
            : methodInfo.name
      }}
      ({{ methodInfo.type.replace(/\[\]$/, '')
      }}<select
        v-if="props.custom && methodInfo.type.match(/^u?int256/)"
        :value="methodInfo.isWei"
        :readonly="props.dataDecoder"
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
      >{{ !props.custom && methodInfo.isWei ? methodInfo.isWei : ''
      }}<label v-if="/^bytes32/.test(methodInfo.type)" class="ml-2"
        ><input
          type="checkbox"
          :readonly="props.dataDecoder"
          :checked="methodInfo.isKey"
          :data-testid="props.testidPrefix + methodInfo.name + '_isKey'"
          @input="handleIsKey"
        />&nbsp;Encode LSP DataKey</label
      >)
    </label>
    <LSPSelect
      v-if="methodInfo.type.match(/^address/)"
      :show-types="methodInfo.hasSpecs"
      :readonly="props.dataDecoder"
      :address="item.value"
      @option-selected="(e: TokenInfo) => handleSelected(index, e)"
    />
    <div :class="{ control: true, 'has-icons-right': methodInfo.isWei }">
      <input
        v-if="methodInfo.type !== 'bool'"
        :value="item.value"
        :readonly="props.dataDecoder"
        class="input is-family-code"
        type="text"
        :data-testid="props.testidPrefix + methodInfo.name"
        @input="e => handleChange(index, e)"
      />
      <label v-else class="label"
        ><input
          type="checkbox"
          :checked="item.value"
          :readonly="props.dataDecoder"
          :data-testid="props.testidPrefix + methodInfo.name"
          @input="e => handleChange(index, e)"
        />&nbsp;{{
          methodInfo.label
            ? methodInfo.label
            : isArray
              ? `${methodInfo.name}[${index + 1}]`
              : methodInfo.name
        }}
        ({{ methodInfo.type.replace(/\[\]$/, '') }})</label
      >
      <span
        v-if="methodInfo.isWei"
        class="icon is-small is-right"
        style="width: 5em"
      >
        <i class="fas fa-envelope"> {{ methodInfo.isWei || '' }}</i>
      </span>
    </div>

    <p v-if="shouldBytes32(index)" class="help" style="overflow-wrap: anywhere">
      actual value {{ makeBytes32(index) }}
    </p>
    <p v-if="shouldWei(index)" class="help" style="overflow-wrap: anywhere">
      actual value {{ makeWei(item.value) }} ({{ makeWei(item.value, true) }})
    </p>
    <div v-if="props.dataDecoder" class="w-100">
      <div>
        <label>LSP Decoder</label
        ><input
          :value="item.decoder"
          class="input is-family-code"
          type="text"
          @input="e => handleLSP(index, e)"
        />
      </div>
      <pre v-if="item.decoded" class="help" style="overflow-x: scroll">{{
        item.decoded
      }}</pre>
      <p
        v-if="item.decodedError"
        class="help is-danger"
        style="overflow-wrap: anywhere"
      >
        {{ item.decodedError }}
      </p>
    </div>
    <p v-if="hasError(index)" class="help is-danger">{{ hasError(index) }}</p>
    <div v-if="!props.dataDecoder && isArray" class="mt-1">
      <button @click="handleAdd(index)">Add</button
      ><button v-if="data?.items?.length > 0" @click="handleRemove(index)">
        Remove
      </button>
    </div>
  </div>
  <div v-if="!props.dataDecoder && isArray && data?.items?.length === 0">
    <label class="label">{{
      methodInfo.label
        ? methodInfo.label
        : isArray
          ? `${methodInfo.name}`
          : methodInfo.name
    }}</label>
    <button @click="handleAdd(0)">Add</button>
  </div>
</template>
