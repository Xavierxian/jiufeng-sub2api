<template>
  <div class="card">
    <div class="border-b border-gray-100 px-6 py-4 dark:border-dark-700">
      <div class="flex items-center gap-2">
        <Icon name="shield" size="md" class="text-primary-500" />
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ t('admin.settings.panelRateLimit.title') }}
        </h2>
      </div>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {{ t('admin.settings.panelRateLimit.description') }}
      </p>
    </div>

    <div class="space-y-5 p-6">
      <div v-if="loading" class="flex items-center gap-2 text-gray-500">
        <span class="h-4 w-4 animate-spin rounded-full border-b-2 border-primary-600"></span>
        {{ t('common.loading') }}
      </div>

      <template v-else>
        <div class="rounded-lg border border-sky-200 bg-sky-50 p-4 dark:border-sky-800 dark:bg-sky-900/20">
          <div class="flex items-start gap-3">
            <Icon name="infoCircle" size="md" class="mt-0.5 shrink-0 text-sky-500" />
            <p class="text-sm text-sky-700 dark:text-sky-300">
              {{ t('admin.settings.panelRateLimit.proxySafeNote') }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between gap-4">
          <div>
            <label class="font-medium text-gray-900 dark:text-white">
              {{ t('admin.settings.panelRateLimit.enabled') }}
            </label>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ t('admin.settings.panelRateLimit.enabledHint') }}
            </p>
          </div>
          <Toggle v-model="form.enabled" />
        </div>

        <div v-if="form.enabled" class="space-y-5 border-t border-gray-100 pt-4 dark:border-dark-700">
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div v-for="field in rpmFields" :key="field.key">
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ t(field.label) }}
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model.number="form[field.key]"
                  :data-testid="field.testId"
                  type="number"
                  min="0"
                  max="100000"
                  class="input w-32"
                />
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ t('admin.settings.panelRateLimit.perMinute') }}
                </span>
              </div>
              <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {{ t(field.hint) }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between gap-4 border-t border-gray-100 pt-4 dark:border-dark-700">
            <div>
              <label class="font-medium text-gray-900 dark:text-white">
                {{ t('admin.settings.panelRateLimit.exemptAdmin') }}
              </label>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ t('admin.settings.panelRateLimit.exemptAdminHint') }}
              </p>
            </div>
            <Toggle v-model="form.exempt_admin" />
          </div>
        </div>

        <div class="flex justify-end border-t border-gray-100 pt-4 dark:border-dark-700">
          <button type="button" class="btn btn-primary btn-sm" :disabled="saving" @click="save">
            <Icon v-if="saving" name="refresh" size="sm" class="mr-1 animate-spin" />
            {{ saving ? t('common.saving') : t('common.save') }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminAPI } from '@/api'
import type { PanelRateLimitSettings } from '@/api/admin/settings'
import Icon from '@/components/icons/Icon.vue'
import Toggle from '@/components/common/Toggle.vue'
import { useAppStore } from '@/stores'
import { extractApiErrorMessage } from '@/utils/apiError'

type RpmField = 'user_rpm' | 'heavy_rpm' | 'public_ip_rpm'

const { t } = useI18n()
const appStore = useAppStore()
const loading = ref(true)
const saving = ref(false)
const form = reactive<PanelRateLimitSettings>({
  enabled: true,
  user_rpm: 240,
  heavy_rpm: 60,
  exempt_admin: true,
  public_ip_rpm: 300,
})

const rpmFields: Array<{ key: RpmField; label: string; hint: string; testId?: string }> = [
  { key: 'user_rpm', label: 'admin.settings.panelRateLimit.userRpm', hint: 'admin.settings.panelRateLimit.userRpmHint', testId: 'panel-rate-limit-user-rpm' },
  { key: 'heavy_rpm', label: 'admin.settings.panelRateLimit.heavyRpm', hint: 'admin.settings.panelRateLimit.heavyRpmHint' },
  { key: 'public_ip_rpm', label: 'admin.settings.panelRateLimit.publicIpRpm', hint: 'admin.settings.panelRateLimit.publicIpRpmHint' },
]

async function load() {
  loading.value = true
  try {
    Object.assign(form, await adminAPI.settings.getPanelRateLimitSettings())
  } catch {
    // Keep server defaults visible when this optional endpoint is unavailable.
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  try {
    Object.assign(form, await adminAPI.settings.updatePanelRateLimitSettings({ ...form }))
    appStore.showSuccess(t('admin.settings.panelRateLimit.saved'))
  } catch (error: unknown) {
    appStore.showError(extractApiErrorMessage(error, t('admin.settings.panelRateLimit.saveFailed')))
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
