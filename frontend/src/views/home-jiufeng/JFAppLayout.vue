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
import './jf-saas.css'
import './jf-studio.css'
import './jiufeng-overlays.css'
import { onMounted, ref, watch } from 'vue'
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

onMounted(() => {
  loadLibredeskWidget()
})
</script>
