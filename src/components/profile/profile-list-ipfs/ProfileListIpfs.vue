<script setup lang="ts">
// @ts-nocheck
import parseLspStringToJson from '@/utils/parseLspStringToJson'
import { LSP3ProfileJSON } from '@lukso/lsp-factory.js'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

type UploadedProfileType<T extends string | LSP3ProfileJSON> = {
  url: string
  profile: T
}

type Props = {
  loading: boolean
  getIdFromProfileUrl: (url: UploadedProfileType<string>) => string
  uploadedProfiles: UploadedProfileType<string>[]
}

type Emits = {
  (
    event: 'createProfileOnChain',
    uploadedProfile: UploadedProfileType<LSP3ProfileJSON>
  ): void
  (event: 'setNotification', message: string, type: string): void
  (event: 'deleteUploadedProfile', url: string): void
}

defineProps<Props>()

const currentUploadedProfileUrl = ref('')

const emits = defineEmits<Emits>()

const router = useRouter()

const createProfileOnChain = (
  uploadedProfile: UploadedProfileType<LSP3ProfileJSON>
) => {
  currentUploadedProfileUrl.value = uploadedProfile.url
  emits('createProfileOnChain', uploadedProfile)
}

const deleteUploadedProfile = (url: string) => {
  if (window.confirm('Are you sure you want to delete this profile?')) {
    emits('deleteUploadedProfile', url)
    emits('setNotification', 'Profile deleted from IPFS', 'success')
  }
}
</script>

<template v-if="uploadedProfiles.length > 0">
  <section>
    <h1 class="title" data-testid="deploy-title">Deploy Profile</h1>
    <h2 class="title is-size-4">Previously Uploaded Profiles</h2>
    <div class="table-container">
      <table
        class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
      >
        <tr>
          <th>Name</th>
          <th>Identifier</th>
          <th>Deploy</th>
          <th></th>
        </tr>
        <tr v-for="(uploadedProfile, index) in uploadedProfiles" :key="index">
          <td>
            {{
              parseLspStringToJson(uploadedProfile.profile)?.json?.LSP3Profile
                ?.name
            }}
          </td>
          <td>
            <a
              @click="
                () =>
                  router.push(
                    `/profiles/${getIdFromProfileUrl(uploadedProfile)}`
                  )
              "
            >
              {{ getIdFromProfileUrl(uploadedProfile) }}
            </a>
          </td>
          <td>
            <button
              class="button is-primary is-rounded my-1"
              :class="{
                'is-loading':
                  loading && currentUploadedProfileUrl === uploadedProfile.url,
              }"
              :disabled="
                loading && currentUploadedProfileUrl === uploadedProfile.url
              "
              data-testid="deploy-button"
              @click="createProfileOnChain(uploadedProfile)"
            >
              <span
                v-if="
                  loading && currentUploadedProfileUrl === uploadedProfile.url
                "
                aria-hidden="true"
                aria-label="loading..."
                data-testid="aria-loading"
              ></span>
              Deploy
            </button>
          </td>
          <td>
            <button
              class="button is-danger is-rounded my-1"
              data-testid="delete-profile"
              @click="deleteUploadedProfile(uploadedProfile.url)"
            >
              Delete
            </button>
          </td>
        </tr>
      </table>
    </div>
  </section>
</template>
