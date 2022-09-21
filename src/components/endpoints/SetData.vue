<script setup lang="ts">
import { getState } from '@/stores'
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import { ref } from 'vue'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const key = ref(
  '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5'
) // key hash of LSP3Profile
const value = ref(
  '0x6f357c6a70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3697066733a2f2f516d65637247656a555156587057347a53393438704e76636e51724a314b69416f4d36626466725663575a736e35'
) // encoded profile ipfs url
const isPending = ref(false)

const setData = async () => {
  const erc725AccountAddress = getState('address')

  if (!erc725AccountAddress) {
    return setNotification('No valid address', 'danger')
  }

  if (!key.value) {
    return setNotification('Enter key', 'danger')
  }

  if (!value.value) {
    return setNotification('Enter value', 'danger')
  }

  try {
    isPending.value = true
    window.erc725Account &&
      (await window.erc725Account.methods['setData(bytes32[],bytes[])'](
        [key.value],
        [value.value]
      )
        .send({
          from: erc725AccountAddress,
        })
        .on('receipt', function (receipt: any) {
          console.log(receipt)
        })
        .once('sending', (payload: any) => {
          console.log(JSON.stringify(payload, null, 2))
        }))

    setNotification(`Set data`, 'info')
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
      <p class="is-size-5 has-text-weight-bold mb-4">Change Data</p>
      <div class="field">
        <label class="label">Key</label>
        <div class="control">
          <input
            v-model="key"
            class="input"
            type="text"
            :disabled="getState('address') ? undefined : true"
          />
        </div>
      </div>
      <div class="field">
        <label class="label">Value</label>
        <div class="control">
          <input
            v-model="value"
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
          data-testid="setData"
          @click="setData"
        >
          Set data
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
