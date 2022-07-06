<script setup lang="ts">
import Web3Utils from "web3-utils";
import { getState, setState } from "@/stores";
import { ref } from "vue";
import Notifications from "@/components/shared/Notification.vue";
import useNotifications from "@/compositions/useNotifications";
import { TransactionConfig } from "web3-core";
import useWeb3 from "@/compositions/useWeb3";
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from "@/helpers/config";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();
const { sendTransaction, getBalance } = useWeb3();

const to = ref("0x311611C9A46a192C14Ea993159a0498EDE5578aC");
const amount = ref(0.1);
const data = ref(
  "0x8fe36f1b00000000000000000000000000000000000000000000000000000000000000c040b8bec57d7b5ff0dbd9e9acd0a47dfeb0101e1a203766f5ccab00445fbf39e900000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001c0000000000000000000000000000000000000000000000000000000000000000200000000000000000000000069909c12c875271adc49155cc8d01dbf67fe82f1000000000000000000000000b27f5845e6ce846c02209bd2497780099611b9a00000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000008bd02b7b000000000000000000000000000000000000000000000000000000000001e19c000000000000000000000000000000000000000000000000000000000000000648656c6c6f210000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014e4c6f72656d20697073756d20646f6c6f722073697420616d65742c20636f6e73656374657475722061646970697363696e6720656c69742c2073656420646f20656975736d6f642074656d706f7220696e6369646964756e74207574206c61626f726520657420646f6c6f7265206d61676e6120616c697175612e20557420656e696d206164206d696e696d2076656e69616d2c2071756973206e6f737472756420657865726369746174696f6e20756c6c616d636f206c61626f726973206e69736920757420616c697175697020657820656120636f6d6d6f646f20636f6e7365717561742e2044756973206175746520697275726520646f6c6f7220696e20726570726568656e646572697420696e20766f6c7570746174652076656c697420657373652063696c6c756d20646f6c6f726520657520667567696174206e756c6c612070617269617475722e000000000000000000000000000000000000"
);
const hasData = ref(false);
const isPending = ref(false);

const sendLyx = async () => {
  const from = getState("address");

  if (!from) {
    return setNotification("No from address", "danger");
  }

  if (!amount.value) {
    return setNotification("Enter an amount", "danger");
  }

  let transaction = {
    from,
    to: to.value,
    value: Web3Utils.toWei(amount.value.toString()),
    gas: DEFAULT_GAS,
    gasPrice: DEFAULT_GAS_PRICE,
  } as TransactionConfig;

  if (hasData.value) {
    transaction = { ...transaction, data: data.value };
  }

  try {
    isPending.value = true;
    await sendTransaction(transaction);
    setNotification("The transaction was successful");
    setState("balance", await getBalance(from));
  } catch (error) {
    setNotification((error as unknown as Error).message, "danger");
  } finally {
    isPending.value = false;
  }
};
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Send LYX</p>
      <div class="field">
        <label class="label">From</label>
        <div class="control">
          <input
            class="input"
            type="text"
            :value="getState('address')"
            disabled
          />
        </div>
      </div>
      <div class="field">
        <label class="label">To</label>
        <div class="control">
          <input
            v-model="to"
            class="input"
            type="text"
            placeholder="0x123..."
            :disabled="getState('address') ? undefined : true"
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
              :disabled="getState('address') ? undefined : true"
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
            :disabled="getState('address') ? undefined : true"
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
          :disabled="getState('address') ? undefined : true"
          data-testid="data"
        ></textarea>
      </div>
      <div class="field">
        <button
          :class="`button is-primary is-rounded mt-4 ${
            isPending ? 'is-loading' : ''
          }`"
          :disabled="getState('address') ? undefined : true"
          data-testid="send"
          @click="sendLyx"
        >
          Send Transaction
        </button>
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
