import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reactive } from 'vue'
import { RouterView } from 'vue-router'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import router from '@/router'
import Sidebar from '../../JFAppSidebar.vue'
import { installJiufengMcpRoutes } from '../../mcpRoutes'

const state = vi.hoisted(() => ({
  auth: { checkAuth: vi.fn(), isAuthenticated: true, isAdmin: false, isSimpleMode: false },
  app: {
    siteName: 'Jiufeng', backendModeEnabled: false, publicSettingsLoaded: true,
    cachedPublicSettings: { mcp_enabled: true } as Record<string, unknown>,
    mobileOpen: true, setMobileOpen: vi.fn(), fetchPublicSettings: vi.fn(),
  },
  admin: { customMenuItems: [], fetch: vi.fn(), opsMonitoringEnabled: true },
}))
const auth = reactive(state.auth)
const app = reactive(state.app)
vi.mock('vue-router', async (original) => {
  const actual = await original<typeof import('vue-router')>()
  return { ...actual, createWebHistory: actual.createMemoryHistory }
})
vi.mock('@/stores/auth', () => ({ useAuthStore: () => auth }))
vi.mock('@/stores/app', () => ({ useAppStore: () => app }))
vi.mock('@/stores/adminSettings', () => ({ useAdminSettingsStore: () => state.admin }))
vi.mock('@/stores/adminCompliance', () => ({ useAdminComplianceStore: () => ({ initialized: true }) }))
vi.mock('@/stores', () => ({
  useAuthStore: () => auth, useAppStore: () => app,
  useAdminSettingsStore: () => state.admin,
  useOnboardingStore: () => ({ isCurrentStep: () => false }),
}))
vi.mock('@/composables/useNavigationLoading', () => ({
  useNavigationLoadingState: () => ({ startNavigation: vi.fn(), endNavigation: vi.fn() }),
}))
vi.mock('@/composables/useRoutePrefetch', () => ({ useRoutePrefetch: () => ({ triggerPrefetch: vi.fn() }) }))
vi.mock('@/composables/useBatchImageAccess', () => ({
  useBatchImageAccess: () => ({ canUseBatchImage: { value: false }, refreshBatchImageAccess: vi.fn() }),
}))
vi.mock('vue-i18n', async (original) => ({
  ...await original<typeof import('vue-i18n')>(),
  useI18n: () => ({ t: (key: string) => key, locale: { value: 'zh-CN' } }),
}))
vi.mock('../../JFPublicHeader.vue', () => ({ default: { template: '<header />' } }))
vi.mock('@/components/common/VersionBadge.vue', () => ({ default: { template: '<span />' } }))
vi.mock('../../JFLoginView.vue', () => ({ default: { template: '<p>Login</p>' } }))
vi.mock('../../user/DashboardView.vue', () => ({ default: { template: '<p>Dashboard</p>' } }))
vi.mock('../../user/MCPView.vue', () => ({ default: { template: '<p data-test="connections">Connections</p>' } }))
vi.mock('../../auth/MCPOAuthAuthorizeView.vue', () => ({ default: { template: '<p data-test="consent">Consent</p>' } }))

const authorizationURL = '/oauth/mcp/authorize?' + new URLSearchParams({
  response_type: 'code', client_id: 'desktop', redirect_uri: 'http://127.0.0.1:54321/callback',
  resource: 'https://api.example.com/api/v1/mcp', state: 'a+b&x=1',
  code_challenge: 'a'.repeat(43), code_challenge_method: 'S256',
}).toString()
enableAutoUnmount(afterEach)
beforeEach(async () => {
  vi.clearAllMocks()
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  Object.assign(auth, { isAuthenticated: true, isAdmin: false, isSimpleMode: false })
  Object.assign(app, { backendModeEnabled: false, publicSettingsLoaded: true, cachedPublicSettings: { mcp_enabled: true } })
  await router.replace('/dashboard')
  for (const name of ['MCP', 'MCPOAuthAuthorize']) if (router.hasRoute(name)) router.removeRoute(name)
})

describe('Jiufeng MCP routes through the unchanged shared router', () => {
  it.each(['/settings/mcp', '/settings/mcp/', authorizationURL])('opens a direct link before rendering 404: %s', async (url) => {
    expect(router.hasRoute('MCP')).toBe(false)
    await router.push(url)
    const wrapper = mount(RouterView, { global: { plugins: [router] } })
    await flushPromises()
    expect(router.currentRoute.value.name).toBe(url.startsWith('/settings') ? 'MCP' : 'MCPOAuthAuthorize')
    // Vue Router normalizes percent encoding when following a guard redirect;
    // all decoded values (especially OAuth state and redirect_uri) must survive.
    const expected = router.resolve(url)
    expect(router.currentRoute.value.path).toBe(expected.path)
    expect(router.currentRoute.value.query).toEqual(expected.query)
    expect(router.currentRoute.value.hash).toBe(expected.hash)
    expect(wrapper.find('.jf-not-found').exists()).toBe(false)
    expect(wrapper.find('[data-test]').exists()).toBe(true)
    expect(router.currentRoute.value.meta.titleKey).toBe(url.startsWith('/settings') ? 'mcp.title' : 'mcp.consentTitle')
    expect(document.title).toBe(url.startsWith('/settings') ? 'MCP Connection - Jiufeng' : 'Authorize MCP Application - Jiufeng')
  })

  it('preserves the complete OAuth query across login and rematching', async () => {
    auth.isAuthenticated = false
    await router.push(authorizationURL)
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe(authorizationURL)
    const destination = router.currentRoute.value.query.redirect as string
    auth.isAuthenticated = true
    await router.push(destination)
    expect(router.currentRoute.value.name).toBe('MCPOAuthAuthorize')
    expect(router.currentRoute.value.query.state).toBe('a+b&x=1')
  })

  it('handles navigation from an already-mounted 404 page and keeps unrelated URLs as 404', async () => {
    await router.push('/missing-page')
    const wrapper = mount(RouterView, { global: { plugins: [router] } })
    await flushPromises()
    expect(wrapper.find('.jf-not-found').exists()).toBe(true)
    await router.push('/settings/mcp')
    await flushPromises()
    expect(wrapper.find('[data-test="connections"]').exists()).toBe(true)
    router.back()
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/missing-page'))
    expect(wrapper.find('.jf-not-found').exists()).toBe(true)
    router.forward()
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('MCP'))
    await router.push('/settings/mcp/not-a-route')
    await flushPromises()
    expect(wrapper.find('.jf-not-found').exists()).toBe(true)
  })

  it('retains the backend-only restriction for non-admin users', async () => {
    app.backendModeEnabled = true
    await router.push(authorizationURL)
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.hasRoute('MCPOAuthAuthorize')).toBe(false)
  })

  it('registers idempotently and retains login requirements after registration', async () => {
    installJiufengMcpRoutes(router)
    installJiufengMcpRoutes(router)
    expect(router.getRoutes().filter(route => route.name === 'MCP')).toHaveLength(1)
    auth.isAuthenticated = false
    await router.push('/settings/mcp')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/settings/mcp')
  })
})

describe('MCP menu feature flag', () => {
  it.each([[false, false], [false, true], [true, false], [true, true]])(
    'reacts to the flag for admin=%s simple=%s in desktop and mobile navigation', async (admin, simple) => {
      Object.assign(auth, { isAdmin: admin, isSimpleMode: simple })
      // Open this group so desktop subnavigation is rendered too.
      installJiufengMcpRoutes(router)
      await router.push('/settings/mcp')
      const wrapper = mount(Sidebar, { global: { plugins: [router], stubs: { Icon: true } } })
      await flushPromises()
      expect(wrapper.findAll('a[href="/settings/mcp"]').length).toBeGreaterThanOrEqual(2)
      app.cachedPublicSettings = { mcp_enabled: false }
      await flushPromises()
      expect(wrapper.find('a[href="/settings/mcp"]').exists()).toBe(false)
      app.cachedPublicSettings = {}
      await flushPromises()
      expect(wrapper.find('a[href="/settings/mcp"]').exists()).toBe(false)
    },
  )
})
