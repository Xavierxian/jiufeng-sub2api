<template>
  <main class="sui-login-page">
    <header class="sui-login-header">
      <router-link to="/home" class="sui-brand" :aria-label="`${loginCopy.brandName} home`">
        <strong>{{ loginCopy.brandMark }}</strong>
        <span>{{ loginCopy.brandName }}</span>
      </router-link>

      <div class="sui-header-actions">
        <LocaleSwitcher />
        <router-link to="/home" class="sui-home-link">{{ loginCopy.backHome }}</router-link>
      </div>
    </header>

    <section class="sui-login-shell" :class="{ 'sui-login-shell--en': !isZhLocale }">
      <aside class="sui-hero-copy" :class="{ 'sui-hero-copy--en': !isZhLocale }" aria-hidden="true">
        <p class="sui-hero-kicker">{{ loginCopy.heroKicker }}</p>
        <h1>
          <span>{{ loginCopy.heroTitleTop }}</span>
          <span>{{ loginCopy.heroTitleBottom }}</span>
        </h1>
        <div class="sui-hero-line" />
        <ul>
          <li v-for="item in loginCopy.heroFeatures" :key="item.text"><Icon :name="item.icon" size="sm" /> {{ item.text }}</li>
        </ul>
      </aside>

      <section class="sui-card" aria-labelledby="login-title">
        <div class="sui-card-heading">
          <strong>{{ loginCopy.brandName }}</strong>
          <p>{{ loginCopy.subtitle }}</p>
          <h2 id="login-title">{{ loginCopy.title }}</h2>
          <span>{{ loginCopy.description }}</span>
        </div>

        <form class="sui-form" @submit.prevent="handleLogin">
          <div class="sui-field">
            <label for="email">{{ loginCopy.email }}</label>
            <div class="sui-input-wrap" :class="{ 'is-error': errors.email }">
              <Icon name="mail" size="md" />
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
                autofocus
                autocomplete="email"
                :disabled="authActionDisabled"
                :placeholder="t('auth.emailPlaceholder')"
              />
            </div>
          </div>

          <div class="sui-field">
            <label for="password">{{ loginCopy.password }}</label>
            <div class="sui-input-wrap sui-password-wrap" :class="{ 'is-error': errors.password }">
              <Icon name="lock" size="md" />
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                :disabled="authActionDisabled"
                :placeholder="t('auth.passwordPlaceholder')"
              />
              <button
                type="button"
                class="sui-eye"
                :disabled="authActionDisabled"
                :aria-label="showPassword ? loginCopy.hidePassword : loginCopy.showPassword"
                @click="showPassword = !showPassword"
              >
                <Icon v-if="showPassword" name="eyeOff" size="md" />
                <Icon v-else name="eye" size="md" />
              </button>
            </div>
            <router-link
              v-if="passwordResetEnabled && !backendModeEnabled"
              to="/forgot-password"
              class="sui-forgot"
            >
              {{ loginCopy.forgotPassword }}
            </router-link>
          </div>

          <div v-if="turnstileEnabled && turnstileSiteKey" class="sui-turnstile">
            <TurnstileWidget
              ref="turnstileRef"
              :site-key="turnstileSiteKey"
              @verify="onTurnstileVerify"
              @expire="onTurnstileExpire"
              @error="onTurnstileError"
            />
          </div>

          <button
            type="submit"
            class="sui-submit"
            :disabled="authActionDisabled || (turnstileEnabled && !turnstileToken)"
          >
            <svg
              v-if="isLoading"
              class="sui-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <Icon v-else name="login" size="md" />
            <span>{{ isLoading ? t('auth.signingIn') : loginCopy.submit }}</span>
          </button>

          <LoginAgreementPrompt
            v-if="loginAgreementEnabled"
            class="sui-agreement"
            :accepted="agreementAccepted"
            :documents="loginAgreementDocuments"
            :mode="loginAgreementMode"
            :updated-at="loginAgreementUpdatedAt"
            :visible="showAgreementModal"
            @accept="acceptLoginAgreement"
            @reject="rejectLoginAgreement"
            @open="showAgreementModal = true"
          />

          <div v-if="showOAuthLogin" class="sui-oauth">
            <div class="sui-divider">
              <span>{{ loginCopy.oauthDivider }}</span>
            </div>

            <EmailOAuthButtons
              :disabled="authActionDisabled"
              :github-enabled="githubOAuthEnabled"
              :google-enabled="googleOAuthEnabled"
              :show-divider="false"
            />

            <LinuxDoOAuthSection
              v-if="linuxdoOAuthEnabled"
              :disabled="authActionDisabled"
              :show-divider="false"
            />
            <DingTalkOAuthSection
              v-if="dingtalkOAuthEnabled"
              :disabled="authActionDisabled"
              :show-divider="false"
            />
            <WechatOAuthSection
              v-if="wechatOAuthEnabled"
              :disabled="authActionDisabled"
              :show-divider="false"
            />
            <OidcOAuthSection
              v-if="oidcOAuthEnabled"
              :disabled="authActionDisabled"
              :provider-name="oidcOAuthProviderName"
              :show-divider="false"
            />
          </div>

          <p v-if="!backendModeEnabled" class="sui-register">
            {{ loginCopy.noAccount }}
            <router-link to="/register">{{ loginCopy.registerNow }}</router-link>
          </p>
        </form>
      </section>
    </section>
  </main>

  <TotpLoginModal
    v-if="show2FAModal"
    ref="totpModalRef"
    :temp-token="totpTempToken"
    :user-email-masked="totpUserEmailMasked"
    @verify="handle2FAVerify"
    @cancel="handle2FACancel"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LinuxDoOAuthSection from '@/components/auth/LinuxDoOAuthSection.vue'
import DingTalkOAuthSection from '@/components/auth/DingTalkOAuthSection.vue'
import OidcOAuthSection from '@/components/auth/OidcOAuthSection.vue'
import WechatOAuthSection from '@/components/auth/WechatOAuthSection.vue'
import EmailOAuthButtons from '@/components/auth/EmailOAuthButtons.vue'
import LoginAgreementPrompt from '@/components/auth/LoginAgreementPrompt.vue'
import TotpLoginModal from '@/components/auth/TotpLoginModal.vue'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useAuthStore, useAppStore } from '@/stores'
import { getPublicSettings, isTotp2FARequired, isWeChatWebOAuthEnabled } from '@/api/auth'
import type { LoginAgreementDocument, TotpLoginResponse } from '@/types'
import { extractI18nErrorMessage } from '@/utils/apiError'
import { clearAllAffiliateReferralCodes } from '@/utils/oauthAffiliate'

const { t, locale } = useI18n()
const LOGIN_AGREEMENT_STORAGE_KEY = 'sub2api_login_agreement_consent'

type LoginFeatureIcon = 'lock' | 'shield' | 'clock'

const loginCopies = {
  zh: {
    brandMark: '锋',
    brandName: '九锋',
    backHome: '← 返回首页',
    heroKicker: '隐私 · 透明 · 一念可达',
    heroTitleTop: '一念之轻',
    heroTitleBottom: '接万模之响',
    heroFeatures: [
      { icon: 'lock' as LoginFeatureIcon, text: '不存请求体 · 不参与训练' },
      { icon: 'shield' as LoginFeatureIcon, text: '全链路 TLS · 全程可审计' },
      { icon: 'clock' as LoginFeatureIcon, text: '注册即开 · 秒级接入' },
    ],
    subtitle: '最安全的大模型中转平台',
    title: '欢迎回来',
    description: '登录您的账户以继续',
    email: '邮箱',
    password: '密码',
    showPassword: '显示密码',
    hidePassword: '隐藏密码',
    forgotPassword: '忘记密码?',
    submit: '登录',
    oauthDivider: '或使用快捷登录',
    noAccount: '还没有账户?',
    registerNow: '立即注册',
    agreementReject: '未同意最新条款前，无法输入账号密码或使用快捷登录。',
    agreementRequired: '请先阅读并同意最新条款后再登录。',
  },
  en: {
    brandMark: 'JF',
    brandName: 'Jiufeng',
    backHome: '← Back Home',
    heroKicker: 'PRIVATE · TRANSPARENT · ONE THOUGHT AWAY',
    heroTitleTop: 'Light as Thought',
    heroTitleBottom: 'Echoing Every Model',
    heroFeatures: [
      { icon: 'lock' as LoginFeatureIcon, text: 'No request body storage · No training' },
      { icon: 'shield' as LoginFeatureIcon, text: 'End-to-end TLS · Fully auditable' },
      { icon: 'clock' as LoginFeatureIcon, text: 'Instant signup · Seconds to connect' },
    ],
    subtitle: 'The safest large-model relay platform',
    title: 'Welcome Back',
    description: 'Sign in to continue',
    email: 'Email',
    password: 'Password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    forgotPassword: 'Forgot password?',
    submit: 'Sign In',
    oauthDivider: 'Or continue with quick login',
    noAccount: 'No account yet?',
    registerNow: 'Create one',
    agreementReject: 'You must accept the latest terms before entering credentials or using quick login.',
    agreementRequired: 'Please read and accept the latest terms before signing in.',
  },
} as const

const isZhLocale = computed(() => locale.value.toLowerCase().startsWith('zh'))
const loginCopy = computed(() => (isZhLocale.value ? loginCopies.zh : loginCopies.en))

const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const isLoading = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const publicSettingsLoaded = ref(false)

const turnstileEnabled = ref(false)
const turnstileSiteKey = ref('')
const linuxdoOAuthEnabled = ref(false)
const dingtalkOAuthEnabled = ref(false)
const wechatOAuthEnabled = ref(false)
const backendModeEnabled = ref(false)
const oidcOAuthEnabled = ref(false)
const oidcOAuthProviderName = ref('OIDC')
const githubOAuthEnabled = ref(false)
const googleOAuthEnabled = ref(false)
const passwordResetEnabled = ref(false)
const loginAgreementEnabled = ref(false)
const loginAgreementMode = ref<'modal' | 'checkbox' | string>('modal')
const loginAgreementUpdatedAt = ref('')
const loginAgreementRevision = ref('')
const loginAgreementDocuments = ref<LoginAgreementDocument[]>([])
const agreementAccepted = ref(false)
const showAgreementModal = ref(false)

const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const turnstileToken = ref('')

const show2FAModal = ref(false)
const totpTempToken = ref('')
const totpUserEmailMasked = ref('')
const totpModalRef = ref<InstanceType<typeof TotpLoginModal> | null>(null)

const formData = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
  turnstile: '',
})

const validationToastMessage = computed(
  () => errors.email || errors.password || errors.turnstile || '',
)
const agreementGateActive = computed(
  () => loginAgreementEnabled.value && !agreementAccepted.value,
)
const authActionDisabled = computed(
  () => isLoading.value || !publicSettingsLoaded.value || agreementGateActive.value,
)
const showOAuthLogin = computed(
  () =>
    !backendModeEnabled.value &&
    (linuxdoOAuthEnabled.value ||
      dingtalkOAuthEnabled.value ||
      wechatOAuthEnabled.value ||
      oidcOAuthEnabled.value ||
      githubOAuthEnabled.value ||
      googleOAuthEnabled.value),
)

watch(validationToastMessage, (value, previousValue) => {
  if (value && value !== previousValue) {
    appStore.showError(value)
  }
})

onMounted(async () => {
  const expiredFlag = sessionStorage.getItem('auth_expired')
  if (expiredFlag) {
    sessionStorage.removeItem('auth_expired')
    const message = t('auth.reloginRequired')
    errorMessage.value = message
    appStore.showWarning(message)
  }

  try {
    const settings = await getPublicSettings()
    turnstileEnabled.value = settings.turnstile_enabled
    turnstileSiteKey.value = settings.turnstile_site_key || ''
    linuxdoOAuthEnabled.value = settings.linuxdo_oauth_enabled
    dingtalkOAuthEnabled.value = settings.dingtalk_oauth_enabled ?? false
    wechatOAuthEnabled.value = isWeChatWebOAuthEnabled(settings)
    backendModeEnabled.value = settings.backend_mode_enabled
    oidcOAuthEnabled.value = settings.oidc_oauth_enabled
    oidcOAuthProviderName.value = settings.oidc_oauth_provider_name || 'OIDC'
    githubOAuthEnabled.value = settings.github_oauth_enabled
    googleOAuthEnabled.value = settings.google_oauth_enabled
    passwordResetEnabled.value = settings.password_reset_enabled
    applyLoginAgreementSettings(settings)
  } catch (error) {
    console.error('Failed to load public settings:', error)
    loginAgreementEnabled.value = false
    agreementAccepted.value = true
  } finally {
    publicSettingsLoaded.value = true
  }
})

function applyLoginAgreementSettings(settings: {
  login_agreement_enabled?: boolean
  login_agreement_mode?: string
  login_agreement_updated_at?: string
  login_agreement_revision?: string
  login_agreement_documents?: LoginAgreementDocument[]
}): void {
  const documents = Array.isArray(settings.login_agreement_documents)
    ? settings.login_agreement_documents.filter((doc) => doc.title?.trim())
    : []
  loginAgreementDocuments.value = documents
  loginAgreementEnabled.value = settings.login_agreement_enabled === true && documents.length > 0
  loginAgreementMode.value = settings.login_agreement_mode === 'checkbox' ? 'checkbox' : 'modal'
  loginAgreementUpdatedAt.value = settings.login_agreement_updated_at || ''
  loginAgreementRevision.value =
    settings.login_agreement_revision ||
    `${loginAgreementUpdatedAt.value}:${documents.map((doc) => `${doc.id}:${doc.title}`).join('|')}`

  agreementAccepted.value = !loginAgreementEnabled.value || hasAcceptedLoginAgreement(loginAgreementRevision.value)
  showAgreementModal.value =
    loginAgreementEnabled.value && !agreementAccepted.value && loginAgreementMode.value !== 'checkbox'
}

function hasAcceptedLoginAgreement(revision: string): boolean {
  if (!revision) {
    return false
  }
  try {
    const raw = localStorage.getItem(LOGIN_AGREEMENT_STORAGE_KEY)
    if (!raw) {
      return false
    }
    const parsed = JSON.parse(raw) as { revision?: string }
    return parsed.revision === revision
  } catch {
    return false
  }
}

function acceptLoginAgreement(): void {
  if (loginAgreementRevision.value) {
    localStorage.setItem(
      LOGIN_AGREEMENT_STORAGE_KEY,
      JSON.stringify({
        revision: loginAgreementRevision.value,
        accepted_at: new Date().toISOString(),
      }),
    )
  }
  agreementAccepted.value = true
  showAgreementModal.value = false
}

function rejectLoginAgreement(): void {
  localStorage.removeItem(LOGIN_AGREEMENT_STORAGE_KEY)
  agreementAccepted.value = false
  showAgreementModal.value = false
  appStore.showWarning(loginCopy.value.agreementReject)
}

function onTurnstileVerify(token: string): void {
  turnstileToken.value = token
  errors.turnstile = ''
}

function onTurnstileExpire(): void {
  turnstileToken.value = ''
  errors.turnstile = t('auth.turnstileExpired')
}

function onTurnstileError(): void {
  turnstileToken.value = ''
  errors.turnstile = t('auth.turnstileFailed')
}

function validateForm(): boolean {
  errors.email = ''
  errors.password = ''
  errors.turnstile = ''

  let isValid = true

  if (agreementGateActive.value) {
    appStore.showWarning(loginCopy.value.agreementRequired)
    if (loginAgreementMode.value !== 'checkbox') {
      showAgreementModal.value = true
    }
    return false
  }

  if (!formData.email.trim()) {
    errors.email = t('auth.emailRequired')
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t('auth.invalidEmail')
    isValid = false
  }

  if (!formData.password) {
    errors.password = t('auth.passwordRequired')
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = t('auth.passwordMinLength')
    isValid = false
  }

  if (turnstileEnabled.value && !turnstileToken.value) {
    errors.turnstile = t('auth.completeVerification')
    isValid = false
  }

  return isValid
}

async function handleLogin(): Promise<void> {
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    const response = await authStore.login({
      email: formData.email,
      password: formData.password,
      turnstile_token: turnstileEnabled.value ? turnstileToken.value : undefined,
    })

    if (isTotp2FARequired(response)) {
      const totpResponse = response as TotpLoginResponse
      totpTempToken.value = totpResponse.temp_token || ''
      totpUserEmailMasked.value = totpResponse.user_email_masked || ''
      show2FAModal.value = true
      isLoading.value = false
      return
    }

    clearAllAffiliateReferralCodes()
    appStore.showSuccess(t('auth.loginSuccess'))

    const redirectTo = (router.currentRoute.value.query.redirect as string) || '/dashboard'
    await router.push(redirectTo)
  } catch (error: unknown) {
    if (turnstileRef.value) {
      turnstileRef.value.reset()
      turnstileToken.value = ''
    }

    errorMessage.value = extractI18nErrorMessage(error, t, 'auth.errors', t('auth.loginFailed'))
    appStore.showError(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}

async function handle2FAVerify(code: string): Promise<void> {
  if (totpModalRef.value) {
    totpModalRef.value.setVerifying(true)
  }

  try {
    await authStore.login2FA(totpTempToken.value, code)
    show2FAModal.value = false
    clearAllAffiliateReferralCodes()
    appStore.showSuccess(t('auth.loginSuccess'))

    const redirectTo = (router.currentRoute.value.query.redirect as string) || '/dashboard'
    await router.push(redirectTo)
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { data?: { message?: string } } }
    const message = err.response?.data?.message || err.message || t('profile.totp.loginFailed')

    if (totpModalRef.value) {
      totpModalRef.value.setError(message)
      totpModalRef.value.setVerifying(false)
    }
  }
}

function handle2FACancel(): void {
  show2FAModal.value = false
  totpTempToken.value = ''
  totpUserEmailMasked.value = ''
}
</script>

<style scoped>
.sui-login-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 18%, rgba(245, 245, 245, .92), transparent 28%),
    linear-gradient(90deg, #fff 0%, #fff 53%, #fbfbfa 100%);
  color: #151515;
  font-family: Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.sui-login-header {
  position: fixed;
  z-index: 20;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 84px;
  padding: 0 clamp(22px, 10.8vw, 220px);
}

.sui-brand {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  color: #101010;
  text-decoration: none;
}

.sui-brand strong {
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 38px;
  font-weight: 950;
  line-height: 1;
}

.sui-brand span {
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 21px;
  font-weight: 800;
}

.sui-header-actions {
  display: flex;
  align-items: center;
  gap: 22px;
}

.sui-home-link {
  color: #6c6c6c;
  font-size: 15px;
  font-weight: 400;
  text-decoration: none;
  transition: color .2s ease;
}

.sui-header-actions :deep(.relative > button) {
  color: #111;
  background: #fff;
  font-weight: 400;
}

.sui-header-actions :deep(.relative > button:hover) {
  background: #f6f6f6;
}

.sui-header-actions :deep(.absolute) {
  border-color: #e5e5e5;
  background: #fff;
  box-shadow: 0 14px 30px rgba(15, 23, 42, .12);
}

.sui-header-actions :deep(.absolute button) {
  color: #111;
  background: #fff;
  font-weight: 400;
}

.sui-header-actions :deep(.absolute button:hover),
.sui-header-actions :deep(.absolute button.bg-primary-50) {
  color: #111;
  background: #f4f4f4;
}

.sui-home-link:hover {
  color: #111;
}

.sui-login-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(520px, 1fr) 480px;
  align-items: center;
  gap: clamp(70px, 6.4vw, 132px);
  width: min(100% - 88px, 1430px);
  margin: 0 auto;
  padding: 118px 0 56px;
}

.sui-login-shell--en {
  grid-template-columns: minmax(560px, 1fr) 480px;
  gap: clamp(84px, 7.2vw, 150px);
}

.sui-hero-copy {
  align-self: end;
  max-width: 808px;
  padding: 0 0 104px clamp(0px, 2.7vw, 50px);
  transform: translate(17%, -3%);
}

.sui-hero-copy--en {
  max-width: 720px;
  padding-right: clamp(18px, 2.4vw, 36px);
  transform: translate(8%, -3%);
}

.sui-hero-kicker {
  margin: 0 0 50px;
  color: #bebebe;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 18px;
  font-weight: 500;
  letter-spacing: .55em;
}

.sui-hero-copy--en .sui-hero-kicker {
  max-width: 100%;
  margin-bottom: 48px;
  overflow: hidden;
  text-overflow: clip;
  white-space: nowrap;
  font-size: clamp(10px, .76vw, 12px);
  line-height: 1.2;
  letter-spacing: .34em;
}

.sui-hero-copy h1 {
  margin: 0;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.16;
}

.sui-hero-copy h1 span {
  display: block;
}

.sui-hero-copy h1 span:first-child {
  color: #080808;
  font-size: clamp(40.2px, 3.35vw, 61.8px);
}

.sui-hero-copy h1 span:last-child {
  color: #666;
  font-size: clamp(37.1px, 3.09vw, 56.7px);
}

.sui-hero-line {
  width: min(100%, 520px);
  height: 1px;
  margin: 42px 0 34px;
  background: #e8e8e8;
}

.sui-hero-copy ul {
  display: grid;
  gap: 11px;
  margin: 0;
  padding: 0;
  list-style: none;
  color: #565656;
  font-size: 12px;
  font-weight: 400;
}

.sui-hero-copy li {
  display: flex;
  align-items: center;
  gap: 11px;
  line-height: 1.2;
}

.sui-hero-copy li :deep(svg) {
  width: 12px;
  height: 12px;
  color: #111;
  stroke-width: 1.8;
}

.sui-card {
  width: 480px;
  min-height: 646px;
  justify-self: end;
  transform: translateX(-20%);
  padding: 60px 40px 34px;
  border: 1px solid #e7e7e7;
  border-radius: 21px;
  background: rgba(255, 255, 255, .88);
  box-shadow: 0 30px 64px rgba(20, 20, 20, .045);
}

.sui-login-shell--en .sui-card {
  transform: translateX(-8%);
}

.sui-card-heading {
  text-align: center;
}

.sui-card-heading strong,
.sui-card-heading h2 {
  font-family: "Noto Serif SC", "Songti SC", serif;
  color: #111;
}

.sui-card-heading strong {
  display: block;
  font-size: 30px;
  font-weight: 950;
}

.sui-card-heading p {
  margin: 17px 0 38px;
  color: #9a9a9a;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 15px;
  font-style: italic;
  font-weight: 700;
}

.sui-card-heading h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 950;
}

.sui-card-heading span {
  display: block;
  margin-top: 13px;
  color: #777;
  font-size: 15px;
  font-weight: 400;
}

.sui-form {
  margin-top: 32px;
}

.sui-field {
  margin-top: 23px;
}

.sui-field label {
  display: block;
  margin-bottom: 12px;
  color: #242424;
  font-size: 14px;
  font-weight: 850;
}

.sui-input-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 44px;
  padding: 0 16px;
  border: 1px solid #e5ebf7;
  border-radius: 10px;
  background: #eaf2ff;
  color: #a2a2a2;
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}

.sui-input-wrap:focus-within {
  border-color: #b8c7df;
  background: #edf4ff;
  box-shadow: 0 0 0 4px rgba(136, 155, 188, .13);
}

.sui-input-wrap.is-error {
  border-color: #df8b8b;
  box-shadow: 0 0 0 4px rgba(223, 139, 139, .12);
}

.sui-input-wrap input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #1f2430;
  font-size: 15px;
  font-weight: 400;
}

.sui-password-wrap .sui-eye {
  width: 26px;
  height: 26px;
}

.sui-input-wrap input::placeholder {
  color: #a5adba;
}

.sui-input-wrap input:disabled {
  cursor: not-allowed;
}

.sui-eye {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 0;
  background: transparent;
  color: #aaa;
  cursor: pointer;
}

.sui-forgot {
  display: block;
  width: fit-content;
  margin: 8px 0 0 auto;
  color: #151515;
  font-size: 11.2px;
  font-weight: 800;
  line-height: 1.35;
  text-decoration: none;
}

.sui-turnstile {
  overflow: hidden;
  margin-top: 26px;
  border-radius: 4px;
}

.sui-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  height: 54px;
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

.sui-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #171717;
}

.sui-submit:disabled {
  background: #858381;
  cursor: not-allowed;
  opacity: .62;
}

.sui-spin {
  width: 20px;
  height: 20px;
  animation: suiSpin .9s linear infinite;
}

.sui-spin circle {
  opacity: .25;
}

.sui-spin path {
  opacity: .85;
}

.sui-agreement {
  margin-top: 22px;
}

.sui-oauth {
  margin-top: 24px;
}

.sui-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  color: #9a9a9a;
  font-size: 13px;
  font-weight: 700;
}

.sui-oauth :deep(.space-y-4) {
  display: grid;
  gap: 12px;
}

.sui-oauth :deep(.gap-3) {
  gap: 14px;
}

.sui-oauth :deep(.btn) {
  min-height: 46px;
  border-radius: 999px;
  font-size: 15px;
}

.sui-divider::before,
.sui-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #ededed;
}

.sui-register {
  margin: 22px 0 0;
  text-align: center;
  color: #777;
  font-size: 11.2px;
  font-weight: 400;
  line-height: 1.4;
}

.sui-register a {
  color: #151515;
  font-weight: 800;
  text-decoration: none;
}

@keyframes suiSpin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .sui-login-shell {
    grid-template-columns: 1fr;
    width: min(100% - 44px, 500px);
    padding-top: 112px;
  }

  .sui-hero-copy {
    display: none;
  }

  .sui-card {
    width: min(100%, 480px);
    justify-self: center;
    transform: none;
  }
}

@media (min-width: 1101px) and (max-width: 1280px) {
  .sui-login-shell--en {
    grid-template-columns: minmax(500px, 1fr) 440px;
    gap: 58px;
  }

  .sui-login-shell--en .sui-hero-copy {
    transform: translate(3%, -3%);
  }

  .sui-login-shell--en .sui-hero-kicker {
    font-size: 10px;
    letter-spacing: .22em;
  }

  .sui-login-shell--en .sui-card {
    width: 440px;
    transform: translateX(0);
  }
}

@media (max-width: 640px) {
  .sui-login-page {
    background: #fff;
  }

  .sui-login-header {
    position: static;
    height: auto;
    padding: 22px;
  }

  .sui-brand strong {
    font-size: 30px;
  }

  .sui-brand span {
    display: none;
  }

  .sui-header-actions {
    gap: 10px;
  }

  .sui-home-link {
    font-size: 13px;
  }

  .sui-login-shell {
    width: min(100% - 28px, 480px);
    min-height: auto;
    padding: 14px 0 38px;
  }

  .sui-card {
    min-height: 0;
    width: 100%;
    padding: 36px 20px 28px;
    border-radius: 20px;
  }

  .sui-card-heading p {
    margin-bottom: 32px;
  }

  .sui-input-wrap {
    height: 58px;
  }
}
</style>
