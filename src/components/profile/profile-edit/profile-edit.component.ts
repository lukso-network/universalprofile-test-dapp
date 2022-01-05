import { formatNumber } from "@/helpers/ethers";
import { defineComponent } from "vue";
import ProfileListIpfs from "@/components/profile/profile-list-ipfs/ProfileListIpfs.vue";
import { getSigner } from "@/services/provider.service";
import { LSP3Account__factory } from "@lukso/lsp-factory.js";

export default defineComponent({
  components: {
    ProfileListIpfs,
  },
  data() {
    return {
      account: {},
      profile: {},
    };
  },
  async created() {
    const { signer } = await getSigner();
    if (this.$route.params.address) {
      this.account = new LSP3Account__factory(signer).attach(
        this.$route.params.address as string
      );
    }
    this.fetchData();
  },
  methods: {
    formatNumber,
    async fetchData() {
      this.profile = {
        name: "reto",
        description: "sdf",
        tags: ["tag1", "tag2"],
        links: [
          {
            title: "Whoooo",
            url: "http://google.ch",
          },
        ],
      };
      return "data";
    },
  },
});
