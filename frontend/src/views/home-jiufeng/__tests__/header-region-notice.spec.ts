import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const viewRoot = resolve(process.cwd(), 'src/views/home-jiufeng')
const read = (file: string) => readFileSync(resolve(viewRoot, file), 'utf8')

describe('Jiufeng dashboard region notice', () => {
  it('renders the complete localized warning on a duplicated seamless track', () => {
    const header = read('JFAppHeader.vue')

    expect(header).toContain('class="jf-cloud-region-notice"')
    expect(header).toContain('v-for="copy in 2"')
    expect(header).toContain("const { t, locale } = useI18n()")
    expect(header).toContain("locale.value === 'zh'")
    expect(header).toContain(
      '⚠ 服务地区提醒：本网站仅面向海外地区华人提供服务。中国大陆及香港、澳门、台湾地区用户请勿注册或使用；如发现违规使用，账号将被立即封禁。',
    )
    expect(header).toContain(
      '⚠ Service Region Notice: This website provides services exclusively to overseas Chinese communities. Users from Mainland China, Hong Kong, Macau, and Taiwan must not register or use the service. Accounts found in violation will be banned immediately.',
    )
    expect(header).not.toContain("t('common.serviceRegionNotice')")
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
