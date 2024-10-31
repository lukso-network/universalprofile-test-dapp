<script setup lang="ts">
import { getState } from '@/stores'
import useNotifications from '@/compositions/useNotifications'
import { ref, watch, reactive, computed } from 'vue'
import useWeb3Connection from '@/compositions/useWeb3Connection'
import { MAGICVALUE } from '@/helpers/config'
import { toWei } from 'web3-utils'
import { TransactionConfig } from 'web3-core'
import Notifications from '@/components/Notification.vue'
import ContractFunction from '@/components/shared/ContractFunction.vue'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'
import { MethodSelect, MethodType } from '@/helpers/functionUtils'
import { methodSelectors as methods } from '@/utils/methodSelectors'
import {
  UnsignedTransaction,
  RLP,
  joinSignature,
  keccak256,
  serializeTransaction,
} from 'ethers/lib/utils'
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json'
import { ERC725YDataKeys } from '@lukso/lsp-smart-contracts'
import { stripHexPrefix } from 'web3-utils'
import ERC725 from '@erc725/erc725.js'
import { Permissions } from '@erc725/erc725.js/build/main/src/types/Method'

const data = ref<string>('')
const hasData = ref(false)

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { signTransaction, recoverRawTransaction, contract } = useWeb3Connection()

const isPending = ref(false)
const transactionHashedForSignature = ref<string>()
const signResponse = ref<string>()
const permissions = ref<Permissions>()
const recovery = ref<string>()
const magicValue = ref<string>()

const method = reactive<{ item: MethodSelect }>({ item: methods[0] })
const params = reactive<{ items: MethodType[] }>({
  items: [
    { type: 'address', name: 'from', value: getState('address') },
    { type: 'address', name: 'to' },
    { type: 'uint256', isWei: 'ether', name: 'amount', value: '0.1' },
  ],
})

const makeTransaction = (): TransactionConfig => {
  const from = makeValue(params.items[0])

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

  return transaction
}

const hashTransaction = (transaction: TransactionConfig): string => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { from, gas, ...rest } = transaction
  const modifiedTx = { ...rest, gasLimit: gas }
  return keccak256(serializeTransaction(modifiedTx as UnsignedTransaction))
}

const onSign = async () => {
  clearNotification()

  const transaction: any = makeTransaction()

  try {
    isPending.value = true
    signResponse.value = await signTransaction(transaction, transaction.from)

    transactionHashedForSignature.value = hashTransaction(transaction)
    recovery.value = undefined
    magicValue.value = undefined

    setNotification('The transaction was signed')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  } finally {
    isPending.value = false
  }
}

const onPermissionsValidation = async () => {
  const signerAddress = recovery.value
  if (!signerAddress) {
    return setNotification('Please, recover address first', 'danger')
  }

  const erc725Account = contract(
    UniversalProfile.abi as any,
    getState('address'),
    {
      gasPrice: DEFAULT_GAS_PRICE,
      gas: Number.MAX_VALUE,
    }
  )

  const permissionsResponse = await erc725Account.methods
    .getData(
      ERC725YDataKeys.LSP6['AddressPermissions:Permissions'] +
        stripHexPrefix(signerAddress)
    )
    .call()

  const decodedPermissions: Permissions =
    ERC725.decodePermissions(permissionsResponse)

  if (!decodedPermissions.SIGN) {
    throw new Error(
      `Signer doesn't have SIGN permission. Transaction will fail.`
    )
  }

  permissions.value = decodedPermissions
}

const onRecover = async () => {
  clearNotification()

  if (!signResponse.value) {
    return setNotification('Please sign transaction first', 'danger')
  }

  try {
    recovery.value = await recoverRawTransaction(signResponse.value)
    setNotification('Recover was successful')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}

const onSignatureValidation = async () => {
  clearNotification()

  if (!signResponse.value) {
    return setNotification('Please sign transaction first', 'danger')
  }

  try {
    const decodedTransaction = RLP.decode(signResponse.value) as string[]
    if (!decodedTransaction || decodedTransaction.length < 3) {
      throw new Error(
        `Failed to decode transaction. RLP.decode response is: ${JSON.stringify(decodedTransaction)}`
      )
    }
    const vrs = decodedTransaction.slice(-3)

    const erc725Account = contract(
      UniversalProfile.abi as any,
      getState('address'),
      {
        gasPrice: DEFAULT_GAS_PRICE,
        gas: Number.MAX_VALUE,
      }
    )
    const signature = joinSignature({
      v: Number.parseInt(vrs[0], 16),
      r: vrs[1],
      s: vrs[2],
    })

    magicValue.value = (await erc725Account.methods
      .isValidSignature(transactionHashedForSignature.value, signature)
      .call()) as string

    if (magicValue.value === MAGICVALUE) {
      setNotification('Signature validated successfully', 'info')
    } else {
      setNotification("Response doesn't match magic value", 'danger')
    }
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}

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

const selectMethod = (e: Event) => {
  const value = Number.parseInt((e.target as HTMLInputElement).value, 10)
  const item: MethodSelect =
    value >= methods.length
      ? items.items[value - methods.length]
      : methods[value]
  for (const [key, val] of Object.entries(item)) {
    ;(method.item as any)[key] = val
  }
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
      <p class="is-size-5 has-text-weight-bold mb-4">Sign Transaction</p>
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
          :class="`button is-small is-rounded ml-2 ${isPending ? 'is-loading' : ''}`"
          data-testid="remove"
          @click="handleRemove"
        >
          Remove "{{ method.item.label }}" from Menu
        </button>
      </div>

      <div class="field mt-5">
        <button
          :class="`button is-primary is-rounded mb-3 ${isPending ? 'is-loading' : ''}`"
          data-testid="sign"
          @click="onSign"
        >
          Sign transaction
        </button>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3"
          :disabled="signResponse ? undefined : true"
          data-testid="recover"
          @click="onRecover"
        >
          Recover
        </button>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3"
          :disabled="recovery ? undefined : true"
          data-testid="validate-permission"
          @click="onPermissionsValidation"
        >
          Validate permissions
        </button>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3"
          :disabled="signResponse ? undefined : true"
          data-testid="validate-signature"
          @click="onSignatureValidation"
        >
          Signature validation
        </button>
      </div>
      <div class="field">
        Test <code>eth_signTransaction</code> RPC call [<a
          href="https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_signtransaction"
          >documentation</a
        >].
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
      <div class="field">
        <div
          v-if="signResponse"
          class="notification is-info is-light mt-5"
          data-testid="info"
        >
          <p class="mb-3">
            Signature:
            <b data-testid="signature">{{ signResponse }}</b>
          </p>
          <p v-if="recovery" class="mb-3">
            Recover EoA: <b data-testid="recovery-eoa">{{ recovery }}</b>
          </p>
          <p v-if="permissions" class="mb-3">
            Has SIGN permission:
            <b data-testid="permissions">{{ permissions.SIGN === true }}</b>
          </p>
          <p v-if="magicValue" class="mb-3">
            Magic value: <b data-testid="magic-value">{{ magicValue }}</b>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.notification {
  word-break: break-all;
}

textarea {
  resize: vertical;
}
</style>
