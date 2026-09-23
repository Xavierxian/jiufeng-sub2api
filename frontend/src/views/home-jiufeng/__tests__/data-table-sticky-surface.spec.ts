import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const styles = readFileSync(resolve(process.cwd(), 'src/views/home-jiufeng/jf-studio.css'), 'utf8')
const table = readFileSync(resolve(process.cwd(), 'src/views/home-jiufeng/JFDataTable.vue'), 'utf8')

describe('Jiufeng sticky table surfaces', () => {
  it('uses opaque surfaces for hovered and selected sticky cells', () => {
    const stickyHoverValues = [...styles.matchAll(/--jf-table-sticky-hover:\s*([^;]+);/g)]
      .map(match => match[1].trim())
    const stickySelectedValues = [...styles.matchAll(/--jf-table-sticky-selected:\s*([^;]+);/g)]
      .map(match => match[1].trim())

    expect(stickyHoverValues).toHaveLength(2)
    expect(stickySelectedValues).toHaveLength(2)
    expect(
      [...stickyHoverValues, ...stickySelectedValues].every(value => /^#[\da-f]{6}$/i.test(value)),
    ).toBe(true)
    expect(styles).toMatch(/:hover \.sticky-col\s*{\s*background: var\(--jf-table-sticky-hover\) !important;/)
    expect(styles).toMatch(/tr\[class\*='bg-primary'\] \.sticky-col\s*{\s*background: var\(--jf-table-sticky-selected\) !important;/)
  })

  it('keeps the sticky selection width aligned with the following column offset', () => {
    expect(table).toMatch(
      /\.sticky-col-left-first\s*{[\s\S]*?width: var\(--select-col-width\);[\s\S]*?min-width: var\(--select-col-width\);[\s\S]*?max-width: var\(--select-col-width\);/,
    )
    expect(table).toMatch(
      /\.sticky-col-left-second\s*{\s*left: var\(--select-col-width\);/,
    )
  })
})
