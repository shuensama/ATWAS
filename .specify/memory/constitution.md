<!--
Sync Impact Report
Version change: (initial) → 1.0.0

Modified principles:
- [PRINCIPLE_1_NAME] → P1. 简单可维护优先
- [PRINCIPLE_2_NAME] → P2. 最小可行测试基线
- [PRINCIPLE_3_NAME] → P3. 单人节奏的开发工作流
- [PRINCIPLE_4_NAME] → P4. 性能与资源使用基线
- [PRINCIPLE_5_NAME] → P5. 可观测性与错误处理

Added sections:
- Core Principles（针对单人 MVP 项目具体化）
- 工程与质量基线
- 开发流程与质量闸门

Removed sections:
- None

Templates requiring updates (✅ updated / ⚠ pending):
- ✅ .specify/templates/plan-template.md（更新 Constitution Check 指南以匹配 P1–P5）
- ✅ .specify/templates/tasks-template.md（测试基线与阶段说明对齐宪章）
- ✅ .specify/templates/spec-template.md（已检查，无需修改即可兼容宪章）
- ✅ .specify/templates/checklist-template.md（已检查，无需修改即可兼容宪章）
- ✅ .specify/templates/agent-file-template.md（已检查，无需修改即可兼容宪章）
- ⚠ .specify/templates/commands/*.md（目录不存在，无法检查命令文件）

Deferred TODOs:
- None
-->

# ATWAS Constitution

## Core Principles

### P1. 简单可维护优先

目标：用尽可能简单的方案交付可维护的 MVP，避免过早复杂化和难以理解的架构。

在 ATWAS 中，代码必须满足：

- MUST 优先使用简单的数据结构和线性流程；只有在出现明确性能瓶颈或业务复杂度需求时，
  才引入复杂模式（例如 DDD、CQRS、事件总线等）。
- MUST 控制代码粒度：单个函数通常不超过约 40 行、单个文件通常不超过约 400 行；
  若明显超出，应考虑拆分，并在提交信息中简单说明原因。
- MUST 避免不必要的多项目 / 多服务拆分。默认结构为单仓库的 `src/`（代码）+ `tests/`
  （测试）。若增加新子项目或服务，必须在 `plan.md` 的 “Complexity Tracking” 表中记录
  Violation、原因和被拒绝的简单替代方案。
- SHOULD 谨慎引入第三方依赖。每个新增依赖必须在 `plan.md` 中用一句话说明用途和不可替代性。

**Rationale**：单人开发的主要风险是维护成本和心智负担失控。
强制简单、可读、结构平坦，可以在很长一段时间内保持「看得懂、改得动」。

### P2. 最小可行测试基线

目标：在不拖垮迭代速度的前提下，为核心行为提供可重复验证，避免关键回归。

- 对每个 P1 用户故事，MUST 至少存在一条可重复的验证路径：
  - 优先为自动化测试（单元测试、端到端脚本、简单调用脚本等），放在 `tests/` 或脚本目录；
  - 若因时间或技术原因暂只做手动验证，必须在该特性的 `quickstart.md` 或 `spec.md`
    中写出清晰的「验证步骤」。
- Bug 修复 MUST 附带一个能复现该 bug 的测试用例或文字步骤，并在修复后执行一次确认通过。
- 涉及金额计算、权限判断等关键业务逻辑 SHOULD 通过自动化测试覆盖主要正常路径和关键
  边界条件。
- 当实现时间 < 0.5 天且功能预期寿命 < 2 周时，可以不写自动化测试，但 MUST 在 `plan.md`
  中记录豁免理由。
- 测试（或验证脚本）命名 MUST 清晰表达行为，例如
  `test_user_can_login_with_valid_credentials` 或等价的中文描述。

**Rationale**：单人 MVP 开发容易在时间压力下完全省略测试。
设定「最小可行测试基线」保证关键路径和 bug 修复可以被重复验证，从而控制回归成本。

### P3. 单人节奏的开发工作流

目标：保持单人可以管理的节奏与上下文，同时保留足够的可追踪性和质量控制。

- 新功能默认流程：
  `/speckit.spec`（用户故事 + 验收标准）
  → `/speckit.plan`（技术方案 + Constitution Check）
  → `/speckit.tasks`（任务拆分）
  → 开发与验证。
- 每个 feature 分支的工作量 SHOULD 设计为 1–3 天内可以完成。若明显超过，必须拆分成更小
  的子 feature 或阶段。
- 主分支（`main` / `master`）MUST 始终保持可运行状态：
  - 禁止在未满足 P2「最小测试基线」前合并；
  - 禁止已知会破坏现有 P1 用户故事的变更直接进入主分支。
- 提交粒度：MUST 以「可解释且可回滚」为单位提交，每个提交信息应包含：
  - 关联的用户故事或任务编号；
  - 变更类型（新功能 / 重构 / bug 修复）；
  - 简要说明验证方式（例如「本地跑过脚本 X」）。
- 对非常小的修复（文案修正、明显小 bug），允许 Fast Path：
  可以略过完整的 spec/plan，但 commit message 中 MUST 写明问题来源和验证方式。

**Rationale**：单人开发没有团队评审机制，容易陷入「一大坨改动」。
通过轻量工作流和提交规范，保证出现问题时仍然能快速定位和回滚。

### P4. 性能与资源使用基线

目标：避免明显的性能坑和资源浪费，同时不做过早优化。

- 默认前提：在个人开发机器上，单次典型操作（一次 HTTP 请求、一条 CLI 命令等）
  SHOULD 在 1 秒内完成。若无法满足，必须在该特性的 `spec.md` 的 `Success Criteria`
  中说明当前预期表现和原因。
- 对性能敏感的特性（批处理、大列表渲染、复杂计算等）MUST 在 `Success Criteria` 中写出
  至少一项可度量指标（例如「处理 10k 条记录在 5 秒内完成」）。
- 实现过程中若引入潜在 O(n²) 或更高复杂度的逻辑，MUST 在 `plan.md` 中明确记录输入规模
  假设（例如「预计最多 1k 条记录」），避免后期出现隐形性能瓶颈。
- 日志或监控代码 MUST 不得在高频热路径中做明显昂贵操作（例如在紧密循环内频繁写磁盘、
  大量同步网络请求等）。

**Rationale**：MVP 阶段容忍一定性能欠账，但不能接受「一开始就明显不能用」。
通过简洁的基线约束，将性能风险控制在可预期范围内。

### P5. 可观测性与错误处理

目标：在没有复杂监控系统的前提下，仍然能够快速定位问题和回溯错误。

- 每个对外接口（HTTP、CLI、定时任务等）MUST 至少有一种错误观测方式：
  - 明确的返回码 / 状态；
  - 或含上下文信息的日志记录。
- 关键错误（可能导致数据损坏、用户请求失败）MUST 记录带有上下文的日志：
  - 包含必要的标识（例如用户 ID、请求参数摘要等）；
  - 避免只写「出错了」之类无意义信息。
- 业务可预期错误（用户输入不合法、资源不存在等）MUST 使用清晰可理解的错误消息反馈，
  而不是仅在日志中体现。
- 临时调试日志 SHOULD 在 feature 完成前清理或降级到调试级别，避免长期污染日志。

**Rationale**：单人开发时，排查问题的主要工具就是日志与简单观测。
通过约束错误处理和日志质量，可以在没有复杂基础设施的情况下保持可诊断性。

## 工程与质量基线

本节定义与技术栈无关的工程与质量基线，适用于 ATWAS 中的所有代码库。

- **代码风格**：
  - 每种主语言 MUST 配置自动格式化工具（例如 `prettier`、`black`、`gofmt` 等）；
  - 提交前 SHOULD 确保关键文件已经格式化，避免无意义 diff。
- **静态检查**：
  - 若语言生态有成熟的 Lint / 静态分析工具，在可接受时间成本下 SHOULD 启用；
  - 若显式关闭或忽略某类检查，MUST 在 `plan.md` 中说明原因。
- **配置与敏感信息**：
  - 密钥、访问令牌等敏感信息 MUST 不直接提交到仓库；
  - 配置 MUST 通过环境变量或配置文件注入，并在 `quickstart.md` 中说明如何配置本地开发环境。
- **依赖管理**：
  - 语言或包管理器支持锁文件时（如 `package-lock.json`、`poetry.lock` 等），MUST 使用锁文件；
  - 升级依赖时 SHOULD 至少执行一次快速回归（运行关键脚本或测试）。
- **项目结构**：
  - 默认项目结构为单仓库 + `src/` + `tests/`；
  - 引入多项目 / 多服务结构时，MUST 通过 P1 原则下的复杂度审查，并在 `plan.md` 的
    “Project Structure” 与 “Complexity Tracking” 中记录理由。

## 开发流程与质量闸门

本节描述 ATWAS 在单人 MVP 场景下的标准开发流程以及与宪章绑定的质量闸门。

### 工作流阶段（单人 MVP）

1. **构思与需求收集（Idea）**
   - 记录在 issue、简单文档或 `spec.md` 的草稿中。
2. **规格说明（/speckit.spec）**
   - 至少包含一个 P1 用户故事及其验收场景；
   - 若是简单 bug 修复，可在 commit message 中内联简化版「Given/When/Then」。
3. **技术方案与宪章检查（/speckit.plan）**
   - 描述主要技术决策、项目结构和依赖；
   - 在 `Constitution Check` 部分逐条回答 P1–P5 是否满足或有例外。
4. **任务拆分（/speckit.tasks）**
   - 按用户故事拆分任务，标注优先级和可并行性；
   - 对 P1 用户故事添加满足 P2「最小测试基线」所需的验证任务。
5. **实现与验证**
   - 按任务顺序实现，保持主分支可运行；
   - 执行自动化测试和手工验证，更新 `quickstart.md`。
6. **合并与回顾**
   - 合并前确认通过质量闸门；
   - 可选地在开发指南中添加 1–3 条经验或踩坑记录。

### 质量闸门（Gates）

- **Gate 0 — Constitution Check（文档层）**
  - 在 `/speckit.plan` 的 `Constitution Check` 部分逐条检查：
    - P1 是否引入了可以接受的复杂度；
    - P2 是否为 P1 用户故事定义了最小测试基线；
    - P3 是否控制了工作量和分支粒度；
    - P4 是否为性能敏感点定义了 Success Criteria；
    - P5 是否定义了基本的日志 / 错误处理策略。
  - 任何违反项 MUST 记录在 “Complexity Tracking” 表中（Violation / Why Needed /
    Simpler Alternative）。

- **Gate 1 — 最小测试基线**
  - 合并前，MUST 确认所有 P1 用户故事都已满足 P2 中的最小测试要求；
  - 必须至少执行一次这些验证（自动化测试或手动脚本），并在 plan 或 commit message 中简要说明。

- **Gate 2 — 性能与冒烟验证**
  - 对在 `Success Criteria` 中声明的性能目标做一次简单验证；
  - 如果尚无条件验证，MUST 在 `spec.md` 中说明原因并记录 TODO。

- **Gate 3 — 简短回顾（可选但推荐）**
  - feature 合并主分支后，建议在 `ATWAS Development Guidelines` 或相关文档中补充：
    - 此次改动对架构或流程的影响；
    - 一条可以指导后续特性的经验或踩坑。

## Governance

ATWAS 宪章用于约束单人 MVP 项目的开发治理，并优先于其他工程实践文档。

- **优先级与适用范围**
  - 当其他文档（plan/spec/tasks/checklist 等）与本宪章冲突时，本宪章原则优先；
  - 若有显式记录的例外（在 plan、Complexity Tracking 或文档中说明），则以该例外为准。

- **版本与变更策略（Semantic Versioning）**
  - `MAJOR`：对现有流程或原则做不兼容调整（例如删除或彻底重写某个核心原则）；
  - `MINOR`：新增原则、新增章节，或对现有原则进行实质性扩展；
  - `PATCH`：措辞澄清、示例修正、格式调整等不改变实际含义的修改。

- **修订流程**
  - 宪章变更 MUST 在单独的 commit 中完成；
  - 必须更新：
    - 本文件顶部的 **Sync Impact Report**（版本变化、受影响原则、模板同步情况）；
    - 文末的 **Version / Ratified / Last Amended** 信息；
  - commit message SHOULD 使用形如：
    `docs: amend constitution to vX.Y.Z (简要说明主要变更)` 的格式。

- **合规检查与执行**
  - 在创建新的 `plan.md` 或重大重构前，开发者 MUST 自查是否仍然遵守本宪章；
  - `/speckit.plan` 生成的 `Constitution Check` 区域应反映本宪章的 P1–P5 原则；
  - 任何违反项只要被清晰记录并有合理理由，即视为「在治理之下的例外」。

- **定期回顾**
  - 建议每完成 3 个 feature 或每 1 个月，对本宪章的适配性做一次轻量回顾；
  - 如需调整，依据变更影响选择 MINOR 或 PATCH 级别更新版本。

- **运行时开发指引**
  - 日常开发中的更细致技巧和实践，建议汇总在 `ATWAS Development Guidelines`
    文档中（由 agent-file 模板生成并按需更新），作为本宪章的补充说明。

**Version**: 1.0.0 | **Ratified**: 2025-11-16 | **Last Amended**: 2025-11-16
