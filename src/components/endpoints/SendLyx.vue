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

const to = ref("");
const amount = ref(0);
const data = ref(
  "0x44c028fe000000000000000000000000000000000000000000000000000000000000000000000000000000000000000052581Cfc2586cA3a5d3C9eA2235738FE375f918e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000644e3e6e9c0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000140b8bec57d7b5ff0dbd9e9acd0a47dfeb0101e1a203766f5ccab00445fbf39e900000000000000000000000000000000000000000000000000000000"
);
const hasData = ref(false);
const isPending = ref(false);

const sendLyx = async () => {
  const from = getState("address");

  if (!from) {
    return setNotification("No from address", "danger");
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
