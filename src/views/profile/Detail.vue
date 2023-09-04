<script setup lang="ts">
import { getSelectedNetworkConfig } from '@/helpers/config'
import { onMounted, ref, watch } from 'vue'
import useErc725 from '@/compositions/useErc725'
import { useRoute, RouteLocationNormalizedLoaded, useRouter } from 'vue-router'
import { createIpfsLink } from '@/utils/createLinks'
import Notifications from '@/components/Notification.vue'
import { LSP3ProfileJSON } from '@lukso/lsp-factory.js'
import useNotifications from '@/compositions/useNotifications'
import useWeb3Connection from '@/compositions/useWeb3Connection'
const route = useRoute()
const { isAddress } = useWeb3Connection()
const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const router = useRouter()

const routeData = ref<RouteLocationNormalizedLoaded>(route)
const dataSource = ref('')
const loading = ref(true)
const profileData = ref<LSP3ProfileJSON>()
const hash = ref(routeData.value.params.address)

const { fetchProfile } = useErc725()

const fetchData = () => {
  clearNotification()
  loading.value = true
  const addressOrHash = routeData.value.params.address as string
  if (isAddress(addressOrHash)) {
    getProfileDataFromERC725Cache(addressOrHash)
  } else {
    getProfileDataFromIPFS(addressOrHash)
  }
}

const getProfileDataFromERC725Cache = async (fetchedAddress: string) => {
  try {
    const result = await fetchProfile(fetchedAddress)
    if (routeData.value.params.address !== fetchedAddress) return
    dataSource.value = 'ERC725-Cache'
    //@ts-ignore
    profileData.value = result
  } catch (err: unknown) {
    setNotification((err as Error).message, 'danger')
    profileData.value = undefined
  } finally {
    loading.value = false
  }
}

const getProfileDataFromIPFS = async (ipfsHash: string) => {
  if (!ipfsHash) {
    return false
  }
  try {
    const result = await fetch(getSelectedNetworkConfig().ipfs.url + ipfsHash)
    dataSource.value = 'IPFS'
    profileData.value = await result.json()
  } catch (err: unknown) {
    setNotification((err as Error).message, 'danger')
    profileData.value = undefined
  } finally {
    loading.value = false
  }
}

const searchAddress = () => {
  if (!hash.value) {
    loading.value = false
    return setNotification('Please enter valid hash or address', 'danger')
  }
  router.push(`/profiles/${hash.value}`)
}

onMounted(async () => {
  // fetch the data when the view is created and the data is
  // already being observed
  fetchData()
})

// call fetchData again the method if the route changes
watch(routeData.value, fetchData)
</script>
<template name="Detail">
  <section class="section">
    <div class="is-child box">
      <div v-if="hasNotification" class="field">
        <Notifications
          :notification="notification"
          class="mt-4"
          @hide="clearNotification"
        ></Notifications>
      </div>
      <div class="field">
        <label for="hash" class="label"
          >Enter IPFS Address or Hash to view Profile</label
        >
        <div :class="`control has-icons-left ${loading ? 'is-loading' : ''}`">
          <input
            v-model="hash"
            class="input"
            type="text"
            data-testid="search-address-hash"
            placeholder="Enter Address/Hash"
          />
          <span class="icon is-small is-left">
            <i class="fas fa-search"></i>
          </span>
        </div>
      </div>
      <div class="field">
        <button
          :class="`button is-primary is-rounded mb-3 ${
            loading ? 'is-loading' : ''
          }`"
          :disabled="loading ? true : undefined"
          @click="searchAddress"
        >
          Search
        </button>
      </div>
    </div>
    <h1 v-if="!loading && profileData" class="title">
      {{ dataSource ? dataSource : '' }}: {{ route.params.address }}
    </h1>
    <div v-if="loading">Loading...</div>
    <table
      v-if="!loading && profileData"
      class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
    >
      <tr>
        <th>Property</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>Name</td>
        <td>{{ profileData?.LSP3Profile?.name }}</td>
      </tr>

      <tr>
        <td>Description</td>
        <td>{{ profileData?.LSP3Profile?.description }}</td>
      </tr>

      <tr>
        <td>Links</td>
        <td>
          <ul class="list">
            <li v-for="(link, i) in profileData?.LSP3Profile?.links" :key="i">
              <a :href="link.url" target="_blank" rel="noopener noreferrer">{{
                link.title ? link.title : link.url
              }}</a>
            </li>
          </ul>
        </td>
      </tr>

      <tr>
        <td>Tags</td>
        <td>
          <span
            v-for="tag in profileData?.LSP3Profile?.tags"
            :key="tag"
            class="tag"
            >{{ tag }}</span
          >
        </td>
      </tr>

      <tr>
        <td>ProfileImage(s)</td>
        <td>
          <div
            v-for="(image, i) in profileData?.LSP3Profile?.profileImage"
            :key="i"
          >
            <pre
              >{{ image }}
                </pre
            >
            <img :src="createIpfsLink(image.url)" :alt="image.url" />
          </div>
        </td>
      </tr>

      <tr>
        <td>BackgroundImage(s)</td>
        <div
          v-for="(image, i) in profileData?.LSP3Profile?.backgroundImage"
          :key="i"
        >
          <pre
            >{{ image }}
                </pre
          >
          <img :src="createIpfsLink(image.url)" :alt="image.url" />
        </div>
      </tr>
    </table>
  </section>
</template>
