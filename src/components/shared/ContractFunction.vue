<script setup lang="ts">
import useWeb3 from '@/compositions/useWeb3'
import { reactive, computed } from 'vue'
import { toWei, Unit } from 'web3-utils'
import { MethodType } from '../endpoints/SendTransaction.vue'
import ParamField from './ParamField.vue'

interface ElementType extends MethodType {
  error?: boolean
}
type Props = {
  call?: string
  modelValue?: MethodType[]
  custom?: boolean
  onlyParams?: boolean
}

type Emits = {
  (event: 'update:modelValue', value: any): void
  (event: 'update:error', value: boolean): void
  (event: 'update:data', value: string): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const { getWeb3 } = useWeb3()
const { eth } = getWeb3()

const data = reactive<{ call?: string; items: ElementType[] }>({
  call: props.call,
  items:
    props.modelValue?.map((info: MethodType, index) => {
      let value = info.value || undefined
      if (info.type.match(/\[\]$/) && !value) {
        value = []
      }
      return {
        ...info,
        value,
        error: false,
      }
    }) || [],
})

function makeValue(value: string, isWei?: Unit | boolean) {
  if (isWei) {
    try {
      if (typeof isWei === 'string') {
        return toWei(value, isWei)
      }
      return toWei(value)
    } catch (err) {
      return undefined
    }
  }
  return value
}

function handleValue(param: number, value: any) {
  const item = data.items[param]
  item.value = value
  emits(
    'update:modelValue',
    data.items.map(({ value, isWei }) => {
      if (Array.isArray(value)) {
        return value.map(value => makeValue(value, isWei))
      }
      return makeValue(value, isWei)
    })
  )
}

function handleError(param: number, error?: boolean) {
  const item = data.items[param]
  if (item.error !== error) {
    item.error = error
    emits(
      'update:error',
      data.items.some(({ error }) => error)
    )
  }
}

function handleUnit(param: number, isWei?: boolean | Unit) {
  const item = data.items[param]
  if (isWei) {
    item.isWei = isWei
  } else {
    delete item.isWei
  }
}

const call = computed<string>(() => {
  return `${data.call}(${data.items
    ?.map(({ name, type }) => `${type} ${name}`)
    .join(', ')})`
})

function handleCall(e: Event) {
  const { value } = e.target as HTMLTextAreaElement
  const [_all, newCall, newArgs] =
    /^([a-z_]*)\(([^)]*)\)$/i.exec(value || '') || []
  if (!_all) {
    return
  }
  try {
    data.items = newArgs
      .split(',')
      .map((item: string) => item.trim().split(/\s+/))
      .map(([type, name], index) => {
        const old = data.items.find(({ name: _name }) => _name === name) || {}
        name = name || `input_${index + 1}`
        if (
          !/^(bytes(32)?|u?int(8|16|32|64|128|256)|string|bool|address)(\[\])?$/.test(
            type
          )
        ) {
          throw new Error('syntax error')
        }
        return {
          ...old,
          type,
          name,
          value: /\[\]$/.test(type) ? [] : '',
        } as ElementType
      })
    data.call = newCall
  } catch (err) {
    // Ignore
    console.error(err)
  }
}

const output = computed<{ error: boolean; value: string }>(() => {
  try {
    const output = `${eth.abi.encodeFunctionSignature(
        `${data.call}(${data.items.map(({ type }) => type).join(',')})`
      )}${eth.abi
        .encodeParameters(
          data.items.map(({ type }) => type),
          data.items.map(({ value, type, isWei }) =>
            /^bytes/.test(type) ? value ?? '0x' : makeValue(value, isWei) || ''
          )
        )
        .substring(2)}`
    emits('update:data', output)
    return {
      error: false,
      value: output,
    }
  } catch (err) {
    console.error(err, data.items)
    return { error: true, value: (err as Error).message }
  }
})
</script>

<template>
  <div :class="{ box: !props.onlyParams, 'mb-5': true }">
    <div v-if="!props.onlyParams">
      <label class="label">{{
        !props.custom ? `Function ${call}` : 'Function'
      }}</label>
      <div v-if="props.custom" class="field">
        <textarea class="textarea" :value="call" @change="handleCall" />
      </div>
    </div>
    <div
      v-for="(item, index) of data.items"
      :key="index"
      :class="{ field: true, box: true, 'is-error': item.error }"
    >
      <ParamField
        :model-value="item.value"
        :info="item"
        :custom="props.custom"
        @update:error="e => handleError(index, e)"
        @update:model-value="e => handleValue(index, e)"
        @update:is-wei="e => handleUnit(index, e)"
      />
    </div>
    <div
      v-if="!props.onlyParams"
      :class="{ box: true, 'is-danger': output.error }"
    >
      <div style="overflow-wrap: anywhere">{{ output.value }}</div>
    </div>
  </div>
</template>
