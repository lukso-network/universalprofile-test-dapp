<script setup lang="ts">
import { getState } from "@/stores";
import Notifications from "@/components/shared/Notification.vue";
import useNotifications from "@/compositions/useNotifications";
import useWeb3 from "@/compositions/useWeb3";
import UniversalProfile from "@lukso/universalprofile-smart-contracts/artifacts/UniversalProfile.json";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();
const { contract } = useWeb3();

const setData = async () => {
  const from = getState("address");

  if (!from) {
    return setNotification("No from address", "danger");
  }

  const erc725yContract = contract(UniversalProfile.abi as any, from);
  const key =
    "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5"; // key hash of LSP3Profile
  const value =
    "0x6f357c6a70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3697066733a2f2f516d65637247656a555156587057347a53393438704e76636e51724a314b69416f4d36626466725663575a736e35"; // encoded profile ipfs url
  try {
    await erc725yContract.methods.setData([key], [value]).send({
      from,
    });

    setNotification(`Set data`, "info");
  } catch (error) {
    setNotification((error as unknown as Error).message, "danger");
  }
};

const setPermissions = async () => {
  const from = getState("address");

  if (!from) {
    return setNotification("No from address", "danger");
  }

  const erc725yContract = contract(UniversalProfile.abi as any, from);
  const address = "af3bf2ffb025098b79caddfbdd113b3681817744";
  const key = "0x4b80742d0000000082ac0000" + address; // key hash of AddressPermissions:Permissions:<address>
  const value = "0xff"; // all permissions

  try {
    await erc725yContract.methods.setData([key], [value]).send({
      from,
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
      <p class="is-size-5 has-text-weight-bold mb-4">Change Data</p>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3"
          :disabled="getState('address') ? undefined : true"
          data-testid="setData"
          @click="setData"
        >
          Set data
        </button>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3"
          :disabled="getState('address') ? undefined : true"
          data-testid="setPermissions"
          @click="setPermissions"
        >
          Permissions
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
