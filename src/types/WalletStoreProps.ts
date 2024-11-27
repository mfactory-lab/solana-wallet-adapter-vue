import type { Adapter, WalletError } from '@solana/wallet-adapter-base'
import type { Cluster } from '@solana/web3.js'
import type { MaybeRef } from 'vue'

export interface WalletStoreProps {
  wallets?: MaybeRef<Adapter[]>
  autoConnect?: MaybeRef<boolean>
  cluster?: MaybeRef<Cluster>
  onError?: (error: WalletError, adapter?: Adapter) => void
  localStorageKey?: string
}
