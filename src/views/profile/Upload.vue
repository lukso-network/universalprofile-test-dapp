<script setup lang="ts">
import { ref, computed } from 'vue'
import { getAndPrepareAllIpfsItems } from '@/helpers/localstorage'
import { filesize } from 'filesize'
import { getSelectedNetworkConfig } from '@/helpers/config'
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import { useLspFactory } from '@/compositions/useLspFactory'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()

type ProfileLinks = {
  title: string
  url: string
}

const isUploading = ref(false)
const showError = ref(false)
const profileImage = ref<File>()
const profileImageUrl = ref('')
const backgroundImage = ref<File>()
const backgroundImageUrl = ref('')
const name = ref('')
const description = ref('')
const links = ref<ProfileLinks[]>([])
const tags = ref<string[]>([])
const uploadTarget = ref(getSelectedNetworkConfig().ipfs.url)
const uploadResult = ref()
const uploadedProfiles = ref(getAndPrepareAllIpfsItems())

const { uploadUniversalProfileMetaData } = useLspFactory()

const upload = async () => {
  clearNotification()
  isUploading.value = true

  try {
    uploadResult.value = await uploadUniversalProfileMetaData({
      profileImage: profileImage.value,
      backgroundImage: backgroundImage.value,
      name: name.value,
      description: description.value,
      links: links.value,
      tags: tags.value,
    })

    isUploading.value = false
    name.value = ''
    description.value = ''
    localStorage.setItem(
      uploadResult.value?.url,
      JSON.stringify(uploadResult.value)
    )
    uploadedProfiles.value = getAndPrepareAllIpfsItems()

    const href = uploadResult.value?.url.replace('ipfs://', '')
    const url = `${uploadResult.value?.url}`
    setNotification(
      `Profile uploaded successfully<br/><a href=${
        '/profiles/' + href
      } target="_blank">${url}</a>`,
      'primary'
    )
  } catch (error) {
    showError.value = true
    isUploading.value = false
    setNotification('Profile upload failed', 'danger')
  }
}

const deleteUploadedProfile = (url: string) => {
  if (window.confirm('Are you sure you want to delete this profile?')) {
    const formattedUrl = url.replace(uploadTarget.value, 'ipfs://')
    localStorage.removeItem(formattedUrl)
    uploadedProfiles.value = getAndPrepareAllIpfsItems()
    setNotification('Profile removed successfully', 'primary')
  }
}

const handleProfileImage = (event: Event) => {
  const target = event.target as HTMLInputElement
  profileImage.value = (target.files as FileList)[0]
  profileImageUrl.value = URL.createObjectURL(profileImage.value)
}

const handleBackgroundImage = (event: Event) => {
  const target = event.target as HTMLInputElement
  backgroundImage.value = (target.files as FileList)[0]
  backgroundImageUrl.value = URL.createObjectURL(backgroundImage.value)
}

const addNewLink = () => {
  links.value.push({
    title: '',
    url: '',
  })
}

const addNewTag = () => {
  tags.value.push('')
}

const removeLink = (index: number) => {
  links.value.splice(index, 1)
}

const removeTag = (index: number) => {
  tags.value.splice(index, 1)
}

const getFileSize = (file: File) => {
  if (file.size) {
    return filesize(file.size)
  }
}

const profileImageSize = computed(() => {
  if (profileImage.value) {
    return getFileSize(profileImage.value)
  } else {
    return ''
  }
})

const backgroundImageSize = computed(() => {
  if (backgroundImage.value) {
    return getFileSize(backgroundImage.value)
  } else {
    return ''
  }
})

const removeProfileImage = () => {
  profileImage.value = {} as File
  profileImageUrl.value = ''
}

const removeBackgroundImage = () => {
  backgroundImage.value = {} as File
  backgroundImageUrl.value = ''
}
</script>

<template>
  <div class="section">
    <h1 class="title">Profile Upload</h1>
    <article class="message is-info card has-background-white">
      <div class="message-header">
        <p>Info</p>
      </div>
      <div class="message-body">
        <div class="content">
          <p>
            This page allows you to generate and upload your
            <strong>LSP3Profile</strong> data including the profile- and
            background-image, as per
            <a
              href="https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-3-UniversalProfile.md"
            >
              LSP-3-UniversalProfile
            </a>
            standard.
          </p>
          <p>
            Each image will be compressed and resized into five variants with a
            <code>max-width</code> of <code>1800px</code>, <code>1024px</code>,
            <code>640px</code>, <code>320px</code> and <code>180px</code>.
          </p>
          <p class="has-text-weight-bold">
            This will not perform any operation on the blockchain.
          </p>
        </div>
      </div>
    </article>
    <Notifications
      v-if="hasNotification"
      :notification="notification"
      class="mt-4"
      @hide="clearNotification"
    ></Notifications>

    <article v-if="showError" class="message is-danger">
      <div class="message-header">
        <p>Error</p>
        <button class="delete" aria-label="delete"></button>
      </div>
      <div class="message-body">
        The property
        <strong>name</strong> is mandatory.
      </div>
    </article>

    <div class="columns">
      <div class="column">
        <section class="upload-form card">
          <div class="file is-boxed has-name mb-5">
            <label v-if="!profileImageUrl" class="file-label">
              <input
                class="file-input"
                type="file"
                name="profileImage"
                @change="handleProfileImage"
              />
              <span class="file-cta">
                <span class="file-label"> Browse... </span>
              </span>

              <span class="file-name"> Profile Image </span>
            </label>
            <div v-if="profileImageUrl" class="columns">
              <div class="column">
                <p class="has-text-weight-bold">Profile Image</p>

                <img
                  :src="profileImageUrl"
                  :alt="profileImage?.name"
                  class="image-profile"
                />
              </div>
              <div class="column">
                <p>{{ profileImageSize }}</p>
                <button class="button is-danger" @click="removeProfileImage">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div class="file is-boxed has-name mb-5">
            <label v-if="!backgroundImageUrl" class="file-label">
              <input
                class="file-input"
                type="file"
                name="backgroundImage"
                @change="handleBackgroundImage"
              />
              <span class="file-cta">
                <span class="file-label"> Browse... </span>
              </span>

              <span class="file-name"> Background Image </span>
            </label>
            <div v-if="backgroundImageUrl" class="columns">
              <div class="column">
                <p class="has-text-weight-bold">Background Image</p>

                <img
                  :src="backgroundImageUrl"
                  :alt="backgroundImage?.name"
                  class="image-profile"
                />
              </div>
              <div class="column">
                <p>{{ backgroundImageSize }}</p>
                <button class="button is-danger" @click="removeBackgroundImage">
                  Delete
                </button>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label" for="name">Name</label>
            <div class="control">
              <input
                id="name"
                v-model="name"
                class="input"
                type="text"
                placeholder="Knock knock who's there?"
                data-testid="name"
              />
            </div>
          </div>

          <div class="field">
            <label class="label" for="description">Description</label>
            <div class="control">
              <textarea
                id="description"
                v-model="description"
                class="textarea"
                placeholder="Once upon a time..."
                data-testid="description"
              ></textarea>
            </div>
          </div>

          <div class="field">
            <label class="label">Links</label>
            <div v-for="(link, index) in links" :key="index">
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input
                      v-model="links[index].title"
                      class="input"
                      type="text"
                      placeholder="Title"
                    />
                  </p>
                </div>
                <div class="field has-addons">
                  <p class="control">
                    <a class="button is-static"> https:// </a>
                  </p>
                  <p class="control">
                    <input
                      v-model="link.url"
                      class="input"
                      type="text"
                      placeholder="example.com"
                    />
                  </p>
                </div>
                <div class="block">
                  <button class="button is-danger" @click="removeLink(index)">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <button class="button is-primary is-rounded" @click="addNewLink">
              Add Link
            </button>
          </div>

          <div class="field">
            <label class="label">Tags</label>
            <div v-for="(tag, index) in tags" :key="index">
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input
                      v-model="tags[index]"
                      class="input"
                      type="text"
                      placeholder="Tagname"
                    />
                  </p>
                </div>
                <div class="block">
                  <button
                    class="button is-danger is-rounded"
                    @click="removeTag(index)"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <button class="button is-primary is-rounded" @click="addNewTag">
              Add Tag
            </button>
          </div>
          <div class="field is-grouped is-grouped-right">
            <p class="control">
              <button
                class="button is-primary is-rounded"
                type="submit"
                :class="{ 'is-loading': isUploading }"
                :disabled="isUploading"
                data-testid="upload-button"
                @click.stop="upload"
              >
                Upload Profile
              </button>
            </p>
          </div>
        </section>
      </div>

      <div
        :class="{
          'is-two-thirds': uploadedProfiles.length > 0,
          column: uploadedProfiles.length > 0,
        }"
      >
        <section v-if="uploadedProfiles.length > 0" class="p-5 card">
          <h2 class="title is-size-4">Previously Uploaded Profiles</h2>
          <div class="table-container">
            <table
              class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
            >
              <tr>
                <th>Identifier</th>
                <th>Code</th>
                <th>Delete</th>
              </tr>
              <tr
                v-for="(uploadedProfile, index) in uploadedProfiles"
                :key="index"
              >
                <td>
                  <router-link
                    :to="`/profiles/${uploadedProfile.url.replace(
                      uploadTarget,
                      ''
                    )}`"
                  >
                    {{ uploadedProfile.url.replace(uploadTarget, '') }}
                  </router-link>
                </td>
                <td>
                  <pre class="pre">{{ uploadedProfile.profile }}</pre>
                </td>
                <td>
                  <button
                    class="button is-danger is-rounded mt-3"
                    @click="deleteUploadedProfile(uploadedProfile.url)"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </table>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.image-placeholder {
  position: relative;
  overflow: hidden;
  width: 250px;
  height: 300px;
  box-shadow: 0 0 2px rgba(0 0 0 / 30%);
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

.image-profile {
  display: flex;
  background: red;
  max-height: 200px;
  width: 300px;
  object-fit: contain;
  border-radius: 3px;
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
  margin-bottom: 50px;
  background: white;
}

.input-fields {
  label {
    display: block;
  }
}

.no-js .image-file + label {
  display: none;
}

.image-file:focus + label,
.image-file.has-focus + label {
  outline: 1px dotted #000;
  outline: -webkit-focus-ring-color auto 5px;
}

.image-file + label svg {
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: currentcolor;
  margin-top: -0.25em;
  margin-right: 0.25em;
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

.field-body {
  margin-bottom: 10px;
}

section {
  overflow: hidden;
  padding: 0 20px;
}

.upload-form {
  padding: 20px;
  margin-bottom: 20px;
}

.pre {
  max-height: 200px;
  overflow-y: scroll;
  font-family: monospace;
}
</style>
