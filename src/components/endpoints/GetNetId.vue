<script setup lang="ts">
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import { ref } from 'vue'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()

const networkId = ref('')

const getNetworkId = async () => {
  try {
    networkId.value = await window.ethereum.request({ method: 'eth_getId' })
    setNotification(networkId.value, 'info')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Get Network ID</p>
      <div class="field">
        <div class="is-one-third mb-4">
          <button
            :class="`button is-primary is-rounded mt-4 `"
            data-testid="getNetId"
            @click="getNetworkId"
          >
            Get ID
          </button>
        </div>
      </div>
      <div class="field">
        <Notifications
          v-if="hasNotification"
          :notification="notification"
          class="notification is-info is-light mt-5"
          @hide="clearNotification"
        >
        </Notifications>
      </div>
    </div>
  </div>
</template>
