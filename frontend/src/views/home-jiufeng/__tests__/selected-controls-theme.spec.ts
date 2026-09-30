import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

describe('Jiufeng selected control colors', () => {
  it('uses the same dark-gray tokens for navigation, tabs, settings, and pagination', () => {
    const styles = read('src/views/home-jiufeng/jf-studio.css')
    expect(styles).toContain('--jf-control-active: #343834;')
    expect(styles).toContain('--jf-control-active: #3f4540;')
    expect(styles).toMatch(/\.jf-studio \.tab-active\s*{[\s\S]*?background: var\(--jf-control-active\) !important;/)
    expect(styles).toMatch(/\.jf-studio \.settings-tab-active\s*{[\s\S]*?background: var\(--jf-control-active\) !important;/)
    expect(styles).toMatch(/button\[aria-current='page'\]\s*{[\s\S]*?background: var\(--jf-control-active\) !important;/)
  })

  it('uses matching dark-gray selected tabs inside teleported dialogs', () => {
    const styles = read('src/views/home-jiufeng/jiufeng-overlays.css')
    expect(styles).toContain('--jf-overlay-control-active: #343834;')
    expect(styles).toContain('--jf-overlay-control-active: #3f4540;')
    expect(styles).toContain('.channel-tab-active')
    expect(styles).toContain('background: var(--jf-overlay-control-active) !important;')
  })
})
