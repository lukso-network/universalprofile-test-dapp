import { defineComponent } from "vue";
import { LSP3ProfileLink, LSP3UniversalProfile } from "@lukso/lsp-factory.js";
import { HTMLInputEvent } from "@/interfaces/html-input-event";
import { getAllItems } from "@/helpers/localstorage";

export default defineComponent({
  name: "Upload",
  props: {
    msg: String,
  },
  data: function () {
    return {
      isUploading: false,
      showError: false,
      profileImage: {},
      profileImageUrl: "",
      backgroundImage: {},
      backgroundImageUrl: "",
      name: "",
      description: "",
      links: [] as LSP3ProfileLink[],
      tags: [] as string[],
      uploadTarget: "https://api.ipfs.lukso.network",
      uploadResult: {},
      uploadedProfiles: getAllItems(),
    };
  },
  methods: {
    async upload(event: Event) {
      event.preventDefault();
      this.isUploading = true;

      if (
        this.profileImage &&
        this.backgroundImage &&
        this.name &&
        this.description
      ) {
        const { url, profile } = await LSP3UniversalProfile.uploadProfileData({
          profileImage: this.profileImage as unknown as File,
          backgroundImage: this.backgroundImage as unknown as File,
          name: this.name,
          description: this.description,
          links: this.links,
          tags: this.tags,
        });

        this.uploadResult = {
          profile,
          url,
        };

        this.isUploading = false;
        localStorage.setItem(url, JSON.stringify(profile));
      } else {
        this.showError = true;
      }
    },

    handleProfileImage(event: HTMLInputEvent) {
      const target = event.target as HTMLInputElement;
      this.profileImage = (target.files as FileList)[0];
      this.profileImageUrl = URL.createObjectURL(this.profileImage);
    },

    handleBackgroundImage(event: Event) {
      const target = event.target as HTMLInputElement;
      this.backgroundImage = (target.files as FileList)[0];
      this.backgroundImageUrl = URL.createObjectURL(this.backgroundImage);
    },

    addNewLink() {
      this.links.push({
        title: "",
        url: "",
      });
    },

    removeLink(index: number) {
      this.links.splice(index, 1);
    },

    addNewTag() {
      this.tags.push("");
    },

    removeTag(index: number) {
      this.tags.splice(index, 1);
    },
  },
});
