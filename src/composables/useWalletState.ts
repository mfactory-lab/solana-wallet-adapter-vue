import type { PublicKey } from '@solana/web3.js'
import type { Ref } from 'vue'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { computed, ref, shallowRef, watchEffect } from 'vue'
import type { Wallet, WalletStore } from '~/types'

/**
 * Updates the wallet's instance when its name changes and
 * derives other properties from the wallet's instance.
 */
export function useWalletState(
  wallets: Ref<Wallet[]>,
  name: Ref<string | undefined>,
): Pick<WalletStore, 'wallet' | 'publicKey' | 'connected' | 'readyState' | 'ready'> & { refreshWalletState: () => void } {
  const wallet = shallowRef<Wallet>()
  const publicKey = ref<PublicKey>()
  const connected = ref<boolean>(false)
  const readyState = ref<WalletReadyState>(WalletReadyState.Unsupported)
  const ready = computed<boolean>(
    () =>
      readyState.value === WalletReadyState.Installed
      || readyState.value === WalletReadyState.Loadable,
  )

  const refreshWalletState = () => {
    publicKey.value = wallet.value?.adapter.publicKey ?? undefined
    connected.value = wallet.value?.adapter.connected ?? false
    readyState.value = wallet.value?.readyState ?? WalletReadyState.Unsupported
  }

  // Set the active wallet if the name changes or different wallets are provided.
  watchEffect(() => {
    wallet.value = name.value
      ? wallets.value.find(({ adapter }) => adapter.name === name.value) ?? undefined
      : undefined
    refreshWalletState()
  })

  return {
    wallet,
    publicKey,
    connected,
    readyState,
    ready,
    refreshWalletState,
  }
}
