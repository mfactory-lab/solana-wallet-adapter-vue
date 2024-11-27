import { WalletError } from '@solana/wallet-adapter-base'

export class WalletNotSelectedError extends WalletError {
  override name = 'WalletNotSelectedError'
}

export class WalletNotInitializedError extends WalletError {
  override name = 'WalletNotSelectedError'
}
