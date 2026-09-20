import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { watch } from 'vue'
import {
  isJiufengDark,
  syncJiufengTheme,
  toggleJiufengTheme,
} from '../theme'

describe('Jiufeng theme state', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.documentElement.classList.remove('dark', 'jf-theme-transitioning')
    localStorage.removeItem('theme')
    syncJiufengTheme()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it('updates the shared state, document class, and persisted preference together', () => {
    const observedStates: boolean[] = []
    const stop = watch(isJiufengDark, (value) => observedStates.push(value), { flush: 'sync' })

    expect(toggleJiufengTheme()).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('jf-theme-transitioning')).toBe(true)
    expect(localStorage.getItem('theme')).toBe('dark')

    expect(toggleJiufengTheme()).toBe(false)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('theme')).toBe('light')
    expect(observedStates).toEqual([true, false])

    stop()
  })

  it('can resynchronize consumers after the root class changes externally', () => {
    document.documentElement.classList.add('dark')

    expect(syncJiufengTheme()).toBe(true)
    expect(isJiufengDark.value).toBe(true)
  })
})
