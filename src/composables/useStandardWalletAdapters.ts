import type { Adapter, WalletName } from '@solana/wallet-adapter-base'
import type { Wallet } from '@wallet-standard/base'
import type { Ref } from 'vue'
import { isWalletAdapterCompatibleStandardWallet } from '@solana/wallet-adapter-base'
import { StandardWalletAdapter } from '@solana/wallet-standard-wallet-adapter-base'
import { getWallets } from '@wallet-standard/app'
import { computed, shallowRef, watchEffect } from 'vue'

/**
 * Auto-discovers wallet adapters that follows the wallet standard
 * and adds them to the list of registered adapters.
 */
export function useStandardWalletAdapters(adapters: Ref<Adapter[]>): Ref<Adapter[]> {
  const warnings = new Set<WalletName>()
  const { get, on } = getWallets()

  const standardAdapters = shallowRef<Readonly<StandardWalletAdapter[]>>(
    wrapWalletsWithAdapters(get()),
  )

  watchEffect((onInvalidate) => {
    const listeners = [
      on('register', (...wallets) => {
        return (standardAdapters.value = [
          ...standardAdapters.value,
          ...wrapWalletsWithAdapters(wallets),
        ])
      }),
      on('unregister', (...wallets) => {
        return (standardAdapters.value = standardAdapters.value.filter(a => wallets.includes(a.wallet)))
      }),
    ]

    onInvalidate(() => {
      for (const off of listeners) off()
    })
  })

  return computed<Adapter[]>(() => [
    ...standardAdapters.value,
    ...adapters.value.filter(({ name }) => {
      if (standardAdapters.value.some(adapter => adapter.name === name)) {
        if (!warnings.has(name)) {
          warnings.add(name)
          console.warn(
            `${name} was registered as a Standard Wallet. The Wallet Adapter for ${name} can be removed from your app.`,
          )
        }
        return false
      }
      return true
    }),
  ])
}

function wrapWalletsWithAdapters(wallets: ReadonlyArray<Wallet>): ReadonlyArray<StandardWalletAdapter> {
  return wallets
    .filter(w => isWalletAdapterCompatibleStandardWallet(w))
    .map(wallet => new StandardWalletAdapter({ wallet }))
}
