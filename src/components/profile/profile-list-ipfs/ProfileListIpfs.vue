<template>
  <section
    class="has-background-success-light p-5"
    v-if="uploadedProfiles.length > 0"
  >
    <h2 class="title is-size-4">Previously Uploaded Profiles</h2>
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
        v-bind:key="uploadedProfile"
      >
        <td>
          {{ uploadedProfile.profile.LSP3Profile.name }}
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
            @click="createProfileOnChain(uploadedProfile)"
            :class="loading ? 'is-loading' : ''"
            :disabled="loading"
          >
            Deploy
          </button>
        </td>
      </tr>
    </table>
  </section>
</template>

<script src="./profile-list-ipfs.component.ts" lang="ts"></script>
