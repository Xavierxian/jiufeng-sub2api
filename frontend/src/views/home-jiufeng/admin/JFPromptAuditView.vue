<template>
  <JFAppLayout>
    <section class="jf-prompt-audit">
      <PromptAuditView />
    </section>
  </JFAppLayout>
</template>

<script setup lang="ts">
import PromptAuditView from '@/features/prompt-audit/PromptAuditView.vue'
import JFAppLayout from '@/views/home-jiufeng/JFAppLayout.vue'
</script>

<style scoped>
.jf-prompt-audit {
  min-width: 0;
}

/* The shared feature owns an AppLayout. Flatten only that nested shell so the
   Jiufeng chrome above remains the single visible application frame. */
.jf-prompt-audit :deep(.min-h-screen.bg-gray-50),
.jf-prompt-audit :deep(.min-h-screen.bg-gray-50 > .relative.min-h-screen),
.jf-prompt-audit :deep(.min-h-screen.bg-gray-50 > .relative.min-h-screen > main) {
  display: contents;
}

.jf-prompt-audit :deep(.min-h-screen.bg-gray-50 > .pointer-events-none),
.jf-prompt-audit :deep(.min-h-screen.bg-gray-50 > .sidebar),
.jf-prompt-audit :deep(header) {
  display: none !important;
}

.jf-prompt-audit :deep([role='tablist']) {
  margin-bottom: 12px !important;
}

.jf-prompt-audit :deep(.tabs) {
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--jf-border);
  border-radius: 8px !important;
  background: var(--jf-panel-muted) !important;
  box-shadow: none !important;
}

.jf-prompt-audit :deep(.tab) {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 6px !important;
  color: var(--jf-text-muted);
  font-size: 13px;
  font-weight: 650;
}

.jf-prompt-audit :deep(.tab-active) {
  color: var(--jf-primary) !important;
  background: var(--jf-panel) !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.08) !important;
}

.jf-prompt-audit :deep(main.card) {
  overflow: hidden;
  padding: 0 18px !important;
  border: 1px solid var(--jf-border) !important;
  border-radius: 8px !important;
  background: var(--jf-panel) !important;
}

.jf-prompt-audit :deep(.py-6) {
  padding-top: 18px !important;
  padding-bottom: 18px !important;
}

.jf-prompt-audit :deep([class~='rounded-xl']) {
  border-radius: 7px !important;
}

.jf-prompt-audit :deep([class~='rounded-lg']) {
  border-radius: 6px !important;
}

.jf-prompt-audit :deep(input:not([type='checkbox']):not([type='radio'])),
.jf-prompt-audit :deep(select),
.jf-prompt-audit :deep(textarea) {
  border-color: var(--jf-border) !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}

.jf-prompt-audit :deep(input:not([type='checkbox']):not([type='radio'])),
.jf-prompt-audit :deep(select) {
  min-height: 38px;
}

.jf-prompt-audit :deep(table thead) {
  background: var(--jf-panel-muted) !important;
}

.jf-prompt-audit :deep(table th) {
  height: 38px !important;
  color: var(--jf-text-muted) !important;
  font-size: 12px !important;
  font-weight: 650;
}

.jf-prompt-audit :deep(table td) {
  height: 42px !important;
}

.jf-prompt-audit :deep(.fixed.inset-x-0.bottom-0) {
  left: 0 !important;
  border-color: var(--jf-border) !important;
  background: color-mix(in srgb, var(--jf-panel) 94%, transparent) !important;
  box-shadow: 0 -8px 24px rgba(15, 23, 42, 0.08) !important;
}

:global(.dark) .jf-prompt-audit :deep(.tab-active) {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.28) !important;
}

@media (max-width: 640px) {
  .jf-prompt-audit :deep(main.card) {
    padding: 0 12px !important;
  }

  .jf-prompt-audit :deep(.tab) {
    padding: 0 12px;
  }
}
</style>
