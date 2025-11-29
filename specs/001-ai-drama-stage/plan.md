# Implementation Plan: AI情景剧舞台（多 AI 角色轮流对话）

**Branch**: `001-ai-drama-stage` | **Date**: 2025-11-27 | **Spec**: E:\AI\ATWAS\specs\001-ai-drama-stage\spec.md  
**Input**: Feature specification from `E:\AI\ATWAS\specs\001-ai-drama-stage\spec.md`

**Note**: This plan is generated from `/speckit.plan` for the AI 情景剧舞台特性，围绕 User Story 1 的 P1 流程进行设计，并对选定技术栈（Next.js + API Routes、Tailwind CSS + shadcn/ui、PostgreSQL + Prisma、auth.js）给出约束与落地方案。

## Summary

本特性实现一个「AI 情景剧舞台」：用户可以配置一个场景模板（SceneTemplate）和 2–6 个 AI 演员角色模板（RoleTemplate），设置轮流顺序与总轮数后，系统驱动多个 AI 演员轮流对话，生成并持久化完整 DramaSession 与 Turn 列表，并支持中断后恢复与历史回看。  
技术上采用单体 Next.js 14 App Router 全栈应用，通过 API Routes 暴露情景剧会话、模板库与 AI 生成角色接口；前端 UI 使用 Tailwind CSS + shadcn/ui 构建高可读的多角色对话布局；数据层使用 PostgreSQL + Prisma 建模 User/SceneTemplate/RoleTemplate/DramaSession/Turn 等实体；鉴权采用 auth.js（NextAuth v5 风格）处理用户会话。  
P1 smoke path 对应 User Story 1：「创建并观看一场多 AI 情景剧」，覆盖从登录、选择/创建场景与角色模板、启动演出、查看轮流对话到保存完整会话与回看的端到端流程。

## Technical Context

**Language/Version**: TypeScript + JavaScript (Node.js 20, Next.js 14 App Router)  
**Primary Dependencies**: Next.js 14 (React 18, App Router), Tailwind CSS, shadcn/ui, Prisma ORM, PostgreSQL, auth.js (NextAuth v5 风格), Zod, Axios/Fetch API  
**Storage**: PostgreSQL（单一主库；通过 Prisma 访问；开发环境可使用本地/容器化 Postgres）  
**Testing**: Vitest（单元与服务层测试）、@testing-library/react（组件测试）、Playwright（选择性端到端与 P1 流程回归）  
**Target Platform**: 单体 Next.js Web 应用；本地开发运行于 Node.js 20；部署目标为 Vercel 或等价的 Node 20 运行环境  
**Project Type**: single-next-app（单体 Next.js 全栈应用，前后端共仓库）  
**Performance Goals**:

- 标准情景剧（≤4 角色、≤10 轮）下，至少 95% 的对话轮次从触发到收到完整文本的等待时间 ≤ 5 秒
- P1 smoke 脚本在典型开发机 + 正常网络环境下完成一场包含至少 2 个角色和 5 轮对话的演出，总耗时目标 ≤ 3 分钟
- 服务器端单次生成调用（单轮对话）整体 p95 延迟 ≤ 4 秒（不含前端渲染）

**Constraints**:

- 本阶段仅支持纯文本对话输出（无语音/视频），所有演出均以文字对话区域/气泡呈现
- 所有对话上下文重建需依赖持久化的 DramaSession + Turn 数据，LLM 视为无状态 HTTP 服务
- 配置与 secrets 必须通过 `.env` 单一配置源管理（如 `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `OPENAI_API_KEY` 等），禁止明文写入仓库
- 单节点部署优先，暂不考虑跨区域多活和复杂水平扩展

**Scale/Scope**:

- S1 阶段面向早期单用户/小规模创作者人群，目标量级：≤1k 注册用户、≤10 并发活跃 DramaSession
- 单个 DramaSession 的 Turn 数量建议上限约 200（超出前需给出 UI 级提示）
- 代码规模预期 < 10k LOC，集中在单体 Next.js 应用及少量脚本/测试。

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

在当前 **S1 · MVP** 阶段，本特性按 ATWAS Constitution 的 S1 质量门进行评估：

- **P1 smoke path**
  - Spec 中已明确 User Story 1 为 P1 场景，并给出可独立演示的端到端流程。
  - 计划在实现阶段新增 `scripts/smoke/p1-ai-drama-stage.ts`（或等价脚本）作为 P1 烟囱测试脚本，自动执行：创建场景模板 + 角色模板 → 启动演出 → 等待若干轮对话生成 → 校验持久化记录。
  - `quickstart.md` 将记录如何运行该脚本；在合入主分支前，CI 必须在本分支上通过该脚本。

- **Code quality（格式化 & 静态检查）**
  - 计划采用 `prettier` + `eslint` 作为 TypeScript/React 的统一格式化与静态分析工具，结合 `prisma format` 保持 schema 一致性。
  - 将在 CI（如 GitHub Actions）中以阻塞方式运行 `npm run lint` / `npm run typecheck` 等命令，对错误级别问题阻止合并。

- **Configuration & secrets**
  - 定义 `.env` 为单一配置来源，并在仓库根目录维护 `.env.example`，列出本特性所需的所有配置键（`DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, 模型提供方 API Key 等），提供安全示例值。
  - 所有 secrets 必须通过环境变量或安全密钥管理服务注入，禁止写入代码、示例配置或文档；一旦误提交需要通过任务触发密钥轮换。

- **Logging & error handling**
  - 在负责 P1 流程的 API Routes（会话创建、轮次生成、历史查询等）中使用结构化日志，至少包含：level、timestamp、requestId/userId、sessionId/turnIndex 等关键字段。
  - 前端通过统一错误边界与 toast/inline error 区块，将后端错误映射为面向用户的可操作提示（例如「生成超时」「网络错误，可重试」），避免泄露内部细节。

- **Performance baseline**
  - 使用 acceptance criteria 中的时延约束作为性能预算，并在实现后通过本地测量记录至少一次 P1 路径的端到端耗时（包含环境说明），写入本 `plan.md` 或 `quickstart.md`。
  - 如有必要，可在 `scripts/benchmarks/p1-ai-drama-stage.*` 中增加简单的基准脚本，以便后续扩展性能监控。

- **Release & onboarding（quickstart & changelog）**
  - 本 plan 生成 `specs/001-ai-drama-stage/quickstart.md`，说明如何在本地启动项目和运行 P1 smoke 脚本（脚本在实现阶段补齐）。
  - `CHANGELOG.md` 将在任务阶段补充或更新，对引入 AI 情景剧舞台特性的用户可见变更进行记录，并遵循 SemVer 约定。

- **Levers（来自 constitution-plan.md）**
  - `team.size`: S（1–2 人小团队）
  - `risk.level`: M（中等：新功能但不涉及高敏感行业合规）
  - `surface`: 单体 Web 应用 + 后端 API（同一 Next.js 应用内）
  - `release.criticality`: L/M（新特性，早期阶段，可通过 feature flag 控制曝光）
  - `compliance`: L（不处理医疗/金融等高合规数据，按通用内容生成产品标准执行）

当前设计在规划层面满足所有 S1 MUST gates；任何在实现阶段无法按时达成的 gate（例如延迟引入性能基准脚本或减少测试覆盖）必须在下方 **Complexity Tracking** 中记录并给出还债时间线。

## Project Structure

### Documentation (this feature)

```text
E:\AI\ATWAS\specs\001-ai-drama-stage\
├── plan.md              # 本文件（/speckit.plan 输出）
├── research.md          # Phase 0：技术选型与未知点研究
├── data-model.md        # Phase 1：领域与数据建模设计
├── quickstart.md        # Phase 1：快速上手与 P1 smoke 说明
├── contracts\           # Phase 1：OpenAPI 契约定义
│   └── drama-stage.openapi.yaml
└── tasks.md             # Phase 2：/speckit.tasks 输出（本命令不创建）
```

### Source Code (repository root)

```text
E:\AI\ATWAS\
├── app\                          # Next.js App Router 入口
│   ├── layout.tsx
│   ├── page.tsx                  # 总入口／欢迎页（可跳转到情景剧舞台）
│   └── (drama-stage)\            # AI 情景剧舞台 feature 相关路由分组
│       ├── layout.tsx
│       ├── page.tsx              # 创建/配置/启动一场情景剧的主界面（P1 入口）
│       └── history\
│           ├── page.tsx          # 历史演出列表视图
│           └── [sessionId]\page.tsx   # 单场历史演出详情（逐轮回看）
│
├── app\api\                      # Next.js API Routes
│   ├── auth\[...nextauth]\route.ts    # auth.js / NextAuth 配置与回调
│   └── drama\
│       ├── sessions\route.ts          # POST 创建会话 / GET 列表
│       ├── sessions\[sessionId]\route.ts  # GET 会话详情 / PATCH 更新配置或状态
│       ├── sessions\[sessionId]\control\route.ts  # POST: pause/resume/next/end
│       ├── sessions\[sessionId]\turns\route.ts    # GET: Turn 列表（历史详情）
│       └── templates\
│           ├── scenes\route.ts       # 场景模板 CRUD + 搜索/筛选
│           ├── roles\route.ts        # 角色模板 CRUD + 搜索/筛选
│           └── roles\ai-generate\route.ts  # AI 辅助生成角色设定（P2）
│
├── lib\
│   ├── ai\
│   │   ├── llm-client.ts           # 对话式 LLM 客户端封装（可插拔模型提供方）
│   │   └── prompt-templates.ts     # 场景/角色/多轮对话 prompt 模板
│   ├── auth\
│   │   └── auth-options.ts         # auth.js/NextAuth 配置与回调封装
│   ├── db\
│   │   ├── client.ts               # Prisma Client 单例
│   │   └── repositories\           # User/SceneTemplate/RoleTemplate/DramaSession/Turn 仓储
│   ├── core\
│   │   ├── drama-orchestrator.ts   # 多角色轮流对话编排与状态推进核心
│   │   └── validation.ts           # zod 校验 schema（请求体/配置约束）
│   └── utils\
│       ├── logging.ts              # 结构化日志与 requestId 生成
│       └── errors.ts               # 统一错误类型与 HTTP 映射
│
├── components\                     # 复用 UI 组件（基于 shadcn/ui）
│   ├── drama\
│   │   ├── drama-stage-editor.tsx  # 场景 & 角色配置面板
│   │   ├── drama-timeline.tsx      # 多角色轮流对话时间线视图
│   │   └── playback-controls.tsx   # 开始/暂停/下一轮/结束 控制组件
│   └── shared\
│       └── ...                     # 通用表单、对话框等
│
├── prisma\
│   ├── schema.prisma               # User/SceneTemplate/RoleTemplate/DramaSession/Turn 定义
│   └── migrations\                 # 数据库迁移
│
├── scripts\
│   ├── dev-seed.ts                 # 开发环境初始化场景与角色模板
│   ├── smoke\
│   │   └── p1-ai-drama-stage.ts    # P1 烟囱脚本（计划于实现阶段补充）
│   └── benchmarks\
│       └── p1-ai-drama-stage.ts    # 可选性能基准脚本（后续阶段补充）
│
└── tests\
    ├── unit\                       # 领域逻辑与 orchestrator 单元测试
    ├── integration\                # API Route 与数据库/LLM 集成测试
    └── contract\                   # 基于 contracts\drama-stage.openapi.yaml 的契约测试
```

**Structure Decision**:

- 采用单体 Next.js 14 App Router 项目结构，将前端 UI、API Routes 与领域层统一放在同一仓库，避免为 S1 阶段引入多项目/多服务复杂度。
- 领域模型与数据访问集中在 `lib/db` + `prisma`，对话编排逻辑独立在 `lib/core/drama-orchestrator.ts`，确保多角色轮流逻辑可测试、可复用。
- 脚本（种子数据、smoke、benchmarks）集中在 `scripts/`，测试统一放在 `tests/`，与 Constitution 对 P1 smoke 和基础性能基准的要求对齐。

## Complexity Tracking

> 记录 S1 阶段暂时接受的「复杂度/违约」，并说明原因与更简单方案为何被拒绝。包括对 SHOULD 级别 gate 的延期交付。

| Violation                                                                         | Why Needed                                                              | Simpler Alternative Rejected Because                                                                                                                               |
| --------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P1 性能基准脚本 `scripts/benchmarks/p1-ai-drama-stage.ts` 暂不在首轮实现          | 首轮实现优先保证 P1 功能与 smoke path 可用；团队规模小，时间有限        | 立即实现性能基准脚本会占用实现和 UX 打磨时间；在尚无真实负载的前提下，性能数据价值有限，计划在首批真实用户数据稳定后补充                                           |
| 完整契约测试覆盖所有对外 API（仅为关键 P1 路径与核心模板接口编写 contract tests） | 当前 S1 阶段主要风险在对话编排和数据持久化正确性，而非所有边缘 API 分支 | 为所有端点/状态分支立即编写完善契约测试将显著拉长交付周期；选择先覆盖 P1 path 和模板 CRUD 主路径，其余在后续版本中按风险补齐                                       |
| 使用单体 Next.js 应用而非前后端分离或多服务架构                                   | S1 目标是快速验证产品价值和 UX，而非服务拆分                            | 早期拆分为独立前端 + 独立后端服务会增加部署、调试与协作成本；在当前用户规模预计下，单体架构足以满足非功能性需求，未来如需扩展可基于现有 orchestrator/db 层平滑拆分 |
