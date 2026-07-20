import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const dir = resolve(process.cwd(), 'src/views/home-jiufeng')
const read = (relativePath: string) => readFileSync(resolve(dir, relativePath), 'utf8')

describe('Jiufeng feature parity', () => {
  it('includes current group pricing capabilities', () => {
    const source = read('admin/GroupsView.vue')
    expect(source).toContain('allow_batch_image_generation')
    expect(source).toContain('batch_image_discount_multiplier')
    expect(source).toContain('video_price_1080p')
    expect(source).toContain('web_search_price_per_call')
    expect(source).toContain('getQuotaUsageClass')
  })

  it('includes current OpenAI scheduler and payment settings', () => {
    const source = read('admin/SettingsView.vue')
    expect(source).toContain('OpenAIFastPolicyUserSelector')
    expect(source).toContain('openai_advanced_scheduler_sticky_weighted_enabled')
    expect(source).toContain('openai_advanced_scheduler_weight_session_sticky')
    expect(source).toContain('payment_subscription_usd_to_cny_rate')
  })

  it('includes current usage, key, and account displays', () => {
    const usage = read('user/UsageView.vue')
    expect(usage).toContain('errorFilter.status_code')
    expect(usage).toContain('ERR_HIDDEN_COLUMNS_KEY')
    expect(usage).toContain("value: 'video'")

    const keys = read('user/KeysView.vue')
    expect(keys).toContain('cell-id')
    expect(keys).toContain("COLUMN_SETTINGS_VERSION = 3")
    expect(keys).toContain('cell-current_concurrency')
    expect(keys).toContain('cell-last_used_ip')

    const accounts = read('admin/AccountsView.vue')
    expect(accounts).toContain('cell-scheduler_score')
    expect(accounts).toContain('include_scheduler_score')
    expect(accounts).toContain('@duplicate="handleDuplicateAccount"')
    expect(accounts).toContain('adminAPI.accounts.duplicate')
    expect(accounts).toContain('getAccountPlanType')
    expect(accounts).toContain('getOpenAIAuthMode')
  })

  it('keeps invitation and promo codes as independent registration fields', () => {
    const register = read('JFRegisterView.vue')
    expect(register).toContain('id="register-invitation-code"')
    expect(register).toContain('v-model="formData.invitation_code"')
    expect(register).toContain('id="register-promo-code"')
    expect(register).toContain('v-model="formData.promo_code"')
    expect(register).not.toContain('handleAccessCodeInput')
  })

  it('includes current group IDs and operations diagnostics', () => {
    const groups = read('admin/GroupsView.vue')
    expect(groups).toContain('cell-id')
    expect(groups).toContain('group-column-settings-version')

    const systemLogs = read('admin/ops/components/OpsSystemLogTable.vue')
    expect(systemLogs).toContain("host: ''")
    expect(systemLogs).toContain('filters.host.trim()')
    expect(systemLogs).toContain('row.host')

    const errorLogs = read('admin/ops/components/OpsErrorLogTable.vue')
    const errorDetails = read('admin/ops/components/OpsErrorDetailsModal.vue')
    expect(errorLogs).toContain("phase === 'account_auth'")
    expect(errorDetails).toContain("value: 'account_auth'")
  })

  it('keeps payment polling and popup session handling safe', () => {
    const payment = read('user/PaymentView.vue')
    expect(payment).toContain('subscriptionUsdToCnyRate')
    expect(payment).toContain('display_name: ml?.display_name')

    const qr = read('user/PaymentQRCodeView.vue')
    expect(qr).toContain('pollInFlight')
    expect(qr).toContain('isBuiltInAlipayMethod')

    const stripe = read('user/StripePopupView.vue')
    expect(stripe).toContain("localStorage.getItem('auth_token')")
    expect(stripe).toContain('clearInitTimeout')
    expect(stripe).toContain('messageHandler')
  })

  it('keeps Jiufeng shell adapters and sanitizes configurable home content', () => {
    expect(read('admin/GroupsView.vue')).toContain('@/views/home-jiufeng/JFAppLayout.vue')
    expect(read('JFHomeView.vue')).toContain('DOMPurify.sanitize')
    expect(read('JFHomeView.vue')).toContain('sanitizeUrl')
    expect(read('JFHomeView.vue')).toContain("sessionStorage.getItem('jiufeng_home_intro_seen')")
    expect(read('JFHomeView.vue')).toContain("localStorage.getItem('sub2api_locale')")
    expect(read('JFHomeView.vue')).toContain("void setLocale('en')")
    expect(read('JFHomeView.vue')).toContain('@media (prefers-reduced-motion: reduce)')
    expect(read('JFAppHeader.vue')).toContain('frozenBalance')
    const dataTable = read('JFDataTable.vue')
    expect(dataTable).toContain('getHeaderContentAlignmentClass')
    expect(dataTable).toContain('getItemKey:')
    expect(dataTable).toContain('rowIdentityKeys')
    expect(dataTable).toContain('renderRows')
  })

  it('retains feature-safe routing and the batch image compatibility alias', () => {
    const router = read('../../router/index.ts')
    expect(router).toContain("name: 'BatchImageGuide'")
    expect(router).toContain("alias: '/docs/batch-image'")
    expect(router).toContain('!appStore.publicSettingsLoaded')
    expect(router).toContain('appStore.cachedPublicSettings?.payment_enabled === false')
    expect(router).toContain("@/views/home-jiufeng/JFResetPasswordView.vue")
    expect(read('JFResetPasswordView.vue')).toContain('jf-reset-page')
  })

  it('includes current admin security and bulk management capabilities', () => {
    const accounts = read('admin/AccountsView.vue')
    expect(accounts).toContain('upstreamBillingProbeSettings')
    expect(accounts).toContain('handleBulkProbeUpstreamBilling')
    expect(accounts).toContain('accountExportStepUp')

    const backup = read('admin/BackupView.vue')
    expect(backup).toContain('backupStepUp.run')
    expect(backup).toContain('TotpStepUpDialog')

    expect(read('admin/GroupsView.vue')).toContain('adminAPI.groups.duplicate')
    expect(read('admin/ChannelMonitorView.vue')).toContain('adminAPI.channelMonitor.duplicate')
    expect(read('admin/UsersView.vue')).toContain('BulkEditUserModal')
  })

  it('includes current security controls and async image storage settings', () => {
    const settings = read('admin/SettingsView.vue')
    expect(settings).toContain('step_up_enabled')
    expect(settings).toContain('forwarded_client_ip_headers')
    expect(settings).toContain('session_binding_enabled: false')

    const backup = read('admin/BackupView.vue')
    expect(backup).toContain('imageStorageForm')
    expect(backup).toContain('getImageStorageConfig')
    expect(backup).toContain('testImageStorageConnection')
  })

  it('includes current pricing, scheduler, affiliate, and audit settings', () => {
    const settings = read('admin/SettingsView.vue')
    expect(settings).toContain('session_binding_enabled')
    expect(settings).toContain('audit_log_retention_days')
    expect(settings).toContain('openai_low_upstream_rate_priority_enabled')
    expect(settings).toContain('openai_oauth_scheduling_rate_multiplier')
    expect(settings).toContain('openai_advanced_scheduler_weight_upstream_cost')
    expect(settings).toContain('affiliate_admin_recharge_enabled')

    expect(read('admin/ChannelsView.vue')).toContain('image_input_price')
    expect(read('admin/orders/PlanEditDialog.vue')).toContain('currency: planForm.currency.trim().toUpperCase()')

    const router = read('../../router/index.ts')
    expect(router).toContain("path: '/admin/audit-logs'")
    expect(router).toContain("name: 'AdminAuditLogs'")
    expect(router).toContain("@/views/home-jiufeng/admin/AuditLogView.vue")
    expect(read('admin/AuditLogView.vue')).toContain('@/views/home-jiufeng/JFAppLayout.vue')
    expect(read('JFAppSidebar.vue')).toContain("path: '/admin/audit-logs'")
  })
})
