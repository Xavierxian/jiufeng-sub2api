import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(process.cwd(), 'src/views/home-jiufeng/admin/SettingsView.vue'),
  'utf8',
)

describe('Jiufeng settings mobile tabs', () => {
  it('shows every settings category in a complete horizontally scrollable row', () => {
    const expectedTabs = [
      'general',
      'agreement',
      'features',
      'security',
      'users',
      'gateway',
      'payment',
      'email',
      'backup',
    ]

    for (const tab of expectedTabs) {
      expect(source).toContain(`key: "${tab}" as SettingsTab`)
    }

    expect(source).toContain('@media (max-width: 767px)')
    expect(source).toContain('overflow-x: auto')
    expect(source).toContain('scroll-snap-type: x proximity')
    expect(source).toContain('width: max-content')
    expect(source).toContain('min-width: max-content')
    expect(source).toContain('white-space: nowrap')
    expect(source).not.toContain('grid-template-columns: repeat(3, minmax(0, 1fr))')
  })

  it('does not let sticky touch hover cover the active tab', () => {
    expect(source).toContain('@media (hover: hover) and (pointer: fine)')
    expect(source).toMatch(/\.settings-tab-active\s*{[\s\S]*?transition: none;/)
    expect(source).toContain('.settings-tab.settings-tab-active::before')
    expect(source).toContain('.settings-tab.settings-tab-active .settings-tab-icon')
    expect(source).not.toContain('.settings-tab:hover::before,\n.settings-tab:focus-visible::before')
  })
})
