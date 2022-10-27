<script setup lang="ts">
import Connect from '@/components/Connect.vue'
import { ref } from 'vue'
import useDropdown from '@/compositions/useDropdown'

const burger = ref()
const menu = ref()
const { toggle } = useDropdown()
</script>

<template>
  <nav
    class="navbar is-white is-fixed-top"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-brand">
      <a class="navbar-item" href="https://lukso.network">
        <img src="/lukso.png" height="28" />
      </a>

      <a
        ref="burger"
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbar"
        @click="
          () => {
            toggle(burger)
            toggle(menu)
          }
        "
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div id="navbar" ref="menu" class="navbar-menu">
      <div class="navbar-start">
        <router-link class="navbar-item" to="/">RPC</router-link>

        <div class="navbar-item has-dropdown is-hoverable">
          <router-link class="navbar-item" to="/profiles">Profiles</router-link>

          <div class="navbar-dropdown">
            <router-link class="navbar-item" to="/profiles/upload"
              >Upload</router-link
            >
            <router-link
              class="navbar-item"
              to="/profiles/QmaufE68Q6cdnFJk6VQvvkXgqP3x8Hfp8bhqrjijeRHrnh"
              >Inspect
            </router-link>
            <router-link class="navbar-item" to="/profiles/deploy"
              >Deploy</router-link
            >
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <a
              class="button is-light"
              target="_blank"
              rel="noreferer"
              href="https://docs.lukso.tech/"
            >
              <strong>LUKSO DOCS</strong>
            </a>
            <a
              class="button is-light"
              target="_blank"
              rel="noreferer"
              href="https://github.com/lukso-network/universalprofile-test-dapp"
            >
              <strong>GitHub</strong>
            </a>
            <Suspense>
              <Connect />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped lang="scss">
nav {
  box-shadow: 0 0.5em 1em -0.125em rgb(10 10 10 / 10%),
    0 0 0 1px rgb(10 10 10 / 2%);

  a {
    font-weight: bold;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
