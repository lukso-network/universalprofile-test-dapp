<script setup lang="ts">
import useWeb3 from '@/compositions/useWeb3'
import { decodeData, MethodType } from '@/helpers/functionUtils'
import { reactive, computed, watch, onMounted } from 'vue'
import { toWei, Unit, padLeft } from 'web3-utils'
import ParamField from './ParamField.vue'

interface ElementType extends MethodType {
  error?: boolean
}

type Props = {
  call?: string
  modelValue?: MethodType[]
  custom?: boolean
  onlyParams?: boolean
  hideData?: boolean
  data?: string
  testidPrefix?: string
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

const IS_ARRAY_TYPE_REGEXP = /\[\]$/
const SUPPORTED_TYPES_REGEXP =
  /^(bytes(32)?|u?int(8|16|32|64|128|256)|string|bool|address)(\[\])?$/
const FUNCTION_REGEXP = /^([a-z_]*)\(([^)]*)\)$/i

function convertModel(model?: MethodType[]) {
  model =
    model?.map((info: MethodType) => {
      let value = info.value ?? undefined
      if (info.type.match(IS_ARRAY_TYPE_REGEXP) && value == null) {
        value = []
      }
      return {
        ...info,
        value,
        error: false,
      }
    }) || []
  return model
}

const data = reactive<{ call?: string; items: ElementType[] }>({
  call: props.call,
  items: convertModel(props.modelValue),
})

watch(
  () => props.modelValue,
  model => {
    data.items = convertModel(model)
  }
)

function makeValue(value: string, isWei?: Unit) {
  if (isWei) {
    try {
      return toWei(value, isWei)
    } catch (err) {
      return undefined
    }
  }
  return value
}

function handleValue(param: number, value: any) {
  const item = data.items[param]
  item.value = value
  emits('update:modelValue', data.items)
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

function handleUnit(param: number, isWei?: Unit) {
  const item = data.items[param]
  if (isWei) {
    item.isWei = isWei
  } else {
    delete item.isWei
  }
}

function handleIsKey(param: number, isKey?: boolean) {
  const item = data.items[param]
  if (isKey != null) {
    item.isKey = isKey
  } else {
    delete item.isKey
  }
}

const call = computed<string>(() => {
  if (!data.call) {
    return ''
  }
  return `${data.call}(${data.items
    ?.map(({ name, type }) => `${type} ${name}`)
    .join(', ')})`
})

/**
 * Handle updates to function text. Whenever the user changes the function name or definition
 * this will update and create the corresponding input fields required to supply arguments
 * to the function call.
 */
function handleCall(e: Event) {
  const { value } = e.target as HTMLTextAreaElement
  const [_all, newCall, newArgs] = FUNCTION_REGEXP.exec(value || '') || []
  if (!_all) {
    return
  }
  try {
    data.items = newArgs
      .split(',')
      .map((item: string) => item.trim().split(/\s+/))
      .map(([type, name], index) => {
        const old = data.items[index] || {}
        name = name || `input_${index + 1}`
        if (!SUPPORTED_TYPES_REGEXP.test(type)) {
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

const makeBytes32 = (value: string, type: string) => {
  if (type === 'bytes32') {
    if (/^[0-9]*$/.test(value)) {
      return padLeft(value, 64)
    }
  }
  return value
}

const output = computed<{ error: undefined | string; value: string }>(() => {
  try {
    if (!data.call) {
      return { value: '0x', error: undefined }
    }
    const callSig = `${data.call}(${data.items
      .map(({ type }) => type)
      .join(',')})`
    const output = `${eth.abi.encodeFunctionSignature(callSig)}${eth.abi
      .encodeParameters(
        data.items.map(({ type }) => type),
        data.items.map(({ value, type, isWei }) => {
          const makeItem = (value: any) =>
            /^bytes/.test(type)
              ? makeBytes32(value, type) ?? '0x'
              : makeValue(value, isWei) || ''
          if (/\[\]$/.test(type)) {
            return value.map(makeItem)
          }
          return makeItem(value)
        })
      )
      .substring(2)}`
    return {
      error: undefined,
      value: output,
    }
  } catch (err) {
    return { error: (err as Error).message, value: '' }
  }
})

watch(
  () => output.value,
  ({ value }) => {
    emits('update:data', value)
  }
)

watch(
  () => props.call,
  call => (data.call = call)
)

watch(
  () => props.data,
  async value => {
    const { value: _value } = output.value
    if (value && value !== _value) {
      try {
        const method = await decodeData(eth, value)
        data.call = method.call
        data.items = method.inputs || []
      } catch (err) {
        // Ignore
      }
    }
  }
)
onMounted(() => {
  const { value } = output.value || {}
  if (value) {
    emits('update:data', value)
  }
  emits('update:modelValue', data.items)
})
</script>

<template>
  <div :class="{ box: !props.onlyParams, 'mb-5': true }">
    <div v-if="!props.onlyParams">
      <label class="label">{{
        !props.custom ? `Function ${call}` : 'Function'
      }}</label>
      <div v-if="props.custom" class="field">
        <input class="input" :value="call" @input="handleCall" />
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
        :testid-prefix="props.testidPrefix"
        @update:is-key="e => handleIsKey(index, e)"
        @update:error="e => handleError(index, e)"
        @update:model-value="e => handleValue(index, e)"
        @update:is-wei="e => handleUnit(index, e)"
      />
    </div>
    <div
      v-if="!props.onlyParams && !props.hideData"
      :class="{ box: true, 'is-danger': output.error }"
    >
      <div style="overflow-wrap: anywhere">{{ output.value }}</div>
    </div>
    <p v-if="output.error" class="help is-danger">{{ output.error }}</p>
  </div>
</template>
