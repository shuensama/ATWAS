# Quickstart: AI 情景剧舞台（多 AI 角色轮流对话）

本指南面向需要在本地运行与开发「AI 情景剧舞台」功能的工程师，依据 ATWAS Constitution 的 S1 要求，说明：

- 如何准备开发环境与配置
- 如何启动 Next.js 应用
- 如何运行 P1 smoke path（创建并观看一场多 AI 情景剧）

> 仓库根目录假定为：`E:\AI\ATWAS`

---

## 1. 前置条件

- Node.js **20.x**（建议使用官方 LTS）  
- 包管理器：`pnpm` 或 `npm`（以下以 `pnpm` 为例，可视团队约定调整）  
- 已安装 PostgreSQL（本地或远程实例均可，推荐本地 Docker 容器）  
- 可访问的对话式 LLM API（兼容 OpenAI API，例如 `https://api.openai.com/v1/chat/completions`）

---

## 2. 克隆仓库与安装依赖

```bash
cd E:\AI
git clone <your-repo-origin> ATWAS
cd ATWAS

# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
# npm install
```

> 说明：依赖安装完成后，Node/TS/Next/Prisma 等工具将在本地 node_modules 中可用。

---

## 3. 配置环境变量（.env）

在仓库根目录创建 `.env` 文件，可参考未来将提供的 `.env.example`。至少需要配置以下键（名称仅为建议，可根据实现时的具体约定微调）：

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/atwas_ai_drama"

AUTH_SECRET="your-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"

OPENAI_API_KEY="sk-..."
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4.1-mini"
```

要求：

- `.env` 不得提交到版本库；  
- `.env.example`（由实现任务补充）应包含上述键名与安全示例值，用于新人上手。

---

## 4. 初始化数据库（Prisma）

> 下述命令在模型与迁移脚本（`prisma/schema.prisma` + `prisma/migrations`）就绪后可用；  
> 当前阶段可作为规划，实际命令名称可随实现微调。

```bash
# 根据 schema 创建/更新数据库表结构
npx prisma migrate dev --name init_ai_drama_stage

# 可选：生成 Prisma Client（若未在 postinstall 中自动执行）
npx prisma generate
```

如需开发环境演示数据（示例场景与角色模板），可在 `scripts/dev-seed.ts` 中编写种子脚本，并通过：

```bash
pnpm ts-node scripts/dev-seed.ts
```

来填充。

---

## 5. 启动开发服务器

```bash
pnpm dev

# 或
# npm run dev
```

默认访问地址：

- 应用首页：`http://localhost:3000/`  
- AI 情景剧舞台入口（示例）：`http://localhost:3000/(drama-stage)`  

> 实际路由结构需与 `app/(drama-stage)/page.tsx` 等实现保持一致。

---

## 6. P1 Smoke Path：创建并观看一场多 AI 情景剧

根据 Constitution 要求，P1 烟囱脚本将封装以下步骤。  
脚本路径（计划）：`scripts/smoke/p1-ai-drama-stage.ts`。

### 6.1 手动验证 P1 流程（在 UI 中）

1. 启动 dev server 并登录（根据 auth.js 实际配置选择 Email/密码或其他方式）。  
2. 进入情景剧创建界面（`/(drama-stage)`）：  
   - 选择一个现有场景模板或新建一个场景；  
   - 添加至少 **2 个** 角色模板（或新建角色并保存为模板）；  
   - 为每个角色配置名称、角色描述 prompt 和可选头像。  
3. 设置：  
   - 轮流顺序；  
   - 总轮数（例如 5 轮）；  
   - 是否自动推进下一轮（可选）。  
4. 点击「开始演出」：  
   - 界面应自动按顺序展示每一轮对话，清晰标注当前角色与轮次；  
   - 支持点击「暂停」「继续」「下一轮」「结束」等控制按钮。  
5. 演出结束后：  
   - 确认完整对话已持久化并出现在「历史演出」列表中；  
   - 点击某条记录进入详情页，验证可逐轮回看。  

### 6.2 计划中的 smoke 脚本（示例接口）

> 具体脚本实现将由后续 `/speckit.tasks` 派生的任务完成，以下为预期使用方式示例。

```bash
# 通过 ts-node 运行 P1 烟囱脚本
pnpm ts-node scripts/smoke/p1-ai-drama-stage.ts
```

脚本职责（非正式伪代码）：

1. 使用测试用户凭据（或测试 token）调用 API：  
   - 创建场景模板；  
   - 创建 2–3 个角色模板；  
   - 创建并启动一场 DramaSession。  
2. 轮询/触发生成若干轮 `Turn`，直到达到 5 轮或预设轮数。  
3. 校验：  
   - `GET /api/drama/sessions` 中能看到该会话；  
   - `GET /api/drama/sessions/{id}/turns` 返回至少 N 条轮次记录；  
   - 所有 HTTP 请求均返回 2xx 且无错误。  
4. 在控制台输出简要结果，并以退出码 `0`/非零代表成功/失败。

---

## 7. 常见问题与排错

- **无法连接数据库**：  
  - 确认 Postgres 已启动，`DATABASE_URL` 正确；  
  - 检查防火墙或容器网络配置。  

- **LLM 调用失败或超时**：  
  - 检查 `OPENAI_API_KEY`/`OPENAI_BASE_URL` 是否正确；  
  - 在开发环境适当延长 API 超时或减少上下文长度。  

- **前端显示 401/403**：  
  - 确认 auth.js 配置与 Provider 设置，确保测试用户成功登录。  

如需进一步信息，可参考：

- `specs/001-ai-drama-stage/spec.md` — 需求与用户故事  
- `specs/001-ai-drama-stage/plan.md` — 实现计划与项目结构  
- `specs/001-ai-drama-stage/contracts/drama-stage.openapi.yaml` — API 契约定义  


