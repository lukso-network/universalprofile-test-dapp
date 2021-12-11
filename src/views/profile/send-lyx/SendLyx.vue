<template>
  <section class="section">
    <h1 class="title">Send LYX</h1>

    <div class="columns">
      <div class="column is-three-fifths is-offset-one-fifth">
        <Notifications
          v-if="notification.message"
          :notification="notification"
          @hide="clearNotification"
        ></Notifications>
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
            <Profile
              :profile="sender.LSP3Profile"
              :address="address"
              class="sender"
            ></Profile>
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
            <Profile
              :profile="receiver.LSP3Profile"
              :address="search"
            ></Profile>
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

<script setup lang="ts">
import { ref, computed } from "vue";
import Notifications from "@/components/ui/Notification.vue";
import Profile from "@/components/ui/Profile.vue";
import { DEFAULT_IPFS_URL } from "@/helpers/config";
import {
  getBalance,
  requestAccounts,
  sendTransaction,
  accounts,
} from "@/services/ethereum.service";
import { fetchProfile } from "@/services/erc725.service";
import Web3 from "web3";
import { Errors, Notification, LSP3ProfileNested } from "@/types";

const notification = ref({} as Notification);
const sender = ref({} as LSP3ProfileNested);
const receiver = ref({} as LSP3ProfileNested);
const balance = ref("");
const amount = ref("");
const hasExtension = ref(false);
const search = ref("");
const queryPending = ref(false);
const errors = ref({} as Errors);
const address = ref("");
const pendingTransaction = ref(false);

const { ethereum } = window;

if (ethereum) {
  hasExtension.value = true;
} else {
  throw new Error("No ethereum object");
}

try {
  const account = await accounts();

  if (account) {
    address.value = account;
  } else {
    address.value = await requestAccounts();
  }
} catch (error: any) {
  notification.value = {
    message: error?.message,
    type: "danger",
  };
}

if (address.value) {
  sender.value = await fetchProfile(address.value);
  balance.value = await getBalance(address.value);
}

const sendLyx = async () => {
  notification.value = {};

  if (!validate()) {
    notification.value = {
      message: "There was some issue in your form",
      type: "danger",
    };
    return;
  }
  try {
    pendingTransaction.value = true;
    await sendTransaction(address.value, search.value, amount.value.toString());
  } catch (error) {
    if (error instanceof Error) {
      notification.value = {
        message: `Error: ${error.message}`,
        type: "danger",
      };
    } else {
      throw error;
    }
  } finally {
    pendingTransaction.value = false;
    balance.value = await getBalance(address.value);
  }

  notification.value = {
    message: `You successfully send ${amount.value} LYX`,
    type: "primary",
  };
  amount.value = "";
};

const clearNotification = () => {
  notification.value = {};
};

const searchReceiver = async () => {
  queryPending.value = true;
  delete errors.value.search;

  if (!Web3.utils.isAddress(search.value)) {
    receiver.value.LSP3Profile = {
      name: "",
      description: "",
    };
    queryPending.value = false;
    errors.value.search = "Address not valid";
    return;
  }

  try {
    receiver.value = await fetchProfile(search.value);
  } catch (error) {
    if (error instanceof Error) {
      errors.value.search = error.message;
    }
  }
  queryPending.value = false;
};

const installExtension = () => {
  // ! TODO link to extension install
  const w = window.open(
    "https://chrome.google.com/webstore/category/extensions?hl=en",
    "_blank"
  );

  if (w) {
    w.focus();
  }

  return false;
};

const validate = () => {
  if (search.value && address.value && amount.value) {
    return true;
  }

  errors.value = {};

  if (!amount.value) {
    errors.value.amount = "Amount is missing";
  }

  if (!search.value) {
    errors.value.search = "Receiver is missing";
  }

  return false;
};

const backgroundImageSrc = computed(() => {
  const backgroundImage = sender.value?.LSP3Profile?.backgroundImage;

  if (backgroundImage) {
    const backgroundUrl = backgroundImage[2]?.url as string;
    return backgroundUrl.replace("ipfs://", DEFAULT_IPFS_URL);
  } else {
    return "";
  }
});
</script>

<style scoped lang="scss">
.nowrap {
  white-space: nowrap;
}

:deep(.sender) {
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
  background-position: 50%;
}
</style>
