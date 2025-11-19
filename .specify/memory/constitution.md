# [PROJECT_NAME] Constitution
<!-- Example: Spec Constitution, TaskFlow Constitution, etc. -->

## Core Principles

### I. Spec-Driven Delivery (Highest-Priority Principle)
<!-- Spec-driven principle: constitution and specs lead, implementation follows -->
Every change in the project is driven by written governance and specifications, never by ad-hoc implementation.
At project inception we first define and ratify the project constitution, then only amend it occasionally through an explicit, versioned process.

- Project lifecycle:
  - Constitution-first: establish and maintain the project constitution as the highest source of truth for principles, quality gates, and workflows.
  - Amendment discipline: update the constitution rarely, with clear rationale, version bump, and explicit impact on templates and commands.

- Feature lifecycle (spec-first workflow):
  1. Specify: capture feature requirements in a structured, human-readable specification.
  2. Clarify: resolve ambiguities and missing decisions directly inside the spec.
  3. Plan: create a technical plan that respects the constitution and the spec.
  4. Tasks: derive an ordered, executable tasks list from the plan.
  5. Checklists: generate requirements-quality checklists for critical domains (UX, API, security, performance, etc.).
  6. Analyze: run read-only consistency and coverage analysis across spec, plan, and tasks.
  7. Implement: execute tasks phase-by-phase, updating task status and honoring tests and quality gates.
  8. Issues (optional): mirror tasks into external issue trackers for project management when needed.

Implementation MUST NOT begin before at least the spec, plan, and tasks are in place, except for explicitly labeled spikes or experiments.

### [PRINCIPLE_1_NAME]
<!-- Example: I. Library-First -->
[PRINCIPLE_1_DESCRIPTION]
<!-- Example: Every feature starts as a standalone library; Libraries must be self-contained, independently testable, documented; Clear purpose required - no organizational-only libraries -->

### [PRINCIPLE_2_NAME]
<!-- Example: II. CLI Interface -->
[PRINCIPLE_2_DESCRIPTION]
<!-- Example: Every library exposes functionality via CLI; Text in/out protocol: stdin/args → stdout, errors → stderr; Support JSON + human-readable formats -->

### [PRINCIPLE_3_NAME]
<!-- Example: III. Test-First (NON-NEGOTIABLE) -->
[PRINCIPLE_3_DESCRIPTION]
<!-- Example: TDD mandatory: Tests written → User approved → Tests fail → Then implement; Red-Green-Refactor cycle strictly enforced -->

### [PRINCIPLE_4_NAME]
<!-- Example: IV. Integration Testing -->
[PRINCIPLE_4_DESCRIPTION]
<!-- Example: Focus areas requiring integration tests: New library contract tests, Contract changes, Inter-service communication, Shared schemas -->

### [PRINCIPLE_5_NAME]
<!-- Example: V. Observability, VI. Versioning & Breaking Changes, VII. Simplicity -->
[PRINCIPLE_5_DESCRIPTION]
<!-- Example: Text I/O ensures debuggability; Structured logging required; Or: MAJOR.MINOR.BUILD format; Or: Start simple, YAGNI principles -->

## [SECTION_2_NAME]
<!-- Example: Additional Constraints, Security Requirements, Performance Standards, etc. -->

[SECTION_2_CONTENT]
<!-- Example: Technology stack requirements, compliance standards, deployment policies, etc. -->

## [SECTION_3_NAME]
<!-- Example: Development Workflow, Review Process, Quality Gates, etc. -->

[SECTION_3_CONTENT]
<!-- Example: Code review requirements, testing gates, deployment approval process, etc. -->

## Governance
<!-- Example: Constitution supersedes all other practices; Amendments require documentation, approval, migration plan -->

[GOVERNANCE_RULES]
<!-- Example: All PRs/reviews must verify compliance; Complexity must be justified; Use [GUIDANCE_FILE] for runtime development guidance -->

**Version**: [CONSTITUTION_VERSION] | **Ratified**: [RATIFICATION_DATE] | **Last Amended**: [LAST_AMENDED_DATE]
<!-- Example: Version: 2.1.1 | Ratified: 2025-06-13 | Last Amended: 2025-07-16 -->
