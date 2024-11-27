import type { WalletStore, WalletStoreProps as WalletStoreProperties } from './types'
import { createWalletStore } from './createWalletStore'
import { WalletNotInitializedError } from './errors'

let walletStore: WalletStore | undefined

export function useWallet(): WalletStore {
  if (walletStore) {
    return walletStore
  }
  throw new WalletNotInitializedError(
    'Wallet not initialized. Please use the `initWallet` method to initialize the wallet.',
  )
}

export function initWallet(walletStoreProperties: WalletStoreProperties): void {
  walletStore = createWalletStore(walletStoreProperties)
}
