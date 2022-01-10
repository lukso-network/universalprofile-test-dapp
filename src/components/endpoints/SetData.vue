<script setup lang="ts">
import { getState } from "@/stores";
import Notifications from "@/components/shared/Notification.vue";
import useNotifications from "@/compositions/useNotifications";
import useWeb3 from "@/compositions/useWeb3";
import UniversalProfile from "@lukso/universalprofile-smart-contracts/artifacts/UniversalProfile.json";
import { ref } from "vue";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();
const { contract } = useWeb3();
const key = ref(
  "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5"
); // key hash of LSP3Profile
const value = ref(
  "0x6f357c6a70546a2accab18748420b63c63b5af4cf710848ae83afc0c51dd8ad17fb5e8b3697066733a2f2f516d65637247656a555156587057347a53393438704e76636e51724a314b69416f4d36626466725663575a736e35"
); // encoded profile ipfs url

const setData = async () => {
  const erc725AccountAddress = getState("address");

  if (!erc725AccountAddress) {
    return setNotification("No valid address", "danger");
  }

  const erc725yContract = contract(
    UniversalProfile.abi as any,
    erc725AccountAddress
  );
  try {
    await erc725yContract.methods
      .setData([key.value], [value.value])
      .send({
        from: erc725AccountAddress,
      })
      .on("receipt", function (receipt: any) {
        console.log(receipt);
      });

    setNotification(`Set data`, "info");
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
        <label class="label">Key</label>
        <div class="control">
          <input
            class="input"
            type="text"
            :value="key"
            :disabled="getState('address') ? undefined : true"
          />
        </div>
      </div>
      <div class="field">
        <label class="label">Value</label>
        <div class="control">
          <input
            class="input"
            type="text"
            :value="value"
            :disabled="getState('address') ? undefined : true"
          />
        </div>
      </div>
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
