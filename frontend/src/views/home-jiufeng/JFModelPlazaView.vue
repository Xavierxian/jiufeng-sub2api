<template>
  <JFAppLayout v-if="isEmbedded">
    <div class="jf-model-plaza">
      <ModelPlazaContent
        :response="data"
        :loading="loading"
        :error="loadFailed"
        variant="jiufeng"
        embedded
      />
    </div>
  </JFAppLayout>

  <div v-else class="jf-model-plaza-shell">
    <JFPublicHeader :show-login="!authStore.isAuthenticated">
      <template #actions>
        <RouterLink
          v-if="authStore.isAuthenticated"
          :to="backTarget"
          class="jf-plaza-back"
        >
          {{ t('modelPlaza.nav.backToDashboard') }}
        </RouterLink>
      </template>
    </JFPublicHeader>
    <main class="jf-model-plaza-public-main">
      <div class="jf-model-plaza">
        <ModelPlazaContent
          :response="data"
          :loading="loading"
          :error="loadFailed"
          variant="jiufeng"
        />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import JFAppLayout from '@/views/home-jiufeng/JFAppLayout.vue'
import JFPublicHeader from '@/views/home-jiufeng/JFPublicHeader.vue'
import ModelPlazaContent from '@/components/modelPlaza/ModelPlazaContent.vue'
import { getModelPlaza, type ModelPlazaResponse } from '@/api/modelPlaza'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()
const isEmbedded = computed(() => route.query.embedded === '1' && authStore.isAuthenticated)
const backTarget = computed(() => authStore.isAdmin ? '/admin/dashboard' : '/dashboard')
const data = ref<ModelPlazaResponse | null>(null)
const loading = ref(true)
const loadFailed = ref(false)

onMounted(async () => {
  void appStore.fetchPublicSettings()
  try {
    data.value = await getModelPlaza()
  } catch {
    loadFailed.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.jf-model-plaza-shell,
.jf-model-plaza {
  --jf-bg: #f3f6fa;
  --jf-panel: #ffffff;
  --jf-panel-muted: #f7f9fc;
  --jf-border: #dfe6ef;
  --jf-border-strong: #cbd5e1;
  --jf-text: #172033;
  --jf-text-muted: #667085;
  --jf-text-soft: #98a2b3;
  --jf-primary: #0e9f8c;
  --jf-primary-strong: #087f70;
  --jf-primary-soft: #e7f7f4;
  --jf-danger: #d92d20;
}

.jf-model-plaza-shell {
  min-height: 100vh;
  background: var(--jf-bg);
  color: var(--jf-text);
}

.jf-model-plaza-public-main {
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 22px;
}

:global(.dark .jf-model-plaza-shell),
:global(.dark .jf-model-plaza) {
  --jf-bg: #101114;
  --jf-panel: #17181c;
  --jf-panel-muted: #202127;
  --jf-border: #2f323a;
  --jf-border-strong: #424650;
  --jf-text: #f3f4f6;
  --jf-text-muted: #b4b4b8;
  --jf-text-soft: #7f7f86;
  --jf-primary: #20c7b3;
  --jf-primary-strong: #5eead4;
  --jf-primary-soft: rgba(32, 199, 179, 0.14);
  --jf-danger: #f97066;
}

:global(.dark .jf-model-plaza-shell) {
  background: var(--jf-bg);
}

.jf-plaza-back {
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

.jf-plaza-back:hover {
  background: #087f70;
}

@media (max-width: 520px) {
  .jf-model-plaza-public-main {
    padding: 14px;
  }

  .jf-plaza-back {
    min-height: 34px;
    padding-inline: 10px;
    font-size: 12px;
  }
}
</style>
