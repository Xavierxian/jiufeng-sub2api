<template>
  <section
    v-if="sourceHints.length"
    class="profile-panel dark:!border-zinc-800 dark:!bg-zinc-900 dark:!shadow-none"
    data-testid="profile-sources"
  >
    <h2 class="text-base font-semibold text-gray-950 dark:text-white">
      {{ t('profile.linkedProfileSources') }}
    </h2>
    <p class="mt-1 text-sm text-gray-500 dark:text-zinc-200">
      {{ t('profile.linkedProfileSourcesDescription') }}
    </p>
    <ul class="mt-4 space-y-3">
      <li
        v-for="hint in sourceHints"
        :key="hint.key"
        class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300"
      >
        <Icon name="link" size="sm" class="mt-0.5 shrink-0 text-primary-500" />
        <span class="min-w-0 break-words">{{ hint.text }}</span>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@/components/icons'
import type { User, UserAuthProvider, UserProfileSourceContext } from '@/types'

const props = withDefaults(defineProps<{
  user: User | null
  oidcProviderName?: string
}>(), { oidcProviderName: 'OIDC' })

const { t } = useI18n()
const providerLabels = computed<Record<UserAuthProvider, string>>(() => ({
  email: t('profile.authBindings.providers.email'),
  linuxdo: t('profile.authBindings.providers.linuxdo'),
  dingtalk: t('profile.authBindings.providers.dingtalk'),
  oidc: t('profile.authBindings.providers.oidc', { providerName: props.oidcProviderName }),
  wechat: t('profile.authBindings.providers.wechat'),
  github: 'GitHub',
  google: 'Google'
}))

function normalizeProvider(value: string): UserAuthProvider | null {
  const normalized = value.trim().toLowerCase()
  if (
    normalized === 'email' || normalized === 'linuxdo' || normalized === 'dingtalk' ||
    normalized === 'wechat' || normalized === 'github' || normalized === 'google'
  ) {
    return normalized
  }
  if (normalized === 'oidc' || normalized.startsWith('oidc:') || normalized.startsWith('oidc/')) {
    return 'oidc'
  }
  return null
}

function readObjectString(source: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function resolveThirdPartySource(
  rawSource: string | UserProfileSourceContext | null | undefined
): string | null {
  if (!rawSource) return null
  if (typeof rawSource === 'string') {
    const provider = normalizeProvider(rawSource)
    return provider && provider !== 'email' ? providerLabels.value[provider] : null
  }
  const source = rawSource as Record<string, unknown>
  const provider = normalizeProvider(readObjectString(source, 'provider', 'source', 'provider_type', 'auth_provider'))
  if (!provider || provider === 'email') return null
  return readObjectString(source, 'provider_label', 'label', 'provider_name', 'providerName') || providerLabels.value[provider]
}

const sourceHints = computed(() => {
  const user = props.user
  if (!user) return []
  const avatarSource = resolveThirdPartySource(user.profile_sources?.avatar ?? user.avatar_source)
  const usernameSource = resolveThirdPartySource(
    user.profile_sources?.username ?? user.profile_sources?.display_name ?? user.profile_sources?.nickname ??
    user.display_name_source ?? user.username_source ?? user.nickname_source
  )
  const hints: Array<{ key: string; text: string }> = []
  if (avatarSource) {
    hints.push({ key: 'avatar', text: t('profile.authBindings.source.avatar', { providerName: avatarSource }) })
  }
  if (usernameSource) {
    hints.push({ key: 'username', text: t('profile.authBindings.source.username', { providerName: usernameSource }) })
  }
  return hints
})
</script>
