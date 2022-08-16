<script setup lang="ts">
import { getState } from '@/stores'
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import {
  ERC725YKeys,
  ALL_PERMISSIONS,
  PERMISSIONS,
  // @ts-ignore
} from '@lukso/lsp-smart-contracts/constants.js'

import { computed, ref } from 'vue'
import useErc725 from '@/compositions/useErc725'
import { sliceAddress } from '@/utils/sliceAddress'
import { hexToBytes } from '@/utils/hexToBytes'
import Web3Utils, { hexToNumber, numberToHex, padLeft } from 'web3-utils'
import type { Permissions } from '@erc725/erc725.js/build/main/src/types/Method'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { encodePermissions, decodePermissions } = useErc725()
const grantPermissionAddress = ref('0xaf3bf2ffb025098b79caddfbdd113b3681817744')
const permissions: Permissions = {
  CHANGEOWNER: false,
  CHANGEPERMISSIONS: false,
  ADDPERMISSIONS: false,
  SETDATA: false,
  CALL: false,
  STATICCALL: false,
  DELEGATECALL: false,
  DEPLOY: false,
  TRANSFERVALUE: false,
  SIGN: false,
  SUPER_SETDATA: false,
  SUPER_TRANSFERVALUE: false,
  SUPER_CALL: false,
  SUPER_STATICCALL: false,
  SUPER_DELEGATECALL: false,
}
const selectedPermissions = ref(permissions)
const isPending = ref(false)
const ALL_PERMISSIONS_WITH_DELEGATECALL = padLeft(
  numberToHex(
    hexToNumber(ALL_PERMISSIONS) + hexToNumber(PERMISSIONS.DELEGATECALL)
  ),
  64
)

const setPermissions = async () => {
  const erc725AccountAddress = getState('address')

  if (!erc725AccountAddress) {
    return setNotification('No valid address', 'danger')
  }

  if (!grantPermissionAddress.value) {
    return setNotification('Enter address', 'danger')
  }

  const key =
    ERC725YKeys['LSP6']['AddressPermissions:Permissions'] +
    grantPermissionAddress.value.slice(2)
  const value = encodePermissions(selectedPermissions.value)

  try {
    isPending.value = true
    window.erc725Account &&
      (await window.erc725Account.methods
        .setData([key], [value])
        .send({
          from: erc725AccountAddress,
        })
        .on('receipt', function (receipt: any) {
          console.log(receipt)
        })
        .once('sending', (payload: any) => {
          console.log(JSON.stringify(payload, null, 2))
        }))

    setNotification('Permissions set', 'info')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  } finally {
    isPending.value = false
  }
}

const allPermissionsToggle = () => {
  if (allPermissionsSelected.value) {
    selectedPermissions.value = decodePermissions(padLeft(numberToHex(0), 64))
  } else {
    selectedPermissions.value = decodePermissions(
      ALL_PERMISSIONS_WITH_DELEGATECALL
    )
  }
  console.log()
}

const allPermissionsSelected = computed(() => {
  return (
    encodePermissions(selectedPermissions.value) ===
    ALL_PERMISSIONS_WITH_DELEGATECALL
  )
})
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Permissions</p>
      <div class="field">
        <label class="label">Address</label>
        <div class="control">
          <input
            v-model="grantPermissionAddress"
            class="input"
            type="text"
            :disabled="getState('address') ? undefined : true"
          />
        </div>
      </div>
      <div class="field">
        <div
          v-for="(value, key, index) in permissions"
          :key="index"
          class="mb-2"
        >
          <label class="checkbox" :data-testid="key">
            <input
              v-model="selectedPermissions[key]"
              type="checkbox"
              :value="value"
              :disabled="getState('address') ? undefined : true"
            />
            {{ key }}
          </label>
        </div>
      </div>
      <div class="field">
        <div class="mb-2">
          <label class="checkbox">
            <input
              :checked="allPermissionsSelected"
              type="checkbox"
              :disabled="getState('address') ? undefined : true"
              @click.stop="allPermissionsToggle"
            />
            Select all
          </label>
        </div>
      </div>
      <div class="field">
        <div
          v-if="getState('isConnected')"
          class="notification is-info is-light mt-5"
          data-testid="info"
        >
          <p class="">
            Hex:
            <b>{{ sliceAddress(encodePermissions(selectedPermissions), 8) }}</b>
          </p>
          <p class="">
            Decimal:
            <b>{{
              Web3Utils.toDecimal(encodePermissions(selectedPermissions))
            }}</b>
          </p>
          <p data-testid="chain">
            Bytes:
            <b>{{ hexToBytes(encodePermissions(selectedPermissions)) }}</b>
          </p>
        </div>
      </div>
      <div class="field">
        <button
          :class="`button is-primary is-rounded mb-3 ${
            isPending ? 'is-loading' : ''
          }`"
          :disabled="getState('address') ? undefined : true"
          data-testid="setPermissions"
          @click="setPermissions"
        >
          Set permissions
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
