<template>
  <main class="jf-register-page">
    <header class="jf-register-header">
      <router-link to="/home" class="jf-brand" :aria-label="`${registerCopy.brandName} home`">
        <strong>{{ registerCopy.brandMark }}</strong>
        <span>{{ registerCopy.brandName }}</span>
      </router-link>

      <div class="jf-header-actions">
        <LocaleSwitcher />
        <router-link to="/home" class="jf-home-link">{{ registerCopy.backHome }}</router-link>
      </div>
    </header>

    <section class="jf-register-shell">
      <aside class="jf-register-hero" aria-hidden="true">
        <div class="jf-hero-inner">
          <p class="jf-hero-kicker">{{ registerCopy.heroKicker }}</p>
          <h1>
            <span>{{ registerCopy.heroTitleTop }}</span>
            <span>{{ registerCopy.heroTitleBottom }}</span>
          </h1>
          <p class="jf-hero-description">
            {{ registerCopy.heroDescription }}
          </p>
          <div class="jf-hero-line" />
          <ul class="jf-feature-list">
            <li v-for="item in registerCopy.heroFeatures" :key="item.text"><Icon :name="item.icon" size="sm" /> {{ item.text }}</li>
          </ul>
          <p class="jf-hero-note">
            {{ registerCopy.heroNote }}
          </p>
        </div>
      </aside>

      <section class="jf-register-panel">
        <div class="jf-register-card" aria-labelledby="register-title">
          <div class="jf-card-heading">
            <h2 id="register-title">{{ registerCopy.title }}</h2>
            <span>{{ registerCopy.description }}</span>
          </div>

          <div
            v-if="!registrationEnabled && settingsLoaded"
            class="jf-disabled-message"
          >
            <Icon name="exclamationCircle" size="sm" />
            <span>{{ t('auth.registrationDisabled') }}</span>
          </div>

          <form v-else class="jf-form" @submit.prevent="handleRegister">
            <div class="jf-field">
              <label for="register-email">{{ registerCopy.email }}</label>
              <div class="jf-input-wrap" :class="{ 'is-error': errors.email }">
                <Icon name="mail" size="md" />
                <input
                  id="register-email"
                  v-model="formData.email"
                  type="email"
                  required
                  autofocus
                  autocomplete="email"
                  :disabled="registrationActionDisabled"
                  :placeholder="registerCopy.emailPlaceholder"
                />
              </div>
            </div>

            <div class="jf-field">
              <label for="register-password">{{ registerCopy.password }}</label>
              <div class="jf-input-wrap jf-password-wrap" :class="{ 'is-error': errors.password }">
                <Icon name="lock" size="md" />
                <input
                  id="register-password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="new-password"
                  :disabled="registrationActionDisabled"
                  :placeholder="registerCopy.passwordPlaceholder"
                />
                <button
                  type="button"
                  class="jf-eye"
                  :disabled="registrationActionDisabled"
                  :aria-label="showPassword ? registerCopy.hidePassword : registerCopy.showPassword"
                  @click="showPassword = !showPassword"
                >
                  <Icon v-if="showPassword" name="eyeOff" size="md" />
                  <Icon v-else name="eye" size="md" />
                </button>
              </div>
              <p class="jf-field-hint">{{ registerCopy.passwordHint }}</p>
            </div>

            <div v-if="invitationCodeEnabled" class="jf-field">
              <label for="register-invitation-code">
                {{ t('auth.invitationCodeLabel') }}
              </label>
              <div
                class="jf-input-wrap"
                :class="{
                  'is-valid': invitationValidation.valid,
                  'is-error': invitationValidation.invalid || errors.invitation_code
                }"
              >
                <Icon name="key" size="md" />
                <input
                  id="register-invitation-code"
                  v-model="formData.invitation_code"
                  type="text"
                  :disabled="registrationActionDisabled"
                  :placeholder="t('auth.invitationCodePlaceholder')"
                  @input="handleInvitationCodeInput"
                />
                <svg
                  v-if="invitationValidating"
                  class="jf-mini-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <Icon v-else-if="invitationValidation.valid" name="checkCircle" size="sm" class="jf-valid-icon" />
                <Icon v-else-if="invitationValidation.invalid || errors.invitation_code" name="exclamationCircle" size="sm" class="jf-error-icon" />
              </div>
            </div>

            <div v-if="promoCodeEnabled" class="jf-field">
              <label for="register-promo-code">
                {{ t('auth.promoCodeLabel') }}
                <span>{{ registerCopy.optionalSuffix }}</span>
              </label>
              <div
                class="jf-input-wrap"
                :class="{
                  'is-valid': promoValidation.valid,
                  'is-error': promoValidation.invalid
                }"
              >
                <Icon name="gift" size="md" />
                <input
                  id="register-promo-code"
                  v-model="formData.promo_code"
                  type="text"
                  :disabled="registrationActionDisabled"
                  :placeholder="t('auth.promoCodePlaceholder')"
                  @input="handlePromoCodeInput"
                />
                <svg
                  v-if="promoValidating"
                  class="jf-mini-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <Icon v-else-if="promoValidation.valid" name="checkCircle" size="sm" class="jf-valid-icon" />
                <Icon v-else-if="promoValidation.invalid" name="exclamationCircle" size="sm" class="jf-error-icon" />
              </div>
            </div>

            <div v-if="turnstileEnabled && turnstileSiteKey" class="jf-turnstile">
              <TurnstileWidget
                ref="turnstileRef"
                :site-key="turnstileSiteKey"
                @verify="onTurnstileVerify"
                @expire="onTurnstileExpire"
                @error="onTurnstileError"
              />
            </div>

            <div class="jf-agreement-row">
              <input
                id="register-agreement"
                type="checkbox"
                :checked="agreementRowChecked"
                @change="handleAgreementToggle"
              />
              <label for="register-agreement">
                {{ registerCopy.agreementPrefix }}
                <template v-for="(doc, index) in visibleAgreementDocuments" :key="doc.id || doc.title">
                  <router-link :to="documentRoute(doc)" target="_blank" rel="noopener noreferrer">
                    {{ doc.title }}
                  </router-link>
                  <span v-if="index < visibleAgreementDocuments.length - 1">{{ documentSeparator }}</span>
                </template>
              </label>
            </div>

            <LoginAgreementPrompt
              v-if="loginAgreementEnabled && showAgreementModal"
              :accepted="agreementAccepted"
              :documents="loginAgreementDocuments"
              :mode="loginAgreementMode"
              :updated-at="loginAgreementUpdatedAt"
              :visible="showAgreementModal"
              @accept="acceptLoginAgreement"
              @reject="rejectLoginAgreement"
              @open="showAgreementModal = true"
            />

            <button
              type="submit"
              class="jf-submit"
              :disabled="submitDisabled"
            >
              <svg
                v-if="isLoading"
                class="jf-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <Icon v-else name="userPlus" size="md" />
              <span>{{ isLoading ? t('auth.processing') : registerCopy.submit }}</span>
            </button>

            <div v-if="showOAuthLogin" class="jf-oauth">
              <div class="jf-divider">
                <span>{{ registerCopy.oauthDivider }}</span>
              </div>

              <EmailOAuthButtons
                :disabled="registrationActionDisabled"
                :aff-code="formData.aff_code"
                :github-enabled="githubOAuthEnabled"
                :google-enabled="googleOAuthEnabled"
                :show-divider="false"
              />

              <LinuxDoOAuthSection
                v-if="linuxdoOAuthEnabled"
                :disabled="registrationActionDisabled"
                :aff-code="formData.aff_code"
                :show-divider="false"
              />
              <WechatOAuthSection
                v-if="wechatOAuthEnabled"
                :disabled="registrationActionDisabled"
                :aff-code="formData.aff_code"
                :show-divider="false"
              />
              <OidcOAuthSection
                v-if="oidcOAuthEnabled"
                :disabled="registrationActionDisabled"
                :provider-name="oidcOAuthProviderName"
                :aff-code="formData.aff_code"
                :show-divider="false"
              />
            </div>

            <p class="jf-login-link">
              {{ registerCopy.hasAccount }}
              <router-link to="/login">{{ registerCopy.login }}</router-link>
            </p>
          </form>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LinuxDoOAuthSection from '@/components/auth/LinuxDoOAuthSection.vue'
import OidcOAuthSection from '@/components/auth/OidcOAuthSection.vue'
import WechatOAuthSection from '@/components/auth/WechatOAuthSection.vue'
import EmailOAuthButtons from '@/components/auth/EmailOAuthButtons.vue'
import LoginAgreementPrompt from '@/components/auth/LoginAgreementPrompt.vue'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useAuthStore, useAppStore } from '@/stores'
import {
  getPublicSettings,
  isWeChatWebOAuthEnabled,
  validateInvitationCode,
  validatePromoCode,
} from '@/api/auth'
import { buildAuthErrorMessage } from '@/utils/authError'
import {
  formatRegistrationEmailSuffixWhitelistForMessage,
  isRegistrationEmailSuffixAllowed,
  normalizeRegistrationEmailSuffixWhitelist,
} from '@/utils/registrationEmailPolicy'
import {
  clearAffiliateReferralCode,
  loadAffiliateReferralCode,
  resolveAffiliateReferralCode,
} from '@/utils/oauthAffiliate'
import type { LoginAgreementDocument } from '@/types'

const { t, locale } = useI18n()
const LOGIN_AGREEMENT_STORAGE_KEY = 'sub2api_login_agreement_consent'

type RegisterFeatureIcon = 'bolt' | 'creditCard' | 'gift' | 'lock'

const registerCopies = {
  zh: {
    brandMark: '锋',
    brandName: '九锋',
    backHome: '← 返回首页',
    heroKicker: 'JOIN · 加入九锋 AI',
    heroTitleTop: '即刻开通',
    heroTitleBottom: '一念可达每一个模型',
    heroDescription: '把上百个模型按官方 token 倍率聚合到一个 API。注册后即可拿到密钥，5 分钟把 Claude / GPT / Gemini 通通接入你的项目。',
    heroFeatures: [
      { icon: 'bolt' as RegisterFeatureIcon, text: '注册即开 API · 无需审批 · 秒级接入' },
      { icon: 'creditCard' as RegisterFeatureIcon, text: '按 Token 计费 · 无月费 · 见账见量' },
      { icon: 'gift' as RegisterFeatureIcon, text: '邀请码 / 优惠码 · 充值赠送可叠加' },
      { icon: 'lock' as RegisterFeatureIcon, text: '请求体不落盘 · Apple 级隐私承诺' },
    ],
    heroNote: '注册即代表同意《服务条款》与《隐私政策》。我们不会用你的 prompt 训练模型，也不会与任何第三方共享。',
    title: '创建账户',
    description: '注册以开始使用 九锋',
    email: '邮箱',
    emailPlaceholder: '请输入邮箱',
    password: '密码',
    passwordPlaceholder: '创建一个安全的密码',
    passwordHint: '至少 6 个字符',
    showPassword: '显示密码',
    hidePassword: '隐藏密码',
    optionalSuffix: '（可选）',
    inviteOrPromo: '邀请码 / 优惠码',
    promoCode: '优惠码',
    promoPlaceholder: '输入优惠码（可选）',
    agreementPrefix: '我已阅读并同意',
    documentSeparator: '、',
    submit: '继续',
    oauthDivider: '或使用其他继续',
    hasAccount: '已有账户？',
    login: '登录',
    agreementRequired: '请先阅读并同意最新条款后再注册。',
    accountCreatedSiteName: '九锋',
    defaultDocuments: {
      terms: '服务条款',
      usagePolicy: '使用政策',
      supportedRegions: '支持的国家和地区',
      serviceSpecificTerms: '服务特定条款',
    },
  },
  en: {
    brandMark: 'JF',
    brandName: 'Jiufeng',
    backHome: '← Back Home',
    heroKicker: 'JOIN · JIUFENG AI',
    heroTitleTop: 'Start Instantly',
    heroTitleBottom: 'Reach Every Model',
    heroDescription: 'Aggregate hundreds of models into one API with official token multipliers. Get your key after signup and connect Claude / GPT / Gemini to your project in minutes.',
    heroFeatures: [
      { icon: 'bolt' as RegisterFeatureIcon, text: 'Instant API access · No approval · Seconds to connect' },
      { icon: 'creditCard' as RegisterFeatureIcon, text: 'Token-based billing · No monthly fee · Transparent usage' },
      { icon: 'gift' as RegisterFeatureIcon, text: 'Invite / promo codes · Stackable recharge bonuses' },
      { icon: 'lock' as RegisterFeatureIcon, text: 'No request body storage · Apple-grade privacy promise' },
    ],
    heroNote: 'By registering, you agree to the Terms of Service and Privacy Policy. We never train on your prompts or share them with third parties.',
    title: 'Create Account',
    description: 'Register to start using Jiufeng',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Create a secure password',
    passwordHint: 'At least 6 characters',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    optionalSuffix: ' (optional)',
    inviteOrPromo: 'Invite / Promo Code',
    promoCode: 'Promo Code',
    promoPlaceholder: 'Enter promo code (optional)',
    agreementPrefix: 'I have read and agree to',
    documentSeparator: ', ',
    submit: 'Continue',
    oauthDivider: 'Or continue with another method',
    hasAccount: 'Already have an account?',
    login: 'Sign In',
    agreementRequired: 'Please read and accept the latest terms before registering.',
    accountCreatedSiteName: 'Jiufeng',
    defaultDocuments: {
      terms: 'Terms of Service',
      usagePolicy: 'Usage Policy',
      supportedRegions: 'Supported Countries and Regions',
      serviceSpecificTerms: 'Service-Specific Terms',
    },
  },
} as const

const registerCopy = computed(() =>
  locale.value.toLowerCase().startsWith('zh') ? registerCopies.zh : registerCopies.en,
)
const documentSeparator = computed(() => registerCopy.value.documentSeparator)

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const appStore = useAppStore()

const isLoading = ref(false)
const settingsLoaded = ref(false)
const errorMessage = ref('')
const showPassword = ref(false)
const fallbackAgreementAccepted = ref(true)

const registrationEnabled = ref(true)
const emailVerifyEnabled = ref(false)
const promoCodeEnabled = ref(true)
const invitationCodeEnabled = ref(false)
const turnstileEnabled = ref(false)
const turnstileSiteKey = ref('')
const linuxdoOAuthEnabled = ref(false)
const wechatOAuthEnabled = ref(false)
const oidcOAuthEnabled = ref(false)
const oidcOAuthProviderName = ref('OIDC')
const githubOAuthEnabled = ref(false)
const googleOAuthEnabled = ref(false)
const registrationEmailSuffixWhitelist = ref<string[]>([])
const loginAgreementEnabled = ref(false)
const loginAgreementMode = ref<'modal' | 'checkbox' | string>('modal')
const loginAgreementUpdatedAt = ref('')
const loginAgreementRevision = ref('')
const loginAgreementDocuments = ref<LoginAgreementDocument[]>([])
const agreementAccepted = ref(false)
const showAgreementModal = ref(false)

const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const turnstileToken = ref('')

const promoValidating = ref(false)
const promoValidation = reactive({
  valid: false,
  invalid: false,
  bonusAmount: null as number | null,
  message: '',
})
let promoValidateTimeout: ReturnType<typeof setTimeout> | null = null

const invitationValidating = ref(false)
const invitationValidation = reactive({
  valid: false,
  invalid: false,
  message: '',
})
let invitationValidateTimeout: ReturnType<typeof setTimeout> | null = null

const formData = reactive({
  email: '',
  password: '',
  promo_code: '',
  invitation_code: '',
  aff_code: '',
})

const errors = reactive({
  email: '',
  password: '',
  turnstile: '',
  invitation_code: '',
})

const fallbackAgreementDocuments = computed<LoginAgreementDocument[]>(() => [
  { id: 'terms', title: registerCopy.value.defaultDocuments.terms, content_md: '' },
  { id: 'usage-policy', title: registerCopy.value.defaultDocuments.usagePolicy, content_md: '' },
  { id: 'supported-regions', title: registerCopy.value.defaultDocuments.supportedRegions, content_md: '' },
  { id: 'service-specific-terms', title: registerCopy.value.defaultDocuments.serviceSpecificTerms, content_md: '' },
])

const validationToastMessage = computed(
  () =>
    errors.email ||
    errors.password ||
    (invitationValidation.invalid ? invitationValidation.message : '') ||
    errors.invitation_code ||
    (promoValidation.invalid ? promoValidation.message : '') ||
    errors.turnstile ||
    '',
)

const showOAuthLogin = computed(
  () =>
    linuxdoOAuthEnabled.value ||
    wechatOAuthEnabled.value ||
    oidcOAuthEnabled.value ||
    githubOAuthEnabled.value ||
    googleOAuthEnabled.value,
)

const agreementGateActive = computed(
  () => loginAgreementEnabled.value && !agreementAccepted.value,
)

const registrationActionDisabled = computed(
  () => isLoading.value || !settingsLoaded.value || !registrationEnabled.value || agreementGateActive.value,
)

const submitDisabled = computed(
  () => registrationActionDisabled.value || (turnstileEnabled.value && !turnstileToken.value),
)

const visibleAgreementDocuments = computed(() =>
  loginAgreementDocuments.value.length > 0 ? loginAgreementDocuments.value : fallbackAgreementDocuments.value,
)

const agreementRowChecked = computed(() =>
  loginAgreementEnabled.value ? agreementAccepted.value : fallbackAgreementAccepted.value,
)

watch(validationToastMessage, (value, previousValue) => {
  if (value && value !== previousValue) {
    appStore.showError(value)
  }
})

onMounted(async () => {
  syncAffiliateReferralCode()

  try {
    const settings = await getPublicSettings()
    registrationEnabled.value = settings.registration_enabled
    emailVerifyEnabled.value = settings.email_verify_enabled
    promoCodeEnabled.value = settings.promo_code_enabled
    invitationCodeEnabled.value = settings.invitation_code_enabled
    turnstileEnabled.value = settings.turnstile_enabled
    turnstileSiteKey.value = settings.turnstile_site_key || ''
    linuxdoOAuthEnabled.value = settings.linuxdo_oauth_enabled
    wechatOAuthEnabled.value = isWeChatWebOAuthEnabled(settings)
    oidcOAuthEnabled.value = settings.oidc_oauth_enabled
    oidcOAuthProviderName.value = settings.oidc_oauth_provider_name || 'OIDC'
    githubOAuthEnabled.value = settings.github_oauth_enabled
    googleOAuthEnabled.value = settings.google_oauth_enabled
    registrationEmailSuffixWhitelist.value = normalizeRegistrationEmailSuffixWhitelist(
      settings.registration_email_suffix_whitelist || [],
    )
    applyLoginAgreementSettings(settings)

    if (promoCodeEnabled.value) {
      const promoParam = route.query.promo as string
      if (promoParam) {
        formData.promo_code = promoParam
        await validatePromoCodeDebounced(promoParam)
      }
    }

    syncAffiliateReferralCode()
  } catch (error) {
    console.error('Failed to load public settings:', error)
    loginAgreementEnabled.value = false
    agreementAccepted.value = true
  } finally {
    settingsLoaded.value = true
  }
})

watch(
  () => [route.query.aff, route.query.aff_code],
  () => {
    syncAffiliateReferralCode()
  },
)

onUnmounted(() => {
  if (promoValidateTimeout) {
    clearTimeout(promoValidateTimeout)
  }
  if (invitationValidateTimeout) {
    clearTimeout(invitationValidateTimeout)
  }
})

function syncAffiliateReferralCode(): string {
  const code = resolveAffiliateReferralCode(route.query.aff, route.query.aff_code)
  if (code) {
    formData.aff_code = code
  }
  return code
}

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

  agreementAccepted.value =
    !loginAgreementEnabled.value || hasAcceptedLoginAgreement(loginAgreementRevision.value)
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
  appStore.showWarning(registerCopy.value.agreementRequired)
}

function handleAgreementToggle(event: Event): void {
  const checked = (event.target as HTMLInputElement).checked
  if (!loginAgreementEnabled.value) {
    fallbackAgreementAccepted.value = checked
    return
  }
  if (checked) {
    acceptLoginAgreement()
  } else {
    rejectLoginAgreement()
  }
}

function documentRoute(doc: LoginAgreementDocument) {
  return {
    name: 'LegalDocument',
    params: {
      documentId: doc.id || doc.title,
    },
  }
}

function handlePromoCodeInput(): void {
  const code = formData.promo_code.trim()
  promoValidation.valid = false
  promoValidation.invalid = false
  promoValidation.bonusAmount = null
  promoValidation.message = ''

  if (!code) {
    promoValidating.value = false
    return
  }

  if (promoValidateTimeout) {
    clearTimeout(promoValidateTimeout)
  }

  promoValidateTimeout = setTimeout(() => {
    validatePromoCodeDebounced(code)
  }, 500)
}

async function validatePromoCodeDebounced(code: string): Promise<void> {
  if (!code.trim()) {
    return
  }

  promoValidating.value = true

  try {
    const result = await validatePromoCode(code)

    if (result.valid) {
      promoValidation.valid = true
      promoValidation.invalid = false
      promoValidation.bonusAmount = result.bonus_amount || 0
      promoValidation.message = ''
    } else {
      promoValidation.valid = false
      promoValidation.invalid = true
      promoValidation.bonusAmount = null
      promoValidation.message = getPromoErrorMessage(result.error_code)
    }
  } catch (error) {
    console.error('Failed to validate promo code:', error)
    promoValidation.valid = false
    promoValidation.invalid = true
    promoValidation.message = t('auth.promoCodeInvalid')
  } finally {
    promoValidating.value = false
  }
}

function getPromoErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case 'PROMO_CODE_NOT_FOUND':
      return t('auth.promoCodeNotFound')
    case 'PROMO_CODE_EXPIRED':
      return t('auth.promoCodeExpired')
    case 'PROMO_CODE_DISABLED':
      return t('auth.promoCodeDisabled')
    case 'PROMO_CODE_MAX_USED':
      return t('auth.promoCodeMaxUsed')
    case 'PROMO_CODE_ALREADY_USED':
      return t('auth.promoCodeAlreadyUsed')
    default:
      return t('auth.promoCodeInvalid')
  }
}

function handleInvitationCodeInput(): void {
  const code = formData.invitation_code.trim()
  invitationValidation.valid = false
  invitationValidation.invalid = false
  invitationValidation.message = ''
  errors.invitation_code = ''

  if (!code) {
    return
  }

  if (invitationValidateTimeout) {
    clearTimeout(invitationValidateTimeout)
  }

  invitationValidateTimeout = setTimeout(() => {
    validateInvitationCodeDebounced(code)
  }, 500)
}

async function validateInvitationCodeDebounced(code: string): Promise<void> {
  invitationValidating.value = true

  try {
    const result = await validateInvitationCode(code)

    if (result.valid) {
      invitationValidation.valid = true
      invitationValidation.invalid = false
      invitationValidation.message = ''
    } else {
      invitationValidation.valid = false
      invitationValidation.invalid = true
      invitationValidation.message = getInvitationErrorMessage(result.error_code)
    }
  } catch {
    invitationValidation.valid = false
    invitationValidation.invalid = true
    invitationValidation.message = t('auth.invitationCodeInvalid')
  } finally {
    invitationValidating.value = false
  }
}

function getInvitationErrorMessage(errorCode?: string): string {
  switch (errorCode) {
    case 'INVITATION_CODE_NOT_FOUND':
    case 'INVITATION_CODE_INVALID':
    case 'INVITATION_CODE_USED':
    case 'INVITATION_CODE_DISABLED':
      return t('auth.invitationCodeInvalid')
    default:
      return t('auth.invitationCodeInvalid')
  }
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

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function buildEmailSuffixNotAllowedMessage(): string {
  const normalizedWhitelist = normalizeRegistrationEmailSuffixWhitelist(
    registrationEmailSuffixWhitelist.value,
  )
  if (normalizedWhitelist.length === 0) {
    return t('auth.emailSuffixNotAllowed')
  }
  const separator = String(locale.value || '').toLowerCase().startsWith('zh') ? '、' : ', '
  return t('auth.emailSuffixNotAllowedWithAllowed', {
    suffixes: formatRegistrationEmailSuffixWhitelistForMessage(normalizedWhitelist, {
      separator,
      more: (count) => t('auth.emailSuffixAllowedMore', { count }),
    }),
  })
}

function validateForm(): boolean {
  errors.email = ''
  errors.password = ''
  errors.turnstile = ''
  errors.invitation_code = ''

  let isValid = true

  if (agreementGateActive.value) {
    appStore.showWarning(registerCopy.value.agreementRequired)
    if (loginAgreementMode.value !== 'checkbox') {
      showAgreementModal.value = true
    }
    return false
  }

  if (!formData.email.trim()) {
    errors.email = t('auth.emailRequired')
    isValid = false
  } else if (!validateEmail(formData.email)) {
    errors.email = t('auth.invalidEmail')
    isValid = false
  } else if (
    !isRegistrationEmailSuffixAllowed(formData.email, registrationEmailSuffixWhitelist.value)
  ) {
    errors.email = buildEmailSuffixNotAllowedMessage()
    isValid = false
  }

  if (!formData.password) {
    errors.password = t('auth.passwordRequired')
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = t('auth.passwordMinLength')
    isValid = false
  }

  if (invitationCodeEnabled.value && !formData.invitation_code.trim()) {
    errors.invitation_code = t('auth.invitationCodeRequired')
    isValid = false
  }

  if (turnstileEnabled.value && !turnstileToken.value) {
    errors.turnstile = t('auth.completeVerification')
    isValid = false
  }

  return isValid
}

async function handleRegister(): Promise<void> {
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  if (formData.promo_code.trim()) {
    if (promoValidating.value) {
      errorMessage.value = t('auth.promoCodeValidating')
      return
    }
    if (promoValidation.invalid) {
      errorMessage.value = t('auth.promoCodeInvalidCannotRegister')
      return
    }
  }

  if (invitationCodeEnabled.value) {
    if (invitationValidating.value) {
      errorMessage.value = t('auth.invitationCodeValidating')
      return
    }
    if (invitationValidation.invalid) {
      errorMessage.value = t('auth.invitationCodeInvalidCannotRegister')
      return
    }
    if (formData.invitation_code.trim() && !invitationValidation.valid) {
      errorMessage.value = t('auth.invitationCodeValidating')
      await validateInvitationCodeDebounced(formData.invitation_code.trim())
      if (!invitationValidation.valid) {
        errorMessage.value = t('auth.invitationCodeInvalidCannotRegister')
        return
      }
    }
  }

  isLoading.value = true

  try {
    const affCode = formData.aff_code.trim() || loadAffiliateReferralCode()
    if (affCode) {
      formData.aff_code = affCode
    }

    if (emailVerifyEnabled.value) {
      sessionStorage.setItem(
        'register_data',
        JSON.stringify({
          email: formData.email,
          password: formData.password,
          turnstile_token: turnstileToken.value,
          promo_code: formData.promo_code || undefined,
          invitation_code: formData.invitation_code || undefined,
          ...(affCode ? { aff_code: affCode } : {}),
        }),
      )

      await router.push('/email-verify')
      return
    }

    await authStore.register({
      email: formData.email,
      password: formData.password,
      turnstile_token: turnstileEnabled.value ? turnstileToken.value : undefined,
      promo_code: formData.promo_code || undefined,
      invitation_code: formData.invitation_code || undefined,
      ...(affCode ? { aff_code: affCode } : {}),
    })
    clearAffiliateReferralCode()

    appStore.showSuccess(t('auth.accountCreatedSuccess', { siteName: registerCopy.value.accountCreatedSiteName }))
    await router.push('/dashboard')
  } catch (error: unknown) {
    if (turnstileRef.value) {
      turnstileRef.value.reset()
      turnstileToken.value = ''
    }

    errorMessage.value = buildAuthErrorMessage(error, {
      fallback: t('auth.registrationFailed'),
    })
    appStore.showError(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.jf-register-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 18%, rgba(247, 247, 247, .92), transparent 28%),
    linear-gradient(90deg, #fff 0%, #fff 55%, #fbfbfb 100%);
  color: #151515;
  font-family: Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.jf-register-header {
  position: fixed;
  z-index: 20;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 86px;
  padding: 0 clamp(24px, 10.8vw, 220px);
  background: transparent;
  backdrop-filter: none;
}

.jf-brand {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  color: #101010;
  text-decoration: none;
}

.jf-brand strong {
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 30.4px;
  font-weight: 950;
  line-height: 1;
}

.jf-brand span {
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

.jf-register-shell {
  display: grid;
  grid-template-columns: minmax(650px, 1fr) 590px;
  min-height: 100vh;
  width: min(100% - 88px, 1600px);
  margin: 0 auto;
  padding-top: 86px;
}

.jf-register-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 74px 72px 70px 10px;
}

.jf-hero-inner {
  width: min(100%, 780px);
  transform: translate(15%, 5%);
}

.jf-hero-kicker {
  margin: 0 0 44px;
  color: #bcbcbc;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 10.4px;
  font-weight: 500;
  letter-spacing: .48em;
  text-transform: uppercase;
}

.jf-hero-inner h1 {
  margin: 0;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.16;
}

.jf-hero-inner h1 span {
  display: block;
}

.jf-hero-inner h1 span:first-child {
  color: #080808;
  font-size: clamp(44.8px, 3.84vw, 68.8px);
}

.jf-hero-inner h1 span:last-child {
  color: #666;
  font-size: clamp(40px, 3.44vw, 60.8px);
}

.jf-hero-description {
  width: min(100%, 560px);
  margin: 42px 0 0;
  color: #6c6c6c;
  font-size: 14.4px;
  font-weight: 650;
  line-height: 1.72;
}

.jf-hero-line {
  display: none;
}

.jf-feature-list {
  display: grid;
  gap: 16px;
  margin: 38px 0 0;
  padding: 0;
  list-style: none;
  color: #5f5f5f;
  font-size: 13.6px;
  font-weight: 400;
}

.jf-feature-list li {
  display: flex;
  align-items: center;
  gap: 18px;
  line-height: 1.25;
}

.jf-feature-list li :deep(svg) {
  width: 18px;
  height: 18px;
  color: #171717;
  stroke-width: 1.8;
}

.jf-hero-note {
  width: min(100%, 520px);
  margin: 48px 0 0;
  color: #aaa;
  font-size: 11.2px;
  font-weight: 500;
  line-height: 1.8;
}

.jf-register-panel {
  min-height: calc(100vh - 86px);
  display: flex;
  justify-content: center;
  border-left: 1px solid #efefef;
  padding: 28px 0 44px;
}

.jf-register-card {
  width: 490px;
  padding: 0 0 22px;
}

.jf-card-heading {
  text-align: center;
}

.jf-card-heading strong,
.jf-card-heading h2 {
  font-family: "Noto Serif SC", "Songti SC", serif;
  color: #111;
}

.jf-card-heading strong {
  display: block;
  font-size: 24.8px;
  font-weight: 950;
  line-height: 1.1;
}

.jf-card-heading p {
  margin: 18px 0 39px;
  color: #989898;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 12px;
  font-style: italic;
  font-weight: 700;
}

.jf-card-heading h2 {
  margin: 0;
  font-size: 22.4px;
  font-weight: 950;
  line-height: 1.2;
}

.jf-card-heading span {
  display: block;
  margin-top: 13px;
  color: #777;
  font-size: 12px;
  font-weight: 400;
}

.jf-form {
  margin-top: 32px;
}

.jf-field {
  margin-top: 25px;
}

.jf-field label {
  display: block;
  margin-bottom: 12px;
  color: #222;
  font-size: 11.2px;
  font-weight: 850;
}

.jf-field label span {
  color: #8e8e8e;
  font-weight: 500;
}

.jf-input-wrap {
  display: flex;
  align-items: center;
  gap: 13px;
  height: 54px;
  padding: 0 16px;
  border: 1px solid #e7e7e7;
  border-radius: 11px;
  background: #fff;
  color: #aaa;
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}

.jf-input-wrap:focus-within {
  border-color: #cfd6e2;
  box-shadow: 0 0 0 4px rgba(136, 155, 188, .1);
}

.jf-input-wrap.is-valid {
  border-color: #7ac69a;
}

.jf-input-wrap.is-error {
  border-color: #df8b8b;
  box-shadow: 0 0 0 4px rgba(223, 139, 139, .1);
}

.jf-input-wrap input {
  min-width: 0;
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  color: #202020;
  font-size: 12px;
  font-weight: 400;
}

.jf-input-wrap input::placeholder {
  color: #a8b0bd;
}

.jf-input-wrap input:disabled {
  cursor: not-allowed;
}

.jf-eye {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 0;
  background: transparent;
  color: #aaa;
  cursor: pointer;
}

.jf-password-wrap .jf-eye {
  width: 26px;
  height: 26px;
}

.jf-field-hint {
  margin: 8px 0 0;
  color: #8d949f;
  font-size: 10.4px;
  font-weight: 600;
}

.jf-mini-spin {
  width: 17px;
  height: 17px;
  color: #9aa3af;
  animation: jfSpin .9s linear infinite;
}

.jf-mini-spin circle {
  opacity: .25;
}

.jf-mini-spin path {
  opacity: .85;
}

.jf-valid-icon {
  color: #2ead62;
}

.jf-error-icon {
  color: #d84f4f;
}

.jf-turnstile {
  overflow: hidden;
  margin-top: 26px;
  border-radius: 4px;
}

.jf-agreement-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 22px;
  color: #616161;
  font-size: 11.2px;
  font-weight: 400;
  line-height: 1.55;
}

.jf-agreement-row input {
  width: 17px;
  height: 17px;
  margin: 2px 0 0;
  flex: 0 0 auto;
  accent-color: #1684ff;
}

.jf-agreement-row label {
  min-width: 0;
}

.jf-agreement-row a {
  color: #151515;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.jf-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  width: 100%;
  height: 56px;
  margin-top: 25px;
  border: 0;
  border-radius: 999px;
  background: #050505;
  color: #fff;
  font-size: 12.8px;
  font-weight: 900;
  box-shadow: 0 9px 16px rgba(38, 35, 30, .16);
  cursor: pointer;
  transition: transform .2s ease, background .2s ease, opacity .2s ease;
}

.jf-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #171717;
}

.jf-submit:disabled {
  background: #858381;
  cursor: not-allowed;
  opacity: .62;
}

.jf-spin {
  width: 20px;
  height: 20px;
  animation: jfSpin .9s linear infinite;
}

.jf-spin circle {
  opacity: .25;
}

.jf-spin path {
  opacity: .85;
}

.jf-oauth {
  margin-top: 26px;
}

.jf-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
  color: #9a9a9a;
  font-size: 10.4px;
  font-weight: 500;
}

.jf-divider::before,
.jf-divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: #ededed;
}

.jf-oauth :deep(.space-y-4) {
  display: grid;
  gap: 12px;
}

.jf-oauth :deep(.gap-3) {
  gap: 14px;
}

.jf-oauth :deep(.btn) {
  min-height: 48px;
  border-radius: 999px;
  background: #fff;
  color: #222;
  font-size: 12px;
  font-weight: 500;
}

.jf-login-link {
  margin: 22px 0 0;
  text-align: center;
  color: #777;
  font-size: 11.2px;
  font-weight: 400;
}

.jf-login-link a {
  color: #151515;
  font-weight: 800;
  text-decoration: none;
}

.jf-disabled-message {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 34px;
  border: 1px solid #ead5a8;
  border-radius: 12px;
  background: #fff8ea;
  padding: 14px 16px;
  color: #8a6015;
  font-size: 11.2px;
}

@keyframes jfSpin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1180px) {
  .jf-register-shell {
    grid-template-columns: 1fr;
    width: min(100% - 44px, 540px);
  }

  .jf-register-hero {
    display: none;
  }

  .jf-register-panel {
    min-height: auto;
    border-left: 0;
    padding-top: 34px;
  }

  .jf-register-card {
    width: min(100%, 490px);
  }
}

@media (max-width: 640px) {
  .jf-register-page {
    background: #fff;
  }

  .jf-register-header {
    position: static;
    height: auto;
    padding: 22px;
  }

  .jf-brand strong {
    font-size: 24px;
  }

  .jf-brand span {
    display: none;
  }

  .jf-header-actions {
    gap: 10px;
  }

  .jf-home-link {
    font-size: 10.4px;
  }

  .jf-register-shell {
    width: min(100% - 28px, 480px);
    min-height: auto;
    padding-top: 10px;
  }

  .jf-register-panel {
    padding-bottom: 34px;
  }

  .jf-card-heading p {
    margin-bottom: 34px;
  }

  .jf-input-wrap {
    height: 52px;
  }
}
</style>
