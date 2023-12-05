<script setup lang="ts">
import { toWei, numberToHex } from 'web3-utils'
import { ref, watch, reactive, computed } from 'vue'
import { TransactionConfig } from 'web3-core'

import { getState, setState } from '@/stores'
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import useWeb3Connection from '@/compositions/useWeb3Connection'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'
import ContractFunction from '@/components/shared/ContractFunction.vue'
import { MethodSelect, MethodType } from '@/helpers/functionUtils'
import { methodSelectors as methods } from '@/utils/methodSelectors'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { sendTransaction, getBalance } = useWeb3Connection()

const data = ref<string>('')
const hasData = ref(false)
const isPending = ref(false)

watch(
  () => getState('address'),
  newAddress => {
    params.items[0].value = newAddress
  }
)

function makeValue(param: MethodType) {
  const { value: _value, isWei } = param
  if (isWei) {
    const value = typeof _value !== 'string' ? numberToHex(_value) : _value
    return toWei(value, isWei)
  }
  return _value
}

const send = async () => {
  clearNotification()

  const from = makeValue(params.items[0])
  console.log('from', from, params.items)
  let transaction = {
    from,
    to: makeValue(params.items[1]),
    value: makeValue(params.items[2]),
    gas: DEFAULT_GAS,
    gasPrice: DEFAULT_GAS_PRICE,
  } as TransactionConfig
  if (hasData.value) {
    transaction = { ...transaction, data: data.value }
  }

  console.log(transaction)

  try {
    isPending.value = true
    await sendTransaction(transaction)
    setNotification('The transaction was successful')
    setState('balance', await getBalance(from))
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  } finally {
    isPending.value = false
  }
}

const method = reactive<{ item: MethodSelect }>({ item: methods[0] })
const params = reactive<{ items: MethodType[] }>({
  items: [
    { type: 'address', name: 'from', value: getState('address') },
    { type: 'address', name: 'to' },
    { type: 'uint256', isWei: 'ether', name: 'amount', value: '0' },
  ],
})

const selectMethod = (e: Event) => {
  const value = parseInt((e.target as HTMLInputElement).value, 10)
  const { to, amount, ...item } =
    value >= methods.length
      ? items.items[value - methods.length]
      : methods[value]
  Object.entries(item).forEach(([key, val]) => {
    ;(method.item as any)[key] = val
  })
  params.items = params.items.map((param, index) => {
    if (index === 1) {
      if (
        param.hasSpecs?.length !== item.hasSpecs?.length ||
        param.hasSpecs?.some((v: string, i: number) => item.hasSpecs?.[i] !== v)
      ) {
        param.hasSpecs = item.hasSpecs
        param.value = undefined
      }
    }
    return { ...param }
  })
  method.item.call = item.call
  hasData.value = item.call != null
  if (to != undefined) {
    params.items[1].value = to
  }
  if (amount != undefined) {
    params.items[2].value = amount
  }
}

const handleData = (e?: string) => {
  if (data.value !== e || '') {
    data.value = e || ''
  }
}

function loadItems() {
  let items = []
  try {
    items = JSON.parse(localStorage.getItem('up:transactionMenu') || 'bad')
  } catch (err) {
    // ignore
  }
  return items
}

const items = reactive<{ items: MethodSelect[] }>({ items: loadItems() })

function saveItems() {
  localStorage.setItem('up:transactionMenu', JSON.stringify(items.items))
}

const handleAdd = (e: Event) => {
  e.stopPropagation()
  const name = window.prompt('Menu title')
  if (name) {
    const item = JSON.parse(JSON.stringify({ ...method.item, label: name }))
    items.items.push(item)
    saveItems()
  }
}

const handleRemove = (e: Event) => {
  e.stopPropagation()
  const index = items.items.findIndex(
    ({ label }) => label === method.item.label
  )
  if (index !== -1) {
    items.items.splice(index, 1)
    saveItems()
  }
}

const hasRemove = computed<boolean>(() => {
  const list = items.items
  const currentLabel = method.item.label
  const item = list.find(({ label }) => label === currentLabel)
  console.log(list, currentLabel, item)
  return item != null
})
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Transaction</p>
      <div class="field">
        <div class="select is-fullwidth mb-2">
          <select data-testid="preset" @change="selectMethod">
            <optgroup label="Standard">
              <option
                v-for="({ label }, index) of methods"
                :key="index"
                :value="index"
              >
                {{ label }}
              </option>
            </optgroup>
            <optgroup v-if="items.items.length > 0" label="Custom">
              <option
                v-for="({ label }, index) of items.items"
                :key="index + methods.length"
                :value="index + methods.length"
              >
                {{ label }}
              </option>
            </optgroup>
          </select>
        </div>
      </div>

      <ContractFunction
        v-model="params.items"
        :only-params="true"
        testid-prefix="transaction-"
        :custom="true"
      />
      <div class="field">
        <label class="checkbox">
          <input v-model="hasData" data-testid="hasData" type="checkbox" />
          Enable Data
        </label>
      </div>

      <ContractFunction
        v-if="hasData"
        v-model="method.item.inputs"
        :call="method.item.call"
        custom
        :data="data"
        testid-prefix="params-"
        :hide-data="true"
        @update:data="handleData"
      />

      <div v-if="hasData" class="field">
        <label class="label">Data (optional)</label>
        <textarea
          v-model="data"
          class="textarea"
          placeholder="0x..."
          data-testid="data"
        ></textarea>
      </div>
      <div class="field mt-2">
        <button
          :class="`button is-small is-rounded ${isPending ? 'is-loading' : ''}`"
          data-testid="add"
          @click="handleAdd"
        >
          Add Transaction to Menu
        </button>
        <button
          v-if="hasRemove"
          :class="`button is-small is-rounded ml-2 ${
            isPending ? 'is-loading' : ''
          }`"
          data-testid="remove"
          @click="handleRemove"
        >
          Remove "{{ method.item.label }}" from Menu
        </button>
      </div>
      <div class="field">
        <button
          :class="`button is-primary is-rounded mt-4 ${
            isPending ? 'is-loading' : ''
          }`"
          data-testid="send"
          @click="send"
        >
          Send Transaction
        </button>
      </div>

      <div class="field">
        How to
        <a href="https://docs.lukso.tech/guides/universal-profile/transfer-lyx"
          >transfer LYX tutorial</a
        >.
      </div>

      <div class="field">
        <Notifications
          v-if="hasNotification"
          :notification="notification"
          class="mt-4"
          @hide="clearNotification"
        ></Notifications>
      </div>
    </div>
  </div>
</template>
