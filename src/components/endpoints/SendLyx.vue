<script setup lang="ts">
import Web3Utils from "web3-utils";
import { getState } from "@/stores";
import { ref } from "vue";
import { setState } from "@/stores";
import Notifications from "@/components/shared/Notification.vue";
import useNotifications from "@/compositions/useNotifications";
import useEthereumRpc from "@/compositions/useEthereumRpc";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();
const { getBalance, sendTransaction } = useEthereumRpc();

const to = ref("");
const amount = ref(0);

const sendLyx = async () => {
  if (!getState("address")) {
    return;
  }

  const transaction = {
    from: getState("address"),
    to: to.value,
    value: Web3Utils.toWei(amount.value.toString()),
    gas: "0x9c40",
    gasPrice: "0x02540be400",
    data: "0x",
  };

  try {
    await sendTransaction(transaction);
    setNotification(`You successfully send ${amount.value} LYX`);
    setState("balance", await getBalance(getState("address")));
  } catch (error) {
    setNotification((error as unknown as Error).message, "danger");
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
      <button
        class="button is-primary is-rounded mt-4"
        :disabled="getState('address') ? undefined : true"
        data-testid="send"
        @click="sendLyx"
      >
        Send Transaction
      </button>

      <Notifications
        v-if="hasNotification"
        :notification="notification"
        class="mt-4"
        @hide="clearNotification"
      ></Notifications>
    </div>
  </div>
</template>
