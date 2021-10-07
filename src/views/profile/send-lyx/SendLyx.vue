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
          <div class="card-content">
            <p class="mb-4">From profile</p>
            <div class="media">
              <div class="media-left">
                <figure class="image is-48x48">
                  <img
                    src="https://ipfs.lukso.network/ipfs/QmZGfGXh9YNk2ghkNuRNfUtFSvPuKHu2TSdMw8cbPRoZcF"
                    alt="Placeholder image"
                  />
                </figure>
              </div>
              <div class="media-content">
                <p class="title is-5">John Smith</p>
                <p class="subtitle is-7 has-text-grey-light">
                  0x4966Eaf580137D614Dc17b509f2947d75bF5b9Bc
                </p>
              </div>
            </div>
            <hr />
            <p class="mb-4">You are about to send</p>
            <div class="field-body">
              <div class="field has-addons">
                <p class="control">
                  <input class="input is-large" type="text" placeholder="0" />
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
                <div>5 LYX</div>
              </div>
            </div>
            <hr />
            <p class="mb-4">To profile</p>
            <div class="field">
              <div class="control is-small">
                <input
                  class="input is-small"
                  type="text"
                  placeholder="Search: Universal Profile Address..."
                />
              </div>
            </div>
            <div class="media">
              <div class="media-left">
                <figure class="image is-48x48">
                  <img
                    src="https://ipfs.lukso.network/ipfs/QmTTBqAcwkqrzbiMAHmFb25BqTtj94THvzUeoSApnEG65H"
                    alt="Placeholder image"
                  />
                </figure>
              </div>
              <div class="media-content">
                <p class="title is-5">Ann Smith</p>
                <p class="subtitle is-7 has-text-grey-light">
                  0x4966Eaf580137D614Dc17b509f2947d75bF5b9Bc
                </p>
              </div>
            </div>
            <div class="field is-grouped is-grouped-centered pt-4">
              <p class="control">
                <button class="button is-primary" @click="sendLyx">
                  Send LYX
                </button>
              </p>
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

export default defineComponent({
  name: "ProfileSendLyx",
  components: {
    UiNotification,
  },
  props: {},
  data() {
    return {
      notification: {},
    };
  },

  methods: {
    sendLyx() {
      this.notification = {
        message: "You successfully send 2 LYX",
        type: "primary",
      };
    },

    clearNotification() {
      this.notification = {};
    },
  },
});
</script>

<style lang="scss">
.nowrap {
  white-space: nowrap;
}
</style>
