import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import EmailTemplateEditor from '../admin/settings/EmailTemplateEditor.vue'

const { getEmailTemplates, getEmailTemplate, previewEmailTemplate } = vi.hoisted(() => ({
  getEmailTemplates: vi.fn(),
  getEmailTemplate: vi.fn(),
  previewEmailTemplate: vi.fn(),
}))

vi.mock('@/api', () => ({
  adminAPI: {
    settings: {
      getEmailTemplates,
      getEmailTemplate,
      previewEmailTemplate,
      updateEmailTemplate: vi.fn(),
      restoreOfficialEmailTemplate: vi.fn(),
    },
  },
}))

vi.mock('@/stores', () => ({
  useAppStore: () => ({ showError: vi.fn(), showSuccess: vi.fn() }),
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

describe('Jiufeng email template report placeholders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getEmailTemplates.mockResolvedValue({
      events: [{ value: 'ops.scheduled_report', label: 'Scheduled report', category: 'ops' }],
      locales: ['en'],
      placeholders: [],
    })
    getEmailTemplate.mockResolvedValue({
      subject: 'Report',
      html: '<p>Report</p>',
      placeholders: [],
    })
    previewEmailTemplate.mockResolvedValue({ subject: 'Report', html: '<p>Report</p>' })
  })

  it('uses all v0.1.170 report variables when the server list is empty', async () => {
    const wrapper = mount(EmailTemplateEditor)
    await flushPromises()
    const text = wrapper.text()

    for (const placeholder of [
      '{{report_summary_display}}',
      '{{report_total_requests}}',
      '{{report_upstream_error_count_excl_429_529}}',
      '{{report_latency_p99}}',
      '{{report_ttft_p99}}',
      '{{report_qps_avg}}',
      '{{report_tps_avg}}',
    ]) {
      expect(text).toContain(placeholder)
    }
    wrapper.unmount()
  })
})
