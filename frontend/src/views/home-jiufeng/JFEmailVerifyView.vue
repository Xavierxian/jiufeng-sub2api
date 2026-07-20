<template>
  <main class="jf-verify-page">
    <header class="jf-verify-header">
      <router-link to="/home" class="jf-brand" :aria-label="`${brandName} home`">
        <strong>{{ brandMark }}</strong>
        <span>{{ brandName }}</span>
      </router-link>

      <div class="jf-header-actions">
        <LocaleSwitcher />
        <router-link to="/home" class="jf-home-link">{{ verifyCopy.backHome }}</router-link>
      </div>
    </header>

    <section class="jf-verify-shell" :class="{ 'jf-verify-shell--en': !isZhLocale }">
      <aside class="jf-verify-hero" aria-hidden="true">
        <p class="jf-hero-kicker">{{ verifyCopy.heroKicker }}</p>
        <h1>
          <span>{{ verifyCopy.heroTitleTop }}</span>
          <span>{{ verifyCopy.heroTitleBottom }}</span>
        </h1>
        <p class="jf-hero-description">
          {{ verifyCopy.heroDescription }}
        </p>
        <div class="jf-hero-line" />
        <ul class="jf-feature-list">
          <li v-for="item in verifyCopy.heroFeatures" :key="item.text">
            <Icon :name="item.icon" size="sm" />
            {{ item.text }}
          </li>
        </ul>
      </aside>

      <section class="jf-verify-panel">
        <div class="jf-verify-card" aria-labelledby="verify-title">
          <div v-if="!hasRegisterData" class="jf-empty-state">
            <span class="jf-state-icon">
              <Icon name="exclamationCircle" size="lg" />
            </span>
            <strong>{{ brandName }}</strong>
            <p>{{ verifyCopy.productSubtitle }}</p>
            <h2 id="verify-title">{{ t('auth.sessionExpired') }}</h2>
            <span>{{ t('auth.sessionExpiredDesc') }}</span>
            <button type="button" class="jf-submit" @click="handleBack">
              <Icon name="arrowLeft" size="md" />
              <span>{{ t('auth.backToRegistration') }}</span>
            </button>
          </div>

          <form v-else class="jf-form" @submit.prevent="handleVerify">
            <div class="jf-card-heading">
              <strong>{{ brandName }}</strong>
              <p>{{ verifyCopy.productSubtitle }}</p>
              <h2 id="verify-title">{{ verifyCopy.title }}</h2>
              <span>
                {{ verifyCopy.description }}
                <b>{{ email }}</b>
              </span>
            </div>

            <div class="jf-field">
              <label for="code">{{ t('auth.verificationCode') }}</label>
              <input
                id="code"
                v-model="verifyCode"
                type="text"
                required
                autocomplete="one-time-code"
                inputmode="numeric"
                maxlength="6"
                :disabled="isLoading"
                class="jf-code-input"
                :class="{ 'is-error': errors.code }"
                placeholder="000000"
              />
              <p>{{ t('auth.verificationCodeHint') }}</p>
            </div>

            <div v-if="codeSent" class="jf-state jf-state-success">
              <Icon name="checkCircle" size="md" />
              <span>{{ t('auth.codeSentSuccess') }}</span>
            </div>

            <div v-if="turnstileEnabled && turnstileSiteKey && showResendTurnstile" class="jf-turnstile">
              <TurnstileWidget
                ref="turnstileRef"
                :site-key="turnstileSiteKey"
                @verify="onTurnstileVerify"
                @expire="onTurnstileExpire"
                @error="onTurnstileError"
              />
            </div>

            <button type="submit" class="jf-submit" :disabled="isLoading || !verifyCode">
              <svg v-if="isLoading" class="jf-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <Icon v-else name="checkCircle" size="md" />
              <span>{{ isLoading ? t('auth.verifying') : t('auth.verifyAndCreate') }}</span>
            </button>

            <div class="jf-resend">
              <button v-if="countdown > 0" type="button" disabled>
                {{ t('auth.resendCountdown', { countdown }) }}
              </button>
              <button
                v-else
                type="button"
                @click="handleResendCode"
                :disabled="
                  isSendingCode || (turnstileEnabled && showResendTurnstile && !resendTurnstileToken)
                "
              >
                <span v-if="isSendingCode">{{ t('auth.sendingCode') }}</span>
                <span v-else-if="turnstileEnabled && !showResendTurnstile">
                  {{ t('auth.clickToResend') }}
                </span>
                <span v-else>{{ t('auth.resendCode') }}</span>
              </button>
            </div>

            <button type="button" class="jf-back-link" @click="handleBack">
              <Icon name="arrowLeft" size="sm" />
              <span>{{ t('auth.backToRegistration') }}</span>
            </button>
          </form>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useAuthStore, useAppStore } from '@/stores'
import {
  persistOAuthTokenContext,
  getPublicSettings,
  isOAuthLoginCompletion,
  type PendingOAuthSendVerifyCodeResponse,
  sendPendingOAuthVerifyCode,
  sendVerifyCode,
} from '@/api/auth'
import { apiClient } from '@/api/client'
import { buildAuthErrorMessage } from '@/utils/authError'
import {
  formatRegistrationEmailSuffixWhitelistForMessage,
  isRegistrationEmailSuffixAllowed,
  normalizeRegistrationEmailSuffixWhitelist
} from '@/utils/registrationEmailPolicy'
import {
  clearAllAffiliateReferralCodes,
  loadAffiliateReferralCode,
  oauthAffiliatePayload
} from '@/utils/oauthAffiliate'

const { t, locale } = useI18n()

type VerifyFeatureIcon = 'lock' | 'shield' | 'clock'

const verifyCopies = {
  zh: {
    brandMark: '锋',
    brandName: '九锋',
    backHome: '← 返回首页',
    productSubtitle: '最安全的大模型中转平台',
    heroKicker: 'VERIFY · 邮箱确认',
    heroTitleTop: '验证邮箱',
    heroTitleBottom: '完成你的九锋账户',
    heroDescription: '输入发送到注册邮箱的 6 位验证码。验证完成后，我们会立即创建账户并带你进入控制台。',
    heroFeatures: [
      { icon: 'lock' as VerifyFeatureIcon, text: '邮箱确认 · 防止账户误用' },
      { icon: 'shield' as VerifyFeatureIcon, text: '验证码创建 · 不暴露凭据' },
      { icon: 'clock' as VerifyFeatureIcon, text: '验证即开通 · 秒级接入 API' },
    ],
    title: '验证邮箱',
    description: '验证码已发送至',
  },
  en: {
    brandMark: 'JF',
    brandName: 'Jiufeng',
    backHome: '← Back Home',
    productSubtitle: 'The safest large model relay platform',
    heroKicker: 'VERIFY · EMAIL CONFIRMATION',
    heroTitleTop: 'Verify email',
    heroTitleBottom: 'Finish your Jiufeng account',
    heroDescription: 'Enter the 6-digit code sent to your registration email. Once verified, your account will be created immediately.',
    heroFeatures: [
      { icon: 'lock' as VerifyFeatureIcon, text: 'Email confirmation · Prevent account misuse' },
      { icon: 'shield' as VerifyFeatureIcon, text: 'Code-based creation · No credential exposure' },
      { icon: 'clock' as VerifyFeatureIcon, text: 'Verify to activate · Seconds to API access' },
    ],
    title: 'Verify email',
    description: 'Verification code sent to',
  },
} as const

const isZhLocale = computed(() => locale.value.toLowerCase().startsWith('zh'))
const verifyCopy = computed(() => (isZhLocale.value ? verifyCopies.zh : verifyCopies.en))

// ==================== Router & Stores ====================

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

// ==================== State ====================

const isLoading = ref<boolean>(false)
const isSendingCode = ref<boolean>(false)
const errorMessage = ref<string>('')
const codeSent = ref<boolean>(false)
const verifyCode = ref<string>('')
const countdown = ref<number>(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

// Registration data from sessionStorage
type PendingAuthTokenField = 'pending_auth_token' | 'pending_oauth_token'
type PendingAuthSessionSummary = {
  token: string
  token_field: PendingAuthTokenField
  provider: string
  redirect?: string
}
type PendingOAuthCreateAccountResponse = {
  auth_result?: string
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
  provider?: string
  redirect?: string
}

const email = ref<string>('')
const password = ref<string>('')
const initialTurnstileToken = ref<string>('')
const promoCode = ref<string>('')
const invitationCode = ref<string>('')
const affCode = ref<string>('')
const pendingAuthToken = ref<string>('')
const pendingAuthTokenField = ref<PendingAuthTokenField>('pending_auth_token')
const pendingProvider = ref<string>('')
const pendingRedirect = ref<string>('')
const pendingAdoptionDecision = ref<{
  adoptDisplayName?: boolean
  adoptAvatar?: boolean
} | null>(null)
const hasRegisterData = ref<boolean>(false)

// Public settings
const turnstileEnabled = ref<boolean>(false)
const turnstileSiteKey = ref<string>('')
const siteName = ref<string>('Sub2API')
const registrationEmailSuffixWhitelist = ref<string[]>([])
const brandName = computed(() => verifyCopy.value.brandName)
const brandMark = computed(() => verifyCopy.value.brandMark)

// Turnstile for resend
const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const resendTurnstileToken = ref<string>('')
const showResendTurnstile = ref<boolean>(false)

const errors = ref({
  code: '',
  turnstile: ''
})

const validationToastMessage = computed(
  () => errors.value.code || errors.value.turnstile || ''
)

watch(validationToastMessage, (value, previousValue) => {
  if (value && value !== previousValue) {
    appStore.showError(value)
  }
})

// ==================== Lifecycle ====================

onMounted(async () => {
  const activePendingSession = authStore.pendingAuthSession as PendingAuthSessionSummary | null

  // Load registration data from sessionStorage
  const registerDataStr = sessionStorage.getItem('register_data')
  if (registerDataStr) {
    try {
      const registerData = JSON.parse(registerDataStr)
      email.value = registerData.email || ''
      password.value = registerData.password || ''
      initialTurnstileToken.value = registerData.turnstile_token || ''
      promoCode.value = registerData.promo_code || ''
      invitationCode.value = registerData.invitation_code || ''
      affCode.value = registerData.aff_code || loadAffiliateReferralCode()
      pendingAuthToken.value = registerData.pending_auth_token || activePendingSession?.token || ''
      pendingAuthTokenField.value = registerData.pending_auth_token_field || activePendingSession?.token_field || 'pending_auth_token'
      pendingProvider.value = registerData.pending_provider || activePendingSession?.provider || ''
      pendingRedirect.value = registerData.pending_redirect || activePendingSession?.redirect || ''
      pendingAdoptionDecision.value = registerData.pending_adoption_decision
        ? {
            adoptDisplayName: registerData.pending_adoption_decision.adopt_display_name === true,
            adoptAvatar: registerData.pending_adoption_decision.adopt_avatar === true
          }
        : null
      hasRegisterData.value = !!(email.value && password.value)
    } catch {
      hasRegisterData.value = false
    }
  } else if (activePendingSession) {
    pendingAuthToken.value = activePendingSession.token
    pendingAuthTokenField.value = activePendingSession.token_field
    pendingProvider.value = activePendingSession.provider
    pendingRedirect.value = activePendingSession.redirect || ''
  }

  // Load public settings
  try {
    const settings = await getPublicSettings()
    turnstileEnabled.value = settings.turnstile_enabled
    turnstileSiteKey.value = settings.turnstile_site_key || ''
    siteName.value = settings.site_name || 'Sub2API'
    registrationEmailSuffixWhitelist.value = normalizeRegistrationEmailSuffixWhitelist(
      settings.registration_email_suffix_whitelist || []
    )
  } catch (error) {
    console.error('Failed to load public settings:', error)
  }

  // Auto-send verification code if we have valid data
  if (hasRegisterData.value) {
    await sendCode()
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})

// ==================== Countdown ====================

function startCountdown(seconds: number): void {
  countdown.value = seconds

  if (countdownTimer) {
    clearInterval(countdownTimer)
  }

  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }
  }, 1000)
}

// ==================== Turnstile Handlers ====================

function onTurnstileVerify(token: string): void {
  resendTurnstileToken.value = token
  errors.value.turnstile = ''
}

function onTurnstileExpire(): void {
  resendTurnstileToken.value = ''
  errors.value.turnstile = t('auth.turnstileExpired')
}

function onTurnstileError(): void {
  resendTurnstileToken.value = ''
  errors.value.turnstile = t('auth.turnstileFailed')
}

function isPendingOAuthFlow(): boolean {
  return Boolean(pendingProvider.value.trim())
}

function shouldBypassRegistrationEmailPolicy(): boolean {
  return isPendingOAuthFlow() || Boolean(pendingAuthToken.value.trim())
}

function resolvePendingOAuthCallbackRoute(provider: string): string {
  switch (provider.trim().toLowerCase()) {
    case 'linuxdo':
      return '/auth/linuxdo/callback'
    case 'oidc':
      return '/auth/oidc/callback'
    case 'wechat':
      return '/auth/wechat/callback'
    default:
      return '/auth/callback'
  }
}

function isPendingOAuthSessionResponse(data: PendingOAuthCreateAccountResponse): boolean {
  return data.auth_result === 'pending_session'
}

function getPendingOAuthSendCodeSessionResponse(
  data: PendingOAuthSendVerifyCodeResponse,
): PendingOAuthSendVerifyCodeResponse | null {
  return data.auth_result === 'pending_session' ? data : null
}

function persistPendingOAuthSession(provider: string, redirect?: string): void {
  authStore.setPendingAuthSession({
    token: pendingAuthToken.value,
    token_field: pendingAuthTokenField.value,
    provider: provider.trim() || pendingProvider.value.trim(),
    redirect: redirect || pendingRedirect.value || undefined,
  })
}

// ==================== Send Code ====================

async function sendCode(): Promise<void> {
  isSendingCode.value = true
  errorMessage.value = ''

  try {
    if (!shouldBypassRegistrationEmailPolicy() && !isRegistrationEmailSuffixAllowed(email.value, registrationEmailSuffixWhitelist.value)) {
      errorMessage.value = buildEmailSuffixNotAllowedMessage()
      appStore.showError(errorMessage.value)
      return
    }

    const requestPayload = {
      email: email.value,
      [pendingAuthTokenField.value]: pendingAuthToken.value || undefined,
      // 优先使用重发时新获取的 token（因为初始 token 可能已被使用）
      turnstile_token: resendTurnstileToken.value || initialTurnstileToken.value || undefined
    } as Parameters<typeof sendVerifyCode>[0]
    const response = isPendingOAuthFlow()
      ? await sendPendingOAuthVerifyCode(requestPayload)
      : await sendVerifyCode(requestPayload)

    const pendingSendCodeSession = isPendingOAuthFlow()
      ? getPendingOAuthSendCodeSessionResponse(response as PendingOAuthSendVerifyCodeResponse)
      : null
    if (pendingSendCodeSession) {
      sessionStorage.removeItem('register_data')
      persistPendingOAuthSession(
        pendingSendCodeSession.provider || pendingProvider.value,
        pendingSendCodeSession.redirect,
      )
      await router.push(
        resolvePendingOAuthCallbackRoute(pendingSendCodeSession.provider || pendingProvider.value),
      )
      return
    }

    codeSent.value = true
    startCountdown(response.countdown)

    // Reset turnstile state（token 已使用，清除以避免重复使用）
    initialTurnstileToken.value = ''
    showResendTurnstile.value = false
    resendTurnstileToken.value = ''
  } catch (error: unknown) {
    errorMessage.value = buildAuthErrorMessage(error, {
      fallback: t('auth.sendCodeFailed')
    })

    appStore.showError(errorMessage.value)
  } finally {
    isSendingCode.value = false
  }
}

// ==================== Handlers ====================

async function handleResendCode(): Promise<void> {
  // If turnstile is enabled and we haven't shown it yet, show it
  if (turnstileEnabled.value && !showResendTurnstile.value) {
    showResendTurnstile.value = true
    return
  }

  // If turnstile is enabled but no token yet, wait
  if (turnstileEnabled.value && !resendTurnstileToken.value) {
    errors.value.turnstile = t('auth.completeVerification')
    return
  }

  await sendCode()
}

function validateForm(): boolean {
  errors.value.code = ''

  if (!verifyCode.value.trim()) {
    errors.value.code = t('auth.codeRequired')
    return false
  }

  if (!/^\d{6}$/.test(verifyCode.value.trim())) {
    errors.value.code = t('auth.invalidCode')
    return false
  }

  return true
}

async function handleVerify(): Promise<void> {
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    if (!shouldBypassRegistrationEmailPolicy() && !isRegistrationEmailSuffixAllowed(email.value, registrationEmailSuffixWhitelist.value)) {
      errorMessage.value = buildEmailSuffixNotAllowedMessage()
      appStore.showError(errorMessage.value)
      return
    }

    if (isPendingOAuthFlow()) {
      const payload: Record<string, unknown> = {
        email: email.value,
        password: password.value,
        verify_code: verifyCode.value.trim(),
        ...oauthAffiliatePayload(affCode.value || loadAffiliateReferralCode()),
      }
      if (invitationCode.value) {
        payload.invitation_code = invitationCode.value
      }
      if (pendingAdoptionDecision.value?.adoptDisplayName !== undefined) {
        payload.adopt_display_name = pendingAdoptionDecision.value.adoptDisplayName
      }
      if (pendingAdoptionDecision.value?.adoptAvatar !== undefined) {
        payload.adopt_avatar = pendingAdoptionDecision.value.adoptAvatar
      }

      const { data } = await apiClient.post<PendingOAuthCreateAccountResponse>(
        '/auth/oauth/pending/create-account',
        payload
      )
      if (isPendingOAuthSessionResponse(data)) {
        sessionStorage.removeItem('register_data')
        persistPendingOAuthSession(data.provider || pendingProvider.value, data.redirect)
        await router.push(resolvePendingOAuthCallbackRoute(data.provider || pendingProvider.value))
        return
      }
      if (!isOAuthLoginCompletion(data)) {
        throw new Error(t('auth.verifyFailed'))
      }

      persistOAuthTokenContext(data)
      await authStore.setToken(data.access_token)
      authStore.clearPendingAuthSession?.()
    } else {
      // Register with verification code
      await authStore.register({
        email: email.value,
        password: password.value,
        verify_code: verifyCode.value.trim(),
        turnstile_token: initialTurnstileToken.value || undefined,
        promo_code: promoCode.value || undefined,
        invitation_code: invitationCode.value || undefined,
        ...(affCode.value ? { aff_code: affCode.value } : {})
      })
    }

    // Clear session data
    sessionStorage.removeItem('register_data')
    clearAllAffiliateReferralCodes()

    // Show success toast
    appStore.showSuccess(t('auth.accountCreatedSuccess', { siteName: siteName.value }))

    // Redirect to dashboard
    await router.push(pendingRedirect.value || '/dashboard')
  } catch (error: unknown) {
    errorMessage.value = buildAuthErrorMessage(error, {
      fallback: t('auth.verifyFailed')
    })

    appStore.showError(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

function handleBack(): void {
  // Clear session data
  sessionStorage.removeItem('register_data')

  // Go back to registration
  router.push('/register')
}

function buildEmailSuffixNotAllowedMessage(): string {
  const normalizedWhitelist = normalizeRegistrationEmailSuffixWhitelist(
    registrationEmailSuffixWhitelist.value
  )
  if (normalizedWhitelist.length === 0) {
    return t('auth.emailSuffixNotAllowed')
  }
  const separator = String(locale.value || '').toLowerCase().startsWith('zh') ? '、' : ', '
  return t('auth.emailSuffixNotAllowedWithAllowed', {
    suffixes: formatRegistrationEmailSuffixWhitelistForMessage(normalizedWhitelist, {
      separator,
      more: (count) => t('auth.emailSuffixAllowedMore', { count })
    })
  })
}
</script>

<style scoped>
.jf-verify-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    linear-gradient(rgba(14, 159, 140, .055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14, 159, 140, .055) 1px, transparent 1px),
    radial-gradient(circle at 50% 26%, rgba(20, 184, 166, .16), transparent 34%),
    #f8fcfb;
  background-size: 128px 128px, 128px 128px, auto, auto;
  color: #142033;
}

.jf-verify-page::before {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, .76), rgba(255, 255, 255, .2) 42%, rgba(255, 255, 255, .88)),
    radial-gradient(circle at 50% 68%, rgba(255, 255, 255, .9), transparent 38%);
  content: "";
  pointer-events: none;
}

.jf-verify-header {
  position: relative;
  z-index: 2;
  display: flex;
  min-height: 76px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 20px clamp(22px, 4vw, 56px);
}

.jf-brand,
.jf-header-actions,
.jf-home-link,
.jf-back-link {
  display: inline-flex;
  align-items: center;
}

.jf-brand {
  gap: 11px;
  color: #132033;
  font-weight: 850;
  text-decoration: none;
}

.jf-brand-mark {
  display: inline-grid;
  width: 38px;
  height: 38px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(14, 159, 140, .18);
  border-radius: 12px;
  background: rgba(255, 255, 255, .84);
  color: #0e9f8c;
  box-shadow: 0 10px 24px rgba(15, 23, 42, .08);
}

.jf-brand-mark img,
.jf-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.jf-brand > span:last-child {
  font-size: 16px;
}

.jf-header-actions {
  gap: 12px;
}

.jf-home-link {
  min-height: 36px;
  padding: 0 14px;
  border: 1px solid rgba(203, 213, 225, .82);
  border-radius: 999px;
  background: rgba(255, 255, 255, .74);
  color: #516173;
  font-size: 13px;
  font-weight: 760;
  text-decoration: none;
}

.jf-home-link:hover {
  border-color: rgba(14, 159, 140, .3);
  color: #0e9f8c;
}

.jf-verify-shell {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: calc(100vh - 76px);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 22px 18px 42px;
}

.jf-brand-block {
  margin-bottom: 30px;
  text-align: center;
}

.jf-logo {
  display: inline-grid;
  width: 88px;
  height: 88px;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(14, 159, 140, .18);
  border-radius: 24px;
  background: rgba(255, 255, 255, .78);
  color: #0e9f8c;
  font-size: 28px;
  font-weight: 900;
  box-shadow: 0 18px 38px rgba(14, 159, 140, .13);
}

.jf-brand-block h1 {
  margin: 22px 0 8px;
  color: #0e9f8c;
  font-size: clamp(44px, 6vw, 58px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0;
}

.jf-brand-block p {
  margin: 0;
  color: #687386;
  font-size: clamp(20px, 2.2vw, 27px);
  line-height: 1.25;
}

.jf-verify-card {
  width: min(100%, 780px);
  padding: clamp(34px, 5vw, 58px) clamp(24px, 6vw, 58px);
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, .78);
  border-radius: 28px;
  background: rgba(255, 255, 255, .86);
  box-shadow: 0 26px 70px rgba(15, 23, 42, .08);
  backdrop-filter: blur(18px);
}

.jf-card-heading {
  text-align: center;
}

.jf-card-heading h2 {
  margin: 0;
  color: #172033;
  font-size: clamp(32px, 4vw, 44px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0;
}

.jf-card-heading span {
  display: block;
  margin-top: 16px;
  color: #707a8c;
  font-size: clamp(16px, 1.8vw, 22px);
  font-weight: 650;
  line-height: 1.5;
}

.jf-card-heading strong {
  color: #172033;
  font-weight: 850;
}

.jf-form {
  margin-top: 34px;
}

.jf-field label {
  display: block;
  margin-bottom: 14px;
  color: #1f2937;
  font-size: 20px;
  font-weight: 760;
  text-align: center;
}

.jf-field p {
  margin: 12px 0 0;
  color: #7b8494;
  font-size: 14px;
  font-weight: 650;
  text-align: center;
}

.jf-code-input {
  width: 100%;
  height: 78px;
  border: 2px solid rgba(20, 184, 166, .72);
  border-radius: 22px;
  background: rgba(255, 255, 255, .95);
  color: #172033;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 850;
  letter-spacing: .42em;
  outline: 0;
  padding: 0 0 0 .42em;
  text-align: center;
  transition:
    border-color .18s ease,
    box-shadow .18s ease,
    background .18s ease;
}

.jf-code-input:focus {
  border-color: #0e9f8c;
  box-shadow: 0 0 0 5px rgba(20, 184, 166, .13);
}

.jf-code-input.is-error {
  border-color: #ef4444;
  box-shadow: 0 0 0 5px rgba(239, 68, 68, .12);
}

.jf-code-input::placeholder {
  color: #c2cad6;
}

.jf-state {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 22px;
  border-radius: 18px;
  padding: 16px 18px;
  font-size: 15px;
  font-weight: 720;
}

.jf-state-success {
  border: 1px solid rgba(14, 159, 140, .2);
  background: rgba(14, 159, 140, .09);
  color: #087f70;
}

.jf-state-warning {
  border: 1px solid rgba(245, 158, 11, .26);
  background: rgba(245, 158, 11, .1);
  color: #92400e;
}

.jf-state strong {
  display: block;
  color: currentColor;
}

.jf-state p {
  margin: 5px 0 0;
  color: currentColor;
  font-weight: 600;
  line-height: 1.5;
}

.jf-turnstile {
  overflow: hidden;
  margin-top: 24px;
  border-radius: 12px;
}

.jf-submit {
  display: flex;
  width: 100%;
  min-height: 72px;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
  border: 0;
  border-radius: 20px;
  background: #0e9f8c;
  color: #fff;
  font-size: 22px;
  font-weight: 850;
  box-shadow: 0 16px 32px rgba(14, 159, 140, .22);
  cursor: pointer;
  transition:
    transform .18s ease,
    background .18s ease,
    opacity .18s ease;
}

.jf-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #087f70;
}

.jf-submit:disabled,
.jf-resend button:disabled {
  cursor: not-allowed;
  opacity: .62;
}

.jf-spin {
  width: 24px;
  height: 24px;
  animation: jfSpin .9s linear infinite;
}

.jf-spin circle {
  opacity: .25;
}

.jf-spin path {
  opacity: .85;
}

.jf-resend {
  margin-top: 22px;
  text-align: center;
}

.jf-resend button,
.jf-back-link {
  border: 0;
  background: transparent;
  color: #0e9f8c;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
}

.jf-back-link {
  gap: 8px;
  margin-top: 26px;
}

.jf-resend button:not(:disabled):hover,
.jf-back-link:hover {
  color: #087f70;
}

@keyframes jfSpin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .jf-verify-page {
    overflow-y: auto;
  }

  .jf-verify-header {
    padding: 18px;
  }

  .jf-brand > span:last-child {
    display: none;
  }

  .jf-header-actions {
    gap: 8px;
  }

  .jf-home-link {
    padding: 0 10px;
    font-size: 12px;
  }

  .jf-verify-shell {
    justify-content: flex-start;
    padding-top: 24px;
  }

  .jf-logo {
    width: 74px;
    height: 74px;
    border-radius: 20px;
  }

  .jf-brand-block {
    margin-bottom: 24px;
  }

  .jf-verify-card {
    border-radius: 22px;
    padding: 32px 20px;
  }

  .jf-code-input,
  .jf-submit {
    min-height: 62px;
    height: auto;
    border-radius: 18px;
  }

  .jf-submit {
    font-size: 17px;
  }

  .jf-field label {
    font-size: 17px;
  }
}

.jf-verify-page {
  min-height: 100vh;
  overflow: visible;
  background:
    radial-gradient(circle at 18% 18%, rgba(247, 247, 247, .92), transparent 28%),
    linear-gradient(90deg, #fff 0%, #fff 55%, #fbfbfb 100%);
  color: #151515;
  font-family: Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.jf-verify-page::before {
  display: none;
  content: none;
}

.jf-verify-header {
  position: fixed;
  z-index: 20;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  height: 86px;
  min-height: 0;
  align-items: center;
  justify-content: space-between;
  gap: 0;
  padding: 0 clamp(24px, 10.8vw, 220px);
  background: transparent;
  backdrop-filter: none;
}

.jf-brand {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  color: #101010;
  font-weight: 400;
  text-decoration: none;
}

.jf-brand strong {
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 30.4px;
  font-weight: 950;
  line-height: 1;
}

.jf-brand > span:last-child {
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 16.8px;
  font-weight: 800;
}

.jf-header-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.jf-home-link {
  min-height: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: #6c6c6c;
  font-size: 12px;
  font-weight: 400;
  text-decoration: none;
  transition: color .2s ease;
}

.jf-home-link:hover {
  color: #111;
}

.jf-header-actions :deep(.relative > button) {
  color: #111;
  background: #fff;
  font-size: 12px;
  font-weight: 400;
}

.jf-header-actions :deep(.relative > button:hover) {
  background: #f6f6f6;
}

.jf-header-actions :deep(.absolute) {
  border-color: #e5e5e5;
  background: #fff;
  box-shadow: 0 14px 30px rgba(15, 23, 42, .12);
}

.jf-header-actions :deep(.absolute button) {
  color: #111;
  background: #fff;
  font-size: 12px;
  font-weight: 400;
}

.jf-header-actions :deep(.absolute button:hover),
.jf-header-actions :deep(.absolute button.bg-primary-50) {
  color: #111;
  background: #f4f4f4;
}

.jf-verify-shell {
  position: static;
  z-index: auto;
  display: grid;
  grid-template-columns: minmax(520px, 1fr) 480px;
  min-height: 100vh;
  width: min(100% - 88px, 1430px);
  align-items: center;
  gap: clamp(70px, 6.4vw, 132px);
  margin: 0 auto;
  padding: 118px 0 56px;
}

.jf-verify-shell--en {
  grid-template-columns: minmax(560px, 1fr) 480px;
  gap: clamp(84px, 7.2vw, 150px);
}

.jf-verify-hero {
  align-self: end;
  max-width: 808px;
  padding: 0 0 104px clamp(0px, 2.7vw, 50px);
  transform: translate(17%, -3%);
}

.jf-hero-kicker {
  margin: 0 0 50px;
  color: #bebebe;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: .42em;
}

.jf-verify-shell--en .jf-hero-kicker {
  overflow: hidden;
  font-size: clamp(10px, .76vw, 12px);
  line-height: 1.2;
  letter-spacing: .34em;
  text-overflow: clip;
  white-space: nowrap;
}

.jf-verify-hero h1 {
  margin: 0;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.16;
}

.jf-verify-hero h1 span {
  display: block;
}

.jf-verify-hero h1 span:first-child {
  color: #080808;
  font-size: clamp(40.2px, 3.35vw, 61.8px);
}

.jf-verify-hero h1 span:last-child {
  color: #666;
  font-size: clamp(37.1px, 3.09vw, 56.7px);
}

.jf-hero-description {
  width: min(100%, 560px);
  margin: 38px 0 0;
  color: #6c6c6c;
  font-size: 14.4px;
  font-weight: 650;
  line-height: 1.72;
}

.jf-hero-line {
  width: min(100%, 520px);
  height: 1px;
  margin: 42px 0 34px;
  background: #e8e8e8;
}

.jf-feature-list {
  display: grid;
  gap: 11px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: #565656;
  font-size: 12px;
  font-weight: 400;
}

.jf-feature-list li {
  display: flex;
  align-items: center;
  gap: 11px;
  line-height: 1.2;
}

.jf-feature-list li :deep(svg) {
  width: 12px;
  height: 12px;
  color: #111;
  stroke-width: 1.8;
}

.jf-verify-panel {
  display: flex;
  justify-content: flex-end;
}

.jf-verify-card {
  width: 480px;
  min-height: 548px;
  overflow: visible;
  transform: translateX(-20%);
  padding: 58px 40px 34px;
  border: 1px solid #e7e7e7;
  border-radius: 21px;
  background: rgba(255, 255, 255, .88);
  box-shadow: 0 30px 64px rgba(20, 20, 20, .045);
  backdrop-filter: none;
}

.jf-verify-shell--en .jf-verify-card {
  transform: translateX(-8%);
}

.jf-card-heading,
.jf-empty-state {
  text-align: center;
}

.jf-card-heading strong,
.jf-card-heading h2,
.jf-empty-state strong,
.jf-empty-state h2 {
  font-family: "Noto Serif SC", "Songti SC", serif;
  color: #111;
}

.jf-card-heading strong,
.jf-empty-state strong {
  display: block;
  font-size: 30px;
  font-weight: 950;
}

.jf-card-heading p,
.jf-empty-state p {
  margin: 17px 0 38px;
  color: #9a9a9a;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 15px;
  font-style: italic;
  font-weight: 700;
}

.jf-card-heading h2,
.jf-empty-state h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 950;
}

.jf-card-heading span,
.jf-empty-state > span:not(.jf-state-icon) {
  display: block;
  margin-top: 13px;
  color: #777;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.55;
}

.jf-card-heading b {
  color: #151515;
  font-weight: 850;
}

.jf-form {
  margin-top: 0;
}

.jf-field {
  margin-top: 32px;
}

.jf-field label {
  display: block;
  margin-bottom: 12px;
  color: #242424;
  font-size: 14px;
  font-weight: 850;
  text-align: left;
}

.jf-field p {
  margin: 9px 0 0;
  color: #8d949f;
  font-size: 10.4px;
  font-weight: 600;
  text-align: left;
}

.jf-code-input {
  width: 100%;
  height: 54px;
  border: 1px solid #e7e7e7;
  border-radius: 11px;
  background: #fff;
  color: #202020;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 20px;
  font-weight: 800;
  letter-spacing: .42em;
  outline: 0;
  padding: 0 0 0 .42em;
  text-align: center;
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}

.jf-code-input:focus {
  border-color: #cfd6e2;
  box-shadow: 0 0 0 4px rgba(136, 155, 188, .1);
}

.jf-code-input.is-error {
  border-color: #df8b8b;
  box-shadow: 0 0 0 4px rgba(223, 139, 139, .1);
}

.jf-code-input::placeholder {
  color: #a8b0bd;
}

.jf-state {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  border: 1px solid #e7e7e7;
  border-radius: 12px;
  background: #fafafa;
  padding: 12px 14px;
  color: #333;
  font-size: 11.2px;
  font-weight: 700;
}

.jf-state-success {
  border-color: #e7e7e7;
  background: #fafafa;
  color: #333;
}

.jf-state-warning {
  border-color: #ead5a8;
  background: #fff8ea;
  color: #8a6015;
}

.jf-state-icon {
  display: inline-grid;
  width: 54px;
  height: 54px;
  place-items: center;
  margin: 0 auto 20px;
  border: 1px solid #e7e7e7;
  border-radius: 999px;
  background: #fff;
  color: #111;
}

.jf-empty-state {
  display: flex;
  min-height: 430px;
  flex-direction: column;
  justify-content: center;
}

.jf-turnstile {
  overflow: hidden;
  margin-top: 26px;
  border-radius: 4px;
}

.jf-submit {
  display: flex;
  width: 100%;
  height: 56px;
  min-height: 0;
  align-items: center;
  justify-content: center;
  gap: 13px;
  margin-top: 28px;
  border: 0;
  border-radius: 999px;
  background: #050505;
  color: #fff;
  font-size: 16px;
  font-weight: 900;
  box-shadow: 0 9px 16px rgba(38, 35, 30, .16);
  cursor: pointer;
  transition: transform .2s ease, background .2s ease, opacity .2s ease;
}

.jf-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #171717;
}

.jf-submit:disabled,
.jf-resend button:disabled {
  background: #858381;
  cursor: not-allowed;
  opacity: .62;
}

.jf-spin {
  width: 20px;
  height: 20px;
  animation: jfSpin .9s linear infinite;
}

.jf-resend {
  margin-top: 20px;
  text-align: center;
}

.jf-resend button,
.jf-back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: #151515;
  font-size: 11.2px;
  font-weight: 800;
  cursor: pointer;
}

.jf-resend button:disabled {
  background: transparent;
  color: #777;
}

.jf-back-link {
  width: 100%;
  margin-top: 14px;
}

.jf-resend button:not(:disabled):hover,
.jf-back-link:hover {
  color: #111;
}

@media (max-width: 1100px) {
  .jf-verify-shell {
    grid-template-columns: 1fr;
    width: min(100% - 44px, 500px);
    padding-top: 112px;
  }

  .jf-verify-hero {
    display: none;
  }

  .jf-verify-panel {
    justify-content: center;
  }

  .jf-verify-card {
    width: min(100%, 480px);
    transform: none;
  }
}

@media (min-width: 1101px) and (max-width: 1280px) {
  .jf-verify-shell--en {
    grid-template-columns: minmax(500px, 1fr) 440px;
    gap: 58px;
  }

  .jf-verify-shell--en .jf-verify-hero {
    transform: translate(3%, -3%);
  }

  .jf-verify-shell--en .jf-hero-kicker {
    font-size: 10px;
    letter-spacing: .22em;
  }

  .jf-verify-shell--en .jf-verify-card {
    width: 440px;
    transform: translateX(0);
  }
}

@media (max-width: 640px) {
  .jf-verify-page {
    background: #fff;
  }

  .jf-verify-header {
    position: static;
    height: auto;
    padding: 22px;
  }

  .jf-brand strong {
    font-size: 30px;
  }

  .jf-brand > span:last-child {
    display: none;
  }

  .jf-header-actions {
    gap: 10px;
  }

  .jf-home-link {
    padding: 0;
    font-size: 13px;
  }

  .jf-verify-shell {
    width: min(100% - 28px, 480px);
    min-height: auto;
    padding: 14px 0 38px;
  }

  .jf-verify-card {
    min-height: 0;
    width: 100%;
    padding: 36px 20px 28px;
    border-radius: 20px;
  }

  .jf-card-heading p,
  .jf-empty-state p {
    margin-bottom: 32px;
  }

  .jf-code-input,
  .jf-submit {
    height: 52px;
    border-radius: 11px;
  }

  .jf-empty-state {
    min-height: 360px;
  }
}
</style>
