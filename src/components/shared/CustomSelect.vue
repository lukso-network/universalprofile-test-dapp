<script setup lang="ts">

import {onMounted, ref} from "vue";

type Emits = {
  (event: 'optionSelected', option: string): void
}

type Props = {
  options: { display: string, value: string }[]
}

const props = defineProps<Props>()
const emits = defineEmits<Emits>()

const selected = ref<string>('')

const emitSelected = () => {
  emits('optionSelected', selected.value)
}

const handleChange = () => {
  emitSelected();
}

onMounted(() => {
  if (props.options.length > 0) {
    selected.value = props.options[0].value
    emitSelected()
  }
})

</script>

<template>
  <div class="field">
    <label class="select">
      <select
          v-model="selected"
          name="custom-select"
          @change="handleChange"
      >
        <option v-for="option in props.options" :key="option.value" :value="option.value">{{option.display}}</option>
      </select>
    </label>
  </div>
</template>