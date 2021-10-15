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
            <UiProfile
              :profile="sender.LSP3Profile"
              :address="address"
              class="sender"
            ></UiProfile>
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
                  @keyup="searchReceiver"
                />
                <span class="has-text-danger" v-if="errors.search">{{
                  errors.search
                }}</span>
              </div>
            </div>
            <UiProfile
              :profile="receiver.LSP3Profile"
              :address="search"
            ></UiProfile>
            <div class="field is-grouped is-grouped-centered pt-4">
              <p class="control">
                <button
                  class="button is-primary is-rounded"
                  :class="{ 'is-loading': pendingTransaction }"
                  @click="sendLyx"
                >
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
import { DEFAULT_IPFS_URL } from "@/helpers/config";
import {
  getBalance,
  getAccount,
  sendTransaction,
} from "@/services/ethereum.service";
import { fetchProfile } from "@/services/erc725.service";
import { LSP3Profile } from "@lukso/lsp-factory.js";

interface Errors {
  search?: string;
  amount?: string;
}

interface Notification {
  message?: string;
  type?: string;
}

interface LSP3ProfileNested extends LSP3Profile {
  LSP3Profile?: LSP3Profile;
}

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
      sender: {} as LSP3ProfileNested,
      receiver: {} as LSP3ProfileNested,
      balance: "",
      amount: "",
      hasExtension: false,
      search: "",
      queryPending: false,
      errors: {} as Errors,
      address: "",
      pendingTransaction: false,
    };
  },
  async created() {
    const { ethereum } = window;

    if (ethereum) {
      this.hasExtension = true;
    } else {
      return;
    }

    this.address = await getAccount();
    this.sender = await fetchProfile(this.address);
    this.balance = await getBalance(this.address);
  },

  methods: {
    async sendLyx() {
      this.notification = {};

      if (!this.validate()) {
        this.notification = {
          message: "There was some issue in your form",
          type: "danger",
        };
        return;
      }
      try {
        this.pendingTransaction = true;
        await sendTransaction(
          this.address,
          this.search,
          this.amount.toString()
        );
      } catch (error) {
        this.notification = {
          message: `Error: ${error.message}`,
          type: "danger",
        };
        throw Error(error);
      } finally {
        this.pendingTransaction = false;
        this.balance = await getBalance(this.address);
      }

      this.notification = {
        message: `You successfully send ${this.amount} LYX`,
        type: "primary",
      };
      this.amount = "";
    },

    clearNotification() {
      this.notification = {};
    },

    async searchReceiver() {
      this.queryPending = true;
      delete this.errors.search;
      this.receiver.LSP3Profile = {
        name: "",
        description: "",
      };

      try {
        this.receiver = await fetchProfile(this.search);
      } catch (error) {
        this.errors.search = error.message;
      }
      this.queryPending = false;
    },

    installExtension() {
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
      if (this.search && this.address && this.amount) {
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
      const backgroundImage = this.sender?.LSP3Profile?.backgroundImage;

      if (backgroundImage) {
        const backgroundUrl = backgroundImage[2]?.url as string;
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

      div {
        height: 75px;
        width: 75px;
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
