import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const styles = readFileSync(resolve(process.cwd(), 'src/views/home-jiufeng/jf-studio.css'), 'utf8')

describe('Jiufeng workspace navigation active contrast', () => {
  it('keeps touch hover from overriding the active dark-mode colors', () => {
    expect(styles).toMatch(
      /@media \(hover: hover\) and \(pointer: fine\)\s*{\s*\.jf-studio \.jf-workspace-chip:hover/,
    )
    expect(styles).toMatch(
      /\.jf-studio \.jf-workspace-chip\.jf-workspace-chip--active\s*{[\s\S]*?background: var\(--jf-control-active\);[\s\S]*?color: var\(--jf-control-active-text\);[\s\S]*?transition: none;/,
    )
    expect(styles).toMatch(
      /\.dark \.jf-studio \.jf-workspace-chip\.jf-workspace-chip--active\s*{[\s\S]*?background: var\(--jf-control-active\);[\s\S]*?color: var\(--jf-control-active-text\);/,
    )
    expect(styles).toContain('--jf-control-active: #343834;')
    expect(styles).toContain('--jf-control-active: #3f4540;')
    expect(styles).not.toContain('.dark .jf-studio .jf-workspace-chip--active {')
  })

  it('hides the shared page heading on mobile without changing its desktop layout', () => {
    expect(styles).toMatch(/\.jf-workspace-heading\s*{\s*display: flex;/)
    expect(styles).toMatch(
      /@media \(max-width: 1023px\)\s*{[\s\S]*?\.jf-workspace-heading\s*{\s*display: none;/,
    )
  })
})
