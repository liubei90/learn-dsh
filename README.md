# DSH 深度解析文档

> 一套面向"理解"的 DeepSeek Harness 项目分析：**先通俗、后精确**，覆盖系统架构、AI 开发规范、设计规范、模块明细与自迭代机制。

本套文档基于仓库 `/home/liubei/deepseek-harness` 的 `master` 分支（提交 `d743267388`，包版本 `0.2.1-alpha.2`）撰写。所有技术论断均标注来源文件路径，可直接回到仓库核对。

---

## 一、一页速览

| 维度 | 结论 |
|---|---|
| 项目是什么 | DeepSeek AI 开源的 agent harness（`dsh`），"一切皆插件" |
| 技术底座 | Cordis 插件框架（vendored）+ TypeScript/ESM + pnpm workspaces |
| 规模 | 331 个 npm 包、52 个能力族、4 个应用入口（cli/web/desktop/desktop-host） |
| 形态 | Web GUI（`dsh web`）、桌面应用（Electron）、CLI/无头、SDK、ACP |
| 三条铁律 | ① 一切皆插件 ② 模型可见 ⟺ 已记录 ③ 能力缝三段式（Definition/Provider/Consumer） |
| 组合方式 | profile → bundle → 有序 patch → 插件树；`dsh --profile web --dump-config` 可打印 |
| 循环模型 | turn（一次输入排空）⊃ step（一次模型请求+工具）> round（外层策略迭代） |
| 规范强项 | 规则集中在根 `AGENTS.md`；文档分层"一个事实一个家"；决策进 Agent Notes；生成器+校验门禁防漂移 |
| 自迭代 | 运行时：`packages/extensions` 让模型检视 live 插件并挂载/卸载；仓库级：agent 改代码 → 生成器 → 门禁 → 快照 → 决策记忆 |
| 风险提示 | developer preview，官方声明会有破坏性变更 |

## 二、文档目录

| 篇目 | 讲什么 | 适合谁 |
|---|---|---|
| [00-项目全景](00-项目全景.md) | 十分钟看懂：定位、三大思想、一次对话的全过程、目录地图、怎么跑起来 | 所有人 |
| [01-系统架构](01-系统架构.md) | 插件内核、启动与组合链路、agent loop 时序、事件体系、会话数据平面、能力缝、执行与隔离、扩展点总表 | 架构师、准备改核心的人 |
| [02-AI开发规范](02-AI开发规范.md) | 根 AGENTS.md 规则速查、文档分层 tier 体系、Agent Notes 制度、16 个 skill、测试与快照规范、生成/校验门禁、Git 与 PR 流程 | 贡献者、想学"AI 协作工程化"的人 |
| [03-设计规范](03-设计规范.md) | 每条设计规则的"规则 → 意图 → 正例/反例"，含错误处理、防御模式、持久化变更、UI 与工具设计 | 写代码的人、review 的人 |
| [04-模块说明](04-模块说明/README.md) | 8 卷模块手册：内核、模型、工具执行、编排、数据、界面、接口、工程设施 | 需要定位模块的人 |
| [05-自迭代实现方案](05-自迭代实现方案.md) | 运行时自修改 + 仓库级自改进闭环，含端到端案例与风险边界 | 想理解"自我演进"的人 |
| [06-附录](06-附录-术语表与关键文件索引.md) | 术语表（含中英对照）、按"我要做什么"组织的关键文件索引 | 随时查阅 |

模块手册 8 卷：

| 卷 | 内容 |
|---|---|
| [01 内核与会话运行时](04-模块说明/01-内核与会话运行时.md) | core / session / session-query / typert |
| [02 模型与上下文](04-模块说明/02-模型与上下文.md) | llm / context / compaction / skill |
| [03 工具与执行环境](04-模块说明/03-工具与执行环境.md) | fs / shell / subprocess / ssh / sandbox / terminal / ptc-runtime / web / lsp / mcp / computer-use / browser-use / document / todo |
| [04 编排自动化与自修改](04-模块说明/04-编排自动化与自修改.md) | subagent / jobs / workflow / schedule / goal / plan / guard / preset / bundle / extensions / feedback / interaction / deliverables |
| [05 数据身份与用户状态](04-模块说明/05-数据身份与用户状态.md) | storage / workspace / settings / credentials / attachment / spill / identity / telemetry |
| [06 界面与交互层](04-模块说明/06-界面与交互层.md) | client / host / apps（cli、web、desktop、desktop-host） |
| [07 开发者接口与集成](04-模块说明/07-开发者接口与集成.md) | api / sdk / acp / boot |
| [08 工程质量与支撑设施](04-模块说明/08-工程质量与支撑设施.md) | util / test-support / experimental / benchmarks / scripts / snapshots / vendor / native / python |

## 三、三种阅读路线

**路线 A · 只想快速理解 DSH（约 1 小时）**
`00 → 01 的前三节 → 06 附录术语表`

**路线 B · 要动手改代码（约半天）**
`00 → 01（全部）→ 03（全部）→ 02（测试与门禁部分）→ 06（关键文件索引）`

**路线 C · 研究"自迭代 / AI 协作工程"（约 2 小时）**
`00 → 05（全部）→ 02（Agent Notes 与门禁部分）→ 01（扩展点总表）`

## 四、使用须知

- **来源纪律**：每篇的技术结论都标注来源（`来源：path/to/file`）。若你发现某条与仓库不符，以仓库为准——仓库是唯一权威。
- **时效性**：项目处于 developer preview，文档可能随版本变化。核对时先看 `git log` 与包版本。
- **不含的内容**：本套文档不复制仓库内的生成目录全文（config-catalog、persistence-catalog、module-graph 等），需要时请直接查原文。
- **本篇与其他篇的关系**：本篇与 `00-项目全景` 是入口；`01/02/03` 是三大主干；`04` 是查阅手册；`05` 是收束；`06` 是工具书。

## 五、核查与已知的“上游文档不一致点”

本套文档写完后做了一轮独立核查：5 个互不相同的核查者各自打开仓库原文，对 16 篇中的约 400 条高风险断言（数字、包名、API 名、事件顺序、配置字段、门禁脚本）逐条比对，凡与仓库不符的用最小改动修正；另有 8 条根 `AGENTS.md` 规则被补入 [02-AI开发规范](02-AI开发规范.md) 的速查表。

核查中发现**仓库自身文档之间存在陈旧或口径不一致**，本套文档一律以源码与生成物为准，并在此列出，供你阅读上游文档时留意：

| 上游文档 | 它写的 | 实测（源码） | 证据 |
|---|---|---|---|
| `docs/architecture.md` 扩展点表 | `ctx.agents.create({ sessionId, seed, meta: { parentSession, seedLength } })` | 顶层字段是 `inheritedEventCount`，fork 标记是 `meta.isSeeded`；`seedLength` 是被 v4 拒绝的历史字段 | `packages/core/agent/src/index.ts:63-88`、`packages/core/session/src/index.ts:1388-1396` |
| `docs/architecture.md` 扩展点表 | `SessionPersistence`（`create`/`open`/`stat`/`list`/`export`） | 抽象方法是 `create`/`open`/`stat`/`list`/`flush`（无 `export`） | `packages/session/session-persistence/src/index.ts:152-203` |
| `docs/subsystems/core.md` | 核心事件 “thirteen” 个变体 | `SessionEventMap` 有 14 个键（含 `developer/message`） | `packages/core/session/src/types.ts`、`docs/subsystems/session.md:57` |
| `packages/README.md` 包组表 | extensions 组 = “live plugin/service inspection and model-written mount/unmount” | 当前发布态下模型只有两个只读检视工具；没有任何模型工具创建动态定义 | `packages/extensions/README.md`、`packages/extensions/cordis-host-runner/README.md` |

结论：**源码与生成物优先于叙述性文档**。上述上游不一致不作为本套文档的结论依据。

