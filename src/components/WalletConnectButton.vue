<script lang="ts" setup>
import { computed } from 'vue'
import { useWallet } from '~/useWallet'
import WalletIcon from './WalletIcon.vue'

const { disabled = false } = defineProps<{ disabled?: boolean }>()
const emit = defineEmits(['click'])

const { wallet, connect, connecting, connected } = useWallet()

const content = computed(() => {
  if (connecting.value)
    return 'Connecting ...'
  if (connected.value)
    return 'Connected'
  if (wallet.value)
    return 'Connect'
  return 'Connect Wallet'
})

function onClick(event: MouseEvent) {
  emit('click', event)
  if (event.defaultPrevented)
    return
  connect().catch(() => {})
}

const scope = {
  wallet,
  disabled,
  connecting,
  connected,
  content,
  onClick,
}
</script>

<template>
  <slot v-bind="scope">
    <button
      class="swv-button swv-button-trigger"
      :disabled="disabled || !wallet || connecting || connected"
      @click="onClick"
    >
      <wallet-icon v-if="wallet" :wallet="wallet" />
      <span>{{ content }}</span>
    </button>
  </slot>
</template>
