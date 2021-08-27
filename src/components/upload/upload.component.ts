import { defineComponent } from "vue";
import {
  LSP3ProfileJSON,
  LSP3ProfileLink,
  LSP3UniversalProfile,
} from "@lukso/lsp-factory.js";
import { HTMLInputEvent } from "@/interfaces/html-input-event";
import { getAllItems } from "@/helpers/localstorage";
import fileSize from "filesize";

export default defineComponent({
  name: "Upload",
  props: {
    msg: String,
  },
  data: function () {
    return {
      isUploading: false,
      showError: false,
      profileImage: {} as File,
      profileImageUrl: "",
      backgroundImage: {} as File,
      backgroundImageUrl: "",
      name: "",
      description: "",
      links: [] as LSP3ProfileLink[],
      tags: [] as string[],
      uploadTarget: "https://api.ipfs.lukso.network",
      uploadResult: {} as { profile: LSP3ProfileJSON; url: string },
      uploadedProfiles: getAllItems(),
    };
  },
  methods: {
    async upload(event: Event) {
      event.preventDefault();
      this.isUploading = true;

      if (!this.name) {
        this.showError = true;
        this.isUploading = false;
      } else {
        this.uploadResult = await LSP3UniversalProfile.uploadProfileData({
          name: this.name,
          description: this.description,
          links: this.links,
          tags: this.tags,
          profileImage: this.profileImage,
          backgroundImage: this.backgroundImage,
        });

        this.isUploading = false;
        localStorage.setItem(
          this.uploadResult.url,
          JSON.stringify(this.uploadResult.profile)
        );
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

    getFileSize(file: File) {
      if (file.size) {
        return fileSize(file.size);
      }
    },

    removeProfileImage() {
      this.profileImage = {} as any;
      this.profileImageUrl = null as any;
    },

    removeBackgroundImage() {
      this.backgroundImage = {} as any;
      this.backgroundImageUrl = null as any;
    },
  },
});
