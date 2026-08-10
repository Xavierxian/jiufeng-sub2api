<template>
  <div class="jf-not-found">
    <JFPublicHeader :show-login="false" />
    <main>
      <section class="jf-not-found__copy">
        <p>ERROR 404</p>
        <h1>{{ t('errors.pageNotFound') }}</h1>
        <span>{{ description }}</span>
        <div class="jf-not-found__actions">
          <button type="button" class="jf-button jf-button--secondary" @click="goBack">
            <Icon name="arrowLeft" size="md" />
            {{ backLabel }}
          </button>
          <RouterLink to="/dashboard" class="jf-button jf-button--primary">
            <Icon name="home" size="md" />
            {{ dashboardLabel }}
          </RouterLink>
        </div>
        <a v-if="supportUrl" :href="supportUrl" target="_blank" rel="noopener noreferrer" class="jf-not-found__support">
          {{ supportLabel }}
          <Icon name="externalLink" size="sm" />
        </a>
      </section>

      <div class="jf-not-found__code" aria-hidden="true">
        <strong>404</strong>
        <span></span>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores'
import Icon from '@/components/icons/Icon.vue'
import { sanitizeUrl } from '@/utils/url'
import JFPublicHeader from '@/views/home-jiufeng/JFPublicHeader.vue'

const { t, locale } = useI18n()
const router = useRouter()
const appStore = useAppStore()
const isZh = computed(() => locale.value.startsWith('zh'))
const description = computed(() => isZh.value
  ? '你访问的页面不存在、已被移动，或当前账号无权查看。'
  : 'The page does not exist, has moved, or is unavailable to this account.')
const backLabel = computed(() => isZh.value ? '返回上一页' : 'Go back')
const dashboardLabel = computed(() => isZh.value ? '进入控制台' : 'Open dashboard')
const supportLabel = computed(() => isZh.value ? '联系支持' : 'Contact support')
const supportUrl = computed(() => sanitizeUrl(
  appStore.cachedPublicSettings?.doc_url || '',
))

function goBack(): void {
  if (window.history.length > 1) router.back()
  else void router.replace('/home')
}
</script>

<style scoped>
.jf-not-found {
  min-height: 100vh;
  background: #f6f8fb;
  color: #172033;
}

.jf-not-found main {
  display: grid;
  width: min(980px, calc(100% - 40px));
  min-height: calc(100vh - 58px);
  margin: 0 auto;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 0.8fr);
  align-items: center;
  gap: 70px;
  padding: 64px 0;
}

.jf-not-found__copy > p {
  margin: 0 0 14px;
  color: #0e9f8c;
  font-size: 12px;
  font-weight: 800;
}

.jf-not-found h1 {
  margin: 0;
  color: #101828;
  font-size: 42px;
  font-weight: 800;
  line-height: 1.18;
  letter-spacing: 0;
}

.jf-not-found__copy > span {
  display: block;
  max-width: 540px;
  margin-top: 18px;
  color: #667085;
  font-size: 15px;
  line-height: 1.75;
}

.jf-not-found__actions {
  display: flex;
  margin-top: 30px;
  flex-wrap: wrap;
  gap: 10px;
}

.jf-button {
  display: inline-flex;
  min-height: 42px;
  padding: 0 16px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 700;
}

.jf-button--primary {
  background: #0e9f8c;
  color: #fff;
}

.jf-button--primary:hover {
  background: #087f70;
}

.jf-button--secondary {
  border-color: #d6dde7;
  background: #fff;
  color: #344054;
}

.jf-button--secondary:hover {
  background: #f2f5f8;
}

.jf-not-found__support {
  display: inline-flex;
  margin-top: 24px;
  align-items: center;
  gap: 6px;
  color: #087f70;
  font-size: 13px;
  font-weight: 700;
}

.jf-not-found__code {
  position: relative;
  display: flex;
  min-height: 270px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #e6eaf0;
  border-radius: 8px;
  background: #fff;
}

.jf-not-found__code strong {
  position: relative;
  z-index: 1;
  color: #d6dde7;
  font-size: 96px;
  font-weight: 800;
  letter-spacing: 0;
}

.jf-not-found__code span {
  position: absolute;
  width: 150%;
  height: 2px;
  background: #0e9f8c;
  transform: rotate(-14deg);
}

:global(.dark .jf-not-found) {
  background: #0b0b0d;
  color: #f3f4f6;
}

:global(.dark .jf-not-found h1) {
  color: #f3f4f6;
}

:global(.dark .jf-not-found__copy > span) {
  color: #b4b4b8;
}

:global(.dark .jf-button--secondary),
:global(.dark .jf-not-found__code) {
  border-color: #2a2a30;
  background: #121214;
  color: #e4e4e7;
}

:global(.dark .jf-button--secondary:hover) {
  background: #1f1f23;
}

:global(.dark .jf-not-found__code strong) {
  color: #2a2a30;
}

@media (max-width: 760px) {
  .jf-not-found main {
    width: min(560px, calc(100% - 28px));
    grid-template-columns: 1fr;
    gap: 34px;
    padding: 44px 0;
  }

  .jf-not-found h1 {
    font-size: 32px;
  }

  .jf-not-found__code {
    min-height: 180px;
  }

  .jf-not-found__code strong {
    font-size: 72px;
  }
}
</style>
