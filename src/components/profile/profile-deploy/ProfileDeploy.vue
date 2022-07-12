<script src="./profile-deploy.component.ts" lang="ts"></script>

<template>
  <section class="section">
    <h1 class="title">Deploy Profile</h1>
    <ProfileListIpfs
      :loading="status.isLoading"
      @createProfileOnChain="openModal"
    ></ProfileListIpfs>
    <br />
    <h2 class="title">Deployment Events</h2>
    <table
      class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth"
    >
      <tr>
        <th>Type</th>
        <th>Status</th>
        <th>Name</th>
        <th>Function</th>
        <th>Address</th>
        <th class="has-text-right pr-4">Gas</th>
        <th>TransactionHash</th>
      </tr>
      <tr
        v-for="deploymentEvent in profileDeploymentEvents"
        :key="deploymentEvent"
        :class="deploymentEvent.status"
      >
        <td>
          <span class="tag" :class="getTypeClass(deploymentEvent.type)">
            {{ deploymentEvent.type }}
          </span>
        </td>
        <td>
          <span class="tag" :class="getStatusClass(deploymentEvent.status)">
            {{ deploymentEvent.status }}
          </span>
        </td>
        <td>{{ deploymentEvent.contractName }}</td>
        <td>{{ deploymentEvent.functionName }}</td>
        <td>
          <code v-if="deploymentEvent?.receipt?.contractAddress">
            {{ deploymentEvent?.receipt?.contractAddress }}
          </code>
        </td>

        <td class="has-text-right">
          {{
            deploymentEvent?.receipt
              ? formatNumber(deploymentEvent?.receipt.gasUsed)
              : ""
          }}
        </td>
        <td>
          <a
            v-if="deploymentEvent?.receipt"
            :href="
              createBlockScoutLink(deploymentEvent?.receipt?.transactionHash)
            "
            class="button is-small mb-1"
          >
            {{ deploymentEvent?.receipt?.transactionHash.substring(0, 16) }}...
          </a>
          <a
            v-if="deploymentEvent?.transaction"
            :href="createBlockScoutLink(deploymentEvent?.transaction?.hash)"
            class="button is-small mb-1"
          >
            {{ deploymentEvent?.transaction?.hash.substring(0, 16) }}...
          </a>
        </td>
      </tr>
    </table>
  </section>

  <div class="modal" :class="isModalOpen ? 'is-active' : ''">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Deploy LSP3UniversalProfile</p>
        <button class="delete" aria-label="close" @click="closeModal"></button>
      </header>
      <section class="modal-card-body">
        <form>
          <div class="field">
            <label class="label">Controller Key</label>
            <p class="control">
              <input
                v-model="controllerKey"
                class="input"
                type="text"
                placeholder="Address (0x...)"
                required
              />
            </p>
          </div>
          <p class="help">
            Enter the address which will be managing the profile.
          </p>
        </form>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" @click="deploy(controllerKey)">
          Deploy
        </button>
        <button class="button" @click="closeModal">Cancel</button>
      </footer>
    </div>
  </div>
</template>

<style lang="scss">
.placeholder {
  opacity: 0.1;
}

.table-inline {
  td {
    border: none !important;
  }
}

.pending {
  background: hsl(206deg, 70%, 96%);
}

.complete {
  background: hsl(142deg, 52%, 96%);
}
</style>
