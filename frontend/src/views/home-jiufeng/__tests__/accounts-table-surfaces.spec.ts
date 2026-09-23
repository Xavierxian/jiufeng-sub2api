import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')
const styles = read('src/views/home-jiufeng/jf-studio.css')

describe('Jiufeng account table surfaces', () => {
  it('keeps desktop filters and actions together in one ordered row', () => {
    const accounts = read('src/views/home-jiufeng/admin/AccountsView.vue')
    expect(accounts).toContain('class="jf-account-toolbar flex flex-wrap-reverse')
    expect(accounts).toContain('class="jf-account-table-filters"')
    expect(accounts).toContain('class="jf-account-table-actions"')
    expect(styles).toMatch(/@media \(min-width: 1280px\)[\s\S]*?\.jf-studio \.jf-account-toolbar\s*{[\s\S]*?flex-wrap: nowrap !important;/)
    expect(styles).toMatch(/\.jf-studio \.jf-account-table-filters\s*{[\s\S]*?flex: 1 1 auto;[\s\S]*?flex-wrap: nowrap !important;/)
    expect(styles).toMatch(/\.jf-studio \.jf-account-table-actions\s*{[\s\S]*?flex: 0 0 auto;[\s\S]*?flex-wrap: nowrap !important;/)
  })

  it('gives the shared bulk actions bar a Jiufeng-local hook and warm surface', () => {
    expect(read('src/views/home-jiufeng/admin/AccountsView.vue'))
      .toContain('class="jf-account-bulk-bar"')
    expect(styles).toMatch(/\.jf-studio \.jf-account-bulk-bar\s*{[\s\S]*?background: var\(--jf-panel-muted\) !important;/)
  })

  it('uses Jiufeng tokens for both scrollbar axes and the corner', () => {
    expect(styles.match(/--jf-scrollbar-track:/g)).toHaveLength(2)
    expect(styles.match(/--jf-scrollbar-thumb:/g)).toHaveLength(2)
    expect(styles).toContain('--jf-scrollbar-track: var(--jf-bg);')
    expect(styles).toContain('--jf-scrollbar-thumb: var(--jf-border-strong);')
    expect(styles).toContain('--jf-scrollbar-thumb-hover: var(--jf-text-soft);')
    expect(styles).toMatch(/\.table-wrapper::-webkit-scrollbar-track\s*{\s*background: var\(--jf-scrollbar-track\) !important;/)
    expect(styles).toMatch(/\.table-wrapper::-webkit-scrollbar-thumb\s*{[\s\S]*?background-color: var\(--jf-scrollbar-thumb\) !important;/)
    expect(styles).toContain('.table-wrapper::-webkit-scrollbar-corner')
    expect(styles).toContain('scrollbar-color: var(--jf-scrollbar-thumb) var(--jf-scrollbar-track) !important;')
  })
})
