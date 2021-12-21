<template name="SendLyx">
  <section class="section">
    <h1 class="title">Send LYX</h1>

    <div class="columns">
      <div class="column is-three-fifths is-offset-one-fifth">
        <Notifications
          v-if="hasNotification"
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
            <Search
              :errors="errors"
              @error="setSearchError"
              @update="setSearchValue"
            />
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
          <EmptyState v-else />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Notifications from "@/components/shared/Notification.vue";
import Profile from "@/components/shared/Profile.vue";
import EmptyState from "@/views/profile/send-lyx/EmptyState.vue";
import Search from "@/views/profile/send-lyx/Search.vue";
import { DEFAULT_IPFS_URL } from "@/helpers/config";
import {
  getBalance,
  requestAccounts,
  sendTransaction,
  accounts,
} from "@/services/ethereum.service";
import { fetchProfile } from "@/services/erc725.service";
import { Errors, LSP3ProfileNested } from "@/types";
import { EthereumProviderError } from "eth-rpc-errors";
import useNotifications from "@/compositions/useNotifications";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();

const sender = ref({} as LSP3ProfileNested);
const balance = ref("");
const amount = ref("");
const hasExtension = ref(false);
const search = ref("");
const errors = ref({} as Errors);
const address = ref("");
const pendingTransaction = ref(false);

const { ethereum } = window;

if (ethereum) {
  hasExtension.value = true;

  try {
    const account = await accounts();

    if (account) {
      address.value = account;
    } else {
      address.value = (await requestAccounts())[0];
    }
  } catch (error) {
    const epError = error as EthereumProviderError<Error>;

    if (epError.code === 4100) {
      address.value = (await requestAccounts())[0];
    } else {
      setNotification("Please authenticate your account", "danger");
    }
  }

  if (address.value) {
    sender.value = await fetchProfile(address.value);
    balance.value = await getBalance(address.value);
  }
}

const sendLyx = async () => {
  clearNotification();

  if (!validate()) {
    return;
  }

  try {
    pendingTransaction.value = true;
    await sendTransaction(address.value, search.value, amount.value.toString());
  } catch (error) {
    if (error instanceof Error) {
      setNotification(`Error: ${error.message}`, "danger");
    } else {
      throw error;
    }
  } finally {
    pendingTransaction.value = false;
    balance.value = await getBalance(address.value);
  }

  setNotification(`You successfully send ${amount.value} LYX`);
  amount.value = "";
};

const setSearchError = (error: string) => {
  errors.value.search = error;
};

const setSearchValue = (value: string) => {
  search.value = value;
};

const validate = () => {
  if (search.value && address.value && amount.value) {
    return true;
  }

  errors.value = {};

  if (!address.value) {
    setNotification("Please select proper sender", "danger");
  }

  if (!amount.value) {
    errors.value.amount = "Amount is missing";
    setNotification("There was some issue in your form", "danger");
  }

  if (!search.value) {
    errors.value.search = "Receiver is missing";
    setNotification("There was some issue in your form", "danger");
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
