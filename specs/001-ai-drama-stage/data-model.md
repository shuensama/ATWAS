# Data Model: AI 情景剧舞台（多 AI 角色轮流对话）

本文件定义 AI 情景剧舞台特性的核心领域模型与持久化数据结构，用于指导 Prisma schema 与数据库设计，并支撑 API 契约与实现。

实体来源于 spec 中的「Key Entities」与 Functional Requirements：  
User, SceneTemplate, RoleTemplate, DramaSession, Turn。

---

## 1. 概览与关系图（概念层）

```text
User
 ├─< SceneTemplate
 ├─< RoleTemplate
 └─< DramaSession
       ├─< DramaSessionRole  >─ RoleTemplate
       └─< Turn
```

- 一个 `User` 拥有多个场景模板 (`SceneTemplate`)、角色模板 (`RoleTemplate`) 与情景剧会话 (`DramaSession`)。
- 一个 `DramaSession` 引用一个场景模板（或内联场景快照），并在多对多关系中关联 2–6 个角色模板。
- 一个 `DramaSession` 中包含多条 `Turn`，按照轮次顺序记录多角色轮流发言内容。
- `DramaSessionRole` 记录每个会话内的角色参与信息（角色顺序、别名、快照等），避免模板后续编辑影响历史会话。

---

## 2. 实体定义与字段

以下类型以 Prisma/PostgreSQL 为参考（不要求逐字段完全一致，但应保持语义）。

### 2.1 User

代表使用本应用的个人用户。

- `id: string (uuid)` — 主键
- `email: string` — 唯一邮箱（如使用 Email 登录）
- `name: string?` — 显示名称
- `avatarUrl: string?` — 头像（可选）
- `createdAt: DateTime`
- `updatedAt: DateTime`

**关系**：

- `sceneTemplates: SceneTemplate[]`
- `roleTemplates: RoleTemplate[]`
- `dramaSessions: DramaSession[]`

**关键约束**：

- `email` 唯一索引。
- 删除 User 时默认不级联物理删除模板与会话，避免误删历史记录；可采取软删策略。

---

### 2.2 SceneTemplate（场景模板）

描述情景剧整体背景和气氛的文本设定。

- `id: string (uuid)` — 主键
- `userId: string (uuid)` — 所属 User
- `title: string` — 场景名称（用于列表展示与搜索）
- `description: string` — 详细场景描述（用于生成对话的 prompt）
- `tags: string[]` — 标签（题材、情绪、时代背景等），可用 Postgres `text[]` 或 JSONB 存储
- `createdAt: DateTime`
- `updatedAt: DateTime`
- `lastUsedAt: DateTime?` — 最近一次被用于 DramaSession 的时间
- `isArchived: boolean` — 是否归档（可选，用于未来管理）

**校验与规则**：

- `title` 必填，长度建议 1–100 字符。
- `description` 建议提供足够上下文（长度下限，如 20 字符），UI 端可提示用户「描述越详细，效果越好」。

---

### 2.3 RoleTemplate（角色模板 / AI 演员）

用于驱动单个 AI 演员行为的人设设定。

- `id: string (uuid)` — 主键
- `userId: string (uuid)` — 所属 User
- `name: string` — 角色名称（如「悲观诗人」「乐观工程师」）
- `shortBio: string` — 简短背景简介（用于列表与预览）
- `background: string` — 更完整的角色背景描述
- `style: string` — 说话/行为风格说明（语气、节奏、口头禅等）
- `tags: string[]` — 标签（如「搞笑」「严肃」「导师型」）
- `avatarUrl: string?` — 可选头像/图标
- `createdAt: DateTime`
- `updatedAt: DateTime`
- `lastUsedAt: DateTime?` — 最近使用时间
- `sourceType: enum('manual', 'ai-generated')` — 区分手工创建与 AI 生成

**校验与规则**：

- `name` 必填且在同一 User 下应具备基本可区分性（可在 UI 做重复提示）。
- AI 生成的角色在保存为模板前需要允许用户编辑 `background` 与 `style`。

---

### 2.4 DramaSession（情景剧会话）

一次实际的情景剧演出实例。

- `id: string (uuid)` — 主键
- `userId: string (uuid)` — 发起该会话的 User
- `sceneTemplateId: string? (uuid)` — 引用的场景模板（如果基于模板创建）
- `sceneSnapshot: jsonb` — 启动时使用的场景快照（包含 title/description/tags），即使模板后续修改也不影响历史会话
- `title: string` — 会话标题（可默认使用场景名称 + 时间，如「酒馆邂逅 · 2025-11-27」）
- `status: enum('draft', 'running', 'paused', 'completed', 'cancelled', 'failed')`
- `configTotalRounds: int` — 预设总轮数（例如 10 轮）
- `configMaxRoles: int` — 实际参与的角色数（2–6）
- `currentRound: int` — 当前已完成轮数（从 0 开始计数）
- `currentRoleIndex: int` — 当前/下一发言角色在会话内的轮流顺序索引（0..n-1）
- `createdAt: DateTime`
- `updatedAt: DateTime`
- `startedAt: DateTime?`
- `endedAt: DateTime?`
- `lastError: string?` — 最近一次生成失败的概要错误信息（系统内部可见，UI 只显示友好文案）

**关系**：

- `roles: DramaSessionRole[]`
- `turns: Turn[]`

**校验与规则**：

- 启动演出前必须保证 `roles` 数量在 `[2, 6]` 之间，否则拒绝启动并给出提示（满足 FR-001）。
- `configTotalRounds` 需为正整数，对超过推荐上限（例如 20）时在 UI 上给出「可能影响体验」的确认提示。

---

### 2.5 DramaSessionRole（会话内角色参与）

作为连接 `DramaSession` 与 `RoleTemplate` 的中间表，固定每个会话中角色的顺序和快照。

- `id: string (uuid)` — 主键
- `sessionId: string (uuid)` — 所属 DramaSession
- `roleTemplateId: string? (uuid)` — 源角色模板 ID（如果来源于模板）
- `displayName: string` — 本场演出中展示给用户的角色名（可不同于模板原名）
- `roleSnapshot: jsonb` — 启动时角色设定的快照（name/background/style/tags 等）
- `orderIndex: int` — 该角色在轮流顺序中的位置（0..n-1）
- `avatarUrl: string?` — 当前会话中使用的头像快照

**校验与规则**：

- 同一 `sessionId` 下 `orderIndex` 必须连续且唯一。
- 支持在会话创建时对角色名称/头像进行轻微修改而不影响模板。

---

### 2.6 Turn（对话轮次）

DramaSession 内的单轮发言单元。

- `id: string (uuid)` — 主键
- `sessionId: string (uuid)` — 所属 DramaSession
- `roleId: string (uuid)` — 对应的 DramaSessionRole ID（非直接 RoleTemplate）
- `roundIndex: int` — 轮次编号（0..configTotalRounds-1）
- `sequenceInRound: int` — 该轮内的顺序索引（通常为 0，因为默认一轮 = 一个角色发言；如未来扩展一轮多发言，可使用）
- `content: string` — 穿给前端展示的最终文本内容
- `rawModelResponse: jsonb?` — 原始模型返回（可选，便于未来调试与质量分析）
- `createdAt: DateTime`
- `durationMs: int?` — 从触发生成到收到完整结果的耗时（毫秒），用于性能分析

**校验与规则**：

- `(sessionId, roundIndex, roleId)` 组合应唯一，避免重复插入同一轮同一角色的发言。
- 当某次生成失败时可以写入错误 Turn（或通过 `lastError` + 状态记录），并允许用户重试生成或跳过该轮（对应 Edge Case 要求）。

---

## 3. 状态机与演出控制

### 3.1 DramaSession.status 状态流转

```text
 draft  --(开始演出)-->  running  --(用户暂停)-->  paused  --(继续)--> running
   |                           |                        |
   |                           |                        +--(用户结束)--> completed
   |                           |
   |                           +--(到达预设轮数/自然结束)--> completed
   |
   +--(用户取消/删除)--> cancelled

 running/paused --(严重错误)--> failed
```

- **draft**：用户已配置场景与角色但尚未开始生成。
- **running**：系统正在按轮次生成对话；P1 path 中应支持手动触发「下一轮」或自动推进。
- **paused**：用户点击暂停后，新轮次生成被阻止，直到恢复。
- **completed**：达到预设轮数或用户主动结束演出。
- **cancelled**：用户在未完成的情况下放弃该会话。
- **failed**：连续错误或严重系统故障导致演出无法继续（UI 需给出明确提示）。

### 3.2 演出推进逻辑（drama-orchestrator 概念）

每次生成下一轮对话时：

1. 从 `DramaSession` 读取当前 `status`, `currentRound`, `currentRoleIndex`。
2. 验证 `status` 必须为 `running` 或 `paused`（仅允许在 `running` 或由 `paused` 切回 `running` 后继续生成）。
3. 根据 `DramaSessionRole` 的 `orderIndex` 计算本轮应发言的角色。
4. 从 `Turn` 表中读取已有历史（用于构造 prompt 上下文），并结合 `sceneSnapshot` 和 `roleSnapshot` 生成 prompt。
5. 调用 LLM 客户端生成内容，落库为新的 `Turn`，并更新 `currentRound` 与 `currentRoleIndex`。
6. 如已达到 `configTotalRounds`，将 `status` 置为 `completed`。

该逻辑应封装在纯函数/可测试模块中，以便为后续单元测试与 smoke 脚本复用。

---

## 4. 与 Functional Requirements 对齐检查

对照 spec 中的核心 FR：

- **FR-001 / FR-002 / FR-003**：
  - `DramaSession` + `DramaSessionRole` + `Turn` 支持配置场景 prompt、2–6 名 AI 演员及轮流顺序和总轮数；
  - 状态机与 `currentRound/currentRoleIndex` 字段支持自动轮流与「暂停/继续/手动下一轮/结束」。

- **FR-004 / FR-005 / FR-006 / FR-007 / FR-008 / FR-009**：
  - `SceneTemplate` / `RoleTemplate` 字段设计支撑模板保存、搜索/筛选、编辑、删除与快速预览；
  - 角色/场景的快照字段（`sceneSnapshot/roleSnapshot`）保障在会话中实际使用的设定与启动时确认的配置一致，并为在新演出中基于模板或历史会话配置做高效复用提供结构化基础，同时为需要时的一键复制导出提供数据来源。

- **FR-011 / FR-012 / FR-013**：
  - `DramaSession` + `Turn` 的持久化设计支持完整历史保存与详情回看；
  - 通过 `status` 与 `currentRound`/`currentRoleIndex` 能够从中断处恢复；
  - `createdAt/endedAt` 等字段支持历史列表排序与清理策略。

整体上，以上数据模型满足当前 S1 阶段需求，并为后续扩展（多用户协作、更复杂角色关系、评分/收藏等）预留了扩展点。
