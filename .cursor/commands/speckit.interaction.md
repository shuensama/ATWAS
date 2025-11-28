---
description: Generate an interaction-flow and low-fidelity prototype design from the current feature specification.
handoffs: 
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a technical plan that respects both the spec and the interaction design. I am building with...
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Bridge the gap between a text-only spec and implementation by generating a **fully spec‑aligned
interaction-flow design** plus a **lightweight, functional prototype sketch**. This command sits
between `/speckit.specify` (and `/speckit.clarify`) and `/speckit.plan`:

- Translate `spec.md` into explicit, end‑to‑end user flows and screens
- Make implicit mental models visible and reviewable before technical planning
- Surface remaining ambiguity as concrete questions tied to steps/screens
- Produce a simple, technology‑agnostic prototype description for key screens

This step MUST NOT introduce new hidden requirements; any necessary assumptions MUST be
called out explicitly for later spec updates or clarification.

## Outline

1. **Setup**: Locate the active feature and its `spec.md`
2. **Load spec context**: Extract actors, user stories, requirements, and edge cases
3. **Build interaction model**: Derive user flows, screens, and states strictly from the spec
4. **Generate interaction-design.md**: Document flows, screens, and open questions
5. **Generate low-fidelity prototypes**: Sketch key screens in a concise, implementation‑agnostic way
6. **Coverage & ambiguity summary**: Ensure every user story is covered and gaps are visible
7. **Next actions**: Suggest whether to refine the spec further or proceed to `/speckit.plan`

## Execution Steps

### 1. Setup (feature discovery)

1. Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly` from the repo root.
2. Parse the minimal JSON payload fields:
   - `FEATURE_DIR`
   - `FEATURE_SPEC` (path to `spec.md`)
   - (Optionally capture `IMPL_PLAN`, `TASKS` for future chained flows.)
3. If JSON parsing fails or `FEATURE_SPEC` is missing:
   - Abort and instruct the user to run `/speckit.specify` first (and `/speckit.clarify` if needed).
4. For single quotes in args like "I'm Groot", use escape syntax:
   - PowerShell: `"I'm Groot"` or `'I'\''m Groot'`

### 2. Load spec context (what we design from)

1. Read `FEATURE_SPEC` once into memory; do not modify it in this command.
2. Extract the following sections (using the spec template structure as guidance):
   - Overview / Context
   - User Roles / Personas (if present)
   - User Stories (including priorities such as P1, P2, P3)
   - Functional Requirements
   - Non‑Functional Requirements related to UX, performance, and accessibility
   - Edge Cases / Error Handling (if present)
3. Build a **user story inventory**:
   - Stable ID (e.g., `US1`, `US2`, or existing IDs in the spec)
   - Title / short label
   - Priority (P1/P2/…)
   - Acceptance criteria (if provided)
4. Build an **actor inventory**:
   - Distinct user roles (e.g., Anonymous User, Authenticated User, Admin)
   - System / background actors (e.g., Scheduler, External API) if referenced in the spec

### 3. Build interaction model (flows, screens, states)

1. For each user story in the inventory:
   - Identify:
     - Entry conditions (preconditions, triggers, starting screen/state)
     - Success criteria (what “done” looks like for the user)
   - Draft a **Main Success Flow**:
     - A linear sequence of steps from entry to success:
       - At each step, record:
         - **Actor action** (what the user does or what event occurs)
         - **System response** (visible outcome, not implementation detail)
         - **Screen / state** (where this happens)
         - References to relevant spec sections (e.g., `[Spec §US1]`, `[Spec §FR-3]`)
   - Draft **Alternate / Exception Flows** where indicated by the spec:
     - Alternate choices, optional branches, or role‑specific variations
     - Error, empty, or edge‑case paths (e.g., validation errors, missing data)
2. Normalize **screens / views** from the flows:
   - Cluster steps into logical screens (e.g., "Landing Page", "Episode Detail", "Settings Dialog")
   - Assign each screen a stable ID: `S1`, `S2`, `S3`, …
   - For each screen, record:
     - Name and short purpose
     - Which user stories and flows use it
     - Key states (e.g., empty, loading, error, populated)
3. Guardrails for alignment with `spec.md`:
   - Do NOT invent new features or behaviour not implied by the spec.
   - When a design decision requires an assumption (e.g., default sorting, pagination style):
     - Mark it as `[ASSUMPTION]` and reference the related story or requirement.
   - When a flow step reveals a gap or contradiction in the spec:
     - Mark it as `[NEEDS SPEC UPDATE]` and quote the relevant spec text where possible.

### 4. Generate interaction-design.md (flows & screens)

1. Target output path: `${FEATURE_DIR}/interaction-design.md`.
2. This file SHOULD be **idempotent**:
   - Overwrite or regenerate the entire file each run based on the current `spec.md`.
3. Use the following high‑level structure (do not embed raw spec text; summarize instead):

   - `# Interaction & Prototype Design: [FEATURE NAME]`
   - **Source of Truth**
     - Path to `spec.md`
     - Version or commit reference if available
   - **Actors & Roles**
     - Bullet list of actors with short responsibilities
   - **Screen Inventory**
     - Markdown table:

       ```text
       | Screen ID | Name              | Used By Stories | Key States                |
       |-----------|-------------------|-----------------|---------------------------|
       | S1        | Landing Page      | US1, US2        | empty, loading, populated |
       | S2        | Episode Detail    | US1             | loading, error, success   |
       ```

   - **Flows by User Story**
     - For each user story (in priority order, P1 first):
       - `### [USx] Title (Priority: Px)`
       - `#### Main Success Flow`
         - Numbered steps: `<Step N> [Actor] → [System] @ [ScreenID] (Spec refs)`
       - `#### Alternate / Exception Flows` (if any)
         - Bulleted sub‑flows with branching conditions
   - **Open Questions, Assumptions & Spec Gaps**
     - Grouped list of:
       - `[ASSUMPTION] ... (Story: USx, Screen: Sy)`
       - `[NEEDS SPEC UPDATE] ... (Story: USx, Flow step N, Spec §ref)`

4. Keep this document **technology‑agnostic**:
   - No mention of frameworks, routes, components, or styling systems.
   - Focus on **what the user sees and does**, and **how the system responds**.

### 5. Generate low-fidelity prototypes (within interaction-design.md)

1. In the same `interaction-design.md`, add a `## Low-Fidelity Prototypes` section after the flows.
2. For each screen in the Screen Inventory (especially those participating in P1 flows):
   - Add a subsection: `### [ScreenID] [Screen Name]`
   - Include:
     - **Purpose**: 1–2 sentences linking to user stories and flows.
     - **Priority**: e.g., `P1 Smoke`, `P2`, `Support`.
     - **Layout outline**:
       - Main regions (Header, Sidebar, Content, Footer, Modal, etc.)
       - For each region: short bullet describing what it contains conceptually.
     - **Key interactive elements**:
       - Labels and roles (e.g., "Primary CTA: Start Episode", "Filter dropdown")
       - Important states (default, disabled, error, loading).
   - Optionally, render a simple ASCII wireframe in a fenced code block to make the layout
     more concrete, for example:

     ```text
     +--------------------------------------------------+
     | Header: Title + Primary CTA                      |
     +---------------------+----------------------------+
     | Sidebar: Filters    | Content: Episode list      |
     |                     | - Card with title, badge   |
     |                     | - Empty state placeholder  |
     +---------------------+----------------------------+
     ```

3. Do NOT attempt high‑fidelity visual design:
   - No pixel specs, colours, fonts, or spacing systems.
   - The goal is to make the **structure and interaction** obvious to both PMs and engineers.

### 6. Coverage & ambiguity summary

1. At the end of `interaction-design.md`, add a `## Coverage Summary` section containing:

   - A coverage table:

     ```text
     | User Story ID | Priority | Has Main Flow? | Has Alt/Exception? | Screens Used | Notes |
     |---------------|----------|----------------|--------------------|--------------|-------|
     | US1           | P1       | Yes            | Yes                | S1, S2       |       |
     | US2           | P2       | Yes            | No                 | S1           | [ASSUMPTION] X |
     ```

   - Metrics:
     - Total user stories
     - Stories with ≥1 main flow
     - Stories with alt/exception flows
     - Count of `[ASSUMPTION]` items
     - Count of `[NEEDS SPEC UPDATE]` items
2. Assign a simple severity heuristic:
   - **CRITICAL**:
     - Any P1 story without a main success flow
     - Any contradiction between flows and spec that blocks understanding
   - **HIGH**:
     - Stories with flows that depend on multiple `[NEEDS SPEC UPDATE]` items
   - **MEDIUM**:
     - Stories missing explicit edge‑case / error flows despite risky operations
   - **LOW**:
     - Stylistic decisions or UI polish aspects clearly deferrable to implementation

### 7. Next actions & integration with other commands

1. This command is **read‑only** with respect to `spec.md`:
   - It MUST NOT modify the spec directly.
   - Instead, it documents where the spec should be updated or clarified.
2. At the end of the run, report to the user:
   - Path to `interaction-design.md`
   - Coverage metrics (stories covered, critical gaps)
   - Counts of `[ASSUMPTION]` and `[NEEDS SPEC UPDATE]` items
3. Suggest next steps based on results:
   - If any **CRITICAL** or **HIGH** issues exist:
     - Recommend updating the spec and/or running `/speckit.clarify` to resolve gaps
     - Advise against proceeding to `/speckit.plan` until these are addressed
   - If only **MEDIUM/LOW** issues exist:
     - Recommend optionally tightening the spec, then proceeding to `/speckit.plan`
4. When `/speckit.plan` is invoked afterwards:
   - Treat `interaction-design.md` as an **additional, non‑authoritative input**:
     - It MAY guide API design, data modelling, and contracts.
     - In any conflict, `spec.md` and the constitution remain the sources of truth.

## Operating Principles

- **Spec alignment first**: All flows and prototypes must map back to existing stories and
  requirements; gaps are called out, not silently filled.
- **Visualization over narration**: Prefer structured flows, tables, and simple diagrams over
  long prose to reduce ambiguity.
- **Technology agnostic**: No framework or implementation details; this is a UX/interaction
  design layer, not a code‑level plan.
- **Review‑friendly**: `interaction-design.md` should be easy for both PMs and engineers to
  review and comment on before deep technical planning begins.


