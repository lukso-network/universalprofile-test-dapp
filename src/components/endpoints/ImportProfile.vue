<script setup lang="ts">
import useWeb3 from "@/compositions/useWeb3";
import { ref } from "vue";
import Notifications from "@/components/Notification.vue";
import useNotifications from "@/compositions/useNotifications";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();

const { isAddress } = useWeb3();
const controllerAddress = ref("");

const onImportProfile = async () => {
  if (!controllerAddress.value) {
    return setNotification("Please provide a controller address", "danger");
  }

  if (!isAddress(controllerAddress.value)) {
    return setNotification(
      "Please provide a valid controller address",
      "danger"
    );
  }
  try {
    await window.ethereum.request({
      method: "up_import",
      params: [controllerAddress.value],
    });
    setNotification("The profile was imported");
  } catch (error) {
    setNotification((error as unknown as Error).message, "danger");
  }
};
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Import Profile</p>
      <div class="field">
        <label class="label">Controller Address</label>
        <div class="control">
          <input
            v-model="controllerAddress"
            class="input"
            type="text"
            data-testid="controller-address"
            placeholder="0x..."
          />
        </div>
      </div>
      <div class="field">
        <button
          :class="`button is-primary is-rounded mt-4`"
          data-testid="import-profile"
          @click.stop="onImportProfile"
        >
          Import Profile
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
