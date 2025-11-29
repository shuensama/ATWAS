---
description: Generate previewable HTML+Tailwind prototypes from the current feature spec and interaction design.
handoffs: 
  - label: Build Technical Plan
    agent: speckit.plan
    prompt: Create a technical plan that respects the spec, interaction design, and prototype structure. I am building with...
    send: true
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

From the clarified specification (`spec.md`) and interaction design (`interaction-design.md`), generate
a **previewable HTML prototype** using **Tailwind CSS**, placed under a `prototype/` folder inside
the active `FEATURE_DIR`. The prototype:

- Must visually reflect the screens and flows defined in `interaction-design.md`
- Must stay aligned with `spec.md` (no hidden new requirements)
- Is intentionally low‑fidelity but **clickable enough** to walk through key flows (especially P1)

This step exists to make the feature design **visually reviewable** before deep technical planning.

## Outline

1. **Setup**: Locate `FEATURE_DIR`, `spec.md`, and `interaction-design.md`
2. **Validate inputs**: Ensure interaction design exists and is consistent with spec
3. **Derive prototype model**: Map screens and flows to prototype pages/sections
4. **Generate prototype files** under `${FEATURE_DIR}/prototype/` using HTML + Tailwind via CDN
5. **Wire basic navigation & flow stepping** (minimal JS)
6. **Summarize coverage & limitations** and suggest next steps

## Execution Steps

### 1. Setup (feature discovery)

1. Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json -PathsOnly` from the repo root.
2. Parse the JSON payload fields:
   - `FEATURE_DIR`
   - `FEATURE_SPEC` (path to `spec.md`)
3. Derive:
   - `INTERACTION_DESIGN = ${FEATURE_DIR}/interaction-design.md`
   - `PROTOTYPE_DIR = ${FEATURE_DIR}/prototype`
4. If `FEATURE_SPEC` does not exist:
   - Abort and instruct the user to run `/speckit.specify` first.
5. If `INTERACTION_DESIGN` does not exist:
   - Abort and instruct the user to run `/speckit.interaction` first.

### 2. Validate inputs

1. Read `FEATURE_SPEC` and `INTERACTION_DESIGN` into memory.
2. From `interaction-design.md`, parse (structurally, not by brittle regex only):
   - Screen Inventory table:
     - `Screen ID` (e.g., S1, S2)
     - Name
     - Stories using it
   - Flows by User Story:
     - Main success flows and alternate/exception flows
3. From `spec.md`, cross‑check:
   - Each referenced user story (US1, US2, etc.) actually exists.
   - P1 user stories are present and have at least one flow.
4. If **any P1 story lacks flows** or if interaction design refers to non‑existent stories:
   - Report a **CRITICAL** validation error and stop.
   - Ask the user to update `interaction-design.md` and/or `spec.md` before proceeding.

### 3. Derive prototype model

1. Build a **Screen Model**:
   - One prototype “view” per `Screen ID` (S1, S2, …).
   - For each screen, collect:
     - Screen name
     - Related user stories and flows
     - Notable states (empty, loading, error, populated) if present.
2. Build a **Navigation Model**:
   - Determine a default **entry screen**:
     - Prefer the first screen used in the P1 main success flow.
   - Determine simple navigation edges:
     - For each flow step, infer transitions between screens (e.g., from S1 to S2 when user performs a key action).
3. Do NOT invent behaviour not implied by spec/interaction design:
   - When a transition or element is ambiguous, create a placeholder control clearly marked:
     - e.g., button labelled `"TODO: define behaviour (US1, step 3)"`.

### 4. Generate prototype files (HTML + Tailwind)

1. Ensure `PROTOTYPE_DIR` exists; create it if missing.
2. Generate a primary entry file:
   - `${PROTOTYPE_DIR}/index.html`
3. Use this base HTML structure:
   - Standard HTML5 document
   - Include Tailwind via CDN:

     ```html
     <script src="https://cdn.tailwindcss.com"></script>
     ```

   - Add a short `<title>` indicating the feature name and that this is a prototype.
4. Layout guidelines for `index.html`:
   - **Global shell**:
     - Top navigation bar with:
       - Feature name
       - Current screen name
       - Simple “Story selector” dropdown (optional) listing US IDs and titles
     - Main content area where screens are rendered.
   - **Screen rendering**:
     - For each screen:
       - Create a `<section>` with a unique `id` (e.g., `screen-S1`) and Tailwind classes (e.g., `hidden`, `flex`, `flex-col`, `gap-4`).
       - Only one screen section is visible at a time; others are hidden by a CSS class (e.g., `hidden`).
     - Inside each screen:
       - Header: screen name and related stories.
       - Key regions (mapped from `Low-Fidelity Prototypes` section if present):
         - Use simple Tailwind utilities (`border`, `p-4`, `rounded`, `bg-slate-50`, etc.) to visually separate regions.
       - Placeholder components for important interactive elements:
         - Buttons, inputs, lists, etc. with descriptive labels taken from interaction design.
5. Minimal scripting:
   - Add a small inline `<script>` that:
     - Maintains current screen state (e.g., `let currentScreen = 'S1';`).
     - Implements `showScreen(screenId)`:
       - Hides all screen sections and shows the requested one.
     - Hooks basic click events:
       - Any element marked in the interaction design as “navigates to Screen Sy” should call `showScreen('Sy')`.
   - Use **vanilla JS**, no frameworks.

### 5. Flow stepping aids (optional but recommended)

1. If the P1 main success flow is clearly identified:
   - Add a “Play P1 Flow” control:
     - A button that steps through the P1 screens in sequence.
     - Optionally highlight the active step with a small banner or badge.
2. For each user story:
   - Optionally render a simple list of steps (text‑only) in a sidebar or modal to guide reviewers:
     - This is derived from the “Flows by User Story” section.
3. All aids must remain **non‑authoritative**:
   - They MUST NOT contradict `interaction-design.md`; if they cannot be kept in sync, prefer to omit rather than invent.

### 6. Reporting & next actions

At the end of this command’s execution, output a concise summary including:

- Path to `PROTOTYPE_DIR` and `index.html`.
- Number of screens generated and which user stories they cover.
- Whether P1 main success flow is fully navigable via the prototype.
- Any critical limitations (e.g., missing flows, screens without any interactive elements).

Next actions guidance:

- If prototype generation failed due to validation issues:
  - Recommend updating `interaction-design.md` and/or `spec.md`, then re‑running `/speckit.prototype`.
- If prototype exists but reveals UX or requirement problems:
  - Recommend:
    - Updating `spec.md` (via manual edits or `/speckit.clarify`)
    - Re‑running `/speckit.interaction` to realign the design
    - Re‑generating the prototype afterwards.
- When the prototype is acceptable:
  - Suggest proceeding to `/speckit.plan`, which may treat the prototype as additional context
    for understanding flows, but not as a spec of record.

## Operating Principles

- **Spec & Interaction First**:
  - `spec.md` and `interaction-design.md` remain the sources of truth.
  - The prototype is a **visualization**, not an independent requirements document.
- **Low‑Fidelity, High‑Clarity**:
  - Focus on layout, hierarchy, and navigation, not on visual polish or brand.
- **Safe Defaults**:
  - Use Tailwind utility classes via CDN only; do not introduce build tooling or complex setup.
- **Reviewability**:
  - The HTML should open directly in a browser with no additional commands, enabling quick review
    by non‑technical stakeholders.


