<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'
import { Lsp4Metadata } from '@/types'
import { getState } from '@/stores'

type Emits = {
  (event: 'newMetadata', metadata: Lsp4Metadata, creators: string[]): void
}

type Props = {
  disabled?: boolean
  newMetadata?: Lsp4Metadata
  newCreators?: string[]
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const defaultValue = {
  description: 'My super description',
  links: [
    {
      title: 'LUKSO Docs',
      url: 'https://docs.lukso.tech',
    },
  ],
}

const metadata = ref<Lsp4Metadata>(props.newMetadata || defaultValue)
const creators = ref<string[]>([])

watch(
  () => props.newMetadata,
  newMetadata => {
    metadata.value = newMetadata || defaultValue
  }
)

watchEffect(() => {
  creators.value = props.newCreators || [getState('address')]
})

const handleTokenIcon = (event: Event) => {
  const target = event.target as HTMLInputElement
  metadata.value.icon = (target.files as FileList)[0]
  emitMetadata()
}

const handleTokenImages = (event: Event) => {
  const target = event.target as HTMLInputElement
  metadata.value.images = Array.from(target.files as FileList)
  emitMetadata()
}

const addLink = () => {
  metadata.value.links.push({
    title: '',
    url: '',
  })
  emitMetadata()
}

const removeLink = (index: number) => {
  metadata.value.links.splice(index, 1)
  emitMetadata()
}

const handleLinkTitleChange = (index: number, event: Event) => {
  metadata.value.links[index].title = (event.target as HTMLInputElement).value
  emitMetadata()
}

const handleLinkUrlChange = (index: number, event: Event) => {
  metadata.value.links[index].url = (event.target as HTMLInputElement).value
  emitMetadata()
}

const handleCreatorChange = (index: number, event: Event) => {
  creators.value[index] = (event.target as HTMLInputElement).value
  emitMetadata()
}

const removeCreator = (index: number) => {
  creators.value.splice(index, 1)
  emitMetadata()
}

const addCreator = () => {
  creators.value.push('')
  emitMetadata()
}

const emitMetadata = () => {
  emits('newMetadata', metadata.value, creators.value)
}
</script>

<template>
  <div class="field">
    <label class="label">Token Icon</label>
    <div class="control">
      <input
        class="input"
        type="file"
        :disabled="props.disabled"
        @change="handleTokenIcon"
      />
    </div>
  </div>
  <div class="field">
    <label class="label">Token Images</label>
    <div class="control">
      <input
        class="input"
        type="file"
        multiple
        :disabled="props.disabled"
        @change="handleTokenImages"
      />
    </div>
  </div>
  <div class="field">
    <label class="label">Token Description</label>
    <div class="control">
      <textarea
        v-model="metadata.description"
        class="input"
        :disabled="props.disabled"
        @keyup="emitMetadata"
      />
    </div>
  </div>
  <div class="field">
    <label class="label">Token Links</label>
    <div
      v-for="(link, index) in metadata.links"
      :key="index"
      class="control mb-2 is-flex"
    >
      <input
        :v-model="link.title"
        :value="link.title"
        class="input mr-2"
        type="text"
        placeholder="Title"
        :disabled="props.disabled"
        @keyup="event => handleLinkTitleChange(index, event)"
      />
      <input
        :v-model="link.url"
        :value="link.url"
        class="input"
        type="text"
        placeholder="URL"
        :disabled="props.disabled"
        @keyup="event => handleLinkUrlChange(index, event)"
      />
      <button
        class="button ml-2"
        :disabled="props.disabled"
        @click="removeLink(index)"
      >
        Remove
      </button>
    </div>
    <button
      class="button"
      data-testid="addLink"
      :disabled="props.disabled"
      @click="addLink"
    >
      Add link
    </button>
  </div>
  <div class="field mb-3">
    <label class="label">Token Creators</label>
    <div
      v-for="(creator, index) in creators"
      :key="index"
      class="control mb-2 is-flex"
    >
      <input
        :v-model="creator"
        :value="creator"
        class="input"
        type="text"
        placeholder="Title"
        :disabled="props.disabled"
        @keyup="event => handleCreatorChange(index, event)"
      />
      <button
        class="button ml-2"
        :disabled="props.disabled"
        @click="removeCreator(index)"
      >
        Remove
      </button>
    </div>
    <button
      class="button"
      data-testid="addCreator"
      :disabled="props.disabled"
      @click="addCreator"
    >
      Add Creator
    </button>
  </div>
</template>
