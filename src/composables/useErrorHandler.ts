import type { Adapter, WalletError } from '@solana/wallet-adapter-base'
import type { Ref } from 'vue'
import { WalletNotReadyError } from '@solana/wallet-adapter-base'

/**
 * Defines the logic that catches a given wallet error and handle it.
 */
export function useErrorHandler(
  unloadingWindow: Ref<boolean>,
  onError?: (error: WalletError, adapter?: Adapter) => void,
): (error: WalletError, adapter?: Adapter) => WalletError {
  return (error: WalletError, adapter?: Adapter) => {
    if (unloadingWindow.value) {
      return error
    }

    if (onError) {
      onError(error, adapter)
      return error
    }

    if (
      error instanceof WalletNotReadyError
      && typeof window !== 'undefined'
      && adapter
    ) {
      window.open(adapter.url, '_blank')
    }

    return error
  }
}
