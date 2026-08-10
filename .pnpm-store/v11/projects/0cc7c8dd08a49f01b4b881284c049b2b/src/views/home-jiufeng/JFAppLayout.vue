<template>
  <div class="jf-saas-shell jf-cloud-shell">
    <div class="jf-cloud-chrome">
      <JFAppHeader />
      <JFAppSidebar />
    </div>

    <main class="jf-saas-main jf-cloud-main">
      <div class="jf-cloud-page-frame">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import '@/styles/onboarding.css'
import './jf-saas.css'
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingTour } from '@/composables/useOnboardingTour'
import { useOnboardingStore } from '@/stores/onboarding'
import JFAppHeader from './JFAppHeader.vue'
import JFAppSidebar from './JFAppSidebar.vue'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

const { replayTour } = useOnboardingTour({
  storageKey: isAdmin.value ? 'admin_guide' : 'user_guide',
  autoStart: true
})

const onboardingStore = useOnboardingStore()

onMounted(() => {
  onboardingStore.setReplayCallback(replayTour)
})

defineExpose({ replayTour })
</script>
