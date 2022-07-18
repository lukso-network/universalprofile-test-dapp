<script src="./profile-list-ipfs.component.ts" lang="ts"></script>

<template>
  <section
    v-if="uploadedProfiles.length > 0"
    class="has-background-success-light p-5"
  >
    <h2 class="title is-size-4">Previously Uploaded Profiles</h2>
    <div class="table-container">
      <table
        class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
      >
        <tr>
          <th>Name</th>
          <th>Identifier</th>
          <th>Deploy</th>
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
            <a
              v-if="uploadedProfile.url"
              :href="uploadedProfile.url"
              target="_blank"
              rel="noopener noreferrer"
              >{{ uploadedProfile.url.replace(uploadTarget, "") }}</a
            >
          </td>
          <td>
            <button
              class="button is-success"
              :class="loading ? 'is-loading' : ''"
              :disabled="loading"
              @click="createProfileOnChain(uploadedProfile)"
            >
              Deploy
            </button>
          </td>
        </tr>
      </table>
    </div>
  </section>
</template>
