import { defineComponent } from "vue";
import { getAndPrepareAllIpfsItems } from "@/helpers/localstorage";
import { DEFAULT_IPFS_URL } from "@/helpers/config";

export default defineComponent({
  name: "ProfileListIpfs",
  emits: {
    createProfileOnChain: null,
  },
  props: {
    loading: Boolean,
  },
  data: function () {
    return {
      uploadedProfiles: getAndPrepareAllIpfsItems(),
      uploadTarget: DEFAULT_IPFS_URL,
    };
  },
  methods: {
    createProfileOnChain(profile: any) {
      this.$emit("createProfileOnChain", profile);
    },
  },
});
