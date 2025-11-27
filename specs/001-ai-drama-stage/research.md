# Research: AI 情景剧舞台（多 AI 角色轮流对话）

本文件整理本特性在技术栈和架构上的关键决策、理由与备选方案，用于支撑 `plan.md` 中的 Technical Context 与后续实现任务分解。  
目标：在 S1 · MVP 阶段，用尽量简单可维护的方式实现「AI 情景剧舞台」的 P1 流程，并为后续扩展预留空间。

---

## 1. 架构形态：单体 Next.js 全栈 vs 前后端分离

- **Decision**: 采用单体 Next.js 14 App Router 全栈应用（前端 + API Routes + 领域逻辑同仓库）。  
- **Rationale**:  
  - 本特性的核心是多角色轮流对话编排与 Prompt 管理，前后端交互相对简单且以 JSON API 为主；使用 Next.js App Router 可以在一个项目内同时承载 UI 和 API，减少心智负担。  
  - 单体架构下，本地开发体验更好：一个 `pnpm dev` 或 `npm run dev` 即可启动整个产品，符合 S1 阶段「快速可演示」的目标。  
  - 未来如需扩展为多服务，可以沿 `lib/core` + `lib/db` 的边界拆分，但在 S1 阶段不必提前支付服务拆分成本。  
- **Alternatives considered**:  
  - **前后端分离（如 Next.js 前端 + 独立 Node/Express/Fastify 后端）**：可实现更清晰的服务边界，但需要单独的部署管线与更多基础设施，超出当前 S1 范围。  
  - **纯前端 + BaaS（如 Supabase Functions / Firebase）**：可减少后端管理，但多 AI 角色轮流对话的状态编排需要可控的中间层，BaaS 的灵活度与可测试性有限。

---

## 2. Next.js 版本与路由模式

- **Decision**: 使用 Next.js 14，采用 App Router（`app/` 目录）和 Route Handlers（`app/api/*/route.ts`）。  
- **Rationale**:  
  - App Router 是 Next.js 推荐的未来路径，支持更细粒度的布局、流式渲染以及更好的数据获取模式（Server Components 等）。  
  - Route Handlers 与 App Router 深度集成，适合简单 API（如会话控制、模板 CRUD）和对话编排接口。  
  - 对于本特性，大部分页面以表单 + 列表 + 对话区为主，App Router 的布局分组 `(drama-stage)` 可以很好地划分特性边界。  
- **Alternatives considered**:  
  - **Next.js 13 + Pages Router (`pages/`)**：更成熟稳定，但长远来看迁移到 App Router 是必然工作，现在直接使用 App Router 能避免未来的迁移成本。  
  - **其他 React 框架（Remix, Nuxt 等）**：无法与现有 Next.js 生态（shadcn/ui、auth.js、Vercel 部署）无缝对齐。

---

## 3. UI 技术栈：Tailwind CSS + shadcn/ui

- **Decision**: 使用 Tailwind CSS 提供低层样式能力，基于 shadcn/ui 组件库构建表单、列表、弹窗等通用组件，并在此基础上定制情景剧对话视图。  
- **Rationale**:  
  - Tailwind + shadcn/ui 在 React/Next.js 社区成熟度高，文档丰富，能快速构建现代 UI。  
  - shadcn/ui 提供无锁定的组件源码，可以按需剪裁与重构，方便对「多角色聊天气泡」「时间线」等特定 UI 做细致定制。  
  - 与 Storybook 或其他设计体系兼容性良好，可为后续设计规范沉淀做基础。  
- **Alternatives considered**:  
  - **纯 Tailwind + 自研组件**：灵活但成本较高，容易在早期反复造轮子。  
  - **成熟 UI 框架（如 MUI, Ant Design）**：组件丰富，但设计风格较重；shadcn/ui 对 Tailwind/Next 生态整合更自然。

---

## 4. 数据库与 ORM：PostgreSQL + Prisma

- **Decision**: 使用 PostgreSQL 作为主数据存储，Prisma 作为 TypeScript ORM 与 schema 管理工具。  
- **Rationale**:  
  - Spec 中已有对持久化要求（模板库、会话与完整对话历史），Postgres 在结构化数据与简单全文搜索/过滤场景表现良好。  
  - Prisma 提供良好的 schema 定义、迁移与类型安全查询能力，对 TypeScript 项目友好；Prisma Client 自动生成类型有助于减少运行时错误。  
  - 多表关系相对清晰（User / SceneTemplate / RoleTemplate / DramaSession / Turn / 关联表），适合关系型建模。  
- **Alternatives considered**:  
  - **Supabase（Postgres + 现成后端能力）**：可简化认证/存储，但本项目已有 auth.js 规划，且为保持灵活度更倾向于直接管理数据库层。  
  - **MongoDB 或其他文档库**：对高度变化的 Prompt 结构友好，但本特性实体之间关系较强，使用关系型建模更自然。  
  - **SQLite**：本地开发非常方便，但在多用户与未来扩展下，Postgres 更具伸缩性。

---

## 5. 鉴权方案：auth.js（NextAuth v5 风格）

- **Decision**: 使用 auth.js（原 NextAuth）在 Next.js 中实现用户登录与会话管理。  
- **Rationale**:  
  - 与 Next.js 深度集成，提供内置 session 管理、server-side helper 等，减少手写鉴权逻辑。  
  - 支持多种 Provider（Email、OAuth 等），方便未来扩展为 GitHub / Google 登录；S1 阶段可先使用 Email/密码或 Magic Link。  
  - 与 Route Handlers 及 React Server Components 协作成熟，安全模型明确。  
- **Alternatives considered**:  
  - **自研 JWT + Cookie 方案**：完全可行但需自行处理 token 刷新、安全存储与 CSRF 等细节，在当前阶段性价比不高。  
  - **Auth0 / Clerk 等第三方服务**：可进一步下放鉴权管理，但会增加外部依赖与成本，目前需求尚不需要。

---

## 6. 对话编排与 LLM 集成策略

- **Decision**:  
  - 将「多角色轮流对话」抽象为 `DramaSession` + `Turn` 的状态机，由 `lib/core/drama-orchestrator.ts` 统一负责推进轮次。  
  - LLM 视为无状态 HTTP API，每次生成调用时从数据库中重建 Prompt 上下文。  
- **Rationale**:  
  - 将编排逻辑集中在 `drama-orchestrator` 便于测试与后续重构（例如更复杂的对话策略或多模型切换）。  
  - 通过数据库重建上下文，可以自然支持「中断后恢复」和「历史详情回看」能力。  
  - 将未来对话策略（例如角色权重、插入旁白、系统提示优化）与具体模型提供方解耦。  
- **Alternatives considered**:  
  - **在前端进行轮流控制，后端仅负责一次性生成**：会把状态管理逻辑推到浏览器，增加复杂度且不利于恢复和历史持久化。  
  - **在外部 Workflow/Orchestration 服务中实现状态机**：较为重型，当前规模不需要独立编排服务。

---

## 7. 测试策略：Vitest + Testing Library + Playwright

- **Decision**:  
  - 使用 Vitest 作为主要单元/集成测试框架；  
  - 使用 @testing-library/react 测试关键 React 组件；  
  - 使用 Playwright（或等价 E2E 工具）对 P1 烟囱路径提供端到端回归测试（可在后续阶段引入）。  
- **Rationale**:  
  - Vitest 与 Vite/现代前端生态兼容性好，配置与 Jest 类似但运行速度更快；在纯 Next 环境下也易于集成。  
  - Testing Library 推崇「以用户视角测试组件」，在表单与交互复杂的情景剧配置界面中尤其合适。  
  - 对 P1 流程提供至少一个端到端测试，有助于防止回归。  
- **Alternatives considered**:  
  - **Jest**：更成熟但配置相对繁琐，且在 TS/ESM 场景需要更多样板代码。  
  - **仅使用手工测试**：短期可行，但不满足 Constitution 对基础质量门与 smoke path 的要求。

---

## 8. 部署与运行环境

- **Decision**: 以 Vercel（或等价 Node 20 环境）为首选部署目标，本地开发使用 Node.js 20。  
- **Rationale**:  
  - Next.js 官方推荐 Vercel，内置对 App Router、Edge/Node Runtime 和图像/缓存等特性的支持。  
  - 对于早期 S1 阶段，Vercel 可大幅简化部署与环境管理。  
- **Alternatives considered**:  
  - **自托管 Node（如自建 Docker + Kubernetes）**：灵活但增加运维成本，不符合 MVP 阶段资源约束。  
  - **其他 Serverless 平台（Netlify/Cloudflare Pages 等）**：对 Next.js 14 支持不如 Vercel 完整。

---

## 9. 未决问题与澄清（已在本轮研究中给出默认方案）

以下问题在 spec 中未完全限定，本轮研究给出默认决策，可在后续如有冲突再调整：  

1. **LLM 提供方与调用接口**  
   - 默认假设使用兼容 OpenAI API 的对话模型（如 `gpt-4.x` 或其他供应商兼容接口），通过 `OPENAI_API_KEY` 或等价环境变量配置。  
   - 所有模型调用均通过 `lib/ai/llm-client.ts` 间接完成，便于后续替换模型或增加多模型策略。  

2. **多租户与多用户隔离策略**  
   - S1 阶段按单租户简单处理，每个 User 仅能访问自己创建的模板和会话记录，跨用户共享/社区功能明确出 scope。  

3. **历史记录保留策略**  
   - 按 spec 中澄清：默认长期保留，用户可手动删除；数据库层面仅在删除时做软删/硬删策略选择（建议软删 + 后台清理）。  

以上决策均已反映在 `plan.md` 的 Technical Context 与 Project Structure 中；若后续业务方对其中某一点有不同要求，可以通过更新本 research 与 plan 进行修订。  

## Phase 0 Research · AI情景剧舞台（多 AI 角色轮流对话）

本文件对应 `/speckit.plan` Phase 0 输出，用于：

- 整理 Technical Context 中标记的 **NEEDS CLARIFICATION** 问题并给出明确决策；
- 为关键技术栈（Next.js、Tailwind + shadcn/ui、PostgreSQL + Prisma、Auth.js、LLM 抽象层）收集在本领域的最佳实践；
- 为后续 `data-model.md`、OpenAPI 合约和实现提供稳定的技术基线。

---

## 1. Resolved Open Questions from Technical Context

### 1.1 LLM 供应商与默认模型选择 & 抽象方式

- **Decision**  
  - 引入一个内部模块 `llm-gateway`，对外暴露类 OpenAI Chat Completions 的接口（如 `createChatCompletion`），将具体供应商细节封装在网关内部。  
  - 网关通过环境变量配置：  
    - `LLM_API_BASE_URL`：指向 OpenAPI 兼容的对话模型服务（可为 OpenAI / Azure OpenAI / Cloudflare / 本地开源代理）。  
    - `LLM_API_KEY`：访问密钥。  
    - `LLM_MODEL_DRAMA`：用于情景剧对话的主模型名称（默认假设为支持较长上下文的对话模型，例如 `gpt-4.x` 级别或同级替代品）。  
  - 情景剧多角色轮流对话采用「单模型、多角色提示」方案：所有角色使用同一底层对话模型，通过不同的 system/role prompt 与上下文包装来体现个性化，而不是为每个角色维护完全独立的 Agent/会话。  

- **Rationale**  
  - **供应商解耦**：通过统一 `llm-gateway` + OpenAPI 风格契约，可以在不改动业务代码的情况下切换底层模型提供商，只需修改配置与少量网关逻辑。  
  - **实现复杂度可控**：相比为每个角色维护独立 Agent 状态机，单模型多角色提示在 MVP 阶段实现成本更低，也更便于控制 token 成本。  
  - **兼容 Spec**：Spec 中未限定具体模型提供方，只要求「稳定可用的通用对话式 AI 能力」，统一网关完全符合这一要求。  

- **Alternatives considered**  
  - 直接在业务代码中调用某个具体 SDK（如 OpenAI 官方 SDK）：  
    - **缺点**：对特定供应商的耦合度过高，更换模型或落地私有部署时重构成本大。  
  - 为每个角色维护独立会话（多 Agent 架构）：  
    - **优点**：理论上可以为不同角色挑选不同能力/价格的模型，个性化更强。  
    - **缺点**：上下文管理复杂、成本不可控，在 S1 阶段不必要；可以作为后续演进方向，在现有 `llm-gateway` 之上逐步引入。  

---

### 1.2 Auth.js Session 策略与数据库适配

- **Decision**  
  - 使用 Auth.js（NextAuth）的 **数据库 Session 模式**，会话信息落在 PostgreSQL 中，与本特性其他实体共用同一数据库实例。  
  - 采用标准 Credentials / OAuth Provider（视主应用而定），但本特性只要求「已有用户体系」，因此在接口契约设计时仅假设存在当前登录 User 的标识（如 `userId`）。  
  - 在 `apps/web/lib/auth/` 中集中封装：  
    - 会话获取辅助函数（例如 `getCurrentUser()`）。  
    - 与 Prisma 的 User 模型之间的映射。  

- **Rationale**  
  - 数据库 Session 便于在服务端进行统一的会话失效控制（例如登出所有设备、后台封禁用户），且与 PostgreSQL 适配自然。  
  - 与已有 Auth.js 生态配合良好，减少在 token 策略上的自定义工作量。  
  - S1 阶段无需为前端 SPA 或多 API 客户端单独设计复杂的 JWT 传播方案。  

- **Alternatives considered**  
  - 纯 JWT Session（不落地数据库，仅依赖签名和过期时间）：  
    - **优点**：避免额外的 Session 表，减少一次数据库查询。  
    - **缺点**：难以集中吊销，审计与追踪能力较弱；考虑到本项目需要对历史演出进行长期追踪与管理，数据库 Session 更合适。  
  - 自建鉴权系统：  
    - **优点**：灵活度最高。  
    - **缺点**：与项目目标不符，Auth.js 已经满足需求，重造轮子不必要。  

---

### 1.3 部署目标环境与运行时约束

- **Decision**  
  - S1 阶段默认部署目标为 **Vercel 上的 Next.js 应用** 或等价的 Node.js 20 LTS 运行环境；具体部署实现时应避免依赖 Vercel 私有特性（如特定 Edge Runtime 行为），保持对普通 Node 容器的兼容性。  
  - 所有后台逻辑优先实现为 **Route Handlers + Server Actions**，不锁定于特定 PaaS 的长连接能力；必要时通过 WebSocket/Server-Sent Events 提供更流畅的对话体验，但在 MVP 阶段可以先用按轮请求/响应模式。  

- **Rationale**  
  - Next.js 在 Vercel 上一等支持最佳，但保持 Node 运行时兼容可以在未来迁移到 Kubernetes 或其他 PaaS。  
  - Spec 中对实时性要求并非强制「流式输出」，只要单轮对话在 5 秒内完成即可；因此按轮拉取是可接受的，流式支持可以在后续迭代中增加。  

- **Alternatives considered**  
  - 直接基于自建 Node 容器或 Serverless Functions：  
    - **优点**：对基础设施掌控力强。  
    - **缺点**：S1 阶段搭建维护成本更高，且偏离 Next.js 主流部署路径。  

---

## 2. Technology Choices & Best Practices

### 2.1 Next.js 全栈架构

- **Decision**  
  - 使用 Next.js 14 App Router，在 `apps/web/app/` 下划分路由分组：  
    - `(auth)`：登录与账号管理。  
    - `drama/new`：创建情景剧向导。  
    - `drama/[sessionId]`：进行中/历史演出详情。  
    - `drama/library`：场景/角色模板库管理。  
  - 所有对数据库的访问集中在 server components 与 route handlers 中，通过 `lib/db` 暴露 Prisma 客户端。  

- **Rationale**  
  - App Router 更适合构建具有明显布局/子路由结构的复杂 UI，如本特性的向导页面与详情页面。  
  - 将数据访问逻辑集中管理可以降低重复代码、统一错误处理与日志记录。  

- **Alternatives considered**  
  - 使用 Pages Router 或将 API 独立为单独的 Node 服务：  
    - **缺点**：URI 设计与布局组织不如 App Router 自然；单独后端服务在 MVP 阶段增加运维和部署成本。  

---

### 2.2 Tailwind CSS + shadcn/ui

- **Decision**  
  - 使用 Tailwind CSS 提供原子化样式，shadcn/ui 作为基础组件库，在其基础上定制「舞台」风格（例如暗色背景、聚光灯效果的对话气泡）。  
  - 将情景剧相关的复用组件（角色卡片、对话时间轴、控制面板等）放在 `apps/web/components/drama/` 下，避免散落在多个目录。  

- **Rationale**  
  - Tailwind + shadcn/ui 在 Next.js 社区已有成熟实践，能在保证一致性的同时快速迭代 UI。  
  - 将情景剧相关组件聚合有利于将来为其他产品线复用或抽取为 npm 包。  

- **Alternatives considered**  
  - 自行设计组件库或使用其他 UI 框架（如 MUI、Ant Design）：  
    - **缺点**：要么设计成本过高，要么与 Tailwind 的整合度不如 shadcn/ui 自然。  

---

### 2.3 PostgreSQL + Prisma 数据层

- **Decision**  
  - 使用 PostgreSQL 作为唯一持久化存储，所有实体（User、SceneTemplate、RoleTemplate、DramaSession、Turn）都通过 Prisma schema 映射到数据库表。  
  - 明确以下约束与索引：  
    - 所有实体的主键使用 `cuid()` / `uuid`。  
    - 对 `DramaSession.userId`、`DramaSession.status`、`Turn.dramaSessionId` 建立组合索引，以兼顾历史查询与会话内加载。  
    - `SceneTemplate` 和 `RoleTemplate` 采用软删除标记（如 `deletedAt`），避免误删影响历史演出重放。  

- **Rationale**  
  - Prisma 提供良好的类型安全与迁移系统，适合 TypeScript 栈。  
  - PostgreSQL 对 JSON 字段与复杂查询支持较好，之后可为 LLM 调用记录或统计数据引入 JSON 列。  

- **Alternatives considered**  
  - 使用文档数据库（如 MongoDB）存储会话与 Turn：  
    - **优点**：更自然地保存嵌套对话结构。  
    - **缺点**：与现有 Auth.js Postgres 体系分裂，破坏单一存储原则；事务一致性与复杂查询不如 PostgreSQL 直观。  

---

### 2.4 Multi-Actor Conversation Orchestration（多角色轮流对话编排）

- **Decision**  
  - 使用中心化「导演」逻辑（`lib/drama/orchestrator.ts`），根据 DramaSession 配置维护一个简单状态机：  
    - 状态：`draft` → `running` → `paused` / `completed` / `aborted`。  
    - 每一轮根据预设角色顺序选出当前发言角色，构建 LLM 调用所需的上下文（场景 prompt + 各角色 persona + 历史对话）。  
  - 为每个角色定义独立的 persona/system prompt，在调用 LLM 时注入：  
    - 「你现在扮演 {角色名}，背景是 ...，说话风格是 ...」等。  
  - 每次生成一个 Turn 时立即写入数据库，确保即便在下一轮前发生异常，用户也可以从已有 Turn 恢复。  

- **Rationale**  
  - 中心化 orchestrator 简化了多角色对话流转逻辑，便于实现暂停、重新生成、跳过轮次等控制。  
  - 每轮持久化 Turn 记录满足 Spec 中对「可回看、可恢复」的要求。  

- **Alternatives considered**  
  - 完全基于前端状态管理对话，不在服务端持久化：  
    - **缺点**：无法实现中断恢复与历史详情页面，明显违背 Spec。  
  - 为每个角色创建独立 LLM 会话并在服务端并行调用：  
    - **优点**：理论上能提高生成效率。  
    - **缺点**：上下文同步复杂，容易导致角色之间信息不一致；在 S1 阶段不必要。  

---

## 3. Integration Patterns

### 3.1 Next.js + Auth.js + Prisma

- **Decision**  
  - 按 Auth.js 官方推荐方式将 Prisma Adapter 集成到 Next.js 的 App Router 中，在服务器端安全地读取当前用户信息。  
  - 所有涉及 User 关联的 API（如创建 DramaSession、保存模板等）都通过服务端中间层统一获得 `userId`，前端不直接传入用户标识。  

- **Rationale**  
  - 降低权限绕过风险，避免前端伪造 userId。  
  - 方便在后续增加审计与访问控制（如限制删除其他用户的记录）。  

---

### 3.2 Next.js Route Handlers + LLM Gateway + OpenAPI 合约

- **Decision**  
  - 为场景/角色/DramaSession/Turn 定义 REST 风格 API，Route Handlers 实际实现细节，并保证与 `contracts/drama-stage.openapi.yaml` 中的 OpenAPI 合约一致。  
  - LLM Gateway 不直接暴露为外部 API，而是作为内部库被上述 Route Handlers 调用；对外只暴露业务语义接口（例如「生成下一轮对话」）。  

- **Rationale**  
  - 保持对外 API 简洁，以业务实体为中心；内部可以自由演进 LLM 调用策略而不破坏公共接口。  
  - OpenAPI 合约提供自动生成客户端与合约测试的基础。  

- **Alternatives considered**  
  - 将 LLM Gateway 直接作为公开 API 暴露：  
    - **缺点**：增加外部误用的可能性，也不利于限制成本（用户可随意调用底层模型）。  

---

## 4. Summary

经过本阶段调研：

- 已对 Technical Context 中的关键未知项（LLM 供应商与抽象、Auth.js 会话策略、部署环境）给出明确决策，并均可通过配置灵活调整。  
- 为核心技术栈（Next.js、Tailwind + shadcn/ui、PostgreSQL + Prisma、Auth.js）确立了符合 S1 阶段的最佳实践使用方式。  
- 设计了中心化的多角色对话 orchestrator 模式与持久化策略，为后续 `data-model.md`、OpenAPI 合约及实现提供了稳定基础。  

本 `research.md` 解决了当前规划中的所有 **NEEDS CLARIFICATION**，后续阶段可基于此直接进入数据建模与接口设计。


