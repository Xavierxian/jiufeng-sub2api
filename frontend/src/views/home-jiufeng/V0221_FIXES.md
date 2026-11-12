# v0.2.21 前端对齐

本次仅修改 `frontend/src/views/home-jiufeng/` 内的文件，沿用项目已经升级到 v0.2.21 的共享 API、类型、组件和工具函数。

| 项目 | 补齐内容 |
| --- | --- |
| 渠道及账号统计价格 | 补齐 `cache_write_12h_price` 初始化、接口回显和提交转换，保留空值与零价格，继续按每百万 Token 展示、每 Token 提交 |
| 分组价格 | 补齐独立 12h 缓存写入价的新建、回显和保存 |
| 管理员充值倍率 | 输入步长和最小值改为 0.000001，预览复用官方最多 6 位小数格式化函数 |
| 用户充值预览 | 展示完整充值倍率，不再固定截成两位小数；金额展示规则不变 |
| 用量缓存明细 | 增加 12h 标记和 30m/12h 明细；无明细的历史记录仍展示聚合值；管理员和用户页共用此实现 |
| API 密钥列表 | 列表与统计分别结束加载，统计未返回时显示占位，沿用取消请求机制防止旧结果覆盖新页面 |
| 账号列表刷新 | 已有数据刷新时保留行及用量组件，通过 aria-busy/inert 表示忙碌并阻止表内操作；首次加载仍显示骨架屏 |
| 系统设置保存按钮 | 增加表单内的底部吸附保存栏及深色样式，兼顾移动端底部安全区，沿用原有提交与禁用条件 |

## 回归验证

验证日期：2026-11-12。

- jiufeng 全部测试及语言键检查：56 个文件、378 项测试通过。
- 新增或扩展测试覆盖：渠道/账号统计/分组价格的读取与提交、空值与零价格、充值倍率输入精度和用户预览、缓存 TTL 明细及历史记录、密钥统计慢请求/失败/翻页竞态/空列表、账号刷新保留行及失败后的忙碌状态清理。
- `vue-tsc --noEmit` 通过。
- Vite 生产构建通过；仍有分包体积等现有提示。
- 对目录外 4,652 个文件进行 SHA-256 核对，没有新增、修改或删除；目录外已有的路由、部署和工作流改动保持原样。
- 使用模拟 API 验证前端行为，未连接真实业务后端，也未执行浏览器视觉验收。

依赖、缓存、源码验证副本、日志和构建产物均位于本目录被忽略的 `.validation/` 内。没有向项目默认的后端静态资源目录写入构建文件。

在 `.validation/frontend/` 中使用的验证命令：

```powershell
node node_modules/vitest/vitest.mjs run src/views/home-jiufeng src/i18n/__tests__/localeKeyCompleteness.spec.ts --no-cache --maxWorkers=2 --minWorkers=1 --reporter=dot
node node_modules/vue-tsc/bin/vue-tsc.js --noEmit
node node_modules/vite/bin/vite.js build --outDir ../dist --emptyOutDir
```
