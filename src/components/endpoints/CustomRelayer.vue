<script setup lang="ts">
import { ref } from "vue";
import { getState } from "@/stores";
import Notifications from "@/components/Notification.vue";
import useNotifications from "@/compositions/useNotifications";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();

const name = ref("");
const apiUrl = ref("");
const chainId = ref(getState("chainId"));

const addCustomRelayer = async () => {
  if (!name.value) {
    return setNotification("Enter a name", "danger");
  }

  if (!apiUrl.value) {
    return setNotification("Enter an api url", "danger");
  }

  try {
    await window.ethereum.request({
      method: "up_addRelayService",
      params: [
        { name: name.value, apiUrl: apiUrl.value, chainIds: [chainId.value] },
      ],
    });
    setNotification("The relayer was added");
  } catch (error) {
    setNotification((error as unknown as Error).message, "danger");
  }
};
</script>
<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Custom Relayer</p>
      <div class="field">
        <label class="label">Name</label>
        <div class="control">
          <input v-model="name" class="input" type="text" />
        </div>
      </div>
      <div class="field">
        <label class="label">API URL</label>
        <div class="control">
          <input v-model="apiUrl" class="input" type="text" />
        </div>
      </div>
      <div class="field">
        <label class="label">Chain ID</label>
        <div class="control">
          <input v-model="chainId" class="input" />
        </div>
      </div>
      <div class="field">
        <button
          :class="`button is-primary is-rounded mt-4`"
          data-testid="send"
          @click.stop="addCustomRelayer"
        >
          Create Custom Relayer
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

<style scoped lang="scss"></style>
