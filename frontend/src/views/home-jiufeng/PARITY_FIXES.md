# v0.2.5 前端对齐修复记录

日期：2026-09-18。基准：本地 `v0.2.5-53-gefe9aab1e`。

本轮源码、测试及说明文件的修改全部位于 `frontend/src/views/home-jiufeng/`。没有修改外部路由、共享组件、API、语言文件或后端。目录外已有的 Git 改动与开始修复时的差异指纹一致。

## 已完成

| 问题 | 修复 |
| --- | --- |
| 兑换历史与分页接口不兼容 | 两份兑换页均读取 `items`/`total`，支持 20/50/100 条分页、翻页、失败恢复和过期响应保护；兑换后回到第一页；主页面展示整页记录，不再截断为 8 条 |
| 邮箱验证遗漏域名配额 | 读取域名配额开关，由后端执行配额判断，同时补齐专用错误提示；关闭开关时继续执行域名白名单检查 |
| 简易模式不能进入分组管理 | 增加 jiufeng 内的导航适配，侧栏与仪表盘快捷入口均可进入分组页，保留管理员权限检查 |
| 账号操作菜单内部滚动会关闭 | 忽略 `.action-menu-content` 内的滚动，页面外部滚动仍关闭菜单 |
| 订单筛选保留旧页码 | 切换状态回到第一页；手动刷新保留当前页 |
| 禁用优惠码时首屏闪现 | 初始状态读取已注入的公开设置；设置未知时不显示优惠码输入框 |
| 分组创建/更新丢失具体错误信息 | 使用共享的标准错误信息提取工具 |
| 订阅关闭检查晚于页面挂载 | 增加 jiufeng 组件的 `beforeRouteEnter` 检查，关闭订阅时在挂载前跳转；保留页面级兜底，设置请求失败不视为明确禁用 |

## 目录范围限制下的路由适配

外部全局路由仍在简易模式下拦截 `/admin/groups`，因此 jiufeng 使用现有管理员路由 `/admin/dashboard?view=groups` 承载分组页，正常模式继续使用 `/admin/groups`。

- `navigation.ts` 统一导航目标和菜单选中状态。
- `admin/DashboardView.vue` 作为页面选择器，按需加载分组页或原仪表盘。
- 原仪表盘实现保存在 `admin/DashboardOverview.vue`，避免访问分组时额外挂载仪表盘、请求图表数据。
- 在初次访问旧 `/admin/groups` 链接或从其他页面访问时，读取全局路由的 `redirectedFrom`，恢复分组目的地并规范化到兼容 URL。
- jiufeng 站内入口直接使用兼容 URL，支持直接刷新以及浏览器前进/后退。
- 未登录用户和普通用户仍由原全局管理员权限检查阻止访问。

订阅检查位于 `user/subscriptionAccess.ts`，由 `user/SubscriptionsView.vue` 的组件进入守卫使用，没有替换或修改全局路由。

## 验证

在 `frontend/` 下执行：

```powershell
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit
node node_modules/vitest/vitest.mjs run src/views/home-jiufeng src/i18n/__tests__/localeKeyCompleteness.spec.ts --no-cache --maxWorkers=4 --minWorkers=1 --reporter=dot
node node_modules/vite/bin/vite.js build --outDir src/views/home-jiufeng/.validation/dist --emptyOutDir
```

结果：

- TypeScript 检查通过，原先两处兑换记录类型错误消失。
- 25 个测试文件、155 项测试通过，其中 jiufeng 152 项、语言键完整性 3 项。
- 新增行为测试覆盖：两份兑换页的分页/失败恢复/响应乱序、域名配额、优惠码初始状态、订单筛选、菜单滚动，以及使用真实共享路由的管理员权限、分组导航、历史记录和订阅进入检查。
- Vite 生产打包通过，输出临时放在 jiufeng 目录内，未覆盖后端嵌入资源；临时产物已清理。
- 打包仍有现有依赖/分包体积类提示，不影响本次打包成功。

**外部路由单测的已知差异：** 单独运行 `src/router/__tests__/feature-access.spec.ts` 仍是 8 项通过、2 项失败，与修复前相同。这两项仅检查目录外全局守卫是否处理 `requiresSubscription`，不会执行组件进入守卫；由于本轮不能改动外部源码或测试，它们保留原状。新增 `navigation-access.spec.ts` 已通过实际路由验证“关闭订阅时在页面挂载前重定向”的用户行为。因此这里没有声称全仓库测试全部通过。

没有连接真实业务后端执行注册、兑换、支付或管理操作。
