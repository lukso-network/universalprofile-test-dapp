<script setup lang="ts">
import { formatNumber } from "@/helpers/ethers";
import {
  LSP3ProfileJSON,
  DeploymentEvent,
  DeploymentStatus,
  DeploymentType,
} from "@lukso/lsp-factory.js";
import { ref } from "vue";
import Notifications from "@/components/Notification.vue";
import ProfileListIpfs from "@/components/profile/profile-list-ipfs/ProfileListIpfs.vue";
import useNotifications from "@/compositions/useNotifications";
import { useLspFactory } from "@/compositions/useLspFactory";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();
const isModalOpen = ref(false);
const controllerKey = ref("");
const selectedProfile = ref({ profile: {} as any, url: "" });
const profileDeploymentEvents = ref<DeploymentEvent[]>([]);
const status = ref({
  isLoading: false,
});
const { deployUniversalProfile } = useLspFactory();

const deploy = async (controllerKey: string) => {
  closeModal();
  status.value.isLoading = true;

  await deployUniversalProfile(
    {
      controllerAddresses: [controllerKey],
      lsp3Profile: {
        json: selectedProfile.value.profile,
        url: selectedProfile.value.url,
      },
    },
    {
      onDeployEvents: {
        next: (deploymentEvent) => {
          console.log(deploymentEvent);
          profileDeploymentEvents.value.push(deploymentEvent);
          return deploymentEvent;
        },
        error: (err) => {
          status.value.isLoading = false;
          setNotification(`Error deploying profile`, "danger");
          console.error(err);
        },
        complete: (contracts) => {
          status.value.isLoading = false;
          return contracts;
        },
      },
    }
  );

  return;
};

const openModal = (selectedProfileData: {
  profile: LSP3ProfileJSON;
  url: string;
}) => {
  isModalOpen.value = true;
  selectedProfile.value = selectedProfileData;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const getTypeClass = (type: string) => {
  return {
    "is-primary": type === DeploymentType.PROXY,
    "is-warning": type === DeploymentType.BASE_CONTRACT,
    "is-info": type === DeploymentType.TRANSACTION,
  };
};

const getStatusClass = (status: string) => {
  return {
    "is-light": status === DeploymentStatus.PENDING,
    "is-success": status === DeploymentStatus.COMPLETE,
  };
};

const createBlockScoutLink = (hash: string) => {
  return `https://blockscout.com/lukso/l14/tx/${hash}/internal-transactions`;
};
</script>

<template>
  <section class="section">
    <Notifications
      v-if="hasNotification"
      :notification="notification"
      class="mt-4"
      @hide="clearNotification"
    ></Notifications>
    <h1 class="title">Deploy Profile</h1>
    <ProfileListIpfs
      :loading="status.isLoading"
      @createProfileOnChain="openModal"
    ></ProfileListIpfs>
    <br />
    <h2 class="title">Deployment Events</h2>
    <div class="table-container">
      <table
        class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
      >
        <tr>
          <th>Type</th>
          <th>Status</th>
          <th>Name</th>
          <th>Function</th>
          <th>Address</th>
          <th class="has-text-right pr-4">Gas</th>
          <th>TransactionHash</th>
        </tr>
        <tr
          v-for="deploymentEvent in profileDeploymentEvents"
          :key="deploymentEvent.status"
          :class="deploymentEvent.status"
        >
          <td>
            <span class="tag" :class="getTypeClass(deploymentEvent.type)">
              {{ deploymentEvent.type }}
            </span>
          </td>
          <td>
            <span class="tag" :class="getStatusClass(deploymentEvent.status)">
              {{ deploymentEvent.status }}
            </span>
          </td>
          <td>{{ deploymentEvent.contractName }}</td>
          <!-- <td>{{ deploymentEvent?.functionName }}</td> -->
          <td>{{ deploymentEvent.contractName }}</td>
          <td>
            <code v-if="deploymentEvent?.receipt?.contractAddress">
              {{ deploymentEvent?.receipt?.contractAddress }}
            </code>
          </td>

          <td class="has-text-right">
            {{
              deploymentEvent?.receipt
                ? formatNumber(+deploymentEvent?.receipt.gasUsed)
                : ""
            }}
          </td>
          <td>
            <a
              v-if="deploymentEvent?.receipt"
              :href="
                createBlockScoutLink(deploymentEvent?.receipt?.transactionHash)
              "
              class="button is-small mb-1"
            >
              {{
                deploymentEvent?.receipt?.transactionHash.substring(0, 16)
              }}...
            </a>
            <a
              v-if="deploymentEvent?.transaction"
              :href="createBlockScoutLink(deploymentEvent?.transaction?.hash)"
              class="button is-small mb-1"
            >
              {{ deploymentEvent?.transaction?.hash.substring(0, 16) }}...
            </a>
          </td>
        </tr>
      </table>
    </div>
  </section>

  <div class="modal modal-container" :class="isModalOpen ? 'is-active' : ''">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Deploy LSP3UniversalProfile</p>
        <button class="delete" aria-label="close" @click="closeModal"></button>
      </header>
      <section class="modal-card-body">
        <form>
          <div class="field">
            <label class="label">Controller Key</label>
            <p class="control">
              <input
                v-model="controllerKey"
                class="input"
                type="text"
                placeholder="Address (0x...)"
                required
              />
            </p>
          </div>
          <p class="help">
            Enter the address which will be managing the profile.
          </p>
        </form>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" @click="deploy(controllerKey)">
          Deploy
        </button>
        <button class="button" @click="closeModal">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.placeholder {
  opacity: 0.1;
}

.table-inline {
  td {
    border: none !important;
  }
}
.modal-container {
  padding: 0 20px;
}

.pending {
  background: hsl(206deg, 70%, 96%);
}

.complete {
  background: hsl(142deg, 52%, 96%);
}
</style>
