import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const dir = resolve(process.cwd(), 'src/views/home-jiufeng')
const read = (relativePath: string) => readFileSync(resolve(dir, relativePath), 'utf8')

describe('Jiufeng v0.2.5 feature parity', () => {
  it('supports the site billing mode and subscription feature switch', () => {
    const settings = read('admin/SettingsView.vue')
    expect(settings).toContain('resolveSiteBillingMode')
    expect(settings).toContain('billingModeToSettings')
    expect(settings).toContain('subscription_enabled: form.subscription_enabled')
    expect(settings).toContain("{ value: \"missing\"")

    const sidebar = read('JFAppSidebar.vue')
    expect(sidebar).toContain('purchaseNavLabel')
    expect(sidebar).toContain('featureFlag: flagSubscription')
    expect(read('JFAppHeader.vue')).toContain('user && subscriptionFeatureEnabled')

    const subscriptions = read('user/SubscriptionsView.vue')
    expect(subscriptions).toContain('FeatureFlags.subscription')
    expect(subscriptions).toContain("router.replace(authStore.isAdmin ? '/admin/dashboard' : '/dashboard')")

    const payment = read('user/PaymentView.vue')
    expect(payment).toContain('if (subscriptionEnabled.value)')
    expect(payment).toContain('tabs.length === 0')
  })

  it('supports API key provider grouping, selection, and bulk editing', () => {
    const keys = read('user/KeysView.vue')
    expect(keys).toContain('BulkEditKeysModal')
    expect(keys).toContain(':selected-keys="selectedIds"')
    expect(keys).toContain('KEY_GROUP_PROVIDERS')
    expect(keys).toContain('formGroupOptions')
    expect(keys).toContain('const updatedKey = await keysAPI.update')
  })

  it('supports subscription and user bulk administration', () => {
    const subscriptions = read('admin/SubscriptionsView.vue')
    expect(subscriptions).toContain('BulkSubscriptionActionDialog')
    expect(subscriptions).toContain("const bulkActions: SubscriptionBulkAction[] = ['extend', 'reset_quota', 'revoke', 'restore']")
    expect(subscriptions).toContain('adminAPI.subscriptions.bulkAssign')
    expect(subscriptions).toContain('assignUsers.length >= 100')

    const users = read('admin/UsersView.vue')
    expect(users).toContain('data-test="bulk-delete-users"')
    expect(users).toContain('confirmBulkDelete')
    expect(users).toContain('removeSelectedIds(deletedIds)')
  })

  it('includes registration, custom menu, OpenCode, and credential refresh updates', () => {
    const register = read('JFRegisterView.vue')
    expect(register).toContain('v-model="confirmPassword"')
    expect(register).toContain("t('auth.passwordsDoNotMatch')")

    expect(read('admin/SettingsView.vue')).toContain('v-model="item.hide_open_button"')
    expect(read('user/CustomPageView.vue')).toContain('v-if="!menuItem?.hide_open_button"')
    expect(read('admin/ChannelsView.vue')).toContain("'opencode_go'")

    const accounts = read('admin/AccountsView.vue')
    expect(accounts).toContain('patchAccountInList(result.account)')
    expect(accounts).toContain('appStore.showWarning(result.message)')
  })

  it('keeps v0.2.5 fixes for usage, proxies, redeem, monitoring, and ops', () => {
    const usage = read('user/UsageView.vue')
    expect(usage).toContain('const exportParams = buildUsageListParams')
    expect(usage).toContain('usageAPI.query({ ...exportParams, page })')
    expect(usage).toMatch(
      /<div v-if="subscriptionFeatureEnabled"[^>]*>\s*<label[^>]*>\{\{ t\('admin\.usage\.billingType'\) \}\}/,
    )
    expect(usage).toMatch(
      /<div class="[^"]*">\s*<label[^>]*>\{\{ t\('usage\.errors\.category'\) \}\}/,
    )

    const proxies = read('admin/ProxiesView.vue')
    expect(proxies).toContain('@change="handleFilterChange"')
    expect(proxies).toContain('username: editForm.username.trim()')
    expect(proxies).toContain('updateData.password = editForm.password.trim()')

    expect(read('JFRedeemView.vue')).toContain("appStore.showWarning(t('redeem.userRefreshFailed'))")
    expect(read('user/ChannelStatusV1View.vue')).toContain('autoRefresh.resetCountdown()')

    const opsHeader = read('admin/ops/components/OpsDashboardHeader.vue')
    expect(opsHeader).toContain("kind: 'success', sort: 'ttft_desc'")
    expect(read('admin/ops/components/OpsRequestDetailsModal.vue')).toContain('row.first_token_ms')
    expect(read('admin/ops/components/OpsErrorDetailsModal.vue')).toContain('summary-first')
  })
})
