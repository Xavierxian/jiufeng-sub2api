<template>
  <main class="jf-reset-page">
    <header class="jf-reset-header">
      <router-link to="/home" class="jf-reset-brand" :aria-label="`${resetCopy.brandName} home`">
        <strong>{{ resetCopy.brandMark }}</strong><span>{{ resetCopy.brandName }}</span>
      </router-link>
      <div class="jf-reset-actions"><LocaleSwitcher /><router-link to="/home">{{ resetCopy.backHome }}</router-link></div>
    </header>
    <section class="jf-reset-shell">
      <aside class="jf-reset-hero" aria-hidden="true">
        <p>{{ resetCopy.kicker }}</p><h1><span>{{ resetCopy.heroTitle }}</span><span>{{ resetCopy.heroSubtitle }}</span></h1>
      </aside>
      <section class="jf-reset-card" aria-labelledby="reset-title">
        <div v-if="isInvalidLink || isSuccess" class="jf-reset-state">
          <span class="jf-reset-state-icon"><Icon :name="isSuccess ? 'checkCircle' : 'exclamationCircle'" size="lg" /></span>
          <h2 id="reset-title">{{ isSuccess ? t('auth.passwordResetSuccess') : t('auth.invalidResetLink') }}</h2>
          <p>{{ isSuccess ? t('auth.passwordResetSuccessHint') : t('auth.invalidResetLinkHint') }}</p>
          <router-link :to="isSuccess ? '/login' : '/forgot-password'" class="jf-reset-submit">
            <Icon :name="isSuccess ? 'login' : 'mail'" size="md" />
            <span>{{ isSuccess ? t('auth.signIn') : t('auth.requestNewResetLink') }}</span>
          </router-link>
        </div>
        <form v-else class="jf-reset-form" @submit.prevent="handleSubmit">
          <div class="jf-reset-heading"><strong>{{ resetCopy.brandName }}</strong><p>{{ resetCopy.productSubtitle }}</p><h2 id="reset-title">{{ t('auth.resetPasswordTitle') }}</h2><span>{{ t('auth.resetPasswordHint') }}</span></div>
          <div class="jf-reset-field"><label for="email">{{ t('auth.emailLabel') }}</label><div class="jf-reset-input is-disabled"><Icon name="mail" size="md" /><input id="email" :value="email" type="email" readonly disabled /></div></div>
          <div class="jf-reset-field"><label for="password">{{ t('auth.newPassword') }}</label><div class="jf-reset-input" :class="{ 'is-error': errors.password }"><Icon name="lock" size="md" /><input id="password" v-model="formData.password" :type="showPassword ? 'text' : 'password'" required autocomplete="new-password" :disabled="isLoading" :placeholder="t('auth.newPasswordPlaceholder')" /><button type="button" :aria-label="resetCopy.togglePassword" @click="showPassword = !showPassword"><Icon :name="showPassword ? 'eyeOff' : 'eye'" size="md" /></button></div></div>
          <div class="jf-reset-field"><label for="confirmPassword">{{ t('auth.confirmPassword') }}</label><div class="jf-reset-input" :class="{ 'is-error': errors.confirmPassword }"><Icon name="lock" size="md" /><input id="confirmPassword" v-model="formData.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" required autocomplete="new-password" :disabled="isLoading" :placeholder="t('auth.confirmPasswordPlaceholder')" /><button type="button" :aria-label="resetCopy.togglePassword" @click="showConfirmPassword = !showConfirmPassword"><Icon :name="showConfirmPassword ? 'eyeOff' : 'eye'" size="md" /></button></div></div>
          <button type="submit" class="jf-reset-submit" :disabled="isLoading"><svg v-if="isLoading" class="jf-reset-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg><Icon v-else name="checkCircle" size="md" /><span>{{ isLoading ? t('auth.resettingPassword') : t('auth.resetPassword') }}</span></button>
          <p class="jf-reset-login">{{ t('auth.rememberedPassword') }} <router-link to="/login">{{ t('auth.signIn') }}</router-link></p>
        </form>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { useAppStore } from '@/stores'
import { resetPassword } from '@/api/auth'

const { t, locale } = useI18n()

// ==================== Router & Stores ====================

const route = useRoute()
const appStore = useAppStore()

const resetCopies = {
  zh: { brandMark: '九', brandName: '九锋', backHome: '返回首页', kicker: 'RESET · ACCESS RECOVERY', heroTitle: '重设访问密码', heroSubtitle: '验证一次性链接后，为账户设置新的安全密码。', productSubtitle: '安全、稳定的大模型中转平台', togglePassword: '显示或隐藏密码' },
  en: { brandMark: 'JF', brandName: 'Jiufeng', backHome: 'Back Home', kicker: 'RESET · ACCESS RECOVERY', heroTitle: 'Set a new password', heroSubtitle: 'Use your one-time link to restore secure access to your account.', productSubtitle: 'Secure and stable model relay platform', togglePassword: 'Show or hide password' },
} as const
const resetCopy = computed(() => locale.value.toLowerCase().startsWith('zh') ? resetCopies.zh : resetCopies.en)

// ==================== State ====================

const isLoading = ref<boolean>(false)
const isSuccess = ref<boolean>(false)
const errorMessage = ref<string>('')
const showPassword = ref<boolean>(false)
const showConfirmPassword = ref<boolean>(false)

// URL parameters
const email = ref<string>('')
const token = ref<string>('')

const formData = reactive({
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  password: '',
  confirmPassword: ''
})

const validationToastMessage = computed(
  () => errors.password || errors.confirmPassword || ''
)

watch(validationToastMessage, (value, previousValue) => {
  if (value && value !== previousValue) {
    appStore.showError(value)
  }
})

// Check if the reset link is valid (has email and token)
const isInvalidLink = computed(() => !email.value || !token.value)

// ==================== Lifecycle ====================

onMounted(() => {
  // Get email and token from URL query parameters
  email.value = (route.query.email as string) || ''
  token.value = (route.query.token as string) || ''

  if (!email.value || !token.value) {
    appStore.showError(t('auth.invalidResetLink'))
  }
})

// ==================== Validation ====================

function validateForm(): boolean {
  errors.password = ''
  errors.confirmPassword = ''

  let isValid = true

  // Password validation
  if (!formData.password) {
    errors.password = t('auth.passwordRequired')
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = t('auth.passwordMinLength')
    isValid = false
  }

  // Confirm password validation
  if (!formData.confirmPassword) {
    errors.confirmPassword = t('auth.confirmPasswordRequired')
    isValid = false
  } else if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = t('auth.passwordsDoNotMatch')
    isValid = false
  }

  return isValid
}

// ==================== Form Handlers ====================

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    await resetPassword({
      email: email.value,
      token: token.value,
      new_password: formData.password
    })

    isSuccess.value = true
    appStore.showSuccess(t('auth.passwordResetSuccess'))
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { data?: { detail?: string; code?: string } } }

    // Check for invalid/expired token error
    if (err.response?.data?.code === 'INVALID_RESET_TOKEN') {
      errorMessage.value = t('auth.invalidOrExpiredToken')
    } else if (err.response?.data?.detail) {
      errorMessage.value = err.response.data.detail
    } else if (err.message) {
      errorMessage.value = err.message
    } else {
      errorMessage.value = t('auth.resetPasswordFailed')
    }

    appStore.showError(errorMessage.value)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.jf-reset-page { min-height: 100vh; background: radial-gradient(circle at 18% 18%, rgba(247,247,247,.92), transparent 28%), linear-gradient(90deg,#fff 0%,#fff 55%,#fbfbfb 100%); color: #151515; font-family: Inter, "Noto Sans SC", "PingFang SC", sans-serif; }
.jf-reset-header { position: fixed; z-index: 10; top: 0; right: 0; left: 0; display: flex; height: 86px; align-items: center; justify-content: space-between; padding: 0 clamp(24px, 10.8vw, 220px); }
.jf-reset-brand { display: inline-flex; align-items: center; gap: 15px; color: #101010; text-decoration: none; }
.jf-reset-brand strong { font-family: "Noto Serif SC", "Songti SC", serif; font-size: 30px; font-weight: 950; }
.jf-reset-brand span { font-family: "Noto Serif SC", "Songti SC", serif; font-size: 17px; font-weight: 800; }
.jf-reset-actions { display: flex; align-items: center; gap: 18px; }
.jf-reset-actions > a { color: #667085; font-size: 13px; text-decoration: none; }
.jf-reset-actions > a:hover, .jf-reset-login a:hover { color: #111; }
.jf-reset-actions :deep(.relative > button) { color: #111; background: #fff; font-size: 12px; font-weight: 400; }
.jf-reset-actions :deep(.relative > button:hover) { background: #f6f6f6; }
.jf-reset-actions :deep(.absolute) { border-color: #e5e5e5; background: #fff; box-shadow: 0 14px 30px rgba(15,23,42,.12); }
.jf-reset-actions :deep(.absolute button) { color: #111; background: #fff; font-size: 12px; font-weight: 400; }
.jf-reset-actions :deep(.absolute button:hover), .jf-reset-actions :deep(.absolute button.bg-primary-50) { color: #111; background: #f4f4f4; }
.jf-reset-shell { display: grid; grid-template-columns: minmax(520px, 1fr) 480px; min-height: 100vh; width: min(100% - 88px, 1430px); align-items: center; gap: clamp(70px, 6.4vw, 132px); margin: 0 auto; padding: 118px 0 56px; }
.jf-reset-hero { align-self: end; max-width: 808px; padding: 0 0 104px clamp(0px, 2.7vw, 50px); transform: translate(17%, -3%); }
.jf-reset-hero p { margin: 0 0 50px; color: #bebebe; font-family: "Noto Serif SC", "Songti SC", serif; font-size: 15px; font-weight: 500; letter-spacing: .42em; }
.jf-reset-hero h1 { max-width: min(100%, 560px); margin: 0; font-family: "Noto Serif SC", "Songti SC", serif; font-weight: 900; line-height: 1.16; }.jf-reset-hero h1 span { display: block; }.jf-reset-hero h1 span:first-child { color:#080808; font-size:clamp(40px,3.35vw,62px); }.jf-reset-hero h1 span:last-child { max-width: 520px; margin-top: 8px; color:#666; font-size:clamp(18px,1.45vw,27px); line-height:1.35; }
.jf-reset-card { min-height: 548px; padding: 58px 40px 34px; border: 1px solid #e7e7e7; border-radius: 21px; background: rgba(255,255,255,.88); box-shadow: 0 30px 64px rgba(20,20,20,.045); transform: translateX(-20%); }
.jf-reset-heading, .jf-reset-state { text-align: center; }
.jf-reset-heading strong { display: block; color: #111; font-family: "Noto Serif SC", serif; font-size: 30px; font-weight: 950; }
.jf-reset-heading p { margin: 8px 0 28px; color: #98a2b3; font-size: 13px; }
.jf-reset-heading h2, .jf-reset-state h2 { margin: 0; color: #172033; font-size: 26px; font-weight: 800; }
.jf-reset-heading > span, .jf-reset-state p { display: block; margin-top: 10px; color: #667085; font-size: 14px; line-height: 1.6; }
.jf-reset-field { margin-top: 23px; }
.jf-reset-field label { display: block; margin-bottom: 9px; color: #344054; font-size: 14px; font-weight: 700; }
.jf-reset-input { display: flex; height: 52px; align-items: center; gap: 11px; padding: 0 14px; border: 1px solid #dfe5ec; border-radius: 9px; background: #fff; color: #98a2b3; transition: border-color .18s ease, box-shadow .18s ease; }
.jf-reset-input:focus-within { border-color: #0e9f8c; box-shadow: 0 0 0 3px rgba(14, 159, 140, .12); }
.jf-reset-input.is-error { border-color: #d92d20; }
.jf-reset-input.is-disabled { background: #f5f7fa; }
.jf-reset-input input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: #172033; font-size: 14px; }
.jf-reset-input input:disabled { color: #667085; cursor: not-allowed; }
.jf-reset-input button { display: grid; border: 0; place-items: center; padding: 2px; background: transparent; color: #98a2b3; cursor: pointer; }
.jf-reset-input button:hover { color: #0e9f8c; }
.jf-reset-submit { display: flex; width: 100%; min-height: 56px; align-items: center; justify-content: center; gap: 13px; margin-top: 29px; border: 0; border-radius: 999px; background: #050505; color: #fff; font-size: 16px; font-weight: 900; text-decoration: none; box-shadow: 0 9px 16px rgba(38,35,30,.16); cursor: pointer; transition: background .18s ease, transform .18s ease; }
.jf-reset-submit:hover:not(:disabled) { background: #171717; transform: translateY(-1px); }
.jf-reset-submit:disabled { cursor: not-allowed; opacity: .62; }
.jf-reset-spin { width: 19px; height: 19px; animation: jf-reset-spin .8s linear infinite; }
.jf-reset-spin circle { opacity: .3; }.jf-reset-spin path { opacity: .9; }
.jf-reset-login { margin: 21px 0 0; color: #667085; font-size: 13px; text-align: center; }.jf-reset-login a { color: #0e9f8c; font-weight: 700; text-decoration: none; }
.jf-reset-state { display: flex; min-height: 452px; flex-direction: column; align-items: center; justify-content: center; }.jf-reset-state-icon { display: grid; width: 54px; height: 54px; place-items: center; margin-bottom: 20px; border-radius: 50%; background: #e7f7f4; color: #0e9f8c; }.jf-reset-state p { max-width: 310px; }.jf-reset-state .jf-reset-submit { max-width: 320px; margin-top: 30px; }
@keyframes jf-reset-spin { to { transform: rotate(360deg); } }
@media (max-width: 980px) { .jf-reset-shell { grid-template-columns: 1fr; width: min(100% - 40px, 500px); padding-top: 112px; }.jf-reset-hero { display: none; }.jf-reset-card { min-height: 0; transform: none; } }
@media (max-width: 640px) { .jf-reset-header { position: static; height: 70px; padding: 0 20px; }.jf-reset-brand span { display: none; }.jf-reset-actions { gap: 10px; }.jf-reset-shell { width: min(100% - 28px, 500px); min-height: auto; padding: 20px 0 36px; }.jf-reset-card { padding: 36px 20px 28px; border-radius: 14px; }.jf-reset-heading h2, .jf-reset-state h2 { font-size: 23px; } }
</style>
