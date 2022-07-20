<script setup lang="ts">
type Props = {
  isModalOpen: boolean;
  controllerKey: string;
};
const props = defineProps<Props>();

type Emits = {
  (event: "closeModal"): void;
  (event: "deploy", controllerKey: string): void;
  (event: "update:modelValue", value: string): void;
};
const emits = defineEmits<Emits>();

const handleCloseModal = () => {
  emits("closeModal");
};

const handleDeploy = () => {
  const controllerKey = props.controllerKey;
  emits("deploy", controllerKey);
};
</script>

<template>
  <div class="modal modal-container" :class="isModalOpen ? 'is-active' : ''">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Deploy LSP3UniversalProfile</p>
        <button
          class="delete"
          aria-label="close"
          @click="handleCloseModal"
        ></button>
      </header>
      <section class="modal-card-body">
        <form>
          <div class="field">
            <label class="label">Controller Key</label>
            <p class="control">
              <input
                :value="controllerKey"
                class="input"
                type="text"
                placeholder="Address (0x...)"
                required
                @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
              />
            </p>
          </div>
          <p class="help">
            Enter the address which will be managing the profile.
          </p>
        </form>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" @click="handleDeploy">Deploy</button>
        <button class="button" @click="handleCloseModal">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-container {
  padding: 0 20px;
}
</style>
