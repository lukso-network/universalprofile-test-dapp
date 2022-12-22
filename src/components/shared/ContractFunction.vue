<script setup lang="ts">
import useWeb3 from '@/compositions/useWeb3'
import { BN } from 'bn.js'
import { reactive, computed, watch, onMounted } from 'vue'
import { toWei, Unit } from 'web3-utils'
import { MethodSelect, MethodType } from '../endpoints/SendTransaction.vue'
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

const SIGNATURE_CACHE = 'signature-cache'

type BytesSignatureResponse = {
  count: number
  next: unknown
  previous: unknown
  results: [
    {
      id: number
      created_at: string
      text_signature: string
      hex_signature: string
      bytes_signature: string
    }
  ]
}

const fetcher = async <Response, Request>(config: {
  url: string
  method: 'GET' | 'POST'
  data?: Request
  headers?: Record<string, never>
}): Promise<Response> => {
  const fetchConfig: RequestInit = {
    method: config.method,
    headers: config.headers || {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }
  if (config.data) {
    fetchConfig.body = JSON.stringify(config.data)
  }

  const response = await fetch(config.url, fetchConfig)

  if (!response.ok) {
    return response
      .json()
      .catch(() => {
        throw new Error(response.status.toString())
      })
      .then(message => {
        throw message
      })
  }
  return await response.json()
}

const decodeData = async (data: string): Promise<MethodSelect> => {
  if (/^0x/i.test(data)) {
    data = data.substring(2)
  }
  const selector = data?.substring(0, 8)
  if (selector) {
    const signatureCache = await caches.open(SIGNATURE_CACHE)
    const url = `https://www.4byte.directory/api/v1/signatures/?hex_signature=${selector}`
    const functionSignatureResponse = await signatureCache.match(url)
    if (functionSignatureResponse) {
      return await functionSignatureResponse.json()
    }

    const methods = await fetcher<BytesSignatureResponse, void>({
      method: 'GET',
      url,
    })

    if (methods && methods.results.length > 0) {
      for (const result of methods.results) {
        try {
          const params: string[] = result.text_signature
            .replace(/^[^(]*\(|\)[^)]*$/g, '')
            .split(',')
          const args = eth.abi.decodeParameters(params, data.substring(8))
          const encodeArgs = Array(params.length)
            .fill(null)
            .map((_val, index) => args[`${index}`] ?? '0x')
          const newData = eth.abi
            .encodeParameters(params, encodeArgs)
            .substring(2)
          if (data.substring(8) === newData) {
            const item = {
              label: `Decoded ${result.text_signature.replace(/\(.*$/, '')}`,
              call: result.text_signature.replace(/\(.*$/, ''),
              inputs: params.map((type, index) => ({
                type,
                name: `arg${index + 1}`,
                value: args[index],
              })),
            }
            await signatureCache.put(url, new Response(JSON.stringify(item)))
            return item
          }
        } catch (err) {
          // Ignore to try next record
          console.error(err)
        }
      }
    }
  }
  throw new Error(`Unable to decode data`)
}

function convertModel(model?: MethodType[]) {
  model =
    model?.map((info: MethodType) => {
      let value = info.value ?? undefined
      if (info.type.match(/\[\]$/) && value == null) {
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

const call = computed<string>(() => {
  if (!data.call) {
    return ''
  }
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

const makeBytes32 = (value: string, type: string) => {
  if (type === 'bytes32') {
    if (/^[0-9]*$/.test(value)) {
      return `0x${new BN(value).toString('hex', 64)}`
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
    console.error(err)
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
      const method = await decodeData(value)
      data.call = method.call
      data.items = method.inputs || []
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
        <input class="input" :value="call" @change="handleCall" />
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
      v-if="!props.onlyParams && !props.hideData"
      :class="{ box: true, 'is-danger': output.error }"
    >
      <div style="overflow-wrap: anywhere">{{ output.value }}</div>
    </div>
    <p v-if="output.error" class="help is-danger">{{ output.error }}</p>
  </div>
</template>
