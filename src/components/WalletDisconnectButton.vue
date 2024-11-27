<script lang="ts" setup>
import { computed } from 'vue'
import { useWallet } from '~/useWallet'
import WalletIcon from './WalletIcon.vue'

const { disabled = false } = defineProps<{ disabled?: boolean }>()
const emit = defineEmits(['click'])

const { wallet, disconnect, disconnecting } = useWallet()
const content = computed(() => {
  if (disconnecting.value)
    return 'Disconnecting ...'
  if (wallet.value)
    return 'Disconnect'
  return 'Disconnect Wallet'
})

function handleClick(event: MouseEvent) {
  emit('click', event)
  if (event.defaultPrevented)
    return
  disconnect().catch(() => {})
}

const scope = {
  wallet,
  disconnecting,
  disabled,
  content,
  handleClick,
}
</script>

<template>
  <slot v-bind="scope">
    <button
      class="swv-button swv-button-trigger"
      :disabled="disabled || disconnecting || !wallet"
      @click="handleClick"
    >
      <wallet-icon v-if="wallet" :wallet="wallet" />
      <span>{{ content }}</span>
    </button>
  </slot>
</template>
