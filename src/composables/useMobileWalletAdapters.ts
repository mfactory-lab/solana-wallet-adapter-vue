import type { Adapter } from '@solana/wallet-adapter-base'
import type { Cluster } from '@solana/web3.js'
import type { Ref } from 'vue'
import {
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler,
  SolanaMobileWalletAdapter,
  SolanaMobileWalletAdapterWalletName,
} from '@solana-mobile/wallet-adapter-mobile'
import { computed } from 'vue'

/**
 * Auto-discovers wallet adapters that follows the mobile wallet standard
 * and adds them to the list of registered adapters.
 */
export function useMobileWalletAdapters(
  adapters: Ref<Adapter[]>,
  isMobile: Ref<boolean>,
  uriForAppIdentity: string | undefined,
  cluster: Ref<Cluster>,
): Ref<Adapter[]> {
  const mobileWalletAdapter = computed(() => {
    if (!isMobile.value) {
      return
    }

    const existingMobileWalletAdapter = adapters.value.find(
      adapter => adapter.name === SolanaMobileWalletAdapterWalletName,
    )

    if (existingMobileWalletAdapter) {
      return existingMobileWalletAdapter
    }

    return new SolanaMobileWalletAdapter({
      addressSelector: createDefaultAddressSelector(),
      appIdentity: { uri: uriForAppIdentity || undefined },
      authorizationResultCache: createDefaultAuthorizationResultCache(),
      chain: cluster.value,
      onWalletNotFound: createDefaultWalletNotFoundHandler(),
    })
  })

  return computed(() => {
    if (!mobileWalletAdapter.value || adapters.value.includes(mobileWalletAdapter.value)) {
      return adapters.value
    }
    return [mobileWalletAdapter.value, ...adapters.value]
  })
}
