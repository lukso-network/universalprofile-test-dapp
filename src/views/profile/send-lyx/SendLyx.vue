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
                    :class="{ 'is-danger': errors.amount }"
                    type="number"
                    placeholder="0"
                    v-model="amount"
                    @keyup="delete errors.amount"
                  />
                  <span class="has-text-danger" v-if="errors.amount">{{
                    errors.amount
                  }}</span>
                </p>
                <p class="control">
                  <a
                    class="button is-static is-large"
                    :class="{ 'is-danger is-outlined': errors.amount }"
                    >LYX</a
                  >
                </p>
              </div>
              <div
                class="
                  field
                  nowrap
                  is-flex is-flex-direction-column is-justify-content-top
                  subtitle
                  is-6
                  mt-3
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
                  :class="{ 'is-danger': errors.search }"
                  type="text"
                  placeholder="Search: Universal Profile Address..."
                  v-model="search"
                  @change="searchReceiver"
                  @keyup="searchReceiver && delete errors.search"
                />
                <span class="has-text-danger" v-if="errors.search">{{
                  errors.search
                }}</span>
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
import {
  // getAccounts,
  getBalance,
  sendTransaction,
} from "@/services/browser-extension.service";
import { formatEther } from "ethers/lib/utils";

interface Notification {
  message?: string;
  type?: string;
}

interface LSP3ProfileExtended extends LSP3Profile {
  address: string;
}

interface FormError {
  amount?: string;
  search?: string;
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
      sender: {} as LSP3ProfileExtended,
      receiver: {} as LSP3ProfileExtended,
      balance: "" as string,
      amount: "" as string,
      hasExtension: false as boolean,
      search: "" as string,
      queryPending: false as boolean,
      errors: {} as FormError,
    };
  },
  async created(): Promise<void> {
    const { ethereum } = window;

    if (ethereum) {
      this.hasExtension = true;
    }

    //! uncomment once browser extension support this
    // const accounts = await getAccounts();
    // console.log(accounts);
    // const [address] = accounts;
    const address = "0x97bEE0617167DFcA08B02C2966cad2b7429c6BAd";
    this.sender = await this.queryProfile(address as string);

    const balance = await getBalance(address);
    this.balance = formatEther(balance);
  },

  methods: {
    async sendLyx(): Promise<void> {
      this.notification = {};

      if (!this.validate()) {
        this.notification = {
          message: "There was some issue in your form",
          type: "danger",
        };
        return;
      }
      // ! TODO provide send LYX logic
      // ! update balance
      // ! add validation
      try {
        await sendTransaction(
          this.sender.address,
          this.receiver.address,
          this.amount
        );
      } catch (error) {
        this.notification = {
          message: `Error: ${error.message}`,
          type: "danger",
        };
        throw Error(error);
      }

      this.notification = {
        message: `You successfully send ${this.amount} LYX`,
        type: "primary",
      };
      this.amount = "";
    },

    clearNotification(): void {
      this.notification = {};
    },

    async queryProfile(address: string): Promise<LSP3ProfileExtended> {
      this.queryPending = true;
      const queryProfile = await request(
        ERC725_CACHE_URL,
        profileQuery(address)
      );
      this.queryPending = false;
      return queryProfile.LSP3UniversalProfiles[0]?.LSP3Profile;
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

    validate() {
      if (this.search && this.sender?.address && this.amount) {
        return true;
      }

      this.errors = {};

      if (!this.amount) {
        this.errors.amount = "Amount is missing";
      }

      if (!this.search) {
        this.errors.search = "Receiver is missing";
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
