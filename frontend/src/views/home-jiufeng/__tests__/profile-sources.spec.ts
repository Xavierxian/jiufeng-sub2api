import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import ProfileSources from '../components/JFProfileSources.vue'
import en from '@/i18n/locales/en'
import zh from '@/i18n/locales/zh'
import type { User } from '@/types'

const locale = ref<'en' | 'zh'>('en')
vi.mock('vue-i18n', async (importOriginal) => ({
  ...await importOriginal<typeof import('vue-i18n')>(),
  // Match the existing view tests: the Vitest config uses i18n's runtime-only
  // bundle without the production JIT flag. Use real messages for these labels.
  useI18n: () => ({
    t: (key: string, params: Record<string, string> = {}) => {
      const message = key.split('.').reduce<unknown>((value, part) =>
        (value as Record<string, unknown>)?.[part], locale.value === 'zh' ? zh : en)
      if (typeof message !== 'string') throw new Error(`Missing translation: ${key}`)
      return message.replace(/\{(\w+)\}/g, (_, name: string) => params[name] ?? '')
    },
  }),
}))

function mountSources(sources: Partial<User>) {
  const wrapper = mount(ProfileSources, {
    props: { user: sources as User, oidcProviderName: 'Company SSO' },
    global: { stubs: { Icon: true } },
  })
  return { wrapper }
}

describe('Jiufeng profile sources', () => {
  beforeEach(() => { locale.value = 'en' })
  it.each([
    { avatar_source: 'dingtalk', username_source: 'github' },
    { profile_sources: { avatar: { provider: 'dingtalk' }, nickname: { source: 'github' } } },
  ])('displays legacy and structured profile sources', (sources) => {
    const { wrapper } = mountSources(sources)
    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(wrapper.text()).toContain('DingTalk')
    expect(wrapper.text()).toContain('GitHub')
    wrapper.unmount()
  })

  it('uses the configured OIDC name and reacts to language changes', async () => {
    const { wrapper } = mountSources({ avatar_source: 'oidc:company' })
    expect(wrapper.text()).toContain('Company SSO')
    const english = wrapper.text()
    locale.value = 'zh'
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Company SSO')
    expect(wrapper.text()).not.toBe(english)
    wrapper.unmount()
  })

  it('prefers structured sources, renders explicit labels as text, and reacts to user changes', async () => {
    const { wrapper } = mountSources({
      avatar_source: 'github',
      profile_sources: { avatar: { provider: 'oidc', provider_label: '<img src=x>' } },
    })
    expect(wrapper.text()).toContain('<img src=x>')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('GitHub')
    await wrapper.setProps({ user: { avatar_source: 'google' } as User })
    expect(wrapper.text()).toContain('Google')
    expect(wrapper.text()).not.toContain('<img src=x>')
    wrapper.unmount()
  })

  it.each([{}, { avatar_source: 'email', username_source: 'local' }])('hides the card without recognized third-party sources', (sources) => {
    const { wrapper } = mountSources(sources)
    expect(wrapper.find('[data-testid="profile-sources"]').exists()).toBe(false)
    wrapper.unmount()
  })
})
