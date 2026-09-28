import type { NavigationGuard } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

// Component-level guards run after shared authentication checks, but before
// the subscription page mounts or requests subscription data.
export const subscriptionAccessGuard: NavigationGuard = async () => {
  const appStore = useAppStore()
  if (!appStore.publicSettingsLoaded) {
    await appStore.fetchPublicSettings().catch(() => {})
  }
  if (appStore.publicSettingsLoaded && appStore.cachedPublicSettings?.subscription_enabled === false) {
    return useAuthStore().isAdmin ? '/admin/dashboard' : '/dashboard'
  }
}
