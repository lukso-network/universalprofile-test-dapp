<template name="Search">
  <div class="field">
    <div class="control is-small" :class="{ 'is-loading': queryPending }">
      <input
        class="input is-small"
        :class="{ 'is-danger': errors?.search }"
        type="text"
        placeholder="Search: Universal Profile Address..."
        v-model="search"
        @keyup="searchReceiver"
        data-testid="search"
      />
      <span
        class="has-text-danger is-size-7"
        v-if="errors?.search"
        data-testid="error"
        >{{ errors.search }}</span
      >
    </div>
  </div>
  <Profile
    :profile="receiver.LSP3Profile"
    :address="errors?.search ? undefined : search"
  ></Profile>
</template>

<script setup lang="ts">
import Web3 from "web3";
import { ref } from "vue";
import { LSP3ProfileNested, Errors } from "@/types";
import useErc725 from "@/compositions/useErc725";
import Profile from "@/components/shared/Profile.vue";

const { fetchProfile } = useErc725();
const receiver = ref({} as LSP3ProfileNested);
const queryPending = ref(false);
const search = ref("");

defineProps<{ errors?: Errors }>();

const emits = defineEmits(["error", "update"]);

const searchReceiver = async () => {
  queryPending.value = true;
  // delete props.errors.search;
  emits("error", null);
  emits("update", search.value);

  if (!Web3.utils.isAddress(search.value)) {
    receiver.value.LSP3Profile = {
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
