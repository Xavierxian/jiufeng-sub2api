<template>
  <section v-if="showHeading && title" class="jf-workspace-heading" aria-labelledby="jf-workspace-heading-title">
    <div class="jf-workspace-heading__copy">
      <p class="jf-workspace-heading__eyebrow">
        <span>JIUFENG</span><span aria-hidden="true">/</span>
        <span>{{ isAdminPage ? (isZh ? '管理工作台' : 'ADMIN WORKSPACE') : (isZh ? '我的工作台' : 'MY WORKSPACE') }}</span>
      </p>
      <h1 id="jf-workspace-heading-title" class="jf-workspace-heading__title">{{ title }}</h1>
      <p v-if="description" class="jf-workspace-heading__description">{{ description }}</p>
    </div>
    <div class="jf-workspace-heading__signature" aria-hidden="true">
      <span>Jiufeng</span><small>{{ isZh ? '让智能，触手可及。' : 'Intelligence, within reach.' }}</small>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { resolveRouteMetaKeys } from '@/router/title'
import { resolveSiteBillingMode } from '@/utils/siteBillingMode'

const route = useRoute()
const { t, te, locale } = useI18n()
const appStore = useAppStore()
const isZh = computed(() => locale.value.startsWith('zh'))
const isAdminPage = computed(() => route.path.startsWith('/admin'))
const isGroupsAlias = computed(() => route.path === '/admin/dashboard' && route.query.view === 'groups')
const routesWithOwnHero = new Set([
  '/admin/ops',
  '/admin/channels/monitor',
  '/admin/risk-control',
  '/profile',
])
const channelStatusHasOwnHero = computed(() =>
  route.path === '/monitor' && appStore.cachedPublicSettings?.channel_monitor_mode !== 'v1',
)
const showHeading = computed(() =>
  !routesWithOwnHero.has(route.path) && !channelStatusHasOwnHero.value,
)
const resolvedMeta = computed(() => resolveRouteMetaKeys(route, {
  billingMode: resolveSiteBillingMode(appStore.cachedPublicSettings),
}))
const customMenuLabel = computed(() => {
  if (route.name !== 'CustomPage' || typeof route.params.id !== 'string') return ''
  return appStore.cachedPublicSettings?.custom_menu_items
    ?.find(item => item.id === route.params.id)?.label?.trim() || ''
})
const title = computed(() => {
  if (customMenuLabel.value) return customMenuLabel.value
  const key = isGroupsAlias.value ? 'admin.groups.title' : resolvedMeta.value.titleKey
  return typeof key === 'string' && te(key) ? t(key) : String(route.meta.title || '')
})
const description = computed(() => {
  if (customMenuLabel.value) return ''
  const key = isGroupsAlias.value ? 'admin.groups.description' : resolvedMeta.value.descriptionKey
  return typeof key === 'string' && te(key) ? t(key) : ''
})
</script>
