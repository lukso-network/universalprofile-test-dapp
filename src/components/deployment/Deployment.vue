<script lang="ts">
import { getDeployedBaseContracts } from "@/helpers/deployment.helper";
import { getLspFactory } from "@/services/lsp-factory.service";
import { getSigner } from "@/services/provider.service";
import { defineComponent } from "vue";

export default defineComponent({
  name: "Deployment",
  props: {
    msg: { type: String, default: "" },
  },
  setup: async function () {
    const { provider } = await getSigner();
    const { chainId } = await provider.getNetwork();
    const lspFactory = await getLspFactory();

    const networkDetails = await getDeployedBaseContracts(chainId);
    const selectOptions = networkDetails
      ? Object.keys(networkDetails.baseContracts).sort().reverse()
      : [];
    return {
      chainId,
      networkDetails,
      selectOptions,
      lspFactory,
    };
  },
  data: () => {
    return {
      isLoading: false,
      deployedBaseContracts: {} as any,
    };
  },
  methods: {
    async deployLatestVersion() {
      this.isLoading = true;
      this.deployedBaseContracts =
        await this.lspFactory.ProxyDeployer.deployBaseContracts();
      this.isLoading = false;
      localStorage.setItem(
        "latestContracts",
        JSON.stringify({
          lsp3Account: this.deployedBaseContracts.lsp3Account.address,
          universalReceiverAddressStore:
            this.deployedBaseContracts.universalReceiverAddressStore.address,
        })
      );
      return false;
    },
  },
});
</script>

<template>
  <section class="section">
    <h1 class="title">Base Contracts</h1>

    You are connected to <strong>{{ networkDetails.name }}</strong
    >, the network ID is
    <code>{{ networkDetails.chainId }}</code>
    <br />
    <pre>{{ networkDetails.baseContracts }}</pre>
    <br />
    <!-- <div v-if="selectOptions.length > 0">
      <h2 class="subtitle">Available Versions</h2>
      <div class="select">
        <select>
          <option v-for="option in selectOptions" v-bind:key="option">
            {{ option }}
          </option>
        </select>
      </div>
    </div> -->
    <button
      class="button is-success"
      :class="isLoading ? 'is-loading' : ''"
      @click="deployLatestVersion"
    >
      Deploy Latest Version
    </button>
    <div v-if="selectOptions.length !== 0">
      <h2 class="subtitle">No pre-deployed contracts available</h2>

      <table class="table is-bordered is-fullwidth mt-5">
        <tr>
          <th>Name</th>
          <th>Address</th>
        </tr>
        <tr v-if="deployedBaseContracts.lsp3Account">
          <td>ERC725Account</td>
          <td>{{ deployedBaseContracts.lsp3Account.address }}</td>
        </tr>
        <tr v-if="deployedBaseContracts.universalReceiverAddressStore">
          <td>UniversalReceiverAddressStore</td>
          <td>
            {{ deployedBaseContracts.universalReceiverAddressStore.address }}
          </td>
        </tr>
      </table>
    </div>
  </section>
</template>
