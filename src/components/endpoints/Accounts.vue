<script setup lang="ts">
import Notifications from "@/components/Notification.vue";
import useNotifications from "@/compositions/useNotifications";
import useWalletConnect, {
  WALLET_CONNECT_VERSION as walletConnectVersion,
} from "@/compositions/useWalletConnect";
import { getState, useState } from "@/stores";
import useWeb3 from "@/compositions/useWeb3";
import { UP_CONNECTED_ADDRESS } from "@/helpers/config";
import Web3Utils from "web3-utils";
import { computed } from "vue";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();
const { setDisconnected, setConnected } = useState();
const { setupWeb3, requestAccounts } = useWeb3();
const { resetProvider, enableProvider, setupProvider } = useWalletConnect();
const hasExtension = !!window.ethereum;

const hexChainId = computed(() => {
  return Web3Utils.numberToHex(getState("chainId"));
});

const connectExtension = async () => {
  clearNotification();
  setupWeb3(window.ethereum);

  try {
    const [address] = await requestAccounts();
    setConnected(address, "browserExtension");
    localStorage.setItem(UP_CONNECTED_ADDRESS, address);
  } catch (error) {
    setNotification((error as unknown as Error).message, "danger");
  }
};

const connectWalletconnect = async () => {
  clearNotification();

  try {
    await setupProvider();
    await enableProvider();
    setConnected(getState("address"), "walletConnect");
    setNotification(`Connected to address: ${getState("address")}`, "info");
  } catch (error) {
    setNotification((error as unknown as Error).message, "danger");
  }
};

const disconnect = async () => {
  clearNotification();

  if (getState("channel") == "walletConnect") {
    await resetProvider();
  } else {
    localStorage.removeItem(UP_CONNECTED_ADDRESS);
  }

  setNotification(`Disconnected ${getState("channel")} channel`, "info");

  setDisconnected();
  setupWeb3(null);
};
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Connect</p>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3"
          :disabled="getState('address') || !hasExtension ? true : undefined"
          data-testid="connect-extension"
          @click="connectExtension"
        >
          Browser Extension
        </button>
        <span
          v-if="
            getState('channel') === 'browserExtension' &&
            getState('isConnected')
          "
          class="icon ml-3 mt-1 has-text-primary"
        >
          <i class="fas fa-check"></i>
        </span>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3"
          :disabled="getState('address') ? true : undefined"
          data-testid="connect-wc"
          @click="connectWalletconnect"
        >
          Wallet Connect {{ walletConnectVersion }}
        </button>
        <span
          v-if="
            getState('channel') === 'walletConnect' && getState('isConnected')
          "
          class="icon ml-3 mt-4 has-text-primary"
        >
          <i class="fas fa-check"></i>
        </span>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded"
          :disabled="getState('isConnected') ? undefined : true"
          data-testid="disconnect"
          @click="disconnect"
        >
          Disconnect
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
      <div class="field">
        <div
          v-if="getState('isConnected')"
          class="notification is-info is-light mt-5"
          data-testid="info"
        >
          <p class="mb-3">
            Connected to address:
            <b
              ><a
                :href="`https://blockscout.com/lukso/l14/address/${getState(
                  'address'
                )}/transactions`"
                target="_blank"
                >{{ getState("address") }}</a
              ></b
            >
          </p>
          <p class="mb-3">
            Balance: <b>{{ getState("balance") }} LYX</b>
          </p>
          <p data-testid="chain">
            Chain ID: <b>{{ getState("chainId") }} ({{ hexChainId }})</b>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.notification {
  word-break: break-all;
}
</style>
