<script setup lang="ts">
import { toWei, Unit } from 'web3-utils'
import { ref, watch, computed, onMounted, reactive } from 'vue'
import { TransactionConfig } from 'web3-core'

import {
  getState,
  setState,
  sampleUP,
  sampleEoA,
  sampleSC,
  TokenInfo,
  erc20TokenWithEip165,
  erc20TokenWithoutEip165,
  erc777TokenWithEip165,
  erc777TokenWithoutEip165,
  lsp7TokenDivisible,
  lsp7TokenNonDivisible,
  erc721TokenWithEip165,
  LSPType,
} from '@/stores'
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import useWeb3 from '@/compositions/useWeb3'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js'
import lsp3Schema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json'
import LSPSelect from '../shared/LSPSelect.vue'
import ContractFunction from '../shared/ContractFunction.vue'

export type MethodType = {
  label?: string
  type: string
  name: string
  isWei?: boolean | Unit
  hasSpecs?: LSPType[]
  isPairs?: boolean
  isKey?: boolean
  value?: any
}
export type MethodSelect = {
  label: string
  call?: string
  inputs?: MethodType[]
  hasSpecs?: LSPType[]
}

type TransactionParams = {
  toParam?: string
  fromParam?: string
  force?: boolean
}

type TransactionParamErrors = {
  toParam?: string
  fromParam?: string
  force?: string
}

type TransactionSelect = {
  label: string
  to: string
  fromParam?: string
  toParam?: string
  force?: boolean
  amount: number
  hasData: boolean
  data: (args: TransactionParams) => string
}

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { sendTransaction, getBalance, getWeb3 } = useWeb3()
const { eth } = getWeb3()

const from = ref<string>(getState('address'))
const to = ref<string | undefined>('0x4658F1Ac64486827f59E637bE9800Eb035b6f43C')

const amount = ref(0.1)
const data = ref<string>('')
const hasData = ref(false)
const isPending = ref(false)
const selectedData = ref<TransactionSelect>()
const toParam = ref<string>()
const hasToParam = ref<boolean>(false)
const force = ref<boolean>()
const hasForce = ref<boolean>(false)
const fromParam = ref<string>()
const hasFromParam = ref<boolean>()
const errors = ref<TransactionParamErrors>({})

function validateAddress(value: string | undefined) {
  if (!value) {
    throw new Error('Value required')
  }
  if (!/^(0x)?[0-9a-f]{40}/i.test(value)) {
    throw new Error('Invalid address')
  }
  if (!/^0x/i.test(value)) {
    return value
  }
  return value.substring(2)
}

function validateBoolean(value: boolean | undefined) {
  if (value == null) {
    throw new Error('Missing value')
  }
  return value
}

function encode(fn: string, ...args: any[]) {
  const params = fn.replace(/^[^(]*\(|\)$/g, '').split(',')
  const data =
    '0x' +
    eth.abi.encodeFunctionSignature(fn).substring(2) +
    eth.abi.encodeParameters(params, args).substring(2)
  return data
}

function calcData(options: TransactionSelect) {
  const params: TransactionParams = {}
  const errors: TransactionParamErrors = {}
  let hasError = false
  if (options.toParam != null) {
    try {
      params.toParam = validateAddress(toParam.value)
    } catch (err) {
      console.error(err)
      errors.toParam = (err as Error).message
      hasError = true
    }
  }
  if (options.fromParam != null) {
    try {
      params.fromParam = validateAddress(fromParam.value)
    } catch (err) {
      console.error(err)
      errors.fromParam = (err as Error).message
      hasError = true
    }
  }
  if (options.force != null) {
    try {
      params.force = validateBoolean(force.value)
    } catch (err) {
      console.error(err)
      errors.force = (err as Error).message
      hasError = true
    }
  }
  let data = ''
  if (!hasError) {
    data = options.data(params)
  }
  return { data, errors, hasError }
}

const selectedMethod = ref<MethodSelect>()

const methods: MethodSelect[] = [
  {
    label: '💰 Transfer',
  },
  {
    label: '💰 Transfer 1 ERC20',
    call: 'transfer',
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', isWei: true, value: '1' },
    ],
    hasSpecs: [LSPType.ERC20],
  },
  {
    label: '🏦 Mint 100 ERC20/ERC777',
    call: 'mint',
    hasSpecs: [LSPType.ERC777, LSPType.ERC20],
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', value: '100' },
    ],
  },
  {
    label: '💰 TransferFrom 1 ERC721',
    call: 'transferFrom',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', isWei: true, value: '1' },
    ],
    hasSpecs: [LSPType.ERC721],
  },
  {
    label: '💰 Transfer 1 LSP7',
    call: 'transfer',
    inputs: [
      { type: 'address', name: 'from' },
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', isWei: true },
      { type: 'bool', name: 'force', value: false },
      { type: 'bytes', name: 'data' },
    ],
    hasSpecs: [LSPType.LSP7DigitalAsset, LSPType.LSP8IdentifiableDigitalAsset],
  },
  {
    label: '💰 Transfer 1 LSP8',
    call: 'transfer',
    inputs: [
      {
        type: 'address',
        name: 'from',
      },
      { type: 'address', name: 'to' },
      { type: 'bytes32', name: 'tokenId' },
      { type: 'bool', name: 'force', value: false },
      { type: 'bytes', name: 'data', value: '0x' },
    ],
  },
  {
    label: '💰 Send 100 ERC777',
    call: 'send',
    hasSpecs: [LSPType.ERC777],
    inputs: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'amount', isWei: true, value: '1' },
      { type: 'bytes', name: 'data', value: '0x' },
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
      { type: 'uint256[]', name: 'numbers', value: [2345675643, 123292] },
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

const sampleData = computed((): { [key: string]: TransactionSelect[] } => {
  const currentUP = getState('address')

  return {
    LYX: [
      {
        label: '💰 Transfer LYX to UP',
        to: sampleUP,
        amount: 0.1,
        hasData: false,
        data: () => '',
      },
      {
        label: '💰 Transfer LYX to EoA',
        to: sampleEoA,
        amount: 0.1,
        hasData: false,
        data: () => '',
      },
      {
        label: '💰 Transfer LYX to EoA with test data',
        to: sampleEoA,
        amount: 0.1,
        hasData: true,
        data: () =>
          encode(
            'init(address[],bytes32,uint256[],bool,string,string)',
            [
              '0x69909C12C875271AdC49155Cc8D01dBF67FE82f1',
              '0xB27F5845E6Ce846C02209Bd2497780099611b9a0',
            ],
            '0x40b8bec57d7b5ff0dbd9e9acd0a47dfeb0101e1a203766f5ccab00445fbf39e9',
            [2345675643, 123292],
            true,
            'Hello!',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
          ),
      },
    ],
    ERC20: [
      {
        label: '💰 Transfer: 1 token A to EoA',
        to: erc20TokenWithEip165,
        amount: 0,
        toParam: sampleEoA,
        hasData: true,
        data: ({ toParam }) =>
          encode('transfer(address,uint256)', toParam, toWei('1')),
      },
      {
        label: '💰 Transfer: 1 token A to SC (no LSP1)',
        to: '0xF5443372766a48faF098244c8C769c5AEa02f321',
        amount: 0,
        toParam: sampleSC,
        hasData: true,
        data: ({ toParam }) =>
          encode('transfer(address,uint256)', toParam, toWei('1')),
      },
      {
        label: '💰 Transfer: 1 token A to UP',
        to: erc20TokenWithEip165,
        amount: 0,
        toParam: sampleUP,
        hasData: true,
        data: ({ toParam }) =>
          encode('transfer(address,uint256)', toParam, toWei('1')),
      },
      {
        label: '💰 Transfer: 1 token B to EoA (without EIP165)',
        to: erc20TokenWithoutEip165,
        amount: 0,
        toParam: sampleEoA,
        hasData: true,
        data: ({ toParam }) =>
          encode('transfer(address,uint256)', toParam, toWei('1')),
      },
      {
        label: '🏦 Mint: 100 tokens A to current UP',
        to: erc20TokenWithEip165,
        amount: 0,
        toParam: currentUP,
        hasData: true,
        data: ({ toParam }) =>
          encode('mint(address,uint256)', toParam, toWei('100')),
      },
      {
        label: '🏦 Mint: 100 tokens B to current UP',
        to: erc20TokenWithoutEip165,
        amount: 0,
        toParam: currentUP,
        hasData: true,
        data: ({ toParam }) =>
          encode('mint(address,uint256)', toParam, toWei('100')),
      },
    ],
    ERC777: [
      {
        label: '💰 Transfer: 1 token A to EoA',
        to: erc777TokenWithEip165,
        amount: 0,
        toParam: sampleEoA,
        hasData: true,
        data: ({ toParam }) =>
          encode('send(address,uint256,bytes)', toParam, toWei('1'), '0x'),
      },
      {
        label: '💰 Transfer: 1 token A to UP',
        to: erc777TokenWithEip165,
        amount: 0,
        toParam: sampleUP,
        hasData: true,
        data: ({ toParam }) =>
          encode('send(address,uint256,bytes)', toParam, toWei('1'), '0x'),
      },
      {
        label: '💰 Transfer: 1 token B to EoA (without EIP165)',
        to: erc777TokenWithoutEip165,
        amount: 0,
        toParam: sampleEoA,
        hasData: true,
        data: ({ toParam }) =>
          encode('send(address,uint256,bytes)', toParam, toWei('1'), '0x'),
      },
      {
        label: '🏦 Mint: 100 tokens A to current UP',
        to: erc777TokenWithEip165,
        amount: 0,
        toParam: currentUP,
        hasData: true,
        data: ({ toParam }) =>
          encode('mint(address,uint256)', toParam, toWei('100')),
      },
      {
        label: '🏦 Mint: 100 tokens B to current UP',
        to: erc777TokenWithoutEip165,
        amount: 0,
        toParam: currentUP,
        hasData: true,
        data: ({ toParam }) =>
          encode('mint(address,uint256)', toParam, toWei('100')),
      },
    ],
    LSP7: [
      {
        label: '💰 Transfer: 1 token A (divisible) to EoA',
        to: lsp7TokenDivisible,
        amount: 0,
        fromParam: currentUP,
        toParam: sampleEoA,
        force: true,
        hasData: true,
        data: ({ fromParam, toParam, force }) =>
          encode(
            'transfer(address,address,uint256,bool,bytes)',
            fromParam,
            toParam,
            toWei('1'),
            force,
            '0x'
          ),
      },
      {
        label: '💰 Transfer: 1 token A (divisible) to UP',
        to: lsp7TokenDivisible,
        amount: 0,
        fromParam: currentUP,
        force: false,
        toParam: sampleUP,
        hasData: true,
        data: ({ fromParam, toParam, force }) =>
          encode(
            'transfer(address,address,uint256,bool,bytes)',
            fromParam,
            toParam,
            toWei('1'),
            force,
            '0x'
          ),
      },
      {
        label: '💰 Transfer: 1 token A (divisible) to SC (no LSP1)',
        to: lsp7TokenDivisible,
        amount: 0,
        fromParam: currentUP,
        toParam: sampleSC,
        force: true,
        hasData: true,
        data: ({ fromParam, toParam, force }) =>
          encode(
            'transfer(address,address,uint256,bool,bytes)',
            fromParam,
            toParam,
            toWei('1'),
            force,
            '0x'
          ),
      },
      {
        label: '💰 Transfer: 1 token A (non divisible) to EoA',
        to: lsp7TokenNonDivisible,
        amount: 0,
        fromParam: currentUP,
        toParam: sampleEoA,
        force: true,
        hasData: true,
        data: ({ fromParam, toParam, force }) =>
          encode(
            'transfer(address,address,uint256,bool,bytes)',
            fromParam,
            toParam,
            toWei('1'),
            force,
            '0x'
          ),
      },
      {
        label: '💰 Transfer: 1 token A (non divisible) to UP',
        to: lsp7TokenNonDivisible,
        amount: 0,
        fromParam: currentUP,
        toParam: sampleUP,
        force: false,
        hasData: true,
        data: ({ fromParam, toParam, force }) =>
          encode(
            'transfer(address,address,uint256,bool,bytes)',
            fromParam,
            toParam,
            toWei('1'),
            force,
            '0x'
          ),
      },
      {
        label: '💰 Transfer: 1 token A (non divisible) to SC (no LSP1)',
        to: lsp7TokenNonDivisible,
        amount: 0,
        fromParam: currentUP,
        toParam: sampleSC,
        force: true,
        hasData: true,
        data: ({ fromParam, toParam, force }) =>
          encode(
            'transfer(address,address,uint256,bool,bytes)',
            fromParam,
            toParam,
            toWei('1'),
            force,
            '0x'
          ),
      },
    ],
    ERC721: [
      {
        label: '💰 Fake Transfer: 1 NFT to EoA',
        to: erc721TokenWithEip165,
        amount: 0,
        hasData: true,
        fromParam: currentUP,
        toParam: sampleEoA,
        data: ({ fromParam, toParam }) =>
          encode(
            'transferFrom(address,address,uint256)',
            fromParam,
            toParam,
            1
          ),
      },
      {
        label: '💰 Fake Transfer: 1 NFT to UP',
        to: erc721TokenWithEip165,
        amount: 0,
        fromParam: currentUP,
        toParam: sampleUP,
        hasData: true,
        data: ({ fromParam, toParam }) =>
          encode(
            'transferFrom(address,address,uint256)',
            fromParam,
            toParam,
            0
          ),
      },
      {
        label: '🏦 Mint: 1 NFT to current UP',
        to: erc721TokenWithEip165,
        amount: 0,
        toParam: currentUP,
        hasData: true,
        data: ({ toParam }) => encode('mint(address)', toParam),
      },
    ],
    SetData: [
      {
        label: '👤 LSP3Profile: Change profile',
        to: currentUP,
        amount: 0,
        hasData: true,
        data: () =>
          encode(
            'setData(bytes32[],bytes[])',
            [ERC725.encodeKeyName('LSP3Profile')],
            ERC725.encodeData(
              [
                {
                  keyName: ERC725.encodeKeyName('LSP3Profile'),
                  value: {
                    hash: '0x70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3',
                    hashFunction: 'keccak256(utf8)',
                    url: 'ipfs://QmecrGejUQVXpW4zS948pNvcnQrJ1KiAoM6bdfrVcWZsn5',
                  },
                },
              ],
              lsp3Schema as ERC725JSONSchema[]
            ).values
          ),
      },
      {
        label: '👤 LSP3Profile: Change profile and send value',
        to: currentUP,
        amount: 0.1,
        hasData: true,
        data: () =>
          encode(
            'setData(bytes32[],bytes[])',
            [ERC725.encodeKeyName('LSP3Profile')],
            ERC725.encodeData(
              [
                {
                  keyName: ERC725.encodeKeyName('LSP3Profile'),
                  value: {
                    hash: '0x70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3',
                    hashFunction: 'keccak256(utf8)',
                    url: 'ipfs://QmecrGejUQVXpW4zS948pNvcnQrJ1KiAoM6bdfrVcWZsn5',
                  },
                },
              ],
              lsp3Schema as ERC725JSONSchema[]
            ).values
          ),
      },
    ],
  }
})

const handleToSelected = (info: TokenInfo) => {
  to.value = info.address
}

const populateData = (selected = false) => {
  const option = selectedData.value
  if (!option) {
    return
  }
  if (selected) {
    to.value = option.to
    toParam.value = option.toParam ?? ''
    hasToParam.value = option.toParam != null

    force.value = option.force ?? false
    hasForce.value = option.force != null

    fromParam.value = option.fromParam ?? ''
    hasFromParam.value = option.fromParam != null

    hasData.value = option.hasData
    amount.value = option.amount
  }
  const { errors: currentErrors, hasError, data: newData } = calcData(option)
  if (hasError) {
    errors.value = currentErrors || {}
  } else {
    data.value = newData
    errors.value = {}
  }
}

watch(
  () => getState('address'),
  newAddress => {
    from.value = newAddress
  }
)

watch(
  () => `${toParam.value}:${fromParam.value}:${force.value}`,
  () => {
    populateData()
  }
)

const send = async () => {
  clearNotification()

  let transaction = {
    from: from.value,
    to: to.value,
    value: toWei(amount.value.toString()),
    gas: DEFAULT_GAS,
    gasPrice: DEFAULT_GAS_PRICE,
  } as TransactionConfig

  if (hasData.value) {
    transaction = { ...transaction, data: data.value }
  }

  try {
    isPending.value = true
    await sendTransaction(transaction)
    setNotification('The transaction was successful')
    setState('balance', await getBalance(from.value))
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  } finally {
    isPending.value = false
  }
}

onMounted(() => {
  calcData(sampleData.value.LYX[0])
})

const method = reactive<MethodSelect>(methods[0])
const params = reactive<MethodType[]>([
  { type: 'address', name: 'from' },
  { type: 'address', name: 'to' },
  { type: 'uint256', isWei: true, name: 'amount', value: '0.1' },
])

const selectMethod = (e: Event) => {
  const value = parseInt((e.target as HTMLInputElement).value, 10)
  Object.entries(methods[value]).forEach(([key, val]) => {
    ;(method as any)[key] = val
  })
}

const handleData = (e?: string) => (data.value = e || '')

// const params = ref<any[]>([[], , [], false, 'something', 'else'])
// const paramDefs = ref<MethodType[]>([
//   { type: 'address[]', name: 'addresses' },
//   { type: 'bytes32', name: 'data' },
//   { type: 'uint256[]', name: 'numbers', isWei: 'ether' },
//   { type: 'bool', name: 'force' },
//   { type: 'string', name: 'scream' },
//   { type: 'string', name: 'description' },
// ])
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Transaction</p>
      <div class="field">
        <div class="select is-fullwidth mb-2">
          <select @change="selectMethod">
            <option
              v-for="({ label }, index) of methods"
              :key="index"
              :value="index"
            >
              {{ label }}
            </option>
          </select>
        </div>
      </div>

      <ContractFunction v-model="params" :only-params="true" :custom="true" />
      <div class="field">
        <label class="label">From (defaults to injected address)</label>
        <div class="control">
          <input v-model="from" class="input is-family-code" type="text" />
        </div>
      </div>
      <div class="field">
        <label class="label">To</label>
        <LSPSelect
          :show-up="true"
          :show-any="true"
          :address="to"
          @option-selected="handleToSelected"
        />
        <div class="control">
          <input
            v-model="to"
            class="input is-family-code"
            type="text"
            placeholder="0x123..."
            data-testid="to"
          />
        </div>
      </div>
      <div class="field">
        <label class="label">Amount</label>
        <div class="control columns">
          <div class="column is-one-third">
            <input
              v-model="amount"
              class="input"
              type="number"
              placeholder="0"
              data-testid="amount"
            />
          </div>
        </div>
      </div>
      <div v-if="hasData" class="field">
        <label class="label">Data (optional)</label>
        <textarea
          v-model="data"
          class="textarea"
          placeholder="0x..."
          data-testid="data"
        ></textarea>
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

      <ContractFunction
        v-if="method.call"
        v-model="method.inputs"
        :call="method.call"
        :on-update:data="handleData"
        custom
      />
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
