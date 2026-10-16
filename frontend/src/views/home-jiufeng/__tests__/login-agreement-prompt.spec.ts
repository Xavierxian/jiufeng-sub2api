import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import JFLoginAgreementPrompt from '../JFLoginAgreementPrompt.vue'

vi.mock('vue-i18n', async () => {
  const actual = await vi.importActual<typeof import('vue-i18n')>('vue-i18n')
  return {
    ...actual,
    useI18n: () => ({
      t: (key: string, values?: { date?: string }) => values?.date ? `${key}:${values.date}` : key,
    }),
  }
})

const documents = [
  { id: 'terms', title: 'Terms', content_md: '# Terms\n\nRead **carefully**.\n\n<script>alert("xss")</script>' },
  { id: 'usage-policy', title: 'Usage Policy', content_md: '# Policy' },
]

const mountPrompt = (props: Partial<InstanceType<typeof JFLoginAgreementPrompt>['$props']> = {}) =>
  mount(JFLoginAgreementPrompt, {
    attachTo: document.body,
    props: {
      accepted: false,
      documents,
      mode: 'modal',
      updatedAt: '2026-03-31',
      visible: true,
      ...props,
    },
    global: {
      stubs: {
        Icon: { template: '<span data-testid="icon" />' },
        Transition: true,
      },
    },
  })

describe('Jiufeng login agreement prompt', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('renders a sanitized document modal instead of opening a legal route', async () => {
    const wrapper = mountPrompt()
    await nextTick()

    expect(document.body.querySelector('.jf-agreement-dialog')).not.toBeNull()
    expect(document.body.querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true')
    expect(document.body.style.overflow).toBe('hidden')

    const firstDocumentButton = document.body.querySelector<HTMLButtonElement>('.jf-agreement-document')
    firstDocumentButton?.click()
    await nextTick()

    expect(document.body.querySelector('.jf-agreement-document-dialog')).not.toBeNull()
    expect(document.body.querySelector('#jf-agreement-document-title')?.textContent).toBe('Terms')
    expect(document.body.querySelector('.jf-agreement-markdown')?.textContent).toContain('Read carefully.')
    expect(document.body.querySelector('.jf-agreement-markdown script')).toBeNull()
    expect(document.body.querySelector('a[href^="/legal/"]')).toBeNull()

    document.body.querySelector<HTMLButtonElement>('.jf-agreement-document-dialog__close')?.click()
    await nextTick()
    await nextTick()
    expect(document.body.querySelector('.jf-agreement-document-dialog')).toBeNull()
    expect(document.body.querySelector('.jf-agreement-dialog')).not.toBeNull()

    await wrapper.setProps({ visible: false })
    await nextTick()
    expect(document.body.style.overflow).toBe('')
    wrapper.unmount()
  })

  it('emits accept and rejects with Escape', async () => {
    const wrapper = mountPrompt()
    await nextTick()

    const acceptButton = document.body.querySelector<HTMLButtonElement>('.jf-agreement-button--primary')
    acceptButton?.click()
    expect(wrapper.emitted('accept')).toHaveLength(1)

    document.body.querySelector('.jf-agreement-overlay')?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await nextTick()
    expect(wrapper.emitted('reject')).toHaveLength(1)
    wrapper.unmount()
  })

  it('keeps checkbox mode compatible with the login page gate', async () => {
    const wrapper = mountPrompt({ mode: 'checkbox', visible: false })
    const checkbox = wrapper.get('input[type="checkbox"]')

    await checkbox.setValue(true)
    expect(wrapper.emitted('accept')).toHaveLength(1)

    await checkbox.setValue(false)
    expect(wrapper.emitted('reject')).toHaveLength(1)

    document.body.querySelector<HTMLButtonElement>('.jf-agreement-checkbox__document')?.click()
    await nextTick()
    expect(document.body.querySelector('#jf-agreement-document-title')?.textContent).toBe('Terms')
    wrapper.unmount()
  })

  it('exposes document preview for the Jiufeng registration agreement row', async () => {
    const wrapper = mountPrompt({ visible: false, showInlineControl: false })

    await wrapper.vm.openDocument(documents[1])
    await nextTick()
    expect(document.body.querySelector('#jf-agreement-document-title')?.textContent).toBe('Usage Policy')
    expect(document.body.style.overflow).toBe('hidden')
    wrapper.unmount()
  })
})
