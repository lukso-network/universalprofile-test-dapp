<script src="./profile-edit.component.ts" lang="ts"></script>

<template>
  <section class="section">
    <div class="columns">
      <div class="column">
        <section class="upload-form has-background-info-light">
          <div class="field">
            <label class="label">Name</label>
            <div class="control">
              <input
                v-model="profile.name"
                class="input"
                type="text"
                placeholder="Knock knock who's there?"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="label">Description</label>
            <div class="control">
              <textarea
                v-model="profile.description"
                class="textarea"
                placeholder="Once upon a time..."
              ></textarea>
            </div>
          </div>

          <div class="field">
            <label class="label">Links</label>
            <div v-for="(link, index) in profile.links" :key="link">
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input
                      v-model="profile.links[index].title"
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

            <button class="button is-info" @click="addNewLink">Add Link</button>
          </div>

          <div class="field">
            <label class="label">Tags</label>
            <div v-for="(tag, index) in profile.tags" :key="tag">
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input
                      v-model="profile.tags[index]"
                      class="input"
                      type="text"
                      placeholder="Tagname"
                    />
                  </p>
                </div>
                <div class="block">
                  <button class="button is-danger" @click="removeTag(index)">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <button class="button is-info" @click="addNewTag">Add Tag</button>
          </div>
        </section>
        <div class="field is-grouped is-grouped-right">
          <p class="control">
            <button
              type="submit"
              class="button is-success"
              :class="{ 'is-loading': isUploading }"
              :disabled="isUploading"
              @click="saveProfile"
            >
              Save
            </button>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
