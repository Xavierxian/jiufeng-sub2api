<template>
  <GroupsView v-if="showSimpleGroups" />
  <DashboardOverview v-else />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { resolveRouteDocumentTitle } from '@/router/title'
import { isJiufengSimpleGroupsRoute, jiufengNavigationTarget } from '../navigation'

const GroupsView = defineAsyncComponent(() => import('./GroupsView.vue'))
const DashboardOverview = defineAsyncComponent(() => import('./DashboardOverview.vue'))
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()
const { t } = useI18n()
const showSimpleGroups = computed(() => isJiufengSimpleGroupsRoute(route, authStore))

watchEffect(() => {
  // The shared guard redirects old /admin/groups bookmarks here in simple
  // mode. Preserve their destination using the same admin-protected view.
  if (showSimpleGroups.value && route.query.view !== 'groups') {
    void router.replace(jiufengNavigationTarget('/admin/groups', authStore))
  }
  document.title = showSimpleGroups.value
    ? `${t('admin.groups.title')} - ${appStore.siteName}`
    : resolveRouteDocumentTitle(route, appStore.siteName, [])
})
</script>
