---
name: specify
description: Comprehensive Specification-Driven Development (SpecKit / SDD) workflow skill. Provides instructions and commands for feature specification (specify), clarification (clarify), technical planning (plan), task generation (tasks), requirements quality checklist (checklist), artifact consistency analysis (analyze), project constitution governance (constitution), codebase convergence (converge), task implementation (implement), and GitHub issue synchronization (taskstoissues).
metadata:
  author: speckit
  version: "1.0.0"
---

# Specification-Driven Development (SpecKit / SDD) Skill

This skill provides a complete set of workflows and commands for managing feature lifecycles using Specification-Driven Development (SDD). It consolidates all SpecKit agents into a single unified skill.

---

## SDD Lifecycle Overview

```
 1. Constitution  ➔ Establish non-negotiable project principles (.specify/memory/constitution.md)
 2. Specify       ➔ Draft feature specification (specs/NNN-feature/spec.md)
 3. Clarify       ➔ Identify and resolve specification ambiguities via interactive Q&A
 4. Plan          ➔ Produce technical architecture & design artifacts (plan.md, data-model.md, contracts/)
 5. Tasks         ➔ Generate actionable, dependency-ordered tasks (tasks.md)
 6. Checklist     ➔ Validate requirements quality ("Unit Tests for English" in checklists/[domain].md)
 7. Analyze       ➔ Perform non-destructive read-only cross-artifact consistency analysis
 8. Implement     ➔ Execute implementation tasks in phases (marking completed tasks [X])
 9. Converge      ➔ Assess code vs artifacts & append remaining work to tasks.md
10. TasksToIssues ➔ Sync tasks.md tasks into GitHub issues
```

---

## Command Reference & Workflows

### 1. `specify` — Feature Specification Creation
- **Goal**: Create or update the feature specification from natural language prompt.
- **Key Output**: `specs/<prefix>-<short-name>/spec.md` and initial quality checklist.
- **Reference**: See [references/specify.md](file://.agents/skills/specify/references/specify.md) for full execution steps.

### 2. `clarify` — Ambiguity Reduction & Interactive Questioning
- **Goal**: Detect and reduce ambiguity or missing decision points in `spec.md` before planning.
- **Key Output**: Updated `spec.md` with integrated `## Clarifications` section.
- **Reference**: See [references/clarify.md](file://.agents/skills/specify/references/clarify.md) for full execution steps.

### 3. `plan` — Technical Architecture & Design
- **Goal**: Produce technical design artifacts based on `spec.md` and constitution constraints.
- **Key Outputs**: `plan.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md`.
- **Reference**: See [references/plan.md](file://.agents/skills/specify/references/plan.md) for full execution steps.

### 4. `tasks` — Actionable Task Breakdown
- **Goal**: Generate dependency-ordered, checklist-formatted `tasks.md` grouped by User Story.
- **Key Output**: `tasks.md` with explicit Task IDs (`T001`), parallel markers (`[P]`), and story labels (`[US1]`).
- **Reference**: See [references/tasks.md](file://.agents/skills/specify/references/tasks.md) for full execution steps.

### 5. `checklist` — Requirements Quality Checklist ("Unit Tests for English")
- **Goal**: Validate requirements quality (completeness, clarity, consistency, measurability) in domain-specific checklists.
- **Key Output**: `specs/<feature>/checklists/[domain].md` (e.g., `ux.md`, `api.md`, `security.md`).
- **Reference**: See [references/checklist.md](file://.agents/skills/specify/references/checklist.md) for full execution steps.

### 6. `analyze` — Read-Only Consistency & Quality Analysis
- **Goal**: Non-destructive pass across `spec.md`, `plan.md`, and `tasks.md` to spot gaps, contradictions, or constitution violations.
- **Key Output**: In-session Markdown analysis report with severity rankings.
- **Reference**: See [references/analyze.md](file://.agents/skills/specify/references/analyze.md) for full execution steps.

### 7. `constitution` — Project Principles & Governance Management
- **Goal**: Create/update `.specify/memory/constitution.md` and ensure templates stay aligned.
- **Key Output**: Updated `constitution.md` with semver bump and Sync Impact Report.
- **Reference**: See [references/constitution.md](file://.agents/skills/specify/references/constitution.md) for full execution steps.

### 8. `converge` — Codebase Assessment & Gap Closure
- **Goal**: Compare present codebase against `spec.md`, `plan.md`, and `tasks.md`; append unmet work to `tasks.md`.
- **Key Output**: Append-only `## Phase N: Convergence` section added to `tasks.md` (or clean convergence report).
- **Reference**: See [references/converge.md](file://.agents/skills/specify/references/converge.md) for full execution steps.

### 9. `implement` — Code Execution & Task Completion
- **Goal**: Execute tasks in `tasks.md` phase-by-phase, verifying checklists, setting up ignore files, and marking `[X]`.
- **Key Output**: Completed feature implementation with updated `tasks.md`.
- **Reference**: See [references/implement.md](file://.agents/skills/specify/references/implement.md) for full execution steps.

### 10. `taskstoissues` — GitHub Issues Sync
- **Goal**: Convert tasks in `tasks.md` into GitHub issues for tracking.
- **Key Output**: GitHub issues created via GitHub MCP server.
- **Reference**: See [references/taskstoissues.md](file://.agents/skills/specify/references/taskstoissues.md) for full execution steps.

---

## Extension Hooks (`.specify/extensions.yml`)

Every workflow in this skill checks for `.specify/extensions.yml` at the project root for pre-execution (`hooks.before_<command>`) and post-execution (`hooks.after_<command>`) extension hooks. When present, executable hooks are dispatched according to their `optional` status.
