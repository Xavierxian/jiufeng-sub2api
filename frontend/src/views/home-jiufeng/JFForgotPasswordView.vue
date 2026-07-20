<template>
  <main class="jf-forgot-page">
    <header class="jf-forgot-header">
      <router-link to="/home" class="jf-brand" :aria-label="`${brandName} home`">
        <strong>{{ brandMark }}</strong>
        <span>{{ brandName }}</span>
      </router-link>

      <div class="jf-header-actions">
        <LocaleSwitcher />
        <router-link to="/home" class="jf-home-link">{{ forgotCopy.backHome }}</router-link>
      </div>
    </header>

    <section class="jf-forgot-shell" :class="{ 'jf-forgot-shell--en': !isZhLocale }">
      <aside class="jf-forgot-hero" aria-hidden="true">
        <p class="jf-hero-kicker">{{ forgotCopy.heroKicker }}</p>
        <h1>
          <span>{{ forgotCopy.heroTitleTop }}</span>
          <span>{{ forgotCopy.heroTitleBottom }}</span>
        </h1>
        <p class="jf-hero-description">
          {{ forgotCopy.heroDescription }}
        </p>
        <div class="jf-hero-line" />
        <ul class="jf-feature-list">
          <li v-for="item in forgotCopy.heroFeatures" :key="item.text">
            <Icon :name="item.icon" size="sm" />
            {{ item.text }}
          </li>
        </ul>
      </aside>

      <section class="jf-forgot-panel">
        <div class="jf-forgot-card" aria-labelledby="forgot-title">
          <div v-if="isSubmitted" class="jf-success-state">
            <span class="jf-success-icon">
              <Icon name="checkCircle" size="lg" />
            </span>
            <strong>{{ brandName }}</strong>
            <p>{{ forgotCopy.productSubtitle }}</p>
            <h2 id="forgot-title">{{ t('auth.resetEmailSent') }}</h2>
            <span>{{ t('auth.resetEmailSentHint') }}</span>
            <router-link to="/login" class="jf-submit jf-submit-link">
              <Icon name="arrowLeft" size="md" />
              <span>{{ t('auth.backToLogin') }}</span>
            </router-link>
          </div>

          <form v-else class="jf-form" @submit.prevent="handleSubmit">
            <div class="jf-card-heading">
              <strong>{{ brandName }}</strong>
              <p>{{ forgotCopy.productSubtitle }}</p>
              <h2 id="forgot-title">{{ forgotCopy.title }}</h2>
              <span>{{ forgotCopy.description }}</span>
            </div>

            <div class="jf-field">
              <label for="forgot-email">{{ forgotCopy.email }}</label>
              <div class="jf-input-wrap" :class="{ 'is-error': errors.email }">
                <Icon name="mail" size="md" />
                <input
                  id="forgot-email"
                  v-model="formData.email"
                  type="email"
                  required
                  autofocus
                  autocomplete="email"
                  :disabled="isLoading"
                  :placeholder="forgotCopy.emailPlaceholder"
                />
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

            <button
              type="submit"
              class="jf-submit"
              :disabled="isLoading || (turnstileEnabled && !turnstileToken)"
            >
              <svg v-if="isLoading" class="jf-spin" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <Icon v-else name="mail" size="md" />
              <span>{{ isLoading ? t('auth.sendingResetLink') : t('auth.sendResetLink') }}</span>
            </button>

            <p class="jf-login-link">
              {{ t('auth.rememberedPassword') }}
              <router-link to="/login">{{ t('auth.signIn') }}</router-link>
            </p>
          </form>
        </div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import TurnstileWidget from '@/components/TurnstileWidget.vue'
import { useAppStore } from '@/stores'
import { forgotPassword, getPublicSettings } from '@/api/auth'

const { t, locale } = useI18n()
const appStore = useAppStore()

type ForgotFeatureIcon = 'lock' | 'shield' | 'clock'

const forgotCopies = {
  zh: {
    brandMark: '锋',
    brandName: '九锋',
    backHome: '← 返回首页',
    productSubtitle: '最安全的大模型中转平台',
    heroKicker: 'RESET · 访问恢复',
    heroTitleTop: '忘记密码',
    heroTitleBottom: '重新拿回你的密钥入口',
    heroDescription: '输入注册邮箱，我们会把密码重置链接发送给你。链接仅短时间有效，用完即失效。',
    heroFeatures: [
      { icon: 'lock' as ForgotFeatureIcon, text: '邮箱验证 · 链接短时有效' },
      { icon: 'shield' as ForgotFeatureIcon, text: '重置密码 · 不暴露旧密钥' },
      { icon: 'clock' as ForgotFeatureIcon, text: '找回访问权 · 继续接入 API' },
    ],
    title: '重置密码',
    description: '用邮箱接收一次性重置链接',
    email: '邮箱',
    emailPlaceholder: '请输入邮箱',
  },
  en: {
    brandMark: 'JF',
    brandName: 'Jiufeng',
    backHome: '← Back Home',
    productSubtitle: 'The safest large model relay platform',
    heroKicker: 'RESET · ACCESS RECOVERY',
    heroTitleTop: 'Forgot password',
    heroTitleBottom: 'Recover your API access',
    heroDescription: 'Enter the email on your account and we will send a short-lived password reset link.',
    heroFeatures: [
      { icon: 'lock' as ForgotFeatureIcon, text: 'Email verified · Short-lived link' },
      { icon: 'shield' as ForgotFeatureIcon, text: 'Reset password · No old secret exposure' },
      { icon: 'clock' as ForgotFeatureIcon, text: 'Recover access · Keep your API online' },
    ],
    title: 'Reset password',
    description: 'Receive a one-time reset link by email',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
  },
} as const

const isZhLocale = computed(() => locale.value.toLowerCase().startsWith('zh'))
const forgotCopy = computed(() => (isZhLocale.value ? forgotCopies.zh : forgotCopies.en))

const isLoading = ref(false)
const isSubmitted = ref(false)
const errorMessage = ref('')
const turnstileEnabled = ref(false)
const turnstileSiteKey = ref('')

const turnstileRef = ref<InstanceType<typeof TurnstileWidget> | null>(null)
const turnstileToken = ref('')

const formData = reactive({
  email: '',
})

const errors = reactive({
  email: '',
  turnstile: '',
})

const brandName = computed(() => forgotCopy.value.brandName)
const brandMark = computed(() => forgotCopy.value.brandMark)
const validationToastMessage = computed(() => errors.email || errors.turnstile || '')

watch(validationToastMessage, (value, previousValue) => {
  if (value && value !== previousValue) {
    appStore.showError(value)
  }
})

onMounted(async () => {
  try {
    const settings = await getPublicSettings()
    turnstileEnabled.value = settings.turnstile_enabled
    turnstileSiteKey.value = settings.turnstile_site_key || ''
  } catch (error) {
    console.error('Failed to load public settings:', error)
  }
})

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
  errors.turnstile = ''

  if (!formData.email.trim()) {
    errors.email = t('auth.emailRequired')
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = t('auth.invalidEmail')
    return false
  }

  if (turnstileEnabled.value && !turnstileToken.value) {
    errors.turnstile = t('auth.completeVerification')
    return false
  }

  return true
}

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''

  if (!validateForm()) return

  isLoading.value = true

  try {
    await forgotPassword({
      email: formData.email,
      turnstile_token: turnstileEnabled.value ? turnstileToken.value : undefined,
    })

    isSubmitted.value = true
    appStore.showSuccess(t('auth.resetEmailSent'))
  } catch (error: unknown) {
    turnstileRef.value?.reset()
    turnstileToken.value = ''

    const err = error as { message?: string; response?: { data?: { detail?: string } } }
    errorMessage.value =
      err.response?.data?.detail ||
      err.message ||
      t('auth.sendResetLinkFailed')

    appStore.showError(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.jf-forgot-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 18% 18%, rgba(247, 247, 247, .92), transparent 28%),
    linear-gradient(90deg, #fff 0%, #fff 55%, #fbfbfb 100%);
  color: #151515;
  font-family: Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.jf-forgot-header {
  position: fixed;
  z-index: 20;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  height: 86px;
  align-items: center;
  justify-content: space-between;
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

.jf-forgot-shell {
  display: grid;
  grid-template-columns: minmax(520px, 1fr) 480px;
  min-height: 100vh;
  width: min(100% - 88px, 1430px);
  align-items: center;
  gap: clamp(70px, 6.4vw, 132px);
  margin: 0 auto;
  padding: 118px 0 56px;
}

.jf-forgot-shell--en {
  grid-template-columns: minmax(560px, 1fr) 480px;
  gap: clamp(84px, 7.2vw, 150px);
}

.jf-forgot-hero {
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

.jf-forgot-shell--en .jf-hero-kicker {
  overflow: hidden;
  font-size: clamp(10px, .76vw, 12px);
  line-height: 1.2;
  letter-spacing: .34em;
  text-overflow: clip;
  white-space: nowrap;
}

.jf-forgot-hero h1 {
  margin: 0;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.16;
}

.jf-forgot-hero h1 span {
  display: block;
}

.jf-forgot-hero h1 span:first-child {
  color: #080808;
  font-size: clamp(40.2px, 3.35vw, 61.8px);
}

.jf-forgot-hero h1 span:last-child {
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

.jf-forgot-panel {
  display: flex;
  justify-content: flex-end;
}

.jf-forgot-card {
  width: 480px;
  min-height: 506px;
  transform: translateX(-20%);
  padding: 60px 40px 34px;
  border: 1px solid #e7e7e7;
  border-radius: 21px;
  background: rgba(255, 255, 255, .88);
  box-shadow: 0 30px 64px rgba(20, 20, 20, .045);
}

.jf-forgot-shell--en .jf-forgot-card {
  transform: translateX(-8%);
}

.jf-card-heading,
.jf-success-state {
  text-align: center;
}

.jf-card-heading strong,
.jf-card-heading h2,
.jf-success-state strong,
.jf-success-state h2 {
  font-family: "Noto Serif SC", "Songti SC", serif;
  color: #111;
}

.jf-card-heading strong,
.jf-success-state strong {
  display: block;
  font-size: 30px;
  font-weight: 950;
}

.jf-card-heading p,
.jf-success-state p {
  margin: 17px 0 38px;
  color: #9a9a9a;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 15px;
  font-style: italic;
  font-weight: 700;
}

.jf-card-heading h2,
.jf-success-state h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 950;
}

.jf-card-heading span,
.jf-success-state span:not(.jf-success-icon) {
  display: block;
  margin-top: 13px;
  color: #777;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.55;
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
}

.jf-input-wrap {
  display: flex;
  height: 54px;
  align-items: center;
  gap: 12px;
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
  font-size: 14px;
  font-weight: 400;
}

.jf-input-wrap input::placeholder {
  color: #a8b0bd;
}

.jf-input-wrap input:disabled {
  cursor: not-allowed;
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
  text-decoration: none;
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

.jf-submit-link {
  width: 100%;
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

.jf-success-state {
  display: flex;
  min-height: 412px;
  flex-direction: column;
  justify-content: center;
}

.jf-success-icon {
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

.jf-success-state .jf-submit {
  margin-top: 30px;
}

.jf-login-link {
  margin: 22px 0 0;
  color: #777;
  font-size: 11.2px;
  font-weight: 400;
  line-height: 1.4;
  text-align: center;
}

.jf-login-link a {
  color: #151515;
  font-weight: 800;
  text-decoration: none;
}

@keyframes jfSpin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1100px) {
  .jf-forgot-shell {
    grid-template-columns: 1fr;
    width: min(100% - 44px, 500px);
    padding-top: 112px;
  }

  .jf-forgot-hero {
    display: none;
  }

  .jf-forgot-panel {
    justify-content: center;
  }

  .jf-forgot-card {
    width: min(100%, 480px);
    transform: none;
  }
}

@media (min-width: 1101px) and (max-width: 1280px) {
  .jf-forgot-shell--en {
    grid-template-columns: minmax(500px, 1fr) 440px;
    gap: 58px;
  }

  .jf-forgot-shell--en .jf-forgot-hero {
    transform: translate(3%, -3%);
  }

  .jf-forgot-shell--en .jf-hero-kicker {
    font-size: 10px;
    letter-spacing: .22em;
  }

  .jf-forgot-shell--en .jf-forgot-card {
    width: 440px;
    transform: translateX(0);
  }
}

@media (max-width: 640px) {
  .jf-forgot-page {
    background: #fff;
  }

  .jf-forgot-header {
    position: static;
    height: auto;
    padding: 22px;
  }

  .jf-brand strong {
    font-size: 30px;
  }

  .jf-brand span {
    display: none;
  }

  .jf-header-actions {
    gap: 10px;
  }

  .jf-home-link {
    font-size: 13px;
  }

  .jf-forgot-shell {
    width: min(100% - 28px, 480px);
    min-height: auto;
    padding: 14px 0 38px;
  }

  .jf-forgot-card {
    min-height: 0;
    width: 100%;
    padding: 36px 20px 28px;
    border-radius: 20px;
  }

  .jf-card-heading p,
  .jf-success-state p {
    margin-bottom: 32px;
  }

  .jf-input-wrap {
    height: 52px;
  }

  .jf-success-state {
    min-height: 360px;
  }
}
</style>
