<template>
  <div
    ref="layoutRef"
    class="table-page-layout jf-table-page-layout"
    :class="{ 'mobile-mode': isMobile, 'jf-table-page-layout--mobile': isMobile }"
    :style="layoutStyle"
  >
    <div v-if="$slots.actions" class="layout-section-fixed jf-table-page-layout__section">
      <slot name="actions" />
    </div>

    <div v-if="$slots.filters" class="layout-section-fixed jf-table-page-layout__section">
      <slot name="filters" />
    </div>

    <div class="layout-section-scrollable jf-table-page-layout__scrollable">
      <div class="card table-scroll-container jf-table-scroll-container">
        <slot name="table" />
      </div>
    </div>

    <div v-if="$slots.pagination" class="layout-section-fixed jf-table-page-layout__section">
      <slot name="pagination" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const isMobile = ref(false)
const layoutRef = ref<HTMLElement | null>(null)
const measuredHeight = ref<number | null>(null)
let frameId: number | null = null
let layoutObserver: ResizeObserver | null = null

const MIN_DESKTOP_HEIGHT = 420
const DESKTOP_BOTTOM_GAP = 22

function checkMobile() {
  isMobile.value = window.innerWidth < 1024
}

function updateMeasuredHeight() {
  if (!layoutRef.value || isMobile.value) {
    measuredHeight.value = null
    return
  }

  const top = layoutRef.value.getBoundingClientRect().top
  measuredHeight.value = Math.max(
    MIN_DESKTOP_HEIGHT,
    Math.floor(window.innerHeight - top - DESKTOP_BOTTOM_GAP)
  )
}

function scheduleMeasure() {
  if (frameId !== null) {
    cancelAnimationFrame(frameId)
  }
  frameId = requestAnimationFrame(() => {
    frameId = null
    updateMeasuredHeight()
  })
}

const layoutStyle = computed(() => {
  if (isMobile.value || measuredHeight.value === null) return undefined
  return { '--jf-table-page-height': `${measuredHeight.value}px` }
})

onMounted(() => {
  checkMobile()
  scheduleMeasure()
  window.addEventListener('resize', checkMobile)
  window.addEventListener('resize', scheduleMeasure)
  window.visualViewport?.addEventListener('resize', scheduleMeasure)

  if (typeof ResizeObserver !== 'undefined') {
    layoutObserver = new ResizeObserver(scheduleMeasure)
    const chrome = document.querySelector('.jf-cloud-chrome')
    const frame = layoutRef.value?.parentElement
    if (chrome) layoutObserver.observe(chrome)
    if (frame) layoutObserver.observe(frame)
  }
})

onUnmounted(() => {
  if (frameId !== null) {
    cancelAnimationFrame(frameId)
    frameId = null
  }
  layoutObserver?.disconnect()
  layoutObserver = null
  window.removeEventListener('resize', checkMobile)
  window.removeEventListener('resize', scheduleMeasure)
  window.visualViewport?.removeEventListener('resize', scheduleMeasure)
})
</script>

<style scoped>
.jf-table-page-layout {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  height: auto;
  max-height: none;
}

@media (min-width: 1024px) {
  .jf-table-page-layout {
    height: var(--jf-table-page-height, calc(100dvh - 230px));
    min-height: 0;
    max-height: var(--jf-table-page-height, calc(100dvh - 230px));
  }
}

.jf-table-page-layout__section {
  flex-shrink: 0;
}

.jf-table-page-layout__scrollable {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
}

.jf-table-page-layout__section :deep(.card),
.jf-table-page-layout__section :deep(.glass-card),
.jf-table-page-layout__section :deep(.card-glass) {
  border-radius: 10px;
}

.jf-table-page-layout__section :deep(.flex) {
  min-width: 0;
}

.jf-table-scroll-container {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}

.jf-table-scroll-container :deep(.table-wrapper) {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  scrollbar-gutter: stable;
}

.jf-table-scroll-container :deep(table) {
  width: 100%;
  min-width: max-content;
  border-collapse: separate;
  border-spacing: 0;
}

.jf-table-scroll-container :deep(thead) {
  position: sticky;
  top: 0;
  z-index: 1;
}

.jf-table-scroll-container :deep(th) {
  padding: 10px 14px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
}

.jf-table-scroll-container :deep(td) {
  height: 44px;
  padding: 8px 14px;
  font-size: 13px;
  line-height: 1.35;
}

.jf-table-page-layout--mobile {
  height: auto;
  min-height: 0;
}

.jf-table-page-layout--mobile .jf-table-scroll-container {
  height: auto;
  overflow: visible;
}

.jf-table-page-layout--mobile .jf-table-page-layout__scrollable {
  flex: none;
}

.jf-table-page-layout--mobile .jf-table-scroll-container :deep(.table-wrapper) {
  overflow-x: auto;
  overflow-y: visible;
}
</style>
