<script setup lang="ts">
import { getState } from '@/stores'
import Notifications from '@/components/Notification.vue'
import useNotifications from '@/compositions/useNotifications'
import { ref, watchEffect } from 'vue'
import { MAGICVALUE } from '@/helpers/config'
import { generateNonce, SiweMessage } from 'siwe'
import { getDate, getTime } from '@/utils/dateTime'
import useWeb3Connection from '@/compositions/useWeb3Connection'

const { notification, clearNotification, hasNotification, setNotification } =
  useNotifications()
const { sign, personalSign, recover, getWeb3 } = useWeb3Connection()

enum SignMethod {
  EthSign = 'eth_sign',
  PersonalSign = 'personal_sign',
}

const isPending = ref(false)
const message = ref('sign message')
const password = ref('')
const showPassword = ref(false)
const siweMessage = ref('By logging in, you confirm the terms and conditions')
const signMessage = ref('')
const signResponse = ref<string>()
const recovery = ref<string>()
const magicValue = ref<string>()
const isSiwe = ref(false)
const hasExpirationTime = ref(false)
const hasNotBefore = ref(false)
const signingMethodSelected = ref<SignMethod>(SignMethod.EthSign)

const siwe = ref({
  expirationDate: getDate(),
  expirationTime: getTime(60 * 1000 * 5),
  notBeforeDate: getDate(),
  notBeforeTime: getTime(-60 * 1000 * 5),
  resources: ['https://mywebsite.com/privacy', 'https://mywebsite.com/tos'],
  nonce: '',
  domain: window.location.host,
  address: '',
  uri: window.location.href,
  version: '1',
  chainId: 0,
})

watchEffect(() => {
  siwe.value.address = getState('address')
  siwe.value.chainId = getState('chainId')
})

const onSign = async () => {
  clearNotification()
  const erc725AccountAddress = getState('address')

  try {
    isPending.value = true
    signMessage.value = isSiwe.value ? createSiweMessage() : message.value
    console.info(signMessage.value)
    if (signingMethodSelected.value === SignMethod.EthSign) {
      signResponse.value = await sign(signMessage.value, erc725AccountAddress)
    } else {
      signResponse.value = await personalSign(
        signMessage.value,
        erc725AccountAddress,
        password.value
      )
    }
    recovery.value = undefined
    magicValue.value = undefined

    setNotification('Message signed successfully')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  } finally {
    isPending.value = false
  }
}

const createSiweMessage = () => {
  const siweParams = {
    domain: siwe.value.domain,
    address: siwe.value.address,
    statement: siweMessage.value,
    uri: siwe.value.uri,
    version: siwe.value.version,
    nonce: siwe.value.nonce || generateNonce(),
    chainId: siwe.value.chainId,
  } as SiweMessage

  if (hasExpirationTime.value) {
    siweParams.expirationTime = new Date(
      `${siwe.value.expirationDate} ${siwe.value.expirationTime}`
    ).toISOString()
  }

  if (hasNotBefore.value) {
    siweParams.notBefore = new Date(
      `${siwe.value.notBeforeDate} ${siwe.value.notBeforeTime}`
    ).toISOString()
  }

  const resources = siwe.value.resources.filter(resource => resource !== '')
  if (resources.length > 0) {
    siweParams.resources = resources
  }

  const siweOutputMessage = new SiweMessage(siweParams)
  return siweOutputMessage.prepareMessage()
}

const addResource = () => {
  siwe.value.resources.push('')
}

const removeResource = (index: number) => {
  siwe.value.resources.splice(index, 1)
}

const handleResourceChange = (index: number, event: Event) => {
  siwe.value.resources[index] = (event.target as HTMLInputElement).value
}

const onRecover = async () => {
  clearNotification()

  if (!signResponse.value) {
    return setNotification('Please sign message first', 'danger')
  }

  try {
    recovery.value = await recover(signMessage.value, signResponse.value)

    setNotification('Recover was successful')
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}

const onSignatureValidation = async () => {
  clearNotification()

  try {
    const messageHash = getWeb3().eth.accounts.hashMessage(signMessage.value)
    if (window.erc725Account) {
      // TODO: we should probably set the default gas price to undefined,
      // but it is not yet clear why view functions error on L16 when gasPrice is passed
      window.erc725Account.options.gasPrice = void 0
      magicValue.value = (await window.erc725Account.methods
        .isValidSignature(messageHash, signResponse.value)
        .call()) as string
    }

    if (magicValue.value === MAGICVALUE) {
      setNotification('Signature validated successfully', 'info')
    } else {
      setNotification("Response doesn't match magic value", 'danger')
    }
  } catch (error) {
    setNotification((error as unknown as Error).message, 'danger')
  }
}

const toggleShow = () => {
  showPassword.value = !showPassword.value
}
</script>

<template>
  <div class="tile is-4 is-parent">
    <div class="tile is-child box">
      <p class="is-size-5 has-text-weight-bold mb-4">Sign</p>
      <div class="field">
        <label class="label">Select RPC</label>
        <input
          id="eth_sign_radio_btn"
          v-model="signingMethodSelected"
          type="radio"
          data-testid="eth_sign_radio_btn"
          value="eth_sign"
        />
        <label for="eth_sign_radio_btn" class="ml-1">eth_sign</label>

        <input
          id="personal_sign_radio_btn"
          v-model="signingMethodSelected"
          type="radio"
          data-testid="personal_sign_radio_btn"
          value="personal_sign"
          class="ml-1"
        />
        <label for="personal_sign_radio_btn" class="ml-1">personal_sign</label>
      </div>
      <div class="field">
        <label class="label">Message</label>
        <div class="control">
          <textarea
            v-if="isSiwe"
            v-model="siweMessage"
            class="textarea"
            rows="3"
          />
          <textarea
            v-if="!isSiwe"
            v-model="message"
            class="textarea"
            rows="3"
          />
        </div>
        <div
          v-if="signingMethodSelected === SignMethod.PersonalSign"
          class="field has-addons"
        >
          <div class="control is-expanded">
            <input
              v-if="showPassword"
              v-model="password"
              type="text"
              class="input"
              placeholder="Optional password"
              data-testid="password"
            />
            <input
              v-else
              v-model="password"
              type="password"
              class="input"
              placeholder="Optional password"
              data-testid="password"
            />
          </div>
          <div class="control">
            <button
              class="button"
              data-testid="toggle-password-visibility"
              @click="toggleShow"
            >
              <div
                :class="`password-visibility ${showPassword ? 'on' : 'off'}`"
              />
            </button>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="checkbox">
          <input
            v-model="isSiwe"
            type="checkbox"
            :value="isSiwe"
            data-testid="isSiwe"
          />
          Sign in with Ethereum
        </label>
      </div>
      <div v-show="isSiwe">
        <input v-model="siwe.nonce" type="hidden" data-testid="siwe.nonce" />
        <div class="field">
          <label class="label">Domain</label>
          <div class="control">
            <input
              v-model="siwe.domain"
              class="input"
              type="text"
              data-testid="siwe.domain"
            />
          </div>
        </div>
        <div class="field">
          <label class="label">Address</label>
          <div class="control">
            <input
              v-model="siwe.address"
              class="input"
              type="text"
              data-testid="siwe.address"
            />
          </div>
        </div>
        <div class="field">
          <label class="label">URI</label>
          <div class="control">
            <input
              v-model="siwe.uri"
              class="input"
              type="text"
              data-testid="siwe.uri"
            />
          </div>
        </div>
        <div class="field">
          <label class="label">Version</label>
          <div class="control">
            <input
              v-model="siwe.version"
              class="input"
              type="text"
              data-testid="siwe.version"
            />
          </div>
        </div>
        <div class="field">
          <label class="label">Chain Id</label>
          <div class="control">
            <input
              v-model="siwe.chainId"
              class="input"
              type="text"
              data-testid="siwe.chainId"
            />
          </div>
        </div>
        <div class="field">
          <label class="checkbox has-text-weight-bold">
            <input
              v-model="hasExpirationTime"
              type="checkbox"
              :value="hasExpirationTime"
              data-testid="siwe.hasExpirationTime"
            />
            Expiration time (optional)
          </label>
          <div v-if="hasExpirationTime" class="control is-flex">
            <input
              v-model="siwe.expirationDate"
              class="input"
              type="date"
              data-testid="siwe.expirationDate"
            />
            <input
              v-model="siwe.expirationTime"
              class="input ml-2"
              type="time"
              data-testid="siwe.expirationTime"
            />
          </div>
        </div>
        <div class="field">
          <label class="checkbox has-text-weight-bold">
            <input
              v-model="hasNotBefore"
              type="checkbox"
              :value="hasNotBefore"
              data-testid="siwe.hasNotBefore"
            />
            Not before (optional)
          </label>
          <div v-if="hasNotBefore" class="control is-flex">
            <input
              v-model="siwe.notBeforeDate"
              class="input"
              type="date"
              data-testid="siwe.notBeforeDate"
            />
            <input
              v-model="siwe.notBeforeTime"
              class="input ml-2"
              type="time"
              data-testid="siwe.notBeforeTime"
            />
          </div>
        </div>
        <div class="field">
          <label class="label">Resources (optional)</label>
          <div
            v-for="(resource, index) in siwe.resources"
            :key="index"
            class="control mb-2 is-flex"
          >
            <input
              :v-model="resource"
              :value="resource"
              class="input"
              type="text"
              :data-testid="`siwe.resource-${index}`"
              @keyup="event => handleResourceChange(index, event)"
            />
            <button class="button ml-2" @click="removeResource(index)">
              Remove
            </button>
          </div>
        </div>
        <button class="button" data-testid="addResource" @click="addResource">
          Add resource
        </button>
      </div>
      <div class="field mt-5">
        <button
          :class="`button is-primary is-rounded mb-3 ${isPending ? 'is-loading' : ''}`"
          data-testid="sign"
          @click="onSign"
        >
          Sign
        </button>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3"
          :disabled="signResponse ? undefined : true"
          data-testid="recover"
          @click="onRecover"
        >
          Recover
        </button>
      </div>
      <div class="field">
        <button
          class="button is-primary is-rounded mb-3"
          :disabled="signResponse ? undefined : true"
          data-testid="validate-signature"
          @click="onSignatureValidation"
        >
          Signature validation
        </button>
      </div>
      <div class="field">
        Test <code>eth_sign</code> RPC call [<a
          href="https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sign"
          >documentation</a
        >].
      </div>
      <div class="field">
        Test <code>personal_sign</code> RPC call [<a
          href="https://docs.constellationnetwork.io/stargazer/apireference/ethereumrpcapi/personal_sign/"
          >documentation ex. 1</a
        >,
        <a href="https://docs.metamask.io/wallet/reference/personal_sign/"
          >documentation ex. 2</a
        >].
      </div>
      <div class="field">
        How to implement
        <a
          href="https://docs.lukso.tech/guides/browser-extension/sign-in-with-ethereum"
          >Sign In With Ethereum tutorial</a
        >.
      </div>
      <div class="field">
        <Notifications
          v-if="hasNotification"
          :notification="notification"
          class="mt-4"
          @hide="clearNotification"
        ></Notifications>
      </div>
      <div class="field">
        <div
          v-if="signResponse"
          class="notification is-info is-light mt-5"
          data-testid="info"
        >
          <p class="mb-3">
            Signature:
            <b data-testid="signature">{{ signResponse }}</b>
          </p>
          <p v-if="recovery" class="mb-3">
            Recover EoA: <b data-testid="recovery-eoa">{{ recovery }}</b>
          </p>
          <p v-if="magicValue" class="mb-3">
            Magic value: <b data-testid="magic-value">{{ magicValue }}</b>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.notification {
  word-break: break-all;
}

textarea {
  resize: vertical;
}

.password-visibility {
  height: 16px;
  width: 30px;
  background-repeat: no-repeat;
  display: inline-flex;
  background-position: center;
  background-size: contain;
  position: relative;

  &.on {
    background-image: url('/visibility_on.svg');
  }

  &.off {
    background-image: url('/visibility_off.svg');
  }
}
</style>
