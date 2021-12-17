<template name="Navbar">
  <nav
    class="navbar is-white is-fixed-top"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-brand">
      <a class="navbar-item" href="https://lukso.network">
        <img src="@/assets/lukso.png" height="28" />
      </a>

      <a
        role="button"
        :class="`navbar-burger ${isActive ? 'is-active' : ''}`"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbar"
        @click="menuToggle"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbar" :class="`navbar-menu ${isActive ? 'is-active' : ''}`">
      <div class="navbar-start">
        <router-link class="navbar-item" to="/">Home</router-link>

        <div class="navbar-item has-dropdown is-hoverable">
          <router-link class="navbar-item" to="/profiles">Profiles</router-link>

          <div class="navbar-dropdown">
            <router-link class="navbar-item" to="/profiles/upload"
              >Upload</router-link
            >
            <router-link
              class="navbar-item"
              to="/profiles/QmaufE68Q6cdnFJk6VQvvkXgqP3x8Hfp8bhqrjijeRHrnh"
              >Inspect</router-link
            >
            <router-link class="navbar-item" to="/profiles/deploy"
              >Deploy</router-link
            >
            <router-link class="navbar-item" to="/profiles/send-lyx"
              >Send LYX</router-link
            >
          </div>
        </div>

        <!-- <router-link class="navbar-item" to="/deployment"
          >Deployment</router-link
        > -->
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <Suspense>
              <!-- <WalletBalance :msg="'sadf'"></WalletBalance> -->
              <Connect />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import WalletBalance from "@/components/wallet/WalletBalance.vue";
import Connect from "@/components/wallet/Connect.vue";
import { ref } from "vue";

const isActive = ref(false);

const menuToggle = () => {
  isActive.value = !isActive.value;
};
</script>

<style scoped lang="scss">
nav {
  box-shadow: 0 0.5em 1em -0.125em rgb(10 10 10 / 10%),
    0 0px 0 1px rgb(10 10 10 / 2%);

  a {
    font-weight: bold;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
