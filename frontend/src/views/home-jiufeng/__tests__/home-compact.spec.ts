import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'

import JFHomeView from '../JFHomeView.vue'

const { appStore, authStore } = vi.hoisted(() => ({
  appStore: {
    cachedPublicSettings: {} as Record<string, unknown>,
    siteName: 'Fallback site',
    siteLogo: '',
    docUrl: '',
    publicSettingsLoaded: true,
    fetchPublicSettings: vi.fn(),
  },
  authStore: {
    isAuthenticated: false,
    isAdmin: false,
    checkAuth: vi.fn(),
  },
}))

vi.mock('@/stores', () => ({
  useAppStore: () => appStore,
  useAuthStore: () => authStore,
}))

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      locale: { value: 'en' },
      t: (key: string) => key,
    }),
  }
})

const mountHome = (settings: Record<string, unknown> = {}) => {
  appStore.cachedPublicSettings = {
    site_name: 'Jiufeng Test',
    site_subtitle: 'Test subtitle',
    ...settings,
  }

  return mount(JFHomeView, {
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
        LocaleSwitcher: { template: '<div data-testid="locale-switcher" />' },
        Icon: { template: '<span data-testid="icon" />' },
        Transition: false,
      },
    },
  })
}

describe('Jiufeng compact home', () => {
  beforeEach(() => {
    authStore.isAuthenticated = false
    authStore.isAdmin = false
    authStore.checkAuth.mockClear()
    appStore.fetchPublicSettings.mockClear()
    localStorage.clear()
    sessionStorage.setItem('jiufeng_home_intro_seen', '1')
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: false } as MediaQueryList)
  })

  it('renders custom content before compact mode', () => {
    const wrapper = mountHome({
      compact_home_enabled: true,
      home_content: '<section id="custom-home">Custom home</section>',
    })

    expect(wrapper.get('#custom-home').text()).toBe('Custom home')
    expect(wrapper.find('[data-testid="compact-home"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('treats whitespace content as empty and renders compact mode', () => {
    const wrapper = mountHome({ compact_home_enabled: true, home_content: ' \n\t ' })

    expect(wrapper.get('[data-testid="compact-home"]').text()).toContain('Jiufeng Test')
    expect(wrapper.get('[data-testid="compact-home"]').text()).toContain('Test subtitle')
    wrapper.unmount()
  })

  it('keeps the Jiufeng brand home when compact mode is disabled', () => {
    const wrapper = mountHome({ compact_home_enabled: false })

    expect(wrapper.find('[data-testid="compact-home"]').exists()).toBe(false)
    expect(wrapper.find('.sx-home').exists()).toBe(true)
    wrapper.unmount()
  })

  it('routes authenticated administrators to the admin dashboard', () => {
    authStore.isAuthenticated = true
    authStore.isAdmin = true
    const wrapper = mountHome({ compact_home_enabled: true })
    const destinations = wrapper
      .get('[data-testid="compact-home"]')
      .findAllComponents(RouterLinkStub)
      .map((link) => link.props('to'))

    expect(destinations).toContain('/admin/dashboard')
    expect(authStore.checkAuth).toHaveBeenCalledOnce()
    wrapper.unmount()
  })
})
