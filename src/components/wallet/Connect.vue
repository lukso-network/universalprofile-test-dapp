<template name="Connect">
  <a href="#" class="button is-primary" @click="disconnect" v-if="isConnected">
    Disconnect</a
  >
  <a href="#" class="button is-primary" @click="connect" v-else> Connect </a>
  <a href="#" class="button" @click="check"> Check </a>
  <a href="#" class="button" @click="accounts"> Accounts </a>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  setupWeb3,
  web3,
  web3Modal,
  provider,
  resetProvider,
} from "@/services/Web3.service";

const isConnected = ref(false);

const connect = async () => {
  await setupWeb3();
  isConnected.value = true;

  // Subscribe to accounts change
  provider.on("accountsChanged", (accounts: string[]) => {
    console.log(accounts);
  });

  // Subscribe to chainId change
  provider.on("chainChanged", (chainId: number) => {
    console.log(chainId);
  });

  // Subscribe to provider connection
  provider.on("connect", (info: { chainId: number }) => {
    console.log(info);
  });

  // Subscribe to provider disconnection
  provider.on("disconnect", (error: { code: number; message: string }) => {
    console.log(error);
  });
};

const disconnect = async () => {
  isConnected.value = false;

  if (provider.close) {
    await provider.close();
  }
  web3Modal.clearCachedProvider();
  resetProvider();
};

const check = async () => {
  if (web3Modal.cachedProvider) {
    console.log(
      await web3.eth.getBalance("0x7367C96553Ed4C44E6962A38d8a0b5f4BE9F6298"),
      await web3.eth.getChainId()
    );
  }
};

const accounts = async () => {
  if (web3Modal.cachedProvider) {
    console.log(await web3.eth.getAccounts());
  }
};

// const connector = new WalletConnect({
//   bridge: "https://bridge.walletconnect.org",
//   qrcodeModal: QRCodeModal,
// });

// connector.on("connect", async () => {
//   isConnected.value = true;
// });
// connector.on("disconnect", async () => {
//   isConnected.value = false;
// });

// const connect = async () => {
//   if (!connector.connected) {
//     await connector.createSession();
//   }
// };

// const disconnect = async () => {
//   await connector.killSession();
// };
</script>
