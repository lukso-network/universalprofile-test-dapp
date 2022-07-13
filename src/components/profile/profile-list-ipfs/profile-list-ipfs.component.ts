import { defineComponent } from "vue";
import { getAndPrepareAllIpfsItems } from "@/helpers/localstorage";
import { DEFAULT_NETWORK_CONFIG } from "@/helpers/config";

export default defineComponent({
  name: "ProfileListIpfs",
  props: {
    loading: Boolean,
  },
  emits: {
    createProfileOnChain: null,
  },
  data: function () {
    return {
      uploadedProfiles: getAndPrepareAllIpfsItems(),
      uploadTarget: DEFAULT_NETWORK_CONFIG.ipfs.url,
    };
  },
  methods: {
    createProfileOnChain(profile: any) {
      this.$emit("createProfileOnChain", profile);
    },
  },
});
