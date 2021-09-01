import { defineComponent } from "vue";
import { request } from "graphql-request";
import { isAddress } from "ethers/lib/utils";
import { DEFAULT_IPFS_URL } from "@/helpers/config";
import { getLSP3ProfileQuery } from "@/helpers/graphql";

export default defineComponent({
  name: "ProfileDetail",
  props: {
    address: String,
  },
  data() {
    return {
      dataSource: "",
      loading: false,
      profileData: null,
      error: null,
      uploadTarget: DEFAULT_IPFS_URL,
    };
  },
  created() {
    // fetch the data when the view is created and the data is
    // already being observed
    this.fetchData();
  },
  watch: {
    // call again the method if the route changes
    $route: "fetchData",
  },
  methods: {
    fetchData() {
      this.error = this.profileData = null;
      this.loading = true;

      const addressOrHash = this.$route.params.address as string;

      if (isAddress(addressOrHash)) {
        this.getProfileDataFromERC725Cache(addressOrHash);
      } else {
        this.getProfileDataFromIPFS(addressOrHash);
      }
    },

    getProfileDataFromERC725Cache(fetchedAddress: string) {
      request(
        "https://erc725cache.l14.lukso.network/graphql",
        getLSP3ProfileQuery(this.$route.params.address as string)
      )
        .then((result) => {
          console.log(result);
          if (this.$route.params.address !== fetchedAddress) return;
          this.dataSource = "ERC725-Cache";
          this.profileData = result.LSP3UniversalProfiles[0];
          this.loading = false;
        })
        .catch((err) => {
          this.error = err.toString();
        });
    },

    getProfileDataFromIPFS(ipfsHash: string) {
      fetch("https://ipfs.lukso.network/ipfs/" + ipfsHash)
        .then(async (result) => {
          this.dataSource = "IPFS";
          this.profileData = await result.json();
          this.loading = false;
        })
        .catch((err) => {
          this.error = err.toString();
        });
    },
  },
});
