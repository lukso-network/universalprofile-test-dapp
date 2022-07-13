<script setup lang="ts">
import { DEFAULT_NETWORK_CONFIG } from "@/helpers/config";
import { onMounted, ref, watch } from "vue";
import { isAddress } from "ethers/lib/utils";
import useErc725 from "@/compositions/useErc725";
import { useRoute, RouteLocationNormalizedLoaded } from "vue-router";

const route = useRoute();

const routeData = ref<RouteLocationNormalizedLoaded>(route);
const dataSource = ref("");
const loading = ref(true);
const profileData = ref(null as any);
const error = ref(null);

const { fetchProfile } = useErc725();

const fetchData = () => {
  error.value = profileData.value = null;
  loading.value = true;

  const addressOrHash = route.params.address as string;

  if (isAddress(addressOrHash)) {
    getProfileDataFromERC725Cache(addressOrHash);
  } else {
    getProfileDataFromIPFS(addressOrHash);
  }
};

const getProfileDataFromERC725Cache = (fetchedAddress: string) => {
  fetchProfile(fetchedAddress)
    .then((result) => {
      if (route.params.address !== fetchedAddress) return;
      dataSource.value = "ERC725-Cache";
      // @ts-ignore
      profileData.value = result.LSP3UniversalProfiles[0];
      loading.value = false;
    })
    .catch((err) => {
      error.value = err.toString();
    });
};

const getProfileDataFromIPFS = (ipfsHash: string) => {
  if (!ipfsHash) {
    return false;
  }

  fetch("https://2eff.lukso.dev/ipfs/" + ipfsHash)
    .then(async (result) => {
      dataSource.value = "IPFS";
      profileData.value = await result.json();
      loading.value = false;
    })
    .catch((err) => {
      error.value = err.toString();
    });
};

onMounted(async () => {
  // fetch the data when the view is created and the data is
  // already being observed
  fetchData();
});

// call fetchData again the method if the route changes
watch(routeData, fetchData);
</script>
<template name="ProfileDetail">
  <section class="section">
    <h1 v-if="!loading" class="title">
      {{ dataSource ? dataSource : "" }}: {{ route.params.address }}
    </h1>

    <div v-if="loading">Loading...</div>
    <table
      v-if="!loading"
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
        <td>{{ profileData?.LSP3Profile?.value }}</td>
      </tr>

      <tr>
        <td>Links</td>
        <td>
          <ul class="list">
            <li v-for="link in profileData?.LSP3Profile?.links" :key="link">
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
            v-for="image in profileData?.LSP3Profile?.profileImage"
            :key="image"
          >
            <pre
              >{{ image }}
                </pre
            >
            <img
              :src="
                image.url.replace('ipfs://', DEFAULT_NETWORK_CONFIG.ipfs.url)
              "
              :alt="image.url"
            />
          </div>
        </td>
      </tr>

      <tr>
        <td>BackgroundImage(s)</td>
        <div
          v-for="image in profileData?.LSP3Profile?.backgroundImage"
          :key="image"
        >
          <pre
            >{{ image }}
                </pre
          >
          <img
            :src="image.url.replace('ipfs://', DEFAULT_NETWORK_CONFIG.ipfs.url)"
            :alt="image.url"
          />
        </div>
      </tr>
    </table>
  </section>
</template>
