<template>
  <div class="media">
    <div
      class="media-left profile-image"
      :style="{ backgroundImage: `url(${identiconSrc})` }"
    >
      <figure class="image is-48x48">
        <div :style="{ backgroundImage: `url(${profileImage})` }"></div>
      </figure>
    </div>
    <div class="media-content pt-2">
      <p class="title is-5" v-if="profile?.name">@{{ profile?.name }}</p>
      <p class="has-text-grey-light is-5 mt-2" v-else>No profile found</p>
      <p class="subtitle is-7 has-text-grey-light" v-if="profile?.name">
        {{ address }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { DEFAULT_IPFS_URL } from "@/helpers/config";
import makeBlockie from "ethereum-blockies-base64";

export default defineComponent({
  name: "UiProfile",
  props: {
    profile: Object,
    address: String,
  },
  computed: {
    profileImage() {
      if (this.profile?.profileImage) {
        const profileUrl = this.profile?.profileImage[4]?.url as string;
        return profileUrl.replace("ipfs://", DEFAULT_IPFS_URL);
      } else {
        return "https://bulma.io/images/placeholders/96x96.png";
      }
    },
    identiconSrc() {
      return this.address && this.profile?.name
        ? makeBlockie(this.address)
        : "";
    },
  },
});
</script>

<style lang="scss">
.profile-image {
  padding: 3px;
  border-radius: 50%;
}

.profile-image .image div {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #f2f2f2;
  background-position: 50%;
  background-size: cover;
}
</style>
