<template>
  <div v-if="homeContent" class="min-h-screen">
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContentUrl"
      class="h-screen w-full border-0"
      allowfullscreen
    />
    <div v-else v-html="sanitizedHomeContent" />
  </div>

  <div v-else class="sx-home" :class="{ 'is-intro-quick': !playFullIntro }">
    <header class="sx-header">
      <div class="sx-container sx-header-row">
        <router-link to="/home" class="sx-brand" :aria-label="`${homeCopy.brandName} home`">
          <span class="sx-logo-mark">{{ homeCopy.brandMark }}</span>
          <span class="sx-logo-name">{{ homeCopy.brandName }}</span>
        </router-link>

        <nav class="sx-nav" aria-label="home navigation">
          <a href="#models">{{ homeCopy.nav.models }}</a>
          <a :href="docUrl || '#onboard'" :target="docUrl ? '_blank' : undefined" :rel="docUrl ? 'noopener noreferrer' : undefined">{{ homeCopy.nav.docs }}</a>
          <a href="#manifesto">{{ homeCopy.nav.about }}</a>
          <a href="#contact">{{ homeCopy.nav.contact }}</a>
        </nav>

        <div class="sx-actions">
          <LocaleSwitcher />
          <router-link v-if="isAuthenticated" :to="dashboardPath" class="sx-register">{{ homeCopy.actions.dashboard }}</router-link>
          <router-link v-else to="/login" class="sx-login">{{ homeCopy.actions.login }}</router-link>
          <router-link v-if="!isAuthenticated" to="/register" class="sx-register">{{ homeCopy.actions.register }}</router-link>
        </div>
      </div>
    </header>

    <main>
      <section class="sx-hero">
        <div class="sx-intro-layer" aria-hidden="true">
          <div class="sx-intro-brand">
            <span>{{ homeCopy.brandMark }}</span>
            <div>
              <strong>{{ homeCopy.brandName }}</strong>
              <em>JIUFENG / MODEL NETWORK</em>
            </div>
          </div>

          <div class="sx-intro-count">
            <span>01</span>
            <i />
            <span>08</span>
          </div>

          <div class="sx-intro-footer">
            <div class="sx-intro-phases">
              <span v-for="phase in introPhases" :key="phase">{{ phase }}</span>
            </div>
            <div class="sx-intro-progress"><i /></div>
            <p><span>MODEL ROUTING SYSTEM</span><b>JIUFENG / 2026</b></p>
          </div>
        </div>

        <ParticleSphere class="sx-hero-sphere" :show-labels="true" />
        <ParticleSphere class="sx-hero-finish-sphere" />
        <div class="sx-container sx-hero-inner">
          <p class="sx-hero-pill">
            <span>{{ homeCopy.hero.pill1 }}</span>
            <i />
            <span>{{ homeCopy.hero.pill2 }}</span>
            <i />
            <span>{{ homeCopy.hero.pill3 }}</span>
          </p>
          <h1>{{ homeCopy.hero.title }}</h1>
          <p class="sx-hero-sub">{{ homeCopy.hero.subtitle }}</p>
          <p class="sx-hero-slogan">{{ homeCopy.hero.slogan }}</p>
          <router-link :to="entryPath" class="sx-primary">
            <span>{{ homeCopy.actions.start }}</span>
            <span>→</span>
          </router-link>
          <div class="sx-works">
            <span>WORKS ON</span>
            <b v-for="item in worksOn" :key="item">{{ item }}</b>
          </div>
        </div>
        <a class="sx-scroll" href="#manifesto" aria-label="scroll to manifesto"><span /></a>
      </section>

      <section id="manifesto" class="sx-section sx-promise">
        <div class="sx-container sx-narrow">
          <p class="sx-kicker">{{ homeCopy.promise.kicker }}</p>
          <h2><template v-for="(line, index) in homeCopy.promise.titleLines" :key="line">{{ line }}<br v-if="index < homeCopy.promise.titleLines.length - 1" /></template></h2>
          <div class="sx-copy">
            <p>{{ homeCopy.promise.copy1 }}</p>
            <p>{{ homeCopy.promise.copy2 }}</p>
          </div>
        </div>

        <div class="sx-container">
          <ul class="sx-promises">
            <li v-for="item in promiseCards" :key="item.title">
              <Icon :name="item.icon" size="sm" />
              <span>{{ item.title }}</span>
            </li>
          </ul>
        </div>

        <div ref="statsRef" class="sx-container sx-stats" :class="{ 'is-visible': statsVisible }">
          <div v-for="item in displayedStats" :key="item.label" class="sx-stat">
            <strong :aria-label="`${item.display}${item.unit}`">{{ item.display }}<small>{{ item.unit }}</small></strong>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </section>

      <section id="models" class="sx-section sx-image">
        <div class="sx-container sx-image-grid">
          <div class="sx-image-copy">
            <p class="sx-kicker">{{ homeCopy.image.kicker }}</p>
            <h2>{{ homeCopy.image.title }}</h2>
            <p>{{ homeCopy.image.copy }}</p>
            <div class="sx-model-title">
              <span>gpt-image-2</span>
              <b>IMAGE</b>
              <small>· OpenAI</small>
            </div>
            <p class="sx-model-note">{{ homeCopy.image.note }}</p>
            <div class="sx-endpoints">
              <code><span>POST</span>/v1/images/generations</code>
              <code><span>POST</span>/v1/images/edits</code>
            </div>
            <p class="sx-linkline">{{ homeCopy.image.linkline }}</p>
          </div>

          <div class="sx-image-card">
            <div class="sx-prompt">
              <span>PROMPT</span>
              <p>
                {{ typedImagePrompt }}
                <i v-if="showImagePromptCaret" aria-hidden="true" />
              </p>
            </div>
            <div class="sx-photo" :class="{ 'is-revealing': imageDemoRevealing, 'is-ready': imageDemoDone }" aria-hidden="true">
              <img :src="demoGptImage" alt="" />
            </div>
            <div class="sx-progress" :class="{ 'is-running': imageDemoRunning, 'is-done': imageDemoDone }">
              <span :key="imageDemoProgressKey" />
            </div>
            <p class="sx-done"><span />{{ imageDemoDone ? homeCopy.image.done : homeCopy.image.generating }} · 1024×1024 · ~3s</p>
            <span class="sx-demo-tag">{{ homeCopy.image.demoTag }}</span>
          </div>
        </div>
      </section>

      <section class="sx-section sx-why">
        <div class="sx-container">
          <p class="sx-kicker">{{ homeCopy.why.kicker }}</p>
          <h2>{{ homeCopy.why.title }}</h2>
          <div class="sx-why-list" @pointerleave="clearWhyPreview">
            <article
              v-for="item in whyCards"
              :key="item.index"
              :class="{ 'is-active': activeWhyIndex === item.index }"
              tabindex="0"
              @pointerenter="setWhyPreview(item.index)"
              @focusin="setWhyPreview(item.index)"
              @blur="clearWhyPreview"
            >
              <span>{{ item.index }}</span>
              <h3>{{ item.title }} <small>{{ item.sub }}</small></h3>
              <p>{{ item.desc }}</p>
            </article>
            <div class="sx-why-preview" :class="{ 'is-visible': currentWhyCard }" :style="whyPreviewStyle" aria-hidden="true">
              <Transition name="sx-why-card">
                <div v-if="currentWhyCard" :key="currentWhyCard.index" class="sx-why-float">
                  <template v-if="currentWhyCard.index === '01'">
                    <p class="sx-why-float-kicker">ONE KEY · ALL MODELS</p>
                    <div class="sx-model-map">
                      <svg class="sx-model-lines" viewBox="0 0 430 190" focusable="false" aria-hidden="true">
                        <path d="M60 32 C 150 32, 178 95, 250 95" />
                        <path d="M60 95 L 250 95" />
                        <path d="M60 158 C 150 158, 178 95, 250 95" />
                        <path d="M312 95 L 376 95" />
                        <circle class="sx-flow-dot" r="4">
                          <animateMotion dur="2.9s" repeatCount="indefinite" path="M60 32 C 150 32, 178 95, 250 95" />
                        </circle>
                        <circle class="sx-flow-dot" r="4">
                          <animateMotion dur="2.5s" begin=".35s" repeatCount="indefinite" path="M60 95 L 250 95" />
                        </circle>
                        <circle class="sx-flow-dot" r="4">
                          <animateMotion dur="3.1s" begin=".7s" repeatCount="indefinite" path="M60 158 C 150 158, 178 95, 250 95" />
                        </circle>
                        <circle class="sx-flow-dot is-out" r="4">
                          <animateMotion dur="1.9s" begin=".2s" repeatCount="indefinite" path="M312 95 L 376 95" />
                        </circle>
                      </svg>
                      <span class="sx-model-node is-claude"><b>AI</b><em>Claude</em></span>
                      <span class="sx-model-node is-gpt"><b>◎</b><em>GPT</em></span>
                      <span class="sx-model-node is-gemini"><b>✦</b><em>Gemini</em></span>
                      <strong class="sx-gateway-node">{{ homeCopy.brandName }}<em>GATEWAY</em></strong>
                      <span class="sx-agent">&gt;_<em>{{ homeCopy.why.agent }}</em></span>
                    </div>
                    <p class="sx-why-float-caption">{{ homeCopy.why.floatOne }}</p>
                  </template>

                  <template v-else-if="currentWhyCard.index === '02'">
                    <p class="sx-why-float-kicker">UPTIME 99.9% · AUTO FAILOVER</p>
                    <div class="sx-failover-card sx-failover-progress">
                      <div class="sx-route is-bad">
                        <strong>{{ homeCopy.why.badRelay }} <em>ERR · {{ homeCopy.why.drop }}</em></strong>
                        <span /><span /><span />
                        <b>retrying… ×3</b>
                      </div>
                      <div class="sx-route is-good">
                        <strong>{{ homeCopy.why.goodGateway }} <em>SSE · {{ homeCopy.why.steady }}</em></strong>
                        <span /><span /><span />
                        <b>✓ {{ homeCopy.why.longOutput }}</b>
                      </div>
                    </div>
                    <p class="sx-why-float-caption">{{ homeCopy.why.floatTwo }}</p>
                  </template>

                  <template v-else-if="currentWhyCard.index === '03'">
                    <p class="sx-why-float-kicker">TLS · ZERO RETENTION</p>
                    <div class="sx-log-card sx-privacy-reveal">
                      <i class="sx-log-flow" />
                      <p><span>REQUEST LOG</span><b>#a91f</b></p>
                      <dl>
                        <div><dt>model</dt><dd>claude-opus-4-7</dd></div>
                        <div><dt>tokens</dt><dd>1,204 · $0.0017</dd></div>
                        <div><dt>prompt</dt><dd><span>{{ homeCopy.why.promptMask }}</span></dd></div>
                      </dl>
                    </div>
                    <div class="sx-privacy-pills sx-privacy-reveal"><span v-for="item in homeCopy.why.privacyPills" :key="item">✓ {{ item }}</span></div>
                    <p class="sx-why-float-caption">{{ homeCopy.why.floatThree }}</p>
                  </template>

                  <template v-else-if="currentWhyCard.index === '04'">
                    <p class="sx-why-float-kicker">{{ homeCopy.why.noApproval }} <b>0:47</b></p>
                    <div class="sx-access-flow sx-access-step">
                      <span><em>{{ homeCopy.why.signup }}</em><b>you@mail.com</b></span>
                      <i>→</i>
                      <span><em>API KEY</em><b>sk-7f3e••••••</b></span>
                      <i>→</i>
                      <span class="ok"><em>{{ homeCopy.why.firstCall }}</em><b>● 200 OK</b></span>
                    </div>
                    <p class="sx-why-float-caption">{{ homeCopy.why.floatFour }}</p>
                  </template>

                  <template v-else-if="currentWhyCard.index === '05'">
                    <p class="sx-why-float-kicker">FAIR BILLING <b>{{ homeCopy.why.officialRate }}</b></p>
                    <div class="sx-billing-table sx-billing-replay">
                      <i class="sx-billing-flow" />
                      <p><b>claude-opus-4-7</b><span>1,204 tk</span><strong>$0.0017</strong></p>
                      <p><b>gpt-5.2</b><span>869 tk</span><strong>$0.0009</strong></p>
                      <p><b>gemini-2.5-pro</b><span>2,310 tk</span><strong>$0.0011</strong></p>
                      <p class="total"><b>TOTAL</b><strong>$0.0037</strong></p>
                    </div>
                    <p class="sx-why-float-caption">{{ homeCopy.why.floatFive }}</p>
                  </template>

                  <template v-else>
                    <p class="sx-why-float-kicker">SELF-SERVICE</p>
                    <div class="sx-wallet-card sx-wallet-recharge">
                      <span>BALANCE</span>
                      <strong><em>$5.00</em><em>$105.00</em></strong>
                      <i />
                      <p><b v-for="item in homeCopy.why.walletItems" :key="item">{{ item }}</b></p>
                    </div>
                    <p class="sx-why-float-caption"><span class="sx-wallet-status">{{ homeCopy.why.recharged }} · </span>{{ homeCopy.why.floatSix }}</p>
                  </template>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </section>

      <section id="onboard" class="sx-section sx-onboard">
        <div class="sx-container">
          <p class="sx-kicker">{{ homeCopy.onboard.kicker }}</p>
          <h2>{{ homeCopy.onboard.title }}</h2>
          <p class="sx-onboard-lede">{{ homeCopy.onboard.copy }}</p>
          <div class="sx-steps">
            <article v-for="item in steps" :key="item.num" :class="{ active: item.num === activeOnboardStep }">
              <span>{{ item.num }}</span>
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.desc }}</p>
              </div>
            </article>
          </div>
          <div class="sx-terminal">
            <div class="sx-termbar"><i /><i /><i /><span>{{ homeCopy.onboard.termbar }}</span></div>
            <pre aria-live="polite"><code>
<span v-for="(line, index) in terminalLines" :key="`${line.text}-${index}`" class="sx-term-line" :class="`is-${line.kind}`">{{ line.text }}</span><span v-if="currentTerminalText" class="sx-term-line is-active" :class="`is-${currentTerminalKind}`"><span>{{ currentTerminalText }}</span><i class="sx-caret" /></span><span v-else-if="terminalIsWaiting" class="sx-term-line is-active"><i class="sx-caret" /></span>
</code></pre>
          </div>
        </div>
      </section>

      <section id="pricing" class="sx-section sx-price">
        <div class="sx-container">
          <p class="sx-kicker">{{ homeCopy.pricing.kicker }}</p>
          <h2>{{ homeCopy.pricing.title }}</h2>
          <p>{{ homeCopy.pricing.copy }}</p>
          <div class="sx-price-lines">
            <span v-for="item in pricingPoints" :key="item">{{ item }}</span>
          </div>
          <router-link :to="entryPath" class="sx-underlink">{{ homeCopy.pricing.link }} →</router-link>
        </div>
      </section>

      <section id="contact" class="sx-closing">
        <ParticleSphere class="sx-close-sphere" />
        <div class="sx-close-content">
          <h2>{{ homeCopy.closing.title }}</h2>
          <p>GLOBAL · MULTI-MODEL · API GATEWAY</p>
          <router-link :to="entryPath" class="sx-primary">
            <span>{{ homeCopy.actions.start }}</span>
            <span>→</span>
          </router-link>
        </div>
      </section>
    </main>

    <footer class="sx-footer">
      <div class="sx-container">
        <span>{{ homeCopy.footer.tagline }}</span>
        <span>© 2026 {{ homeCopy.brandName }}</span>
      </div>
    </footer>
  </div>
</template>
<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'
import { setLocale } from '@/i18n'
import demoGptImage from './demo-gpt-image.webp'
import DOMPurify from 'dompurify'
import { sanitizeUrl } from '@/utils/url'

type TerminalLineKind = 'input' | 'success' | 'question' | 'output' | 'muted'
type TerminalLine = {
  kind: TerminalLineKind
  text: string
}

const authStore = useAuthStore()
const appStore = useAppStore()
const { locale } = useI18n()
const savedLocale = localStorage.getItem('sub2api_locale')

if (savedLocale !== 'en' && savedLocale !== 'zh') {
  void setLocale('en')
}

type PromiseIcon = 'lock' | 'swap' | 'calculator' | 'bolt'

const homeCopies = {
  zh: {
    brandMark: '锋',
    brandName: '九锋',
    nav: {
      models: '模型列表',
      docs: '使用文档',
      about: '了解九锋',
      contact: '联系我们',
    },
    actions: {
      dashboard: '控制台',
      login: '登录',
      register: '注册',
      start: '即刻开始',
    },
    hero: {
      pill1: '最注重隐私的中转站',
      pill2: '拒绝数据倒卖',
      pill3: '拒绝模型掺水',
      title: '九锋 AI',
      subtitle: '最安全的大模型中转平台',
      slogan: '链接一切 · 让您一念之间 · 九锋世界',
    },
    promise: {
      kicker: 'OUR PROMISE · 我们的承诺',
      titleLines: ['一字不改的 Token, 一分不掺', '的账单'],
      copy1: '九锋 API 网关只做一件事：把你的请求按官方兼容协议原样转发给上游模型，响应再原样回到你手里。不蒸馏、不压缩、不替换模型，你收到的每一个 token 都来自你声明的那个模型本身。',
      copy2: '我们对待你的 prompt 像对待密信：在内存里存在的时间不超过一次响应周期，响应完成即从内存释放，不写日志、不入数据库、不参与训练、不与任何第三方共享。',
      cards: [
        { icon: 'lock' as PromiseIcon, title: '私密 · 请求即焚' },
        { icon: 'swap' as PromiseIcon, title: '忠实 · 一字不改' },
        { icon: 'calculator' as PromiseIcon, title: '透明 · 原价对账' },
        { icon: 'bolt' as PromiseIcon, title: '迅捷 · 毫秒调度' },
      ],
      stats: [
        { value: '12,847,360', unit: '+', label: '累计处理 API 请求' },
        { value: '99.97', unit: '%', label: '近 30 天可用率' },
        { value: '386', unit: 'ms', label: '平均首字延迟' },
      ],
    },
    image: {
      kicker: 'IMAGE · 生图',
      title: '一句话,生成一张图。',
      copy: 'gpt-image-2 完整接入，文生图与图像编辑共用同一个 Key。OpenAI 兼容协议，base_url 指过来即用。',
      note: '两个端点:文生图 (generations) 与图像编辑 (edits)。单次请求最大 30 MiB。',
      linkline: '文生图 · 图生图 · 多图参考 · 风格迁移',
      prompt: '一片宁静的海岸日落,柔和的体积光,照片级真实感',
      done: '完成',
      generating: '生成中',
      demoTag: 'gpt-image-2 · 实时演示',
    },
    why: {
      kicker: 'WHY · 为什么选我们',
      title: '少一些妥协,多一份思维流速。',
      agent: '你的 Agent',
      floatOne: '一把 Key 通吃全家桶,直连你的工作流',
      badRelay: 'B 家中转',
      drop: '断流',
      goodGateway: '九锋网关',
      steady: '不断流',
      longOutput: '长输出完整送达',
      floatTwo: '同一段长回复:别人掉线重试,我们一气呵成',
      promptMask: '•••••••••••来润色…',
      privacyPills: ['不落盘', '不训练', '不共享'],
      floatThree: '日志只留计费摘要,prompt 只属于你',
      noApproval: 'NO 审批 · NO 绑卡',
      signup: '注册',
      firstCall: '首次调用',
      floatFour: '从注册到第一个 token,不到一分钟',
      officialRate: '官方倍率 ×1.0',
      floatFive: '每一笔都有日志,可回溯到原始响应',
      walletItems: ['在线支付', '卡密兑换', '邀请返利'],
      recharged: '充值成功',
      floatSix: '余额可视,随充随用,不卡进度',
      cards: [
        { index: '01', title: '多模型聚合', sub: 'MULTI-MODEL', desc: 'Claude / GPT / Gemini 等主流模型一站接入，统一 OpenAI 兼容协议，免在多个平台间切换。' },
        { index: '02', title: '稳定可靠', sub: 'RELIABILITY', desc: '多线路冗余、跨区域容灾、自动故障切换，长链路 SSE 不中断，99.9% 可用性，关键调用从不掉队。' },
        { index: '03', title: '隐私至上', sub: 'PRIVACY', desc: '请求体不落盘，不用于模型训练，不与第三方共享。全链路 TLS，日志仅保留必要计费摘要。你的 prompt 只属于你。' },
        { index: '04', title: '极速接入', sub: 'INSTANT ACCESS', desc: '注册即开 API，无需审批，无需绑卡。第一次充值即可立即开始调用，凭据自助管理。' },
        { index: '05', title: '透明计费', sub: 'FAIR BILLING', desc: '按官方 Token 倍率计价。每一次调用都有用量日志、余额变动与原始响应，可逐条回溯。' },
        { index: '06', title: '自助充值', sub: 'SELF-SERVICE', desc: '支持主流支付方式，余额可视化，接近阈值自动提醒。卡密兑换、邀请返利同步可用。' },
      ],
    },
    onboard: {
      kicker: 'ONBOARD · 零代码接入',
      title: '一行代码都不用写。',
      copy: '控制台复制一条命令贴进终端——检测环境、写配置、自检、脚本替你全办了。',
      termbar: 'bash — 九锋 AI · 一键接入',
      steps: [
        { num: '1', title: '复制命令', desc: '控制台 · API 密钥 · 页面一键部署，复制那一条命令。' },
        { num: '2', title: '粘贴进终端', desc: '脚本自动检测环境，写入配置并完成自检。' },
        { num: '3', title: '开始对话', desc: '终端、IDE、桌面客户端，接好即用。' },
      ],
      terminal: [
        { kind: 'input' as TerminalLineKind, text: '$ curl -fsSL https://jiufeng.ai/d/****** | bash' },
        { kind: 'success' as TerminalLineKind, text: '✓ 检测环境 - Node 22 · OpenClaw 已安装' },
        { kind: 'question' as TerminalLineKind, text: '? 粘贴 API Key › sk-••••••••••••' },
        { kind: 'question' as TerminalLineKind, text: '? 主模型 > claude-opus-4-7' },
        { kind: 'success' as TerminalLineKind, text: '✓ 配置写入  ~/.openClaw/openClaw.json' },
        { kind: 'success' as TerminalLineKind, text: '✓ 自检通过 - 接入完成' },
        { kind: 'input' as TerminalLineKind, text: '$ openClaw "介绍下你自己"' },
        { kind: 'output' as TerminalLineKind, text: '你好,我是接入九锋 AI 的本地助手,随时可以开工。' },
      ],
    },
    pricing: {
      kicker: 'PRICING · 计费',
      title: '按 Token 计费,不按月、不按席,看账看量。',
      copy: '没有月租、没有最低消费，也没有“为你打包却用不完的额度”。所有调用按官方 Token 倍率结算，实时可查。',
      points: ['余额永不过期', '充值无门槛', '官方倍率结算', '可逐条对账'],
      link: '查看模型与价格',
    },
    closing: {
      title: '一念既起 · 模型即至',
    },
    footer: {
      tagline: '九锋 · 让思考更自由',
    },
  },
  en: {
    brandMark: 'JF',
    brandName: 'Jiufeng',
    nav: {
      models: 'Models',
      docs: 'Docs',
      about: 'About Jiufeng',
      contact: 'Contact',
    },
    actions: {
      dashboard: 'Dashboard',
      login: 'Sign In',
      register: 'Register',
      start: 'Start Now',
    },
    hero: {
      pill1: 'Privacy-first relay',
      pill2: 'No data resale',
      pill3: 'No watered-down models',
      title: 'Jiufeng AI',
      subtitle: 'The safest large-model relay platform',
      slogan: 'Connect everything · Reach the Jiufeng world in one thought',
    },
    promise: {
      kicker: 'OUR PROMISE',
      titleLines: ['Every token untouched,', 'every bill transparent'],
      copy1: 'Jiufeng API Gateway does one thing: it forwards your request to upstream models through official-compatible protocols and returns the response untouched. No distillation, no compression, no model swapping. Every token you receive comes from the model you selected.',
      copy2: 'We treat your prompts like sealed letters: they only live in memory for the response cycle and are released immediately after completion. No logs, no database writes, no training, no third-party sharing.',
      cards: [
        { icon: 'lock' as PromiseIcon, title: 'Private · Request ephemeral' },
        { icon: 'swap' as PromiseIcon, title: 'Faithful · No rewriting' },
        { icon: 'calculator' as PromiseIcon, title: 'Transparent · Auditable cost' },
        { icon: 'bolt' as PromiseIcon, title: 'Fast · Millisecond routing' },
      ],
      stats: [
        { value: '12,847,360', unit: '+', label: 'API requests processed' },
        { value: '99.97', unit: '%', label: '30-day availability' },
        { value: '386', unit: 'ms', label: 'Average first-token latency' },
      ],
    },
    image: {
      kicker: 'IMAGE',
      title: 'Turn one sentence into an image.',
      copy: 'gpt-image-2 is fully integrated. Text-to-image and image editing share the same key. OpenAI-compatible API, ready once your base_url points here.',
      note: 'Two endpoints: generations and edits. Maximum 30 MiB per request.',
      linkline: 'Text to image · Image to image · Multi-reference · Style transfer',
      prompt: 'A quiet coastal sunset, soft volumetric light, photorealistic',
      done: 'Done',
      generating: 'Generating',
      demoTag: 'gpt-image-2 · Live demo',
    },
    why: {
      kicker: 'WHY · WHY US',
      title: 'Less compromise, more thinking velocity.',
      agent: 'Your Agent',
      floatOne: 'One key for the whole model stack, wired into your workflow',
      badRelay: 'Other relay',
      drop: 'Dropped',
      goodGateway: 'Jiufeng Gateway',
      steady: 'Stable stream',
      longOutput: 'Long output delivered intact',
      floatTwo: 'For the same long response, others retry; Jiufeng finishes in one flow',
      promptMask: '••••••••••• polish this…',
      privacyPills: ['No disk writes', 'No training', 'No sharing'],
      floatThree: 'Logs keep only billing summaries. Your prompts stay yours.',
      noApproval: 'NO APPROVAL · NO CARD',
      signup: 'Signup',
      firstCall: 'First call',
      floatFour: 'From signup to first token in under a minute',
      officialRate: 'Official rate ×1.0',
      floatFive: 'Every call has logs and can be traced to the original response',
      walletItems: ['Online payment', 'Redeem codes', 'Referral rewards'],
      recharged: 'Recharge complete',
      floatSix: 'Visible balance, top up anytime, no workflow delays',
      cards: [
        { index: '01', title: 'Multi-model access', sub: 'MULTI-MODEL', desc: 'Connect Claude / GPT / Gemini and other leading models through one OpenAI-compatible API instead of switching across platforms.' },
        { index: '02', title: 'Reliable by design', sub: 'RELIABILITY', desc: 'Redundant routes, regional failover, automatic recovery, uninterrupted SSE streams, and 99.9% availability for critical calls.' },
        { index: '03', title: 'Privacy first', sub: 'PRIVACY', desc: 'Request bodies are not persisted, never used for training, and never shared. TLS throughout; logs keep only necessary billing summaries.' },
        { index: '04', title: 'Instant access', sub: 'INSTANT ACCESS', desc: 'Register and use the API immediately. No approval, no card binding. Recharge once and manage credentials yourself.' },
        { index: '05', title: 'Transparent billing', sub: 'FAIR BILLING', desc: 'Billed by official token multipliers. Every call has usage logs, balance changes, and original responses for audit.' },
        { index: '06', title: 'Self-service top-up', sub: 'SELF-SERVICE', desc: 'Mainstream payments, visible balance, threshold reminders, redeem codes, and referral rewards all in one place.' },
      ],
    },
    onboard: {
      kicker: 'ONBOARD · ZERO-CODE SETUP',
      title: 'No code required.',
      copy: 'Copy one command from the console into your terminal. The script checks your environment, writes config, runs self-tests, and finishes the setup for you.',
      termbar: 'bash — Jiufeng AI · one-command setup',
      steps: [
        { num: '1', title: 'Copy command', desc: 'Open Console · API Keys · one-click deployment, then copy the command.' },
        { num: '2', title: 'Paste into terminal', desc: 'The script checks your environment, writes config, and runs self-tests.' },
        { num: '3', title: 'Start chatting', desc: 'Terminal, IDE, desktop client: connect once and use everywhere.' },
      ],
      terminal: [
        { kind: 'input' as TerminalLineKind, text: '$ curl -fsSL https://jiufeng.ai/d/****** | bash' },
        { kind: 'success' as TerminalLineKind, text: '✓ Environment detected - Node 22 · OpenClaw installed' },
        { kind: 'question' as TerminalLineKind, text: '? Paste API Key › sk-••••••••••••' },
        { kind: 'question' as TerminalLineKind, text: '? Primary model > claude-opus-4-7' },
        { kind: 'success' as TerminalLineKind, text: '✓ Config written to ~/.openClaw/openClaw.json' },
        { kind: 'success' as TerminalLineKind, text: '✓ Self-test passed - setup complete' },
        { kind: 'input' as TerminalLineKind, text: '$ openClaw "Introduce yourself"' },
        { kind: 'output' as TerminalLineKind, text: 'Hi, I am your local assistant connected through Jiufeng AI. Ready when you are.' },
      ],
    },
    pricing: {
      kicker: 'PRICING',
      title: 'Token-based billing. No monthly fees, no seats, fully auditable.',
      copy: 'No subscription fee, no minimum spend, and no unused bundled quota. Every call is settled by official token multipliers and visible in real time.',
      points: ['Balance never expires', 'No minimum recharge', 'Official-rate settlement', 'Line-by-line audit'],
      link: 'View models and pricing',
    },
    closing: {
      title: 'A thought begins · A model arrives',
    },
    footer: {
      tagline: 'Jiufeng · Think more freely',
    },
  },
} as const

const homeCopy = computed(() =>
  locale.value.toLowerCase().startsWith('zh') ? homeCopies.zh : homeCopies.en,
)
const introPhases = computed(() =>
  locale.value.toLowerCase().startsWith('zh')
    ? ['建立信号', '编排模型', '网关就绪']
    : ['ESTABLISHING SIGNAL', 'ORCHESTRATING MODELS', 'GATEWAY READY'],
)
const playFullIntro = ref(
  typeof window === 'undefined' || sessionStorage.getItem('jiufeng_home_intro_seen') !== '1',
)

const docUrl = computed(() => sanitizeUrl(appStore.cachedPublicSettings?.doc_url || appStore.docUrl || ''))
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')
const homeContentUrl = computed(() => {
  const content = homeContent.value.trim()
  if (!content.startsWith('http://') && !content.startsWith('https://')) return ''
  return sanitizeUrl(content)
})
const isHomeContentUrl = computed(() => homeContentUrl.value !== '')
const sanitizedHomeContent = computed(() => DOMPurify.sanitize(homeContent.value))

const isDark = ref(document.documentElement.classList.contains('dark'))
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const dashboardPath = computed(() => (isAdmin.value ? '/admin/dashboard' : '/dashboard'))
const entryPath = computed(() => (isAuthenticated.value ? dashboardPath.value : '/login'))
const terminalLines = ref<TerminalLine[]>([])
const currentTerminalText = ref('')
const currentTerminalKind = ref<TerminalLineKind>('input')
const terminalIsWaiting = ref(false)
const activeOnboardStep = ref('1')
let terminalRunId = 0
let terminalTimers: number[] = []
const imagePromptText = computed(() => homeCopy.value.image.prompt)
const typedImagePrompt = ref('')
const imageDemoRunning = ref(false)
const imageDemoRevealing = ref(false)
const imageDemoDone = ref(false)
const imageDemoProgressKey = ref(0)
const showImagePromptCaret = computed(() => !imageDemoDone.value && typedImagePrompt.value.length < imagePromptText.value.length)
let imageDemoRunId = 0
let imageDemoTimers: number[] = []

const worksOn = ['Claude Code', 'Codex CLI', 'Cline', 'Gemini CLI', 'Cursor', 'Continue'] as const
const stats = computed(() => homeCopy.value.promise.stats)
type StatViewItem = {
  value: string
  unit: string
  label: string
  display: string
}
const displayedStats = ref<StatViewItem[]>(
  stats.value.map((item) => ({ value: item.value, unit: item.unit, label: item.label, display: '0' })),
)
const statsRef = ref<HTMLElement | null>(null)
const statsVisible = ref(false)
let statsObserver: IntersectionObserver | null = null
let statsFrame = 0

const promiseCards = computed(() => homeCopy.value.promise.cards)
const whyCards = computed(() => homeCopy.value.why.cards)
type WhyIndex = '01' | '02' | '03' | '04' | '05' | '06'
const activeWhyIndex = ref<WhyIndex | ''>('')
const currentWhyCard = computed(() => whyCards.value.find((item) => item.index === activeWhyIndex.value) || null)
const whyPreviewStyle = computed(() => {
  const positionMap: Record<WhyIndex, number> = {
    '01': 14,
    '02': 112,
    '03': 216,
    '04': 322,
    '05': 426,
    '06': 532,
  }
  const top = activeWhyIndex.value ? positionMap[activeWhyIndex.value] : positionMap['01']
  return { '--sx-preview-y': `${top}px` }
})

function setWhyPreview(index: WhyIndex) {
  activeWhyIndex.value = index
}

function clearWhyPreview() {
  activeWhyIndex.value = ''
}

const steps = computed(() => homeCopy.value.onboard.steps)
const pricingPoints = computed(() => homeCopy.value.pricing.points)

function terminalScript(): TerminalLine[] {
  return homeCopy.value.onboard.terminal.map((line) => ({ ...line }))
}

function clearTerminalTimers() {
  terminalTimers.forEach((timer) => window.clearTimeout(timer))
  terminalTimers = []
}

function clearImageDemoTimers() {
  imageDemoTimers.forEach((timer) => window.clearTimeout(timer))
  imageDemoTimers = []
}

function terminalDelay(ms: number) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(() => {
      terminalTimers = terminalTimers.filter((item) => item !== timer)
      resolve()
    }, ms)
    terminalTimers.push(timer)
  })
}

function imageDemoDelay(ms: number) {
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(() => {
      imageDemoTimers = imageDemoTimers.filter((item) => item !== timer)
      resolve()
    }, ms)
    imageDemoTimers.push(timer)
  })
}

function showStaticImageDemo() {
  imageDemoRunId += 1
  clearImageDemoTimers()
  typedImagePrompt.value = imagePromptText.value
  imageDemoRunning.value = false
  imageDemoRevealing.value = false
  imageDemoDone.value = true
}

async function runImageDemo() {
  const runId = ++imageDemoRunId
  clearImageDemoTimers()
  typedImagePrompt.value = ''
  imageDemoRunning.value = false
  imageDemoRevealing.value = false
  imageDemoDone.value = false

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showStaticImageDemo()
    return
  }

  await imageDemoDelay(360)
  for (const char of imagePromptText.value) {
    if (runId !== imageDemoRunId) return
    typedImagePrompt.value += char
    await imageDemoDelay(char === ',' ? 180 : 54 + Math.random() * 30)
  }

  await imageDemoDelay(260)
  if (runId !== imageDemoRunId) return
  imageDemoRunning.value = true
  imageDemoProgressKey.value += 1

  await imageDemoDelay(2800)
  if (runId !== imageDemoRunId) return
  imageDemoRunning.value = false
  imageDemoRevealing.value = true

  await imageDemoDelay(720)
  if (runId !== imageDemoRunId) return
  imageDemoRevealing.value = false
  imageDemoDone.value = true

  await imageDemoDelay(2600)
  if (runId === imageDemoRunId) runImageDemo()
}

function showStaticTerminal() {
  terminalRunId += 1
  clearTerminalTimers()
  currentTerminalText.value = ''
  currentTerminalKind.value = 'input'
  terminalIsWaiting.value = false
  activeOnboardStep.value = '3'
  terminalLines.value = terminalScript()
}

async function typeTerminalLine(line: TerminalLine, runId: number, speed = 22) {
  currentTerminalText.value = ''
  currentTerminalKind.value = line.kind
  terminalIsWaiting.value = false
  for (const char of line.text) {
    if (runId !== terminalRunId) return false
    currentTerminalText.value += char
    await terminalDelay(char === ' ' ? speed * .55 : speed + Math.random() * 18)
  }
  if (runId !== terminalRunId) return false
  terminalLines.value.push(line)
  currentTerminalText.value = ''
  terminalIsWaiting.value = true
  return true
}

async function runTerminalDemo() {
  const runId = ++terminalRunId
  clearTerminalTimers()
  terminalLines.value = []
  currentTerminalText.value = ''
  terminalIsWaiting.value = true
  activeOnboardStep.value = '1'

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showStaticTerminal()
    return
  }

  await terminalDelay(520)
  const script = terminalScript()

  for (const [index, line] of script.entries()) {
    if (runId !== terminalRunId) return
    if (index >= 2 && index < 6) activeOnboardStep.value = '2'
    if (index >= 6) activeOnboardStep.value = '3'
    if (line.kind === 'input' || line.kind === 'question') {
      const typed = await typeTerminalLine(line, runId, line.kind === 'input' ? 18 : 15)
      if (!typed) return
      await terminalDelay(line.kind === 'input' ? 280 : 180)
    } else {
      terminalIsWaiting.value = false
      await terminalDelay(line.kind === 'output' ? 360 : 300)
      if (runId !== terminalRunId) return
      terminalLines.value.push(line)
      terminalIsWaiting.value = true
    }
  }

  await terminalDelay(2600)
  if (runId === terminalRunId) runTerminalDemo()
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
}

function animateStats() {
  if (statsFrame) window.cancelAnimationFrame(statsFrame)
  const sourceStats = stats.value
  const values = sourceStats.map((item) => ({
    value: Number(item.value.replace(/,/g, '')),
    unit: item.unit,
    label: item.label,
  }))

  const start = performance.now()
  const duration = 1800
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const tick = (now: number) => {
    const progress = reduceMotion ? 1 : Math.min(1, (now - start) / duration)
  displayedStats.value = values.map((item, index) => {
      const current = Math.round(item.value * (0.12 + progress * 0.88))
      return {
        value: sourceStats[index].value,
        unit: item.unit,
        label: item.label,
        display: current.toLocaleString('en-US'),
      }
    })
    if (progress < 1) {
      statsFrame = window.requestAnimationFrame(tick)
    } else {
      statsFrame = 0
    }
  }

  displayedStats.value = values.map((item) => ({
    value: item.value.toLocaleString('en-US'),
    unit: item.unit,
    label: item.label,
    display: '0',
  }))
  statsFrame = window.requestAnimationFrame(tick)
}

function observeStats() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    statsVisible.value = true
    animateStats()
    return
  }

  const target = statsRef.value
  if (!target) return
  statsObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      statsVisible.value = true
      statsObserver?.disconnect()
      statsObserver = null
      animateStats()
    }
  }, {
    rootMargin: '0px 0px -14% 0px',
    threshold: 0.18,
  })
  statsObserver.observe(target)
}

type ModelIconPath = {
  d: string
  clipRule?: string
}

type ModelIcon = {
  viewBox: string
  paths: readonly ModelIconPath[]
}

type ModelIconKey = 'openai' | 'claude' | 'gemini' | 'grok' | 'meta' | 'deepseek' | 'mistral' | 'qwen'

const modelIcons: Record<ModelIconKey, ModelIcon> = {
  openai: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M21.55 10.004a5.416 5.416 0 00-.478-4.501c-1.217-2.09-3.662-3.166-6.05-2.66A5.59 5.59 0 0010.831 1C8.39.995 6.224 2.546 5.473 4.838A5.553 5.553 0 001.76 7.496a5.487 5.487 0 00.691 6.5 5.416 5.416 0 00.477 4.502c1.217 2.09 3.662 3.165 6.05 2.66A5.586 5.586 0 0013.168 23c2.443.006 4.61-1.546 5.361-3.84a5.553 5.553 0 003.715-2.66 5.488 5.488 0 00-.693-6.497v.001zm-8.381 11.558a4.199 4.199 0 01-2.675-.954c.034-.018.093-.05.132-.074l4.44-2.53a.71.71 0 00.364-.623v-6.176l1.877 1.069c.02.01.033.029.036.05v5.115c-.003 2.274-1.87 4.118-4.174 4.123zM4.192 17.78a4.059 4.059 0 01-.498-2.763c.032.02.09.055.131.078l4.44 2.53c.225.13.504.13.73 0l5.42-3.088v2.138a.068.068 0 01-.027.057L9.9 19.288c-1.999 1.136-4.552.46-5.707-1.51h-.001zM3.023 8.216A4.15 4.15 0 015.198 6.41l-.002.151v5.06a.711.711 0 00.364.624l5.42 3.087-1.876 1.07a.067.067 0 01-.063.005l-4.489-2.559c-1.995-1.14-2.679-3.658-1.53-5.63h.001zm15.417 3.54l-5.42-3.088L14.896 7.6a.067.067 0 01.063-.006l4.489 2.557c1.998 1.14 2.683 3.662 1.529 5.633a4.163 4.163 0 01-2.174 1.807V12.38a.71.71 0 00-.363-.623zm1.867-2.773a6.04 6.04 0 00-.132-.078l-4.44-2.53a.731.731 0 00-.729 0l-5.42 3.088V7.325a.068.068 0 01.027-.057L14.1 4.713c2-1.137 4.555-.46 5.707 1.513.487.833.664 1.809.499 2.757h.001zm-11.741 3.81l-1.877-1.068a.065.065 0 01-.036-.051V6.559c.001-2.277 1.873-4.122 4.181-4.12.976 0 1.92.338 2.671.954-.034.018-.092.05-.131.073l-4.44 2.53a.71.71 0 00-.365.623l-.003 6.173v.002zm1.02-2.168L12 9.25l2.414 1.375v2.75L12 14.75l-2.415-1.375v-2.75z' },
    ],
  },
  claude: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z' },
    ],
  },
  gemini: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z' },
    ],
  },
  grok: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815' },
    ],
  },
  meta: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M6.897 4c1.915 0 3.516.932 5.43 3.376l.282-.373c.19-.246.383-.484.58-.71l.313-.35C14.588 4.788 15.792 4 17.225 4c1.273 0 2.469.557 3.491 1.516l.218.213c1.73 1.765 2.917 4.71 3.053 8.026l.011.392.002.25c0 1.501-.28 2.759-.818 3.7l-.14.23-.108.153c-.301.42-.664.758-1.086 1.009l-.265.142-.087.04a3.493 3.493 0 01-.302.118 4.117 4.117 0 01-1.33.208c-.524 0-.996-.067-1.438-.215-.614-.204-1.163-.56-1.726-1.116l-.227-.235c-.753-.812-1.534-1.976-2.493-3.586l-1.43-2.41-.544-.895-1.766 3.13-.343.592C7.597 19.156 6.227 20 4.356 20c-1.21 0-2.205-.42-2.936-1.182l-.168-.184c-.484-.573-.837-1.311-1.043-2.189l-.067-.32a8.69 8.69 0 01-.136-1.288L0 14.468c.002-.745.06-1.49.174-2.23l.1-.573c.298-1.53.828-2.958 1.536-4.157l.209-.34c1.177-1.83 2.789-3.053 4.615-3.16L6.897 4zm-.033 2.615l-.201.01c-.83.083-1.606.673-2.252 1.577l-.138.199-.01.018c-.67 1.017-1.185 2.378-1.456 3.845l-.004.022a12.591 12.591 0 00-.207 2.254l.002.188c.004.18.017.36.04.54l.043.291c.092.503.257.908.486 1.208l.117.137c.303.323.698.492 1.17.492 1.1 0 1.796-.676 3.696-3.641l2.175-3.4.454-.701-.139-.198C9.11 7.3 8.084 6.616 6.864 6.616zm10.196-.552l-.176.007c-.635.048-1.223.359-1.82.933l-.196.198c-.439.462-.887 1.064-1.367 1.807l.266.398c.18.274.362.56.55.858l.293.475 1.396 2.335.695 1.114c.583.926 1.03 1.6 1.408 2.082l.213.262c.282.326.529.54.777.673l.102.05c.227.1.457.138.718.138.176.002.35-.023.518-.073.338-.104.61-.32.813-.637l.095-.163.077-.162c.194-.459.29-1.06.29-1.785l-.006-.449c-.08-2.871-.938-5.372-2.2-6.798l-.176-.189c-.67-.683-1.444-1.074-2.27-1.074z' },
    ],
  },
  deepseek: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.86.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.96-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.14.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z' },
    ],
  },
  mistral: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M3.428 3.4h3.429v3.428h3.429v3.429h-.002 3.431V6.828h3.427V3.4h3.43v13.714H24v3.429H13.714v-3.428h-3.428v-3.429h-3.43v3.428h3.43v3.429H0v-3.429h3.428V3.4zm10.286 13.715h3.428v-3.429h-3.427v3.429z', clipRule: 'evenodd' },
    ],
  },
  qwen: {
    viewBox: '0 0 24 24',
    paths: [
      { d: 'M12.604 1.34c.393.69.784 1.382 1.174 2.075a.18.18 0 00.157.091h5.552c.174 0 .322.11.446.327l1.454 2.57c.19.337.24.478.024.837-.26.43-.513.864-.76 1.3l-.367.658c-.106.196-.223.28-.04.512l2.652 4.637c.172.301.111.494-.043.77-.437.785-.882 1.564-1.335 2.34-.159.272-.352.375-.68.37-.777-.016-1.552-.01-2.327.016a.099.099 0 00-.081.05 575.097 575.097 0 01-2.705 4.74c-.169.293-.38.363-.725.364-.997.003-2.002.004-3.017.002a.537.537 0 01-.465-.271l-1.335-2.323a.09.09 0 00-.083-.049H4.982c-.285.03-.553-.001-.805-.092l-1.603-2.77a.543.543 0 01-.002-.54l1.207-2.12a.198.198 0 000-.197 550.951 550.951 0 01-1.875-3.272l-.79-1.395c-.16-.31-.173-.496.095-.965.465-.813.927-1.625 1.387-2.436.132-.234.304-.334.584-.335a338.3 338.3 0 012.589-.001.124.124 0 00.107-.063l2.806-4.895a.488.488 0 01.422-.246c.524-.001 1.053 0 1.583-.006L11.704 1c.341-.003.724.032.9.34zm-3.432.403a.06.06 0 00-.052.03L6.254 6.788a.157.157 0 01-.135.078H3.253c-.056 0-.07.025-.041.074l5.81 10.156c.025.042.013.062-.034.063l-2.795.015a.218.218 0 00-.2.116l-1.32 2.31c-.044.078-.021.118.068.118l5.716.008c.046 0 .08.02.104.061l1.403 2.454c.046.081.092.082.139 0l5.006-8.76.783-1.382a.055.055 0 01.096 0l1.424 2.53a.122.122 0 00.107.062l2.763-.02a.04.04 0 00.035-.02.041.041 0 000-.04l-2.9-5.086a.108.108 0 010-.113l.293-.507 1.12-1.977c.024-.041.012-.062-.035-.062H9.2c-.059 0-.073-.026-.043-.077l1.434-2.505a.107.107 0 000-.114L9.225 1.774a.06.06 0 00-.053-.031zm6.29 8.02c.046 0 .058.02.034.06l-.832 1.465-2.613 4.585a.056.056 0 01-.05.029.058.058 0 01-.05-.029L8.498 9.841c-.02-.034-.01-.052.028-.054l.216-.012 6.722-.012z' },
    ],
  },
}

const ParticleSphere = defineComponent({
  name: 'ParticleSphere',
  props: {
    showLabels: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const sphereRef = ref<HTMLDivElement | null>(null)
    const canvasRef = ref<HTMLCanvasElement | null>(null)
    type ModelLabel = {
      name: string
      icon: ModelIconKey
      x: number
      y: number
      scale: number
      delay: number
    }
    const modelLabels: ModelLabel[] = [
      { name: 'GPT', icon: 'openai', x: 88, y: 72, scale: 1.06, delay: 0 },
      { name: 'CLAUDE', icon: 'claude', x: 81, y: 31, scale: 1, delay: 0.04 },
      { name: 'GEMINI', icon: 'gemini', x: 86, y: 47, scale: 1.02, delay: 0.08 },
      { name: 'GROK', icon: 'grok', x: 50, y: 56, scale: 1, delay: 0.12 },
      { name: 'LLAMA', icon: 'meta', x: 33, y: 24, scale: 1.04, delay: 0.16 },
      { name: 'DEEPSEEK', icon: 'deepseek', x: 18, y: 40, scale: 0.82, delay: 0.2 },
      { name: 'MISTRAL', icon: 'mistral', x: 13, y: 64, scale: 0.92, delay: 0.24 },
      { name: 'QWEN', icon: 'qwen', x: 43, y: 85, scale: 0.82, delay: 0.28 },
    ]

    function renderModelIcon(item: ModelLabel) {
      const icon = modelIcons[item.icon]
      return h('svg', {
        class: 'sx-model-icon',
        fill: 'currentColor',
        fillRule: 'evenodd',
        viewBox: icon.viewBox,
        xmlns: 'http://www.w3.org/2000/svg',
        'aria-hidden': 'true',
      }, icon.paths.map((path) => h('path', {
        d: path.d,
        fillRule: 'evenodd',
        clipRule: path.clipRule,
      })))
    }

    function resolveModelLabelLayout(items: readonly ModelLabel[]) {
      const nodes = items.map((item) => ({ ...item }))
      const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
      const centerX = 50
      const centerY = 50
      const safeRadius = 34.2
      const boxFor = (item: ModelLabel) => {
        const width = 22 + item.name.length * 1.25
        const height = 24
        return { width, height }
      }

      for (let pass = 0; pass < 7; pass += 1) {
        for (let i = 0; i < nodes.length; i += 1) {
          for (let j = i + 1; j < nodes.length; j += 1) {
            const a = nodes[i]
            const b = nodes[j]
            const boxA = boxFor(a)
            const boxB = boxFor(b)
            const dx = b.x - a.x
            const dy = b.y - a.y
            const minDx = boxA.width / 2 + boxB.width / 2 + 4
            const minDy = boxA.height / 2 + boxB.height / 2 + 5
            const ox = minDx - Math.abs(dx)
            const oy = minDy - Math.abs(dy)
            if (ox > 0 && oy > 0) {
              if (ox > oy) {
                const shift = oy * 0.58
                const dir = dy === 0 ? (i % 2 === 0 ? -1 : 1) : Math.sign(dy)
                a.y -= shift * dir
                b.y += shift * dir
              } else {
                const shift = ox * 0.58
                const dir = dx === 0 ? (i % 2 === 0 ? -1 : 1) : Math.sign(dx)
                a.x -= shift * dir
                b.x += shift * dir
              }
            }
          }
        }

        for (const node of nodes) {
          const dx = node.x - centerX
          const dy = node.y - centerY
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const localSafeRadius = safeRadius - Math.min(4.5, node.name.length * 0.28)
          if (dist > localSafeRadius) {
            const scale = localSafeRadius / dist
            node.x = centerX + dx * scale
            node.y = centerY + dy * scale
          }
          node.x = clamp(node.x, 10, 90)
          node.y = clamp(node.y, 12, 88)
        }
      }

      return nodes
    }
    const balancedModelLabels = resolveModelLabelLayout(modelLabels)
    let raf = 0
    let targetYaw = 0
    let targetPitch = 0
    let currentYaw = 0
    let currentPitch = 0
    let isDragging = false
    let activePointerId: number | null = null
    let dragStartX = 0
    let dragStartY = 0
    let dragStartYaw = 0
    let dragStartPitch = 0
    let lastPointerClientX = 0
    let lastPointerClientY = 0
    let pointerX = 0.5
    let pointerY = 0.5
    let targetPointerForce = 0
    let currentPointerForce = 0
    let introScale = 1
    let introGlow = 0
    let introPhase = 0
    let introHoldUntil = 0
    let introPeakUntil = 0
    let introShrinkUntil = 0
    let introStartTime = 0

    function clamp01(value: number) {
      return Math.max(0, Math.min(1, value))
    }

    function easeOutCubic(value: number) {
      const t = clamp01(value)
      return 1 - (1 - t) ** 3
    }

    function easeInOutCubic(value: number) {
      const t = clamp01(value)
      return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2
    }

    function pseudoUnit(index: number, salt: number) {
      return Math.abs(Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453) % 1
    }

    function getIntroStartPoint(index: number, width: number, height: number) {
      const cx = width / 2
      const cy = height / 2
      const minSide = Math.min(width, height)
      const goldenAngle = Math.PI * (3 - Math.sqrt(5))
      const angle = index * goldenAngle + (pseudoUnit(index, 0.17) - 0.5) * 0.42
      const radius = minSide * (0.36 + pseudoUnit(index, 0.41) * 0.14)
      const tangent = (pseudoUnit(index, 0.83) - 0.5) * minSide * 0.09
      return {
        x: cx + Math.cos(angle) * radius + Math.cos(angle + Math.PI / 2) * tangent,
        y: cy + Math.sin(angle) * radius + Math.sin(angle + Math.PI / 2) * tangent,
      }
    }

    function resetPointer() {
      if (isDragging) return
      targetPointerForce = 0
    }

    function getPointerState(clientX: number, clientY: number) {
      const canvas = canvasRef.value
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const width = rect.width || 1
      const height = rect.height || 1
      const x = (clientX - rect.left) / rect.width
      const y = (clientY - rect.top) / rect.height
      const dx = x - 0.5
      const dy = y - 0.5
      const distance = Math.sqrt(dx * dx + dy * dy)
      return { x, y, dx, dy, distance, width, height }
    }

    function syncHoverPressure(clientX: number, clientY: number) {
      const pointer = getPointerState(clientX, clientY)
      if (!pointer) return
      const isInsideSphere = pointer.distance <= 0.5
      if (!isInsideSphere) {
        resetPointer()
        return
      }
      pointerX = pointer.x
      pointerY = pointer.y
      targetPointerForce = 0.58
    }

    function syncOutsideRotation(clientX: number, clientY: number) {
      if (isDragging || introPhase < 2) return
      const pointer = getPointerState(clientX, clientY)
      if (!pointer) return
      const isInsideSphere = pointer.distance <= 0.5
      if (isInsideSphere) {
        syncHoverPressure(clientX, clientY)
        return
      }
      targetPointerForce = 0
      const yawOffset = Math.max(-1, Math.min(1, pointer.dx * 1.9))
      const pitchOffset = Math.max(-0.72, Math.min(0.72, -pointer.dy * 1.45))
      targetYaw = yawOffset
      targetPitch = pitchOffset
    }

    function stopDragging() {
      isDragging = false
      activePointerId = null
      syncHoverPressure(lastPointerClientX, lastPointerClientY)
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.button !== 0 || !event.isPrimary) return
      if (event.target instanceof Element && event.target.closest('a,button,input,textarea,select,label,[role="button"]')) return
      const canvas = canvasRef.value
      if (!canvas) return
      isDragging = true
      activePointerId = event.pointerId
      dragStartX = event.clientX
      dragStartY = event.clientY
      dragStartYaw = currentYaw
      dragStartPitch = currentPitch
      lastPointerClientX = event.clientX
      lastPointerClientY = event.clientY
      targetPointerForce = 0.18
      handlePointerMove(event)
    }

    function handlePointerMove(event: PointerEvent) {
      const canvas = canvasRef.value
      if (!canvas) return
      lastPointerClientX = event.clientX
      lastPointerClientY = event.clientY
      if (isDragging && activePointerId === event.pointerId) {
        const dx = event.clientX - dragStartX
        const dy = event.clientY - dragStartY
        targetYaw = dragStartYaw + dx * 0.012
        targetPitch = dragStartPitch - dy * 0.009
        targetPointerForce = 0.18
        return
      }
      syncOutsideRotation(event.clientX, event.clientY)
    }

    function updateIntroPhase(time: number) {
      if (introPhase === 0 && time >= introHoldUntil) introPhase = 1
      if (introPhase === 1 && time >= introPeakUntil) {
        introPhase = 2
        targetPointerForce = 0
        targetYaw = currentYaw
        targetPitch = currentPitch
      }
      if (introPhase === 2 && time >= introShrinkUntil) {
        introPhase = 3
      }
    }

    function draw(time = 0) {
      const canvas = canvasRef.value
      const ctx = canvas?.getContext('2d')
      if (!canvas || !ctx) return
      updateIntroPhase(time)

      const width = canvas.clientWidth || 720
      const height = canvas.clientHeight || 440
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
        canvas.width = Math.round(width * dpr)
        canvas.height = Math.round(height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)

      const cx = width / 2
      const cy = height / 2
      const baseRadius = Math.min(width, height) * 0.49
      const elapsed = introStartTime ? Math.max(0, time - introStartTime) : 0
      const gatherProgress = easeInOutCubic((elapsed - 260) / 1500)
      const settleProgress = easeOutCubic((elapsed - 1450) / 760)
      const expandProgress = easeInOutCubic((elapsed - 2250) / 1180)
      const labelProgress = easeOutCubic((elapsed - 3050) / 620)
      const exitProgress = easeInOutCubic((elapsed - 4950) / 700)
      const smallScale = 0.58
      const introScaleTarget = props.showLabels
        ? smallScale + (1 - smallScale) * expandProgress
        : 1
      introScale += (introScaleTarget - introScale) * 0.18
      const radius = baseRadius * introScale
      const sceneAlpha = props.showLabels ? 1 - exitProgress : 1
      introGlow += ((props.showLabels ? labelProgress : introPhase >= 1 ? 1 : 0) - introGlow) * 0.08
      currentYaw += (targetYaw - currentYaw) * 0.22
      currentPitch += (targetPitch - currentPitch) * 0.18
      currentPointerForce += (targetPointerForce - currentPointerForce) * 0.2
      const yawSpeed = props.showLabels
        ? 0.00008 + expandProgress * 0.00022 + exitProgress * 0.00115
        : introPhase === 2 ? 0.00024 : 0.00008
      const yaw = time * yawSpeed + currentYaw + exitProgress * 0.85
      const pitch = currentPitch
      const cosX = Math.cos(pitch)
      const sinX = Math.sin(pitch)
      const px = pointerX * width
      const py = pointerY * height
      const hoverRadius = Math.max(radius * 0.72, 58)

      ctx.save()
      ctx.globalAlpha = sceneAlpha
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      const bubbleGrad = ctx.createRadialGradient(
        cx - radius * 0.28,
        cy - radius * 0.32,
        radius * 0.08,
        cx,
        cy,
        radius,
      )
      bubbleGrad.addColorStop(0, `rgba(255,255,255,${0.28 - introGlow * 0.06})`)
      bubbleGrad.addColorStop(0.38, `rgba(248,248,248,${0.12 - introGlow * 0.02})`)
      bubbleGrad.addColorStop(0.72, `rgba(236,236,236,${0.05 + introGlow * 0.01})`)
      bubbleGrad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = bubbleGrad
      ctx.fill()
      const sheenGrad = ctx.createLinearGradient(
        cx - radius * 0.85,
        cy - radius * 0.95,
        cx + radius * 0.78,
        cy + radius * 0.72,
      )
      sheenGrad.addColorStop(0, `rgba(255,255,255,${0.18 + introGlow * 0.04})`)
      sheenGrad.addColorStop(0.3, `rgba(255,255,255,${0.08 + introGlow * 0.02})`)
      sheenGrad.addColorStop(0.64, 'rgba(255,255,255,0)')
      sheenGrad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = sheenGrad
      ctx.fill()
      if (!props.showLabels || settleProgress > 0.8) {
        ctx.clip()
      }

      const reveal = props.showLabels ? Math.min(1, 0.32 + gatherProgress * 0.68) * sceneAlpha : 1 - (1 - Math.min(1, elapsed / 1200)) ** 3
      const calmDrift = Math.sin(time * 0.00028) * 0.035
      const sphereRadius = radius * 1.03
      const dotRadius = Math.max(1.15, radius * (props.showLabels ? 0.0048 : 0.0041))

      function projectSpherePoint(baseX: number, baseY: number, baseZ: number) {
        const localYaw = yaw + calmDrift
        const localCosY = Math.cos(localYaw)
        const localSinY = Math.sin(localYaw)
        const xY = baseX * localCosY + baseZ * localSinY
        const zY = -baseX * localSinY + baseZ * localCosY
        const yX = baseY * cosX - zY * sinX
        const zX = baseY * sinX + zY * cosX
        const depth = (zX + 1) / 2
        const perspective = 0.95 + depth * 0.055
        return {
          x: cx + xY * sphereRadius * perspective,
          y: cy + yX * sphereRadius * perspective,
          depth,
        }
      }

      function strokeSphereCurve(points: Array<[number, number, number]>, alphaScale = 1) {
        const drawCtx = ctx
        if (!drawCtx) return
        drawCtx.beginPath()
        let started = false
        for (const [baseX, baseY, baseZ] of points) {
          const point = projectSpherePoint(baseX, baseY, baseZ)
          if (!started) {
            drawCtx.moveTo(point.x, point.y)
            started = true
          } else {
            drawCtx.lineTo(point.x, point.y)
          }
        }
        const lineReveal = props.showLabels ? labelProgress * sceneAlpha : reveal
        drawCtx.globalAlpha = lineReveal * alphaScale
        drawCtx.strokeStyle = props.showLabels ? 'rgba(18, 18, 18, .25)' : 'rgba(22, 22, 22, .18)'
        drawCtx.lineWidth = Math.max(0.7, radius * 0.0012)
        drawCtx.stroke()
      }

      if (props.showLabels && labelProgress > 0.01) {
        const segments = 120
        for (const latitude of [-0.72, -0.42, -0.16, 0.16, 0.42, 0.72]) {
          const ring = Math.sqrt(Math.max(0, 1 - latitude * latitude))
          const points: Array<[number, number, number]> = []
          for (let i = 0; i <= segments; i += 1) {
            const angle = (i / segments) * Math.PI * 2
            points.push([Math.cos(angle) * ring, latitude, Math.sin(angle) * ring])
          }
          strokeSphereCurve(points, 0.62)
        }
        for (let meridian = 0; meridian < 8; meridian += 1) {
          const angle = (meridian / 8) * Math.PI
          const cos = Math.cos(angle)
          const sin = Math.sin(angle)
          const points: Array<[number, number, number]> = []
          for (let i = 0; i <= segments; i += 1) {
            const phi = -Math.PI / 2 + (i / segments) * Math.PI
            const ring = Math.cos(phi)
            points.push([ring * cos, Math.sin(phi), ring * sin])
          }
          strokeSphereCurve(points, meridian === 0 ? 0.8 : 0.48)
        }
      }

      type GlobePoint = ReturnType<typeof projectSpherePoint>

      const dots: Array<GlobePoint & { index: number }> = []
      const dotCount = props.showLabels ? 1450 : 1150
      const goldenAngle = Math.PI * (3 - Math.sqrt(5))
      for (let i = 0; i < dotCount; i += 1) {
        const baseY = 1 - (i / (dotCount - 1)) * 2
        const ring = Math.sqrt(Math.max(0, 1 - baseY * baseY))
        const theta = i * goldenAngle
        const projected = projectSpherePoint(Math.cos(theta) * ring, baseY, Math.sin(theta) * ring)
        const start = props.showLabels ? getIntroStartPoint(i, width, height) : projected
        const cloudX = projected.x
        const cloudY = projected.y
        const settleWave = Math.max(0, Math.min(1, settleProgress + (pseudoUnit(i, 0.73) - 0.5) * 0.12))
        const startDx = start.x - cx
        const startDy = start.y - cy
        const startAngle = Math.atan2(startDy, startDx)
        const startRadius = Math.sqrt(startDx * startDx + startDy * startDy)
        const targetDx = cloudX - cx
        const targetDy = cloudY - cy
        const targetAngle = Math.atan2(targetDy, targetDx)
        const targetRadius = Math.sqrt(targetDx * targetDx + targetDy * targetDy)
        let angleDelta = targetAngle - startAngle
        if (angleDelta > Math.PI) angleDelta -= Math.PI * 2
        if (angleDelta < -Math.PI) angleDelta += Math.PI * 2
        const fanDirection = pseudoUnit(i, 0.58) > 0.5 ? 1 : -1
        const fanTurns = fanDirection * (Math.PI * (0.9 + pseudoUnit(i, 0.64) * 0.95))
        const spiralT = gatherProgress
        const spiralAngle = startAngle + angleDelta * spiralT + fanTurns * (1 - spiralT) * spiralT
        const spiralRadius = startRadius + (targetRadius - startRadius) * spiralT
        const x = cx + Math.cos(spiralAngle) * spiralRadius
        const y = cy + Math.sin(spiralAngle) * spiralRadius
        const jitter = props.showLabels ? (1 - settleWave) * 15 : 0
        dots.push({
          ...projected,
          x: x + (pseudoUnit(i, 0.91) - 0.5) * jitter,
          y: y + (pseudoUnit(i, 0.37) - 0.5) * jitter,
          index: i,
        })
      }
      dots.sort((a, b) => a.depth - b.depth)

      for (const point of dots) {
        let x = point.x
        let y = point.y
        const dx = x - px
        const dy = y - py
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const influence = currentPointerForce * Math.max(0, 1 - dist / hoverRadius) ** 1.35
        if (influence > 0.001) {
          const angle = time * 0.0012 + point.index * 0.017
          const push = influence * (12 + point.depth * 6)
          const swirl = influence * Math.cos(angle + dist * 0.018) * 1.5
          x += (dx / dist) * push + (-dy / dist) * swirl
          y += (dy / dist) * push + (dx / dist) * swirl
        }
        ctx.globalAlpha = reveal * Math.min(props.showLabels ? 0.92 : 0.95, (props.showLabels ? 0.5 : 0.38) + Math.pow(point.depth, 1.22) * 0.42 + influence * 0.22)
        ctx.fillStyle = props.showLabels ? 'rgba(72, 76, 82, 1)' : 'rgba(72, 76, 82, .96)'
        ctx.beginPath()
        ctx.arc(x, y, dotRadius * (0.86 + point.depth * 0.38) + influence * 1.9, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()

      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }

    onMounted(() => {
      window.addEventListener('pointerdown', handlePointerDown, { passive: true })
      window.addEventListener('pointermove', handlePointerMove, { passive: true })
      window.addEventListener('pointerup', stopDragging)
      window.addEventListener('pointercancel', stopDragging)
      introPhase = 0
      introStartTime = performance.now()
      introHoldUntil = performance.now() + 760
      introPeakUntil = introHoldUntil + 1180
      introShrinkUntil = introPeakUntil + 1760
      raf = requestAnimationFrame(draw)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
      cancelAnimationFrame(raf)
    })
    return () => h('div', { ref: sphereRef, class: 'sx-particle-sphere' }, [
      h('canvas', { ref: canvasRef }),
      props.showLabels
        ? h('div', { class: 'sx-model-cloud', 'aria-hidden': 'true' }, balancedModelLabels.map((item) => h('span', {
          key: item.name,
          style: {
            '--sx-model-x': `${item.x}%`,
            '--sx-model-y': `${item.y}%`,
            '--sx-model-scale': item.scale,
            '--sx-model-delay': `${item.delay}s`,
          },
        }, [
          h('b', [renderModelIcon(item)]),
          h('em', item.name),
        ])))
        : null,
    ])
  },
})

onMounted(() => {
  if (playFullIntro.value) sessionStorage.setItem('jiufeng_home_intro_seen', '1')
  initTheme()
  authStore.checkAuth()
  if (!appStore.publicSettingsLoaded) appStore.fetchPublicSettings()
  runTerminalDemo()
  runImageDemo()
  observeStats()
})

watch(
  () => locale.value,
  () => {
    activeWhyIndex.value = ''
    displayedStats.value = stats.value.map((item) => ({
      value: item.value,
      unit: item.unit,
      label: item.label,
      display: statsVisible.value ? item.value : '0',
    }))
    if (statsVisible.value) animateStats()
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showStaticImageDemo()
      showStaticTerminal()
    } else {
      runImageDemo()
      runTerminalDemo()
    }
  },
)

onBeforeUnmount(() => {
  terminalRunId += 1
  imageDemoRunId += 1
  clearTerminalTimers()
  clearImageDemoTimers()
  statsObserver?.disconnect()
  statsObserver = null
  if (statsFrame) window.cancelAnimationFrame(statsFrame)
  statsFrame = 0
})
</script>

<style scoped>
.sx-home {
  --sx-bg: #fff;
  --sx-ink: #0a0a0a;
  --sx-muted: #595959;
  --sx-soft: #9a9a9a;
  --sx-line: #e5e2dc;
  --sx-serif: "Noto Serif SC", "Songti SC", "Source Han Serif SC", "STSong", serif;
  --sx-mono: "JetBrains Mono", "IBM Plex Mono", "SF Mono", Consolas, monospace;
  min-height: 100vh;
  background: var(--sx-bg);
  color: var(--sx-ink);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.sx-home *,
.sx-home *::before,
.sx-home *::after {
  box-sizing: border-box;
}

.sx-container {
  width: min(100% - 96px, 1120px);
  margin: 0 auto;
}

.sx-narrow {
  width: min(100% - 96px, 790px);
}

.sx-header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 40;
  background: rgba(255, 255, 255, 0.82);
  backdrop-filter: blur(18px);
  opacity: 0;
  animation: sxPageReveal .82s ease 5.15s both;
}

.sx-header-row {
  height: 86px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
}

.sx-brand,
.sx-nav,
.sx-actions {
  display: flex;
  align-items: center;
}

.sx-brand {
  min-width: 132px;
  gap: 13px;
  color: var(--sx-ink);
  text-decoration: none;
}

.sx-logo-mark {
  font-family: var(--sx-serif);
  font-size: 32px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0;
}

.sx-logo-name {
  font-family: var(--sx-serif);
  font-size: 18px;
  font-weight: 800;
}

.sx-nav {
  margin-right: auto;
  gap: 34px;
}

.sx-nav a,
.sx-login {
  color: #333;
  font-size: 14px;
  text-decoration: none;
  transition: opacity .2s ease;
}

.sx-nav a:hover,
.sx-login:hover {
  opacity: .55;
}

.sx-actions {
  gap: 22px;
}

.sx-actions :deep(button),
.sx-actions :deep(.locale-switcher),
.sx-actions :deep(.relative) {
  color: var(--sx-ink);
  font-size: 13px;
}

.sx-actions :deep(.relative > button) {
  color: #111;
  background: #fff;
  font-weight: 400;
}

.sx-actions :deep(.relative > button:hover) {
  background: #f6f6f6;
}

.sx-actions :deep(.absolute) {
  border-color: #e5e5e5;
  background: #fff;
  box-shadow: 0 14px 30px rgba(15, 23, 42, .12);
}

.sx-actions :deep(.absolute button) {
  color: #111;
  background: #fff;
  font-weight: 400;
}

.sx-actions :deep(.absolute button:hover),
.sx-actions :deep(.absolute button.bg-primary-50) {
  color: #111;
  background: #f4f4f4;
}

.sx-register,
.sx-login {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.sx-register {
  display: inline-flex;
  min-width: 64px;
  height: 40px;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-radius: 999px;
  background: var(--sx-ink);
  color: #fff;
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
}

.sx-hero {
  --sx-hero-lift: -48px;
  --sx-hero-pill-top: 54px;
  --sx-hero-title-top: 156px;
  --sx-hero-bottom-gap: 96px;
  --sx-sphere-small: min(294px, 47.6vw);
  --sx-sphere-peak: min(724px, 54vw, calc(100svh - 200px));
  --sx-sphere-final: min(346px, 36vw);
  --sx-hero-finish-top: calc(var(--sx-hero-title-top) + 228px);
  --sx-sphere-final-opacity: .4;
  min-height: 100vh;
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 112px 0 80px;
  background: #fff;
}

.sx-intro-layer {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  color: #111;
  opacity: 1;
  animation: sxIntroLayerOut .72s cubic-bezier(.4, 0, .2, 1) 4.62s both;
}

.sx-intro-brand {
  position: absolute;
  top: 34px;
  left: max(32px, calc((100vw - 1120px) / 2));
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0;
  transform: translateY(-8px);
  animation: sxIntroEdgeIn .7s cubic-bezier(.16, .84, .3, 1) .12s both;
}

.sx-intro-brand > span {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border: 1px solid #111;
  font-family: var(--sx-serif);
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
}

.sx-intro-brand div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.sx-intro-brand strong {
  font-family: var(--sx-serif);
  font-size: 14px;
  font-weight: 850;
  line-height: 1;
}

.sx-intro-brand em,
.sx-intro-count,
.sx-intro-footer {
  font-family: var(--sx-mono);
}

.sx-intro-brand em {
  color: #8a8a8a;
  font-size: 8px;
  font-style: normal;
  font-weight: 700;
  letter-spacing: .18em;
}

.sx-intro-count {
  position: absolute;
  top: 44px;
  right: max(32px, calc((100vw - 1120px) / 2));
  display: flex;
  align-items: center;
  gap: 10px;
  color: #777;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: .18em;
  opacity: 0;
  transform: translateY(-8px);
  animation: sxIntroEdgeIn .7s cubic-bezier(.16, .84, .3, 1) .26s both;
}

.sx-intro-count i {
  display: block;
  width: 56px;
  height: 1px;
  background: #c9c9c9;
}

.sx-intro-footer {
  position: absolute;
  right: max(32px, calc((100vw - 1120px) / 2));
  bottom: 34px;
  left: max(32px, calc((100vw - 1120px) / 2));
  opacity: 0;
  transform: translateY(8px);
  animation: sxIntroEdgeIn .7s cubic-bezier(.16, .84, .3, 1) .36s both;
}

.sx-intro-phases {
  position: relative;
  height: 17px;
  margin-bottom: 9px;
  overflow: hidden;
}

.sx-intro-phases span {
  position: absolute;
  inset: 0 auto auto 0;
  color: #555;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: .2em;
  opacity: 0;
  transform: translateY(8px);
  white-space: nowrap;
}

.sx-intro-phases span:nth-child(1) {
  animation: sxIntroPhase 1.7s ease .46s both;
}

.sx-intro-phases span:nth-child(2) {
  animation: sxIntroPhase 1.7s ease 1.9s both;
}

.sx-intro-phases span:nth-child(3) {
  animation: sxIntroPhaseFinal 1.55s ease 3.38s both;
}

.sx-intro-progress {
  position: relative;
  height: 2px;
  overflow: hidden;
  background: #e4e4e4;
}

.sx-intro-progress i {
  position: absolute;
  inset: 0 auto 0 0;
  width: 100%;
  background: #111;
  transform: scaleX(0);
  transform-origin: left center;
  animation: sxIntroProgress 4.58s cubic-bezier(.2, .65, .2, 1) .18s both;
}

.sx-intro-footer p {
  display: flex;
  justify-content: space-between;
  margin: 9px 0 0;
  color: #aaa;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: .18em;
}

.sx-intro-footer p b {
  color: #777;
  font-weight: 750;
}

.sx-hero-sphere {
  position: absolute;
  width: var(--sx-sphere-small);
  height: var(--sx-sphere-small);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center;
  opacity: 0;
  pointer-events: auto;
  animation: sxSphereIntro 5.2s cubic-bezier(.16, .84, .3, 1) both;
}

.sx-hero-finish-sphere {
  position: absolute;
  left: 50%;
  top: var(--sx-hero-finish-top);
  z-index: 0;
  width: var(--sx-sphere-final);
  height: var(--sx-sphere-final);
  opacity: 0;
  transform: translate(-50%, -50%) scale(.8);
  pointer-events: none;
  animation: sxHeroFinishReveal 1.32s cubic-bezier(.16, .84, .3, 1) 5.45s both;
}

.sx-home.is-intro-quick .sx-intro-layer,
.sx-home.is-intro-quick .sx-hero-sphere {
  display: none;
}

.sx-home.is-intro-quick .sx-header,
.sx-home.is-intro-quick .sx-hero-inner,
.sx-home.is-intro-quick .sx-hero-pill,
.sx-home.is-intro-quick .sx-hero-pill span,
.sx-home.is-intro-quick .sx-hero-pill i,
.sx-home.is-intro-quick .sx-scroll,
.sx-home.is-intro-quick .sx-hero-finish-sphere {
  animation-delay: 0s;
  animation-duration: .01s;
}

.sx-particle-sphere {
  overflow: visible;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.sx-particle-sphere:active {
  cursor: grabbing;
}

.sx-particle-sphere :deep(canvas) {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.sx-particle-sphere :deep(canvas) {
  display: block;
}

.sx-particle-sphere :deep(.sx-model-cloud) {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  mix-blend-mode: multiply;
  clip-path: circle(46% at 50% 50%);
}

.sx-particle-sphere :deep(.sx-model-cloud span) {
  position: absolute;
  left: var(--sx-model-x);
  top: var(--sx-model-y);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 86px;
  color: rgba(78, 82, 88, .98);
  opacity: 0;
  transform: translate(-50%, -50%) scale(calc(var(--sx-model-scale) * .84));
  animation: sxModelCloudIn 1.75s cubic-bezier(.16, .84, .3, 1) calc(3.08s + var(--sx-model-delay)) both;
}

.sx-particle-sphere :deep(.sx-model-cloud b) {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border: 1px solid rgba(15, 15, 15, .09);
  border-radius: 50%;
  background: rgba(255, 255, 255, .84);
  box-shadow: 0 18px 46px rgba(0, 0, 0, .12), inset 0 1px 0 rgba(255, 255, 255, .95);
  font-family: var(--sx-sans);
  font-size: 30px;
  font-weight: 900;
  line-height: 1;
  color: rgba(78, 82, 88, .98);
  backdrop-filter: blur(10px);
}

.sx-particle-sphere :deep(.sx-model-cloud svg) {
  width: 34px;
  height: 34px;
  color: currentColor;
}

.sx-particle-sphere :deep(.sx-model-cloud em) {
  margin-top: 9px;
  color: rgba(78, 82, 88, .98);
  font-family: var(--sx-mono);
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  letter-spacing: .3em;
  line-height: 1;
  text-align: center;
  text-transform: uppercase;
}

.sx-hero-inner {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  opacity: 0;
  transform: translateY(calc(var(--sx-hero-lift) + 28px));
  animation: sxHeroReveal .92s cubic-bezier(.16, .84, .3, 1) 5.15s both;
}

.sx-hero-pill {
  position: absolute;
  top: var(--sx-hero-pill-top);
  left: 50%;
  height: 44px;
  display: inline-flex;
  align-items: center;
  gap: 18px;
  padding: 0 22px;
  margin: 0;
  border: 1px solid var(--sx-ink);
  border-radius: 999px;
  background: rgba(255, 255, 255, .76);
  font-size: 14px;
  font-weight: 750;
  transform: translateX(-50%);
  white-space: nowrap;
  opacity: 0;
  animation: sxPillFrame .55s ease-out 5.42s both, sxPillSeal .5s ease 7.5s both;
}

.sx-hero-pill span {
  display: inline-block;
  opacity: 0;
  transform: translateY(10px);
  animation: sxPillBit .55s cubic-bezier(.2, .6, .2, 1) both;
}

.sx-hero-pill span:nth-of-type(1) { animation-delay: 5.62s; }
.sx-hero-pill span:nth-of-type(2) { animation-delay: 5.88s; }
.sx-hero-pill span:nth-of-type(3) { animation-delay: 6.14s; }

.sx-hero-pill i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--sx-ink);
  opacity: 0;
  animation: sxPillDot .3s ease both;
}

.sx-hero-pill i:nth-of-type(1) { animation-delay: 5.82s; }
.sx-hero-pill i:nth-of-type(2) { animation-delay: 6.08s; }

.sx-hero h1 {
  margin: var(--sx-hero-title-top) 0 0;
  font-family: var(--sx-serif);
  font-size: clamp(76px, 10vw, 118px);
  font-weight: 950;
  line-height: .96;
  letter-spacing: 0;
}

.sx-hero-sub {
  margin: 3px 0 0;
  font-family: var(--sx-serif);
  font-size: 23px;
  font-style: italic;
  font-weight: 650;
  color: #9a968f;
}

.sx-hero-slogan {
  margin: var(--sx-hero-bottom-gap) 0 42px;
  font-family: var(--sx-serif);
  font-size: 23px;
  font-weight: 800;
}

.sx-primary {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 150px;
  height: 56px;
  justify-content: center;
  padding: 0 27px;
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, .28), rgba(255, 255, 255, .08) 17%, transparent 34%),
    linear-gradient(100deg, #050505 0%, #090909 45%, #202020 58%, #070707 72%, #050505 100%);
  background-size: 230% 100%, 100% 100%;
  background-position: 100% 0, 0 0;
  color: #fff;
  font-size: 15px;
  font-weight: 750;
  text-decoration: none;
  box-shadow: 0 14px 36px rgba(0, 0, 0, .12), inset 0 0 0 1px rgba(255, 255, 255, .04);
  overflow: hidden;
  isolation: isolate;
  animation: sxButtonGlow 3.8s cubic-bezier(.4, 0, .2, 1) infinite;
}

.sx-primary::before {
  content: "";
  position: absolute;
  inset: 1px;
  z-index: 0;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, .14), transparent 46%);
  opacity: .42;
  pointer-events: none;
}

.sx-primary span {
  position: relative;
  z-index: 1;
}

.sx-works {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: nowrap;
  gap: 19px;
  max-width: min(1040px, calc(100vw - 48px));
  margin-top: 36px;
  padding: 14px 27px;
  border: 1px solid rgba(10, 10, 10, .09);
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(255, 255, 255, .86), rgba(250, 249, 245, .72));
  box-shadow: 0 20px 54px rgba(10, 10, 10, .05), inset 0 1px 0 rgba(255, 255, 255, .88);
  backdrop-filter: blur(16px);
  color: #4c4c4c;
  font-size: 16px;
}

.sx-works span {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding-right: 6px;
  font-family: var(--sx-mono);
  font-size: 10px;
  letter-spacing: .34em;
  color: #aaa59d;
  white-space: nowrap;
}

.sx-works b {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  font-family: var(--sx-mono);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .13em;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
}

.sx-works b + b::before {
  content: "";
  width: 4px;
  height: 4px;
  margin: 0 19px 0 0;
  border-radius: 50%;
  background: rgba(10, 10, 10, .32);
}

.sx-scroll {
  position: absolute;
  bottom: 64px;
  left: 50%;
  width: 23px;
  height: 36px;
  transform: translateX(-50%);
  border: 1px solid #999;
  border-radius: 999px;
  opacity: 0;
  animation: sxScrollReveal .6s ease 5.7s forwards;
}

.sx-scroll span {
  position: absolute;
  top: 9px;
  left: 50%;
  width: 3px;
  height: 7px;
  border-radius: 99px;
  background: #444;
  transform: translateX(-50%);
  animation: sxScroll 1.5s ease-in-out infinite;
}

.sx-section {
  padding: 112px 0;
  border-top: 1px solid var(--sx-line);
}

.sx-kicker {
  margin: 0 0 29px;
  font-family: var(--sx-mono);
  font-size: 12px;
  letter-spacing: .36em;
  color: #aaa7a0;
}

.sx-promise {
  padding-top: 84px;
  text-align: center;
}

.sx-image h2,
.sx-playbook h2,
.sx-why h2,
.sx-onboard h2,
.sx-price h2,
.sx-closing h2 {
  margin: 0;
  font-family: var(--sx-serif);
  font-size: clamp(40px, 6vw, 58px);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: 0;
}

.sx-promise h2 {
  margin: 0 auto;
  max-width: 980px;
  font-family: var(--sx-serif);
  font-size: clamp(38px, 4.6vw, 60px);
  font-weight: 900;
  line-height: 1.12;
  letter-spacing: 0;
}

.sx-copy {
  margin: 126px auto 58px;
  max-width: 650px;
  color: var(--sx-muted);
  font-size: 18px;
  line-height: 2.05;
}

.sx-copy p {
  margin: 0 auto 28px;
}

.sx-promises {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  list-style: none;
  margin: 0 auto 126px;
  padding: 23px 0;
  border-top: 1px solid var(--sx-line);
  max-width: 920px;
}

.sx-promises li {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 72px;
  font-family: var(--sx-serif);
  font-weight: 850;
}

.sx-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 28px;
  text-align: left;
  border-top: 1px solid var(--sx-line);
  padding-top: 52px;
  width: min(100%, 1180px);
  margin-left: auto;
  margin-right: auto;
}

.sx-stat {
  min-height: 90px;
}

.sx-stat:nth-child(2) {
  justify-self: center;
  text-align: center;
}

.sx-stat:nth-child(3) {
  justify-self: end;
  text-align: right;
}

.sx-stat strong {
  display: inline-flex;
  align-items: baseline;
  font-family: var(--sx-serif);
  font-size: clamp(46px, 5.2vw, 68px);
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
  letter-spacing: 0;
}

.sx-stat small {
  margin-left: 2px;
  font-size: .26em;
  font-style: italic;
  color: #96928b;
}

.sx-stat span {
  display: block;
  margin-top: 14px;
  color: #aaa7a0;
  font-size: 14px;
}

.sx-image {
  overflow: hidden;
  background: #fff;
  padding-top: 70px;
}

.sx-image .sx-container {
  width: min(100% - 96px, 1180px);
}

.sx-image-grid {
  display: grid;
  grid-template-columns: minmax(360px, 430px) minmax(540px, 1fr);
  align-items: start;
  gap: 116px;
}

.sx-image-copy {
  display: flex;
  min-height: 650px;
  max-width: 430px;
  flex-direction: column;
  transform: none;
}

.sx-image h2 {
  font-size: clamp(36px, 3.25vw, 48px);
  line-height: 1.06;
  white-space: nowrap;
}

.sx-image-copy p {
  max-width: 420px;
  color: var(--sx-muted);
  font-size: 16px;
  line-height: 1.85;
}

.sx-model-title {
  position: relative;
  margin: auto 0 24px;
  padding-top: 23px;
}

.sx-model-title::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 36px;
  height: 2px;
  background: var(--sx-ink);
}

.sx-model-title span {
  font-family: var(--sx-mono);
  font-size: 24px;
  font-weight: 900;
}

.sx-model-title b {
  margin-left: 12px;
  padding: 4px 8px;
  border-radius: 5px;
  background: linear-gradient(90deg, #ff78b2, #8d7bff);
  color: #fff;
  font-family: var(--sx-mono);
  font-size: 10px;
  letter-spacing: .16em;
}

.sx-model-title small {
  color: #888;
  font-size: 14px;
}

.sx-model-note {
  margin: 0 0 24px;
  max-width: 380px !important;
  color: #666 !important;
  font-size: 15px !important;
  line-height: 1.85 !important;
}

.sx-endpoints {
  display: grid;
  margin: 18px 0 21px;
  border-top: 1px solid var(--sx-line);
}

.sx-endpoints code {
  display: flex;
  align-items: center;
  gap: 13px;
  height: 40px;
  border-bottom: 1px solid var(--sx-line);
  font-family: var(--sx-mono);
  color: #575757;
}

.sx-endpoints span {
  padding: 4px 6px;
  border-radius: 4px;
  background: #0a0a0a;
  color: #fff;
  font-size: 11px;
  font-weight: 900;
}

.sx-linkline {
  color: #9a9a9a !important;
  font-size: 13px !important;
}

.sx-underlink {
  display: inline-flex;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--sx-ink);
  color: var(--sx-ink);
  font-weight: 750;
  text-decoration: none;
}

.sx-image-card {
  position: relative;
  width: min(100%, 560px);
  margin-left: auto;
  margin-top: 176px;
  padding: 20px;
  border-radius: 17px;
  background: #111116;
  box-shadow: 0 28px 54px rgba(0, 0, 0, .18);
  color: #fff;
}

.sx-prompt {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 43px;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 10px;
  background: rgba(255, 255, 255, .04);
}

.sx-prompt span {
  padding: 6px 8px;
  border-radius: 6px;
  background: #303650;
  color: #bdc7ff;
  font-family: var(--sx-mono);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .18em;
}

.sx-prompt p {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  min-height: 20px;
  margin: 0;
  color: #f3f3f3;
  font-size: 12px;
  line-height: 1.45;
}

.sx-prompt p i {
  width: 1px;
  height: 1.15em;
  margin-left: 2px;
  background: #f3f3f3;
  animation: sxTypeCaret .86s steps(1, end) infinite;
}

.sx-photo {
  position: relative;
  height: 310px;
  margin-top: 14px;
  overflow: hidden;
  border-radius: 10px;
  background: #090a0f;
}

.sx-photo::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 26% 15%, rgba(176, 153, 255, .65), transparent 34%),
    radial-gradient(circle at 82% 84%, rgba(245, 123, 210, .42), transparent 28%),
    radial-gradient(circle at 62% 42%, rgba(73, 211, 255, .62), transparent 38%),
    linear-gradient(135deg, rgba(232, 224, 255, .45), rgba(50, 193, 255, .66) 44%, rgba(255, 141, 220, .34));
  opacity: 1;
  background-size: 150% 150%, 140% 140%, 160% 160%, 100% 100%, 100% 100%;
  transition: opacity .6s ease;
  animation: sxImageGlow 5.6s ease-in-out infinite alternate;
}

.sx-photo::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  background:
    linear-gradient(100deg, transparent 0 33%, rgba(255, 255, 255, .92) 46%, rgba(141, 217, 255, .38) 52%, transparent 64% 100%);
  opacity: 0;
  transform: translateX(-100%);
  filter: blur(1px);
}

.sx-photo:not(.is-ready)::after {
  opacity: .24;
  background:
    radial-gradient(circle at 18% 22%, rgba(255, 255, 255, .45) 0 1px, transparent 1px),
    radial-gradient(circle at 72% 68%, rgba(255, 255, 255, .24) 0 1px, transparent 1px);
  background-size: 4px 4px, 6px 6px;
  transform: none;
  filter: none;
  animation: sxImageGrain 1.4s steps(2, end) infinite;
}

.sx-photo img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  filter: blur(18px) saturate(1.12);
  transform: scale(1.035);
  transition:
    opacity .72s ease,
    filter .88s ease,
    transform .88s ease;
}

.sx-photo.is-revealing::after {
  opacity: 1;
  background:
    linear-gradient(100deg, transparent 0 33%, rgba(255, 255, 255, .92) 46%, rgba(141, 217, 255, .38) 52%, transparent 64% 100%);
  filter: blur(1px);
  animation: sxImageFlash .72s cubic-bezier(.22, .72, .24, 1) both;
}

.sx-photo.is-ready::before {
  opacity: 0;
  animation: none;
}

.sx-photo.is-ready::after {
  opacity: 0;
  animation: none;
}

.sx-photo.is-ready img {
  opacity: 1;
  filter: blur(0) saturate(1);
  transform: scale(1);
}

.sx-progress {
  height: 5px;
  margin: 14px 0 12px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, .18);
}

.sx-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #fb8bdc, #47c6ff);
  transform: scaleX(0);
  transform-origin: left center;
}

.sx-progress.is-running span {
  animation: sxLoad 2.8s linear both;
}

.sx-progress.is-done span {
  transform: scaleX(1);
  animation: none;
}

.sx-done {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 0 0 18px;
  color: #8e8d94;
  font-family: var(--sx-mono);
  font-size: 11px;
  font-weight: 700;
}

.sx-done span {
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #6fa2ff;
  box-shadow: 0 0 8px rgba(111, 162, 255, .82);
}

.sx-demo-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 13px;
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 999px;
  color: #a8a8ad;
  font-family: var(--sx-mono);
  font-size: 12px;
}

.sx-demo-tag::before {
  content: "";
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: #6fa2ff;
}

.sx-playbook {
  overflow: hidden;
}

.sx-play-copy {
  max-width: 550px;
  margin-top: 45px;
}

.sx-play-copy::before {
  content: "";
  display: block;
  width: 36px;
  height: 2px;
  margin-bottom: 22px;
  background: var(--sx-ink);
}

.sx-play-copy h3 {
  margin: 0 0 20px;
  font-family: var(--sx-serif);
  font-size: 28px;
  font-weight: 900;
}

.sx-play-copy p {
  color: var(--sx-muted);
  font-size: 16px;
  line-height: 1.85;
}

.sx-tv {
  position: relative;
  margin-top: 154px;
}

.sx-gamepad {
  position: absolute;
  right: -72px;
  bottom: 262px;
  width: 330px;
  height: 210px;
  transform: rotate(12deg);
  opacity: .9;
}

.pad-body {
  position: absolute;
  inset: 22px 0 0;
  border: 1.4px solid #111;
  border-radius: 46% 46% 35% 35%;
  background: rgba(255, 255, 255, .35);
  box-shadow: 0 28px 50px rgba(0, 0, 0, .06);
}

.pad-screen,
.pad-cross,
.pad-stick,
.pad-btn {
  position: absolute;
  border: 2px solid #111;
  background: #fafaf7;
}

.pad-screen {
  left: 138px;
  top: 57px;
  width: 82px;
  height: 49px;
  border-radius: 9px;
}

.pad-cross {
  left: 64px;
  top: 74px;
  width: 48px;
  height: 48px;
  border: 0;
  background:
    linear-gradient(#111, #111) center / 12px 48px no-repeat,
    linear-gradient(#111, #111) center / 48px 12px no-repeat;
  opacity: .75;
}

.pad-stick {
  top: 128px;
  width: 31px;
  height: 31px;
  border-radius: 50%;
}
.s1 { left: 143px; }
.s2 { left: 229px; }
.pad-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}
.b1 { right: 47px; top: 77px; }
.b2 { right: 27px; top: 98px; }
.b3 { right: 68px; top: 99px; }
.b4 { right: 47px; top: 119px; }

.sx-antenna {
  position: absolute;
  top: -68px;
  left: 50%;
  width: 120px;
  height: 80px;
  transform: translateX(-50%);
}

.sx-antenna::after {
  content: "";
  position: absolute;
  left: 55px;
  top: 47px;
  width: 10px;
  height: 10px;
  border: 2px solid var(--sx-ink);
  border-radius: 50%;
  background: var(--sx-bg);
}

.sx-antenna span {
  position: absolute;
  bottom: 27px;
  left: 50%;
  width: 2px;
  height: 74px;
  transform-origin: bottom;
  background: var(--sx-ink);
}

.sx-antenna span:first-child { transform: rotate(-45deg); }
.sx-antenna span:last-child { transform: rotate(45deg); }

.sx-tv-box {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 148px;
  gap: 22px;
  padding: 21px;
  border: 1.5px solid var(--sx-ink);
  border-radius: 19px;
  background: var(--sx-bg);
}

.sx-tv-screen {
  position: relative;
  min-height: 370px;
  overflow: hidden;
  border-radius: 10px;
  background: #080808;
  color: #fff;
}

.sx-tv-screen::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px 4px);
}

.sx-channel {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 2;
  font-family: var(--sx-mono);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: .08em;
}

.sx-tv-screen small {
  position: absolute;
  left: 18px;
  bottom: 17px;
  z-index: 2;
  color: #ccc;
  font-size: 12px;
}

.sx-channel-art {
  position: absolute;
  inset: 70px 120px 60px;
}

.sx-channel-art > span {
  position: absolute;
  display: block;
  border: 3px solid #fff;
}

.star {
  top: 0;
  left: 50%;
  width: 52px;
  height: 52px;
  transform: translateX(-50%) rotate(18deg);
  clip-path: polygon(50% 0, 62% 34%, 98% 35%, 69% 56%, 79% 91%, 50% 70%, 21% 91%, 31% 56%, 2% 35%, 38% 34%);
}

.wand {
  top: 91px;
  left: 35%;
  width: 190px;
  height: 26px;
  transform: rotate(-28deg);
}

.box-lid {
  left: 30%;
  bottom: 69px;
  width: 180px;
  height: 44px;
  transform: rotate(0);
}

.box-base {
  left: 36%;
  bottom: 0;
  width: 170px;
  height: 94px;
}

.calendar-grid {
  inset: 20px 70px 20px 70px;
  border-radius: 12px;
  background: repeating-linear-gradient(90deg, transparent 0 58px, rgba(255,255,255,.85) 58px 61px), repeating-linear-gradient(0deg, transparent 0 44px, rgba(255,255,255,.85) 44px 47px);
}

.check-mark {
  width: 170px;
  height: 90px;
  left: 50%;
  top: 50%;
  border-top: 0;
  border-right: 0;
  transform: translate(-50%, -60%) rotate(-45deg);
}

.agent-node {
  width: 76px;
  height: 76px;
  border-radius: 50%;
}
.n1 { left: 50%; top: 0; transform: translateX(-50%); }
.n2 { left: 18%; top: 116px; }
.n3 { right: 18%; top: 116px; }

.farm-line {
  left: 18%;
  right: 18%;
  bottom: 35px;
  height: 3px;
}

.farm-sprout {
  left: 50%;
  bottom: 37px;
  width: 100px;
  height: 112px;
  border-right: 0;
  border-bottom: 0;
  transform: translateX(-50%) rotate(45deg);
  border-radius: 80px 0 80px 0;
}

.farm-token {
  left: 50%;
  top: 5px;
  width: 82px;
  height: 82px;
  border-radius: 50%;
  transform: translateX(-50%);
}

.sx-tv-panel {
  padding: 18px 13px;
  border-radius: 12px;
  background: #f7f6f1;
  text-align: center;
}

.panel-kicker {
  display: block;
  margin: 0 0 13px;
  font-family: var(--sx-mono);
  font-size: 10px;
  letter-spacing: .38em;
  color: #b9b5ad;
}

.sx-tv-panel button:not(.sx-knob) {
  width: 100%;
  height: 35px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 4px;
  padding: 0 12px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #999;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.sx-tv-panel button.active {
  background: #fff;
  color: var(--sx-ink);
  box-shadow: 0 4px 14px rgba(0, 0, 0, .05);
}

.sx-tv-panel button span {
  font-family: var(--sx-mono);
  font-size: 11px;
}

.sx-knob {
  position: relative;
  width: 58px;
  height: 58px;
  margin: 15px auto 7px;
  border: 1.5px solid var(--sx-ink);
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}

.sx-knob span {
  position: absolute;
  left: 50%;
  top: 9px;
  width: 2px;
  height: 19px;
  background: var(--sx-ink);
  transform: translateX(-50%);
}

.sx-tv-panel em {
  display: block;
  font-style: normal;
  font-size: 12px;
}

.panel-lines {
  display: block;
  width: 70px;
  height: 20px;
  margin: 42px auto 0;
  background: repeating-linear-gradient(0deg, #ddd9d0 0 1px, transparent 1px 5px);
}

.sx-why {
  padding-bottom: 80px;
  background: #fff;
}

.sx-why h2 {
  margin-bottom: 70px;
}

.sx-why-list {
  position: relative;
  border-top: 2px solid var(--sx-ink);
}

.sx-why-list article {
  display: grid;
  grid-template-columns: 72px 280px 1fr;
  gap: 0;
  align-items: start;
  min-height: 96px;
  padding: 24px 0 18px;
  border-bottom: 1px solid var(--sx-line);
  transition: opacity .28s ease, background .28s ease, transform .28s ease;
  outline: none;
  cursor: default;
}

.sx-why-list:has(.sx-why-preview.is-visible) article:not(.is-active) {
  opacity: .72;
}

.sx-why-list article.is-active {
  background: linear-gradient(90deg, rgba(0, 0, 0, .018), transparent 68%);
}

.sx-why-list article > span {
  font-family: var(--sx-mono);
  color: #9b968e;
  font-size: 12px;
}

.sx-why-list h3 {
  margin: 0;
  font-family: var(--sx-serif);
  font-size: 17px;
  font-weight: 900;
  line-height: 1.18;
}

.sx-why-list small {
  margin-left: 7px;
  font-family: var(--sx-mono);
  color: #aaa7a0;
  font-size: 10px;
  letter-spacing: .24em;
}

.sx-why-list p {
  margin: 0;
  color: #555;
  font-size: 12px;
  line-height: 1.75;
  max-width: 670px;
}

.sx-why-preview {
  position: absolute;
  z-index: 3;
  top: 0;
  right: 18px;
  width: min(450px, 42vw);
  pointer-events: none;
  opacity: 0;
  transform: translate3d(0, calc(var(--sx-preview-y, 14px) - 8px), 0) scale(.98);
  transition: transform .42s cubic-bezier(.2, .9, .2, 1), opacity .24s ease;
}

.sx-why-preview.is-visible {
  opacity: 1;
  transform: translate3d(0, var(--sx-preview-y, 14px), 0) scale(1);
}

.sx-why-float {
  min-height: 198px;
  padding: 18px 18px 16px;
  border: 1px solid rgba(0, 0, 0, .1);
  border-radius: 20px;
  background: rgba(255, 255, 255, .96);
  box-shadow: 0 28px 70px rgba(0, 0, 0, .17);
  backdrop-filter: blur(16px);
}

.sx-why-card-enter-active,
.sx-why-card-leave-active {
  transition: opacity .22s ease, transform .26s ease;
}

.sx-why-card-enter-from,
.sx-why-card-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(.985);
}

.sx-why-float-kicker {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 12px;
  color: #aaa7a0;
  font-family: var(--sx-mono);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .26em;
}

.sx-why-float-kicker b {
  padding: 6px 10px;
  border: 1px solid var(--sx-line);
  border-radius: 999px;
  color: var(--sx-ink);
  font-size: 10px;
  letter-spacing: .08em;
}

.sx-why-float-caption {
  margin: 12px 0 0;
  color: #666;
  font-size: 11px;
  line-height: 1.45;
  text-align: center;
}

.sx-model-map {
  position: relative;
  height: 190px;
  overflow: hidden;
  border-top: 1px solid #eceae6;
  border-bottom: 1px solid #eceae6;
  background-image:
    linear-gradient(#f1efeb 1px, transparent 1px),
    linear-gradient(90deg, #f1efeb 1px, transparent 1px);
  background-size: 32px 32px;
}

.sx-model-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.sx-model-lines path {
  fill: none;
  stroke: #d7d3cc;
  stroke-width: 2;
  stroke-linecap: round;
}

.sx-flow-dot {
  fill: #090909;
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, .26));
}

.sx-flow-dot.is-out {
  fill: #111;
}

.sx-model-node,
.sx-agent {
  position: absolute;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid #ddd9d0;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 10px 22px rgba(0, 0, 0, .1);
  color: #111;
  font-family: var(--sx-mono);
  font-size: 16px;
  font-weight: 900;
}

.sx-model-node em,
.sx-agent em,
.sx-gateway-node em {
  position: absolute;
  left: 50%;
  top: calc(100% + 7px);
  transform: translateX(-50%);
  color: #aaa7a0;
  font-family: var(--sx-mono);
  font-size: 10px;
  font-style: normal;
  font-weight: 900;
  letter-spacing: .11em;
  white-space: nowrap;
}

.sx-model-node.is-claude {
  left: 38px;
  top: 10px;
}

.sx-model-node.is-gpt {
  left: 38px;
  top: 73px;
}

.sx-model-node.is-gemini {
  left: 38px;
  top: 136px;
}

.sx-gateway-node {
  position: absolute;
  left: 250px;
  top: 64px;
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 16px;
  background: #070707;
  color: #fff;
  font-family: var(--sx-serif);
  font-size: 17px;
  font-weight: 900;
  box-shadow:
    0 0 0 8px rgba(0, 0, 0, .04),
    0 0 0 13px rgba(0, 0, 0, .025),
    0 12px 26px rgba(0, 0, 0, .16);
}

.sx-agent {
  position: absolute;
  right: 34px;
  top: 73px;
  font-size: 14px;
}

@media (prefers-reduced-motion: reduce) {
  .sx-flow-dot,
  .sx-log-flow,
  .sx-log-card dd:last-child span::after,
  .sx-access-flow i,
  .sx-billing-flow,
  .sx-billing-table p::before {
    display: none;
  }

  .sx-route span::before,
  .sx-access-flow > span::before,
  .sx-wallet-card i::before {
    animation: none;
    width: 100%;
    transform: none;
  }

  .sx-log-card div,
  .sx-privacy-pills span,
  .sx-access-flow > span,
  .sx-billing-table p,
  .sx-billing-table .total,
  .sx-wallet-card strong em,
  .sx-wallet-card b:first-child,
  .sx-wallet-status {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .sx-wallet-card strong em:first-child {
    display: none;
  }
}

.sx-failover-card {
  display: grid;
  gap: 10px;
}

.sx-route {
  position: relative;
  overflow: hidden;
  padding: 12px;
  border: 1px solid #e1ded8;
  border-radius: 16px;
}

.sx-route strong {
  display: flex;
  justify-content: space-between;
  color: #111;
  font-family: var(--sx-mono);
  font-size: 11px;
}

.sx-route em {
  padding: 3px 10px;
  border-radius: 999px;
  font-style: normal;
  font-size: 10px;
}

.sx-route span {
  position: relative;
  overflow: hidden;
  display: block;
  height: 6px;
  margin-top: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, #ddd, #f0f0f0);
}

.sx-route span::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 0;
  border-radius: inherit;
  background: #cfcfcf;
}

.sx-route span:nth-of-type(2) {
  width: 72%;
}

.sx-route span:nth-of-type(3) {
  width: 56%;
}

.sx-route b {
  display: block;
  margin-top: 8px;
  font-family: var(--sx-mono);
  font-size: 10px;
}

.sx-route.is-bad em {
  border: 1px solid #ffb7b7;
  color: #e22;
  background: #fff3f3;
}

.sx-route.is-bad span:nth-of-type(3) {
  background: #ecebea;
}

.sx-route.is-bad span:nth-of-type(3)::before {
  background: linear-gradient(90deg, #d5d5d5, #ef8f94);
  animation: sxFailoverRetry 2.8s ease-in-out infinite;
}

.sx-route.is-bad b {
  color: #e22;
  animation: sxPrivacyReveal 2.8s ease-in-out infinite;
}

.sx-route.is-good em {
  border: 1px solid #9adfb8;
  color: #18934b;
  background: #effbf4;
}

.sx-route.is-good span::before {
  background: linear-gradient(90deg, #cfd7d1, #35c878, #77ddb1);
  animation: sxGoodStream 2.9s ease-in-out infinite;
}

.sx-route.is-good span:nth-of-type(2)::before {
  animation-delay: .16s;
}

.sx-route.is-good span:nth-of-type(3)::before {
  animation-delay: .32s;
}

.sx-route.is-good b {
  color: #18934b;
}

.sx-log-card,
.sx-billing-table,
.sx-wallet-card {
  position: relative;
  overflow: hidden;
  padding: 14px;
  border: 1px solid #e4e1dc;
  border-radius: 16px;
  background: rgba(255, 255, 255, .72);
}

.sx-log-flow,
.sx-billing-flow {
  position: absolute;
  left: -18%;
  top: 0;
  width: 18%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, .08), transparent);
  pointer-events: none;
  animation: sxPanelSweep 3s ease-in-out infinite;
}

.sx-log-card p,
.sx-billing-table p {
  display: flex;
  justify-content: space-between;
  margin: 0;
}

.sx-log-card p {
  color: #aaa7a0;
  font-family: var(--sx-mono);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .18em;
}

.sx-log-card dl {
  display: grid;
  gap: 10px;
  margin: 16px 0 0;
  font-family: var(--sx-mono);
}

.sx-log-card div {
  display: grid;
  grid-template-columns: 58px 1fr;
  opacity: .28;
  transform: translateY(4px);
  animation: sxPrivacyReveal 3.4s ease-in-out infinite;
}

.sx-log-card div:nth-child(2) {
  animation-delay: .38s;
}

.sx-log-card div:nth-child(3) {
  animation-delay: .76s;
}

.sx-log-card dt {
  color: #aaa7a0;
  font-weight: 900;
}

.sx-log-card dd {
  margin: 0;
  color: #1d1d1d;
  font-weight: 900;
  font-size: 11px;
}

.sx-log-card dd:last-child {
  position: relative;
  color: #c9c6bf;
}

.sx-log-card dd:last-child span {
  position: relative;
  display: inline-block;
  overflow: hidden;
  max-width: 150px;
  white-space: nowrap;
}

.sx-log-card dd:last-child span::after {
  content: "";
  position: absolute;
  inset: 0 auto 0 -42%;
  width: 42%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, .92), transparent);
  animation: sxPromptMask 2.8s ease-in-out infinite .9s;
}

.sx-privacy-pills {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.sx-privacy-pills span {
  display: grid;
  place-items: center;
  height: 30px;
  border: 1px solid var(--sx-line);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  opacity: .48;
  transform: translateY(4px);
  animation: sxStepActive 3.4s ease-in-out infinite;
}

.sx-privacy-pills span:nth-child(2) {
  animation-delay: .32s;
}

.sx-privacy-pills span:nth-child(3) {
  animation-delay: .64s;
}

.sx-access-flow {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 8px;
}

.sx-access-flow > span {
  position: relative;
  overflow: hidden;
  min-height: 68px;
  padding: 10px;
  border: 1px solid #e4e1dc;
  border-radius: 14px;
  font-family: var(--sx-mono);
  opacity: .48;
  transform: translateY(5px);
  animation: sxStepActive 3.6s ease-in-out infinite;
}

.sx-access-flow > span:nth-of-type(2) {
  animation-delay: .55s;
}

.sx-access-flow > span:nth-of-type(3) {
  animation-delay: 1.1s;
}

.sx-access-flow > span::before {
  content: "";
  position: absolute;
  inset: auto 10px 8px 10px;
  height: 3px;
  border-radius: 999px;
  background: linear-gradient(90deg, #111, #777);
  transform: scaleX(0);
  transform-origin: left;
  animation: sxStepUnderline 3.6s ease-in-out infinite;
}

.sx-access-flow > span:nth-of-type(2)::before {
  animation-delay: .55s;
}

.sx-access-flow > span:nth-of-type(3)::before {
  background: linear-gradient(90deg, #26b56d, #83e2b3);
  animation-delay: 1.1s;
}

.sx-access-flow em,
.sx-wallet-card span {
  display: block;
  margin-bottom: 12px;
  color: #aaa7a0;
  font-style: normal;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: .14em;
}

.sx-access-flow b {
  color: #111;
  font-size: 11px;
}

.sx-access-flow .ok {
  box-shadow: 0 12px 24px rgba(0, 0, 0, .12);
}

.sx-access-flow .ok b {
  color: #18934b;
}

.sx-access-flow i {
  color: #aaa7a0;
  font-style: normal;
  font-weight: 900;
  animation: sxArrowPulse 3.6s ease-in-out infinite;
}

.sx-access-flow i:nth-of-type(2) {
  animation-delay: .72s;
}

.sx-billing-table {
  display: grid;
  gap: 10px;
  font-family: var(--sx-mono);
}

.sx-billing-table p {
  position: relative;
  overflow: hidden;
  padding-bottom: 8px;
  border-bottom: 1px dashed #e8e5df;
  color: #111;
  font-size: 11px;
  opacity: .46;
  transform: translateX(-6px);
  animation: sxBillingHighlight 3.6s ease-in-out infinite;
}

.sx-billing-table p::before {
  content: "";
  position: absolute;
  inset: auto 0 0 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, .22), transparent);
  transform: translateX(-100%);
  animation: sxBillingSweep 3.6s ease-in-out infinite;
}

.sx-billing-table p:nth-of-type(2),
.sx-billing-table p:nth-of-type(2)::before {
  animation-delay: .38s;
}

.sx-billing-table p:nth-of-type(3),
.sx-billing-table p:nth-of-type(3)::before {
  animation-delay: .76s;
}

.sx-billing-table span {
  margin-left: auto;
  margin-right: 16px;
  color: #aaa7a0;
  font-weight: 900;
}

.sx-billing-table .total {
  align-items: baseline;
  padding-bottom: 0;
  border-bottom: 0;
  animation: sxBillingTotal 3.6s ease-in-out infinite 1.16s;
}

.sx-billing-table .total b {
  color: #aaa7a0;
  letter-spacing: .18em;
}

.sx-billing-table .total strong {
  font-family: var(--sx-serif);
  font-size: 19px;
}

.sx-wallet-card strong {
  position: relative;
  display: block;
  height: 34px;
  color: #dedbd4;
  font-family: var(--sx-serif);
  font-size: 25px;
  font-weight: 600;
}

.sx-wallet-card strong em {
  position: absolute;
  left: 0;
  top: 0;
  font-style: normal;
}

.sx-wallet-card strong em:first-child {
  animation: sxBalanceSwap 3.6s ease-in-out infinite;
}

.sx-wallet-card strong em:last-child {
  opacity: 0;
  transform: translateY(8px);
  color: #1b1b1b;
  animation: sxBalanceSwapFinal 3.6s ease-in-out infinite;
}

.sx-wallet-card i {
  position: relative;
  overflow: hidden;
  display: block;
  height: 6px;
  margin: 12px 0;
  border-radius: 999px;
  background: #f1f0ed;
}

.sx-wallet-card i::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 10%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ff84c8, #8b7cff, #35c6ff, #49d88b);
  animation: sxWalletTopup 3.6s ease-in-out infinite;
}

.sx-wallet-card p {
  display: flex;
  gap: 8px;
  margin: 0;
}

.sx-wallet-card b {
  padding: 6px 10px;
  border: 1px solid var(--sx-line);
  border-radius: 999px;
  font-size: 10px;
  transition: color .24s ease, border-color .24s ease, background .24s ease;
}

.sx-wallet-card b:first-child {
  animation: sxWalletPayActive 3.6s ease-in-out infinite;
}

.sx-wallet-status {
  color: #149650;
  font-weight: 800;
  opacity: 0;
  animation: sxWalletStatus 3.6s ease-in-out infinite;
}

.sx-onboard {
  padding-top: 70px;
  padding-bottom: 118px;
  background: #fff;
}

.sx-onboard .sx-container {
  display: grid;
  grid-template-columns: minmax(300px, 390px) minmax(560px, 1fr);
  grid-template-areas:
    "intro terminal"
    "steps terminal"
    "link terminal";
  align-items: start;
  column-gap: 108px;
  width: min(100% - 96px, 1220px);
}

.sx-onboard .sx-kicker,
.sx-onboard h2,
.sx-onboard-lede {
  grid-column: 1;
}

.sx-onboard .sx-kicker {
  grid-area: intro;
  margin-bottom: 26px;
}

.sx-onboard h2 {
  grid-area: intro;
  margin-top: 46px;
  max-width: none;
  font-size: clamp(34px, 3.15vw, 46px);
  line-height: 1.08;
  white-space: nowrap;
}

.sx-onboard-lede {
  grid-area: intro;
  margin-top: 126px;
}

.sx-onboard-lede,
.sx-price p {
  max-width: 660px;
  color: var(--sx-muted);
  font-size: 16px;
  line-height: 1.8;
}

.sx-steps {
  grid-area: steps;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  margin: 94px 0 0;
}

.sx-steps article {
  position: relative;
  display: grid;
  grid-template-columns: 35px 1fr;
  gap: 15px;
  min-height: 104px;
}

.sx-steps article:not(:last-child)::after {
  content: "";
  position: absolute;
  left: 13px;
  top: 28px;
  bottom: 7px;
  width: 1px;
  background: #dedede;
}

.sx-steps article > span {
  position: relative;
  z-index: 1;
  display: grid;
  width: 27px;
  height: 27px;
  place-items: center;
  border: 1.5px solid #dfdfdf;
  border-radius: 50%;
  background: #fff;
  color: #b9b9b9;
  font-family: var(--sx-mono);
  font-size: 12px;
  font-weight: 800;
}

.sx-steps .active > span {
  border-color: var(--sx-ink);
  background: var(--sx-ink);
  color: #fff;
}

.sx-steps h3 {
  margin: 0 0 7px;
  font-family: var(--sx-serif);
  font-size: 17px;
  font-weight: 900;
}

.sx-steps article:not(.active) h3 {
  color: #bbb;
}

.sx-steps p {
  margin: 0;
  color: #999;
  font-size: 13px;
  line-height: 1.7;
}

.sx-terminal {
  grid-area: terminal;
  position: relative;
  overflow: hidden;
  width: 100%;
  margin-top: 188px;
  border-radius: 12px;
  background: #090909;
  border: 1px solid #1f1f23;
  box-shadow: 0 28px 50px rgba(0, 0, 0, .12);
}

.sx-terminal::after {
  content: "";
  position: absolute;
  inset: 40px 0 0;
  pointer-events: none;
  background: linear-gradient(rgba(255, 255, 255, .035) 1px, transparent 1px);
  background-size: 100% 4px;
  opacity: .35;
}

.sx-termbar {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 42px;
  padding: 0 16px;
  border-bottom: 1px solid #2c2c2c;
  background: #17171b;
}

.sx-termbar i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.sx-termbar i:nth-child(1) { background: #ff5f57; }
.sx-termbar i:nth-child(2) { background: #ffbd2e; }
.sx-termbar i:nth-child(3) { background: #28c840; }
.sx-termbar span {
  margin-left: 22px;
  color: #66666b;
  font-family: var(--sx-mono);
  font-size: 13px;
  font-weight: 800;
}

.sx-terminal pre {
  margin: 0;
  min-height: 325px;
  padding: 22px 30px;
  white-space: pre-wrap;
}

.sx-terminal code {
  display: block;
  color: #ddd8cd;
  font-family: var(--sx-mono);
  font-size: 13px;
  font-weight: 850;
  line-height: 1.78;
}

.sx-term-line {
  display: block;
  min-height: 22px;
  margin-bottom: 2px;
  color: #ddd8cd;
  animation: sxTerminalLine .24s ease both;
}

.sx-term-line.is-input {
  color: #f6f4f0;
}

.sx-term-line.is-success {
  color: #66f09a;
}

.sx-term-line.is-question {
  color: #f7c841;
}

.sx-term-line.is-output {
  color: #c7c5d4;
}

.sx-term-line.is-muted {
  color: #8b8b8f;
}

.sx-term-line.is-active {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.sx-caret {
  display: inline-block;
  width: 8px;
  height: 16px;
  margin-left: 2px;
  transform: translateY(3px);
  background: #f6f6f6;
  box-shadow: 0 0 16px rgba(255, 255, 255, .35);
  animation: sxCaret 1s steps(2, end) infinite;
}

.sx-underlink.muted {
  grid-area: link;
  align-self: end;
  margin-top: 31px;
  color: #777;
  border-bottom-color: #aaa;
}

.sx-price {
  min-height: 340px;
  background: #fff;
}

.sx-price h2 {
  max-width: 760px;
}

.sx-price-lines {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 28px 0 34px;
  font-weight: 650;
}

.sx-closing {
  position: relative;
  min-height: 612px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-top: 1px solid var(--sx-line);
}

.sx-close-sphere {
  position: absolute;
  width: min(760px, 92vw);
  height: 400px;
  opacity: .62;
}

.sx-close-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.sx-closing h2 {
  font-size: clamp(28px, 4vw, 36px);
}

.sx-closing p {
  margin: 18px 0 25px;
  color: #555;
  font-family: var(--sx-mono);
  letter-spacing: .06em;
}

.sx-footer {
  border-top: 1px solid var(--sx-line);
}

.sx-footer .sx-container {
  height: 78px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #777;
  font-size: 13px;
}

@keyframes sxScroll {
  0%, 100% { transform: translate(-50%, 0); opacity: .5; }
  50% { transform: translate(-50%, 8px); opacity: 1; }
}

@keyframes sxLoad {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes sxTypeCaret {
  0%, 50% { opacity: 1; }
  50.01%, 100% { opacity: 0; }
}

@keyframes sxImageGlow {
  0% {
    background-position: 0% 0%, 100% 40%, 45% 100%, 0 0, 0 0;
  }
  100% {
    background-position: 28% 18%, 72% 62%, 58% 74%, 0 0, 0 0;
  }
}

@keyframes sxImageGrain {
  0% { background-position: 0 0, 0 0; }
  100% { background-position: 4px 3px, -3px 5px; }
}

@keyframes sxImageFlash {
  0% {
    opacity: 0;
    transform: translateX(-115%) skewX(-10deg);
  }
  18% {
    opacity: 1;
  }
  78% {
    opacity: .95;
  }
  100% {
    opacity: 0;
    transform: translateX(115%) skewX(-10deg);
  }
}

@keyframes sxPanelSweep {
  0% { transform: translateX(0); opacity: 0; }
  18% { opacity: .9; }
  100% { transform: translateX(680%); opacity: 0; }
}

@keyframes sxFailoverRetry {
  0%, 8% { width: 0; opacity: .35; }
  42% { width: 58%; opacity: 1; }
  68% { width: 58%; opacity: 1; }
  100% { width: 58%; opacity: .45; }
}

@keyframes sxGoodStream {
  0% { width: 18%; opacity: .55; }
  48% { width: 96%; opacity: 1; }
  100% { width: 100%; opacity: .8; }
}

@keyframes sxPrivacyReveal {
  0%, 12% { opacity: .28; transform: translateY(4px); }
  34%, 78% { opacity: 1; transform: translateY(0); }
  100% { opacity: .7; transform: translateY(0); }
}

@keyframes sxPromptMask {
  0% { transform: translateX(0); opacity: 0; }
  18% { opacity: .95; }
  100% { transform: translateX(420%); opacity: 0; }
}

@keyframes sxStepActive {
  0%, 18% {
    opacity: .46;
    border-color: #e4e1dc;
    box-shadow: none;
    transform: translateY(5px);
  }
  34%, 72% {
    opacity: 1;
    border-color: #d2cec6;
    box-shadow: 0 12px 28px rgba(0, 0, 0, .1);
    transform: translateY(0);
  }
  100% {
    opacity: .68;
    transform: translateY(0);
  }
}

@keyframes sxStepUnderline {
  0%, 22% { transform: scaleX(0); opacity: 0; }
  44%, 72% { transform: scaleX(1); opacity: 1; }
  100% { transform: scaleX(1); opacity: .35; }
}

@keyframes sxArrowPulse {
  0%, 100% {
    color: #aaa7a0;
    transform: translateX(0);
  }
  48% {
    color: #111;
    transform: translateX(3px);
  }
}

@keyframes sxBillingHighlight {
  0%, 18% { opacity: .46; transform: translateX(-6px); }
  34%, 74% { opacity: 1; transform: translateX(0); }
  100% { opacity: .72; transform: translateX(0); }
}

@keyframes sxBillingSweep {
  0% { transform: translateX(-100%); opacity: 0; }
  28% { opacity: .8; }
  100% { transform: translateX(100%); opacity: 0; }
}

@keyframes sxBillingTotal {
  0%, 26% { opacity: .4; transform: scale(.98); }
  48%, 82% { opacity: 1; transform: scale(1); }
  100% { opacity: .8; transform: scale(1); }
}

@keyframes sxWalletTopup {
  0%, 16% { width: 10%; }
  62% { width: 100%; }
  100% { width: 100%; }
}

@keyframes sxBalanceSwap {
  0%, 42% { opacity: 1; transform: translateY(0); }
  58%, 100% { opacity: 0; transform: translateY(-8px); }
}

@keyframes sxBalanceSwapFinal {
  0%, 42% { opacity: 0; transform: translateY(8px); }
  58%, 100% { opacity: 1; transform: translateY(0); }
}

@keyframes sxWalletPayActive {
  0%, 16% {
    color: #111;
    border-color: var(--sx-line);
    background: transparent;
  }
  30%, 78% {
    color: #149650;
    border-color: #a5dfbc;
    background: #f1fbf5;
  }
  100% {
    color: #111;
    border-color: var(--sx-line);
    background: transparent;
  }
}

@keyframes sxWalletStatus {
  0%, 52% { opacity: 0; }
  64%, 100% { opacity: 1; }
}

@keyframes sxButtonGlow {
  0%, 18% {
    background-position: 100% 0, 0 0;
  }
  54% {
    background-position: 0 0, 0 0;
  }
  78%, 100% {
    background-position: 0 0, 0 0;
  }
}

@keyframes sxTerminalLine {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sxCaret {
  0%, 45% { opacity: 1; }
  46%, 100% { opacity: 0; }
}

@keyframes sxIntroLayerOut {
  from {
    opacity: 1;
    visibility: visible;
  }
  to {
    opacity: 0;
    visibility: hidden;
  }
}

@keyframes sxIntroEdgeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sxIntroPhase {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  18%, 68% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-8px);
  }
}

@keyframes sxIntroPhaseFinal {
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  22%, 100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sxIntroProgress {
  0% { transform: scaleX(0); }
  16% { transform: scaleX(.08); }
  48% { transform: scaleX(.44); }
  76% { transform: scaleX(.74); }
  100% { transform: scaleX(1); }
}

@keyframes sxPageReveal {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes sxHeroReveal {
  from {
    opacity: 0;
    transform: translateY(calc(var(--sx-hero-lift) + 28px));
  }
  to {
    opacity: 1;
    transform: translateY(var(--sx-hero-lift));
  }
}

@keyframes sxPillFrame {
  from {
    opacity: 0;
    border-color: rgba(10, 10, 10, 0);
    transform: translateX(-50%) translateY(8px) scaleX(.82);
  }
  to {
    opacity: 1;
    border-color: rgba(10, 10, 10, .12);
    transform: translateX(-50%) translateY(0) scaleX(1);
  }
}

@keyframes sxPillSeal {
  from { border-color: rgba(10, 10, 10, .12); }
  to { border-color: rgba(10, 10, 10, 1); }
}

@keyframes sxPillBit {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sxPillDot {
  from { opacity: 0; }
  to { opacity: .52; }
}

@keyframes sxScrollReveal {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes sxHeroFinishReveal {
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(.8);
  }
  24% {
    opacity: .26;
    transform: translate(-50%, -50%) scale(.94);
  }
  64% {
    opacity: .28;
    transform: translate(-50%, -50%) scale(1);
  }
  100% {
    opacity: var(--sx-sphere-final-opacity);
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes sxSphereIntro {
  0% {
    top: 50%;
    width: var(--sx-sphere-peak);
    height: var(--sx-sphere-peak);
    opacity: .98;
    transform: translate(-50%, -50%) scale(1);
  }
  18% {
    top: 50%;
    width: var(--sx-sphere-peak);
    height: var(--sx-sphere-peak);
    opacity: .98;
    transform: translate(-50%, -50%) scale(1);
  }
  42% {
    top: 50%;
    width: var(--sx-sphere-peak);
    height: var(--sx-sphere-peak);
    opacity: .98;
    transform: translate(-50%, -50%) scale(1);
  }
  68% {
    top: 50%;
    width: var(--sx-sphere-peak);
    height: var(--sx-sphere-peak);
    opacity: .98;
    transform: translate(-50%, -50%) scale(1);
  }
  84% {
    top: 50%;
    width: var(--sx-sphere-peak);
    height: var(--sx-sphere-peak);
    opacity: .96;
    transform: translate(-50%, -50%) scale(1.015);
  }
  93% {
    top: 50%;
    width: var(--sx-sphere-peak);
    height: var(--sx-sphere-peak);
    opacity: .42;
    transform: translate(-50%, -50%) scale(1.045);
  }
  100% {
    top: 50%;
    width: var(--sx-sphere-peak);
    height: var(--sx-sphere-peak);
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.06);
  }
}

@keyframes sxModelCloudIn {
  0% {
    opacity: 0;
    filter: blur(7px);
    transform: translate(-50%, -50%) scale(calc(var(--sx-model-scale) * .74));
  }
  34% {
    opacity: .92;
    filter: blur(0);
    transform: translate(-50%, -50%) scale(var(--sx-model-scale));
  }
  82% {
    opacity: .88;
    filter: blur(0);
  }
  100% {
    opacity: .32;
    filter: blur(1px);
    transform: translate(-50%, -50%) scale(calc(var(--sx-model-scale) * 1.06));
  }
}

@media (prefers-reduced-motion: reduce) {
  .sx-intro-layer,
  .sx-hero-sphere {
    display: none;
  }

  .sx-header,
  .sx-hero-inner,
  .sx-hero-pill,
  .sx-hero-pill span,
  .sx-hero-pill i,
  .sx-scroll,
  .sx-hero-finish-sphere,
  .sx-model-cloud span,
  .sx-primary,
  .sx-primary::before,
  .sx-term-line,
  .sx-caret {
    animation: none;
    opacity: 1;
  }

  .sx-primary::before {
    opacity: 0;
  }

  .sx-hero-inner {
    clip-path: none;
    transform: translateY(var(--sx-hero-lift));
  }

  .sx-hero-pill {
    transform: translateX(-50%);
  }

  .sx-hero-pill span {
    transform: none;
  }

  .sx-hero-pill i {
    opacity: .52;
  }

  .sx-hero-finish-sphere {
    opacity: var(--sx-sphere-final-opacity);
    transform: translate(-50%, -50%) scale(1);
  }
}

@media (max-width: 760px) {
  .sx-intro-brand {
    top: 24px;
    left: 18px;
  }

  .sx-intro-count {
    top: 34px;
    right: 18px;
  }

  .sx-intro-count i {
    width: 32px;
  }

  .sx-intro-footer {
    right: 18px;
    bottom: 24px;
    left: 18px;
  }

  .sx-hero {
    --sx-hero-lift: -38px;
    --sx-hero-pill-top: 28px;
    --sx-hero-title-top: 204px;
    --sx-hero-bottom-gap: 82px;
    --sx-sphere-small: min(210px, 53.2vw);
    --sx-sphere-peak: min(347px, 74.2vw, calc(100svh - 112px));
    --sx-sphere-final: min(264px, 64vw);
    --sx-hero-finish-top: calc(var(--sx-hero-title-top) + 198px);
  }

  .sx-hero-sphere {
    top: 50%;
  }

  .sx-container,
  .sx-narrow {
    width: min(100% - 36px, 1120px);
  }

  .sx-header-row {
    height: auto;
    min-height: 76px;
    flex-wrap: wrap;
    padding: 15px 0;
  }

  .sx-nav {
    order: 3;
    width: 100%;
    gap: 18px;
    overflow-x: auto;
  }

  .sx-actions {
    gap: 10px;
  }

  .sx-hero-pill {
    height: 38px;
    flex-wrap: nowrap;
    justify-content: center;
    gap: 10px;
    padding: 0 14px;
    width: auto;
    max-width: calc(100vw - 64px);
    font-size: clamp(10px, 2.4vw, 13px);
    white-space: nowrap;
    overflow: hidden;
  }

  .sx-hero-pill i {
    width: 3px;
    height: 3px;
    flex: 0 0 auto;
  }

  .sx-hero h1 {
    font-size: clamp(54px, 15vw, 82px);
    font-weight: 950;
  }

  .sx-hero-sub {
    font-size: 20px;
  }

  .sx-works {
    display: flex;
    flex-wrap: wrap;
    max-width: min(100% - 20px, 460px);
    gap: 7px 13px;
    padding: 12px 16px;
    border-radius: 22px;
  }

  .sx-works span {
    width: 100%;
    justify-content: center;
    min-height: 24px;
    padding: 0 0 8px;
  }

  .sx-works b {
    min-width: auto;
  }

  .sx-works b + b::before {
    width: 3px;
    height: 3px;
    margin-right: 13px;
  }

  .sx-promises,
  .sx-stats,
  .sx-steps {
    grid-template-columns: 1fr;
  }

  .sx-copy {
    margin-top: 72px;
  }

  .sx-promises {
    margin-bottom: 72px;
  }

  .sx-stat,
  .sx-stat:nth-child(2),
  .sx-stat:nth-child(3) {
    text-align: left;
  }

  .sx-image-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }

  .sx-image .sx-container {
    width: min(100% - 36px, 1120px);
  }

  .sx-image-copy {
    max-width: none;
    min-height: auto;
    transform: none;
  }

  .sx-image h2 {
    white-space: normal;
  }

  .sx-image-card {
    width: min(100%, 560px);
    margin: 0 auto;
  }

  .sx-onboard .sx-container {
    display: block;
    width: min(100% - 36px, 1120px);
  }

  .sx-onboard h2 {
    margin-top: 0;
    font-size: clamp(28px, 8vw, 36px);
    white-space: nowrap;
  }

  .sx-onboard-lede {
    margin-top: 18px;
  }

  .sx-steps {
    margin: 44px 0 32px;
  }

  .sx-terminal {
    margin-top: 0;
  }

  .sx-tv {
    margin-top: 80px;
  }

  .sx-gamepad {
    display: none;
  }

  .sx-tv-box {
    grid-template-columns: 1fr;
  }

  .sx-tv-panel {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }

  .panel-kicker,
  .sx-knob,
  .sx-tv-panel em,
  .panel-lines {
    display: none;
  }

  .sx-why-list article {
    grid-template-columns: 42px 1fr;
    row-gap: 12px;
  }

  .sx-why-list p {
    grid-column: 2;
  }
}

@media (max-width: 560px) {
  .sx-intro-brand em,
  .sx-intro-footer p span {
    display: none;
  }

  .sx-brand {
    min-width: auto;
  }

  .sx-logo-name {
    display: none;
  }

  .sx-register {
    min-width: 52px;
    padding: 0 14px;
  }

  .sx-hero {
    --sx-hero-lift: -26px;
    --sx-hero-pill-top: 24px;
    --sx-hero-title-top: 190px;
    --sx-hero-bottom-gap: 70px;
    --sx-sphere-small: min(182px, 54.6vw);
    --sx-sphere-final: min(240px, 68vw);
    --sx-hero-finish-top: calc(var(--sx-hero-title-top) + 176px);
    padding-top: 124px;
  }

  .sx-hero-pill {
    max-width: calc(100vw - 54px);
    gap: 8px;
    padding: 0 11px;
    font-size: clamp(9px, 2.25vw, 11px);
  }

  .sx-hero-slogan {
    font-size: 18px;
    font-weight: 800;
  }

  .sx-works {
    gap: 7px 10px;
    margin-top: 26px;
    padding: 10px 13px;
  }

  .sx-works b {
    min-height: 24px;
    padding: 0;
    font-size: 11px;
    letter-spacing: .1em;
  }

  .sx-works b + b::before {
    margin-right: 10px;
  }

  .sx-image h2 {
    font-size: 36px;
  }

  .sx-photo {
    height: min(326px, 64vw);
  }

  .sx-section {
    padding: 78px 0;
  }

  .sx-promise h2,
  .sx-image h2,
  .sx-playbook h2,
  .sx-why h2,
  .sx-onboard h2,
  .sx-price h2 {
    font-size: 36px;
  }

  .sx-promise h2 {
    font-size: clamp(30px, 9.2vw, 42px);
  }

  .sx-copy {
    font-size: 15px;
    line-height: 1.9;
  }

  .sx-stat strong {
    font-size: clamp(38px, 11vw, 52px);
  }

  .sx-tv-screen {
    min-height: 300px;
  }

  .sx-channel-art {
    inset: 78px 40px 60px;
  }
}
</style>
