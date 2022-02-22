<script setup lang="ts">
import { getState } from "@/stores";
import Notifications from "@/components/shared/Notification.vue";
import useNotifications from "@/compositions/useNotifications";
import { ref } from "vue";
import useWeb3 from "@/compositions/useWeb3";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();
const { sign, recover } = useWeb3();

const isPending = ref(false);
const message = ref("sign message");
const signResponse = ref();
const recovery = ref();

const onSign = async () => {
  if (!message.value) {
    return setNotification("Please provide message", "danger");
  }

  const erc725AccountAddress = getState("address");

  try {
    isPending.value = true;
    signResponse.value = await sign(message.value, erc725AccountAddress);

    setNotification("Message signed successfully");
  } catch (error) {
    setNotification((error as unknown as Error).message, "danger");
  } finally {
    isPending.value = false;
  }
};

const onRecover = async () => {
  try {
    recovery.value = await recover(message.value, signResponse.value.signature);

    setNotification("Recover was successful");
  } catch (error) {
    setNotification((error as unknown as Error).message, "danger");
  }
};
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Sign</p>
      <div class="field">
        <label class="label">Message</label>
        <div class="control">
          <input
            v-model="message"
            class="input"
            type="text"
            :disabled="getState('address') ? undefined : true"
          />
        </div>
      </div>

      <div class="field">
        <button
          :class="`button is-primary is-rounded mb-3 ${
            isPending ? 'is-loading' : ''
          }`"
          :disabled="getState('address') ? undefined : true"
          data-testid="sign"
          @click="onSign"
        >
          Sign
        </button>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3"
          :disabled="getState('address') && signResponse ? undefined : true"
          data-testid="recover"
          @click="onRecover"
        >
          Recover
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
      <div class="field">
        <div
          v-if="signResponse"
          class="notification is-info is-light mt-5"
          data-testid="info"
        >
          <p class="mb-3">
            Signature:
            <b data-testid="signature">{{ signResponse.signature }}</b>
          </p>
          <p class="mb-3">
            Sign EoA:
            <b data-testid="sign-eoa">{{ signResponse.address }}</b>
          </p>
          <p v-if="recovery" class="mb-3">
            Recover EoA: <b data-testid="recovery-eoa">{{ recovery }}</b>
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
</style>
