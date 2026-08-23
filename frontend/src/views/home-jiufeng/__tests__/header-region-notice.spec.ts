import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const viewRoot = resolve(process.cwd(), 'src/views/home-jiufeng')
const read = (file: string) => readFileSync(resolve(viewRoot, file), 'utf8')
const readLocale = (locale: 'zh' | 'en') =>
  readFileSync(resolve(process.cwd(), `src/i18n/locales/${locale}/common.ts`), 'utf8')

describe('Jiufeng dashboard region notice', () => {
  it('renders a localized warning on a duplicated seamless track', () => {
    const header = read('JFAppHeader.vue')
    const zh = readLocale('zh')
    const en = readLocale('en')

    expect(header).toContain('class="jf-cloud-region-notice"')
    expect(header).toContain('v-for="copy in 2"')
    expect(header).toContain("computed(() => t('common.serviceRegionNotice'))")
    expect(zh).toContain('本网站仅面向海外地区华人提供服务')
    expect(zh).toContain('账号将被立即封禁')
    expect(en).toContain('Service Region Notice')
    expect(en).toContain('Accounts found in violation will be banned immediately')
  })

  it('moves right to left and provides pause and reduced-motion states', () => {
    const styles = read('jf-saas.css')

    expect(styles).toContain('animation: jf-cloud-region-notice-scroll 28s linear infinite')
    expect(styles).toMatch(
      /@keyframes jf-cloud-region-notice-scroll\s*{\s*from\s*{\s*transform: translate3d\(0, 0, 0\);\s*}\s*to\s*{\s*transform: translate3d\(-50%, 0, 0\);/,
    )
    expect(styles).toContain('animation-play-state: paused')
    expect(styles).toContain('@media (prefers-reduced-motion: reduce)')
    expect(styles).toContain('.jf-cloud-region-notice__item:not(:first-child)')
  })
})
