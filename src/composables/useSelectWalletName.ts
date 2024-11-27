import type { WalletName } from '@solana/wallet-adapter-base'
import type { Ref } from 'vue'
import { SolanaMobileWalletAdapterWalletName } from '@solana-mobile/wallet-adapter-mobile'
import { useLocalStorage } from '@vueuse/core'
import { computed } from 'vue'

/**
 * Selects a wallet from its name and stores it in local storage.
 */
export function useSelectWalletName(
  localStorageKey: string,
  isMobile: Ref<boolean>,
): {
    name: Ref<string | undefined>
    isUsingMwa: Ref<boolean>
    isUsingMwaOnMobile: Ref<boolean>
    select: (name: WalletName) => void
    deselect: (force?: boolean) => void
  } {
  const name = useLocalStorage<WalletName | undefined>(
    localStorageKey,
    isMobile.value ? SolanaMobileWalletAdapterWalletName : undefined,
  )

  const isUsingMwa = computed(() => name.value === SolanaMobileWalletAdapterWalletName)
  const isUsingMwaOnMobile = computed(() => isUsingMwa.value && isMobile.value)

  const select = (walletName: WalletName): void => {
    if (name.value !== walletName) {
      name.value = walletName
    }
  }

  const deselect = (force = true): void => {
    if (force || isUsingMwa.value) {
      name.value = undefined
    }
  }

  return {
    name,
    isUsingMwa,
    isUsingMwaOnMobile,
    select,
    deselect,
  }
}
