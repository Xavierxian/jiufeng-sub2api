<template>
  <div ref="shellRef" class="jf-saas-shell jf-cloud-shell jf-studio">
    <div class="jf-cloud-chrome">
      <JFAppHeader />
      <JFAppSidebar />
    </div>

    <main class="jf-saas-main jf-cloud-main">
      <JFWorkspaceHeading />
      <div class="jf-cloud-page-frame">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import '@/styles/onboarding.css'
import './jf-saas.css'
import './jf-studio.css'
import { computed, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingTour } from '@/composables/useOnboardingTour'
import { useOnboardingStore } from '@/stores/onboarding'
import JFAppHeader from './JFAppHeader.vue'
import JFAppSidebar from './JFAppSidebar.vue'
import { loadLibredeskWidget } from './libredeskWidget'
import JFWorkspaceHeading from './JFWorkspaceHeading.vue'
import { refreshJiufengCharts } from './chartTheme'
import { isJiufengDark } from './theme'

const shellRef = ref<HTMLElement | null>(null)
watch(isJiufengDark, () => {
  if (shellRef.value) refreshJiufengCharts(shellRef.value)
}, { flush: 'post' })

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

const { replayTour } = useOnboardingTour({
  storageKey: isAdmin.value ? 'admin_guide' : 'user_guide',
  autoStart: true
})

const onboardingStore = useOnboardingStore()

onMounted(() => {
  loadLibredeskWidget()
  onboardingStore.setReplayCallback(replayTour)
})

defineExpose({ replayTour })
</script>
