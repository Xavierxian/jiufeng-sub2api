import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { RouterView } from 'vue-router'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import router from '@/router'
import { jiufengNavigationPath, jiufengNavigationTarget } from '../navigation'

const state = vi.hoisted(() => ({
  auth: {
    checkAuth: vi.fn(), isAuthenticated: true, isAdmin: true,
    isSimpleMode: true, hasPendingAuthSession: false,
  },
  app: {
    siteName: 'Jiufeng', backendModeEnabled: false, publicSettingsLoaded: true,
    cachedPublicSettings: {} as Record<string, unknown> | null,
    fetchPublicSettings: vi.fn(), showError: vi.fn(),
  },
  getSubscriptions: vi.fn(),
}))
const auth = reactive(state.auth)
const app = reactive(state.app)

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return { ...actual, createWebHistory: actual.createMemoryHistory }
})
vi.mock('@/stores/auth', () => ({ useAuthStore: () => auth }))
vi.mock('@/stores/app', () => ({ useAppStore: () => app }))
vi.mock('@/stores/adminSettings', () => ({ useAdminSettingsStore: () => ({ customMenuItems: [] }) }))
vi.mock('@/stores/adminCompliance', () => ({ useAdminComplianceStore: () => ({ initialized: true }) }))
vi.mock('@/composables/useNavigationLoading', () => ({
  useNavigationLoadingState: () => ({ startNavigation: vi.fn(), endNavigation: vi.fn() }),
}))
vi.mock('@/composables/useRoutePrefetch', () => ({
  useRoutePrefetch: () => ({ triggerPrefetch: vi.fn() }),
}))
vi.mock('vue-i18n', async (importOriginal) => ({
  ...await importOriginal<typeof import('vue-i18n')>(),
  useI18n: () => ({ t: (key: string) => key }),
}))
vi.mock('../admin/GroupsView.vue', () => ({ __esModule: true, default: { template: '<p data-test="groups">Groups</p>' } }))
vi.mock('../admin/DashboardOverview.vue', () => ({ __esModule: true, default: { template: '<p data-test="overview">Overview</p>' } }))
vi.mock('../user/DashboardView.vue', () => ({ __esModule: true, default: { template: '<p>User dashboard</p>' } }))
vi.mock('../JFLoginView.vue', () => ({ __esModule: true, default: { template: '<p>Login</p>' } }))
vi.mock('@/api/subscriptions', () => ({ default: { getMySubscriptions: state.getSubscriptions } }))

enableAutoUnmount(afterEach)

beforeEach(async () => {
  vi.clearAllMocks()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  Object.assign(auth, { isAuthenticated: true, isAdmin: true, isSimpleMode: true })
  Object.assign(app, { publicSettingsLoaded: true, cachedPublicSettings: {}, backendModeEnabled: false })
  state.getSubscriptions.mockResolvedValue([])
  await router.replace('/admin/dashboard')
})

describe('Jiufeng navigation with the unchanged shared router', () => {
  it('opens simple-mode groups on a direct load and keeps navigation selection and browser history correct', async () => {
    const target = jiufengNavigationTarget('/admin/groups', auth)
    await router.push(target)
    const wrapper = mount(RouterView, { global: { plugins: [router] } })
    await vi.waitFor(() => expect(wrapper.find('[data-test="groups"]').exists()).toBe(true))
    expect(wrapper.find('[data-test="overview"]').exists()).toBe(false)
    expect(jiufengNavigationPath(router.currentRoute.value, auth)).toBe('/admin/groups')
    expect(document.title).toContain('admin.groups.title')

    await router.push('/admin/dashboard')
    await vi.waitFor(() => expect(wrapper.find('[data-test="overview"]').exists()).toBe(true))
    expect(wrapper.find('[data-test="groups"]').exists()).toBe(false)
    router.back()
    await vi.waitFor(() => expect(wrapper.find('[data-test="groups"]').exists()).toBe(true))
    router.forward()
    await vi.waitFor(() => expect(wrapper.find('[data-test="overview"]').exists()).toBe(true))
  })

  it('retains the normal group URL outside simple mode', () => {
    auth.isSimpleMode = false
    expect(jiufengNavigationTarget('/admin/groups', auth)).toBe('/admin/groups')
    expect(jiufengNavigationPath({ path: '/admin/dashboard', query: { view: 'groups' } }, auth)).toBe('/admin/dashboard')
  })

  it('recovers an old group bookmark after the shared guard redirects it', async () => {
    await router.push('/dashboard')
    await router.push('/admin/groups')
    expect(router.currentRoute.value.path).toBe('/admin/dashboard')
    expect(router.currentRoute.value.redirectedFrom?.path).toBe('/admin/groups')
    const wrapper = mount(RouterView, { global: { plugins: [router] } })
    await vi.waitFor(() => expect(wrapper.find('[data-test="groups"]').exists()).toBe(true))
    await vi.waitFor(() => expect(router.currentRoute.value.fullPath).toBe('/admin/dashboard?view=groups'))
    expect(wrapper.find('[data-test="overview"]').exists()).toBe(false)
  })

  it.each([false, true])('does not grant group access to a non-admin (authenticated=%s)', async (authenticated) => {
    auth.isAuthenticated = authenticated
    auth.isAdmin = false
    await router.push('/admin/dashboard?view=groups')
    expect(router.currentRoute.value.path).toBe(authenticated ? '/dashboard' : '/login')
    expect(jiufengNavigationTarget('/admin/groups', auth)).toBe('/admin/groups')
  })
})

describe('Jiufeng subscription entry guard', () => {
  it.each([false, true])('redirects before mounting when subscriptions are disabled (admin=%s)', async (isAdmin) => {
    auth.isSimpleMode = false
    auth.isAdmin = isAdmin
    app.cachedPublicSettings = { subscription_enabled: false }
    await router.push('/subscriptions')
    expect(router.currentRoute.value.path).toBe(isAdmin ? '/admin/dashboard' : '/dashboard')
    expect(state.getSubscriptions).not.toHaveBeenCalled()
  })

  it('waits for settings before deciding access', async () => {
    auth.isSimpleMode = false
    app.publicSettingsLoaded = false
    app.cachedPublicSettings = null
    let resolveSettings!: () => void
    state.app.fetchPublicSettings.mockImplementationOnce(() => new Promise<void>((resolve) => {
      resolveSettings = () => {
        app.publicSettingsLoaded = true
        app.cachedPublicSettings = { subscription_enabled: false }
        resolve()
      }
    }))
    const navigation = router.push('/subscriptions')
    await vi.waitFor(() => expect(state.app.fetchPublicSettings).toHaveBeenCalledOnce())
    expect(router.currentRoute.value.path).toBe('/admin/dashboard')
    resolveSettings()
    await navigation
    expect(router.currentRoute.value.path).toBe('/admin/dashboard')
  })

  it.each([{}, { subscription_enabled: true }])('allows opt-out settings %j', async (settings) => {
    auth.isSimpleMode = false
    app.cachedPublicSettings = settings
    await router.push('/subscriptions')
    expect(router.currentRoute.value.path).toBe('/subscriptions')
  })

  it('does not treat a settings outage as an explicit disable', async () => {
    auth.isSimpleMode = false
    app.publicSettingsLoaded = false
    app.cachedPublicSettings = null
    state.app.fetchPublicSettings.mockRejectedValueOnce(new Error('Temporary outage'))
    await router.push('/subscriptions')
    await flushPromises()
    expect(router.currentRoute.value.path).toBe('/subscriptions')
  })
})
