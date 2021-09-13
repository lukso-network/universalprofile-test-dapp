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
            <div v-for="(link, index) in profile.links" v-bind:key="link">
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input
                      class="input"
                      type="text"
                      v-model="profile.links[index].title"
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
                      class="input"
                      type="text"
                      v-model="link.url"
                      placeholder="example.com"
                    />
                  </p>
                </div>
                <div class="block">
                  <button @click="removeLink(index)" class="button is-danger">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <button @click="addNewLink" class="button is-info">Add Link</button>
          </div>

          <div class="field">
            <label class="label">Tags</label>
            <div v-for="(tag, index) in profile.tags" v-bind:key="tag">
              <div class="field-body">
                <div class="field">
                  <p class="control is-expanded">
                    <input
                      class="input"
                      type="text"
                      v-model="profile.tags[index]"
                      placeholder="Tagname"
                    />
                  </p>
                </div>
                <div class="block">
                  <button @click="removeTag(index)" class="button is-danger">
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <button @click="addNewTag" class="button is-info">Add Tag</button>
          </div>
        </section>
        <div class="field is-grouped is-grouped-right">
          <p class="control">
            <button
              type="submit"
              @click="saveProfile"
              class="button is-success"
              :class="{ 'is-loading': isUploading }"
              :disabled="isUploading"
            >
              Save
            </button>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script src="./profile-edit.component.ts" lang="ts"></script>
