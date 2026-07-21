# SpecKit / Implement: Execute Implementation Plan

Execute the implementation plan by processing and executing all tasks defined in `tasks.md`.

## Pre-Execution Checks
Check `.specify/extensions.yml` for `hooks.before_implement`.

## Execution Steps
1. Run `python3 .specify/scripts/python/check_prerequisites.py --json --require-tasks --include-tasks`.
2. Check Checklists Status:
   - Scan `FEATURE_DIR/checklists/*.md`.
   - If incomplete items exist, display status table and ask user for confirmation to proceed.
3. Load implementation context (`tasks.md`, `plan.md`, `data-model.md`, `contracts/`, `research.md`, `constitution.md`).
4. Project Setup Verification & Ignore File Creation:
   - Detect git, Docker, ESLint, Prettier, etc.
   - Verify/create `.gitignore`, `.dockerignore`, `.eslintignore`, `.prettierignore`, `.npmignore` based on project stack.
5. Parse task phases, dependencies, and file targets from `tasks.md`.
6. Phase-by-Phase Execution:
   - Execute tasks in order.
   - Parallel tasks `[P]` can run concurrently.
   - Mark completed tasks with `[X]` in `tasks.md`.
7. Completion Validation & Progress Reporting.

## Mandatory Post-Execution Hooks
Check `.specify/extensions.yml` for `hooks.after_implement`.

## Completion Report
Report status of completed tasks, test coverage, and readiness for `/speckit.converge` or testing.
