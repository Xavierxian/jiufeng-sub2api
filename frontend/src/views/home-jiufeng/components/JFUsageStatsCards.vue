<template>
  <div class="jf-usage-stats grid grid-cols-2 gap-4 lg:grid-cols-5">
    <UsageStatsCards
      :stats="stats"
      :show-account-cost="showAccountCost"
      :strike-standard-cost="strikeStandardCost"
    />
    <div class="card flex items-center gap-3 p-4">
      <div class="rounded-lg bg-cyan-100 p-2 text-cyan-600 dark:bg-cyan-900/30">
        <Icon name="database" size="md" />
      </div>
      <div>
        <p class="text-xs font-medium text-gray-500">{{ cacheRateLabel }}</p>
        <p class="text-xl font-bold text-cyan-600">{{ cacheRate }}</p>
        <p class="text-xs text-gray-400">{{ cacheRateDetail }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AdminUsageStatsResponse } from '@/api/admin/usage'
import type { TrendDataPoint, UsageStatsResponse } from '@/types'
import UsageStatsCards from '@/components/admin/usage/UsageStatsCards.vue'
import Icon from '@/components/icons/Icon.vue'

const props = withDefaults(defineProps<{
  stats: (AdminUsageStatsResponse | UsageStatsResponse) | null
  trendData?: TrendDataPoint[]
  showAccountCost?: boolean
  strikeStandardCost?: boolean
}>(), {
  showAccountCost: true,
  strikeStandardCost: false,
})

const { locale } = useI18n()
const showAccountCost = computed(() => props.showAccountCost)
const strikeStandardCost = computed(() => props.strikeStandardCost)
const cacheRateLabel = computed(() => locale.value.startsWith('zh') ? '实时缓存率' : 'Live Cache Rate')
const cacheRateDetail = computed(() => locale.value.startsWith('zh') ? '与图表 Cache Hit Rate 同值' : 'Same as chart Cache Hit Rate')
const cacheRate = computed(() => {
  const latest = props.trendData?.[props.trendData.length - 1]
  if (!latest) return '0.0%'
  const input = Number(latest.input_tokens || 0)
  const creation = Number(latest.cache_creation_tokens || 0)
  const read = Number(latest.cache_read_tokens || 0)
  const denominator = input + creation + read
  return denominator > 0 ? `${(read / denominator * 100).toFixed(1)}%` : '0.0%'
})
</script>

<style scoped>
/* Let the four shared cards and the Jiufeng-only cache card share one grid. */
.jf-usage-stats > :deep(.grid) {
  display: contents;
}
</style>
