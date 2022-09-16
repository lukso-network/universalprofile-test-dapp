<script setup lang="ts">
import { ref } from 'vue'
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()

const name = ref('')
const apiUrl = ref('')
const chainId = ref('2828')
const chainIds = ref<number[]>([+chainId.value])
const showLabel = ref(false)

const addChainIds = () => {
  if (chainId.value.length === 0) {
    return
  }
  chainIds.value = [...chainIds.value, +chainId.value]
  chainId.value = ''
}

const removeChainId = (index: number) => {
  chainIds.value.splice(index, 1)
}

const onFocus = () => {
  showLabel.value = true
}

const onBlur = () => {
  showLabel.value = false
}

const addCustomRelayer = async () => {
  if (!name.value) {
    return setNotification('Enter a name', 'danger')
  }

  if (!apiUrl.value) {
    return setNotification('Enter an api url', 'danger')
  }

  if (!chainId.value) {
    return setNotification('Enter a chain id', 'danger')
  }

  try {
    await window.ethereum.request({
      method: 'up_addRelayService',
      params: [
        {
          name: name.value,
          apiUrl: apiUrl.value,
          chainIds: chainIds.value,
        },
      ],
    })
    setNotification('The relayer was added')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}
</script>
<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Custom Relayer</p>
      <div class="field">
        <label class="label">Name</label>
        <div class="control">
          <input
            v-model="name"
            class="input"
            type="text"
            data-testid="relayer-name"
          />
        </div>
      </div>
      <div class="field">
        <label class="label">API URL</label>
        <div class="control">
          <input
            v-model="apiUrl"
            class="input"
            type="text"
            data-testid="relayer-url"
          />
        </div>
      </div>
      <div class="field">
        <label class="label">ChainIDs</label>
        <div class="field is-grouped is-grouped-multiline">
          <div
            v-for="(chain_id, index) in chainIds"
            :key="index"
            class="control"
            data-testid="chain-id-list"
          >
            <div class="tags has-addons">
              <small
                class="tag is-primary is-light"
                data-testid="text-content"
                >{{ chain_id }}</small
              >
              <a class="tag is-delete" @click="removeChainId(index)"></a>
            </div>
          </div>
        </div>
        <div class="control">
          <input
            v-model="chainId"
            class="input"
            type="text"
            data-testid="chainIds"
            @keyup.enter="addChainIds"
            @focus="onFocus"
            @blur="onBlur"
          />
          <small v-if="showLabel && chainId.length" class="enter-label"
            >Hit Enter</small
          >
        </div>
      </div>
      <div class="field">
        <button
          :class="`button is-primary is-rounded mt-4`"
          data-testid="add-relayer"
          @click.stop="addCustomRelayer"
        >
          Add Custom Relayer
        </button>
      </div>
      <div class="field">
        <Notifications
          v-if="hasNotification"
          :notification="notification"
          class="mt-4"
          @hide="clearNotification"
        ></Notifications>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.enter-label {
  position: absolute;
  top: 25%;
  right: 20px;
  color: white;
  background-color: black;
  border-radius: 3px;
  padding: 0 10px;
  font-size: 11px;
}
</style>
