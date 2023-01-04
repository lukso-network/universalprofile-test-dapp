<script setup lang="ts">
import { toWei } from 'web3-utils'
import { ref, watch, reactive, computed } from 'vue'
import { TransactionConfig } from 'web3-core'

import { getState, setState } from '@/stores'
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import useWeb3 from '@/compositions/useWeb3'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'
import ContractFunction from '@/components/shared/ContractFunction.vue'
import { MethodSelect, MethodType } from '@/helpers/functionUtils'
import { NETWORKS } from '@/helpers/config'
import { LSPType } from '@/helpers/tokenUtils'

const { sampleUP } = NETWORKS.l16
const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { sendTransaction, getBalance } = useWeb3()

const data = ref<string>('')
const hasData = ref(false)
const isPending = ref(false)

const methods: MethodSelect[] = [
  {
    label: '💰 Default',
  },
  {
    label: '💰 Transfer LSP7/LSP8',
    call: 'transfer',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', value: '1', isWei: 'ether' },
      { type: 'bool', name: 'force', value: false },
      { type: 'bytes', name: 'data', value: '0x' },
    ],
    hasSpecs: [LSPType.LSP7DigitalAsset, LSPType.LSP8IdentifiableDigitalAsset],
  },
  {
    label: '💰 Transfer ERC20/ERC777',
    call: 'transfer',
    inputs: [
      { type: 'address', name: 'to', value: sampleUP },
      { type: 'uint256', name: 'amount', isWei: 'ether', value: '1' },
    ],
    hasSpecs: [LSPType.ERC20, LSPType.ERC777],
  },
  {
    label: '💰 TransferFrom ERC721',
    call: 'transferFrom',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', isWei: 'ether', value: '1' },
    ],
    hasSpecs: [LSPType.ERC721],
  },
  {
    label: '💰 Send ERC777',
    call: 'send',
    hasSpecs: [LSPType.ERC777],
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', isWei: 'ether', value: '1' },
      { type: 'bytes', name: 'data', value: '0x' },
    ],
  },
  {
    label: '🏦 Mint LSP7/LSP8',
    call: 'mint',
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'bytes32', name: 'tokenId', value: '1' },
      { type: 'bool', name: 'force', value: false },
      { type: 'bytes', name: 'data', value: '0x' },
    ],
    hasSpecs: [LSPType.LSP7DigitalAsset, LSPType.LSP8IdentifiableDigitalAsset],
  },
  {
    label: '🏦 Mint ERC20/ERC777/LSP7',
    call: 'mint',
    hasSpecs: [LSPType.ERC777, LSPType.ERC20, LSPType.LSP7DigitalAsset],
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', isWei: 'ether', value: '100' },
    ],
  },
  {
    label: '🎛️ SetData',
    call: 'setData',
    hasSpecs: [
      LSPType.UP,
      LSPType.LSP3UniversalProfileMetadata,
      LSPType.LSP7DigitalAsset,
      LSPType.LSP8IdentifiableDigitalAsset,
      LSPType.LSP9Vault,
    ],
    inputs: [
      {
        type: 'bytes32[]',
        name: 'keys',
        isPairs: true,
        isKey: true,
      },
      { type: 'bytes[]', name: 'values', isPairs: true },
    ],
  },
  {
    label: '🦾 Sample call data',
    call: 'init',
    inputs: [
      {
        type: 'address[]',
        name: 'addresses',
        value: [
          '0x69909C12C875271AdC49155Cc8D01dBF67FE82f1',
          '0xB27F5845E6Ce846C02209Bd2497780099611b9a0',
        ],
      },
      {
        type: 'bytes32',
        name: 'data',
        value:
          '0x40b8bec57d7b5ff0dbd9e9acd0a47dfeb0101e1a203766f5ccab00445fbf39e9',
      },
      { type: 'uint256[]', name: 'numbers', value: ['2345675643', '123292'] },
      { type: 'bool', name: 'force', value: true },
      { type: 'string', name: 'scream', value: 'Hello!' },
      {
        type: 'string',
        name: 'description',
        value:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      },
    ],
  },
]

watch(
  () => getState('address'),
  newAddress => {
    params.items[0].value = newAddress
  }
)

function makeValue(param: MethodType) {
  const { value, isWei } = param
  if (isWei) {
    return toWei(value, isWei)
  }
  return value
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
    { type: 'uint256', isWei: 'ether', name: 'amount', value: '0.1' },
  ],
})

const selectMethod = (e: Event) => {
  const value = parseInt((e.target as HTMLInputElement).value, 10)
  const item: MethodSelect =
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
    items.items.push(
      JSON.parse(
        JSON.stringify({ ...method.item, label: name, inputs: params.items })
      )
    )
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
