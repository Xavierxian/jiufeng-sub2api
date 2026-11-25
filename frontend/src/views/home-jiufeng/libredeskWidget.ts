type LibredeskSettings = {
  baseURL: string
  inboxID: string
}

type LibredeskWindow = Window & {
  LibredeskSettings?: LibredeskSettings
  libredeskSettings?: LibredeskSettings
}

const defaultLibredeskBaseUrl = 'https://chat.jfengcn.com'
const libredeskBaseUrl = (
  (import.meta.env.VITE_LIBREDESK_BASE_URL as string | undefined)?.trim() || defaultLibredeskBaseUrl
).replace(/\/+$/, '')
const libredeskInboxId =
  (import.meta.env.VITE_LIBREDESK_INBOX_ID as string | undefined)
  || '8298da73-78fa-4ace-a72d-7da644fadd23'
const libredeskScriptSelector = 'script[data-jiufeng-libredesk]'

export function loadLibredeskWidget() {
  if (!libredeskBaseUrl || !libredeskInboxId) return

  const settings: LibredeskSettings = {
    baseURL: libredeskBaseUrl,
    inboxID: libredeskInboxId,
  }
  const libredeskWindow = window as LibredeskWindow
  // Support both the current API name and the lowercase name used by older installs.
  libredeskWindow.LibredeskSettings = settings
  libredeskWindow.libredeskSettings = settings

  if (document.querySelector(libredeskScriptSelector)) return

  const script = document.createElement('script')
  script.async = true
  script.src = `${libredeskBaseUrl}/widget.js`
  script.dataset.jiufengLibredesk = 'true'
  document.body.appendChild(script)
}
