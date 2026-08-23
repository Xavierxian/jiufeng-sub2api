<template>
  <header class="jf-public-header">
    <div class="jf-public-header__inner">
      <RouterLink to="/home" class="jf-public-brand" :aria-label="`${siteName} home`">
        <span class="jf-public-brand__mark">
          <img v-if="siteLogo" :src="siteLogo" alt="" />
          <strong v-else aria-hidden="true">JF</strong>
        </span>
        <span class="jf-public-brand__name">{{ siteName }}</span>
      </RouterLink>

      <div class="jf-public-header__actions">
        <slot name="actions"></slot>
        <LocaleSwitcher />
        <button
          type="button"
          class="jf-public-icon-button"
          :title="isDark ? t('home.switchToLight') : t('home.switchToDark')"
          @click="toggleTheme"
        >
          <Icon :name="isDark ? 'sun' : 'moon'" size="md" />
        </button>
        <RouterLink v-if="showLogin" to="/login" class="jf-public-login">
          {{ t('home.login') }}
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { sanitizeUrl } from '@/utils/url'

withDefaults(defineProps<{ showLogin?: boolean }>(), {
  showLogin: true,
})

const { t } = useI18n()
const appStore = useAppStore()
const isDark = ref(document.documentElement.classList.contains('dark'))

const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Jiufeng')
const siteLogo = computed(() => sanitizeUrl(
  appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '',
  { allowRelative: true, allowDataUrl: true },
))

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  if (!appStore.publicSettingsLoaded) void appStore.fetchPublicSettings()
})
</script>

<style scoped>
.jf-public-header {
  position: relative;
  z-index: 30;
  border-bottom: 1px solid #e6eaf0;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(14px);
}

.jf-public-header__inner {
  display: flex;
  min-height: 58px;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 20px;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.jf-public-brand,
.jf-public-header__actions {
  display: flex;
  align-items: center;
}

.jf-public-brand {
  min-width: 0;
  gap: 10px;
  color: #172033;
}

.jf-public-brand__mark {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(14, 159, 140, 0.2);
  border-radius: 8px;
  background: #e7f7f4;
  color: #087f70;
}

.jf-public-brand__mark img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.jf-public-brand__name {
  overflow: hidden;
  font-size: 15px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jf-public-header__actions {
  flex: 0 0 auto;
  gap: 8px;
}

.jf-public-icon-button {
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #667085;
}

.jf-public-icon-button:hover {
  background: #f2f5f8;
  color: #172033;
}

.jf-public-login {
  display: inline-flex;
  min-height: 36px;
  padding: 0 14px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #0e9f8c;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
}

.jf-public-login:hover {
  background: #087f70;
}

:global(.dark .jf-public-header) {
  border-color: #2a2a30;
  background: rgba(18, 18, 20, 0.95);
}

:global(.dark .jf-public-brand) {
  color: #f3f4f6;
}

:global(.dark .jf-public-brand__mark) {
  border-color: rgba(32, 199, 179, 0.24);
  background: rgba(32, 199, 179, 0.14);
  color: #5eead4;
}

:global(.dark .jf-public-icon-button) {
  color: #b4b4b8;
}

:global(.dark .jf-public-icon-button:hover) {
  background: #1f1f23;
  color: #fff;
}

@media (max-width: 520px) {
  .jf-public-header__inner {
    padding-inline: 14px;
  }

  .jf-public-brand__name,
  .jf-public-login {
    display: none;
  }
}
</style>
