import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import JFDataTable from '../JFDataTable.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}))

const stubMatchMedia = (matches: boolean) => {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation(() => ({
    matches,
    media: '(min-width: 768px)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })))
}

const mountTable = (selectedKeys: number[] = [99]) => mount(JFDataTable, {
  props: {
    columns: [{ key: 'name', label: 'Name' }],
    data: [
      { id: 1, name: 'first' },
      { id: 2, name: 'second' },
    ],
    rowKey: 'id',
    selectable: true,
    selectedKeys,
  },
})

describe('Jiufeng data table selection', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
    stubMatchMedia(true)
  })

  it('preserves keys from other pages when selecting and clearing visible rows', async () => {
    const wrapper = mountTable()

    await wrapper.get('[data-test="select-all"]').setValue(true)
    expect(wrapper.emitted('update:selectedKeys')?.at(-1)?.[0]).toEqual([99, 1, 2])
    expect(wrapper.emitted('selectionChange')?.at(-1)?.[0]).toEqual([99, 1, 2])

    await wrapper.setProps({ selectedKeys: [99, 1, 2] })
    await wrapper.findAll('[data-test="select-row"]')[0].setValue(false)
    expect(wrapper.emitted('update:selectedKeys')?.at(-1)?.[0]).toEqual([99, 2])

    await wrapper.setProps({ selectedKeys: [99, 1, 2] })
    await wrapper.get('[data-test="select-all"]').setValue(false)
    expect(wrapper.emitted('update:selectedKeys')?.at(-1)?.[0]).toEqual([99])
    wrapper.unmount()
  })

  it('supports current-page selection on the mobile card layout', async () => {
    stubMatchMedia(false)
    const wrapper = mountTable()

    await wrapper.get('[data-test="select-all-mobile"]').setValue(true)
    expect(wrapper.emitted('update:selectedKeys')?.at(-1)?.[0]).toEqual([99, 1, 2])
    expect(wrapper.findAll('[data-test="select-row"]')).toHaveLength(2)
    wrapper.unmount()
  })
})
