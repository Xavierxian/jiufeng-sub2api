<template>
  <div class="jf-callback-page">
    <JFPublicHeader :show-login="false" />
    <main class="jf-callback-main">
      <section class="jf-callback-context" aria-hidden="true">
        <p>{{ copy.kicker }}</p>
        <h1>{{ copy.title }}</h1>
        <span>{{ copy.description }}</span>
        <div class="jf-callback-status">
          <i></i>
          {{ copy.status }}
        </div>
      </section>
      <section class="jf-callback-card">
        <slot />
      </section>
    </main>
    <footer class="jf-callback-footer">&copy; {{ currentYear }} {{ siteName }}</footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import JFPublicHeader from './JFPublicHeader.vue'

const { locale } = useI18n()
const appStore = useAppStore()
const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Jiufeng')
const currentYear = new Date().getFullYear()
const copy = computed(() => locale.value.startsWith('zh')
  ? {
      kicker: 'SECURE AUTHENTICATION',
      title: '正在完成安全验证',
      description: '验证完成后将自动返回控制台，请勿关闭当前页面。',
      status: '加密连接已建立',
    }
  : {
      kicker: 'SECURE AUTHENTICATION',
      title: 'Completing secure sign-in',
      description: 'You will return to the console automatically when verification is complete.',
      status: 'Encrypted connection established',
    })
</script>

<style scoped>
.jf-callback-page {
  min-height: 100vh;
  background: #f6f8fb;
  color: #172033;
}

.jf-callback-main {
  display: grid;
  width: min(980px, calc(100% - 40px));
  min-height: calc(100vh - 150px);
  margin: 0 auto;
  grid-template-columns: minmax(0, 0.9fr) minmax(380px, 1.1fr);
  align-items: center;
  gap: 72px;
  padding: 48px 0;
}

.jf-callback-context p {
  margin: 0 0 14px;
  color: #0e9f8c;
  font-size: 12px;
  font-weight: 800;
}

.jf-callback-context h1 {
  max-width: 430px;
  margin: 0;
  color: #101828;
  font-size: 38px;
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: 0;
}

.jf-callback-context > span {
  display: block;
  max-width: 430px;
  margin-top: 18px;
  color: #667085;
  font-size: 15px;
  line-height: 1.75;
}

.jf-callback-status {
  display: flex;
  margin-top: 28px;
  align-items: center;
  gap: 9px;
  color: #475467;
  font-size: 13px;
}

.jf-callback-status i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #039855;
  box-shadow: 0 0 0 4px rgba(3, 152, 85, 0.12);
}

.jf-callback-card {
  min-width: 0;
  padding: 30px;
  border: 1px solid #e6eaf0;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(16, 24, 40, 0.08);
}

.jf-callback-card :deep(.rounded-xl),
.jf-callback-card :deep(.rounded-lg) {
  border-radius: 6px !important;
}

.jf-callback-card :deep(.card) {
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.jf-callback-card :deep(.btn),
.jf-callback-card :deep(.input) {
  border-radius: 6px !important;
}

.jf-callback-footer {
  padding: 0 20px 26px;
  color: #98a2b3;
  font-size: 12px;
  text-align: center;
}

:global(.dark .jf-callback-page) {
  background: #0b0b0d;
  color: #f3f4f6;
}

:global(.dark .jf-callback-context h1) {
  color: #f3f4f6;
}

:global(.dark .jf-callback-context > span),
:global(.dark .jf-callback-status) {
  color: #b4b4b8;
}

:global(.dark .jf-callback-card) {
  border-color: #2a2a30;
  background: #121214;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
}

@media (max-width: 820px) {
  .jf-callback-main {
    width: min(520px, calc(100% - 28px));
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 36px 0;
  }

  .jf-callback-context {
    text-align: center;
  }

  .jf-callback-context h1,
  .jf-callback-context > span {
    margin-inline: auto;
  }

  .jf-callback-context h1 {
    font-size: 28px;
  }

  .jf-callback-status {
    justify-content: center;
  }
}

@media (max-width: 520px) {
  .jf-callback-context {
    display: none;
  }

  .jf-callback-main {
    min-height: calc(100vh - 112px);
    padding: 18px 0;
  }

  .jf-callback-card {
    padding: 22px 18px;
  }
}
</style>
