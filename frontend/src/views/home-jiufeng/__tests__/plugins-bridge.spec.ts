import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PluginsView from '../admin/PluginsView.vue'

const mocks = vi.hoisted(() => ({
  list: vi.fn(),
  status: vi.fn(),
  test: vi.fn(),
  saveConfig: vi.fn(),
  createUISession: vi.fn(),
  stepUp: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showInfo: vi.fn(),
}))

vi.mock('@/api/admin', () => ({
  adminAPI: { plugins: mocks },
}))
vi.mock('@/stores', () => ({ useAppStore: () => mocks }))
vi.mock('@/composables/useStepUp', () => ({
  useStepUp: () => ({ run: mocks.stepUp }),
  isStepUpBlocked: () => false,
  isStepUpCancelled: () => false,
  stepUpBlockReason: () => '',
}))
vi.mock('../JFAppLayout.vue', () => ({ default: { template: '<div><slot /></div>' } }))
vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-i18n')>()),
  useI18n: () => ({ t: (key: string) => key }),
}))

const plugin = {
  id: 7,
  name: 'Status Plugin',
  plugin_key: 'local.status',
  version: '1.0.0',
  state: 'disabled',
  signature_status: 'trusted',
  bindings: [],
  compatibility: { compatible: true, tested: true, status: 'compatible' },
  runtime_healthy: true,
}
const statusResult = { healthy: true, message: 'ready', status_json: '{"active":3}' }

function mountView() {
  return mount(PluginsView, {
    attachTo: document.body,
    global: {
      stubs: {
        BaseDialog: { template: '<div><slot /></div>' },
        Icon: true,
        TotpStepUpDialog: true,
      },
    },
  })
}

async function openBridge() {
  const wrapper = mountView()
  await flushPromises()
  const configure = wrapper.findAll('button').find(button => button.text() === 'admin.plugins.configure')
  await configure!.trigger('click')
  await flushPromises()
  const frame = wrapper.get('iframe').element as HTMLIFrameElement
  const postMessage = vi.spyOn(frame.contentWindow!, 'postMessage')
  const send = (
    type: string,
    data: Record<string, unknown> = {},
    event: MessageEventInit = {},
  ) => window.dispatchEvent(new MessageEvent('message', {
    origin: 'null',
    source: frame.contentWindow,
    data: {
      source: 'sub2api-plugin-ui',
      bridge_token: 'bridge',
      request_id: 'request-1',
      type,
      ...data,
    },
    ...event,
  }))
  return { wrapper, postMessage, send }
}

enableAutoUnmount(afterEach)
afterEach(() => vi.restoreAllMocks())

beforeEach(() => {
  vi.resetAllMocks()
  mocks.list.mockResolvedValue([plugin])
  mocks.status.mockResolvedValue(statusResult)
  mocks.test.mockResolvedValue({ success: true, message: 'ok', latency_ms: 1 })
  mocks.saveConfig.mockResolvedValue({ enabled: true })
  mocks.stepUp.mockImplementation((action: () => Promise<unknown>) => action())
  mocks.createUISession.mockResolvedValue({
    url: '/api/v1/plugin-ui/token/index.html#bridge_token=bridge',
    bridge_token: 'bridge',
    ui_bridge_version: 1,
  })
})

describe('Jiufeng plugin status bridge', () => {
  it('returns runtime status without step-up verification or host notifications', async () => {
    const { send, postMessage } = await openBridge()
    send('plugin.status')
    await flushPromises()

    expect(mocks.status).toHaveBeenCalledWith(7)
    expect(postMessage).toHaveBeenCalledWith({
      source: 'sub2api-plugin-host',
      bridge_token: 'bridge',
      type: 'plugin.status.result',
      request_id: 'request-1',
      ok: true,
      result: statusResult,
    }, '*')
    expect(mocks.stepUp).not.toHaveBeenCalled()
    expect(mocks.showSuccess).not.toHaveBeenCalled()
    expect(mocks.showError).not.toHaveBeenCalled()
    expect(mocks.showInfo).not.toHaveBeenCalled()
  })

  it('deduplicates pending status requests and accepts later polls', async () => {
    let resolveStatus!: (result: typeof statusResult) => void
    mocks.status.mockReturnValueOnce(new Promise(resolve => { resolveStatus = resolve }))
    const { send, postMessage } = await openBridge()
    send('plugin.status')
    send('plugin.status')
    expect(mocks.status).toHaveBeenCalledTimes(1)
    expect(postMessage).not.toHaveBeenCalled()

    resolveStatus(statusResult)
    await flushPromises()
    send('plugin.status', { request_id: 'request-2' })
    await flushPromises()
    expect(mocks.status).toHaveBeenCalledTimes(2)
    expect(postMessage).toHaveBeenCalledTimes(2)
  })

  it.each([
    { name: 'wrong token', data: { bridge_token: 'wrong' }, event: {} },
    { name: 'wrong message source', data: { source: 'unknown' }, event: {} },
    { name: 'missing request ID', data: { request_id: ' ' }, event: {} },
    { name: 'wrong origin', data: {}, event: { origin: 'https://example.com' } },
    { name: 'wrong window', data: {}, event: { source: null } },
  ])('ignores status messages with $name', async ({ data, event }) => {
    const { send, postMessage } = await openBridge()
    send('plugin.status', data, event)
    await flushPromises()
    expect(mocks.status).not.toHaveBeenCalled()
    expect(postMessage).not.toHaveBeenCalled()
  })

  it('returns status errors to the plugin without a host notification', async () => {
    mocks.status.mockRejectedValueOnce(new Error('Plugin unavailable'))
    const { send, postMessage } = await openBridge()
    send('plugin.status')
    await flushPromises()
    expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: 'plugin.status.result', ok: false, error: 'Plugin unavailable',
    }), '*')
    expect(mocks.showError).not.toHaveBeenCalled()
  })

  it('keeps bridge tests step-up protected and leaves successful feedback to the plugin', async () => {
    const { send, postMessage } = await openBridge()
    send('config.test')
    await flushPromises()
    expect(mocks.stepUp).toHaveBeenCalledOnce()
    expect(mocks.test).toHaveBeenCalledWith(7)
    expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: 'config.test.result', ok: true,
    }), '*')
    expect(mocks.showSuccess).not.toHaveBeenCalled()
  })

  it('still reports bridge test failures', async () => {
    mocks.test.mockResolvedValueOnce({ success: false, message: 'Test failed', latency_ms: 1 })
    const { send, postMessage } = await openBridge()
    send('config.test')
    await flushPromises()
    expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({
      type: 'config.test.result', ok: false,
    }), '*')
    expect(mocks.showError).toHaveBeenCalledWith('Test failed')
  })

  it('still requires step-up verification when saving plugin configuration', async () => {
    const { send } = await openBridge()
    send('config.save', { config: { enabled: true } })
    await flushPromises()
    expect(mocks.stepUp).toHaveBeenCalledOnce()
    expect(mocks.saveConfig).toHaveBeenCalledWith(7, { enabled: true })
  })

  it('retains success feedback for the explicit test button', async () => {
    const wrapper = mountView()
    await flushPromises()
    const testButton = wrapper.findAll('button').find(button => button.text() === 'admin.plugins.test')
    await testButton!.trigger('click')
    await flushPromises()
    expect(mocks.stepUp).toHaveBeenCalledOnce()
    expect(mocks.showSuccess).toHaveBeenCalledWith('ok')
  })
})
