# Feature Specification: AI情景剧舞台（多AI角色轮流对话）

**Feature Branch**: `001-ai-drama-stage`  
**Created**: 2025-11-23  
**Status**: Draft  
**Input**: User description: "创立一个AI情景剧的应用。AI作为演员，多个AI扮演各自的角色进行轮流对话。同时提供利用AI生成AI演员的prompt的功能。提供场景prompt,角色prompt的保存与选取功能"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 创建并观看一场多 AI 情景剧 (Priority: P1)

一名创作者/普通用户希望快速配置一场由多个 AI 演员参与的情景剧：先选定一个整体场景设定（场景 prompt），再为每个 AI 演员选择或创建其角色设定（角色 prompt），然后让这些 AI 演员按照设定好的顺序轮流对话，完整演出一个场景。

**Why this priority**: 这是整个产品的核心价值——让用户能「看一场 AI 演的戏」。如果不能顺畅地完成多角色轮流对话的创建和播放，其他功能（如 Prompt 管理、AI 生成角色等）都无法体现价值。

**Independent Test**: 只实现该故事（场景选择 + 角色配置 + 轮流对话播放），就可以形成一个可演示的 MVP：用户可以从零开始配置一场演出，并看到一轮完整的对话。

**Acceptance Scenarios**:

1. **Given** 用户首次进入情景剧创建界面，**When** 用户选择一个场景 prompt、添加至少 2 个 AI 演员（为每个演员配置名称和角色 prompt），并点击「开始演出」，**Then** 系统自动按照设定顺序，在单一界面中轮流展示每个 AI 演员的发言，直至完成预设轮数。
2. **Given** 用户已经保存过若干场景和角色，**When** 用户从「最近使用/收藏」中选取一个场景和至少 2 个角色，然后直接点击「开始演出」，**Then** 从进入创建页到第一轮对话生成的整体用时不超过 3 分钟。
3. **Given** 一场正在进行中的情景剧演出，**When** 用户点击「暂停」或「下一轮」等控制按钮，**Then** 系统应在当前轮次完成后及时响应控制指令（停止继续自动生成或只在触发时生成下一轮）。

---

### User Story 2 - 利用 AI 生成新的 AI 演员角色设定 (Priority: P2)

用户希望在不知道如何写高质量 prompt 的情况下，通过与系统对话的方式，让系统帮助生成一个完整的 AI 演员设定（角色 prompt），并可直接保存为可复用的演员模板。

**Why this priority**: 很多用户不会写详细的人设 prompt，这是使用门槛。通过 AI 协助生成角色设定，可以大幅降低使用成本，并提高生成内容的一致性与质量。

**Independent Test**: 即使暂时没有场景与演出功能，用户也可以单独使用「AI 生成角色」功能，完成从描述需求到生成可复用角色模板的闭环。

**Acceptance Scenarios**:

1. **Given** 用户在「创建新角色」界面，**When** 用户用自然语言描述想要的角色（例如职业、性格、说话风格、关系设定等），**Then** 系统返回一份结构化的角色 prompt 草稿（含角色名称建议、背景简介、说话风格、行为原则等），并允许用户进一步编辑。
2. **Given** 系统已经生成了一份角色 prompt 草稿，**When** 用户点击「保存为角色模板」，**Then** 该角色会写入用户的角色库，并可以在创建情景剧时被直接选取。
3. **Given** 用户对生成结果不满意，**When** 用户点击「重新生成」或补充更多需求描述，**Then** 系统基于最新描述生成新的角色 prompt 草稿，并不会覆盖已保存的历史模板。

---

### User Story 3 - 管理与复用场景/角色 Prompt 库 (Priority: P3)

高频使用的用户希望能管理和复用自己的场景 prompt 与角色 prompt：包括查看、搜索、筛选、编辑与删除，避免每次演出都从零开始配置，提升创作效率。

**Why this priority**: Prompt 库的管理直接影响长期留存与效率，能够把一次性试验转化为可持续复用的资产，是产品从「玩具」走向「工具」的关键。

**Independent Test**: 即便还没有 AI 生成角色的能力，只要场景与角色库的增删改查和选取功能可用，用户就可以基于已有 prompt 快速创建新的情景剧。

**Acceptance Scenarios**:

1. **Given** 用户已经累积了多条场景 prompt 和角色 prompt，**When** 用户在「我的库」中按名称关键字或标签进行搜索，**Then** 系统仅展示匹配的场景或角色并支持点击预览详细内容。
2. **Given** 用户选中一个已有的场景或角色，**When** 用户点击「编辑」并保存修改，**Then** 后续新创建的情景剧如果选用该场景/角色，将使用更新后的内容。
3. **Given** 用户希望清理不再使用的模板，**When** 用户在列表中删除某个场景/角色，**Then** 该项从列表中移除，并不会影响已经历史完成的演出记录。

---

### Edge Cases

- 当用户仅配置了 2 个角色，其中一个角色的 prompt 极其简短或含糊不清时，系统应仍能正常生成对话，同时通过界面提示用户可以优化角色设定以提升效果。
- 当某个 AI 演员在某轮输出内容异常冗长或明显偏离其角色设定时，系统应允许用户快速跳过该轮、重新触发生成或结束演出。
- 当用户配置了超过推荐上限数量的角色（例如超过 6 个）或轮数（例如超过 20 轮）时，系统应给予清晰提示可能影响体验，并要求用户明确确认后再开始演出。
- 当网络中断或系统错误导致某一轮对话生成失败时，系统应在界面上明确提示失败原因，并允许用户选择重试生成、跳过该轮或结束演出。

## Clarifications

### Session 2025-11-23

- Q: 本阶段情景剧演出的输出形态需要支持文本、语音还是视频？ → A: 仅支持纯文本对话输出，不提供语音或视频。
- Q: 系统是否需要为每次情景剧演出持久化完整对话内容，并提供可回看的历史详情？ → A: 需要保存完整对话并提供历史详情页逐轮回看。
- Q: 当用户关闭或刷新页面时，正在进行中的情景剧演出应如何处理？ → A: 支持在下次进入时从中断处继续演出，基于已保存对话重建上下文继续生成后续轮次。
- Q: 历史演出记录的保留与删除策略是什么？ → A: 默认长期保留所有历史演出，用户可在历史列表中手动删除任意记录。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a user to create an AI 情景剧演出会话，配置一个场景 prompt，以及至少 2 个、至多 6 个 AI 演员，每个演员包含：可见名称、角色描述 prompt 和可选的头像/标识。
- **FR-002**: System MUST orchestrate turns between AI 演员，根据用户预设的轮流顺序和总轮数，自动生成并展示每一轮对话；每一轮必须清晰标注当前发言的角色身份和轮次。
- **FR-003**: System MUST provide basic playback controls for an ongoing 演出，包括：开始、暂停/继续、手动触发下一轮、提前结束本场演出。
- **FR-004**: System MUST allow users to save a 场景 prompt as a 可复用「场景模板」，包括：名称、详细说明、可选标签（如题材、情绪、时代背景等）和最近使用时间。
- **FR-005**: System MUST allow users to save a 角色 prompt as a 可复用「角色模板」，包括：名称、角色背景简介、说话/行为风格说明、可选标签和头像/图标。
- **FR-006**: System MUST provide an AI-assisted flow to generate a new 角色模板：用户通过自然语言描述需求，系统生成一份结构化的角色 prompt 建议文本，用户可在确认前自由编辑后再保存为模板。
- **FR-007**: System MUST provide list, search and filter capabilities for both 场景模板 and 角色模板，至少支持按名称关键字、标签、最近使用排序进行筛选，并可在列表中快速预览主要内容。
- **FR-008**: System MUST ensure that when a user starts a new 演出，会话中实际使用的场景和角色设定来自用户在启动前确认的配置：包括基于所选场景/角色模板生成的场次级快照，并在界面中以可查看的形式呈现当前会话所用的全部场景与角色设定。
- **FR-009**: System MUST support efficient reuse of existing 场景 prompt 与角色 prompt when creating a new 演出：允许用户从已保存的场景模板与角色模板中选取并预填当前会话配置（以及可选地从某一历史演出复制其配置为新会话起点），同时 SHOULD 提供一键复制当前会话所用场景与角色 prompt 的能力，以便在其他工具中复用或备份。
- **FR-010**: System MUST implement basic safety constraints for generated content（例如对明显违规或不适宜内容进行拦截或弱化处理），并在必要时向用户展示友好的提示说明原因。
- **FR-011**: System MUST persist the full conversation content of each DramaSession（包含所有 Turn 对话轮次），并提供「历史演出详情」视图，使用户可以按轮次回看任意一场已完成的演出。
- **FR-012**: System MUST allow users to resume an in-progress DramaSession after closing or refreshing the page, by restoring its configuration and all previously generated Turns, and continuing to generate subsequent Turns from the last saved state using the stateless AI model.
- **FR-013**: System MUST provide a 「历史演出」列表视图，用于展示用户全部已保存的 DramaSession，并允许用户在该列表中选择并删除任意一条或多条历史演出记录；未被用户删除的记录默认长期保留。

### Key Entities *(include if feature involves data)*

- **User**: 使用本应用配置和观看 AI 情景剧的个人；拥有自己的场景模板库、角色模板库和历史演出记录。
- **SceneTemplate（场景模板）**: 描述情景剧整体背景和气氛的文本设定，包含：名称、详细描述、标签、创建时间和最近使用时间。
- **RoleTemplate（角色模板/AI 演员）**: 用于驱动单个 AI 演员行为的人设设定，包含：名称、角色背景、说话/行为风格、标签、可选头像，以及与 User 的归属关系。
- **DramaSession（情景剧会话）**: 一次实际的演出实例，引用一个 SceneTemplate 和 2–6 个 RoleTemplate，并记录配置参数（轮流顺序、总轮数等）与每一轮对话内容，并将完整对话持久化存储以便后续回看，包含状态字段（如进行中、已完成），用于支持中断后继续演出。
- **Turn（对话轮次）**: DramaSession 内的单轮发言单元，包含：轮次编号、发言角色、生成文本、时间，以及与前后轮次的顺序关系，用于在「历史演出详情」中逐轮展示。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 在可用性测试中，至少 80% 的新用户能够在首次接触产品时，在不查看文档的情况下，于 5 分钟内完成一场包含至少 2 个角色和 5 轮对话的情景剧创建并观看完整演出。
- **SC-002**: 对于包含不超过 4 个角色、总轮数不超过 10 轮的标准情景剧，在正常网络环境下，至少 95% 的对话轮次从用户触发到看到完整内容的等待时间不超过 5 秒，用户主观感受为「几乎即时」。
- **SC-003**: 在首批推出后的真实使用数据中，至少 70% 使用过「AI 生成角色」功能的用户，会成功保存至少 1 个角色模板，并在后续情景剧演出中复用该模板至少 1 次。
- **SC-004**: 对比未提供 Prompt 库管理能力的基线版本，引入场景/角色模板库后，用户完成第二场及之后情景剧配置所需时间的中位数降低至少 40%，并在用户调研中被主观评价为「配置更省时」。

## Assumptions

- 本功能首阶段面向单用户创作与观看场景，不考虑多人实时协作或观众互动功能。
- 用户创建的场景模板、角色模板和演出记录默认仅对本人可见，不涉及公开社区分享与内容平台分发。
- 系统默认支持多语言内容创作，但界面语言与文案以简体中文为主；多语言切换属于后续扩展范畴。
- 安全与合规按通用内容创作产品的行业标准执行，不涉及特殊高敏感行业（如医疗、金融合规审计等）的专门要求。
 - 历史演出记录在默认情况下长期保留，不设置自动过期时间；用户可随时通过产品界面手动删除任意历史演出记录。

## Dependencies & Constraints

- 依赖稳定可用的通用对话式 AI 能力，用于生成多轮对话内容与角色 prompt 建议，但规格中不限定具体模型或服务提供方。
- 依赖基础的用户账号体系，以便将场景模板、角色模板和演出记录与具体用户关联和持久化存储。
- UI 需能清晰展示多角色轮流发言与当前轮次状态，但本规格不限定具体交互形式，仅要求信息对用户一目了然。
- 本阶段仅支持纯文本对话输出（文字对话区/气泡），不提供语音或视频播放功能；语音/视频演出能力明确归为后续版本范围，不在本规格内。

 