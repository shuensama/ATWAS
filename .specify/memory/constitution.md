<!--
Sync Impact Report (auto-generated, do not edit by hand)

- Version change: TEMPLATE → 1.0.0
- Modified principles:
  - I. Spec-Driven Delivery (Highest-Priority Principle) (clarified, now explicitly binding)
  - II. MVP P1 Smoke Path & Demonstrable Flow (new)
  - III. Code Quality Baseline (Formatting & Static Analysis) (new)
  - IV. Configuration, Secrets & Environment (new)
  - V. Logging, Performance & Observability (S1 Baseline) (new)
  - VI. Versioning, Releases & Dependencies (new)
- Added sections:
  - S1 · MVP Quality Gates & Non-Functional Baseline
  - Development Workflow & S1 Constitution Check
- Removed sections:
  - None
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check section aligned with S1 gates)
  - ✅ .specify/templates/tasks-template.md (examples now include S1 smoke test and env setup)
  - ✅ .specify/templates/checklist-template.md (no S1-specific constraints; compatible)
  - ✅ .specify/templates/spec-template.md (no changes; already consistent with spec-first principle)
  - ✅ .specify/templates/agent-file-template.md (references current constitution stage)
  - ⚠ .specify/templates/commands/*.md (no command templates present in repo; cannot validate)
- Deferred TODOs:
  - None
-->

# ATWAS Constitution

## Core Principles

### I. Spec-Driven Delivery (Highest-Priority Principle)

Every change in the project is driven by written governance and specifications, never by ad-hoc implementation.
At project inception we first define and ratify the project constitution, then only amend it occasionally through an explicit, versioned process.

- Project lifecycle:
  - Constitution-first: establish and maintain this constitution as the highest source of truth for principles, quality gates, and workflows.
  - Amendment discipline: update the constitution rarely, with clear rationale, a semantic version bump, and explicit impact on templates, commands and tooling.
  - Stage alignment: the project is currently at **S1 · MVP (最小可执行)** as defined in `constitution-plan.md`; higher stages (S2–S5) MAY be adopted later through governance.

- Feature lifecycle (spec-first workflow):
  1. Specify: capture feature requirements in a structured, human-readable specification.
  2. Clarify: resolve ambiguities and missing decisions directly inside the spec.
  3. Plan: create a technical plan that respects the constitution and the spec.
  4. Tasks: derive an ordered, executable task list from the plan.
  5. Checklists: generate requirements-quality checklists for critical domains (UX, API, security, performance, etc.).
  6. Analyze: run read-only consistency and coverage analysis across spec, plan, and tasks.
  7. Implement: execute tasks phase-by-phase, updating task status and honoring tests and quality gates.
  8. Issues (optional): mirror tasks into external issue trackers for project management when needed.

Implementation MUST NOT begin before at least the spec, plan, and tasks exist, except for explicitly labeled spikes or experiments which MUST NOT ship to end users.

### II. MVP P1 Smoke Path & Demonstrable Flow

Every feature MUST identify a single, highest-value P1 user journey that can be executed end-to-end as an automated smoke path.

- P1 journey:
  - Each spec MUST mark at least one user story as **Priority: P1** and describe a concrete, end-to-end flow.
  - The P1 flow MUST be independently demonstrable and testable without requiring unfinished stories.

- Smoke script:
  - The repository MUST provide at least one P1 smoke script at `scripts/smoke/p1.*` that executes the primary command / main flow and exits with status code `0` on success.
  - The smoke script MUST be documented in `quickstart.md` so that a new contributor can run it with a single command.

- CI gate:
  - CI pipelines MUST execute the P1 smoke script for the default branch and for any release branch.
  - A failing smoke script MUST block merges to the protected main/release branches at S1.

### III. Code Quality Baseline (Formatting & Static Analysis)

A minimal but strict code-quality baseline is required from day one to keep the MVP maintainable.

- Tooling:
  - The project MUST standardize on a single formatter per language (for example, `black`, `prettier`, `gofmt`) and a static checking tool (for example, `mypy`, `eslint`, `cargo clippy`) where available.
  - Formatter and linter configurations MUST be committed to the repository and treated as code.

- CI enforcement:
  - CI MUST run formatting and static checks on every pull request that targets main or release branches.
  - Errors reported at the configured severity level (error/fatal) MUST block merges; warnings MAY be tolerated at S1 but SHOULD be tracked.

- Local workflow:
  - Developers SHOULD integrate formatters and linters into their local workflow (pre-commit hooks or editor integration) to minimize CI churn.

### IV. Configuration, Secrets & Environment

Configuration MUST be centralized and secrets MUST never leak into version control.

- Single configuration source:
  - Runtime configuration MUST be read from a single, well-defined mechanism (for example, `.env` loaded by a config module) rather than scattered constants.
  - The repository MUST include `.env.example` documenting all required configuration keys with safe example values.

- Secrets hygiene:
  - Real secrets (API keys, tokens, passwords, private keys) MUST NOT be committed to the repository, sample files, or documentation.
  - If a secret is accidentally committed, a remediation task (key rotation + history cleanup if needed) MUST be created and prioritized.

- Environment reproducibility:
  - The minimum set of steps to bootstrap a development environment MUST be documented in `quickstart.md`, including installing dependencies, preparing configuration, and running the P1 smoke test.

### V. Logging, Performance & Observability (S1 Baseline)

S1 requires just enough observability to debug the P1 path and record a basic performance baseline.

- Structured logging:
  - Code along the P1 user journey and other critical paths MUST emit structured logs that include at least: level, timestamp, and a correlation or request ID.
  - Errors and exceptions MUST log context sufficient for reproduction (for example, input identifiers or high-level parameters, but NOT sensitive data).

- Performance budget:
  - Each P1 user journey MUST declare a simple, documented performance budget (for example, "local CLI completes in ≤ 3 seconds on a typical developer machine").
  - At least one manual baseline measurement for the P1 path (including environment description) MUST be recorded in a plan or in the project README at S1.
  - CI integration for performance benchmarks (`scripts/benchmarks/p1.*`) is OPTIONAL at S1 but SHOULD be considered once baseline stabilizes.

- Error handling:
  - The main entry points (CLI, API, or UI) MUST provide actionable error messages instead of generic failures, mapping internal errors to clear user-facing explanations.

### VI. Versioning, Releases & Dependencies

Releases MUST be deliberate, traceable, and compatible with future scaling.

- Versioning & changelog:
  - The project MUST follow Semantic Versioning (`MAJOR.MINOR.PATCH`) for any published artifact or CLI.
  - A `CHANGELOG.md` file at the repository root (or equivalent canonical location) MUST record user-visible changes for each released version.

- Quickstart:
  - A `quickstart.md` document MUST exist and MUST describe how to:
    - set up the environment,
    - run the P1 smoke script,
    - and verify a successful MVP deployment or local run.

- Dependencies:
  - All language-level dependencies MUST be tracked with a lockfile (for example, `package-lock.json`, `poetry.lock`, `Cargo.lock`) to guarantee reproducible installs.
  - New dependencies SHOULD be actively maintained and reasonably popular; obviously abandoned or high-risk libraries MUST NOT be introduced without an explicit risk justification in the plan.

## S1 · MVP Quality Gates & Non-Functional Baseline

S1 (MVP 必需) is the current default stage for the ATWAS project. The goal is to make the primary P1 path demonstrable, reproducible, and debuggable with minimal but clear gates.

The following gates MUST be satisfied before code can be merged into main for a new feature or change that affects the P1 path:

- **Code quality gate**
  - Formatter and static checker configured and passing in CI (Principle III).
- **P1 smoke gate**
  - `scripts/smoke/p1.*` exists, covers the declared P1 journey, and passes locally and in CI (Principle II).
- **Configuration & secrets gate**
  - `.env.example` present and accurate; no real secrets in the repo; configuration loading is centralized (Principle IV).
- **Logging & error gate**
  - Key paths emit structured logs with correlation IDs; main entry-path errors are actionable (Principle V).
- **Performance baseline gate**
  - A simple P1 performance budget is documented and at least one baseline measurement has been recorded (Principle V).
- **Release & onboarding gate**
  - `quickstart.md` exists and allows a new contributor to bootstrap and run the P1 smoke path in one sitting; `CHANGELOG.md` records release intent (Principle VI).
- **Dependency gate**
  - Dependency lockfile committed; obviously unmaintained libraries either avoided or explicitly justified (Principle VI).

Recommended (SHOULD) but deferrable items at S1:

- At least one golden contract test for each externally visible interface.
- Minimal unit tests for core pure functions or domain logic covering key branches.
- A basic performance benchmark script under `scripts/benchmarks/p1.*`.

Deferring any SHOULD item is acceptable at S1 but MUST be recorded in the "Complexity Tracking" section of the feature plan with a target follow-up timeline.

## Development Workflow & S1 Constitution Check

This section defines how the constitution integrates with the Spec → Plan → Tasks workflow and how S1 gates are enforced per feature.

- **Spec & plan alignment**
  - Every feature spec MUST:
    - identify a P1 user story / journey, and
    - describe how it will be demonstrated end-to-end (Principle II).
  - Every feature plan (`plan.md`) MUST:
    - include a "Constitution Check" section that explicitly evaluates each S1 gate,
    - set the current levers for the feature: `team.size`, `risk.level`, `surface`, `release.criticality`, `compliance` as introduced in `constitution-plan.md`.

- **Tasks & execution**
  - Tasks (`tasks.md`) MUST:
    - include setup tasks for formatters, linters, `.env.example`, `CHANGELOG.md`, `quickstart.md`, and the P1 smoke script as applicable,
    - group work so that the P1 journey can be implemented and validated early as an MVP slice.
  - A task labeled as the P1 smoke test MUST be completed and passing before the feature is considered "MVP-complete".

- **Violations & complexity tracking**
  - If any S1 MUST gate cannot be satisfied for a feature, the plan MUST document:
    - which gate is violated,
    - why the violation is temporarily necessary,
    - what simpler alternative was rejected.
  - Such violations MUST be captured in the "Complexity Tracking" table of the plan and SHOULD be repaid within the next one or two feature cycles.

- **Stage evolution**
  - This constitution is written for S1. If the project evolves to S2 or higher as defined in `constitution-plan.md`, the constitution and templates MUST be amended via the governance process to raise gates accordingly.

## Governance

The constitution governs how the project is specified, implemented, and evolved. It supersedes ad-hoc practices and informal conventions.

- **Authority & scope**
  - This constitution is the highest-level document for principles, quality gates, and workflows in the ATWAS repository.
  - The phased roadmap in `constitution-plan.md` provides an implementation path for tightening gates over time; in case of conflict, this constitution takes precedence.

- **Amendment process**
  - Any change to principles, S1 gates, or governance MUST be introduced via a pull request that:
    - clearly describes the motivation and impact,
    - proposes a semantic version bump (MAJOR, MINOR, or PATCH),
    - updates any affected templates (`plan-template.md`, `spec-template.md`, `tasks-template.md`, `checklist-template.md`, `agent-file-template.md`) and documents the changes in the Sync Impact Report at the top of this file.
  - MAJOR: removing or fundamentally redefining principles or gates in a way that invalidates existing plans/tasks.
  - MINOR: adding new principles, sections, or materially expanding guidance.
  - PATCH: clarifications, wording improvements, or non-semantic refinements.

- **Compliance**
  - Reviewers MUST verify that feature specs, plans, and tasks comply with this constitution before approving changes that touch production code paths.
  - Automated tooling (Speckit commands, CI checks, scripts) SHOULD be used to enforce as many rules as practical, but human judgment remains responsible for final compliance.

- **Review cadence**
  - At least once per quarter or on significant project milestones, the maintainer SHOULD review:
    - whether S1 gates remain appropriate,
    - whether the project is ready to advance to S2 as described in `constitution-plan.md`,
    - and whether any governance updates are required.

**Version**: 1.0.0 | **Ratified**: 2025-11-19 | **Last Amended**: 2025-11-19
