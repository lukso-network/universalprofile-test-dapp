<template name="Connect">
  <div class="field has-addons" v-if="getState('isConnected')">
    <p class="control">
      <button
        class="button is-static is-small is-rounded"
        data-testid="balance"
      >
        <span>{{ getState("balance") }} LYX</span>
      </button>
    </p>
    <p class="control">
      <button
        class="button is-static is-small is-rounded"
        data-testid="address"
      >
        <span>{{ sliceAddress(getState("address")) }}</span>
      </button>
    </p>
    <p class="control">
      <button
        class="button is-small is-rounded"
        @click="disconnect"
        data-testid="disconnect"
      >
        <span class="icon is-small">
          <i class="fas fa-unlink"></i>
        </span>
      </button>
    </p>
  </div>

  <div ref="dropdown" class="dropdown is-right" v-else>
    <div class="dropdown-trigger">
      <button
        class="button is-primary is-small is-rounded has-text-weight-bold"
        aria-haspopup="true"
        aria-controls="dropdown-menu"
        @click="toggle(dropdown)"
        ref="dropdown"
        data-testid="connect"
      >
        <span>Connect</span>
      </button>
    </div>
    <div class="dropdown-menu" id="dropdown-menu" role="menu">
      <div class="dropdown-content">
        <a
          href="#"
          class="dropdown-item has-text-weight-bold"
          @click="connectExtension"
          data-testid="connect-extension"
        >
          <div class="logo browser-extension" />
          Browser Extension
        </a>
        <a
          class="dropdown-item has-text-weight-bold"
          @click="connectWalletConnect"
          data-testid="connect-wc"
        >
          <div class="logo wallet-connect" />
          Wallet Connect
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getState, useState } from "@/stores";
import { ref, onMounted } from "vue";
import { EthereumProviderError } from "eth-rpc-errors";
import useDropdown from "@/compositions/useDropdown";
import useWeb3 from "@/compositions/useWeb3";
import useWalletConnect from "@/compositions/useWalletConnect";
import useEthereumRpc from "@/compositions/useEthereumRpc";
import { UP_CONNECTED_ADDRESS } from "@/helpers/config";

const { setupWeb3 } = useWeb3();
const { resetProvider, setupProvider, enableProvider, getProvider } =
  useWalletConnect();
const { setDisconnected, setConnected } = useState();
const { close, toggle } = useDropdown();
const { accounts, requestAccounts } = useEthereumRpc();
const dropdown = ref();
const browserExtensionConnected = localStorage.getItem(UP_CONNECTED_ADDRESS);

const connectWalletConnect = async () => {
  close(dropdown.value);
  await setupProvider();
  await enableProvider();
};

const connectExtension = async () => {
  try {
    close(dropdown.value);
    setupWeb3(window.ethereum);
    let address = await accounts();

    if (!address) {
      [address] = await requestAccounts();
    }

    setConnected(address, "browserExtension");
    localStorage.setItem(UP_CONNECTED_ADDRESS, address);
    close(dropdown.value);
  } catch (error) {
    const epError = error as EthereumProviderError<Error>;

    if (epError.code === 4100) {
      const address = (await requestAccounts())[0];
      setConnected(address, "browserExtension");
    }
  }
};

const disconnect = async () => {
  if (getState("channel") == "walletConnect") {
    await resetProvider();
  } else {
    localStorage.removeItem(UP_CONNECTED_ADDRESS);
  }

  setDisconnected();
  setupWeb3(null);
};

const sliceAddress = (address?: string, sliceBy = 6): string => {
  let sliceAddress = "";

  if (address) {
    sliceAddress = `${address.slice(0, sliceBy + 2)}...${address.slice(
      -sliceBy
    )}`;
  }

  return sliceAddress;
};

onMounted(async () => {
  await setupProvider();

  if (getProvider().wc.connected) {
    await enableProvider();
  } else if (browserExtensionConnected) {
    await connectExtension();
  }
});
</script>

<style scoped lang="scss">
.dropdown-item {
  .logo {
    height: 16px;
    width: 30px;
    background-repeat: no-repeat;
    display: inline-flex;
    background-position: center;
    background-size: contain;
    position: relative;
    top: 3px;

    &.wallet-connect {
      background-image: url("~@/assets/walletconnect-logo.svg");
    }

    &.browser-extension {
      background-image: url("~@/assets/lukso.png");
    }
  }
}
</style>
