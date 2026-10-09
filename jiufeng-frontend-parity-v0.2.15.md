jiufeng 前端与官方 v0.2.15 功能对照
====================================

核对日期：2026-10-09。以当前本地已应用的 `frontend/src/router/index.ts` 和 `frontend/src/views/home-jiufeng/` 为实际运行入口；官方基准固定为 v0.2.15，不用持续变化的 main 分支代替发布版本。

本地 HEAD 为 `3a6fd1c9d`，官方 v0.2.15 标签为 `f2669c8cf62555cd92389b3f55920e9e6e7c6ff2`。两者的官方 frontend 目录没有版本差异。官方 v0.2.14 标签为 `0363b8cdba8cec3e2ba4b2dbd49c4481143fa55d`。

参考：[官方 v0.2.15 发布说明](https://github.com/Wei-Shaw/sub2api/releases/tag/v0.2.15)、[官方前端版本差异](https://github.com/Wei-Shaw/sub2api/compare/v0.2.14...v0.2.15)、[jiufeng 项目](https://github.com/Xavierxian/jiufeng-sub2api)。jiufeng 的判断以本地文件为准。

**结论：没有发现整页路由入口缺失；确认有 5 类功能或展示适配未对齐、9 类官方修复未同步。** 其中“定价模型同步能力判断”属于尚未接入的适配：当前渠道页仅列出原有 11 个支持定价同步的平台，补齐 Cline / Command Code 时须一起补上能力判断，不能将两平台错误地提供为定价目录同步对象。

核对覆盖官方与本地各 64 项路由定义，路径均保留，所有路由组件文件存在。官方 v0.2.14 → v0.2.15 共修改 117 个前端文件，其中 70 个非测试文件：48 个 API、共享组件、常量、状态和工具文件，8 个语言文件，14 个页面及页面内部组件文件。jiufeng 继续引用了这 48 个共享文件，但后面 14 个页面文件使用独立副本，因此不能仅凭官方目录已升级就认为所有页面已同步。

**未对齐的功能与展示适配**

| 编号 | 范围 | 官方 v0.2.15 | 当前 jiufeng | 影响 / 建议 | 源码证据 |
| --- | --- | --- | --- | --- | --- |
| F1 | 渠道定价、模型映射、组合分组的逐平台配置 | 从平台清单生成完整平台列表，包含 `cline`、`command_code` | `platformOrder`、`compositePlatforms` 仍是旧的 11 平台数组；`apiToForm` 也只按这份数组构建平台段 | 无法在此页完整配置两平台的定价与映射；已有两平台配置不会正常回填。应先同步平台清单和回填逻辑，再检查保存时是否完整保留这些平台的配置 | [jiufeng ChannelsView:766](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/ChannelsView.vue:766)、[官方:769](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/admin/ChannelsView.vue:769) |
| F2 | 系统默认平台限额、各认证来源的默认平台限额 | 两张表均由 `platformQuotaRows` 按平台清单生成，覆盖 13 个平台 | 两张表都只写死了 Anthropic、OpenAI、Gemini、Antigravity、Grok、TypeSafe 六个平台 | 缺少 Kimi、Zhipu、DeepSeek、MiniMax、OpenCode、Command Code、Cline 的日 / 周 / 月默认限额编辑入口。用户管理中的单用户平台限额组件已更新，不能据此认为系统默认限额也已更新 | [jiufeng SettingsView:4046](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/SettingsView.vue:4046)、[认证来源:4381](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/SettingsView.vue:4381)、[官方:4058](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/admin/SettingsView.vue:4058) |
| F3 | 运维监控的单请求输出 TPS | 新增 `output_tps` 卡片，显示 P50、P5、P10、Avg 和样本数；与系统吞吐 TPS 分开 | jiufeng 的 OpsDashboardHeader 没有读取 `output_tps`，只保留原有系统 TPS | 无法查看单个请求的输出速度分布；原有 TPS 不能替代这一指标。用户和管理员的用量表已经继承单请求 TPS，缺失只在运维总览卡片 | [jiufeng OpsDashboardHeader:385](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/ops/components/OpsDashboardHeader.vue:385)、[官方新卡片:1433](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/admin/ops/components/OpsDashboardHeader.vue:1433) |
| F4 | 分组列表、复制账号选择、组合路由的平台名称 | 翻译不存在时用 `platformLabel` 回退到平台清单中的展示名 | 多处仍只调用 `t('admin.groups.platforms.' + platform)`，没有展示名回退 | Cline / Command Code 没有对应的平台翻译键，相关位置会出现翻译键文本。创建和筛选的平台选项已从新版共享常量继承，两平台本身并非不能创建分组 | [jiufeng GroupsView:165](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/GroupsView.vue:165)、[复制账号:5039](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/GroupsView.vue:5039)、[组合路由:6747](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/GroupsView.vue:6747)、[官方:165](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/admin/GroupsView.vue:165) |
| F5 | 渠道定价的模型同步能力判断 | 只向 `supportsPricingModelSync` 为真的平台显示同步按钮，并在执行函数中再检查能力 | 按钮和函数均没有平台能力判断 | 属于未同步适配。当前旧列表中的平台支持定价同步；补齐新平台列表后须一起补上判断，因为 Cline / Command Code 没有定价目录 provider。账号白名单的上游模型同步属于另一功能，其共享组件已更新 | [jiufeng ChannelsView:427](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/ChannelsView.vue:427)、[官方:426](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/admin/ChannelsView.vue:426)、[能力定义:96](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/constants/platformCatalog.ts:96) |

**尚未同步的官方前端修复**

| 编号 | 范围 | 官方修复 | 当前 jiufeng 的代码差异 | 触发条件与可能影响 | 源码证据 |
| --- | --- | --- | --- | --- | --- |
| B1 | 渠道同步模型 | 请求前保存目标平台段 `section` 的对象引用；返回后写入该对象 | 返回后仍通过 `form.platforms[sectionIdx]` 取平台段 | 同步尚未完成时关闭并打开其他渠道编辑，表单被替换后，旧结果可能添加到当前表单的错误平台段 | [jiufeng ChannelsView:879](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/ChannelsView.vue:879)、[官方:882](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/admin/ChannelsView.vue:882) |
| B2 | 运维告警规则 | 持续时间、冷却时间用 `Number.isInteger` 校验整分钟 | 仍用 `Number.isFinite`，只校验范围 | `1.5` 分钟等小数可以通过前端校验；没有同步官方对有效输入的限制 | [jiufeng OpsAlertRulesCard:330](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/ops/components/OpsAlertRulesCard.vue:330)、[官方:330](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/admin/ops/components/OpsAlertRulesCard.vue:330) |
| B3 | 运维设置 | 加载成功前禁用保存；函数同时检查 `loading`、`settingsLoaded`、`saving` | 没有 `settingsLoaded` 状态，按钮只检查保存状态和数据校验 | 设置还在加载或初次加载失败时可以保存默认值，可能覆盖实际设置 | [jiufeng OpsSettingsDialog:200](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/ops/components/OpsSettingsDialog.vue:200)、[按钮:655](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/ops/components/OpsSettingsDialog.vue:655)、[官方:24](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/admin/ops/components/OpsSettingsDialog.vue:24) |
| B4 | 运维告警事件筛选与分页 | 用 `listRequestId` 丢弃旧筛选条件下的首页和追加分页响应，卸载时使请求失效 | 首页和追加页响应直接替换 / 追加 `events`，没有请求版本检查 | 快速切换筛选条件或切换时仍有“加载更多”请求，旧数据可能覆盖或混入新结果 | [jiufeng OpsAlertEventsCard:94](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/ops/components/OpsAlertEventsCard.vue:94)、[官方:25](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/admin/ops/components/OpsAlertEventsCard.vue:25) |
| B5 | 插件配置界面 | 用 `uiSessionVersion` 隔离配置会话；关闭 / 卸载使旧会话失效 | `createUISession` 返回后直接更新 `uiSession`，关闭时没有版本失效机制 | 插件 A 的请求较慢，关闭后打开 B，A 的会话可能覆盖 B 的界面 | [jiufeng PluginsView:436](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/PluginsView.vue:436)、[官方:527](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/admin/PluginsView.vue:527) |
| B6 | 备份与恢复轮询 | `disposed` 标记在页面卸载后禁止重新启动两种轮询 | 卸载时只清除当时的定时器，`startPolling` / `startRestorePolling` 没有卸载检查 | 离开页面后，较晚返回的创建 / 恢复请求可能再次启动轮询 | [jiufeng BackupView:541](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/admin/BackupView.vue:541)、[官方:540](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/admin/BackupView.vue:540) |
| B7 | Stripe 支付页 | SDK 加载完成、挂载支付元素、启动轮询及安排跳转时检查 `disposed` | 没有 `disposed`；卸载时只清除已有定时器 | 离开页面后，较晚返回的初始化或支付回调可能继续挂载、启动轮询或安排结果页跳转 | [jiufeng StripePaymentView:136](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/user/StripePaymentView.vue:136)、[轮询:285](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/user/StripePaymentView.vue:285)、[官方:132](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/user/StripePaymentView.vue:132) |
| B8 | Airwallex 支付页 | SDK 导入和初始化完成后检查页面是否已卸载 | 两个 `await` 后没有卸载检查 | 用户已经离开页面，旧初始化仍可能触发 `redirectToCheckout` / `window.location.assign`，把用户带到支付页 | [jiufeng AirwallexPaymentView:103](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/user/AirwallexPaymentView.vue:103)、[官方:45](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/user/AirwallexPaymentView.vue:45) |
| B9 | 自定义 Markdown 页面 | 用 `markdownRequestVersion` 隔离响应；切换页面或卸载时使旧请求失效 | 页面请求、正文解析、目录和复制按钮更新没有版本检查 | 快速从自定义页面 A 切到 B，A 的慢响应可能覆盖 B 的内容、目录或加载状态 | [jiufeng CustomPageView:291](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/user/CustomPageView.vue:291)、[官方:163](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/user/CustomPageView.vue:163) |

**已经继承的更新，不能列为缺失**

| 功能 / 修复 | 当前状态 | 判断依据 |
| --- | --- | --- |
| Cline / Command Code 的账号创建、编辑、接入模式和多协议规则 | 已继承 | 使用新版共享的 CreateAccountModal、EditAccountModal、credentialsBuilder、OpenCodeGoProtocolRulesEditor 和平台清单 |
| 多协议账号的订阅额度 / 余额展示 | 已继承 | 账号页引用新版 AccountUsageCell，内部按共享平台能力选择额度与余额组件；Cline 的窗口展示由这些组件承载 |
| 账号与分组的平台选择项 | 已继承 | 使用新版 `CONCRETE_PLATFORM_OPTIONS` / `GROUP_PLATFORM_OPTIONS`；分组名称展示回退仍存在 F4 的局部差异 |
| 用户和管理员用量页的单请求输出 TPS | 已继承 | 两页都引用新版共享 UsageTable，默认可见的 latency 列内显示 TPS；不要与 F3 的运维分布卡片混淆 |
| 长上下文计费标记、用户倍率为 0 的费用明细 | 已继承 | 使用新版 UsageTable 的语义标记及 `rate_multiplier ?? 1` |
| 账号搜索与“更多筛选”的紧凑布局功能 | 已继承 | 使用新版 AccountTableFilters；但旧 jiufeng 桌面 CSS 有下述兼容风险 |
| 账号白名单按平台能力提供上游模型同步 | 已继承 | 使用新版 ModelWhitelistSelector 和 useModelWhitelist；与 F5 的渠道定价目录同步不同 |
| 全平台单用户限额编辑与显示 | 已继承 | 用户管理页使用新版 UserPlatformQuotaModal / UserPlatformQuotaCell；系统默认和认证来源默认限额另见 F2 |
| 个人资料的用户名草稿、邮箱绑定草稿和通知邮箱验证码计时修复 | 已继承 | 实际路由使用 JFProfileView，其引用了新版 ProfileEditForm、ProfileIdentityBindingsSection、ProfileBalanceNotifyCard；目录中的另一份 ProfileView 不作为当前路由判断依据 |
| 公告已读确认失败时正确报错 | 已继承 | 顶栏使用新版 AnnouncementBell 和 announcements store |
| Esc 只关闭顶层弹窗、选择器禁用时自动收起 | 已继承 | 复用新版 BaseDialog、Select、ProxySelector |
| 批量用户限额修改的错误提示 | 已继承 | 使用新版共享 BulkEditUserModal |
| RPM 覆写数值、分组倍率过期响应、定时测试结果归属 | 已继承 | 使用新版 GroupRPMOverridesModal、GroupRateMultipliersModal、ScheduledTestsPanel |
| 用量清理任务和监控模板的旧响应保护 | 已继承 | 使用新版 UsageCleanupDialog、MonitorTemplateManagerDialog |
| 透传规则启用状态修复 | 已继承 | 使用新版 ErrorPassthroughRulesModal |
| 渠道追加模型不改写已留空的价格 | 已继承 | 渠道页仍使用新版共享 PricingEntryCard；与 B1 的整个平台段同步请求不是同一逻辑 |
| 批量生图访问查询失败后重试 | 已继承 | 侧栏和管理仪表盘引用新版 useBatchImageAccess |
| 二次验证并发弹窗、合规重置状态隔离、OAuth 验证码卸载后不再启动冷却 | 已继承 | 复用新版 useStepUp、adminCompliance、PendingOAuthCreateAccountForm |
| 缩放价格的科学计数法、亚字节吞吐量单位 | 已继承 | 复用新版 pricing 和 format 工具；jiufeng 的 opsFormatters 仍从共享 format 引入 formatBytes |
| 模型广场、订单、支付结果、提示词审计、风险控制等路由入口 | 未发现入口缺失 | 路由路径完整、组件存在；提示词审计使用共享 feature 包装，其他页面保留相应实现。本结论不等于已经对真实业务接口逐项联调 |

**额外的样式兼容风险（不计入上述 14 项确认差异）**

新版 AccountTableFilters 的直接子元素从“搜索 / 各选择器”变为“主筛选整行 / 更多筛选整行”。jiufeng 在 ≥1280px 时仍把 `> :first-child` 限宽为 180–256px，把其他直接子元素限宽为 110–160px。这会把新版的整行容器当成旧版单控件处理。需在桌面宽度下验证主筛选与展开后的布局，并更新选择器；功能实现本身已经继承，不能直接记为缺失。

证据：[旧桌面样式 jf-studio.css:766](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/views/home-jiufeng/jf-studio.css:766)、[新版 AccountTableFilters:2](C:/Users/鲜鑫/Downloads/sub2api/frontend/src/components/admin/account/AccountTableFilters.vue:2)。

建议优先同步 F1 / F2 和 B3 / B7 / B8，分别恢复新平台管理入口、默认限额入口，并补齐设置保存与支付页面离开后的保护。其次同步 F3、其余异步请求保护和平台名称展示。F1 与 F5 应一起处理。

本次只进行前端源码和引用关系核对，没有修改前端、路由或后端代码；仅新增本报告。未安装依赖、执行生产构建、打开真实业务系统，或进行真实支付 / 注册 / 插件操作。缺失判断来自代码差异与实际路由引用；竞态影响依据代码逻辑分析，桌面布局单独标为待视觉验证。
