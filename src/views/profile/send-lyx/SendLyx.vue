<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Notifications from "@/components/shared/Notification.vue";
import Profile from "@/components/shared/Profile.vue";
import NoExtension from "@/views/profile/send-lyx/NoExtension.vue";
import Search from "@/views/profile/send-lyx/Search.vue";
import { DEFAULT_IPFS_URL } from "@/helpers/config";
import useErc725 from "@/compositions/useErc725";
import { Errors } from "@/types";
import useNotifications from "@/compositions/useNotifications";
import useWeb3 from "@/compositions/useWeb3";
import { getState } from "@/stores";
import { LSP3Profile } from "@lukso/lsp-factory.js-alpha";
import { DEFAULT_GAS, DEFAULT_GAS_PRICE } from "@/helpers/config";

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications();
const { sendTransaction, getBalance } = useWeb3();
const { fetchProfile } = useErc725();

const hasExtension = !!window.ethereum;
const sender = ref<LSP3Profile>();
const balance = ref("");
const amount = ref("");
const search = ref("");
const errors = ref({} as Errors);
const pendingTransaction = ref(false);

onMounted(async () => {
  if (hasExtension) {
    if (getState("address")) {
      sender.value = (await fetchProfile(getState("address")))?.LSP3Profile;
      balance.value = await getBalance(getState("address"));
      console.log(sender.value);
    }

    watch(
      () => getState("address"),
      async () => {
        sender.value = (await fetchProfile(getState("address")))?.LSP3Profile;
        balance.value = await getBalance(getState("address"));
      }
    );
  }
});

const sendLyx = async () => {
  clearNotification();

  if (!validate()) {
    return;
  }

  try {
    pendingTransaction.value = true;
    const transaction = {
      from: getState("address"),
      to: search.value,
      value: amount.value.toString(),
      gas: DEFAULT_GAS,
      gasPrice: DEFAULT_GAS_PRICE,
    };
    await sendTransaction(transaction);
    setNotification(`You successfully send ${amount.value} LYX`);
    amount.value = "";
  } catch (error) {
    if ((error as Error)?.message) {
      setNotification(`Error: ${(error as Error)?.message}`, "danger");
    } else {
      console.error(error);
    }
  } finally {
    pendingTransaction.value = false;
    balance.value = await getBalance(getState("address"));
  }
};

const setSearchError = (error: string) => {
  errors.value.search = error;
};

const setSearchValue = (value: string) => {
  search.value = value;
};

const validate = () => {
  if (search.value && getState("address") && amount.value) {
    return true;
  }

  errors.value = {};

  if (!getState("address")) {
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
  const backgroundImage = sender.value?.backgroundImage;

  if (backgroundImage && backgroundImage.length > 1) {
    const backgroundUrl = backgroundImage[2]?.url as string;
    return backgroundUrl.replace("ipfs://", DEFAULT_IPFS_URL);
  } else {
    return "";
  }
});
</script>

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
          <NoExtension v-if="!hasExtension" />
          <div
            v-else-if="!getState('isConnected')"
            class="card-content is-flex is-align-items-center"
            data-testid="provider-message"
          >
            <span class="icon mr-5">
              <i class="fas fa-plug fa-lg has-text-grey-light"></i>
            </span>
            Please use button in top right corner to connect with web3 provider.
          </div>
          <div v-else>
            <div
              class="has-background-primary profile-background pl-5 mb-6"
              :style="{ backgroundImage: `url(${backgroundImageSrc})` }"
            >
              <Profile
                :profile="sender"
                :address="getState('address')"
                class="sender"
              ></Profile>
            </div>
            <div class="card-content pt-1">
              <hr />
              <p class="mb-4">You are about to send</p>
              <div class="field-body">
                <div class="field has-addons">
                  <p class="control">
                    <input
                      v-model="amount"
                      class="input is-large"
                      :class="{ 'is-danger': errors.amount }"
                      type="number"
                      placeholder="0"
                      data-testid="amount"
                      @keyup="delete errors.amount"
                    />
                    <span
                      v-if="errors.amount"
                      class="has-text-danger"
                      data-testid="amount-error"
                      >{{ errors.amount }}</span
                    >
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
                    data-testid="send"
                    @click="sendLyx"
                  >
                    Send LYX
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

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
