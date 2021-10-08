<template>
  <section class="section">
    <h1 class="title">Send LYX</h1>

    <div class="columns">
      <div class="column is-three-fifths is-offset-one-fifth">
        <UiNotification
          v-if="notification.message"
          :notification="notification"
          @hide="clearNotification"
        ></UiNotification>
      </div>
    </div>
    <div class="columns">
      <div
        class="
          column
          is-6-tablet is-offset-3-tablet is-4-fullhd is-offset-4-fullhd
        "
      >
        <div class="card">
          <div
            class="has-background-primary profile-background pl-5 mb-6"
            :style="{ backgroundImage: `url(${backgroundImageSrc})` }"
            v-if="hasExtension"
          >
            <UiProfile :profile="sender" class="sender"></UiProfile>
          </div>
          <div class="card-content pt-1" v-if="hasExtension">
            <hr />
            <p class="mb-4">You are about to send</p>
            <div class="field-body">
              <div class="field has-addons">
                <p class="control">
                  <input
                    class="input is-large"
                    type="number"
                    placeholder="0"
                    v-model="amount"
                  />
                </p>
                <p class="control">
                  <a class="button is-static is-large">LYX</a>
                </p>
              </div>
              <div
                class="
                  field
                  nowrap
                  is-flex is-flex-direction-column is-justify-content-center
                  subtitle
                  is-6
                "
              >
                <div>Your balance:</div>
                <div>{{ balance }} LYX</div>
              </div>
            </div>
            <hr />
            <p class="mb-4">To profile</p>
            <div class="field">
              <div
                class="control is-small"
                :class="{ 'is-loading': queryPending }"
              >
                <input
                  class="input is-small"
                  type="text"
                  placeholder="Search: Universal Profile Address..."
                  v-model="search"
                  @change="searchReceiver"
                  @keyup="searchReceiver"
                />
              </div>
            </div>
            <UiProfile :profile="receiver"></UiProfile>
            <div class="field is-grouped is-grouped-centered pt-4">
              <p class="control">
                <button class="button is-primary is-rounded" @click="sendLyx">
                  Send LYX
                </button>
              </p>
            </div>
          </div>
          <div class="card-content" v-else>
            <div
              class="
                notification
                is-info is-light is-flex is-flex-direction-column
                pr-5
                has-text-centered
              "
            >
              You need Browser Extension for sending LYX.
              <button
                class="button is-info is-rounded mt-4"
                @click="installExtension"
              >
                Install Browser Extension
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import UiNotification from "@/components/ui/Notification.vue";
import UiProfile from "@/components/ui/Profile.vue";
import { request } from "graphql-request";
import { LSP3Profile } from "@lukso/lsp-factory.js";
import { gql } from "graphql-request";
import { DEFAULT_IPFS_URL, ERC725_CACHE_URL } from "@/helpers/config";

interface Notification {
  message?: string;
  type?: string;
}

const profileQuery = function (address: string): string {
  return gql`
    {
      LSP3UniversalProfiles(
        where: {
          address: { equals: "${address}" }
        }
      ) {
        LSP3Profile {
          name
          profileImage
          backgroundImage
          address
        }
      }
    }
  `;
};

export default defineComponent({
  name: "ProfileSendLyx",
  components: {
    UiNotification,
    UiProfile,
  },
  props: {},
  data() {
    return {
      notification: {} as Notification,
      sender: {} as LSP3Profile,
      receiver: {} as LSP3Profile,
      balance: 5 as number,
      amount: "" as string,
      hasExtension: false as boolean,
      search: "" as string,
      queryPending: false as boolean,
    };
  },
  async created(): Promise<void> {
    //! TODO detect if there is a browser extension installed
    this.hasExtension = true;

    //! TODO get own address from extension
    const address = "0x97bEE0617167DFcA08B02C2966cad2b7429c6BAd";

    this.sender = await this.queryProfile(address as string);
  },

  methods: {
    sendLyx(): void {
      // ! TODO provide send LYX logic
      // ! update balance
      // ! add validation

      this.notification = {
        message: `You successfully send ${this.amount} LYX`,
        type: "primary",
      };
      this.amount = "";
    },

    clearNotification(): void {
      this.notification = {};
    },

    async queryProfile(address: string): Promise<LSP3Profile> {
      this.queryPending = true;
      const queryProfile = await request(
        ERC725_CACHE_URL,
        profileQuery(address)
      );
      this.queryPending = false;
      console.log(queryProfile.LSP3UniversalProfiles[0].LSP3Profile);
      return queryProfile.LSP3UniversalProfiles[0].LSP3Profile;
    },

    async searchReceiver(): Promise<void> {
      this.receiver = await this.queryProfile(this.search);
    },

    installExtension(): boolean {
      // ! TODO link to extension install
      const w = window.open(
        "https://chrome.google.com/webstore/category/extensions?hl=en",
        "_blank"
      );

      if (w) {
        w.focus();
      }

      return false;
    },
  },
  computed: {
    backgroundImageSrc() {
      if (this.sender?.backgroundImage) {
        const backgroundUrl = this.sender?.backgroundImage[2]?.url as string;
        return backgroundUrl.replace("ipfs://", DEFAULT_IPFS_URL);
      } else {
        return "";
      }
    },
  },
});
</script>

<style lang="scss">
.nowrap {
  white-space: nowrap;
}

.sender {
  position: relative;
  top: 55px;
  margin-bottom: 0;

  .profile-image {
    border: 4px white solid;

    .image {
      width: 75px;
      height: 75px;

      img {
        height: 75px;
      }
    }
  }

  .media-content {
    margin-top: 35px;
  }
}

.profile-background {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  height: 90px;
  background-size: cover;
}
</style>
