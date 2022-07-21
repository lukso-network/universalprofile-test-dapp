<script setup lang="ts">
type Props = {
  isModalOpen: boolean;
  controllerKey: string;
};
type Emits = {
  (event: "closeModal"): void;
  (event: "deploy", controllerKey: string): void;
  (event: "update:modelValue", value: string): void;
};

const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const handleCloseModal = () => {
  emits("closeModal");
};
const handleDeploy = () => {
  const controllerKey = props.controllerKey;
  emits("deploy", controllerKey);
};

const handleInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  emits("update:modelValue", value);
};
</script>

<template>
  <div
    id="modal"
    class="modal modal-container"
    :class="isModalOpen ? 'is-active' : ''"
    data-testid="modal"
  >
    <div class="modal-background" />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Deploy LSP3UniversalProfile</p>
        <button class="delete" aria-label="close" @click="handleCloseModal" />
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
                @input="handleInput"
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
