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

  it('uses the Jiufeng shell for Prompt Audit', () => {
    const router = read('../../router/index.ts')
    const promptAudit = read('admin/JFPromptAuditView.vue')
    expect(router).toContain("@/views/home-jiufeng/admin/JFPromptAuditView.vue")
    expect(promptAudit).toContain('<JFAppLayout>')
    expect(promptAudit).toContain('jf-prompt-audit')
    expect(promptAudit).not.toContain(':layout="JFAppLayout"')
  })

  it('includes current admin security and bulk management capabilities', () => {
    const accounts = read('admin/AccountsView.vue')
    expect(accounts).toContain('upstreamBillingProbeGloballyEnabled')
    expect(accounts).toContain('handleBulkProbeUpstreamBilling')
    expect(accounts).toContain('accountExportStepUp')

    const backup = read('admin/BackupView.vue')
    expect(backup).toContain('backupStepUp.run')
    expect(backup).toContain(
      'backupStepUp.run(() => adminAPI.backup.restoreBackup(id, password))',
    )
    expect(backup).toContain("error?.status === 409 || error?.response?.status === 409")
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

  it('includes composite groups, OpenAI Live, and reasoning effort policies', () => {
    const groups = read('admin/GroupsView.vue')
    expect(groups).toContain("row.platform === 'composite'")
    expect(groups).toContain('handleCompositeRoutes')
    expect(groups).toContain('previewCompositeRoute')
    expect(groups).toContain('createForm.allow_live')
    expect(groups).toContain('editForm.allow_live')
    expect(groups).toContain('max_reasoning_effort')
    expect(groups).toContain('reasoning_effort_mappings')
    expect(groups).toContain('ReasoningEffortPolicyFields')

    const channels = read('admin/ChannelsView.vue')
    expect(channels).toContain("g.platform === 'composite'")
    expect(channels).toContain('uniqueGroupIds')
  })

  it('includes current account, announcement, and system settings tools', () => {
    const accounts = read('admin/AccountsView.vue')
    expect(accounts).toContain('<Teleport to="body">')
    expect(accounts).toContain('getFloatingPanelPosition')
    expect(accounts).toContain('accountToolsTriggerRef')
    expect(accounts).toContain(':global-probe-enabled="upstreamBillingProbeGloballyEnabled"')
    expect(accounts).toContain(
      "{ key: 'upstream_billing_rate', label: t('admin.accounts.columns.upstreamBillingRate'), sortable: true }",
    )
    expect(accounts).toContain('refreshUpstreamBillingSortedList')
    expect(accounts).not.toContain(':interval-minutes="upstreamBillingProbeSettings.interval_minutes"')

    const announcements = read('admin/AnnouncementsView.vue')
    expect(announcements).toContain('openPreview')
    expect(announcements).toContain('previewAnnouncement')
    expect(announcements).toContain('AnnouncementPopup')

    const settings = read('admin/SettingsView.vue')
    expect(settings).toContain('ollamaCloudUsageForm')
    expect(settings).toContain('loadOllamaCloudUsageSettings')
    expect(settings).toContain('upstreamBillingProbeForm')
    expect(settings).toContain('payment_alipay_mobile_precreate_deep_link')
  })

  it('keeps current subscription pricing and expiration displays', () => {
    const plans = read('admin/orders/AdminPaymentPlansView.vue')
    const planDialog = read('admin/orders/PlanEditDialog.vue')
    const adminSubscriptions = read('admin/SubscriptionsView.vue')
    const userSubscriptions = read('user/SubscriptionsView.vue')

    expect(plans).toContain('planCurrencySymbol(row.currency)')
    expect(plans).toContain("import { currencySymbol } from '@/components/payment/currency'")
    expect(plans).toContain("label: t('payment.admin.validity')")
    expect(plans).not.toContain("label: t('payment.admin.validityDays')")
    expect(planDialog).toContain("t('payment.admin.validityRequired')")
    expect(planDialog).not.toContain('payment.admin.validityDaysRequired')
    expect(adminSubscriptions).toContain('formatDateTimeToMinute(value)')
    expect(adminSubscriptions).toContain('getRemainingExpiryDuration')
    expect(adminSubscriptions).toContain("t('admin.subscriptions.daysRemaining', { days: duration.days })")
    expect(adminSubscriptions).toContain("t('admin.subscriptions.hoursMinutesRemaining', {")
    expect(adminSubscriptions).toContain("t('admin.subscriptions.minutesRemaining', { minutes: duration.minutes })")
    expect(adminSubscriptions).not.toContain("{{ getDaysRemaining(value) }} {{ t('admin.subscriptions.daysRemaining') }}")
    expect(userSubscriptions).toContain('getExpirationDateRelation')
    expect(userSubscriptions).toContain('formatDateTimeToMinute(expires)')
    expect(userSubscriptions).not.toContain('formatDateOnly(expires)')
  })

  it('keeps batch image localization and template placeholders current', () => {
    const batchImage = read('user/BatchImageGuideView.vue')
    const emailTemplates = read('admin/settings/EmailTemplateEditor.vue')

    expect(batchImage).toContain("const { t, locale } = useI18n()")
    expect(batchImage).toContain("t('batchImage.filters.allStatuses')")
    expect(batchImage).toContain("t('batchImage.create.modelNoReferenceImages')")
    expect(batchImage).toContain("t('batchImage.promptPopover.copied')")
    expect(batchImage).not.toContain("{ value: 'queued', label: '排队中' }")
    expect(emailTemplates).toContain('const combined = placeholders.value.length')
    expect(emailTemplates).not.toContain(
      'const combined = [...placeholders.value, ...fallbackPlaceholders]',
    )
  })

  it('includes current mobile payment, usage, and table behavior', () => {
    const payment = read('user/PaymentView.vue')
    expect(payment).toContain('alipayMobilePrecreateDeepLink')
    expect(payment).toContain('mobilePrecreateDeepLink')
    expect(payment).toContain('validitySuffixOf')
    expect(payment).toContain('redirectToPaymentResult(completedPayment)')

    const userUsage = read('user/UsageView.vue')
    const adminUsage = read('admin/UsageView.vue')
    expect(userUsage).toContain("value: 'live'")
    expect(userUsage).toContain("requestType === 'live'")
    expect(adminUsage).toContain("requestType === 'live'")

    const keys = read('user/KeysView.vue')
    expect(keys).toContain('dropdownEstWidth')
    expect(keys).toContain('max-w-[calc(100vw-16px)]')

    const table = read('JFDataTable.vue')
    expect(table).toContain(':data-field="column.key"')
    expect(table).toContain('flex min-w-0 items-start')
  })

  it('includes the current operations mobile layouts and error feedback', () => {
    for (const component of [
      'OpsAlertEventsCard.vue',
      'OpsAlertRulesCard.vue',
      'OpsOpenAITokenStatsCard.vue',
      'OpsRequestDetailsModal.vue',
      'OpsSystemLogTable.vue',
    ]) {
      const source = read(`admin/ops/components/${component}`)
      expect(source).toContain('isDesktopViewport')
      expect(source).toContain('useMediaQuery')
    }

    expect(read('admin/ops/components/OpsSystemLogTable.vue')).toContain(
      'OPS_SYSTEM_LOG_CLEANUP_FILTER_REQUIRED',
    )
    const throughput = read('admin/ops/components/OpsThroughputTrendChart.vue')
    expect(throughput).toContain('throughput-chart-toolbar')
    expect(throughput).toContain('flex-wrap')
  })

  it('routes every public and callback surface through Jiufeng', () => {
    const router = read('../../router/index.ts')
    for (const component of [
      'setup/SetupWizardView.vue',
      'auth/OAuthCallbackView.vue',
      'auth/LinuxDoCallbackView.vue',
      'auth/WechatCallbackView.vue',
      'auth/WechatPaymentCallbackView.vue',
      'auth/DingTalkCallbackView.vue',
      'auth/DingTalkEmailCompletionView.vue',
      'auth/OidcCallbackView.vue',
      'JFKeyUsageView.vue',
      'public/LegalDocumentView.vue',
      'JFNotFoundView.vue',
    ]) {
      expect(router).toContain(`@/views/home-jiufeng/${component}`)
    }
  })

  it('keeps reasoning effort policy dependencies inside Jiufeng', () => {
    const groups = read('admin/GroupsView.vue')
    const fields = read('admin/group/ReasoningEffortPolicyFields.vue')
    expect(groups).toContain('./groupsReasoningEffort')
    expect(groups).toContain('@/views/home-jiufeng/admin/group/ReasoningEffortPolicyFields.vue')
    expect(fields).toContain('@/views/home-jiufeng/admin/groupsReasoningEffort')
    expect(groups).not.toContain('@/views/admin/groupsReasoningEffort')
  })

  it('includes v0.1.166 panel limits and multi-currency payment fixes', () => {
    const settings = read('admin/SettingsView.vue')
    const panelLimits = read('admin/settings/PanelRateLimitCard.vue')
    const paymentDashboard = read('admin/orders/AdminPaymentDashboardView.vue')

    expect(settings).toContain('panelRateLimitForm')
    expect(settings).toContain('getPanelRateLimitSettings')
    expect(panelLimits).toContain('getPanelRateLimitSettings')
    expect(panelLimits).toContain('updatePanelRateLimitSettings')
    expect(panelLimits).toContain('public_ip_rpm')
    expect(paymentDashboard).toContain('CurrencyAmounts')
    expect(paymentDashboard).toContain('sortedAmounts(method.amount)')
    expect(paymentDashboard).toContain('sortedTopUsers(stats.top_users)')
  })

  it('includes v0.1.166 registration, usage, and composite-route fixes', () => {
    const register = read('JFRegisterView.vue')
    const usage = read('admin/UsageView.vue')
    const groups = read('admin/GroupsView.vue')

    expect(register).toContain('v-else-if="affiliateEnabled"')
    expect(register).toContain('v-model="formData.aff_code"')
    expect(register).toContain('affiliateEnabled.value = settings.affiliate_enabled')
    expect(usage).toContain('loadRouteUserFilterLabel')
    expect(usage).toContain('getUserSearchRevision')
    expect(usage).toContain('adminAPI.users.getById')
    expect(groups).toContain('admin.groups.compositeRoutes.upstreamModelHint')
  })

  it('includes complete v0.1.168 Passkey surfaces', () => {
    const login = read('JFLoginView.vue')
    const profile = read('JFProfileView.vue')
    const settings = read('admin/SettingsView.vue')

    expect(login).toContain('showPasskeyLogin')
    expect(login).toContain('authStore.loginWithPasskey(proof)')
    expect(profile).toContain('ProfilePasskeyCard')
    expect(profile).toContain(':enabled="passkeyEnabled"')
    expect(settings).toContain('data-testid="passkey-settings"')
    expect(settings).toContain('passkey_configured')
    expect(settings).toContain('passkey_enabled: form.passkey_enabled')
    expect(settings).toContain('admin.settings.security.passkeyDeploymentHint')
  })

  it('includes complete v0.1.170 account, home, profit, proxy, and report surfaces', () => {
    const accounts = read('admin/AccountsView.vue')
    const settings = read('admin/SettingsView.vue')
    const home = read('JFHomeView.vue')
    const groups = read('admin/GroupsView.vue')
    const riskControl = read('admin/RiskControlView.vue')
    const emailTemplates = read('admin/settings/EmailTemplateEditor.vue')

    expect(accounts).toContain('@select-all-results="handleSelectAllResults"')
    expect(accounts).toContain('upstream_billing_rate_sync_enabled')
    expect(settings).toContain('compact_home_enabled: form.compact_home_enabled')
    expect(home).toContain('v-else-if="compactHomeEnabled"')
    expect(groups).toContain('./groupsProfitControl')
    expect(groups).toContain('profit_control_enabled')
    expect(riskControl).toContain('<ProxySelector v-model="configForm.proxy_id"')
    expect(riskControl).toContain('proxy_id: configForm.proxy_id ?? 0')
    expect(emailTemplates).toContain('{{report_summary_display}}')
    expect(emailTemplates).toContain('{{report_tps_avg}}')
  })

  it('keeps post-v0.1.170 table, account, and proxy parity fixes', () => {
    const dataTable = read('JFDataTable.vue')
    const users = read('admin/UsersView.vue')
    const accounts = read('admin/AccountsView.vue')
    const proxies = read('admin/ProxiesView.vue')

    expect(dataTable).toContain("'update:selectedKeys'")
    expect(dataTable).toContain('toggleAllVisible')
    expect(users).toContain('selectable')
    expect(users).toContain('@update:selected-keys="handleSelectedKeysUpdate"')
    expect(accounts).toContain('adminAPI.accounts.batchDelete(accountIds)')
    expect(accounts).toContain('refreshAccountsAfterUpstreamBillingProbe')
    expect(proxies).toContain("case 'grok':")
    expect(proxies).toContain("return 'Grok'")
  })

  it('routes and configures the model plaza through the Jiufeng shell', () => {
    const router = read('../../router/index.ts')
    const header = read('JFAppHeader.vue')
    const plaza = read('JFModelPlazaView.vue')
    const settings = read('admin/SettingsView.vue')

    expect(router).toContain("path: '/model-plaza'")
    expect(router).toContain("@/views/home-jiufeng/JFModelPlazaView.vue")
    expect(router).toContain('model_plaza_require_auth')
    expect(header).toContain('FeatureFlags.modelPlaza')
    expect(header).toContain("path: '/model-plaza'")
    expect(plaza).toContain('<JFAppLayout v-if="isEmbedded">')
    expect(plaza).toContain('ModelPlazaContent')
    expect(settings).toContain('form.model_plaza_enabled')
    expect(settings).toContain('form.model_plaza_require_auth')
    expect(settings).toContain('form.model_plaza_description')
  })

  it('includes complete v0.1.171 captcha and OAuth start flows', () => {
    const login = read('JFLoginView.vue')
    const register = read('JFRegisterView.vue')
    const forgotPassword = read('JFForgotPasswordView.vue')
    const emailVerify = read('JFEmailVerifyView.vue')

    for (const source of [login, register]) {
      expect(source).toContain("@/components/CaptchaChallenge.vue")
      expect(source).toContain('@start="handleOAuthStart"')
      expect(source).toContain('startOAuthLogin')
      expect(source).toContain('tencent_captcha_ticket')
      expect(source).toContain('aliyunCaptchaEnabled')
    }

    expect(login).toContain('authStore.loginWithPasskey(proof)')
    expect(forgotPassword).toContain("@/components/CaptchaChallenge.vue")
    expect(forgotPassword).toContain('acquireActionProof')
    expect(emailVerify).toContain('createAccountTurnstileRef')
    expect(emailVerify).toContain('acquireResendActionProof')
    expect(emailVerify).toContain('acquireCreateAccountActionProof')

    for (const callback of [
      'auth/DingTalkCallbackView.vue',
      'auth/DingTalkEmailCompletionView.vue',
      'auth/LinuxDoCallbackView.vue',
      'auth/OidcCallbackView.vue',
      'auth/WechatCallbackView.vue',
    ]) {
      const source = read(callback)
      expect(source).toContain('payload.turnstileToken')
      expect(source).toContain('payload.tencentCaptchaTicket')
    }
  })

  it('includes complete v0.1.171 admin surfaces', () => {
    const settings = read('admin/SettingsView.vue')
    const groups = read('admin/GroupsView.vue')
    const reasoning = read('admin/groupsReasoningEffort.ts')
    const orders = read('admin/orders/AdminOrdersView.vue')
    const accounts = read('admin/AccountsView.vue')

    expect(settings).toContain('captchaMasterEnabled')
    expect(settings).toContain('captchaProviderSelection')
    expect(settings).toContain('tencent_captcha_cloud_secret_key')
    expect(settings).toContain('aliyun_captcha_access_key_secret')
    expect(settings).toContain('openai_codex_client_version_synced')
    expect(settings).toContain('openai_codex_version_auto_sync_enabled')
    expect(settings).toContain('codexSyncedVersionLabel')

    expect(groups).toContain('supportsReasoningEffortPolicyPlatform(createForm.platform)')
    expect(groups).toContain('supportsReasoningEffortPolicyPlatform(editForm.platform)')
    expect(reasoning).toContain('platform === "openai" || platform === "composite"')

    expect(orders).toContain(':require-force="refundRequireForce"')
    expect(orders).toContain('res.data.require_force')
    expect(accounts).toContain('@account-updated="handleAccountUpdated"')
  })

  it('includes complete v0.1.172 Tencent captcha region support', () => {
    const settings = read('admin/SettingsView.vue')
    expect(settings).toContain('data-testid="tencent-captcha-region-intl"')
    expect(settings).toContain('tencent_captcha_region: form.tencent_captcha_region')
    expect(settings).toContain('tencentCaptchaLinks')

    for (const component of [
      'JFLoginView.vue',
      'JFRegisterView.vue',
      'JFForgotPasswordView.vue',
      'JFEmailVerifyView.vue',
    ]) {
      const source = read(component)
      expect(source).toContain(':tencent-region="tencentCaptchaRegion"')
      expect(source).toContain("settings.tencent_captcha_region || 'cn'")
    }
  })

  it('includes complete v0.1.172 usage model audit and custom ops ranges', () => {
    const usage = read('admin/UsageView.vue')
    expect(usage.match(/upstream_model_mismatch: filters\.value\.upstream_model_mismatch/g)).toHaveLength(2)
    expect(usage).toContain("t('usage.upstreamResponseModel')")
    expect(usage).toContain('log.upstream_response_model')
    expect(usage).toContain('log.upstream_model_mismatch')

    const opsDashboard = read('admin/ops/OpsDashboard.vue')
    const opsDetails = read('admin/ops/components/OpsErrorDetailsModal.vue')
    expect(opsDashboard).toContain(':custom-start-time="customStartTime"')
    expect(opsDashboard).toContain(':custom-end-time="customEndTime"')
    expect(opsDetails).toContain('buildOpsErrorTimeParams')
  })

  it('shows the full balance breakdown on desktop hover', () => {
    const header = read('JFAppHeader.vue')
    expect(header).toContain('group-hover:block')
    expect(header).toContain('{{ balanceAvailableText }}')
    expect(header).toContain('{{ balanceFrozenText }}')
    expect(header).toContain('{{ balanceTotalText }}')
  })

  it('includes complete v0.1.175 frontend capabilities', () => {
    const usage = read('admin/UsageView.vue')
    const channels = read('admin/ChannelsView.vue')
    const imagePricing = read('admin/groupsImagePricing.ts')
    const opsHeader = read('admin/ops/components/OpsDashboardHeader.vue')
    const opsFormatters = read('admin/ops/utils/opsFormatters.ts')
    const sidebar = read('JFAppSidebar.vue')
    const backup = read('admin/BackupView.vue')

    expect(usage).toContain("{ key: 'request_id', label: t('admin.usage.requestId')")
    expect(usage).toContain("const HIDDEN_COLUMNS_CURRENT_VERSION = 'request-id-hidden-by-default'")
    expect(channels).toContain("value: 'response_model'")
    expect(imagePricing).toContain('"composite"')
    expect(opsHeader).toContain('formatMemorySizeMB(systemMetrics.memory_used_mb)')
    expect(opsFormatters).toContain('export function formatMemorySizeMB')
    expect(sidebar).toContain("{ path: '/admin/risk-control', label: t('nav.riskControl'), icon: ShieldIcon, featureFlag: flagRiskControl }")
    expect(sidebar).toContain("{ path: '/admin/prompt-audit', label: t('nav.promptAudit'), icon: ShieldIcon, featureFlag: flagRiskControl }")
    expect(backup).toContain('v-if="record.status !== \'running\'"')
    expect(backup).toContain('downloadPartsModalOpen')
  })

  it('includes current group model pricing and Grok usage refresh behavior', () => {
    const groups = read('admin/GroupsView.vue')
    const accounts = read('admin/AccountsView.vue')

    expect(groups).toContain('createForm.long_context_pricing_enabled')
    expect(groups).toContain('editForm.long_context_pricing_enabled')
    expect(groups).toContain('PricingEntryCard')
    expect(groups).toContain('groupPricingFromAPI')
    expect(groups).toContain('groupPricingToAPI')
    expect(groups).toContain('model_pricing: groupPricingToAPI')

    expect(accounts).toContain('buildGrokUsageRefreshKey')
    expect(accounts).toContain('extra.grok_usage_snapshot')
    expect(accounts).toContain('plan_from_45_responses')
    expect(accounts).toContain("return 'SuperGrok Heavy'")
  })

  it('includes complete v0.1.177 group usage and account loading fixes', () => {
    const groups = read('admin/GroupsView.vue')
    const accounts = read('admin/AccountsView.vue')

    expect(groups).toContain('usageMap.get(row.id)?.yesterday_cost')
    expect(groups).toContain('yesterday_cost: item.yesterday_cost')
    expect(groups).toContain('adminAPI.groups.getUsageSummary()')
    expect(accounts).toContain('Promise.allSettled')
    expect(accounts).toContain("console.error('Failed to load proxies:'")
    expect(accounts).toContain("console.error('Failed to load groups:'")
  })

  it('includes complete v0.1.178 channel pricing and monitor capabilities', () => {
    const channels = read('admin/ChannelsView.vue')
    const groups = read('admin/GroupsView.vue')
    const settings = read('admin/SettingsView.vue')
    const monitor = read('admin/ChannelMonitorView.vue')

    expect(channels).toContain('enable-time-pricing')
    expect(channels).toContain('enable-tier-multipliers')
    expect(channels).toContain('apiTimePricingToForm')
    expect(channels).toContain('formTimePricingToAPI')
    expect(channels).toContain('validateTimePricing')
    expect(channels).toContain('fast_multiplier: entry.fast_multiplier')
    expect(channels).toContain('flex_multiplier: entry.flex_multiplier')
    expect(channels).toContain("'kimi', 'zhipu', 'deepseek'")

    expect(groups).toContain('...GROUP_PLATFORM_OPTIONS')
    expect(groups).toContain('...CONCRETE_PLATFORM_OPTIONS')
    expect(groups).toContain('supportsLivePlatform(createForm.platform)')
    expect(groups).toContain('supportsLivePlatform(editForm.platform)')
    expect(groups).toContain('time_pricing: createDefaultTimePricingForm()')

    expect(settings).toContain('v-model="form.channel_monitor_show_quota"')
    expect(settings).toContain('channel_monitor_show_quota: Boolean(form.channel_monitor_show_quota)')
    expect(monitor).toContain('checkModeLabel(row.check_mode)')
    expect(monitor).toContain('checkModeBadgeClass(row.check_mode)')
  })

  it('includes complete v0.1.179 platform catalogs, policy summaries, and UI fixes', () => {
    const subscriptions = read('admin/SubscriptionsView.vue')
    const opsHeader = read('admin/ops/components/OpsDashboardHeader.vue')
    const opsDistribution = read('admin/ops/components/OpsErrorDistributionChart.vue')
    const settings = read('admin/SettingsView.vue')
    const announcements = read('admin/AnnouncementsView.vue')
    const header = read('JFAppHeader.vue')
    const createAccount = read('../../components/account/CreateAccountModal.vue')
    const editAccount = read('../../components/account/EditAccountModal.vue')

    expect(subscriptions).toContain('...GROUP_PLATFORM_OPTIONS')
    expect(opsHeader).toContain('...CONCRETE_PLATFORM_OPTIONS')
    expect(opsHeader).toContain('(overview.value?.request_count_sla ?? 0) <= 0')
    expect(opsDistribution).toContain('{{ item.label }} {{ item.count }}')
    expect(settings).toContain('openai-fast-policy-summary-')
    expect(settings).toContain('hasOpenAIFastPolicyTargetModels')
    expect(announcements).toContain('admin.announcements.createFirstAnnouncement')
    expect(header).toContain("t('admin.users.roles.' + user.role)")

    expect(createAccount).toContain("const apiProtocol = ref<CnApiProtocol>('adaptive')")
    expect(createAccount).toContain('adaptiveBaseUrls')
    expect(editAccount).toContain("const editApiProtocol = ref<CnApiProtocol>('adaptive')")
  })
})
