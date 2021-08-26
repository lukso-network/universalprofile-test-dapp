<template>
  <div>
    <div class="md:grid md:grid-cols-3 md:gap-6">
      <div class="mt-5 md:mt-0 md:col-span-2">
        <form action="#" method="POST">
          <div class="shadow sm:rounded-md sm:overflow-hidden">
            <div class="px-4 py-5 bg-white space-y-6 sm:p-6">
              <div class="lg:flex lg:items-center lg:justify-between">
                <div class="flex-1 min-w-0">
                  <h2
                    class="
                      text-2xl
                      font-bold
                      leading-7
                      text-gray-900
                      sm:text-3xl sm:truncate
                    "
                  >
                    Upload Profile
                  </h2>
                  <div
                    class="
                      mt-1
                      flex flex-col
                      sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6
                    "
                  ></div>
                </div>
                <div class="mt-5 flex lg:mt-0 lg:ml-4">
                  <span class="hidden sm:block">
                    <label
                      for="upload-target"
                      class="block text-sm font-medium text-gray-700"
                      >Upload Target</label
                    >
                    <select
                      v-model="uploadTarget"
                      id="upload-target"
                      name="upload-target"
                      autocomplete="upload-target"
                      class="
                        mt-1
                        block
                        w-full
                        py-2
                        px-3
                        border border-gray-300
                        bg-white
                        rounded-md
                        shadow-sm
                        focus:outline-none
                        focus:ring-indigo-500
                        focus:border-indigo-500
                        sm:text-sm
                      "
                    >
                      <option>https://api.ipfs.lukso.network</option>
                      <option disabled>
                        https://filestore.lukso.network (Coming soon)
                      </option>
                    </select>
                  </span>
                </div>
              </div>
              <div v-if="showError">
                <div
                  class="
                    text-white
                    px-6
                    py-4
                    border-0
                    rounded
                    relative
                    mb-4
                    bg-red-500
                  "
                >
                  <span class="inline-block align-middle mr-8">
                    <b class="capitalize">Error!</b> Please double-check your
                    input
                  </span>
                </div>
              </div>

              <div class="col-span-2 sm:col-span-3"></div>
              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Profile Image
                </label>
                <div
                  class="
                    mt-1
                    flex
                    justify-center
                    px-6
                    pt-5
                    pb-6
                    border-2 border-gray-300 border-dashed
                    rounded-md
                  "
                >
                  <div class="space-y-1 text-center" v-if="!profileImageUrl">
                    <svg
                      class="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <div class="flex text-sm text-gray-600">
                      <label
                        for="file-upload"
                        class="
                          relative
                          cursor-pointer
                          bg-white
                          rounded-md
                          font-medium
                          text-indigo-600
                          hover:text-indigo-500
                          focus-within:outline-none
                          focus-within:ring-2
                          focus-within:ring-offset-2
                          focus-within:ring-indigo-500
                        "
                      >
                        <span>Upload an Image</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          class="sr-only"
                          @change="handleProfileImage"
                        />
                      </label>
                      <p class="pl-1">or drag and drop</p>
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                  </div>
                  <div v-if="profileImageUrl">
                    <img
                      class="image image--profile"
                      v-bind:src="profileImageUrl"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">
                  Background Image
                </label>
                <div
                  class="
                    mt-1
                    flex
                    justify-center
                    px-6
                    pt-5
                    pb-6
                    border-2 border-gray-300 border-dashed
                    rounded-md
                  "
                >
                  <div class="space-y-1 text-center" v-if="!backgroundImageUrl">
                    <svg
                      class="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                    <div class="flex text-sm text-gray-600">
                      <label
                        for="file-upload"
                        class="
                          relative
                          cursor-pointer
                          bg-white
                          rounded-md
                          font-medium
                          text-indigo-600
                          hover:text-indigo-500
                          focus-within:outline-none
                          focus-within:ring-2
                          focus-within:ring-offset-2
                          focus-within:ring-indigo-500
                        "
                      >
                        <span>Upload an Image</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          class="sr-only"
                          @change="handleBackgroundImage"
                        />
                      </label>
                      <p class="pl-1">or drag and drop</p>
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                  </div>
                  <div v-if="backgroundImageUrl">
                    <img
                      class="image image--background"
                      v-bind:src="backgroundImageUrl"
                    />
                  </div>
                </div>
              </div>

              <div class="col-span-6 sm:col-span-3">
                <label
                  for="first-name"
                  class="block text-sm font-medium text-gray-700"
                  >Name</label
                >
                <input
                  type="text"
                  name="name"
                  id="name"
                  v-model="name"
                  autocomplete="name"
                  class="
                    mt-1
                    p-2
                    focus:ring-indigo-500 focus:border-indigo-500
                    block
                    w-full
                    shadow-sm
                    sm:text-sm
                    border-gray-300
                    rounded-md
                  "
                />
                <p class="mt-2 text-sm text-gray-500">
                  Must be lowercase, can not contain x and y
                </p>
              </div>

              <div>
                <label
                  for="about"
                  class="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <div class="mt-1">
                  <textarea
                    v-model="description"
                    id="description"
                    name="description"
                    rows="3"
                    class="
                      shadow-sm
                      focus:ring-indigo-500 focus:border-indigo-500
                      mt-1
                      p-3
                      block
                      w-full
                      sm:text-sm
                      border border-gray-300
                      rounded-md
                    "
                    placeholder="Once upon a time..."
                  />
                </div>
                <p class="mt-2 text-sm text-gray-500">
                  Brief description for your profile.
                </p>
              </div>
            </div>
            <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                @click="upload"
                type="submit"
                class="
                  inline-flex
                  justify-center
                  py-2
                  px-4
                  border border-transparent
                  shadow-sm
                  text-sm
                  font-medium
                  rounded-md
                  text-white
                  bg-indigo-600
                  hover:bg-indigo-700
                  focus:outline-none
                  focus:ring-2
                  focus:ring-offset-2
                  focus:ring-indigo-500
                "
              >
                Upload Profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { LSP3UniversalProfile } from "@lukso/lsp-factory.js";

export default defineComponent({
  name: "Upload",
  props: {
    msg: String,
  },
  data: function () {
    return {
      showError: false,
      profileImage: null,
      profileImageUrl: "",
      backgroundImage: null,
      backgroundImageUrl: "",
      name: "",
      description: "",
      links: [],
      tags: [],
      uploadTarget: "https://api.ipfs.lukso.network",
    };
  },
  methods: {
    async upload(event: any) {
      event.preventDefault();

      const file = document.querySelector("input") as HTMLInputElement;
      if (
        this.profileImage &&
        this.backgroundImage &&
        this.name &&
        this.description
      ) {
        const a = await LSP3UniversalProfile.uploadProfileData({
          profileImage: this.profileImage as unknown as File,
          backgroundImage: this.backgroundImage as unknown as File,
          name: this.name,
          description: this.description,
          links: [],
          tags: [],
        });

        console.log(a);
      } else {
        this.showError = true;
      }
    },
    handleProfileImage(event: any) {
      this.profileImage = event.target.files[0];
      this.profileImageUrl = URL.createObjectURL(this.profileImage);
    },
    handleBackgroundImage(event: any) {
      this.backgroundImage = event.target.files[0];
      this.backgroundImageUrl = URL.createObjectURL(this.backgroundImage);
    },
  },
});
</script>

<style scoped lang="scss">
.image-placeholder {
  position: relative;
  overflow: hidden;
  width: 250px;
  height: 300px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  margin: 15px auto;
  input {
    opacity: 0;
    position: absolute;
    z-index: 2;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
}

.image-file {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.image-file + label {
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  display: inline-block;
  overflow: hidden;
  padding: 0.625rem 1.25rem;
  width: 250px;
}

.no-js .image-file + label {
  display: none;
}

.image-file:focus + label,
.image-file.has-focus + label {
  outline: 1px dotted #000;
  outline: -webkit-focus-ring-color auto 5px;
}

// .image-file + label * {
//   /* pointer-events: none; */
//   /* in case of FastClick lib use */
// }

.image-file + label svg {
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: currentColor;
  margin-top: -0.25em;
  margin-right: 0.25em;
}

.image-file + label {
  margin-bottom: 50px;
  background: white;
}

.input-fields {
  label {
    display: block;
  }
}

section.images {
  display: flex;

  > div {
    margin-right: 10px;
  }
}

.image {
  max-height: 200px;
}
</style>
