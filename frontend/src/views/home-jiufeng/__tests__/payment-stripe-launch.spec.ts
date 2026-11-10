import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, shallowMount } from '@vue/test-utils'
import { PAYMENT_RECOVERY_STORAGE_KEY } from '@/components/payment/paymentFlow'
import PaymentView from '../user/PaymentView.vue'

const state = vi.hoisted(() => ({
  createOrder: vi.fn(),
  resolve: vi.fn(),
  getCheckoutInfo: vi.fn(),
  showError: vi.fn(),
}))

vi.mock('../JFAppLayout.vue', () => ({ default: { template: '<div><slot /></div>' } }))
vi.mock('vue-router', async (importOriginal) => ({
  ...await importOriginal<typeof import('vue-router')>(),
  useRoute: () => ({
    path: '/purchase',
    query: { wechat_resume: '1', wechat_resume_token: 'resume-42', payment_type: 'wxpay' },
  }),
  useRouter: () => ({ resolve: state.resolve, replace: vi.fn() }),
}))
vi.mock('vue-i18n', async (importOriginal) => ({
  ...await importOriginal<typeof import('vue-i18n')>(),
  useI18n: () => ({ t: (key: string) => key }),
}))
vi.mock('@/stores', () => ({
  useAppStore: () => ({ showError: state.showError, showInfo: vi.fn(), showWarning: vi.fn() }),
}))
vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({ user: { balance: 0 }, refreshUser: vi.fn() }),
}))
vi.mock('@/stores/payment', () => ({ usePaymentStore: () => ({ createOrder: state.createOrder }) }))
vi.mock('@/stores/subscriptions', () => ({
  useSubscriptionStore: () => ({ activeSubscriptions: [], fetchActiveSubscriptions: vi.fn().mockResolvedValue(undefined) }),
}))
vi.mock('@/api/payment', () => ({ paymentAPI: { getCheckoutInfo: state.getCheckoutInfo } }))
vi.mock('@/utils/device', () => ({ isMobileDevice: () => true }))

enableAutoUnmount(afterEach)
const originalLocation = window.location
let snapshotAtNavigation: Record<string, unknown> | null

beforeEach(() => {
  vi.clearAllMocks()
  window.localStorage.clear()
  snapshotAtNavigation = null
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      origin: 'http://localhost',
      set href(_url: string) {
        snapshotAtNavigation = JSON.parse(window.localStorage.getItem(PAYMENT_RECOVERY_STORAGE_KEY) || 'null')
      },
    },
  })
  state.resolve.mockImplementation(({ path, query }) => ({
    href: `${path}?${new URLSearchParams(Object.entries(query).filter(([, value]) => value != null) as [string, string][]).toString()}`,
  }))
  state.getCheckoutInfo.mockResolvedValue({ data: {
    methods: { wxpay: { available: true, daily_limit: 0, daily_used: 0, daily_remaining: 0, single_min: 0, single_max: 0, fee_rate: 0 } },
    plans: [], balance_disabled: false, balance_recharge_multiplier: 1,
    global_min: 0, global_max: 0, recharge_fee_rate: 0,
    help_text: '', help_image_url: '', stripe_publishable_key: 'pk_test',
  } })
  state.createOrder.mockReset().mockResolvedValue({
    order_id: 42, amount: 88, pay_amount: 88, fee_rate: 0,
    expires_at: '2099-01-01T00:30:00.000Z', payment_type: 'wxpay',
    client_secret: 'pi_secret_42', resume_token: 'resume-42',
  })
})

afterEach(() => {
  Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
  window.localStorage.clear()
})

async function mountCheckout() {
  shallowMount(PaymentView, { global: { stubs: { Teleport: true, Transition: false } } })
  await flushPromises()
  await flushPromises()
}

describe('Jiufeng Stripe checkout handoff', () => {
  it('keeps the secret in the local snapshot and saves it before navigating', async () => {
    await mountCheckout()

    expect(state.createOrder).toHaveBeenCalledTimes(1)
    expect(state.resolve).toHaveBeenCalledWith({
      path: '/payment/stripe',
      query: { order_id: '42', method: 'wechat_pay', resume_token: 'resume-42' },
    })
    expect(snapshotAtNavigation).toMatchObject({ orderId: 42, clientSecret: 'pi_secret_42' })
    expect(snapshotAtNavigation?.payUrl).not.toContain('client_secret')
    expect(snapshotAtNavigation?.payUrl).not.toContain('pi_secret_42')
    expect(state.showError).not.toHaveBeenCalled()
  })

  it('also omits the secret from the URL when retrying a failed mobile payment', async () => {
    state.createOrder.mockRejectedValueOnce({ reason: 'WECHAT_H5_NOT_AUTHORIZED' })
    await mountCheckout()

    expect(state.createOrder).toHaveBeenCalledTimes(2)
    expect(state.createOrder).toHaveBeenNthCalledWith(2, expect.objectContaining({ is_mobile: false }))
    expect(state.resolve).toHaveBeenCalledWith({
      path: '/payment/stripe',
      query: { order_id: '42', method: 'wechat_pay', resume_token: 'resume-42' },
    })
  })
})
