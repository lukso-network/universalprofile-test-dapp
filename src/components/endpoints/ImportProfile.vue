<script setup lang="ts">
import { ref } from 'vue'

import Notifications from '@/components/Notification.vue'

import useNotifications from '@/compositions/useNotifications'
import useWeb3Connection from '@/compositions/useWeb3Connection'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const web3 = useWeb3Connection()

const universalProfileAddress = ref('')
const isRecovery = ref(false)
const isDeviceToDeviceImportMode = ref(false)
const controllerAddress = ref('')

const onImportProfile = async () => {
  clearNotification()

  try {
    let params: any[] = [universalProfileAddress.value]
    // Extension versions prior to 3.0.0.58 will not support more than 1 parameter in the array.
    // Thus, 'false' must not be passed or it will break the up_import in test-dapp for extension version < 3.0.0.58
    if (isDeviceToDeviceImportMode.value) {
      params.push(isDeviceToDeviceImportMode.value)
    }

    const request = {
      method: isRecovery.value ? 'up_recover' : 'up_import',
      params,
    }
    let newControllerAddress: string = await web3.sendRequest(request)
    if (newControllerAddress) {
      controllerAddress.value = newControllerAddress
    }
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box" :style="{ overflow: 'auto' }">
      <p class="is-size-5 has-text-weight-bold mb-4">Import Profile</p>

      <div class="field">
        <label class="label">UP Address</label>
        <div class="control">
          <input
            v-model="universalProfileAddress"
            class="input is-family-code"
            type="text"
            data-testid="controller-address"
            placeholder="0x..."
          />
        </div>
        <div class="field mt-4">
          <label class="checkbox">
            <input
              v-model="isRecovery"
              type="checkbox"
              :value="isRecovery"
              data-testid="isRecovery"
            />
            Recover the profile into your extension
          </label>
        </div>
        <div class="field mt-4">
          <label class="checkbox">
            <input
              v-model="isDeviceToDeviceImportMode"
              type="checkbox"
              :value="isDeviceToDeviceImportMode"
              data-testid="isDeviceToDeviceImportMode"
            />
            Immitate device-to-device import (sets isDeviceToDeviceImport to
            `true`)
          </label>
        </div>
      </div>

      <div v-if="controllerAddress" class="notification is-info is-light mt-5">
        <p>Profile imported successfully.</p>
        <p>
          The dApp should now create a setData request to grant permission to
          the new controller address: {{ controllerAddress }}.<br />
          Key: 0x4b80742de2bf82acb3630000{{ controllerAddress.slice(2) }}<br />
          value (full access):
          0x00000000000000000000000000000000000000000000000000000000000003ff`
        </p>
      </div>

      <div v-if="hasNotification" class="field">
        <Notifications
          :notification="notification"
          class="mt-4"
          @hide="clearNotification"
        />
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

      <div>
        Test <code>up_import</code> RPC call [<a
          href="https://docs.lukso.tech/standards/rpc-api#up_import"
          >documentation</a
        >].
      </div>
    </div>
  </div>
</template>
