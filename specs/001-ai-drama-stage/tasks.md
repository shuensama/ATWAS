---
description: "Implementation tasks for AI情景剧舞台（多 AI 角色轮流对话） feature"
---

# Tasks: AI情景剧舞台（多 AI 角色轮流对话）

**Input**: Design documents from `specs/001-ai-drama-stage/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/drama-stage.openapi.yaml`, `quickstart.md`

**Tests**: 合宪要求至少提供一条 P1 smoke path 脚本 `scripts/smoke/p1-ai-drama-stage.ts`；其余单元/集成/契约测试在 S1 为推荐但可按优先级选择性实现。

**Organization**: 任务按阶段与用户故事组织，确保每个用户故事可以独立实现与验证。

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 可并行执行（不同文件、无直接依赖）
- **[Story]**: 任务所属用户故事（US1, US2, US3）
- 所有任务描述中必须包含至少一个明确的文件路径

---

## Phase 1: Setup（项目与基础工具设置）

**Purpose**: 初始化 Next.js 项目骨架与通用开发环境，为后续特性实现提供基础。

- [ ] T001 初始化或更新 Next.js 14 App Router 项目骨架（`package.json`, `next.config.mjs`, `tsconfig.json`, `app/layout.tsx`, `app/page.tsx`），确保与 `plan.md` 中的单体应用结构一致。
- [ ] T002 [P] 安装并配置 Tailwind CSS 与 shadcn/ui（`tailwind.config.ts`, `postcss.config.mjs`, `app/globals.css`, `components/` 中基础 UI 目录），使其可在 `app/(drama-stage)/page.tsx` 中直接使用。
- [ ] T003 [P] 配置统一的 ESLint 与 Prettier 规则（`.eslintrc.*`, `prettier.config.*`），并在 `package.json` 中添加 `lint` 与 `format` 脚本。
- [ ] T004 [P] 在仓库根目录创建或更新 `.env.example`，补全 `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL` 等键，使其与 `specs/001-ai-drama-stage/quickstart.md` 示例保持一致。
- [ ] T005 [P] 创建或更新根目录 `CHANGELOG.md`，添加「AI情景剧舞台（多 AI 角色轮流对话）」特性条目并链接到 `specs/001-ai-drama-stage/` 文档。

---

## Phase 2: Foundational（所有用户故事共享的基础设施）

**Purpose**: 建立数据库模型、鉴权、LLM 网关与基础错误处理等，所有用户故事在此基础上实现。

**⚠️ CRITICAL**: 完成本阶段前不得开始任何带 [US*] 标签的用户故事实现任务。

- [ ] T006 根据 `specs/001-ai-drama-stage/data-model.md` 在 `prisma/schema.prisma` 中定义核心实体：`User`, `SceneTemplate`, `RoleTemplate`, `DramaSession`, `DramaSessionRole`, `Turn`，并为 `DramaSession`/`Turn` 等表添加必要索引。
- [ ] T007 [P] 创建 `lib/db/client.ts`，实现基于 `DATABASE_URL` 的 Prisma Client 单例，并在其中加载 `prisma/schema.prisma`。
- [ ] T008 [P] 在 `lib/db/repositories/scene-template-repository.ts` 与 `lib/db/repositories/role-template-repository.ts` 中实现 `SceneTemplate` 与 `RoleTemplate` 的基础 CRUD 仓储封装。
- [ ] T009 [P] 在 `lib/db/repositories/drama-session-repository.ts` 与 `lib/db/repositories/turn-repository.ts`、`lib/db/repositories/drama-session-role-repository.ts` 中实现 `DramaSession`、`Turn`、`DramaSessionRole` 的读写封装。
- [ ] T010 运行首个 Prisma 迁移并记录到 `prisma/migrations/`（例如通过 `npx prisma migrate dev`），确保数据库 schema 与 `prisma/schema.prisma` 保持一致。
- [ ] T011 [P] 根据 `specs/001-ai-drama-stage/research.md` 在 `lib/auth/auth-options.ts` 中配置 Auth.js/NextAuth 选项，并在 `app/api/auth/[...nextauth]/route.ts` 中接入 PostgreSQL Session 模式。
- [ ] T012 [P] 按 `specs/001-ai-drama-stage/research.md` 中的 LLM 网关设计，在 `lib/ai/llm-client.ts` 中实现基于 `OPENAI_BASE_URL`/`LLM_API_BASE_URL` 与 API Key 的通用对话模型客户端。
- [ ] T013 [P] 在 `lib/utils/logging.ts` 中实现结构化日志记录（包含 `level`, `timestamp`, `requestId`, `userId`, `sessionId` 等字段），并导出在 API Route 中可复用的 helper。
- [ ] T014 [P] 在 `lib/utils/errors.ts` 中实现统一错误类型与到 HTTP 响应的映射（含 `ErrorResponse` 结构），供 `app/api/drama/*` Route 使用。
- [ ] T015 [P] 在 `lib/core/validation.ts` 中使用 Zod 定义与 `contracts/drama-stage.openapi.yaml` 对齐的请求体验证 schema（如 `CreateSessionInput`, `SceneTemplateCreateInput`, `RoleTemplateCreateInput`），并导出校验函数。
- [ ] T016 在根目录创建 `vitest.config.ts`，并在 `tests/unit/`, `tests/integration/`, `tests/contract/` 下建立基础目录结构与示例测试文件，同时在 `package.json` 中添加 `test`/`test:unit`/`test:integration` 脚本。

---

## Phase 3: User Story 1 - 创建并观看一场多 AI 情景剧 (Priority: P1) 🎯 MVP

**Goal**: 用户能够配置场景与 2–6 个 AI 演员角色，启动一场情景剧演出，观看多轮轮流对话，并在结束后回看完整历史。  
**Independent Test**: 仅完成本阶段任务，即可通过 UI 或 P1 smoke 脚本创建一场包含至少 2 个角色和 5 轮对话的情景剧，并在历史详情页逐轮回看。

### Tests for User Story 1

- [ ] T017 [P] [US1] 在 `tests/unit/lib/core/drama-orchestrator.test.ts` 中为 `lib/core/drama-orchestrator.ts` 编写单元测试，覆盖基本状态流转与「生成下一轮」逻辑。
- [ ] T018 [P] [US1] 在 `tests/integration/drama-sessions.test.ts` 中编写集成测试，验证 `/api/drama/sessions`, `/api/drama/sessions/{sessionId}`, `/api/drama/sessions/{sessionId}/turns` 端到端 P1 流程。

### Implementation for User Story 1

- [ ] T019 [P] [US1] 在 `app/api/drama/templates/scenes/route.ts` 与 `app/api/drama/templates/scenes/[id]/route.ts` 中实现场景模板的基础创建、列表与详情获取逻辑，对齐 `contracts/drama-stage.openapi.yaml` 的 `SceneTemplate*` 契约。
- [ ] T020 [P] [US1] 在 `app/api/drama/templates/roles/route.ts` 与 `app/api/drama/templates/roles/[id]/route.ts` 中实现角色模板的基础创建、列表与详情获取逻辑，对齐 OpenAPI 中的 `RoleTemplate*` 契约。
- [ ] T021 [P] [US1] 按 `specs/001-ai-drama-stage/data-model.md` 在 `lib/core/drama-orchestrator.ts` 中实现多角色轮流对话编排核心，包括 `nextTurn`、状态检查与对 `Turn`/`DramaSession` 的更新。
- [ ] T022 [P] [US1] 在 `app/api/drama/sessions/route.ts` 中实现 `POST /api/drama/sessions` 会话创建与 `GET /api/drama/sessions` 历史会话列表功能，调用 `lib/db/repositories/drama-session-repository.ts` 与 `lib/core/validation.ts`。
- [ ] T023 [P] [US1] 在 `app/api/drama/sessions/[sessionId]/route.ts` 中实现单个会话详情查询与删除逻辑，对照 OpenAPI 中 `/api/drama/sessions/{sessionId}` 的响应结构。
- [ ] T024 [P] [US1] 在 `app/api/drama/sessions/[sessionId]/control/route.ts` 中实现 `start/pause/resume/next/end` 控制动作，并更新 `DramaSession.status` 及进度字段。
- [ ] T025 [P] [US1] 在 `app/api/drama/sessions/[sessionId]/turns/route.ts` 中实现 `GET` 历史轮次列表与 `POST` 生成下一轮对话，使用 `lib/ai/llm-client.ts` 与 `lib/core/drama-orchestrator.ts`。
- [ ] T026 [P] [US1] 创建 `components/drama/drama-stage-editor.tsx`，实现场景模板选择/新建与 2–6 个角色模板选择/新建的表单 UI，支持在创建会话时基于所选模板生成场次级场景/角色快照，并通过 `app/api/drama/templates/scenes` 与 `app/api/drama/templates/roles` 接口加载与提交。
- [ ] T027 [P] [US1] 创建 `components/drama/drama-timeline.tsx`，根据 `DramaSession` 与 `Turn` 数据在单一界面中以时间线/气泡形式展示多角色轮流发言，并在合适区域以只读方式呈现当前会话实际使用的场景与角色设定摘要，满足 FR-008 的可查看性要求。
- [ ] T028 [P] [US1] 创建 `components/drama/playback-controls.tsx`，提供「开始」「暂停」「继续」「下一轮」「结束」控制按钮，并调用 `app/api/drama/sessions/{sessionId}/control` 与 `.../turns`。
- [ ] T029 [US1] 在 `app/(drama-stage)/layout.tsx` 与 `app/(drama-stage)/page.tsx` 中组合 `drama-stage-editor`, `drama-timeline`, `playback-controls`，实现从配置到演出启动的主界面，并确保会话启动后界面中可以清晰看到当前会话所用场景与角色设定快照。
- [ ] T030 [P] [US1] 创建历史列表页面 `app/(drama-stage)/history/page.tsx`，使用 `GET /api/drama/sessions` 展示当前用户的历史演出列表，并支持按状态/时间排序。
- [ ] T031 [P] [US1] 创建历史详情页面 `app/(drama-stage)/history/[sessionId]/page.tsx`，使用 `GET /api/drama/sessions/{sessionId}` 与 `GET /api/drama/sessions/{sessionId}/turns` 显示某场演出的逐轮对话，并在详情页中展示该会话的场景与角色快照，支持一键复制当前会话所用场景与角色 prompt 以便在其他工具中复用或备份（对齐 FR-008/FR-009）。
- [ ] T032 [US1] 在 `scripts/smoke/p1-ai-drama-stage.ts` 中实现 P1 烟囱脚本（创建场景模板与 2–3 个角色模板 → 创建并启动 `DramaSession` → 触发若干轮 `Turn` → 验证历史列表与详情端点，包括快照与一键复制能力），并在 `package.json` 中添加对应的 `pnpm ts-node scripts/smoke/p1-ai-drama-stage.ts` 命令。
- [ ] T033 [US1] 更新 `specs/001-ai-drama-stage/quickstart.md`，补充 P1 smoke 脚本运行示例与预期输出，使其与实际 `scripts/smoke/p1-ai-drama-stage.ts` 行为保持一致，包含对「查看会话配置快照与一键复制 prompt」的验证说明。

**Checkpoint**: 完成本阶段后，User Story 1 可通过 UI 与 smoke 脚本独立演示与回归测试。

---

## Phase 4: User Story 2 - 利用 AI 生成新的 AI 演员角色设定 (Priority: P2)

**Goal**: 用户可以通过自然语言描述由系统生成角色设定草稿，并在确认后保存为可复用角色模板。  
**Independent Test**: 即使不依赖情景剧演出，单独通过「创建新角色」入口即可从自然语言描述生成 `RoleDraft` 并保存到角色模板库。

### Tests for User Story 2

- [ ] T034 [P] [US2] 在 `tests/integration/drama-ai-roles.test.ts` 中编写集成测试，覆盖 `POST /api/drama/templates/roles/ai-generate` 与保存生成草稿为 `RoleTemplate` 的完整流程。

### Implementation for User Story 2

- [ ] T035 [P] [US2] 在 `lib/ai/prompt-templates.ts` 中实现用于 AI 生成角色设定的 prompt 模板构建函数（含角色名称、背景、说话风格等字段）。
- [ ] T036 [P] [US2] 在 `app/api/drama/templates/roles/ai-generate/route.ts` 中实现 `POST /api/drama/templates/roles/ai-generate` 接口，调用 `lib/ai/llm-client.ts` 与 `lib/ai/prompt-templates.ts` 返回 `RoleDraft`。
- [ ] T037 [P] [US2] 扩展 `components/drama/drama-stage-editor.tsx`，增加「AI 生成角色」对话框或侧边栏 UI，调用 `/api/drama/templates/roles/ai-generate` 并在前端展示 `RoleDraft` 可编辑表单。
- [ ] T038 [US2] 在 `components/drama/drama-stage-editor.tsx` 中实现将 `RoleDraft` 保存为角色模板的操作，调用 `POST /api/drama/templates/roles` 将编辑后的角色写入 `RoleTemplate`（通过 `lib/db/repositories/role-template-repository.ts`）。

**Checkpoint**: 完成本阶段后，User Story 2 可作为独立功能使用（只需鉴权与模板 API 基础设施），并可与 User Story 1 的角色选择流程集成。

---

## Phase 5: User Story 3 - 管理与复用场景/角色 Prompt 库 (Priority: P3)

**Goal**: 用户能够查看、搜索、筛选、编辑与删除场景/角色模板，并从模板库快速复用配置新的情景剧。  
**Independent Test**: 即便不依赖 AI 生成角色或完整演出，只通过模板库也可以完成场景/角色模板的增删改查与选取。

### Tests for User Story 3

- [ ] T039 [P] [US3] 在 `tests/integration/drama-templates.test.ts` 中编写集成测试，覆盖场景与角色模板的搜索、编辑与删除接口（`/api/drama/templates/scenes*`, `/api/drama/templates/roles*`）。

### Implementation for User Story 3

- [ ] T040 [P] [US3] 在 `app/(drama-stage)/library/page.tsx` 中实现模板库页面，展示当前用户的场景模板与角色模板列表，支持按名称关键字与标签搜索。
- [ ] T041 [P] [US3] 创建 `components/drama/template-library.tsx`，封装场景/角色模板列表、搜索表单与模板预览卡片，并在 `app/(drama-stage)/library/page.tsx` 中复用。
- [ ] T042 [P] [US3] 扩展 `app/api/drama/templates/scenes/route.ts` 与 `app/api/drama/templates/scenes/[id]/route.ts`，实现 OpenAPI 中描述的查询参数（`q`, `tag`, `sort`）与更新/删除行为，并确保删除不影响历史演出记录。
- [ ] T043 [P] [US3] 扩展 `app/api/drama/templates/roles/route.ts` 与 `app/api/drama/templates/roles/[id]/route.ts`，实现角色模板搜索/筛选/编辑/删除能力，并在成功使用模板或演出后更新 `lastUsedAt` 字段。
- [ ] T044 [US3] 在 `app/(drama-stage)/library/page.tsx` 与 `app/(drama-stage)/page.tsx` 之间增加「从模板库快速开场」的跳转与预填逻辑，使用户可从模板库一键创建新的 `DramaSession` 配置。

**Checkpoint**: 完成本阶段后，User Stories 1–3 均可独立使用且互相复用，形成完整的 Prompt 库与情景剧创作闭环。

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: 提升稳定性、安全性、性能与文档质量，覆盖跨用户故事的改进。

- [ ] T045 [P] 在 `lib/ai/llm-client.ts` 与相关 `app/api/drama/*` Route 中统一加入内容安全与合规过滤（如对明显违规内容进行拦截/弱化），并将错误映射为符合 `ErrorResponse` 的友好提示。
- [ ] T046 [P] 在 `lib/utils/logging.ts` 与各 `app/api/drama/*` Route 中增加对关键性能指标的日志（如单轮生成 `durationMs` 与 P1 路径端到端耗时），并在 `Turn` 表中填充 `durationMs` 字段。
- [ ] T047 [P] 在 `scripts/benchmarks/p1-ai-drama-stage.ts` 中实现基础性能基准脚本，重放一场标准情景剧并输出主要延迟统计。
- [ ] T048 [P] 扩充或新增契约测试文件 `tests/contract/drama-stage.openapi.test.ts`，根据 `contracts/drama-stage.openapi.yaml` 验证主要端点的响应结构与错误码。
- [ ] T049 更新根目录 `README.md` 与 `CHANGELOG.md`，总结 AI 情景剧舞台特性、P1 MVP 范围与如何运行 smoke/benchmark 脚本。
- [ ] T050 复核并更新 `specs/001-ai-drama-stage/quickstart.md`，确保其中的安装、迁移、启动与测试命令与实际 `package.json` 与脚本文件（`scripts/smoke/p1-ai-drama-stage.ts`, `scripts/benchmarks/p1-ai-drama-stage.ts`）完全一致。

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 无前置依赖，可立即开始。
- **Foundational (Phase 2)**: 依赖 Phase 1 完成；阻塞所有带 [US*] 标签的用户故事实现。
- **User Story Phases (Phase 3–5)**: 均依赖 Phase 2 完成：
  - User Story 1 (P1) 应优先实现，作为 MVP。
  - User Story 2 (P2) 与 User Story 3 (P3) 理论上可在完成 Foundational 后并行，但推荐在 US1 完成后开始以降低复杂度。
- **Polish (Final Phase)**: 依赖至少 US1 完成；建议在所有计划交付的用户故事完成后执行。

### User Story Dependencies

- **User Story 1 (P1)**: 仅依赖 Phase 2 基础设施；可作为首个可演示 MVP。  
- **User Story 2 (P2)**: 依赖 Phase 2 以及角色模板基础 API（T020）；与 US1 在技术上可并行，但不依赖 US3。  
- **User Story 3 (P3)**: 依赖 Phase 2 以及模板相关 API（T019–T020）；在产品视角上增强 US1/US2 的复用效率，但实现顺序上可在 US2 前后灵活安排。

---

## Parallel Execution Examples

### User Story 1

- 可并行实施的任务示例：
  - T019, T020, T022–T025（各 API Route 与 orchestrator 实现，文件路径不同）  
  - T026–T028（前端组件 `components/drama/*`）  
  - T017–T018（单元与集成测试）  
- 推荐顺序：先完成 T021/T022/T025（核心编排与会话 API），再接 UI 任务与 smoke 脚本（T026–T033）。

### User Story 2

- 可并行实施的任务示例：
  - T035–T036（prompt 模板与 AI 生成接口实现）  
  - T037–T038（前端集成与保存逻辑）  
  - T034（集成测试）  
- 推荐顺序：先完成后端 API（T035–T036），再并行推进前端集成与测试（T037–T038, T034）。

### User Story 3

- 可并行实施的任务示例：
  - T040–T041（模板库页面与组件）  
  - T042–T043（场景/角色模板 API 扩展）  
  - T039（集成测试）  
- 推荐顺序：先实现/扩展 API（T042–T043），随后并行完成 UI（T040–T041）与测试（T039）。

---

## Implementation Strategy

### MVP First（仅 User Story 1）

1. 完成 Phase 1: Setup（T001–T005）。  
2. 完成 Phase 2: Foundational（T006–T016）。  
3. 完成 Phase 3: User Story 1（T017–T033）。  
4. 运行 P1 smoke 脚本与手动 UI 验证，确认 US1 独立可用。  
5. 在此基础上可进行首次部署或演示。

### Incremental Delivery

1. 完成 Setup + Foundational → 基础设施就绪。  
2. 添加 User Story 1 → 独立测试与演示（MVP）。  
3. 添加 User Story 2 → 提升新角色创建体验。  
4. 添加 User Story 3 → 提升模板复用与管理效率。  
5. 最后执行 Polish 阶段任务（日志、性能、安全、文档）。

### Parallel Team Strategy

在团队规模允许的情况下：

- 一名工程师聚焦后端（Prisma, Repositories, API Routes，T006–T016, T019–T025, T035–T036, T042–T043）。  
- 一名工程师聚焦前端 UI（`app/(drama-stage)/*`, `components/drama/*`，T026–T031, T037–T041, T044）。  
- 一名工程师聚焦测试与脚本（`tests/*`, `scripts/smoke/*`, `scripts/benchmarks/*`，T017–T018, T032, T034, T039, T047–T048）。  

所有任务均遵循 `- [ ] Txxx [P?] [US?] Description with file path` 的清单格式，便于 LLM 或工程师按顺序与并行度直接执行。


