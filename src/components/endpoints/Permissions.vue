<script setup lang="ts">
import { getState } from "@/stores";
import Notifications from "@/components/shared/Notification.vue";
import useNotifications from "@/compositions/useNotifications";
import useWeb3 from "@/compositions/useWeb3";
import UniversalProfile from "@lukso/universalprofile-smart-contracts/artifacts/UniversalProfile.json";
import { PERMISSION_KEY } from "@/helpers/config";
import { ref } from "vue";
import useErc725, { Permissions } from "@/compositions/useErc725";
import { sliceAddress } from "@/utils/sliceAddress";
import { hexToBytes } from "@/utils/hexToBytes";
import Web3Utils from "web3-utils";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();
const { contract } = useWeb3();
const { encodePermissions } = useErc725();
const grantPermissionAddress = ref(
  "0xaf3bf2ffb025098b79caddfbdd113b3681817744"
);
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
};
const selectedPermissions = ref(permissions);

const setPermissions = async () => {
  const erc725AccountAddress = getState("address");

  if (!erc725AccountAddress) {
    return setNotification("No valid address", "danger");
  }

  const erc725yContract = contract(
    UniversalProfile.abi as any,
    erc725AccountAddress
  );
  const key = PERMISSION_KEY + grantPermissionAddress.value.slice(2); // key hash of AddressPermissions:Permissions:<address>
  const value = encodePermissions(selectedPermissions.value);
  // const value = Web3Utils.padLeft(Web3Utils.toHex(ALL_PERMISSIONS), 64); // all permissions in 32 bytes

  try {
    await erc725yContract.methods.setData([key], [value]).send({
      from: erc725AccountAddress,
    });

    setNotification(`Set permissions`, "info");
  } catch (error) {
    setNotification((error as unknown as Error).message, "danger");
  }
};
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Permissions</p>
      <div class="field">
        <label class="label">Address</label>
        <div class="control">
          <input
            class="input"
            type="text"
            :value="grantPermissionAddress"
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
            />
            {{ key }}
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
            <b>{{
              sliceAddress(encodePermissions(selectedPermissions), 10)
            }}</b>
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
          class="button is-primary is-rounded mb-3"
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
