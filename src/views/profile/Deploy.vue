<script setup lang="ts">
import { ref, onMounted } from "vue";
import Notifications from "@/components/Notification.vue";
import ProfileListIpfs from "@/components/profile/profile-list-ipfs/ProfileListIpfs.vue";
import useNotifications from "@/compositions/useNotifications";
import { useLspFactory } from "@/compositions/useLspFactory";
import ProfileModal from "@/components/profile/ProfileModal.vue";
import { createBlockScoutLink } from "@/utils/createLinks";
import { formatNumber } from "@/helpers/ethers";
import {
  LSP3ProfileJSON,
  DeploymentEvent,
  DeploymentStatus,
  DeploymentType,
} from "@lukso/lsp-factory.js";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();
const isModalOpen = ref(false);
const controllerKey = ref("");
const selectedProfile = ref({ profile: {} as LSP3ProfileJSON, url: "" });
const profileDeploymentEvents = ref<DeploymentEvent[]>([]);
const isLoading = ref(false);
const { deployUniversalProfile } = useLspFactory();

const deploy = async (controllerKey: string) => {
  isLoading.value = true;
  closeModal();
  if (controllerKey) {
    window.onbeforeunload = function (e) {
      e.preventDefault();
      e.returnValue = "";
    };
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
            isLoading.value = false;
            profileDeploymentEvents.value.push(deploymentEvent);
            localStorage.setItem(
              "profileDeploymentEvents",
              JSON.stringify(profileDeploymentEvents.value)
            );

            return deploymentEvent;
          },
          error: (err) => {
            isLoading.value = false;
            setNotification(err as string, "danger");
          },
          complete: () => {
            isLoading.value = false;
          },
        },
      }
    );
  } else {
    isLoading.value = false;
    setNotification("Invalid controller address", "danger");
  }

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

onMounted(async () => {
  const profileDeploymentEventsData = localStorage.getItem(
    "profileDeploymentEvents"
  );
  if (profileDeploymentEventsData) {
    profileDeploymentEvents.value = JSON.parse(profileDeploymentEventsData);
  }
});
</script>

<template>
  <section class="section">
    <Notifications
      v-if="hasNotification"
      :notification="notification"
      class="mt-4"
      @hide="clearNotification"
    ></Notifications>
    <div class="tile is-ancestor">
      <div class="tile is-vertical is-parent is-12">
        <div class="tile is-child box">
          <h1 class="title">Deploy Profile</h1>
          <ProfileListIpfs
            :loading="isLoading"
            @createProfileOnChain="openModal"
            @set-notification="setNotification($event)"
          ></ProfileListIpfs>
        </div>

        <div class="tile is-child box">
          <h2 class="title">Deployment Events</h2>
          <div class="table-container">
            <table
              class="
                table
                is-bordered is-striped is-narrow is-hoverable is-fullwidth
              "
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
                  <span
                    class="tag"
                    :class="getStatusClass(deploymentEvent.status)"
                  >
                    {{ deploymentEvent.status }}
                  </span>
                </td>
                <td>{{ deploymentEvent.contractName }}</td>
                <td>{{ deploymentEvent?.contractName }}</td>
                <td>
                  <code v-if="deploymentEvent?.receipt?.contractAddress">
                    {{ deploymentEvent?.receipt?.contractAddress }}
                  </code>
                </td>

                <td class="has-text-right">
                  {{
                    deploymentEvent.receipt
                      ? deploymentEvent.receipt.gasUsed?._hex
                        ? formatNumber(+deploymentEvent.receipt.gasUsed?._hex)
                        : formatNumber(+deploymentEvent.receipt.gasUsed)
                      : ""
                  }}
                </td>
                <td>
                  <a
                    v-if="deploymentEvent?.receipt"
                    :href="
                      createBlockScoutLink(
                        deploymentEvent?.receipt?.transactionHash
                      )
                    "
                    target="_blank"
                    class="button is-small mb-1"
                  >
                    {{
                      deploymentEvent?.receipt?.transactionHash.substring(
                        0,
                        16
                      )
                    }}...
                  </a>
                  <a
                    v-if="deploymentEvent?.transaction"
                    :href="
                      createBlockScoutLink(deploymentEvent?.transaction?.hash)
                    "
                    target="_blank"
                    class="button is-small mb-1"
                  >
                    {{ deploymentEvent?.transaction?.hash.substring(0, 16) }}...
                  </a>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  </section>

  <ProfileModal
    :is-modal-open="isModalOpen"
    :selected-profile="selectedProfile"
    :controller-key="controllerKey"
    @close-modal="closeModal"
    @deploy="deploy"
    @update:modelValue="(value) => (controllerKey = value)"
  />
</template>
