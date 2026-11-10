import { afterEach, describe, expect, it, vi } from 'vitest'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import AuditLogView from '../../admin/AuditLogView.vue'
import Select from '@/components/common/Select.vue'

const { list } = vi.hoisted(() => ({ list: vi.fn().mockResolvedValue({ items: [], total: 0 }) }))
vi.mock('@/api/admin', () => ({ adminAPI: { audit: { list } } }))
vi.mock('@/api', () => ({ totpAPI: { getStatus: vi.fn().mockResolvedValue({ enabled: false }) } }))
vi.mock('@/stores', () => ({ useAppStore: () => ({ showError: vi.fn() }) }))
vi.mock('vue-i18n', async (original) => ({
  ...await original<typeof import('vue-i18n')>(),
  useI18n: () => ({ t: (key: string) => key }),
}))
enableAutoUnmount(afterEach)

describe('MCP audit filter', () => {
  it('sends the MCP auth method and clears it when resetting filters', async () => {
    const wrapper = mount(AuditLogView, { global: { stubs: {
      AppLayout: { template: '<main><slot /></main>' },
      TablePageLayout: { template: '<div><slot name="actions" /><slot name="filters" /><slot /></div>' },
      Select: true, DataTable: true, Pagination: true, BaseDialog: true, ConfirmDialog: true, Icon: true,
    } } })
    await flushPromises()
    const filter = wrapper.findAllComponents(Select).find(select =>
      select.props('options').some((option: { value: string }) => option.value === 'mcp_oauth'),
    )!
    expect(filter.exists()).toBe(true)
    filter.vm.$emit('update:modelValue', 'mcp_oauth')
    filter.vm.$emit('change', 'mcp_oauth')
    await flushPromises()
    expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ auth_method: 'mcp_oauth', page: 1 }))
    await wrapper.findAll('button').find(button => button.text() === 'common.reset')!.trigger('click')
    await flushPromises()
    expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ auth_method: undefined, page: 1 }))
  })
})
