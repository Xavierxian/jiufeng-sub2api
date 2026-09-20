import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = resolve(process.cwd(), 'src/views/home-jiufeng')
const read = (path: string) => readFileSync(resolve(root, path), 'utf8')

describe('Jiufeng teleported overlay theme', () => {
  it('stays entirely inside the Jiufeng view directory', () => {
    const importLine = "import './jiufeng-overlays.css'"
    expect(read('JFAppLayout.vue')).toContain(importLine)
    expect(read('JFLoginView.vue')).toContain(importLine)
    expect(read('JFRegisterView.vue')).toContain(importLine)
    expect(read('JFEmailVerifyView.vue')).toContain(importLine)
    expect(read('JFForgotPasswordView.vue')).toContain(importLine)
    expect(read('JFResetPasswordView.vue')).toContain(importLine)
    expect(read('JFAuthCallbackLayout.vue')).toContain(importLine)
    expect(read('JFHomeView.vue')).toContain(importLine)
    expect(read('JFKeyUsageView.vue')).toContain(importLine)
    expect(read('JFPublicHeader.vue')).toContain(importLine)
  })

  it('reaches global toasts after they are teleported to body', () => {
    const styles = read('jiufeng-overlays.css')
    expect(styles).toContain("body > [aria-live='polite'][aria-atomic='true'] > div")
    expect(styles).toContain('border-left: 4px solid var(--jf-toast-accent)')
    expect(styles).toContain("[aria-label='Close notification']")
  })

  it('themes shared BaseDialog markup without modifying the shared component', () => {
    const styles = read('jiufeng-overlays.css')
    expect(styles).toContain('.modal-overlay {')
    expect(styles).toContain('.modal-content {')
    expect(styles).toContain('.modal-title {')
    expect(styles).toContain("button[class*='bg-primary-']")
    expect(styles).toContain('.dark {')
  })

  it('covers account testing and its separately teleported model selector', () => {
    const styles = read('jiufeng-overlays.css')
    expect(styles).toContain(".modal-content:has(.modal-body .font-mono[class*='bg-gray-900'])")
    expect(styles).toContain(".modal-content .font-mono[class*='bg-gray-900']")
    expect(styles).toContain('.select-dropdown-portal {')
  })

  it('themes the custom teleported announcement list and detail surfaces', () => {
    const styles = read('jiufeng-overlays.css')
    expect(styles).toContain("body > [class~='z-[100]']:has(> [class~='max-w-[620px]'])")
    expect(styles).toContain("body > [class~='z-[110]']:has(> [class~='max-w-[780px]'])")
    expect(styles).toMatch(/max-w-\[620px\][\s\S]*?background: var\(--jf-overlay-panel\) !important;/)
    expect(styles).toMatch(/max-w-\[780px\][\s\S]*?background: var\(--jf-overlay-action\) !important;/)
  })

  it('uses Jiufeng background neutrals for nested scrollbars', () => {
    const styles = read('jiufeng-overlays.css')
    expect(styles).toContain('--jf-scrollbar-track: var(--jf-overlay-panel-muted);')
    expect(styles).toContain('--jf-scrollbar-thumb: var(--jf-overlay-border-strong);')
    expect(styles).toContain('--jf-scrollbar-thumb-hover: var(--jf-overlay-soft);')
    expect(styles).not.toMatch(/--jf-scrollbar-(?:thumb|thumb-hover):\s*#[0-9a-f]*[56789a-f][0-9a-f]*;/i)
    expect(styles).toContain(':root body * {')
    expect(styles).toContain('scrollbar-color: var(--jf-scrollbar-thumb) var(--jf-scrollbar-track) !important;')
    expect(styles).toContain(':root body *::-webkit-scrollbar-track {')
    expect(styles).toContain(':root body *::-webkit-scrollbar-thumb {')
    expect(styles).toContain(':root body *::-webkit-scrollbar-corner {')
  })

  it('hides only the document scrollbar without disabling scrolling', () => {
    const styles = read('jiufeng-overlays.css')
    expect(styles).toMatch(/:root,\s*:root body\s*{[\s\S]*?scrollbar-width: none !important;/)
    expect(styles).toMatch(/:root::-webkit-scrollbar,\s*:root body::-webkit-scrollbar\s*{[\s\S]*?display: none !important;/)
    expect(styles).not.toMatch(/:root body \*::-webkit-scrollbar\s*{[^}]*display:\s*none/s)
    expect(styles).not.toMatch(/:root body\s*{[^}]*overflow:\s*hidden/s)
  })
})
