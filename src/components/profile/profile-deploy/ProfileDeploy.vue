<template>
  <section class="section">
    <h1 class="title">Deploy Profile</h1>
    <ProfileListIpfs
      @createProfileOnChain="createProfileOnChain"
      :loading="status.isLoading"
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
        v-bind:key="deploymentEvent"
        :class="deploymentEvent.status"
      >
        <td>
          <span class="tag">{{ deploymentEvent.type }}</span>
        </td>
        <td>
          <span class="tag">{{ deploymentEvent.status }}</span>
        </td>
        <td>{{ deploymentEvent.contractName }}</td>
        <td>{{ deploymentEvent.functionName }}</td>
        <td>
          <code v-if="deploymentEvent?.receipt?.contractAddress">
            {{ deploymentEvent?.receipt?.contractAddress }}
          </code>
        </td>

        <td>
          {{
            deploymentEvent?.receipt
              ? formatNumber(deploymentEvent?.receipt.gasUsed)
              : ""
          }}
        </td>
        <td>
          <a
            v-if="deploymentEvent?.receipt"
            :href="`https://blockscout.com/lukso/l14/tx/${deploymentEvent?.receipt?.transactionHash}/internal-transactions`"
            class="button is-small mb-1"
          >
            {{ deploymentEvent?.receipt?.transactionHash.substring(0, 16) }}...
          </a>
          <a
            v-if="deploymentEvent?.transaction"
            :href="`https://blockscout.com/lukso/l14/tx/${deploymentEvent?.transaction?.transactionHash}/internal-transactions`"
            class="button is-small mb-1"
          >
            {{
              deploymentEvent?.transaction?.transactionHash?.substring(0, 16)
            }}...
          </a>
        </td>
      </tr>
    </table>
  </section>
</template>

<script src="./profile-deploy.component.ts" lang="ts"></script>
<style lang="scss">
.placeholder {
  opacity: 0.1;
}
.table--inline {
  td {
    border: none !important;
  }
}

.PENDING {
  background: hsl(206, 70%, 96%);
}
.COMPLETE {
  background: hsl(142, 52%, 96%);
}
</style>
