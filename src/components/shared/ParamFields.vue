<script setup lang="ts">
import { reactive } from 'vue'
import { toWei, Unit } from 'web3-utils'
import { MethodType } from '../endpoints/SendTransaction.vue'
import ParamField from './ParamField.vue'

interface ElementType extends MethodType {
  error?: boolean
  value: any
}
type Props = {
  info: MethodType[]
  modelValue: any
}

type Emits = {
  (event: 'update:modelValue', value: any): void
  (event: 'update:error', value: boolean): void
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const data = reactive<{ items: ElementType[] }>({
  items: props.info.map((info: MethodType, index) => {
    let value = props.modelValue?.[index] || undefined
    if (info.type.match(/\[\]$/) && !value) {
      value = []
    }
    return {
      ...info,
      value,
      error: false,
    }
  }),
})

function handleValue(param: number, value: any) {
  const item = data.items[param]
  item.value.value = value
  emits(
    'update:modelValue',
    data.items.map(({ value, isWei }) => {
      if (isWei) {
        if (typeof isWei === 'string') {
          return toWei(value, isWei as Unit)
        }
        return toWei(value)
      }
      return value
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
</script>

<template>
  <div
    v-for="(item, index) of data.items"
    :key="index"
    :class="{ field: true, box: true, 'is-error': item.error }"
  >
    <ParamField
      :model-value="item.value"
      :info="item"
      @update:error="e => handleError(index, e)"
      @update:model-value="e => handleValue(index, e)"
    />
  </div>
</template>
