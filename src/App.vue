<template>
  <nav class="navbar is-light" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a class="navbar-item" href="https://lukso.network">
        <img src="./assets/lukso.png" height="28" />
      </a>

      <a
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbarBasicExample" class="navbar-menu">
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
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <Suspense>
              <WalletBalance :msg="'sadf'"></WalletBalance>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <router-view />
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>

<script lang="ts">
import WalletBalance from "@/components/wallet/WalletBalance.vue";

export default {
  name: "MainFile",
  components: {
    WalletBalance,
  },
};
</script>
