import { formatNumber } from "@/helpers/ethers";
import {
  LSP3ProfileJSON,
  DeploymentEvent,
  DeploymentStatus,
  DeploymentType,
} from "@lukso/lsp-factory.js";
import { defineComponent } from "vue";
import ProfileListIpfs from "@/components/profile/profile-list-ipfs/ProfileListIpfs.vue";
import { getDeployedBaseContracts } from "@/helpers/deployment.helper";
import { getSigner } from "@/services/provider.service";
import { useLspFactory } from "@/compositions/useLspFactory";

export default defineComponent({
  components: {
    ProfileListIpfs,
  },
  data() {
    return {
      isOwner: false,
      isModalOpen: false,
      controllerKey: "",
      balance: "",
      selectedProfile: { profile: {} as any, url: "" },
      profileDeploymentEvents: [] as DeploymentEvent[],
      profileDeploymentEventsObj: {},
      status: {
        isLoading: false,
      },
    };
  },
  computed: {},
  methods: {
    formatNumber,
    async deploy(controllerKey: string) {
      this.closeModal();
      const signer = await getSigner();
      const network = await signer.provider.getNetwork();
      const networkDetails = await getDeployedBaseContracts(network.chainId);
      const lspFactory = await useLspFactory();

      this.status.isLoading = true;
      lspFactory.LSP3UniversalProfile.deploy(
        {
          controllerAddresses: [controllerKey],
          lsp3Profile: {
            json: this.selectedProfile.profile,
            url: this.selectedProfile.url,
          },
        },
        {
          libAddresses: {
            lsp3AccountInit: networkDetails.baseContracts.LSP3Account["0.0.1"],
            universalReceiverAddressStoreInit:
              networkDetails.baseContracts.UniversalReceiverAddressStore[
                "0.0.1"
              ],
          },
        }
      ).subscribe({
        next: (deploymentEvent: DeploymentEvent) => {
          this.profileDeploymentEvents.push(deploymentEvent);
        },
        error: (error: Error) => {
          console.error(error);
          this.status.isLoading = false;
        },
        complete: () => {
          this.status.isLoading = false;
        },
      });

      return;
    },

    openModal(selectedProfile: { profile: LSP3ProfileJSON; url: string }) {
      this.isModalOpen = true;
      this.selectedProfile = selectedProfile;
    },

    closeModal() {
      this.isModalOpen = false;
    },

    getTypeClass(type: string) {
      return {
        "is-primary": type === DeploymentType.PROXY,
        "is-warning": type === DeploymentType.CONTRACT,
        "is-info": type === DeploymentType.TRANSACTION,
      };
    },

    getStatusClass(status: string) {
      return {
        "is-light": status === DeploymentStatus.PENDING,
        "is-success": status === DeploymentStatus.COMPLETE,
      };
    },

    createBlockScoutLink(hash: string) {
      return `https://blockscout.com/lukso/l14/tx/${hash}/internal-transactions`;
    },
  },
});
