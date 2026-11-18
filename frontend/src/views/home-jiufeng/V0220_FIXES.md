# v0.2.20 前端对齐

本次所有源码、测试和验证产物均放在 `frontend/src/views/home-jiufeng/` 内。

| 项目 | 实现 |
| --- | --- |
| MCP 连接管理 | 新增 `user/MCPView.vue`，沿用官方连接地址、授权列表及撤销授权流程，使用 jiufeng 布局 |
| MCP OAuth 授权 | 新增 `auth/MCPOAuthAuthorizeView.vue`，保留官方参数校验、权限选择、管理员二次验证、拒绝授权及返回地址校验，适配 jiufeng 页头 |
| MCP 导航 | 用户、管理员个人菜单、简易模式及移动菜单按共享 `mcp_enabled` 开关显示入口 |
| 注册邮箱黑名单 | 在系统设置的安全页挂载官方 `RegistrationEmailBlacklistEditor`，复用批量编辑、已注册用户检查及确认禁用流程 |
| CSV 导出 | 保留每页 1000 条、导出筛选快照和 CSV 分块生成；429 根据共享 API 客户端的 `retry_after_seconds` 等待，最多重试 3 次，等待限制为 1–60 秒并显示提示；其他 HTTP 错误直接报错 |
| 审计日志 | 增加 `MCP OAuth` 筛选项，使用现有查询和重置流程 |
| 邮箱错误提示 | 注册和邮箱验证页识别 `EMAIL_BLOCKED`，复用官方翻译 |

## 不修改共享 router 的路由适配

`mcpRoutes.ts` 保留官方 `/settings/mcp` 和 `/oauth/mcp/authorize` URL。
第一次进入时，现有共享路由的 catch-all 会加载 `JFNotFoundView`；其组件进入守卫注册两条路由并重新匹配原 URL，在 404 页面渲染前转入 MCP 页面。
组件更新守卫也处理从已显示的 404 页面进入 MCP 的情况。其他未知路径仍然显示 404。

重新匹配保留查询参数值和 hash，并再次执行现有全局登录与后台模式守卫。Vue Router 会规范化 URL 的百分号编码；OAuth 参数的实际值保持一致。
未登录访问时，现有守卫先进入登录页并保存完整目的地址，登录后再完成 MCP 路由适配。
安装函数可重复调用；如果共享路由将来已经定义了同名路由，则保留已有定义。

## 验证方式

由于原 `frontend/node_modules` 未安装依赖，为保持目录边界，在 `.validation/frontend/` 创建当前前端的验证副本；依赖、缓存、日志和输出也保存在 `.validation/` 中。
测试使用模拟 API，不发起真实授权、撤销、注册或批量禁用操作。

新增测试覆盖 MCP 页面、授权校验与二次验证、密码和第三方登录返回、真实共享路由的首次访问/登录重定向/404 更新、菜单开关、导出重试及审计筛选。
已有注册、邮箱验证和设置页测试补充黑名单集成检查。

验证结果（2026-11-09）：

- 53 个测试文件、363 项测试全部通过，包括 jiufeng 测试、共享黑名单编辑器测试和语言键完整性检查。
- `vue-tsc --noEmit` 通过。
- Vite 生产构建通过，产物位于 `.validation/dist/`。仍有已有的 Browserslist 数据和分包体积提示。
- 对目录外 4,619 个文件进行 SHA-256 核对：没有新增、修改或删除；目录外原有改动保持原状。
- 测试副本与实际交付源码逐文件比较一致。没有执行真实业务接口联调或浏览器视觉验收。
- 修正旧 `navigation-access.spec.ts` 的公共设置 mock，使全局及组件两层守卫都收到 Promise，并让“持续设置故障”测试正确模拟持续故障；没有改变订阅业务逻辑。

在 `.validation/frontend/` 中使用的验证命令：

```powershell
node node_modules/vitest/vitest.mjs run src/views/home-jiufeng src/i18n/__tests__/localeKeyCompleteness.spec.ts src/components/admin/settings/__tests__/RegistrationEmailBlacklistEditor.spec.ts --no-cache --maxWorkers=2 --minWorkers=1 --reporter=dot
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit
node node_modules/vite/bin/vite.js build --outDir ../dist --emptyOutDir
```

`.validation/` 已被 jiufeng 自身的 `.gitignore` 排除，不需要作为源码同步或发布。

## 复核后的三项补齐（2026-11-09）

- 手机端模型广场：移除 640px 以下的隐藏规则，继续使用原有功能开关和带 `embedded=1` 的入口。
- 手机端订阅概览：恢复共享订阅徽章与用量、到期时间弹层。手机顶栏改为上下两行，收紧控件间距；弹层以工具栏为定位容器，宽度不超过屏幕内的可用空间。
- 提示词审计：隐藏规则只作用于内嵌的官方应用顶栏，保留审计页的配置版本及更新时间。桌面继续使用外层页面标题，手机保留审计页自身标题。

本次源码仅修改 `JFAppHeader.vue`、`jf-studio.css` 和 `admin/JFPromptAuditView.vue`。

验证结果：

- 4 个相关测试文件、64 项测试通过；`vue-tsc --noEmit` 和 Vite 生产构建通过。
- 使用实际 Vue 组件和模拟数据，在本地无头 Chrome 中检查 320、375、390、640、641、1024、1440px，共 14 个深浅色/中英文场景：入口可见、配置版本和更新时间可见、订阅弹层及工具栏不横向溢出、弹层链接未被其他元素遮挡。
- 模型广场跳转保留 `embedded=1`；关闭模型广场和订阅功能开关后，对应入口不再挂载。
- 已查看手机端深浅色截图及审计信息截图。未连接真实业务后端，也未进行手机硬件实机测试。
- 验证脚本、模拟页面、浏览器结果和截图均位于 `.validation/`，不作为业务源码发布。
