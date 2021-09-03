import { defineComponent } from "vue";
import { request } from "graphql-request";
import { isAddress } from "ethers/lib/utils";
import { DEFAULT_IPFS_URL } from "@/helpers/config";
import { getLSP3ProfileQuery } from "@/helpers/graphql";
import { LSP3Account__factory, LSP3Account } from "@lukso/lspfactory.js";
import { getSigner } from "@/services/provider.service";
export default defineComponent({
  name: "ProfileDetail",
  props: {
    address: String,
  },
  data() {
    return {
      account: {} as LSP3Account,
      dataSource: "",
      loading: false,
      profileData: null,
      error: null,
      uploadTarget: DEFAULT_IPFS_URL,
    };
  },
  async created() {
    // fetch the data when the view is created and the data is
    // already being observed
    const result = await getSigner();
    this.account = new LSP3Account__factory(result.signer).attach(
      this.$route.params.address as string
    );
    console.log(await this.account.owner());
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
        // const a = this.account.attach(addressOrHash);
        // console.log(a);
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
