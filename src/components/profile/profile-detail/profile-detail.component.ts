import { defineComponent } from "vue";
import { request } from "graphql-request";
import { DEFAULT_IPFS_URL } from "@/helpers/config";
import { getLSP3ProfileQuery } from "@/helpers/graphql";

export default defineComponent({
  name: "ProfileDetail",
  props: {
    address: String,
  },
  data() {
    return {
      loading: false,
      post: null,
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
      this.error = this.post = null;
      this.loading = true;
      const fetchedAddress = this.$route.params.address;

      request(
        "https://erc725cache.l14.lukso.network/graphql",
        getLSP3ProfileQuery(this.$route.params.address as string)
      )
        .then((result) => {
          console.log(result);
          if (this.$route.params.address !== fetchedAddress) return;
          this.loading = false;
          this.post = result.LSP3UniversalProfiles[0];
        })
        .catch((err) => {
          this.error = err.toString();
        });
    },
  },
});
