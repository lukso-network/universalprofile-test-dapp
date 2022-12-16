<script setup lang="ts">
import { toWei } from 'web3-utils'
import { computed, ref, watch } from 'vue'
import { TransactionConfig } from 'web3-core'

import { getState, setState } from '@/stores'
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import useWeb3 from '@/compositions/useWeb3'
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from '@/helpers/config'

type TransactionSelect = {
  label: string
  to: string
  amount: number
  hasData: boolean
  data: string
}

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { sendTransaction, getBalance } = useWeb3()

const from = ref<string>(getState('address'))
const to = ref('0x4658F1Ac64486827f59E637bE9800Eb035b6f43C')
const amount = ref(0.1)
const data = ref('')
const hasData = ref(false)
const isPending = ref(false)

const sampleData = computed<{ [key: string]: TransactionSelect[] }>(() => {
  const sampleEoA = '0x311611C9A46a192C14Ea993159a0498EDE5578aC'
  const sampleUP = '0xe608aBEeB2EA0EBb59170de6CBcFFaE06437fE0c'
  const sampleSC = '0xcAC51571007DaAB53f26C2387b3B16420491dE18'
  const currentUP = getState('address')
  // ERC20
  const erc20TokenWithEip165 = '0xF5443372766a48faF098244c8C769c5AEa02f321'
  const erc20TokenWithoutEip165 = '0xB29c50a9F3D90FA3aDF394f2960BD6D8e0Ff5E9D'
  // ERC777
  const erc777TokenWithEip165 = '0xC719f454C8F9a0C7eEC4203B21766B88d8a5B073'
  const erc777TokenWithoutEip165 = '0xD7549C70A6122cA01043831f0f0c65152C4877d6'
  // LSP7
  const lsp7TokenDivisible = '0x314E7a56B08AF8E729612930dBAd70BB5A3575D9'
  const lsp7TokenNonDivisible = '0xF5d8FD6599Cb1971b8EEba218FFE31da34a257a9'
  // ERC721
  const erc721TokenWithEip165 = '0x57b8e4f3C96180088652dc361473bB91266bb080'

  return {
    LYX: [
      {
        label: '💰 Transfer LYX to UP',
        to: sampleUP,
        amount: 0.1,
        hasData: false,
        data: '',
      },
      {
        label: '💰 Transfer LYX to EoA',
        to: sampleEoA,
        amount: 0.1,
        hasData: false,
        data: '',
      },
      {
        label: '💰 Transfer LYX to EoA with test data',
        to: sampleEoA,
        amount: 0.1,
        hasData: true,
        data: '0x8fe36f1b00000000000000000000000000000000000000000000000000000000000000c040b8bec57d7b5ff0dbd9e9acd0a47dfeb0101e1a203766f5ccab00445fbf39e900000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000000200000000000000000000000069909c12c875271adc49155cc8d01dbf67fe82f1000000000000000000000000b27f5845e6ce846c02209bd2497780099611b9a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000008bd02b7b000000000000000000000000000000000000000000000000000000000001e19c000000000000000000000000000000000000000000000000000000000000000648656c6c6f210000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014e4c6f72656d20697073756d20646f6c6f722073697420616d65742c20636f6e73656374657475722061646970697363696e6720656c69742c2073656420646f20656975736d6f642074656d706f7220696e6369646964756e74207574206c61626f726520657420646f6c6f7265206d61676e6120616c697175612e20557420656e696d206164206d696e696d2076656e69616d2c2071756973206e6f737472756420657865726369746174696f6e20756c6c616d636f206c61626f726973206e69736920757420616c697175697020657820656120636f6d6d6f646f20636f6e7365717561742e2044756973206175746520697275726520646f6c6f7220696e20726570726568656e646572697420696e20766f6c7570746174652076656c697420657373652063696c6c756d20646f6c6f726520657520667567696174206e756c6c612070617269617475722e000000000000000000000000000000000000',
      },
    ],
    ERC20: [
      {
        label: '💰 Transfer: 1 token A to EoA',
        to: erc20TokenWithEip165,
        amount: 0,
        hasData: true,
        data: `0xa9059cbb000000000000000000000000${sampleEoA.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a7640000`,
      },
      {
        label: '💰 Transfer: 1 token A to SC (no LSP1)',
        to: '0xF5443372766a48faF098244c8C769c5AEa02f321',
        amount: 0,
        hasData: true,
        data: `a9059cbb000000000000000000000000${sampleSC.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a7640000`,
      },
      {
        label: '💰 Transfer: 1 token A to UP',
        to: erc20TokenWithEip165,
        amount: 0,
        hasData: true,
        data: `a9059cbb000000000000000000000000${sampleUP.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a7640000`,
      },
      {
        label: '💰 Transfer: 1 token B to EoA (without EIP165)',
        to: erc20TokenWithoutEip165,
        amount: 0,
        hasData: true,
        data: `0xa9059cbb000000000000000000000000${sampleEoA.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a7640000`,
      },
      {
        label: '🏦 Mint: 100 tokens A to current UP',
        to: erc20TokenWithEip165,
        amount: 0,
        hasData: true,
        data: `0x40c10f19000000000000000000000000${currentUP.substring(
          2
        )}0000000000000000000000000000000000000000000000056bc75e2d63100000`,
      },
      {
        label: '🏦 Mint: 100 tokens B to current UP',
        to: erc20TokenWithoutEip165,
        amount: 0,
        hasData: true,
        data: `0x40c10f19000000000000000000000000${currentUP.substring(
          2
        )}0000000000000000000000000000000000000000000000056bc75e2d63100000`,
      },
    ],
    ERC777: [
      {
        label: '💰 Transfer: 1 token A to EoA',
        to: erc777TokenWithEip165,
        amount: 0,
        hasData: true,
        data: `9bd9bbc6000000000000000000000000${sampleEoA.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000`,
      },
      {
        label: '💰 Transfer: 1 token A to UP',
        to: erc777TokenWithEip165,
        amount: 0,
        hasData: true,
        data: `9bd9bbc6000000000000000000000000${sampleUP.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000`,
      },
      {
        label: '💰 Transfer: 1 token B to EoA (without EIP165)',
        to: erc777TokenWithoutEip165,
        amount: 0,
        hasData: true,
        data: `9bd9bbc6000000000000000000000000${sampleEoA.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a764000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000`,
      },
      {
        label: '🏦 Mint: 100 tokens A to current UP',
        to: erc777TokenWithEip165,
        amount: 0,
        hasData: true,
        data: `0x40c10f19000000000000000000000000${currentUP.substring(
          2
        )}0000000000000000000000000000000000000000000000056bc75e2d63100000`,
      },
      {
        label: '🏦 Mint: 100 tokens B to current UP',
        to: erc777TokenWithoutEip165,
        amount: 0,
        hasData: true,
        data: `0x40c10f19000000000000000000000000${currentUP.substring(
          2
        )}0000000000000000000000000000000000000000000000056bc75e2d63100000`,
      },
    ],
    LSP7: [
      {
        label: '💰 Transfer: 1 token A (divisible) to EoA',
        to: lsp7TokenDivisible,
        amount: 0,
        hasData: true,
        data: `760d9bba000000000000000000000000${currentUP.substring(
          2
        )}000000000000000000000000${sampleEoA.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000`,
      },
      {
        label: '💰 Transfer: 1 token A (divisible) to EoA (without force)',
        to: lsp7TokenDivisible,
        amount: 0,
        hasData: true,
        data: `0x760d9bba000000000000000000000000${currentUP.substring(
          2
        )}000000000000000000000000${sampleEoA.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000`,
      },
      {
        label: '💰 Transfer: 1 token A (divisible) to UP',
        to: lsp7TokenDivisible,
        amount: 0,
        hasData: true,
        data: `760d9bba000000000000000000000000${currentUP.substring(
          2
        )}000000000000000000000000${sampleUP.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000`,
      },
      {
        label: '💰 Transfer: 1 token A (divisible) to SC (no LSP1)',
        to: lsp7TokenDivisible,
        amount: 0,
        hasData: true,
        data: `760d9bba000000000000000000000000${currentUP.substring(
          2
        )}000000000000000000000000${sampleSC.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000`,
      },
      {
        label: '💰 Transfer: 1 token A (non divisible) to EoA',
        to: lsp7TokenNonDivisible,
        amount: 0,
        hasData: true,
        data: `760d9bba000000000000000000000000${currentUP.substring(
          2
        )}000000000000000000000000${sampleEoA.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000`,
      },
      {
        label: '💰 Transfer: 1 token A (non divisible) to EoA (without force)',
        to: lsp7TokenNonDivisible,
        amount: 0,
        hasData: true,
        data: `0x760d9bba000000000000000000000000${currentUP.substring(
          2
        )}000000000000000000000000${sampleEoA.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000`,
      },
      {
        label: '💰 Transfer: 1 token A (non divisible) to UP',
        to: lsp7TokenNonDivisible,
        amount: 0,
        hasData: true,
        data: `760d9bba000000000000000000000000${currentUP.substring(
          2
        )}000000000000000000000000${sampleUP.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000`,
      },
      {
        label: '💰 Transfer: 1 token A (non divisible) to SC (no LSP1)',
        to: lsp7TokenNonDivisible,
        amount: 0,
        hasData: true,
        data: `760d9bba000000000000000000000000${currentUP.substring(
          2
        )}000000000000000000000000${sampleSC.substring(
          2
        )}0000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000`,
      },
    ],
    ERC721: [
      {
        label: '💰 Fake Transfer: 1 NFT to EoA',
        to: erc721TokenWithEip165,
        amount: 0,
        hasData: true,
        data: `0x23b872dd000000000000000000000000${currentUP.substring(
          2
        )}000000000000000000000000${sampleEoA.substring(
          2
        )}0000000000000000000000000000000000000000000000000000000000000001`,
      },
      {
        label: '💰 Fake Transfer: 1 NFT to UP',
        to: erc721TokenWithEip165,
        amount: 0,
        hasData: true,
        data: `0x23b872dd000000000000000000000000${currentUP.substring(
          2
        )}000000000000000000000000${sampleUP.substring(
          2
        )}0000000000000000000000000000000000000000000000000000000000000000`,
      },
      {
        label: '🏦 Mint: 1 NFT to current UP',
        to: erc721TokenWithEip165,
        amount: 0,
        hasData: true,
        data: `0x6a627842000000000000000000000000${currentUP.substring(2)}`,
      },
    ],
    SetData: [
      {
        label: '👤 LSP3Profile: Change profile',
        to: currentUP,
        amount: 0,
        hasData: true,
        data: '0x14a6e2930000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000015ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc50000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000596f357c6a70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3697066733a2f2f516d65637247656a555156587057347a53393438704e76636e51724a314b69416f4d36626466725663575a736e3500000000000000',
      },
      {
        label: '👤 LSP3Profile: Change profile and send value',
        to: currentUP,
        amount: 0.1,
        hasData: true,
        data: '0x14a6e2930000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000015ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc50000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000596f357c6a70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3697066733a2f2f516d65637247656a555156587057347a53393438704e76636e51724a314b69416f4d36626466725663575a736e3500000000000000',
      },
    ],
  }
})

const selectData = (event: Event) => {
  const option = JSON.parse((event.target as HTMLSelectElement).value)

  to.value = option.to
  amount.value = option.amount
  hasData.value = option.hasData
  data.value = option.data
}

watch(
  () => getState('address'),
  newAddress => {
    from.value = newAddress
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
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Transaction</p>
      <div class="field">
        <div class="select is-fullwidth mb-2">
          <select data-testid="preset" @change="selectData">
            <optgroup
              v-for="(group, name) in sampleData"
              :key="name"
              :label="name.toString()"
            >
              <option
                v-for="option in group"
                :key="option.label"
                :value="JSON.stringify(option)"
              >
                {{ option.label }}
              </option>
            </optgroup>
          </select>
        </div>
      </div>

      <div class="field">
        <label class="label">From (defaults to injected address)</label>
        <div class="control">
          <input v-model="from" class="input is-family-code" type="text" />
        </div>
      </div>
      <div class="field">
        <label class="label">To</label>
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
      <div class="field">
        <label class="checkbox">
          <input
            v-model="hasData"
            type="checkbox"
            :value="hasData"
            data-testid="hasData"
          />
          with data
        </label>
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
