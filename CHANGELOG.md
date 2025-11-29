# Changelog

本文件记录 ATWAS 仓库中对外可见的主要变更。

## [Unreleased]

### Added

- AI 情景剧舞台（多 AI 角色轮流对话）初始实现规划与项目骨架：
  - 基于 Next.js 14 App Router 的单体应用骨架（`app/`、`package.json` 等）。
  - Tailwind CSS + 基础 UI 组件目录（`components/ui/*`）。
  - 相关设计与实现文档位于：`specs/001-ai-drama-stage/`，包括 `plan.md`、`data-model.md`、`research.md`、`quickstart.md` 与 OpenAPI 契约 `contracts/drama-stage.openapi.yaml`。
