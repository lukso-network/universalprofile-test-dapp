<script setup lang="ts">
import Web3 from "web3";
import { ref } from "vue";
import { Errors } from "@/types";
import useErc725 from "@/compositions/useErc725";
import Profile from "@/components/shared/Profile.vue";
import { LSP3Profile } from "@lukso/lsp-factory.js";

const { fetchProfile } = useErc725();
const receiver = ref({} as LSP3Profile);
const queryPending = ref(false);
const search = ref("");

defineProps<{ errors?: Errors }>();

const emits = defineEmits(["error", "update"]);

const searchReceiver = async () => {
  queryPending.value = true;
  emits("error", null);
  emits("update", search.value);

  if (!Web3.utils.isAddress(search.value)) {
    receiver.value = {
      name: "",
      description: "",
    };
    queryPending.value = false;
    emits("error", "Address not valid");
    return;
  }

  try {
    receiver.value = await fetchProfile(search.value);
  } catch (error) {
    if (error instanceof Error) {
      emits("error", error.message);
    }
  }
  queryPending.value = false;
};
</script>

<template name="Search">
  <div class="field">
    <div class="control is-small" :class="{ 'is-loading': queryPending }">
      <input
        v-model="search"
        class="input is-small"
        :class="{ 'is-danger': errors?.search }"
        type="text"
        placeholder="Search: Universal Profile Address..."
        data-testid="search"
        @keyup="searchReceiver"
      />
      <span
        v-if="errors?.search"
        class="has-text-danger is-size-7"
        data-testid="error"
        >{{ errors.search }}</span
      >
    </div>
  </div>
  <Profile
    :profile="receiver"
    :address="errors?.search ? undefined : search"
  ></Profile>
</template>
