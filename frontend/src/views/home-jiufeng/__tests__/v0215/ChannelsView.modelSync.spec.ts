vi.mock('@/views/home-jiufeng/JFAppLayout.vue', () => ({ default: { template: '<div><slot /></div>' } }))

import { defineComponent } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  BUILTIN_PLATFORM_CATALOG,
  resetPlatformCatalog,
  setPlatformCatalog
} from '@/constants/platformCatalog'
import ChannelsView from '@/views/home-jiufeng/admin/ChannelsView.vue'

const { listChannels, getGroups, syncPricingModels, showSuccess, showError } = vi.hoisted(() => ({
  listChannels: vi.fn(),
  getGroups: vi.fn(),
  syncPricingModels: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn()
}))

vi.mock('@/api/admin', () => ({
  adminAPI: {
    channels: { list: listChannels, syncPricingModels },
    groups: { getAll: getGroups },
    settings: { getWebSearchEmulationConfig: vi.fn().mockResolvedValue({ enabled: false }) }
  }
}))

vi.mock('@/stores/app', () => ({ useAppStore: () => ({ showSuccess, showError }) }))

vi.mock('vue-i18n', async () => ({
  ...await vi.importActual<typeof import('vue-i18n')>('vue-i18n'),
  useI18n: () => ({ t: (key: string) => key })
}))

function mountView() {
  return mount(ChannelsView, {
    global: {
      stubs: {
        AppLayout: defineComponent({ template: '<main><slot /></main>' }),
        TablePageLayout: defineComponent({
          template: '<section><slot name="filters" /><slot name="table" /><slot name="pagination" /></section>'
        }),
        BaseDialog: defineComponent({
          props: ['show'],
          template: '<section v-if="show"><slot /><slot name="footer" /></section>'
        }),
        PricingEntryCard: defineComponent({
          props: ['entry'],
          template: '<div class="pricing-entry">{{ entry.models.join(", ") }}</div>'
        }),
        DataTable: true,
        Pagination: true,
        ConfirmDialog: true,
        EmptyState: true,
        Select: true,
        Icon: true,
        PlatformIcon: true,
        Toggle: true
      }
    }
  })
}

async function openDialog(wrapper: ReturnType<typeof mountView>) {
  await flushPromises()
  await wrapper.findAll('button').find(button => button.text() === 'admin.channels.createChannel')!.trigger('click')
  await flushPromises()
}

async function enablePlatform(wrapper: ReturnType<typeof mountView>, platform: string) {
  const label = wrapper.findAll('label').find(label => label.text() === `admin.groups.platforms.${platform}`)
  expect(label).toBeDefined()
  await label!.get('input[type="checkbox"]').setValue(true)
  await wrapper.findAll('button.channel-tab').find(button => button.text() === `admin.groups.platforms.${platform}`)!.trigger('click')
}

function visibleSyncButtons(wrapper: ReturnType<typeof mountView>) {
  return wrapper.findAll('button').filter(button => button.isVisible() && [
    'admin.channels.form.syncLatestModels',
    'admin.channels.form.syncingModels'
  ].includes(button.text()))
}

describe('ChannelsView pricing model sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    listChannels.mockResolvedValue({ items: [], total: 0 })
    getGroups.mockResolvedValue([])
    syncPricingModels.mockReset()
  })

  afterEach(() => {
    resetPlatformCatalog()
  })

  it.each([
    ['openai', true],
    ['opencode_go', true],
    ['typesafe', true],
    ['command_code', false],
    ['cline', false]
  ] as const)('offers pricing model sync for %s only when its pricing catalog exists', async (platform, expected) => {
    const wrapper = mountView()
    await openDialog(wrapper)
    await enablePlatform(wrapper, platform)

    expect(visibleSyncButtons(wrapper)).toHaveLength(expected ? 1 : 0)
    expect(syncPricingModels).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('reacts to a new platform gaining a pricing catalog', async () => {
    const platform = { id: 'acme_router', display_name: 'Acme Router', gateway: 'openai' as const, cn_provider: false }
    setPlatformCatalog({
      ...BUILTIN_PLATFORM_CATALOG,
      platforms: [...BUILTIN_PLATFORM_CATALOG.platforms, platform]
    })
    const wrapper = mountView()
    await openDialog(wrapper)
    await enablePlatform(wrapper, platform.id)
    expect(visibleSyncButtons(wrapper)).toHaveLength(0)

    setPlatformCatalog({
      ...BUILTIN_PLATFORM_CATALOG,
      platforms: [...BUILTIN_PLATFORM_CATALOG.platforms, { ...platform, litellm_provider: 'acme' }]
    })
    await flushPromises()
    expect(visibleSyncButtons(wrapper)).toHaveLength(1)
    wrapper.unmount()
  })

  it('blocks additional syncs while one request is in flight and adds its models once', async () => {
    let resolveSync!: (value: { models: string[] }) => void
    syncPricingModels.mockReturnValue(new Promise(resolve => { resolveSync = resolve }))
    const wrapper = mountView()
    await openDialog(wrapper)
    await enablePlatform(wrapper, 'openai')
    await visibleSyncButtons(wrapper)[0].trigger('click')
    await visibleSyncButtons(wrapper)[0].trigger('click')
    await enablePlatform(wrapper, 'opencode_go')

    expect(visibleSyncButtons(wrapper)[0].attributes('disabled')).toBeDefined()
    await visibleSyncButtons(wrapper)[0].trigger('click')
    expect(syncPricingModels).toHaveBeenCalledOnce()
    expect(syncPricingModels).toHaveBeenCalledWith('openai')

    resolveSync({ models: ['gpt-latest'] })
    await flushPromises()
    expect(wrapper.findAll('.pricing-entry')).toHaveLength(1)
    expect(wrapper.get('.pricing-entry').text()).toBe('gpt-latest')
    expect(visibleSyncButtons(wrapper)[0].attributes('disabled')).toBeUndefined()
    expect(showError).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('keeps new platform pricing and mappings when editing and serializing a channel', async () => {
    getGroups.mockResolvedValue([
      { id: 1, name: 'Cline', platform: 'cline' },
      { id: 2, name: 'Command Code', platform: 'command_code' },
    ])
    const wrapper = mountView()
    await flushPromises()
    const vm = wrapper.vm as unknown as {
      openEditDialog: (channel: Record<string, unknown>) => Promise<void>
      formToAPI: () => Record<string, unknown>
    }
    await vm.openEditDialog({
      id: 1, name: 'New providers', status: 'active', group_ids: [1, 2],
      model_mapping: { cline: { alias: 'claude-model' }, command_code: { alias: 'gpt-model' } },
      model_pricing: [
        { platform: 'cline', models: ['claude-model'], billing_mode: 'token', input_price: 0.000002, output_price: 0.00001 },
        { platform: 'command_code', models: ['gpt-model'], billing_mode: 'token', input_price: 0.000003, output_price: 0.00002 },
      ],
    })
    expect(vm.formToAPI()).toMatchObject({
      group_ids: [2, 1],
      model_mapping: { cline: { alias: 'claude-model' }, command_code: { alias: 'gpt-model' } },
      model_pricing: expect.arrayContaining([
        expect.objectContaining({ platform: 'cline', models: ['claude-model'], input_price: 0.000002 }),
        expect.objectContaining({ platform: 'command_code', models: ['gpt-model'], input_price: 0.000003 }),
      ]),
    })
    wrapper.unmount()
  })

  it('includes all providers when editing a composite-group channel', async () => {
    getGroups.mockResolvedValue([{ id: 9, name: 'All providers', platform: 'composite' }])
    const wrapper = mountView()
    await flushPromises()
    const vm = wrapper.vm as unknown as {
      openEditDialog: (channel: Record<string, unknown>) => Promise<void>
      form: { platforms: Array<{ platform: string; group_ids: number[] }> }
    }
    await vm.openEditDialog({ id: 1, name: 'Composite', status: 'active', group_ids: [9] })
    expect(vm.form.platforms.map(section => section.platform)).toEqual(BUILTIN_PLATFORM_CATALOG.platforms.map(platform => platform.id))
    expect(vm.form.platforms.every(section => section.group_ids.includes(9))).toBe(true)
    wrapper.unmount()
  })

  it('does not add a late sync result to a replacement channel form', async () => {
    let finish!: (result: { models: string[] }) => void
    syncPricingModels.mockReturnValueOnce(new Promise(resolve => { finish = resolve }))
    const wrapper = mountView()
    await openDialog(wrapper)
    await enablePlatform(wrapper, 'openai')
    const vm = wrapper.vm as unknown as {
      syncLatestModels: (index: number) => Promise<void>
      openCreateDialog: () => Promise<void>
      togglePlatform: (platform: string) => void
      form: { platforms: Array<{ platform: string; model_pricing: unknown[] }> }
    }
    const pending = vm.syncLatestModels(0)
    await vm.openCreateDialog()
    vm.togglePlatform('anthropic')
    finish({ models: ['obsolete-model'] })
    await pending
    expect(vm.form.platforms[0].platform).toBe('anthropic')
    expect(vm.form.platforms[0].model_pricing).toHaveLength(0)
    wrapper.unmount()
  })
})
