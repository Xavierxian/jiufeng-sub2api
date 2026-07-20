<template>
  <div class="jf-ops-dashboard">
    <OpsDashboard />
  </div>
</template>

<script setup lang="ts">
import OpsDashboard from './admin/ops/OpsDashboard.vue'
</script>

<style scoped>
.jf-ops-dashboard {
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
  max-width: 100%;
}

@media (max-width: 640px) {
  :global(.jf-cloud-main:has(.jf-ops-dashboard)) {
    overflow-x: visible;
    padding-right: 8px;
    padding-left: 8px;
  }

  :global(.jf-cloud-page-frame:has(.jf-ops-dashboard)) {
    width: 100%;
    max-width: 100%;
    overflow-x: visible;
  }

  .jf-ops-dashboard {
    width: 100%;
    max-width: 100%;
    overflow-x: visible;
  }

  .jf-ops-dashboard :deep(*) {
    box-sizing: border-box;
  }

  .jf-ops-dashboard :deep(.rounded-3xl) {
    border-radius: 16px;
  }

  .jf-ops-dashboard :deep(.space-y-6) {
    min-width: 0;
    width: 100%;
    max-width: 100%;
  }

  .jf-ops-dashboard :deep(.grid) {
    min-width: 0;
    width: 100%;
    max-width: 100%;
    grid-template-columns: minmax(0, 1fr) !important;
  }

  .jf-ops-dashboard :deep(.lg\:grid-cols-12),
  .jf-ops-dashboard :deep(.lg\:grid-cols-4),
  .jf-ops-dashboard :deep(.md\:grid-cols-3),
  .jf-ops-dashboard :deep(.grid-cols-2) {
    grid-template-columns: minmax(0, 1fr) !important;
  }

  .jf-ops-dashboard :deep(.rounded-2xl),
  .jf-ops-dashboard :deep(.rounded-xl) {
    min-width: 0;
    width: 100%;
    max-width: 100%;
  }

  .jf-ops-dashboard :deep(.bg-white),
  .jf-ops-dashboard :deep(.bg-gray-50),
  .jf-ops-dashboard :deep(.dark\:bg-dark-800),
  .jf-ops-dashboard :deep(.dark\:bg-dark-900) {
    max-width: 100%;
  }

  .jf-ops-dashboard :deep(.p-6) {
    padding: 16px;
  }

  .jf-ops-dashboard :deep(.p-4) {
    padding: 12px;
  }

  .jf-ops-dashboard :deep(.gap-6) {
    gap: 14px;
  }

  .jf-ops-dashboard :deep(.gap-4) {
    gap: 12px;
  }

  .jf-ops-dashboard :deep(.w-72) {
    display: none;
  }

  .jf-ops-dashboard :deep(.text-3xl) {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .jf-ops-dashboard :deep(.text-xl) {
    font-size: 1.125rem;
    line-height: 1.65rem;
  }

  .jf-ops-dashboard :deep(.whitespace-nowrap) {
    white-space: normal;
  }

  .jf-ops-dashboard :deep(.justify-between) {
    gap: 8px;
  }

  .jf-ops-dashboard :deep(.flex) {
    min-width: 0;
  }

  .jf-ops-dashboard :deep(.flex-wrap) {
    width: 100%;
  }

  .jf-ops-dashboard :deep(.items-center.justify-between) {
    flex-wrap: wrap;
  }

  .jf-ops-dashboard :deep(svg),
  .jf-ops-dashboard :deep(canvas) {
    max-width: 100%;
  }

  .jf-ops-dashboard :deep([style*="order"]) {
    width: 100%;
    max-width: 100%;
  }

  .jf-ops-dashboard :deep(.h-\[360px\]) {
    height: 320px;
  }
}
</style>
