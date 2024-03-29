<script setup lang="ts">
import { decodeData, type MethodType } from '@/helpers/functionUtils'
import { reactive, computed, watch, onMounted } from 'vue'
import { toWei, type Unit, padLeft, numberToHex } from 'web3-utils'
import ParamField from './ParamField.vue'
import useWeb3Connection from '@/compositions/useWeb3Connection'
import ERC725 from '@erc725/erc725.js'

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
  dataDecoder?: boolean
}

type Emits = {
  (event: 'update:modelValue', value: any): void
  (event: 'update:error', value: boolean): void
  (event: 'update:data', value: string): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const { getWeb3 } = useWeb3Connection()

const IS_ARRAY_TYPE_REGEXP = /\[\]$/
const SUPPORTED_TYPES_REGEXP =
  /^(bytes(3[0-2]|2[0-9]|1[0-9]|[1-9])?|u?int(8|16|32|64|128|256)|string|bool|address)(\[\])?$/
const FUNCTION_REGEXP = /^([a-z_]*)\(([^)]*)\)$/i
const ONLYARGS_REGEXP = /^()(.*)$/i

function convertModel(_model?: MethodType[]) {
  const model =
    _model?.map((info: MethodType) => {
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

// eslint-disable-next-line vue/no-setup-props-destructure
const reactiveData = reactive<{ call?: string; items: ElementType[] }>({
  call: props.call,
  // eslint-disable-next-line vue/no-setup-props-destructure
  items: convertModel(props.modelValue),
})

watch(
  () => props.modelValue,
  model => {
    reactiveData.items = convertModel(model)
  }
)
watch(
  () => props.call,
  call => {
    reactiveData.call = call
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
  const item = reactiveData.items[param]
  item.value = value
  emits('update:modelValue', reactiveData.items)
}

function handleError(param: number, error?: boolean) {
  const item = reactiveData.items[param]
  if (item.error !== error) {
    item.error = error
    emits(
      'update:error',
      reactiveData.items.some(({ error }) => error)
    )
  }
}

function handleUnit(param: number, isWei?: Unit) {
  const item = reactiveData.items[param]
  if (isWei) {
    item.isWei = isWei
  } else {
    delete item.isWei
  }
}

function handleIsKey(param: number, isKey?: boolean) {
  const item = reactiveData.items[param]
  if (isKey != null) {
    item.isKey = isKey
  } else {
    delete item.isKey
  }
}

const computedCall = computed<string>(() => {
  return props.dataDecoder
    ? `${reactiveData.items
        ?.map(({ name, type }) => `${type} ${name}`)
        .join(', ')}`
    : reactiveData.call
    ? `${reactiveData.call}(${reactiveData.items
        ?.map(({ name, type }) => `${type} ${name}`)
        .join(', ')})`
    : ''
})

/**
 * Handle updates to function text. Whenever the user changes the function name or definition
 * this will update and create the corresponding input fields required to supply arguments
 * to the function call.
 */
function handleCall(e: Event) {
  const { value } = e.target as HTMLTextAreaElement
  const [_all, newCall, newArgs] = props.dataDecoder
    ? ONLYARGS_REGEXP.exec(value || '') || []
    : FUNCTION_REGEXP.exec(value || '') || []
  if (!_all) {
    return
  }
  try {
    reactiveData.items = newArgs
      .split(',')
      .map((item: string) => item.trim().split(/\s+/))
      .filter(([type]) => type)
      .map(([type, name], index) => {
        const old = reactiveData.items[index] || {}
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
    reactiveData.call = newCall
  } catch (err) {
    // Ignore
    console.error(err)
  }
}

const makeBytes32 = (value: string, type: string) => {
  if (/^bytes32/.test(type)) {
    if (/^[0-9]+$/.test(value)) {
      const hex = numberToHex(value)
      return padLeft(hex, 64)
    }
    if (/^0x[0-9a-f]*$/i.test(value)) {
      return padLeft(value.replace(/^0x/, ''), 64)
    }
    if (/^\w*(:.*,.*)?$/.test(value)) {
      const items = (value || '').split(',')
      try {
        return ERC725.encodeKeyName(items[0], items.slice(1))
      } catch (err) {
        return '0x'
      }
    }
  }
  return value
}

if (props.dataDecoder) {
  watch(
    () => reactiveData.items?.map(({ type }) => type),
    async () => {
      const value = props.data
      if (value) {
        try {
          const { eth } = getWeb3()
          const output = eth.abi.decodeParameters(
            reactiveData.items.map(({ type }) => type),
            value
          )
          for (const [index, item] of Object.entries(output)) {
            if (Number.isNaN(Number(index))) {
              continue
            }
            reactiveData.items[Number(index)].value = item
          }
          emits('update:modelValue', reactiveData.items)
        } catch (err) {
          // Ignore
        }
      }
    }
  )
}

const output = computed<{ error: undefined | string; value: string }>(() => {
  try {
    if (!reactiveData.call && !props.dataDecoder) {
      return { value: '0x', error: undefined }
    }
    const { eth } = getWeb3()
    const callSig = props.dataDecoder
      ? `${reactiveData.items.map(({ type }) => type).join(',')}`
      : `${reactiveData.call}(${reactiveData.items
          .map(({ type }) => type)
          .join(',')})`
    const types = reactiveData.items.map(({ type }) => type)
    const args = reactiveData.items.map(({ value, type, isWei }) => {
      const makeItem = (value: any) =>
        /^bytes32/.test(type)
          ? makeBytes32(value, type) ?? '0x'
          : makeValue(value, isWei) || ''
      if (/\[\]$/.test(type)) {
        return value.map(makeItem)
      }
      return makeItem(value)
    })
    if (props.dataDecoder) {
      return {
        error: undefined,
        value: props.data || '0x',
      }
    }
    const output = `${eth.abi.encodeFunctionSignature(callSig)}${eth.abi
      .encodeParameters(types, args)
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
  () => props.data,
  async value => {
    const { value: _value } = output.value

    if (value && value !== _value) {
      if (props.dataDecoder) {
        try {
          const { eth } = getWeb3()
          const output = eth.abi.decodeParameters(
            reactiveData.items.map(({ type }) => type),
            value
          )
          for (const [index, item] of Object.entries(output)) {
            if (Number.isNaN(Number(index))) {
              continue
            }
            reactiveData.items[Number(index)].value = item
          }
          emits('update:modelValue', reactiveData.items)
        } catch (err) {
          // Ignore
        }
      } else {
        try {
          const { eth } = getWeb3()
          const method = await decodeData(eth, value)
          reactiveData.call = method.call
          reactiveData.items = method.inputs || []
        } catch (err) {
          // Ignore
        }
      }
    }
  }
)
onMounted(() => {
  const { value } = output.value || {}
  if (value) {
    emits('update:data', value)
  }
  emits('update:modelValue', reactiveData.items)
})
</script>

<template>
  <div :class="{ box: !props.onlyParams, 'mb-5': true }">
    <div v-if="!props.onlyParams">
      <label class="label">{{
        props.dataDecoder
          ? 'Decode Types'
          : !props.custom
          ? `Function ${computedCall}`
          : 'Function'
      }}</label>
      <div v-if="props.custom" class="field">
        <input
          class="input"
          data-testid="function-call"
          :value="computedCall"
          @input="handleCall"
        />
      </div>
    </div>
    <div
      v-for="(item, index) of reactiveData.items"
      :key="index"
      :class="{ field: true, box: true, 'is-error': item.error }"
    >
      <ParamField
        :model-value="item.value"
        :info="item"
        :custom="props.custom"
        :data-decoder="props.dataDecoder"
        :testid-prefix="props.testidPrefix"
        @update:is-key="e => handleIsKey(index, e)"
        @update:error="e => handleError(index, e)"
        @update:model-value="e => handleValue(index, e)"
        @update:is-wei="e => handleUnit(index, e)"
      />
    </div>
    <div
      v-if="!props.onlyParams && !props.hideData"
      style="overflow-wrap: anywhere"
      :class="{ box: true, 'is-danger': output.error }"
    >
      <div style="overflow-wrap: anywhere">{{ output.value }}</div>
    </div>
    <p v-if="output.error" class="help is-danger">{{ output.error }}</p>
  </div>
</template>
