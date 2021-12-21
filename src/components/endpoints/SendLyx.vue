<template name="EndpointsSendLyx">
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
            class="input"
            type="text"
            placeholder="0x123..."
            v-model="to"
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
              class="input"
              type="number"
              placeholder="0"
              v-model="amount"
              :disabled="getState('address') ? undefined : true"
              data-testid="amount"
            />
          </div>
        </div>
      </div>
      <button
        class="button is-primary is-rounded mt-4"
        :disabled="getState('address') ? undefined : true"
        @click="sendLyx"
        data-testid="send"
      >
        Send Transaction
      </button>

      <Notifications
        v-if="hasNotification"
        :notification="notification"
        @hide="clearNotification"
        class="mt-4"
      ></Notifications>
    </div>
  </div>
</template>

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
