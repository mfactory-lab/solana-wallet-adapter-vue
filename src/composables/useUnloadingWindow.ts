import type { Ref } from 'vue'
import { ref, watchEffect } from 'vue'

/**
 * Provides a boolean that tells us if the window is unloading.
 * This is only relevant in the browser.
 */
export function useUnloadingWindow(isUsingMwaOnMobile: Ref<boolean>): Ref<boolean> {
  const unloadingWindow = ref(false)

  if (typeof globalThis === 'undefined') {
    return unloadingWindow
  }

  const handleBeforeUnload = () => (unloadingWindow.value = true)

  watchEffect((onInvalidate) => {
    if (isUsingMwaOnMobile.value) {
      return
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    onInvalidate(() => window.removeEventListener('beforeunload', handleBeforeUnload))
  })

  return unloadingWindow
}
