<script lang="ts" setup>
import type { Wallet } from '~/types'

const { wallet } = defineProps<{ wallet: Wallet }>()
</script>

<template>
  <i class="swv-button-icon">
    <img
      v-if="wallet"
      :src="wallet.adapter.icon"
      :alt="`${wallet.adapter.name} icon`"
    >
  </i>
</template>
