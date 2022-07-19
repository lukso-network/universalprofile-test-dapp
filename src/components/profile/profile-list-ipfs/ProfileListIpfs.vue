<script setup lang="ts">
import { ref } from "vue";
import { getAndPrepareAllIpfsItems } from "@/helpers/localstorage";
import { DEFAULT_IPFS_URL } from "@/helpers/config";
import parseLspStringToJson from "@/utils/parseLspStringToJson";
import { LSP3ProfileJSON } from "@lukso/lsp-factory.js";

type Props = {
  loading: boolean;
};
type UploadedProfileType = {
  url: string;
  profile: LSP3ProfileJSON;
};
type Emits = {
  (event: "createProfileOnChain", uploadedProfile: UploadedProfileType): void;
  (event: "setNotification", message: string, type: string): void;
};
withDefaults(defineProps<Props>(), {
  loading: false,
});
const uploadedProfiles = ref(getAndPrepareAllIpfsItems());
const uploadTarget = ref(DEFAULT_IPFS_URL);
const currentUploadedProfileUrl = ref("");

const emit = defineEmits<Emits>();

const createProfileOnChain = (uploadedProfile: UploadedProfileType) => {
  currentUploadedProfileUrl.value = uploadedProfile.url;
  emit("createProfileOnChain", uploadedProfile);
};

const deleteUploadedProfile = (url: string) => {
  if (window.confirm("Are you sure you want to delete this profile?")) {
    const formattedUrl = url.replace(uploadTarget.value, "ipfs://");
    localStorage.removeItem(formattedUrl);
    uploadedProfiles.value = getAndPrepareAllIpfsItems();
    emit("setNotification", `Profile deleted from IPFS`, "success");
  }
};

const getIdFromProfileUrl = (uploadedProfile: {
  profile: string;
  url: string;
}) => {
  return uploadedProfile.url.replace(uploadTarget.value, "");
};
</script>

<template>
  <section v-if="uploadedProfiles.length > 0" class="p-5">
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
        <tr
          v-for="uploadedProfile in uploadedProfiles"
          :key="uploadedProfile.url"
        >
          <td>
            {{
              parseLspStringToJson(uploadedProfile.profile).json?.LSP3Profile
                ?.name
            }}
          </td>
          <td>
            <router-link
              :to="`/profiles/${getIdFromProfileUrl(uploadedProfile)}`"
            >
              {{ getIdFromProfileUrl(uploadedProfile) }}
            </router-link>
          </td>
          <td>
            <button
              class="button is-success"
              :class="{
                'is-loading':
                  loading && currentUploadedProfileUrl === uploadedProfile.url,
              }"
              :disabled="
                loading && currentUploadedProfileUrl === uploadedProfile.url
              "
              @click="createProfileOnChain(uploadedProfile as UploadedProfileType)"
            >
              Deploy
            </button>
          </td>
          <td>
            <button
              class="button is-danger"
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
