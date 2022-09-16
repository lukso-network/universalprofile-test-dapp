<script setup lang="ts">
import { ref } from 'vue'

import Notifications from '@/components/Notification.vue'

import useWeb3 from '@/compositions/useWeb3'
import useNotifications from '@/compositions/useNotifications'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { isAddress } = useWeb3()

const universalProfileAddress = ref('')
const controllerAddress = ref('')
const showPermissions = ref(false)

const onImportProfile = async () => {
  if (
    !universalProfileAddress.value ||
    !isAddress(universalProfileAddress.value)
  ) {
    return setNotification(
      'Please provide a UP (ERC725 Account) address',
      'danger'
    )
  }

  try {
    const newControllerAddress = await window.ethereum.request({
      method: 'up_import',
      params: [universalProfileAddress.value],
    })
    if (newControllerAddress) {
      controllerAddress.value = newControllerAddress
      showPermissions.value = true
      setNotification(
        `Profile imported successfully.<br/>
        The dApp should now create a setData request to grant permission to the new controller address: ${newControllerAddress}.<br/>Key: 0x4b80742de2bf82acb3630000${newControllerAddress.slice(
          2
        )}<br/>value (full access): 0x00000000000000000000000000000000000000000000000000000000000003ff`
      )
    }
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Import Profile</p>

      <div class="field">
        <label class="label">UP Address</label>
        <div class="control">
          <input
            v-model="universalProfileAddress"
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

      <div v-if="controllerAddress" class="field">
        <button
          :class="`button is-primary is-rounded mt-4`"
          data-testid="import-profile"
          @click.stop="onImportProfile"
        >
          Request access to: {{ controllerAddress }}
        </button>
      </div>

      <div class="field">
        <Notifications
          v-if="hasNotification"
          :notification="notification"
          class="mt-4"
          @hide="clearNotification"
        />
      </div>

      <div>
        Test up_import RPC call [<a
          href="https://docs.lukso.tech/standards/rpc-api#up_import"
          >documentation</a
        >].
      </div>
    </div>
  </div>
</template>
