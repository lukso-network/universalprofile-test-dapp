<template>
  <a href="#" class="button is-primary">
    {{ shortAddress(signerAddress) }}... LYX {{ balance }}
  </a>
</template>

<script lang="ts">
import { defineComponent, toRefs } from "vue";
import { getSigner } from "@/services/provider.service";
import { getBalanceFormatted, shortAddress } from "@/helpers/ethers";
export default defineComponent({
  name: "WalletBalance",
  props: {
    msg: String,
  },
  data: () => {
    return {
      balance: 0 as any,
      address: "0x214be121bB52e6909c5158579b3458f8760f1b2f",
    };
  },
  watch: {
    async signerAddress(newValue: string, oldValue) {
      this.balance = await this.getBalance();
    },
  },
  async created() {
    this.balance = await this.getBalance();
  },
  setup: async () => {
    // await (window as any).ethereum.enable();
    const result = await getSigner();
    const { address } = toRefs(result.address);
    return {
      signerAddress: address,
      provider: result.provider,
      signer: result.signer,
    };
  },
  methods: {
    shortAddress,

    async getBalance() {
      return getBalanceFormatted(this.provider, this.signerAddress);
    },
  },
});
</script>

<style></style>
