import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent } from 'vue'
import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'

import RiskControlView from '../admin/RiskControlView.vue'

const {
  getConfig,
  updateConfig,
  getStatus,
  listLogs,
  getGroups,
  getProxies,
  testAPIKeys,
  showError,
  showSuccess,
} = vi.hoisted(() => ({
  getConfig: vi.fn(),
  updateConfig: vi.fn(),
  getStatus: vi.fn(),
  listLogs: vi.fn(),
  getGroups: vi.fn(),
  getProxies: vi.fn(),
  testAPIKeys: vi.fn(),
  showError: vi.fn(),
  showSuccess: vi.fn(),
}))

vi.mock('@/api/admin', () => ({
  adminAPI: {
    riskControl: {
      getConfig,
      updateConfig,
      getStatus,
      listLogs,
      testAPIKeys,
      deleteFlaggedHash: vi.fn(),
      clearFlaggedHashes: vi.fn(),
      unbanUser: vi.fn(),
    },
    groups: { getAll: getGroups },
    proxies: { getAll: getProxies },
  },
}))

vi.mock('@/stores/app', () => ({
  useAppStore: () => ({ showError, showSuccess }),
}))

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key }),
  }
})

const baseConfig = () => ({
  enabled: true,
  mode: 'pre_block',
  base_url: 'https://api.openai.com',
  model: 'omni-moderation-latest',
  proxy_id: 7,
  api_key_configured: false,
  api_key_masked: '',
  api_key_count: 0,
  api_key_masks: [],
  api_key_statuses: [],
  timeout_ms: 3000,
  retry_count: 2,
  sample_rate: 100,
  all_groups: true,
  group_ids: [],
  record_non_hits: false,
  worker_count: 4,
  queue_size: 32768,
  block_status: 403,
  block_message: 'blocked',
  email_on_hit: true,
  auto_ban_enabled: true,
  cyber_policy_exclude_from_ban_count: false,
  ban_threshold: 10,
  violation_window_hours: 720,
  hit_retention_days: 180,
  non_hit_retention_days: 3,
  pre_hash_check_enabled: false,
  blocked_keywords: [],
  keyword_blocking_mode: 'keyword_and_api',
  thresholds: {},
  model_filter: { type: 'all', models: [] },
})

const runtimeStatus = () => ({
  enabled: true,
  risk_control_enabled: true,
  mode: 'pre_block',
  worker_count: 4,
  active_workers: 0,
  api_key_statuses: [],
  flagged_hash_count: 0,
})

const BaseDialogStub = defineComponent({
  props: { show: Boolean },
  template: '<div v-if="show"><slot /><slot name="footer" /></div>',
})

const ProxySelectorStub = defineComponent({
  props: ['modelValue', 'proxies'],
  emits: ['update:modelValue'],
  template: `
    <select
      data-test="proxy-selector"
      :value="modelValue ?? 0"
      @change="$emit('update:modelValue', Number($event.target.value) || null)"
    >
      <option :value="0">direct</option>
      <option v-for="proxy in proxies" :key="proxy.id" :value="proxy.id">{{ proxy.name }}</option>
    </select>
  `,
})

const findButton = (wrapper: VueWrapper, text: string) => {
  const button = wrapper.findAll('button').find((item) => item.text().includes(text))
  if (!button) throw new Error(`button not found: ${text}`)
  return button
}

const mountView = () => mount(RiskControlView, {
  global: {
    stubs: {
      AppLayout: { template: '<div><slot /></div>' },
      BaseDialog: BaseDialogStub,
      Icon: true,
      Select: true,
      Toggle: true,
      Pagination: true,
      ModelWhitelistSelector: true,
      ProxySelector: ProxySelectorStub,
    },
  },
})

describe('Jiufeng risk control proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getConfig.mockResolvedValue(baseConfig())
    getStatus.mockResolvedValue(runtimeStatus())
    listLogs.mockResolvedValue({ items: [], total: 0, page: 1, page_size: 20, pages: 1 })
    getGroups.mockResolvedValue([])
    getProxies.mockResolvedValue([{ id: 7, name: 'moderation-proxy' }])
    updateConfig.mockImplementation(async (payload) => ({ ...baseConfig(), ...payload }))
    testAPIKeys.mockResolvedValue({ items: [], audit_result: null })
  })

  it('loads, displays, saves, and tests through the selected proxy', async () => {
    const wrapper = mountView()
    await flushPromises()
    await findButton(wrapper, 'admin.riskControl.openSettings').trigger('click')

    const selector = wrapper.get('[data-test="proxy-selector"]')
    expect((selector.element as HTMLSelectElement).value).toBe('7')

    const textareas = wrapper.findAll('textarea')
    await textareas[0].setValue('sk-test')
    await findButton(wrapper, 'admin.riskControl.testInputApiKeys').trigger('click')
    await flushPromises()
    expect(testAPIKeys).toHaveBeenCalledWith(expect.objectContaining({ proxy_id: 7 }))

    await findButton(wrapper, 'admin.riskControl.saveConfig').trigger('click')
    await flushPromises()
    expect(updateConfig).toHaveBeenCalledWith(expect.objectContaining({ proxy_id: 7 }))
    wrapper.unmount()
  })

  it('falls back to an empty proxy list without blocking configuration loading', async () => {
    getProxies.mockRejectedValue(new Error('proxy service unavailable'))
    const wrapper = mountView()
    await flushPromises()
    await findButton(wrapper, 'admin.riskControl.openSettings').trigger('click')

    expect(wrapper.find('[data-test="proxy-selector"]').exists()).toBe(true)
    expect(showError).not.toHaveBeenCalledWith('admin.riskControl.loadFailed')
    wrapper.unmount()
  })
})
