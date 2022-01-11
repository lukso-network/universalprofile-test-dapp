<script setup lang="ts">
import { getState } from "@/stores";
import Notifications from "@/components/shared/Notification.vue";
import useNotifications from "@/compositions/useNotifications";
import LSP7Mintable from "@lukso/universalprofile-smart-contracts/artifacts/LSP7Mintable.json";
import useWeb3 from "@/compositions/useWeb3";
import { ref } from "vue";
import { Contract } from "web3-eth-contract";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();
const { contract } = useWeb3();

const myToken = ref<Contract>();
const isTokenCreated = ref(false);
const isTokenPending = ref(false);
const token = ref({
  name: "My LSP7 Token",
  symbol: "LSP7",
  isNFT: false,
});

const create = async () => {
  if (isTokenPending.value) {
    return;
  }

  const erc725AccountAddress = getState("address");
  const tokenParams = [
    token.value.name, // token name
    token.value.symbol, // token symbol
    erc725AccountAddress, // new owner
    token.value.isNFT, // make your token divisible or not
  ];
  isTokenPending.value = true;

  try {
    // create an instance
    myToken.value = contract(LSP7Mintable.abi as any, "", {
      gas: 5_000_000,
      gasPrice: "1000000000",
    }); // address is empty because we are deploying the contract

    // deploy the token contract
    myToken.value = await myToken.value
      .deploy({ data: LSP7Mintable.bytecode, arguments: tokenParams })
      .send({ from: erc725AccountAddress })
      .on("receipt", function (receipt: any) {
        console.log(receipt);
      })
      .once("sending", (payload: any) => {
        console.log(JSON.stringify(payload, null, 2));
      });
    isTokenCreated.value = true;
    setNotification("Token created", "info");
  } catch (error) {
    setNotification((error as unknown as Error).message, "danger");
  } finally {
    isTokenPending.value = false;
  }
};

const mint = async () => {
  const erc725AccountAddress = getState("address");
  const receiver = "0xb2147068C4628E296c0769CD2DC7fF762880aE8e";

  if (myToken.value) {
    try {
      await myToken.value.methods
        .mint(receiver, 100, false, "0x")
        .send({ from: erc725AccountAddress })
        .on("receipt", function (receipt: any) {
          console.log(receipt);
        })
        .once("sending", (payload: any) => {
          console.log(JSON.stringify(payload, null, 2));
        });

      setNotification("Token minted", "info");
    } catch (error) {
      setNotification((error as unknown as Error).message, "danger");
    }
  } else {
    setNotification("No token specified", "danger");
  }
};
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Assets (LSP 7)</p>
      <div class="field">
        <label class="label">Token name</label>
        <div class="control">
          <input
            class="input"
            type="text"
            :value="token.name"
            :disabled="getState('address') ? undefined : true"
          />
        </div>
      </div>
      <div class="field">
        <label class="label">Token symbol</label>
        <div class="control">
          <input
            class="input"
            type="text"
            :value="token.symbol"
            :disabled="getState('address') ? undefined : true"
          />
        </div>
      </div>
      <div class="field">
        <label class="checkbox">
          <input
            v-model="token.isNFT"
            type="checkbox"
            :disabled="getState('address') ? undefined : true"
            :value="token.isNFT"
          />
          is NFT
        </label>
      </div>
      <div class="field">
        <button
          :class="`button is-primary is-rounded mb-3 mr-3 ${
            isTokenPending ? 'is-loading' : ''
          }`"
          :disabled="getState('address') ? undefined : true"
          data-testid="create"
          @click="create"
        >
          Create token
        </button>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3 mr-3"
          :disabled="getState('address') && isTokenCreated ? undefined : true"
          data-testid="mint"
          @click="mint"
        >
          Mint
        </button>
      </div>

      <div class="field">
        <div
          v-if="getState('isConnected') && isTokenCreated"
          class="notification is-info is-light mt-5"
          data-testid="info"
        >
          <p class="">
            Token address:
            <b
              ><a
                :href="`https://blockscout.com/lukso/l14/address/${myToken?.options.address}/transactions`"
                target="_blank"
                data-testid="token-address"
                >{{ myToken?.options.address }}</a
              ></b
            >
          </p>
        </div>
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

<style scoped lang="scss">
.notification {
  word-break: break-all;
}
</style>
