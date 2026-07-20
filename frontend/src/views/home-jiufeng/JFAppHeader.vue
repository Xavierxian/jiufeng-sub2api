<template>
  <header class="jf-cloud-header">
    <div class="jf-cloud-header__inner">
      <div class="jf-cloud-header__left">
        <router-link :to="homePath" class="jf-cloud-brand" aria-label="Dashboard">
          <span class="jf-cloud-brand__logo">
            <img v-if="settingsLoaded" :src="siteLogo || '/logo.png'" :alt="siteName" />
          </span>
          <span class="jf-cloud-brand__text">{{ siteName }}</span>
        </router-link>

        <div
          v-if="displayVersion"
          ref="versionRef"
          class="jf-cloud-page-title jf-cloud-version"
        >
          <button
            type="button"
            class="jf-cloud-version__button"
            :aria-expanded="versionDropdownOpen"
            :title="hasVersionUpdate ? t('version.updateAvailable') : t('version.upToDate')"
            @click="handleVersionClick"
          >
            <span class="jf-cloud-page-title__eyebrow">
              {{ t('version.currentVersion') }}
            </span>
            <span class="jf-cloud-version__line">
              <strong class="jf-cloud-version__number">v{{ displayVersion || '--' }}</strong>
              <span v-if="hasVersionUpdate" class="jf-cloud-version__new">new</span>
            </span>
          </button>

          <transition name="dropdown">
            <div
              v-if="authStore.isAdmin && versionDropdownOpen"
              class="jf-cloud-version__dropdown"
            >
              <div class="jf-cloud-version__panel-head">
                <div>
                  <span
                    class="jf-cloud-version__status"
                    :class="{ 'jf-cloud-version__status--update': hasVersionUpdate }"
                  >
                    {{ hasVersionUpdate ? t('version.updateAvailable') : t('version.upToDate') }}
                  </span>
                  <strong>v{{ displayVersion || '--' }}</strong>
                </div>
                <button
                  type="button"
                  class="jf-cloud-version__refresh"
                  :disabled="versionLoading"
                  :title="t('version.refresh')"
                  @click.stop="refreshVersionInfo"
                >
                  <Icon
                    name="refresh"
                    size="sm"
                    :class="{ 'animate-spin': versionLoading }"
                  />
                </button>
              </div>

              <div class="jf-cloud-version__rows">
                <div class="jf-cloud-version__row">
                  <span>{{ t('version.currentVersion') }}</span>
                  <strong>v{{ displayVersion || '--' }}</strong>
                </div>
                <div class="jf-cloud-version__row">
                  <span>{{ t('version.latestVersion') }}</span>
                  <strong>{{ latestVersion ? `v${latestVersion}` : '--' }}</strong>
                </div>
              </div>

              <div v-if="releaseInfo" class="jf-cloud-version__release">
                <div class="jf-cloud-version__release-head">
                  <strong>{{ releaseInfo.name || (latestVersion ? `v${latestVersion}` : '') }}</strong>
                  <span v-if="releaseDate">{{ releaseDate }}</span>
                </div>
                <p v-if="releaseInfo.body">{{ releaseInfo.body }}</p>
              </div>

              <a
                :href="releaseUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="jf-cloud-version__github"
                @click="versionDropdownOpen = false"
              >
                <span>{{ releaseInfo?.html_url ? t('version.viewRelease') : t('nav.github') }}</span>
                <Icon name="externalLink" size="xs" />
              </a>
            </div>
          </transition>
        </div>

      </div>

      <div class="jf-cloud-header__center">
        <router-link
          v-for="shortcut in shortcuts"
          :key="shortcut.to"
          :to="shortcut.to"
          class="jf-cloud-shortcut"
        >
          <Icon :name="shortcut.icon" size="sm" />
          <span>{{ shortcut.label }}</span>
        </router-link>
      </div>

      <div class="jf-cloud-header__right">
        <AnnouncementBell v-if="user" />

        <button
          type="button"
          class="jf-cloud-icon-link jf-cloud-theme-toggle"
          :title="isDark ? t('nav.lightMode') : t('nav.darkMode')"
          :aria-label="isDark ? t('nav.lightMode') : t('nav.darkMode')"
          @click="toggleTheme"
        >
          <Icon v-if="isDark" name="sun" size="sm" class="text-amber-500" />
          <Icon v-else name="moon" size="sm" />
          <span>{{ isDark ? t('nav.lightMode') : t('nav.darkMode') }}</span>
        </button>

        <a
          v-if="docUrl"
          :href="docUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="jf-cloud-icon-link"
        >
          <Icon name="book" size="sm" />
          <span>{{ t('nav.docs') }}</span>
        </a>

        <LocaleSwitcher />

        <SubscriptionProgressMini v-if="user" />

        <div
          v-if="user"
          class="jf-cloud-balance"
          :title="frozenBalance > 0 ? balanceFrozenLabel : balanceAvailableText"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
            />
          </svg>
          <span>
            {{ formatHeaderMoney(availableBalance) }}
          </span>
          <span
            v-if="frozenBalance > 0"
            class="ml-1 text-xs text-amber-600 dark:text-amber-300"
          >
            +{{ formatHeaderMoney(frozenBalance) }}
          </span>
        </div>

        <div v-if="user" class="relative" ref="dropdownRef">
          <button
            @click="toggleDropdown"
            class="jf-cloud-user-button"
            aria-label="User Menu"
          >
            <div class="jf-cloud-user-button__avatar">
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                :alt="displayName"
                class="h-full w-full object-cover"
              >
              <span v-else>{{ userInitials }}</span>
            </div>
            <div class="jf-cloud-user-button__meta">
              <div>
                {{ displayName }}
              </div>
              <span>
                {{ user.role }}
              </span>
            </div>
            <Icon name="chevronDown" size="sm" />
          </button>

          <transition name="dropdown">
            <div v-if="dropdownOpen" class="dropdown right-0 mt-2 w-56">
              <div class="border-b border-gray-100 px-4 py-3 dark:border-dark-700">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ displayName }}
                </div>
                <div class="text-xs text-gray-500 dark:text-dark-400">{{ user.email }}</div>
              </div>

              <div class="border-b border-gray-100 px-4 py-2 dark:border-dark-700 sm:hidden">
                <div class="flex items-center justify-between gap-3 text-xs">
                  <span class="text-gray-500 dark:text-dark-400">{{ balanceAvailableText }}</span>
                  <span class="font-semibold text-primary-600 dark:text-primary-400">
                    {{ formatHeaderMoney(availableBalance) }}
                  </span>
                </div>
                <div v-if="frozenBalance > 0" class="mt-1 flex items-center justify-between gap-3 text-xs">
                  <span class="text-gray-500 dark:text-dark-400">{{ balanceFrozenText }}</span>
                  <span class="font-medium text-amber-600 dark:text-amber-300">
                    {{ formatHeaderMoney(frozenBalance) }}
                  </span>
                </div>
                <div v-if="frozenBalance > 0" class="mt-1 flex items-center justify-between gap-3 border-t border-gray-100 pt-1 text-xs dark:border-dark-700">
                  <span class="text-gray-500 dark:text-dark-400">{{ balanceTotalText }}</span>
                  <span class="font-semibold text-gray-900 dark:text-white">
                    {{ formatHeaderMoney(totalBalance) }}
                  </span>
                </div>
              </div>

              <div class="py-1">
                <router-link to="/profile" @click="closeDropdown" class="dropdown-item">
                  <Icon name="user" size="sm" />
                  {{ t('nav.profile') }}
                </router-link>

                <router-link to="/keys" @click="closeDropdown" class="dropdown-item">
                  <Icon name="key" size="sm" />
                  {{ t('nav.apiKeys') }}
                </router-link>

                <a
                  v-if="authStore.isAdmin"
                  href="https://github.com/Wei-Shaw/sub2api"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click="closeDropdown"
                  class="dropdown-item"
                >
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    />
                  </svg>
                  {{ t('nav.github') }}
                </a>

              </div>

              <div
                v-if="contactInfo"
                class="border-t border-gray-100 px-4 py-2.5 dark:border-dark-700"
              >
                <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <svg
                    class="h-3.5 w-3.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                    />
                  </svg>
                  <span>{{ t('common.contactSupport') }}:</span>
                  <span class="font-medium text-gray-700 dark:text-gray-300">{{
                    contactInfo
                  }}</span>
                </div>
              </div>

              <div v-if="showOnboardingButton" class="border-t border-gray-100 py-1 dark:border-dark-700">
                <button @click="handleReplayGuide" class="dropdown-item w-full">
                  <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 14a1 1 0 110 2 1 1 0 010-2zm1.07-7.75c0-.6-.49-1.25-1.32-1.25-.7 0-1.22.4-1.43 1.02a1 1 0 11-1.9-.62A3.41 3.41 0 0111.8 5c2.02 0 3.25 1.4 3.25 2.9 0 2-1.83 2.55-2.43 3.12-.43.4-.47.75-.47 1.23a1 1 0 01-2 0c0-1 .16-1.82 1.1-2.7.69-.64 1.82-1.05 1.82-2.06z"
                    />
                  </svg>
                  {{ $t('onboarding.restartTour') }}
                </button>
              </div>

              <div class="border-t border-gray-100 py-1 dark:border-dark-700">
                <button
                  @click="handleLogout"
                  class="dropdown-item w-full text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="1.5"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  {{ t('nav.logout') }}
                </button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore, useAuthStore, useOnboardingStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import SubscriptionProgressMini from '@/components/common/SubscriptionProgressMini.vue'
import AnnouncementBell from '@/components/common/AnnouncementBell.vue'
import Icon from '@/components/icons/Icon.vue'
import { sanitizeUrl } from '@/utils/url'

const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const onboardingStore = useOnboardingStore()

const user = computed(() => authStore.user)
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const versionDropdownOpen = ref(false)
const versionRef = ref<HTMLElement | null>(null)
const isDark = ref(document.documentElement.classList.contains('dark'))
const contactInfo = computed(() => appStore.contactInfo)
const docUrl = computed(() => sanitizeUrl(appStore.docUrl))
const avatarUrl = computed(() => user.value?.avatar_url?.trim() || '')
const availableBalance = computed(() => Number(user.value?.balance || 0))
const frozenBalance = computed(() => Number(user.value?.frozen_balance || 0))
const totalBalance = computed(() => availableBalance.value + frozenBalance.value)
const balanceAvailableText = computed(() => t('common.availableBalance') === 'common.availableBalance' ? '可用余额' : t('common.availableBalance'))
const balanceFrozenText = computed(() => t('common.frozenBalance') === 'common.frozenBalance' ? '冻结金额' : t('common.frozenBalance'))
const balanceTotalText = computed(() => t('common.totalBalance') === 'common.totalBalance' ? '总余额' : t('common.totalBalance'))
const balanceFrozenLabel = computed(() => `${balanceFrozenText.value} ${formatHeaderMoney(frozenBalance.value)}`)
const siteName = computed(() => appStore.siteName)
const siteLogo = computed(() => appStore.siteLogo)
const siteVersion = computed(() => appStore.siteVersion)
const settingsLoaded = computed(() => appStore.publicSettingsLoaded)
const homePath = computed(() => authStore.isAdmin ? '/admin/dashboard' : '/dashboard')
const displayVersion = computed(() => appStore.currentVersion || siteVersion.value)
const latestVersion = computed(() => appStore.latestVersion)
const hasVersionUpdate = computed(() => appStore.hasUpdate)
const versionLoading = computed(() => appStore.versionLoading)
const releaseInfo = computed(() => appStore.releaseInfo)
const releaseUrl = computed(() => {
  const url = releaseInfo.value?.html_url
  return url && url !== '#' ? url : 'https://github.com/Wei-Shaw/sub2api/releases'
})
const releaseDate = computed(() => {
  const rawDate = releaseInfo.value?.published_at
  if (!rawDate) return ''
  const date = new Date(rawDate)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString()
})

type HeaderShortcutIcon = 'grid' | 'users' | 'globe' | 'cog' | 'key' | 'chart' | 'user'

const shortcuts = computed<Array<{ to: string; label: string; icon: HeaderShortcutIcon }>>(() => {
  if (authStore.isAdmin) {
    return [
      { to: '/admin/dashboard', label: t('nav.dashboard'), icon: 'grid' },
      { to: '/admin/users', label: t('nav.users'), icon: 'users' },
      { to: '/admin/accounts', label: t('nav.accounts'), icon: 'globe' },
      { to: '/admin/settings', label: t('nav.settings'), icon: 'cog' }
    ]
  }
  return [
    { to: '/dashboard', label: t('nav.dashboard'), icon: 'grid' },
    { to: '/keys', label: t('nav.apiKeys'), icon: 'key' },
    { to: '/usage', label: t('nav.usage'), icon: 'chart' },
    { to: '/profile', label: t('nav.profile'), icon: 'user' }
  ]
})

/*
// 只在标准模式的管理员下显示新手引导按钮
*/
const showOnboardingButton = computed(() => {
  return !authStore.isSimpleMode && user.value?.role === 'admin'
})

const userInitials = computed(() => {
  if (!user.value) return ''
  // Prefer username, fallback to email
  if (user.value.username) {
    return user.value.username.substring(0, 2).toUpperCase()
  }
  if (user.value.email) {
    // Get the part before @ and take first 2 chars
    const localPart = user.value.email.split('@')[0]
    return localPart.substring(0, 2).toUpperCase()
  }
  return ''
})

const displayName = computed(() => {
  if (!user.value) return ''
  return user.value.username || user.value.email?.split('@')[0] || ''
})

function formatHeaderMoney(value: number) {
  if (!Number.isFinite(value)) return '$0.00'
  return `$${value.toFixed(2)}`
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}

function handleVersionClick() {
  if (!authStore.isAdmin) return
  toggleVersionDropdown()
}

function toggleVersionDropdown() {
  versionDropdownOpen.value = !versionDropdownOpen.value
  if (versionDropdownOpen.value) {
    void loadVersionInfo(false)
  }
}

async function loadVersionInfo(force = false) {
  if (!authStore.isAdmin) return
  await appStore.fetchVersion(force)
}

function refreshVersionInfo() {
  void loadVersionInfo(true)
}

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

async function handleLogout() {
  closeDropdown()
  try {
    await authStore.logout()
  } catch (error) {
    // Ignore logout errors - still redirect to login
    console.error('Logout error:', error)
  }
  await router.push('/login')
}

function handleReplayGuide() {
  closeDropdown()
  onboardingStore.replay()
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  if (dropdownRef.value && !dropdownRef.value.contains(target)) {
    closeDropdown()
  }
  if (versionRef.value && !versionRef.value.contains(target)) {
    versionDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

watch(
  () => authStore.isAdmin,
  (isAdmin) => {
    if (isAdmin) {
      void loadVersionInfo(false)
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>
