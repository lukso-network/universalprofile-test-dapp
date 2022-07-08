<script setup lang="ts">
import { computed } from "vue";
import makeBlockie from "ethereum-blockies-base64";
import { LSP3Profile } from "@lukso/lsp-factory.js";
import { DEFAULT_NETWORK_CONFIG } from "@/utils/networkConfig";

const props = defineProps<{
  profile?: LSP3Profile;
  address?: string;
}>();

const profileImage = computed(() => {
  if (props.profile?.profileImage) {
    const profileUrl = props.profile?.profileImage[4]?.url as string;
    return profileUrl.replace("ipfs://", DEFAULT_NETWORK_CONFIG.ipfs.url);
  } else {
    return "https://bulma.io/images/placeholders/96x96.png";
  }
});

const identiconSrc = computed(() =>
  props.address ? makeBlockie(props.address) : ""
);
</script>

<template name="Profile">
  <div class="media">
    <div
      class="media-left profile-image"
      :style="{ backgroundImage: `url(${identiconSrc})` }"
      data-testid="identicon"
    >
      <figure class="image is-48x48">
        <div
          :style="{ backgroundImage: `url(${profileImage})` }"
          data-testid="profile-image"
        ></div>
      </figure>
    </div>
    <div class="media-content pt-2">
      <p v-if="profile?.name" class="title is-5" data-testid="name">
        @{{ profile?.name }}
      </p>
      <p class="subtitle is-7 has-text-grey-light" data-testid="address">
        {{ address }}
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-image {
  padding: 3px;
  border-radius: 50%;

  & .image div {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: #f2f2f2;
    background-position: 50%;
    background-size: cover;
  }
}
</style>
