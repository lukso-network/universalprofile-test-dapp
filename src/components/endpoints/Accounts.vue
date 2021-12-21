<template name="EndpointsAccounts">
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Accounts</p>
      <button
        class="button is-primary is-rounded"
        @click="connectExtension"
        :disabled="getState('address') || !hasExtension ? true : undefined"
        data-testid="connect-extension"
      >
        Connect with Browser Extension
      </button>
      <span
        class="icon ml-3 mt-1 has-text-primary"
        v-if="
          getState('channel') === 'browserExtension' && getState('isConnected')
        "
      >
        <i class="fas fa-check"></i>
      </span>
      <br />
      <button
        class="mt-3 button is-primary is-rounded"
        @click="connectWalletconnect"
        :disabled="getState('address') ? true : undefined"
        data-testid="connect-wc"
      >
        Connect with Wallet Connect
      </button>
      <span
        class="icon ml-3 mt-4 has-text-primary"
        v-if="
          getState('channel') === 'walletConnect' && getState('isConnected')
        "
      >
        <i class="fas fa-check"></i>
      </span>
      <br />
      <button
        class="mt-3 button is-primary is-rounded"
        @click="disconnect"
        :disabled="getState('isConnected') ? undefined : true"
        data-testid="disconnect"
      >
        Disconnect
      </button>
      <Notifications
        v-if="hasNotification"
        :notification="notification"
        @hide="clearNotification"
        class="mt-4"
      ></Notifications>
    </div>
  </div>
</template>

<script setup lang="ts">
import Notifications from "@/components/shared/Notification.vue";
import useNotifications from "@/compositions/useNotifications";
import useWalletConnect from "@/compositions/useWalletConnect";
import { getState, useState } from "@/stores";
import useWeb3 from "@/compositions/useWeb3";
import { UP_CONNECTED_ADDRESS } from "@/helpers/config";
import useEthereumRpc from "@/compositions/useEthereumRpc";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();
const { setDisconnected, setConnected } = useState();
const { setupWeb3 } = useWeb3();
const { resetProvider, enableProvider, setupProvider } = useWalletConnect();
const { requestAccounts } = useEthereumRpc();
const hasExtension = !!window.ethereum;

const connectExtension = async () => {
  clearNotification();
  setupWeb3(window.ethereum);

  try {
    const [address] = await requestAccounts();
    setConnected(address, "browserExtension");
    localStorage.setItem(UP_CONNECTED_ADDRESS, address);
    setNotification(`Connected to address: ${address}`, "info");
  } catch (error) {
    setNotification((error as unknown as Error).message, "danger");
  }
};

const connectWalletconnect = async () => {
  clearNotification();

  try {
    await setupProvider();
    await enableProvider();
    setConnected(getState("address"), "browserExtension");
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
