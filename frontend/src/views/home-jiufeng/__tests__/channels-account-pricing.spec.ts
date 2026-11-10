import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount } from '@vue/test-utils'
import ChannelsView from '../admin/ChannelsView.vue'
import type { Channel } from '@/api/admin/channels'
import type { PricingFormEntry } from '@/components/admin/channel/types'

const { update, showError } = vi.hoisted(() => ({ update: vi.fn(), showError: vi.fn() }))
vi.mock('@/api/admin', () => ({
  adminAPI: {
    channels: { list: vi.fn().mockResolvedValue({ items: [], total: 0 }), update },
    groups: { getAll: vi.fn().mockResolvedValue([{ id: 1, name: 'OpenAI', platform: 'openai' }]) },
    settings: { getWebSearchEmulationConfig: vi.fn().mockResolvedValue({ enabled: false }) },
  },
}))
vi.mock('@/stores/app', () => ({ useAppStore: () => ({ showError, showSuccess: vi.fn() }) }))
vi.mock('vue-i18n', async (importOriginal) => ({
  ...await importOriginal<typeof import('vue-i18n')>(),
  useI18n: () => ({ t: (key: string) => key }),
}))

type View = {
  openEditDialog: (channel: Channel) => Promise<void>
  handleSubmit: () => Promise<void>
  form: { platforms: Array<{ account_stats_pricing_rules: Array<{ pricing: PricingFormEntry[] }> }> }
}

const channel = (multipliers: Record<string, number> | null) => ({
  id: 42,
  name: 'Account statistics pricing',
  status: 'active',
  group_ids: [1],
  model_pricing: [],
  model_mapping: {},
  features_config: {},
  account_stats_pricing_rules: [{
    name: 'Rule', group_ids: [1], account_ids: [],
    pricing: [{ platform: 'openai', models: ['gpt-5.5'], billing_mode: 'token', reasoning_effort_multipliers: multipliers }],
  }],
}) as Channel

describe('Jiufeng account statistics pricing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    update.mockResolvedValue({})
  })

  it.each([{ high: 2, xhigh: 3 }, null])('preserves existing reasoning multipliers through editing: %j', async (multipliers) => {
    const wrapper = shallowMount(ChannelsView)
    try {
      await flushPromises()
      const view = wrapper.vm as unknown as View
      await view.openEditDialog(channel(multipliers))
      expect(view.form.platforms[0].account_stats_pricing_rules[0].pricing[0].reasoning_effort_multipliers).toEqual(multipliers)
      await view.handleSubmit()
      expect(showError).not.toHaveBeenCalled()
      expect(update).toHaveBeenCalledWith(42, expect.objectContaining({
        account_stats_pricing_rules: [expect.objectContaining({
          pricing: [expect.objectContaining({ reasoning_effort_multipliers: multipliers })],
        })],
      }))
    } finally {
      wrapper.unmount()
    }
  })

  it('submits edited multipliers without mutating the loaded channel', async () => {
    const original = channel({ high: 2 })
    const wrapper = shallowMount(ChannelsView)
    try {
      await flushPromises()
      const view = wrapper.vm as unknown as View
      await view.openEditDialog(original)
      const pricing = view.form.platforms[0].account_stats_pricing_rules[0].pricing[0]
      pricing.reasoning_effort_multipliers!.high = 4
      expect(original.account_stats_pricing_rules![0].pricing[0].reasoning_effort_multipliers).toEqual({ high: 2 })
      await view.handleSubmit()
      expect(showError).not.toHaveBeenCalled()
      expect(update.mock.calls[0][1].account_stats_pricing_rules[0].pricing[0].reasoning_effort_multipliers).toEqual({ high: 4 })
    } finally {
      wrapper.unmount()
    }
  })
})
