<template>
  <section class="section">
    <h1 class="title">Deploy Profile</h1>
    <ProfileListIpfs
      @createProfileOnChain="createProfileOnChain"
      :loading="status.isLoading"
    ></ProfileListIpfs>
    <br />
    <h2 class="title">
      Deployment Events ({{
        profileCreation.length ? profileCreation.length : 0
      }}
      / 5)
    </h2>
    <table
      class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
    >
      <tr>
        <th>Type</th>
        <th>Name</th>
        <th>Address</th>
        <th>Gas</th>
        <th>TransactionHash</th>
      </tr>
      <tr
        v-for="deploymentEvent in profileCreation"
        v-bind:key="deploymentEvent"
        :class="
          deploymentEvent.type === 1
            ? 'has-background-primary-light'
            : 'has-background-info-light'
        "
      >
        <td>
          {{ deploymentEvent.type === 1 ? "Deployment" : "Transaction" }}
        </td>
        <td>{{ deploymentEvent.name }}</td>
        <td>
          {{ deploymentEvent?.contract?.address }}<br />

          <span v-if="deploymentEvent.name === 'LSP3Account'">
            <code>0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc</code>
            <span class="tag" :class="isOwner ? 'is-success' : 'is-danger'">
              {{ isOwner ? "Owner" : "Not Owner" }}
            </span>
          </span>
        </td>
        <td>
          {{
            deploymentEvent?.receipt
              ? formatNumber(deploymentEvent?.receipt.gasUsed)
              : "Pending..."
          }}
        </td>
        <td>
          <a
            :href="`https://blockscout.com/lukso/l14/tx/${deploymentEvent?.receipt?.transactionHash}/internal-transactions`"
            class="button"
            :class="deploymentEvent?.receipt ? '' : 'is-loading'"
            >Inspect Transaction</a
          >
        </td>
      </tr>
    </table>

    <!-- <div v-if="profileCreation?.lsp3Account">
      LSP3Account deployed: {{ profileCreation?.lsp3Account?.contract.address }}
    </div>
    <div v-if="profileCreation?.keyManager">
      KeyManager deployed: {{ profileCreation?.keyManager?.contract.address }}
    </div>

    <div v-if="profileCreation?.universalReceiverAddressStore">
      UniversalReceiverAddressStore deployed:
      {{ profileCreation?.universalReceiverAddressStore?.contract.address }}
    </div>

    <div v-if="profileCreation?.setLsp3ProfileReceipt">
      Profile set:
      {{ profileCreation?.setLsp3ProfileReceipt?.transactionHash }}
    </div>
    <div v-if="profileCreation?.permissionsReceipt">
      Permissions set:
      {{ profileCreation?.permissionsReceipt?.transactionHash }}
    </div>
    <div v-if="profileCreation?.transferOwnershipReceipt">
      Ownership transfered:
      {{ profileCreation?.transferOwnershipReceipt?.transactionHash }}
    </div> -->
  </section>
</template>

<script lang="ts">
import { formatNumber } from "@/helpers/ethers";
import { getSigner } from "@/services/provider.service";
import { formatEther } from "ethers/lib/utils";
import { getLspFactory } from "@/services/lsp-factory.service";
import { LSP3ProfileJSON, LSP3Account } from "@lukso/lspfactory.js";
import { defineComponent } from "vue";
import ProfileListIpfs from "../profile-list-ipfs/ProfileListIpfs.vue";

export default defineComponent({
  components: {
    ProfileListIpfs,
  },
  data() {
    return {
      isOwner: false,
      balance: "",
      selectedProfile: {},
      profileCreation: [] as any,
      profileCreationObj: {},
      status: {
        isLoading: false,
      },
    };
  },
  watch: {
    async profileCreation(value: any) {
      let permissions = await value[0].contract?.getData(
        "0x4b80742d0000000082ac00003c44cdddb6a900fa2b585dd299e03d12fa4293bc"
      );
      // this.balance = formatEther(
      //   await this.provider.getBalance(value[0].contract?.address as string)
      // );
      this.isOwner = permissions === "0xff" ? true : false;
      return;
    },
    // async keyManager(keyManager) {
    //   console.log(keyManager);
    //   this.keyManagerOwner = await keyManager.owner();
    // },
  },
  // async setup() {
  //   const { provider } = await getSigner();
  //   return {
  //     provider,
  //   };
  // },
  methods: {
    formatNumber,
    async createProfileOnChain(selectedProfile: {
      profile: LSP3ProfileJSON;
      url: string;
    }) {
      this.selectedProfile = selectedProfile;

      const lspFactory = await getLspFactory();

      const lsp3UniversalProfileDeployment$ =
        lspFactory.LSP3UniversalProfile.deploy({
          controllerAddresses: ["0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc"],
          lsp3Profile: {
            json: selectedProfile.profile,
            url: selectedProfile.url,
          },
        });

      this.status.isLoading = true;
      lsp3UniversalProfileDeployment$.subscribe({
        next: (deploymentEvent: any) => {
          console.log(deploymentEvent);
          this.profileCreation = Object.values(deploymentEvent);
        },
        error: (error: Error) => {
          console.log(error);
          this.status.isLoading = false;
        },
        complete: () => {
          this.status.isLoading = false;
        },
      });
      return;
    },
  },
});
</script>

<style></style>
