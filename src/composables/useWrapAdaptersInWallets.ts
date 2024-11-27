import type { Adapter } from '@solana/wallet-adapter-base'
import type { Ref } from 'vue'
import { shallowRef, watchEffect } from 'vue'
import type { Wallet } from '~/types'

/**
 * Dynamically turns an array of Adapters into an array of Wallets.
 */
export function useWrapAdaptersInWallets(
  adapters: Ref<Adapter[]>,
): Ref<Wallet[]> {
  const wallets = shallowRef<Wallet[]>([])

  watchEffect(() => {
    wallets.value = adapters.value.map(newAdapter => ({
      adapter: newAdapter,
      readyState: newAdapter.readyState,
    }))
  })

  return wallets
}
