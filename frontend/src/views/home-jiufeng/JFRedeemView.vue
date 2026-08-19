<template>
  <AppLayout>
    <div class="space-y-6">
      <section class="redeem-hero">
        <div class="min-w-0">
          <p class="max-w-2xl text-sm font-semibold leading-6 text-gray-500 dark:!text-white">
            {{ t('redeem.redeemCodeHint') }}. {{ t('redeem.codeRule4') }}
          </p>
        </div>

        <button
          type="button"
          class="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-primary-300 hover:text-primary-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-700 dark:bg-dark-900 dark:text-dark-200 dark:hover:border-primary-700 dark:hover:text-primary-300"
          :disabled="loadingHistory"
          @click="fetchHistory"
        >
          <Icon name="refresh" size="sm" :class="{ 'animate-spin': loadingHistory }" />
          <span>{{ t('common.refresh') }}</span>
        </button>
      </section>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article class="metric-card dark:border-dark-700 dark:bg-dark-900/80 dark:shadow-none">
          <div class="metric-icon bg-primary-50 text-primary-600 dark:bg-primary-900/25 dark:text-primary-300">
            <Icon name="creditCard" size="md" />
          </div>
          <div class="min-w-0">
            <p class="metric-label dark:!text-primary-100">{{ t('redeem.currentBalance') }}</p>
            <p class="metric-value dark:!text-primary-300">${{ user?.balance?.toFixed(2) || '0.00' }}</p>
          </div>
        </article>

        <article class="metric-card dark:border-dark-700 dark:bg-dark-900/80 dark:shadow-none">
          <div class="metric-icon bg-blue-50 text-blue-600 dark:bg-blue-900/25 dark:text-blue-300">
            <Icon name="bolt" size="md" />
          </div>
          <div class="min-w-0">
            <p class="metric-label dark:!text-blue-100">{{ t('redeem.concurrency') }}</p>
            <p class="metric-value dark:!text-blue-300">
              {{ user?.concurrency || 0 }}
              <span class="dark:!text-slate-200">{{ t('redeem.requests') }}</span>
            </p>
          </div>
        </article>

        <article class="metric-card dark:border-dark-700 dark:bg-dark-900/80 dark:shadow-none">
          <div class="metric-icon bg-purple-50 text-purple-600 dark:bg-purple-900/25 dark:text-purple-300">
            <Icon name="clock" size="md" />
          </div>
          <div class="min-w-0">
            <p class="metric-label dark:!text-purple-100">{{ t('redeem.recentActivity') }}</p>
            <p class="metric-value dark:!text-purple-300">
              {{ history.length }}
              <span class="dark:!text-white">{{ latestHistoryLabel }}</span>
            </p>
          </div>
        </article>
      </section>

      <section class="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div class="card overflow-hidden xl:col-span-7">
          <div class="border-b border-gray-100 p-6 dark:border-dark-700">
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-950 dark:text-white">
                  {{ t('redeem.redeemCodeLabel') }}
                </h2>
                <p class="mt-1 text-sm font-medium text-gray-500 dark:!text-white">
                  {{ t('redeem.codeRule2') }}
                </p>
              </div>
              <span class="inline-flex w-fit items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-primary-900/20 dark:!text-primary-200">
                <Icon name="shield" size="sm" />
                {{ t('redeem.redeemCodeHint') }}
              </span>
            </div>
          </div>

          <form class="p-6" @submit.prevent="handleRedeem">
            <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_160px]">
              <label class="min-w-0">
                <span class="input-label sr-only">{{ t('redeem.redeemCodeLabel') }}</span>
                <span class="relative block">
                  <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Icon name="gift" size="md" class="text-gray-400 dark:text-dark-500" />
                  </span>
                  <input
                    id="code"
                    v-model="redeemCode"
                    type="text"
                    required
                    :placeholder="t('redeem.redeemCodePlaceholder')"
                    :disabled="submitting"
                    class="input redeem-input h-12 pl-12 font-mono text-sm tracking-[0.18em]"
                  />
                </span>
              </label>

              <button
                type="submit"
                :disabled="!redeemCode || submitting"
                class="btn btn-primary h-12 w-full"
              >
                <svg v-if="submitting" class="mr-2 h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <Icon v-else name="checkCircle" size="md" class="mr-2" />
                {{ submitting ? t('redeem.redeeming') : t('redeem.redeemButton') }}
              </button>
            </div>

            <p class="mt-3 text-xs font-medium text-gray-500 dark:!text-primary-200">
              {{ redeemCodePreview }}
            </p>
          </form>
        </div>

        <div class="space-y-6 xl:col-span-5">
          <transition name="fade" mode="out-in">
            <div
              v-if="redeemResult"
              key="success"
              class="card border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-800/50 dark:bg-emerald-900/15"
            >
              <div class="flex items-start gap-4">
                <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  <Icon name="checkCircle" size="md" />
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                    {{ t('redeem.redeemSuccess') }}
                  </h3>
                  <p class="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
                    {{ redeemResult.message }}
                  </p>
                  <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div
                      v-for="item in redeemResultSummary"
                      :key="item.label"
                      class="rounded-lg border border-emerald-200/70 bg-white/70 px-3 py-2 dark:border-emerald-800/50 dark:bg-dark-950/30"
                    >
                      <p class="text-[11px] font-medium text-emerald-700/80 dark:text-emerald-300/80">
                        {{ item.label }}
                      </p>
                      <p class="mt-0.5 text-sm font-semibold text-emerald-950 dark:text-emerald-100">
                        {{ item.value }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else-if="errorMessage"
              key="error"
              class="card border-red-200 bg-red-50/80 p-5 dark:border-red-800/50 dark:bg-red-900/15"
            >
              <div class="flex items-start gap-4">
                <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                  <Icon name="exclamationCircle" size="md" />
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-red-900 dark:text-red-200">
                    {{ t('redeem.redeemFailed') }}
                  </h3>
                  <p class="mt-1 text-sm text-red-700 dark:text-red-300">
                    {{ errorMessage }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else key="info" class="card p-5">
              <div class="flex items-start gap-4">
                <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/25 dark:text-primary-300">
                  <Icon name="infoCircle" size="md" />
                </div>
                <div>
                  <h3 class="text-sm font-semibold text-gray-950 dark:text-white">
                    {{ t('redeem.aboutCodes') }}
                  </h3>
                  <div class="mt-3 grid gap-2 text-sm font-medium text-gray-600 dark:!text-slate-100">
                    <p class="redeem-rule"><Icon name="check" size="sm" />{{ t('redeem.codeRule1') }}</p>
                    <p class="redeem-rule"><Icon name="bolt" size="sm" />{{ t('redeem.codeRule2') }}</p>
                    <p class="redeem-rule"><Icon name="refresh" size="sm" />{{ t('redeem.codeRule4') }}</p>
                    <p class="redeem-rule"><Icon name="chat" size="sm" />{{ t('redeem.codeRule3') }}</p>
                  </div>
                  <span
                    v-if="contactInfo"
                    class="mt-4 inline-flex max-w-full items-center rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 dark:bg-dark-800 dark:text-dark-200"
                  >
                    {{ contactInfo }}
                  </span>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </section>

      <div class="card overflow-hidden">
        <div class="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 dark:border-dark-700 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-950 dark:text-white">
              {{ t('redeem.recentActivity') }}
            </h2>
            <p class="mt-1 text-sm font-medium text-gray-500 dark:!text-primary-200">
              {{ history.length > 0 ? latestHistoryLabel : t('redeem.historyWillAppear') }}
            </p>
          </div>
          <span class="inline-flex w-fit items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-primary-900/20 dark:!text-primary-200">
            {{ history.length }} {{ t('redeem.recentActivity') }}
          </span>
        </div>

        <div>
          <div v-if="loadingHistory" class="flex items-center justify-center py-8">
            <svg class="h-6 w-6 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>

          <div v-else-if="history.length > 0" class="divide-y divide-gray-100 dark:divide-dark-700">
            <div
              v-for="item in recentHistory"
              :key="item.id"
              class="grid gap-4 px-6 py-4 transition hover:bg-gray-50/80 dark:hover:bg-dark-800/50 md:grid-cols-[minmax(0,1.4fr)_minmax(160px,0.8fr)_minmax(160px,0.8fr)_minmax(120px,0.6fr)] md:items-center"
            >
              <div class="flex min-w-0 items-center gap-4">
                <div
                  :class="[
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
                    getHistoryTone(item).iconBg
                  ]"
                >
                  <Icon
                    v-if="isBalanceType(item.type)"
                    name="dollar"
                    size="md"
                    :class="getHistoryTone(item).iconText"
                  />
                  <Icon
                    v-else-if="isSubscriptionType(item.type)"
                    name="badge"
                    size="md"
                    :class="getHistoryTone(item).iconText"
                  />
                  <Icon
                    v-else
                    name="bolt"
                    size="md"
                    :class="getHistoryTone(item).iconText"
                  />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ getHistoryItemTitle(item) }}
                  </p>
                  <p class="mt-1 truncate font-mono text-xs text-gray-400 dark:!text-slate-300">
                    {{ isAdminAdjustment(item.type) ? t('redeem.adminAdjustment') : item.code }}
                  </p>
                </div>
              </div>

              <div>
                <p class="table-kicker">{{ t('admin.redeem.columns.type') }}</p>
                <p class="mt-1 text-sm font-medium text-gray-700 dark:!text-slate-100">
                  {{ getHistoryItemTitle(item) }}
                </p>
              </div>

              <div>
                <p class="table-kicker">{{ t('admin.redeem.columns.usedAt') }}</p>
                <p class="mt-1 text-sm font-medium text-gray-700 dark:!text-slate-100">
                  {{ formatDateTime(item.used_at) }}
                </p>
                <p
                  v-if="item.notes"
                  class="mt-1 max-w-[260px] truncate text-xs italic text-gray-500 dark:text-dark-400"
                  :title="item.notes"
                >
                  {{ item.notes }}
                </p>
              </div>

              <div class="md:text-right">
                <p class="table-kicker">{{ t('admin.redeem.columns.value') }}</p>
                <p
                  :class="[
                    'mt-1 text-sm font-semibold',
                    getHistoryTone(item).valueText
                  ]"
                >
                  {{ formatHistoryValue(item) }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="empty-state py-10">
            <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-dark-800">
              <Icon name="clock" size="xl" class="text-gray-400 dark:text-dark-500" />
            </div>
            <p class="text-sm font-medium text-gray-500 dark:!text-primary-200">
              {{ t('redeem.historyWillAppear') }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { useSubscriptionStore } from '@/stores/subscriptions'
import { redeemAPI, authAPI, type RedeemHistoryItem } from '@/api'
import AppLayout from '@/views/home-jiufeng/JFAppLayout.vue'
import Icon from '@/components/icons/Icon.vue'
import { formatDateTime } from '@/utils/format'

const { t } = useI18n()
const authStore = useAuthStore()
const appStore = useAppStore()
const subscriptionStore = useSubscriptionStore()

const user = computed(() => authStore.user)

const redeemCode = ref('')
const submitting = ref(false)
const redeemResult = ref<{
  message: string
  type: string
  value: number
  new_balance?: number
  new_concurrency?: number
  group_name?: string
  validity_days?: number
} | null>(null)
const errorMessage = ref('')

const history = ref<RedeemHistoryItem[]>([])
const loadingHistory = ref(false)
const contactInfo = ref('')

const recentHistory = computed(() => history.value.slice(0, 8))
const latestHistoryLabel = computed(() => {
  if (history.value.length === 0) return t('redeem.historyWillAppear')
  return formatDateTime(history.value[0].used_at)
})

const redeemCodePreview = computed(() => {
  const code = redeemCode.value.trim()
  if (!code) return t('redeem.redeemCodeHint')
  return `${t('redeem.redeemCodeLabel')}: ${code}`
})

const isBalanceType = (type: string) => type === 'balance' || type === 'admin_balance'
const isSubscriptionType = (type: string) => type === 'subscription'
const isAdminAdjustment = (type: string) => type === 'admin_balance' || type === 'admin_concurrency'

const getHistoryItemTitle = (item: RedeemHistoryItem) => {
  if (item.type === 'balance') return t('redeem.balanceAddedRedeem')
  if (item.type === 'admin_balance') {
    return item.value >= 0 ? t('redeem.balanceAddedAdmin') : t('redeem.balanceDeductedAdmin')
  }
  if (item.type === 'concurrency') return t('redeem.concurrencyAddedRedeem')
  if (item.type === 'admin_concurrency') {
    return item.value >= 0 ? t('redeem.concurrencyAddedAdmin') : t('redeem.concurrencyReducedAdmin')
  }
  if (item.type === 'subscription') return t('redeem.subscriptionAssigned')
  return t('common.unknown')
}

const formatHistoryValue = (item: RedeemHistoryItem) => {
  if (isBalanceType(item.type)) {
    const sign = item.value >= 0 ? '+' : ''
    return `${sign}$${item.value.toFixed(2)}`
  }
  if (isSubscriptionType(item.type)) {
    const days = item.validity_days || Math.round(item.value)
    const groupName = item.group?.name || ''
    return groupName ? `${days}${t('redeem.days')} - ${groupName}` : `${days}${t('redeem.days')}`
  }
  const sign = item.value >= 0 ? '+' : ''
  return `${sign}${item.value} ${t('redeem.requests')}`
}

const getHistoryTone = (item: RedeemHistoryItem) => {
  if (isBalanceType(item.type)) {
    return item.value >= 0
      ? {
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
          iconText: 'text-emerald-600 dark:text-emerald-400',
          valueText: 'text-emerald-600 dark:text-emerald-400'
        }
      : {
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconText: 'text-red-600 dark:text-red-400',
          valueText: 'text-red-600 dark:text-red-400'
        }
  }
  if (isSubscriptionType(item.type)) {
    return {
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconText: 'text-purple-600 dark:text-purple-400',
      valueText: 'text-purple-600 dark:text-purple-400'
    }
  }
  return item.value >= 0
    ? {
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconText: 'text-blue-600 dark:text-blue-400',
        valueText: 'text-blue-600 dark:text-blue-400'
      }
    : {
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        iconText: 'text-orange-600 dark:text-orange-400',
        valueText: 'text-orange-600 dark:text-orange-400'
      }
}

const redeemResultSummary = computed(() => {
  if (!redeemResult.value) return []
  const result = redeemResult.value
  const rows: Array<{ label: string; value: string }> = []

  if (result.type === 'balance') {
    rows.push({ label: t('redeem.added'), value: `$${result.value.toFixed(2)}` })
  } else if (result.type === 'concurrency') {
    rows.push({
      label: t('redeem.added'),
      value: `${result.value} ${t('redeem.concurrentRequests')}`
    })
  } else if (result.type === 'subscription') {
    rows.push({
      label: t('redeem.subscriptionAssigned'),
      value: result.group_name || t('redeem.subscriptionAssigned')
    })
    if (result.validity_days) {
      rows.push({
        label: t('admin.redeem.validityDays'),
        value: t('redeem.subscriptionDays', { days: result.validity_days })
      })
    }
  }

  if (result.new_balance !== undefined) {
    rows.push({ label: t('redeem.newBalance'), value: `$${result.new_balance.toFixed(2)}` })
  }
  if (result.new_concurrency !== undefined) {
    rows.push({
      label: t('redeem.newConcurrency'),
      value: `${result.new_concurrency} ${t('redeem.requests')}`
    })
  }

  return rows
})

const fetchHistory = async () => {
  loadingHistory.value = true
  try {
    history.value = await redeemAPI.getHistory()
  } catch (error) {
    console.error('Failed to fetch history:', error)
  } finally {
    loadingHistory.value = false
  }
}

const handleRedeem = async () => {
  if (!redeemCode.value.trim()) {
    appStore.showError(t('redeem.pleaseEnterCode'))
    return
  }

  submitting.value = true
  errorMessage.value = ''
  redeemResult.value = null

  try {
    const result = await redeemAPI.redeem(redeemCode.value.trim())
    redeemResult.value = result

    await authStore.refreshUser()

    if (result.type === 'subscription') {
      try {
        await subscriptionStore.fetchActiveSubscriptions(true)
      } catch (error) {
        console.error('Failed to refresh subscriptions after redeem:', error)
        appStore.showWarning(t('redeem.subscriptionRefreshFailed'))
      }
    }

    redeemCode.value = ''
    await fetchHistory()
    appStore.showSuccess(t('redeem.codeRedeemSuccess'))
  } catch (error: any) {
    errorMessage.value = error.response?.data?.detail || t('redeem.failedToRedeem')
    appStore.showError(t('redeem.redeemFailed'))
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  fetchHistory()
  try {
    const settings = await authAPI.getPublicSettings()
    contactInfo.value = settings.contact_info || ''
  } catch (error) {
    console.error('Failed to load contact info:', error)
  }
})
</script>

<style scoped>
.redeem-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgb(229 231 235);
  border-radius: 0.75rem;
  background: rgb(255 255 255);
  padding: 1.25rem;
  box-shadow: 0 1px 2px rgb(15 23 42 / 0.04);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

:global(html.dark) .metric-card,
:global(body.dark) .metric-card,
:global(.dark) .metric-card {
  border-color: rgb(31 41 55);
  background:
    linear-gradient(135deg, rgb(17 24 39 / 0.96), rgb(12 18 31 / 0.94));
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.04),
    0 16px 38px rgb(0 0 0 / 0.18);
}

:global(html.dark) .metric-card:hover,
:global(body.dark) .metric-card:hover,
:global(.dark) .metric-card:hover {
  border-color: rgb(20 184 166 / 0.42);
}

.metric-icon {
  display: flex;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}

:global(html.dark) .metric-icon,
:global(body.dark) .metric-icon,
:global(.dark) .metric-icon {
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.05);
}

.metric-label {
  color: rgb(107 114 128);
  font-size: 0.8125rem;
  font-weight: 600;
}

:global(html.dark) .metric-label,
:global(body.dark) .metric-label,
:global(.dark) .metric-label {
  color: rgb(203 213 225);
}

.metric-value {
  margin-top: 0.25rem;
  color: rgb(17 24 39);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

:global(html.dark) .metric-value,
:global(body.dark) .metric-value,
:global(.dark) .metric-value {
  color: rgb(94 234 212);
  text-shadow: 0 0 18px rgb(20 184 166 / 0.18);
}

.metric-value span {
  color: rgb(107 114 128);
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0;
}

:global(html.dark) .metric-value span,
:global(body.dark) .metric-value span,
:global(.dark) .metric-value span {
  color: rgb(226 232 240);
}

:global(html.dark) .redeem-input,
:global(body.dark) .redeem-input,
:global(.dark) .redeem-input {
  border-color: rgb(51 65 85);
  background: rgb(15 23 42 / 0.72);
  color: rgb(224 242 254);
}

:global(html.dark) .redeem-input::placeholder,
:global(body.dark) .redeem-input::placeholder,
:global(.dark) .redeem-input::placeholder {
  color: rgb(148 163 184);
  opacity: 1;
}

.redeem-rule {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.redeem-rule svg {
  flex: 0 0 auto;
  color: rgb(20 184 166);
}

.table-kicker {
  color: rgb(156 163 175);
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

:global(.dark) .table-kicker {
  color: rgb(100 116 139);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 640px) {
  .redeem-hero {
    flex-direction: column;
  }

  .metric-card {
    padding: 1rem;
  }
}
</style>
