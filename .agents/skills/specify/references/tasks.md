# SpecKit / Tasks: Generate Actionable Task Breakdown

Generate an actionable, dependency-ordered `tasks.md` for the feature based on available design artifacts.

## Pre-Execution Checks
Check `.specify/extensions.yml` for `hooks.before_tasks`.

## Outline
1. Run `python3 .specify/scripts/python/check_prerequisites.py --json` to parse `FEATURE_DIR`, `TASKS_TEMPLATE`, and `AVAILABLE_DOCS`.
2. Load design documents:
   - `plan.md` (tech stack, libraries, structure)
   - `spec.md` (user stories with priorities P1, P2...)
   - Optional: `data-model.md`, `contracts/`, `research.md`, `quickstart.md`
   - `.specify/memory/constitution.md`
3. Execute task generation workflow:
   - Organize tasks by User Story (Phases 3+).
   - Define Phase 1 (Setup) and Phase 2 (Foundational blocking tasks).
   - Final Phase: Polish & Cross-Cutting Concerns.
   - Enforce strict Checklist Format:
     ```text
     - [ ] [TaskID] [P?] [Story?] Description with file path
     ```
     Examples:
     `- [ ] T001 Create project structure per implementation plan`
     `- [ ] T005 [P] Implement authentication middleware in src/middleware/auth.py`
     `- [ ] T012 [P] [US1] Create User model in src/models/user.py`
4. Generate dependency graph and parallel execution examples per story.

## Mandatory Post-Execution Hooks
Check `.specify/extensions.yml` for `hooks.after_tasks`.

## Completion Report
Report total task count, breakdown per story, parallel opportunities, test criteria, and suggested MVP scope.
