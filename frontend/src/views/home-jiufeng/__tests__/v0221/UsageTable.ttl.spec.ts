const ipGeoMocks = vi.hoisted(() => ({
  getEntry: vi.fn(() => ({ status: 'idle' as const })),
  fetchOne: vi.fn(),
  fetchBatch: vi.fn(),
}))

const appStoreMocks = vi.hoisted(() => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}))

vi.mock('@/utils/ipGeoLookup', () => ipGeoMocks)
vi.mock('@/stores/app', () => ({ useAppStore: () => appStoreMocks }))

import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import en from '@/i18n/locales/en/admin/resources'
import zh from '@/i18n/locales/zh/admin/resources'
import UsageTable from '../../components/JFUsageTable.vue'

const locale: 'en' | 'zh' = 'en'
const localizedMessages: Record<'en' | 'zh', Record<string, string>> = {
  en: {
    'admin.usage.longContext': en.usage.longContext,
    'admin.usage.longContextPricingTooltip': en.usage.longContextPricingTooltip,
  },
  zh: {
    'admin.usage.longContext': zh.usage.longContext,
    'admin.usage.longContextPricingTooltip': zh.usage.longContextPricingTooltip,
  },
}

const messages: Record<string, string> = {
  'usage.outputTps': 'Output TPS',
  'admin.usage.userDeletedBadge': 'Deleted',
  'usage.costDetails': 'Cost Breakdown',
  'admin.usage.inputCost': 'Input Cost',
  'admin.usage.outputCost': 'Output Cost',
  'admin.usage.cacheCreationCost': 'Cache Creation Cost',
  'admin.usage.cacheReadCost': 'Cache Read Cost',
  'usage.inputTokenPrice': 'Input price',
  'usage.outputTokenPrice': 'Output price',
  'usage.perMillionTokens': '/ 1M tokens',
  'usage.serviceTier': 'Service tier',
  'usage.serviceTierPriority': 'Fast',
  'usage.serviceTierUltrafast': 'Ultrafast',
  'usage.serviceTierFlex': 'Flex',
  'usage.serviceTierStandard': 'Standard',
  'usage.rate': 'Rate',
  'usage.accountMultiplier': 'Account rate',
  'usage.original': 'Original',
  'usage.userBilled': 'User billed',
  'usage.accountBilled': 'Account billed',
  'usage.imageUnit': ' images',
  'usage.imageCount': 'Image count',
  'usage.imageBillingSize': 'Billing size',
  'usage.imageInputSize': 'Input size',
  'usage.imageOutputSize': 'Output size',
  'usage.imageSizeSource': 'Size source',
  'usage.imageSizeBreakdown': 'Size breakdown',
  'usage.imageSizeSourceOutput': 'Upstream output',
  'usage.imageSizeSourceInput': 'Request input',
  'usage.imageSizeSourceDefault': 'Default billing tier',
  'usage.imageSizeSourceLegacy': 'Legacy record',
  'usage.imageSizeSourceMissing': 'Not recorded',
  'usage.imageSizeNotRecorded': 'not recorded',
  'usage.imageSizeLegacyUnstandardized': 'legacy unstandardized',
  'usage.imageSizeUnknown': 'unknown',
  'usage.imageUnitPrice': 'Per-image price',
  'usage.imageTotalPrice': 'Image total price',
  'usage.stream': 'Stream',
  'usage.sync': 'Sync',
  'usage.nativeCompactionV2': 'Compaction',
  'admin.usage.billingModeToken': 'Token',
  'admin.usage.billingModePerRequest': 'Per request',
  'admin.usage.billingModeImage': 'Image',
	'admin.usage.requestIdCopied': 'Request ID copied',
	'admin.usage.upstreamRequestIdCopied': 'Upstream ID copied',
	'keys.copied': 'Copied',
	'keys.copyToClipboard': 'Copy to clipboard',
	'common.copyFailed': 'Copy failed',
	'usage.requestedModel': 'Requested',
	'usage.sentUpstreamModel': 'Sent upstream',
	'usage.upstreamResponseModel': 'Upstream response',
	'usage.modelVariant': 'Possible version variant',
	'usage.modelMismatch': 'Different model',
}

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string) => localizedMessages[locale][key] ?? messages[key] ?? key,
    }),
  }
})

const DataTableStub = {
  props: ['data'],
  template: `
    <div>
      <div v-for="row in data" :key="row.request_id" :data-request-id="row.request_id">
        <slot name="cell-model" :row="row" :value="row.model" />
        <slot name="cell-reasoning_effort" :row="row" :value="row.reasoning_effort" />
        <slot name="cell-billing_mode" :row="row" />
        <slot name="cell-tokens" :row="row" />
        <slot name="cell-latency" :row="row" />
        <slot name="cell-cost" :row="row" />
        <slot name="cell-request_id" :row="row" />
        <slot name="cell-upstream_request_id" :row="row" />
      </div>
    </div>
  `,
}

const baseImageRow = {
  request_id: 'req-admin-image',
  model: 'gpt-image-2',
  actual_cost: 0.4,
  total_cost: 0.4,
  account_rate_multiplier: 1,
  rate_multiplier: 1,
  service_tier: null,
  input_cost: 0,
  output_cost: 0,
  cache_creation_cost: 0,
  cache_read_cost: 0,
  input_tokens: 0,
  output_tokens: 0,
  cache_creation_tokens: 0,
  cache_read_tokens: 0,
  cache_creation_5m_tokens: 0,
  cache_creation_1h_tokens: 0,
  cache_ttl_overridden: false,
  billing_mode: 'image',
  image_count: 2,
  image_size: '2K',
  image_input_size: null,
  image_output_size: null,
  image_size_source: null,
  image_size_breakdown: null,
}

describe('Jiufeng cache TTL details', () => {
  it('shows the two OpenAI cache-write buckets without Anthropic lifetime labels', async () => {
    const row = { ...baseImageRow, image_count: 0, billing_mode: 'token', cache_creation_tokens: 2399, cache_creation_30m_tokens: 9, cache_creation_12h_tokens: 2390 }
    const wrapper = mount(UsageTable, {
      props: { data: [row], loading: false, columns: [] },
      global: { stubs: { DataTable: DataTableStub, EmptyState: true, Icon: true, Teleport: true } },
    })
    try {
      await wrapper.find('.group.relative').trigger('mouseenter')
      await nextTick()
      const text = wrapper.get('.fixed').text()
      expect(text).toContain('30m')
      expect(text).toContain('12h')
      expect(text).toContain('2,390')
      expect(text).not.toContain('5m')
      expect(text).not.toMatch(/\b1h\b/)
    } finally {
      wrapper.unmount()
    }
  })

  it('falls back to aggregate cache tokens for older records', async () => {
    const row = { ...baseImageRow, image_count: 0, billing_mode: 'token', cache_creation_tokens: 1234 }
    const wrapper = mount(UsageTable, {
      props: { data: [row], loading: false, columns: [] },
      global: { stubs: { DataTable: DataTableStub, Icon: true, Teleport: true } },
    })
    try {
      await wrapper.find('.group.relative').trigger('mouseenter')
      expect(wrapper.get('.fixed').text()).toContain('1,234')
      expect(wrapper.get('.fixed').text()).not.toContain('12h')
      expect(wrapper.get('.fixed').text()).not.toContain('30m')
    } finally { wrapper.unmount() }
  })
})
