import { readonly, ref } from 'vue'

let fallbackTransitionTimer: number | undefined

const jiufengDark = ref(
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
)
export const isJiufengDark = readonly(jiufengDark)

export function syncJiufengTheme(): boolean {
  if (typeof document === 'undefined') return jiufengDark.value

  jiufengDark.value = document.documentElement.classList.contains('dark')
  return jiufengDark.value
}

export function toggleJiufengTheme(): boolean {
  const root = document.documentElement
  const nextIsDark = !root.classList.contains('dark')

  const applyTheme = () => {
    root.classList.toggle('dark', nextIsDark)
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light')
    jiufengDark.value = nextIsDark
  }

  root.classList.add('jf-theme-transitioning')
  applyTheme()
  window.clearTimeout(fallbackTransitionTimer)
  fallbackTransitionTimer = window.setTimeout(() => {
    root.classList.remove('jf-theme-transitioning')
  }, 220)

  return nextIsDark
}
