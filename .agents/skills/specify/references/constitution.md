# SpecKit / Constitution: Manage Project Principles & Governance

Create or update the project constitution at `.specify/memory/constitution.md` from interactive or provided principle inputs, ensuring all dependent templates stay in sync.

## Pre-Execution Checks
Check `.specify/extensions.yml` for `hooks.before_constitution`.

## Outline
1. Load existing constitution at `.specify/memory/constitution.md` (or copy from `.specify/templates/constitution-template.md` if missing).
2. Collect/derive concrete values for placeholders (`[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`, etc.).
3. Update version (`CONSTITUTION_VERSION` via semver: MAJOR/MINOR/PATCH) and dates (`LAST_AMENDED_DATE`).
4. Replace placeholder tokens with declarative, testable principles.
5. Perform consistency propagation check across:
   - `.specify/templates/plan-template.md`
   - `.specify/templates/spec-template.md`
   - `.specify/templates/tasks-template.md`
   - Project documentation and agent guides
6. Prepend Sync Impact Report as an HTML comment.
7. Save updated constitution to `.specify/memory/constitution.md`.

## Mandatory Post-Execution Hooks
Check `.specify/extensions.yml` for `hooks.after_constitution`.

## Completion Summary
Output new version, bump rationale, files needing manual follow-up, and suggested commit message.
