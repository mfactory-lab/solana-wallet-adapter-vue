<script lang="ts" setup>
import { onClickOutside, useClipboard } from '@vueuse/core'
import { computed, ref, useTemplateRef } from 'vue'
import { useWallet } from '~/useWallet'
import WalletConnectButton from './WalletConnectButton.vue'
import WalletIcon from './WalletIcon.vue'
import WalletModalProvider from './WalletModalProvider.vue'

const { featured = 3, container = 'body', logo, dark = false } = defineProps<{
  featured?: number
  container?: string
  logo?: string
  dark?: boolean
}>()

const { publicKey, wallet, disconnect } = useWallet()

const dropdownPanel = useTemplateRef<HTMLElement>('dropdownPanel')

const dropdownOpened = ref(false)
function openDropdown() {
  dropdownOpened.value = true
}
function closeDropdown() {
  dropdownOpened.value = false
}
onClickOutside(dropdownPanel, closeDropdown)

const publicKeyBase58 = computed(() => publicKey.value?.toBase58())

const publicKeyTrimmed = computed(() => {
  if (!wallet.value || !publicKeyBase58.value) {
    return
  }
  return `${publicKeyBase58.value.slice(0, 4)}..${publicKeyBase58.value.slice(-4)}`
})

const { copy, copied: addressCopied, isSupported: canCopy } = useClipboard()
const copyAddress = () => publicKeyBase58.value && copy(publicKeyBase58.value)

// Define the bindings given to scoped slots.
const scope = {
  featured,
  container,
  logo,
  dark,
  wallet,
  publicKey,
  publicKeyTrimmed,
  publicKeyBase58,
  canCopy,
  addressCopied,
  dropdownPanel,
  dropdownOpened,
  openDropdown,
  closeDropdown,
  copyAddress,
  disconnect,
}
</script>

<template>
  <wallet-modal-provider
    :featured="featured"
    :container="container"
    :logo="logo"
    :dark="dark"
  >
    <template #default="modalScope">
      <slot v-bind="{ ...modalScope, ...scope }">
        <button
          v-if="!wallet"
          class="swv-button swv-button-trigger"
          @click="modalScope.openModal"
        >
          Select Wallet
        </button>
        <wallet-connect-button
          v-else-if="!publicKeyBase58"
        />
        <div v-else class="swv-dropdown">
          <slot name="dropdown-button" v-bind="{ ...modalScope, ...scope }">
            <button
              class="swv-button swv-button-trigger"
              :style="{ pointerEvents: dropdownOpened ? 'none' : 'auto' }"
              :aria-expanded="dropdownOpened"
              :title="publicKeyBase58"
              @click="openDropdown"
            >
              <wallet-icon :wallet="wallet" />
              <span>{{ publicKeyTrimmed }}</span>
            </button>
          </slot>
          <slot name="dropdown" v-bind="{ ...modalScope, ...scope }">
            <ul
              ref="dropdownPanel"
              aria-label="dropdown-list"
              class="swv-dropdown-list"
              :class="{ 'swv-dropdown-list-active': dropdownOpened }"
              role="menu"
            >
              <slot name="dropdown-list" v-bind="{ ...modalScope, ...scope }">
                <li
                  v-if="canCopy"
                  class="swv-dropdown-list-item"
                  role="menuitem"
                  @click="copyAddress"
                >
                  {{ addressCopied ? "Copied" : "Copy address" }}
                </li>
                <li
                  class="swv-dropdown-list-item"
                  role="menuitem"
                  @click="
                    modalScope.openModal();
                    closeDropdown();
                  "
                >
                  Change wallet
                </li>
                <li
                  class="swv-dropdown-list-item"
                  role="menuitem"
                  @click="
                    disconnect();
                    closeDropdown();
                  "
                >
                  Disconnect
                </li>
              </slot>
            </ul>
          </slot>
        </div>
      </slot>
    </template>

    <!-- Enable modal overrides. -->
    <template #overlay="modalScope">
      <slot name="modal-overlay" v-bind="{ ...modalScope, ...scope }" />
    </template>
    <template #modal="modalScope">
      <slot name="modal" v-bind="{ ...modalScope, ...scope }" />
    </template>
  </wallet-modal-provider>
</template>
