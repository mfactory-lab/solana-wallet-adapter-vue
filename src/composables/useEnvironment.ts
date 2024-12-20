import type { Adapter } from '@solana/wallet-adapter-base'
import type { Ref } from 'vue'
import { SolanaMobileWalletAdapterWalletName } from '@solana-mobile/wallet-adapter-mobile'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { computed } from 'vue'

export enum Environment {
  DESKTOP_WEB,
  MOBILE_WEB,
}

export function useEnvironment(adapters: Ref<Adapter[]>): {
  userAgent: string | undefined
  uriForAppIdentity: string | undefined
  environment: Ref<Environment>
  isMobile: Ref<boolean>
} {
  const userAgent = getUserAgent()
  const uriForAppIdentity = getUriForAppIdentity()
  const environment = computed(() => getEnvironment(adapters.value, userAgent))
  const isMobile = computed(() => environment.value === Environment.MOBILE_WEB)

  return {
    userAgent,
    uriForAppIdentity,
    environment,
    isMobile,
  }
}

let _userAgent: string | undefined
function getUserAgent() {
  if (typeof window !== 'undefined' && _userAgent === undefined) {
    _userAgent = window.navigator?.userAgent
  }
  return _userAgent
}

function getUriForAppIdentity(): string | undefined {
  if (typeof window === 'undefined' || window.location === undefined) {
    return
  }
  const { protocol, host } = window.location
  return `${protocol}//${host}`
}

function getEnvironment(
  adapters: Adapter[],
  userAgent?: string,
): Environment {
  const hasInstalledAdapters = adapters.some(
    adapter =>
      adapter.name !== SolanaMobileWalletAdapterWalletName
      && adapter.readyState === WalletReadyState.Installed,
  )

  /**
   * There are only two ways a browser extension adapter should be able to reach `Installed` status:
   *
   *     1. Its browser extension is installed.
   *     2. The app is running on a mobile wallet's in-app browser.
   *
   * In either case, we consider the environment to be desktop-like.
   */
  if (hasInstalledAdapters) {
    return Environment.DESKTOP_WEB
  }

  const isMobile = !!userAgent
    // Check we're on a platform that supports MWA.
    && isOsThatSupportsMwa(userAgent)
    // Ensure we are *not* running in a WebView.
    && !isWebView(userAgent)

  if (isMobile) {
    return Environment.MOBILE_WEB
  }

  return Environment.DESKTOP_WEB
}

function isOsThatSupportsMwa(userAgent: string) {
  return /android/i.test(userAgent)
}

function isWebView(userAgent: string) {
  return /(WebView|Version\/.+(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+)|; wv\).+(Chrome)\/(\d+)\.(\d+)\.(\d+)\.(\d+))/i.test(
    userAgent,
  )
}
