import type { Adapter, WalletReadyState } from '@solana/wallet-adapter-base'
import type { Ref } from 'vue'
import { watchEffect } from 'vue'
import type { Wallet } from '~/types'

/**
 * Listens for `readyState` changes in all registered wallets.
 */
export function useReadyStateListeners(wallets: Ref<Wallet[]>) {
  function handleReadyStateChange(this: Adapter, readyState: WalletReadyState) {
    const previousWallets = wallets.value
    const index = previousWallets.findIndex(({ adapter }) => adapter === this)
    if (index === -1) {
      return
    }
    wallets.value = [
      ...previousWallets.slice(0, index),
      { adapter: this, readyState },
      ...previousWallets.slice(index + 1),
    ]
  }

  watchEffect((onInvalidate) => {
    for (const { adapter } of wallets.value) {
      adapter.on('readyStateChange', handleReadyStateChange, adapter)
    }

    onInvalidate(() => {
      for (const { adapter } of wallets.value) {
        adapter.off('readyStateChange', handleReadyStateChange, adapter)
      }
    },
    )
  })
}
