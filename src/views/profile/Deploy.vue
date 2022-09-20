<script setup lang="ts">
// @ts-nocheck
import Notifications from '@/components/Notification.vue'
import ProfileListIpfs from '@/components/profile/profile-list-ipfs/ProfileListIpfs.vue'
import { ref } from 'vue'
import useNotifications from '@/compositions/useNotifications'
import { NETWORKS } from '@/helpers/config'
import { useLspFactory } from '@/compositions/useLspFactory'
import ProfileModal from '@/components/modals/ProfileModal.vue'
import { createBlockScoutLink } from '@/utils/createLinks'
import { formatNumber } from '@/helpers/formatNumber'
import {
  LSP3ProfileJSON,
  DeploymentEvent,
  DeploymentStatus,
  DeploymentType,
} from '@lukso/lsp-factory.js'
import { getAndPrepareAllIpfsItems } from '@/helpers/localstorage'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const isModalOpen = ref(false)
const controllerKey = ref('')
const selectedProfile = ref({ profile: {} as LSP3ProfileJSON, url: '' })
const profileDeploymentEvents = ref<DeploymentEvent[]>([])
const isLoading = ref(false)
const { deployUniversalProfile } = useLspFactory()
const uploadedProfiles = ref(getAndPrepareAllIpfsItems())
const uploadTarget = ref(NETWORKS.l16.ipfs.url)

const deploy = async (controllerKey: string) => {
  isLoading.value = true
  profileDeploymentEvents.value = []
  closeModal()
  if (controllerKey) {
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
          next: deploymentEvent => {
            isLoading.value = false
            profileDeploymentEvents.value.push(deploymentEvent)
            localStorage.setItem(
              'profileDeploymentEvents',
              JSON.stringify(profileDeploymentEvents.value)
            )
            const hash = deploymentEvent?.transaction
              ? deploymentEvent?.transaction?.hash.substring(0, 16)
              : deploymentEvent?.receipt?.transactionHash?.substring(0, 16)
            const href = deploymentEvent?.receipt
              ? createBlockScoutLink(
                  deploymentEvent?.receipt?.transactionHash,
                  true
                )
              : createBlockScoutLink(deploymentEvent?.transaction?.hash, true)
            setNotification(
              `Profile deployed successfully <br/> <a href="${href}" target="_blank">${hash}</a>`,
              'primary'
            )
            return deploymentEvent
          },
          error: err => {
            isLoading.value = false
            profileDeploymentEvents.value = []
            if (err?.code === 4001) {
              setNotification(err?.message, 'danger')
            } else {
              setNotification(err as string, 'danger')
            }
          },
          complete: () => {
            isLoading.value = false
          },
        },
      }
    )
  } else {
    isLoading.value = false
    setNotification('Invalid controller address', 'danger')
  }

  return
}

const openModal = (selectedProfileData: {
  profile: LSP3ProfileJSON
  url: string
}) => {
  isModalOpen.value = true
  selectedProfile.value = selectedProfileData
}

const closeModal = () => {
  isModalOpen.value = false
}

const getTypeClass = (type: string) => {
  return {
    'is-primary': type === DeploymentType.PROXY,
    'is-warning': type === DeploymentType.BASE_CONTRACT,
    'is-info': type === DeploymentType.TRANSACTION,
  }
}

const getStatusClass = (status: string) => {
  return {
    'is-light': status === DeploymentStatus.PENDING,
    'is-success': status === DeploymentStatus.COMPLETE,
  }
}

const deleteUploadedProfile = (url: string) => {
  const formattedUrl = url.replace(uploadTarget.value, 'ipfs://')
  localStorage.removeItem(formattedUrl)
  uploadedProfiles.value = getAndPrepareAllIpfsItems()
  setNotification('Profile deleted successfully', 'primary')
}

const getIdFromProfileUrl = (uploadedProfile: {
  profile: string
  url: string
}) => {
  return uploadedProfile.url.replace(uploadTarget.value, '')
}
</script>

<template>
  <section class="section">
    <div class="mb-3">
      <Notifications
        v-if="hasNotification"
        :notification="notification"
        class="mt-4"
        @hide="clearNotification"
      />
    </div>
    <div class="tile is-ancestor">
      <div class="tile is-vertical is-parent is-12">
        <profile-list-ipfs
          :loading="isLoading"
          :uploaded-profiles="uploadedProfiles"
          :get-id-from-profile-url="getIdFromProfileUrl"
          class="tile is-child box"
          @create-profile-on-chain="openModal"
          @set-notification="setNotification($event)"
          @delete-uploaded-profile="deleteUploadedProfile"
        />
        <div class="tile is-child box">
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
                  <span
                    class="tag"
                    :class="getStatusClass(deploymentEvent.status)"
                  >
                    {{ deploymentEvent.status }}
                  </span>
                </td>
                <td>{{ deploymentEvent.contractName }}</td>
                <td>{{ deploymentEvent?.functionName }}</td>
                <td>
                  <code v-if="deploymentEvent?.receipt?.contractAddress">
                    {{ deploymentEvent?.receipt?.contractAddress }}
                  </code>
                </td>

                <td class="has-text-right">
                  {{
                    deploymentEvent.receipt
                      ? deploymentEvent.receipt.gasUsed?.hex
                        ? formatNumber(+deploymentEvent.receipt.gasUsed?.hex)
                        : formatNumber(+deploymentEvent.receipt.gasUsed)
                      : ''
                  }}
                </td>
                <td>
                  <a
                    v-if="deploymentEvent?.receipt"
                    :href="
                      createBlockScoutLink(
                        deploymentEvent?.receipt?.transactionHash,
                        true
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
                      createBlockScoutLink(
                        deploymentEvent?.transaction?.hash,
                        true
                      )
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
    <ProfileModal
      :is-modal-open="isModalOpen"
      :selected-profile="selectedProfile"
      :controller-key="controllerKey"
      @close-modal="closeModal"
      @deploy="deploy"
      @update:model-value="value => (controllerKey = value)"
    />
  </section>
</template>
