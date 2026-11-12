import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount, type VueWrapper } from '@vue/test-utils'
import GroupsView from '../admin/GroupsView.vue'

const { listGroups, createGroup, updateGroup, showError } = vi.hoisted(() => ({
  listGroups: vi.fn(), createGroup: vi.fn(), updateGroup: vi.fn(), showError: vi.fn(),
}))

vi.mock('@/api/admin', () => ({
  adminAPI: {
    groups: {
      list: listGroups, create: createGroup, update: updateGroup,
      getModelAllowlistCandidates: vi.fn(async () => []),
      getUsageSummary: vi.fn(async () => []),
      getCapacitySummary: vi.fn(async () => []),
      getLiveCapability: vi.fn(async () => ({ supported: false })),
    },
    accounts: { list: vi.fn(async () => ({ items: [] })) },
  },
}))
vi.mock('@/stores/app', () => ({ useAppStore: () => ({ showSuccess: vi.fn(), showError }) }))
vi.mock('@/stores/auth', () => ({ useAuthStore: () => ({ isSimpleMode: false }) }))
vi.mock('@/stores/onboarding', () => ({
  useOnboardingStore: () => ({ isCurrentStep: () => false, nextStep: vi.fn() }),
}))
vi.mock('vue-i18n', async () => ({
  ...await vi.importActual<typeof import('vue-i18n')>('vue-i18n'),
  useI18n: () => ({ t: (key: string) => key }),
}))

let wrapper: VueWrapper
const mountView = () => shallowMount(GroupsView, {
  global: {
    stubs: {
      AppLayout: { template: '<main><slot /></main>' },
      TablePageLayout: { template: '<div><slot name="filters" /><slot name="table" /></div>' },
      BaseDialog: { props: ['show'], template: '<div v-if="show"><slot /><slot name="footer" /></div>' },
      DataTable: {
        props: ['data'],
        template: '<div><slot v-for="row in data" name="cell-actions" :row="row" /></div>',
      },
      Select: {
        props: ['modelValue', 'options'],
        emits: ['update:modelValue', 'change'],
        template: `<select :value="modelValue" @change="$emit('update:modelValue', $event.target.value); $emit('change')">
          <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
        </select>`,
      },
      GroupI18nField: {
        props: ['modelValue'], emits: ['update:modelValue'],
        template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
      },
      ReasoningEffortPolicyFields: {
        template: '<div />',
        methods: { validate: () => true, resetValidation: () => {} },
      },
    },
  },
})

const imageCheckbox = (form = '#create-group-form') => wrapper.get(form).findAll('label')
  .find(label => label.text() === 'admin.groups.imagePricing.allowImageGeneration')!
  .get('input[type="checkbox"]')

async function openCreate(platform: string) {
  wrapper = mountView()
  await flushPromises()
  await wrapper.findAll('button').find(button => button.text() === 'admin.groups.createGroup')!.trigger('click')
  await wrapper.get('[data-tour="group-form-name"]').setValue('Image group')
  await wrapper.get('[data-tour="group-form-platform"]').setValue(platform)
  await flushPromises()
}

describe('Jiufeng group image generation defaults', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    listGroups.mockResolvedValue({ items: [], total: 0, pages: 0 })
    createGroup.mockResolvedValue({ id: 1 })
    updateGroup.mockResolvedValue({ id: 42 })
  })
  afterEach(() => wrapper?.unmount())

  it.each(['gemini', 'antigravity', 'grok'])('enables and submits the default for a new %s group', async (platform) => {
    await openCreate(platform)
    expect((imageCheckbox().element as HTMLInputElement).checked).toBe(true)
    await wrapper.get('#create-group-form').trigger('submit')
    await flushPromises()
    expect(showError).not.toHaveBeenCalled()
    expect(createGroup).toHaveBeenCalledWith(expect.objectContaining({ platform, allow_image_generation: true }))
  })

  it('resets the default and dependent batch setting when switching platforms', async () => {
    await openCreate('gemini')
    const batchCheckbox = wrapper.get('#create-group-form').findAll('label')
      .find(label => label.text() === 'admin.groups.imagePricing.allowBatchImageGeneration')!
      .get('input[type="checkbox"]')
    await batchCheckbox.setValue(true)
    for (const platform of ['openai', 'composite']) {
      await wrapper.get('[data-tour="group-form-platform"]').setValue(platform)
      expect((imageCheckbox().element as HTMLInputElement).checked).toBe(false)
    }
    await wrapper.get('#create-group-form').trigger('submit')
    await flushPromises()
    expect(createGroup).toHaveBeenCalledWith(expect.objectContaining({
      platform: 'composite', allow_image_generation: false, allow_batch_image_generation: false,
    }))
  })

  it('preserves a manually disabled image setting when submitting a new group', async () => {
    await openCreate('gemini')
    await imageCheckbox().setValue(false)
    await wrapper.get('[data-tour="group-form-name"]').setValue('Text only')
    await wrapper.get('#create-group-form').trigger('submit')
    await flushPromises()
    expect(createGroup).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Text only', platform: 'gemini', allow_image_generation: false,
    }))
  })

  it.each([false, true])('preserves an existing Gemini group image setting: %s', async (enabled) => {
    listGroups.mockResolvedValue({
      items: [{ id: 42, name: 'Existing', platform: 'gemini', status: 'active', rate_multiplier: 1,
        allow_image_generation: enabled, subscription_type: 'standard' }],
      total: 1, pages: 1,
    })
    wrapper = mountView()
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text() === 'common.edit')!.trigger('click')
    await flushPromises()
    expect((imageCheckbox('#edit-group-form').element as HTMLInputElement).checked).toBe(enabled)
    await wrapper.get('#edit-group-form').trigger('submit')
    await flushPromises()
    expect(showError).not.toHaveBeenCalled()
    expect(updateGroup).toHaveBeenCalledWith(42, expect.objectContaining({ allow_image_generation: enabled }))
  })
  it.each([0.000025, 0, null])('preserves and updates a group 12h price: %s', async (price) => {
    listGroups.mockResolvedValue({
      items: [{ id: 42, name: 'Cache pricing', platform: 'openai', status: 'active', rate_multiplier: 1,
        subscription_type: 'standard', model_pricing: [{ models: ['gpt-6'], billing_mode: 'token', cache_write_12h_price: price }] }],
      total: 1, pages: 1,
    })
    wrapper = mountView()
    await flushPromises()
    await wrapper.findAll('button').find(button => button.text() === 'common.edit')!.trigger('click')
    await flushPromises()
    const view = wrapper.vm as unknown as { editForm: { model_pricing: Array<{ cache_write_12h_price: number | null }> } }
    expect(view.editForm.model_pricing[0].cache_write_12h_price).toBe(price == null ? null : price * 1e6)
    await wrapper.get('#edit-group-form').trigger('submit')
    await flushPromises()
    expect(showError).not.toHaveBeenCalled()
    expect(updateGroup.mock.calls.at(-1)![1].model_pricing[0].cache_write_12h_price).toBe(price)
  })

  it('submits a newly entered 12h group price in per-token units', async () => {
    await openCreate('openai')
    const view = wrapper.vm as unknown as {
      createForm: { model_pricing: Array<Record<string, unknown>> }
      emptyGroupPricing: () => Record<string, unknown>
    }
    view.createForm.model_pricing.push({ ...view.emptyGroupPricing(), models: ['gpt-6'], cache_write_12h_price: 25 })
    await wrapper.get('#create-group-form').trigger('submit')
    await flushPromises()
    expect(showError).not.toHaveBeenCalled()
    expect(createGroup.mock.calls.at(-1)![0].model_pricing[0].cache_write_12h_price).toBe(0.000025)
  })

})
