let fallbackTransitionTimer: number | undefined

export function toggleJiufengTheme(): boolean {
  const root = document.documentElement
  const nextIsDark = !root.classList.contains('dark')

  const applyTheme = () => {
    root.classList.toggle('dark', nextIsDark)
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light')
  }

  root.classList.add('jf-theme-transitioning')
  applyTheme()
  window.clearTimeout(fallbackTransitionTimer)
  fallbackTransitionTimer = window.setTimeout(() => {
    root.classList.remove('jf-theme-transitioning')
  }, 220)

  return nextIsDark
}
