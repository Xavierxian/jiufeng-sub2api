<template>
  <AppLayout>
    <div data-testid="profile-shell" class="profile-page space-y-6 dark:text-zinc-100">
      <section class="profile-hero dark:!border-zinc-800 dark:!bg-zinc-900 dark:!shadow-none">
        <div class="flex min-w-0 flex-col gap-5 lg:flex-row lg:items-center">
          <div class="profile-avatar">
            <img
              v-if="avatarUrl"
              :src="avatarUrl"
              :alt="displayName"
              class="h-full w-full object-cover"
            >
            <span v-else>{{ avatarInitial }}</span>
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="truncate text-2xl font-bold tracking-tight text-gray-950 dark:text-white md:text-3xl">
                {{ displayName }}
              </h1>
              <span :class="['profile-badge', user?.role === 'admin' ? 'profile-badge-primary' : 'profile-badge-muted']">
                {{ user?.role === 'admin' ? t('profile.administrator') : t('profile.user') }}
              </span>
              <span :class="['profile-badge', user?.status === 'active' ? 'profile-badge-success' : 'profile-badge-danger']">
                {{ user?.status === 'active' ? t('common.active') : t('common.disabled') }}
              </span>
            </div>

            <div class="mt-3 flex flex-wrap items-center gap-3 text-sm font-medium text-gray-500 dark:text-slate-200">
              <span class="inline-flex min-w-0 items-center gap-2">
                <Icon name="mail" size="sm" class="text-primary-500 dark:text-primary-300" />
                <span class="truncate">{{ primaryEmailDisplay || '-' }}</span>
              </span>
              <span class="inline-flex items-center gap-2">
                <Icon name="calendar" size="sm" class="text-primary-500 dark:text-primary-300" />
                <span>{{ memberSinceLabel }}</span>
              </span>
            </div>
          </div>
        </div>

        <div class="profile-metrics">
          <article class="profile-metric dark:!border-zinc-800 dark:!bg-zinc-950/60">
            <div class="profile-metric-icon text-primary-600 dark:!bg-teal-500/10 dark:text-primary-300">
              <Icon name="creditCard" size="md" />
            </div>
            <div>
              <p>{{ t('profile.accountBalance') }}</p>
              <strong class="text-primary-600 dark:text-primary-300">{{ formatCurrency(user?.balance || 0) }}</strong>
            </div>
          </article>

          <article class="profile-metric dark:!border-zinc-800 dark:!bg-zinc-950/60">
            <div class="profile-metric-icon text-blue-600 dark:!bg-blue-500/10 dark:text-blue-300">
              <Icon name="bolt" size="md" />
            </div>
            <div>
              <p>{{ t('profile.concurrencyLimit') }}</p>
              <strong class="text-blue-600 dark:text-blue-300">{{ user?.concurrency || 0 }}</strong>
            </div>
          </article>

          <article class="profile-metric dark:!border-zinc-800 dark:!bg-zinc-950/60">
            <div class="profile-metric-icon text-purple-600 dark:!bg-purple-500/10 dark:text-purple-300">
              <Icon name="clock" size="md" />
            </div>
            <div>
              <p>{{ t('profile.memberSince') }}</p>
              <strong class="text-purple-600 dark:text-purple-300">{{ memberSinceLabel }}</strong>
            </div>
          </article>
        </div>
      </section>

      <section v-if="contactInfo" class="profile-support dark:!border-zinc-800 dark:!bg-zinc-900 dark:!shadow-none">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
          <Icon name="chat" size="md" />
        </div>
        <div class="min-w-0">
          <h2 class="text-sm font-semibold text-gray-950 dark:text-white">
            {{ t('common.contactSupport') }}
          </h2>
          <p class="mt-1 truncate text-sm font-medium text-gray-600 dark:text-slate-200">
            {{ contactInfo }}
          </p>
        </div>
      </section>

      <div class="profile-grid">
        <div class="space-y-6">
          <section class="profile-panel dark:!border-zinc-800 dark:!bg-zinc-900 dark:!shadow-none">
            <div class="profile-panel-head">
              <div>
                <h2 class="profile-section-title dark:!text-white">{{ t('profile.basicsTitle') }}</h2>
                <p class="profile-section-copy dark:!text-zinc-200">{{ t('profile.basicsDescription') }}</p>
              </div>
              <Icon name="user" size="md" class="text-primary-500 dark:text-primary-300" />
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              <div class="profile-soft-card dark:!border-zinc-800 dark:!bg-zinc-950/60">
                <ProfileAvatarCard :user="user" embedded />
              </div>
              <div class="profile-soft-card dark:!border-zinc-800 dark:!bg-zinc-950/60">
                <ProfileEditForm :initial-username="user?.username || ''" embedded />
              </div>
            </div>
          </section>

          <section class="profile-panel dark:!border-zinc-800 dark:!bg-zinc-900 dark:!shadow-none">
            <div class="profile-panel-head">
              <div>
                <h2 class="profile-section-title dark:!text-white">{{ t('profile.authBindings.title') }}</h2>
                <p class="profile-section-copy dark:!text-zinc-200">{{ t('profile.authBindings.description') }}</p>
              </div>
              <Icon name="link" size="md" class="text-primary-500 dark:text-primary-300" />
            </div>

            <ProfileIdentityBindingsSection
              :user="user"
              :linuxdo-enabled="linuxdoOAuthEnabled"
              :dingtalk-enabled="dingtalkOAuthEnabled"
              :oidc-enabled="oidcOAuthEnabled"
              :oidc-provider-name="oidcOAuthProviderName"
              :wechat-enabled="wechatOAuthEnabled"
              :wechat-open-enabled="wechatOAuthOpenEnabled"
              :wechat-mp-enabled="wechatOAuthMPEnabled"
              embedded
              compact
            />
          </section>
        </div>

        <aside class="space-y-6">
          <section class="profile-panel dark:!border-zinc-800 dark:!bg-zinc-900 dark:!shadow-none">
            <div class="profile-panel-head">
              <div>
                <h2 class="profile-section-title dark:!text-white">{{ t('profile.changePassword') }}</h2>
                <p class="profile-section-copy dark:!text-zinc-200">{{ t('profile.passwordHint') }}</p>
              </div>
              <Icon name="lock" size="md" class="text-primary-500 dark:text-primary-300" />
            </div>
            <ProfilePasswordForm embedded />
          </section>

          <ProfileTotpCard />

          <ProfileBalanceNotifyCard
            v-if="user && balanceLowNotifyEnabled"
            :enabled="user.balance_notify_enabled ?? true"
            :threshold="user.balance_notify_threshold"
            :extra-emails="user.balance_notify_extra_emails ?? []"
            :system-default-threshold="systemDefaultThreshold"
            :user-email="user.email"
          />
        </aside>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@/components/icons'
import AppLayout from '@/views/home-jiufeng/JFAppLayout.vue'
import ProfileAvatarCard from '@/components/user/profile/ProfileAvatarCard.vue'
import ProfileBalanceNotifyCard from '@/components/user/profile/ProfileBalanceNotifyCard.vue'
import ProfileEditForm from '@/components/user/profile/ProfileEditForm.vue'
import ProfileIdentityBindingsSection from '@/components/user/profile/ProfileIdentityBindingsSection.vue'
import ProfilePasswordForm from '@/components/user/profile/ProfilePasswordForm.vue'
import ProfileTotpCard from '@/components/user/profile/ProfileTotpCard.vue'
import { isWeChatWebOAuthEnabled } from '@/api/auth'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const user = computed(() => authStore.user)

const contactInfo = ref('')
const balanceLowNotifyEnabled = ref(false)
const systemDefaultThreshold = ref(0)
const linuxdoOAuthEnabled = ref(false)
const dingtalkOAuthEnabled = ref(false)
const wechatOAuthEnabled = ref(false)
const wechatOAuthOpenEnabled = ref<boolean | undefined>(undefined)
const wechatOAuthMPEnabled = ref<boolean | undefined>(undefined)
const oidcOAuthEnabled = ref(false)
const oidcOAuthProviderName = ref('OIDC')

const avatarUrl = computed(() => user.value?.avatar_url?.trim() || '')
const displayName = computed(() => user.value?.username?.trim() || user.value?.email?.trim() || t('profile.user'))
const avatarInitial = computed(() => displayName.value.charAt(0).toUpperCase() || 'U')
const primaryEmailDisplay = computed(() => {
  const email = user.value?.email?.trim() || ''
  if (!email || email.endsWith('.invalid')) return ''
  return email
})
const memberSinceLabel = computed(() => formatMonth(user.value?.created_at || ''))

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

function formatMonth(value: string): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short'
  }).format(date)
}

onMounted(async () => {
  const profileRefresh = authStore.refreshUser().catch((error) => {
    console.error('Failed to refresh profile:', error)
  })

  const settingsLoad = appStore.fetchPublicSettings()
    .then((settings) => {
      if (!settings) return

      contactInfo.value = settings.contact_info || ''
      balanceLowNotifyEnabled.value = settings.balance_low_notify_enabled ?? false
      systemDefaultThreshold.value = settings.balance_low_notify_threshold ?? 0
      linuxdoOAuthEnabled.value = settings.linuxdo_oauth_enabled ?? false
      dingtalkOAuthEnabled.value = settings.dingtalk_oauth_enabled ?? false
      wechatOAuthEnabled.value = isWeChatWebOAuthEnabled(settings)
      wechatOAuthOpenEnabled.value = typeof settings.wechat_oauth_open_enabled === 'boolean'
        ? settings.wechat_oauth_open_enabled
        : undefined
      wechatOAuthMPEnabled.value = typeof settings.wechat_oauth_mp_enabled === 'boolean'
        ? settings.wechat_oauth_mp_enabled
        : undefined
      oidcOAuthEnabled.value = settings.oidc_oauth_enabled ?? false
      oidcOAuthProviderName.value = settings.oidc_oauth_provider_name || 'OIDC'
    })
    .catch((error) => {
      console.error('Failed to load settings:', error)
    })

  await Promise.all([profileRefresh, settingsLoad])
})
</script>

<style scoped>
.profile-page {
  max-width: 1280px;
  margin: 0 auto;
}

.profile-hero,
.profile-panel,
.profile-support {
  border: 1px solid rgb(226 232 240);
  border-radius: 0.875rem;
  background: rgb(255 255 255);
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.05);
}

:global(html.dark) .profile-hero,
:global(html.dark) .profile-panel,
:global(html.dark) .profile-support,
:global(body.dark) .profile-hero,
:global(body.dark) .profile-panel,
:global(body.dark) .profile-support,
:global(.dark) .profile-hero,
:global(.dark) .profile-panel,
:global(.dark) .profile-support {
  border-color: rgb(39 39 42) !important;
  background: rgb(24 24 27) !important;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.035),
    0 16px 38px rgb(0 0 0 / 0.20) !important;
}

.profile-hero {
  display: grid;
  gap: 1.5rem;
  padding: 1.5rem;
}

.profile-avatar {
  display: flex;
  width: 5.25rem;
  height: 5.25rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 1.25rem;
  background: linear-gradient(135deg, rgb(20 184 166), rgb(13 148 136));
  color: white;
  font-size: 2rem;
  font-weight: 800;
  box-shadow: 0 16px 32px rgb(20 184 166 / 0.22);
}

.profile-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.profile-badge-primary,
.profile-badge-success {
  background: rgb(204 251 241);
  color: rgb(15 118 110);
}

.profile-badge-muted {
  background: rgb(241 245 249);
  color: rgb(71 85 105);
}

.profile-badge-danger {
  background: rgb(254 226 226);
  color: rgb(185 28 28);
}

:global(.dark) .profile-badge-primary,
:global(.dark) .profile-badge-success {
  background: rgb(20 184 166 / 0.18) !important;
  color: rgb(153 246 228);
}

:global(.dark) .profile-badge-muted {
  background: rgb(39 39 42) !important;
  color: rgb(226 232 240);
}

:global(.dark) .profile-badge-danger {
  background: rgb(127 29 29 / 0.35) !important;
  color: rgb(252 165 165);
}

.profile-metrics {
  display: grid;
  gap: 0.875rem;
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

.profile-metric {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  border: 1px solid rgb(241 245 249);
  border-radius: 0.75rem;
  background: rgb(248 250 252);
  padding: 1rem;
}

:global(.dark) .profile-metric {
  border-color: rgb(39 39 42) !important;
  background: rgb(18 18 20) !important;
}

.profile-metric-icon {
  display: flex;
  width: 2.5rem;
  height: 2.5rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: rgb(255 255 255);
}

:global(.dark) .profile-metric-icon {
  background: rgb(20 184 166 / 0.10) !important;
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.05);
}

.profile-metric p {
  color: rgb(100 116 139);
  font-size: 0.8125rem;
  font-weight: 700;
}

.profile-metric strong {
  display: block;
  margin-top: 0.15rem;
  font-size: 1.125rem;
  line-height: 1.2;
}

:global(.dark) .profile-metric p {
  color: rgb(244 244 245);
}

.profile-support {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
}

.profile-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: minmax(0, 1fr);
}

.profile-panel {
  padding: 1.5rem;
}

.profile-panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.profile-panel-head h2,
.profile-section-title {
  color: rgb(15 23 42);
  font-size: 1.125rem;
  font-weight: 800;
}

.profile-panel-head p,
.profile-section-copy {
  margin-top: 0.25rem;
  color: rgb(100 116 139);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
}

:global(.dark) .profile-panel-head h2,
:global(.dark) .profile-section-title {
  color: rgb(250 250 250) !important;
}

:global(.dark) .profile-panel-head p,
:global(.dark) .profile-section-copy {
  color: rgb(226 232 240) !important;
}

.profile-soft-card {
  border: 1px solid rgb(226 232 240);
  border-radius: 0.875rem;
  background: rgb(248 250 252);
  padding: 1.25rem;
}

:global(.dark) .profile-soft-card {
  border-color: rgb(39 39 42) !important;
  background: rgb(18 18 20) !important;
}

:deep(.card) {
  border-radius: 0.875rem;
}

:global(html.dark) .profile-page :deep(.card),
:global(body.dark) .profile-page :deep(.card),
:global(.dark) .profile-page :deep(.card) {
  border-color: rgb(39 39 42) !important;
  background: rgb(24 24 27) !important;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.035),
    0 16px 38px rgb(0 0 0 / 0.22) !important;
}

:global(html.dark) .profile-page :deep(.bg-gray-50),
:global(html.dark) .profile-page :deep(.bg-gray-50\/80),
:global(html.dark) .profile-page :deep(.bg-white),
:global(html.dark) .profile-page :deep(.bg-white\/90),
:global(html.dark) .profile-page :deep(.dark\:bg-dark-900\/50),
:global(html.dark) .profile-page :deep(.dark\:bg-dark-900\/30),
:global(html.dark) .profile-page :deep(.dark\:bg-dark-800),
:global(html.dark) .profile-page :deep(.dark\:bg-dark-700),
:global(html.dark) .profile-page :deep(.dark\:bg-gray-700),
:global(html.dark) .profile-page :deep(.dark\:bg-gray-800),
:global(html.dark) .profile-page :deep(.dark\:bg-slate-900),
:global(body.dark) .profile-page :deep(.bg-gray-50),
:global(body.dark) .profile-page :deep(.bg-gray-50\/80),
:global(body.dark) .profile-page :deep(.bg-white),
:global(body.dark) .profile-page :deep(.bg-white\/90),
:global(body.dark) .profile-page :deep(.dark\:bg-dark-900\/50),
:global(body.dark) .profile-page :deep(.dark\:bg-dark-900\/30),
:global(body.dark) .profile-page :deep(.dark\:bg-dark-800),
:global(body.dark) .profile-page :deep(.dark\:bg-dark-700),
:global(body.dark) .profile-page :deep(.dark\:bg-gray-700),
:global(body.dark) .profile-page :deep(.dark\:bg-gray-800),
:global(body.dark) .profile-page :deep(.dark\:bg-slate-900),
:global(.dark) .profile-page :deep(.bg-gray-50),
:global(.dark) .profile-page :deep(.bg-gray-50\/80),
:global(.dark) .profile-page :deep(.bg-white),
:global(.dark) .profile-page :deep(.bg-white\/90),
:global(.dark) .profile-page :deep(.dark\:bg-dark-900\/50),
:global(.dark) .profile-page :deep(.dark\:bg-dark-900\/30),
:global(.dark) .profile-page :deep(.dark\:bg-dark-800),
:global(.dark) .profile-page :deep(.dark\:bg-dark-700),
:global(.dark) .profile-page :deep(.dark\:bg-gray-700),
:global(.dark) .profile-page :deep(.dark\:bg-gray-800),
:global(.dark) .profile-page :deep(.dark\:bg-slate-900) {
  background-color: rgb(18 18 20) !important;
}

:global(html.dark) .profile-page :deep(.input),
:global(html.dark) .profile-page :deep(input:not([type='checkbox']):not([type='radio']):not([type='range'])),
:global(body.dark) .profile-page :deep(.input),
:global(body.dark) .profile-page :deep(input:not([type='checkbox']):not([type='radio']):not([type='range'])),
:global(.dark) .profile-page :deep(.input),
:global(.dark) .profile-page :deep(input:not([type='checkbox']):not([type='radio']):not([type='range'])) {
  border-color: rgb(63 63 70) !important;
  background: rgb(18 18 20) !important;
  color: rgb(244 244 245) !important;
}

:global(html.dark) .profile-page :deep(.input::placeholder),
:global(html.dark) .profile-page :deep(input::placeholder),
:global(body.dark) .profile-page :deep(.input::placeholder),
:global(body.dark) .profile-page :deep(input::placeholder),
:global(.dark) .profile-page :deep(.input::placeholder),
:global(.dark) .profile-page :deep(input::placeholder) {
  color: rgb(161 161 170) !important;
  opacity: 1;
}

:global(html.dark) .profile-page :deep(.input-label),
:global(html.dark) .profile-page :deep(label),
:global(body.dark) .profile-page :deep(.input-label),
:global(body.dark) .profile-page :deep(label),
:global(.dark) .profile-page :deep(.input-label),
:global(.dark) .profile-page :deep(label) {
  color: rgb(228 228 231) !important;
}

:global(html.dark) .profile-page :deep(.text-gray-900),
:global(html.dark) .profile-page :deep(.text-gray-800),
:global(body.dark) .profile-page :deep(.text-gray-900),
:global(body.dark) .profile-page :deep(.text-gray-800),
:global(.dark) .profile-page :deep(.text-gray-900),
:global(.dark) .profile-page :deep(.text-gray-800) {
  color: rgb(250 250 250) !important;
}

:global(html.dark) .profile-page :deep(.text-gray-700),
:global(html.dark) .profile-page :deep(.text-gray-600),
:global(html.dark) .profile-page :deep(.text-gray-500),
:global(body.dark) .profile-page :deep(.text-gray-700),
:global(body.dark) .profile-page :deep(.text-gray-600),
:global(body.dark) .profile-page :deep(.text-gray-500),
:global(.dark) .profile-page :deep(.text-gray-700),
:global(.dark) .profile-page :deep(.text-gray-600),
:global(.dark) .profile-page :deep(.text-gray-500) {
  color: rgb(212 212 216) !important;
}

@media (min-width: 768px) {
  .profile-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1180px) {
  .profile-grid {
    grid-template-columns: minmax(0, 1.45fr) minmax(360px, 0.85fr);
    align-items: start;
  }
}

:global(.dark .jf-saas-shell) .profile-page.profile-page :is(.profile-hero, .profile-panel, .profile-support) {
  border-color: rgb(39 39 42) !important;
  background: rgb(24 24 27) !important;
  box-shadow: none !important;
}

:global(.dark .jf-saas-shell) .profile-page.profile-page :is(.profile-metric, .profile-soft-card) {
  border-color: rgb(39 39 42) !important;
  background: rgb(9 9 11 / 0.62) !important;
}

:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.card) {
  border-color: rgb(39 39 42) !important;
  background: rgb(24 24 27) !important;
  box-shadow: none !important;
}

:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.bg-white),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.bg-white\/90),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.bg-gray-50),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.bg-gray-50\/80) {
  background-color: rgb(9 9 11 / 0.62) !important;
}

:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(input:not([type='checkbox']):not([type='radio']):not([type='range'])),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.input) {
  border-color: rgb(63 63 70) !important;
  background: rgb(24 24 27) !important;
  color: rgb(244 244 245) !important;
}

:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(h1),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(h2),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(h3),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(h4),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.profile-section-title),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-gray-950),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-gray-900),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-gray-800),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-gray-700),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.dark\:text-white),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.dark\:text-dark-50),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.dark\:text-dark-100),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.dark\:text-dark-200) {
  color: rgb(250 250 250) !important;
}

:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.profile-section-copy),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-gray-600),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-gray-500),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-gray-400),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-slate-600),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-slate-500),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-slate-400),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.dark\:text-gray-300),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.dark\:text-gray-400),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.dark\:text-dark-300),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.dark\:text-dark-400),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.dark\:text-dark-500) {
  color: rgb(203 213 225) !important;
}

:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.input-label),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(label),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.input-hint) {
  color: rgb(241 245 249) !important;
}

:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.profile-badge),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.badge) {
  color: rgb(153 246 228) !important;
}

:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-primary-500),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-primary-600),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.dark\:text-primary-300) {
  color: rgb(94 234 212) !important;
}

:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-blue-600),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.dark\:text-blue-300) {
  color: rgb(147 197 253) !important;
}

:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.text-purple-600),
:global(.dark .jf-saas-shell) .profile-page.profile-page :deep(.dark\:text-purple-300) {
  color: rgb(216 180 254) !important;
}
</style>
