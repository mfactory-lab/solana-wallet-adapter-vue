import type { Adapter, WalletReadyState } from '@solana/wallet-adapter-base'

export interface Wallet {
  adapter: Adapter
  readyState: WalletReadyState
}
