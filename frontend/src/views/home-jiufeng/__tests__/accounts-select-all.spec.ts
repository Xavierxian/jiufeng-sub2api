import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import AccountsView from '../admin/AccountsView.vue'

const {
  listAccounts,
  listWithEtag,
  getBatchTodayStats,
  getUpstreamBillingProbeSettings,
  getAllProxies,
  getAllGroups,
  batchDelete,
  probeUpstreamBillingBatch,
  showError,
  showSuccess,
} = vi.hoisted(() => ({
  listAccounts: vi.fn(),
  listWithEtag: vi.fn(),
  getBatchTodayStats: vi.fn(),
  getUpstreamBillingProbeSettings: vi.fn(),
  getAllProxies: vi.fn(),
  getAllGroups: vi.fn(),
  batchDelete: vi.fn(),
  probeUpstreamBillingBatch: vi.fn(),
  showError: vi.fn(),
  showSuccess: vi.fn(),
}))

vi.mock('@/api/admin', () => ({
  adminAPI: {
    accounts: {
      list: listAccounts,
      listWithEtag,
      getBatchTodayStats,
      getUpstreamBillingProbeSettings,
      batchDelete,
      probeUpstreamBillingBatch,
      batchClearError: vi.fn(),
      batchRefresh: vi.fn(),
      bulkUpdate: vi.fn(),
    },
    proxies: { getAll: getAllProxies },
    groups: { getAll: getAllGroups },
  },
}))

vi.mock('@/stores/app', () => ({
  useAppStore: () => ({
    showError,
    showSuccess,
    showInfo: vi.fn(),
  }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ token: 'test-token', isSimpleMode: false }),
}))

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({ t: (key: string) => key }),
  }
})

const makeAccounts = (count: number) => Array.from({ length: count }, (_, index) => ({
  id: index + 1,
  name: `account-${index + 1}`,
  platform: 'grok',
  type: 'oauth',
  status: 'active',
  schedulable: true,
  created_at: '2026-07-23T00:00:00Z',
  updated_at: '2026-07-23T00:00:00Z',
}))

const AccountBulkActionsBarStub = {
  props: ['selectedIds', 'totalResults', 'selectingAll', 'allResultsSelected'],
  emits: ['select-all-results', 'select-page', 'clear', 'delete', 'probe-upstream-billing'],
  template: `
    <div>
      <span data-test="selected-count">{{ selectedIds.length }}</span>
      <span data-test="total-results">{{ totalResults }}</span>
      <span data-test="all-results-selected">{{ String(allResultsSelected) }}</span>
      <button data-test="select-page" @click="$emit('select-page')">select page</button>
      <button data-test="select-all-results" @click="$emit('select-all-results')">select all</button>
      <button data-test="clear" @click="$emit('clear')">clear</button>
      <button data-test="bulk-delete" @click="$emit('delete')">delete</button>
      <button data-test="bulk-probe" @click="$emit('probe-upstream-billing')">probe</button>
    </div>
  `,
}

const AccountTableFiltersStub = {
  emits: ['change'],
  template: '<button data-test="change-filter" @click="$emit(\'change\')">change filter</button>',
}

const DataTableStub = {
  props: ['data'],
  template: `
    <div data-test="data-table">
      <slot v-if="data.length" name="cell-rate_multiplier" :row="data[0]" />
    </div>
  `,
}

const mountView = () => mount(AccountsView, {
  global: {
    stubs: {
      AppLayout: { template: '<div><slot /></div>' },
      TablePageLayout: { template: '<div><slot name="filters" /><slot name="table" /><slot name="pagination" /></div>' },
      DataTable: DataTableStub,
      Pagination: true,
      ConfirmDialog: true,
      AccountTableActions: { template: '<div><slot name="beforeCreate" /><slot name="after" /></div>' },
      AccountTableFilters: AccountTableFiltersStub,
      AccountBulkActionsBar: AccountBulkActionsBarStub,
      AccountActionMenu: true,
      ImportDataModal: true,
      ReAuthAccountModal: true,
      AccountTestModal: true,
      AccountStatsModal: true,
      ScheduledTestsPanel: true,
      SyncFromCrsModal: true,
      TempUnschedStatusModal: true,
      ErrorPassthroughRulesModal: true,
      TLSFingerprintProfilesModal: true,
      CreateAccountModal: true,
      EditAccountModal: true,
      BulkEditAccountModal: true,
      PlatformTypeBadge: true,
      AccountCapacityCell: true,
      AccountStatusIndicator: true,
      AccountTodayStatsCell: true,
      AccountGroupsCell: true,
      AccountUsageCell: true,
      Icon: { template: '<span data-test="icon" />' },
    },
  },
})

describe('Jiufeng accounts v0.1.170 behavior', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    listWithEtag.mockResolvedValue({ notModified: true, etag: null, data: null })
    getBatchTodayStats.mockResolvedValue({ stats: {} })
    getUpstreamBillingProbeSettings.mockResolvedValue({ enabled: true, interval_minutes: 30 })
    getAllProxies.mockResolvedValue([])
    getAllGroups.mockResolvedValue([])
    vi.stubGlobal('confirm', vi.fn(() => true))
  })

  it('selects all filtered results and clears the snapshot when filters change', async () => {
    const allAccounts = makeAccounts(45)
    listAccounts.mockImplementation(async (_page: number, pageSize: number) => ({
      items: pageSize === 1000 ? allAccounts : allAccounts.slice(0, 20),
      total: 45,
      page: 1,
      page_size: pageSize,
      pages: pageSize === 1000 ? 1 : 3,
    }))

    const wrapper = mountView()
    await flushPromises()
    await wrapper.get('[data-test="select-all-results"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-test="selected-count"]').text()).toBe('45')
    expect(wrapper.get('[data-test="all-results-selected"]').text()).toBe('true')
    expect(listAccounts).toHaveBeenCalledWith(1, 1000, expect.objectContaining({ lite: '1' }))

    await wrapper.get('[data-test="change-filter"]').trigger('click')
    expect(wrapper.get('[data-test="selected-count"]').text()).toBe('0')
    expect(wrapper.get('[data-test="all-results-selected"]').text()).toBe('false')
    wrapper.unmount()
  })

  it('keeps page selection when loading all filtered results fails', async () => {
    const currentPage = makeAccounts(20)
    listAccounts.mockImplementation(async (_page: number, pageSize: number) => {
      if (pageSize === 1000) throw new Error('load all failed')
      return { items: currentPage, total: 45, page: 1, page_size: 20, pages: 3 }
    })

    const wrapper = mountView()
    await flushPromises()
    await wrapper.get('[data-test="select-page"]').trigger('click')
    await wrapper.get('[data-test="select-all-results"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-test="selected-count"]').text()).toBe('20')
    expect(showError).toHaveBeenCalledWith('admin.accounts.bulkActions.selectAllFailed')
    wrapper.unmount()
  })

  it('shows the synced-rate indicator only for upstream-synced accounts', async () => {
    listAccounts.mockResolvedValue({
      items: [{ ...makeAccounts(1)[0], rate_multiplier: 0.065, extra: { upstream_billing_rate_sync_enabled: true } }],
      total: 1,
      page: 1,
      page_size: 20,
      pages: 1,
    })

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('0.065x')
    expect(wrapper.get('[data-testid="account-rate-sync-indicator"]').attributes('title')).toBe(
      'admin.accounts.upstreamBilling.syncedRateTooltip',
    )
    wrapper.unmount()
  })

  it('uses the batch delete API and keeps only failed accounts selected', async () => {
    const currentPage = makeAccounts(2)
    listAccounts.mockResolvedValue({ items: currentPage, total: 2, page: 1, page_size: 20, pages: 1 })
    batchDelete.mockResolvedValue({ success: 1, failed: 1, failed_ids: [2] })

    const wrapper = mountView()
    await flushPromises()
    await wrapper.get('[data-test="select-page"]').trigger('click')
    await wrapper.get('[data-test="bulk-delete"]').trigger('click')
    await flushPromises()

    expect(batchDelete).toHaveBeenCalledWith([1, 2])
    expect(wrapper.get('[data-test="selected-count"]').text()).toBe('1')
    expect(showError).toHaveBeenCalledWith('admin.accounts.bulkActions.partialSuccess')
    wrapper.unmount()
  })

  it('reloads the account list after a bulk billing probe updates a snapshot', async () => {
    const initial = { ...makeAccounts(1)[0], rate_multiplier: 1 }
    const refreshed = { ...initial, rate_multiplier: 0.065 }
    listAccounts
      .mockResolvedValueOnce({ items: [initial], total: 1, page: 1, page_size: 20, pages: 1 })
      .mockResolvedValue({ items: [refreshed], total: 1, page: 1, page_size: 20, pages: 1 })
    probeUpstreamBillingBatch.mockResolvedValue([
      { account_id: 1, snapshot: { status: 'ok', probed_at: '2026-08-03T00:00:00Z' } },
    ])

    const wrapper = mountView()
    await flushPromises()
    const callsBeforeProbe = listAccounts.mock.calls.length
    await wrapper.get('[data-test="select-page"]').trigger('click')
    await wrapper.get('[data-test="bulk-probe"]').trigger('click')
    await flushPromises()

    expect(probeUpstreamBillingBatch).toHaveBeenCalledWith([1])
    expect(listAccounts).toHaveBeenCalledTimes(callsBeforeProbe + 1)
    expect(wrapper.text()).toContain('0.065x')
    expect(showSuccess).toHaveBeenCalledWith('admin.accounts.upstreamBilling.batchCompleted')
    wrapper.unmount()
  })
})
