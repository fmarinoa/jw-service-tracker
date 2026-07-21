# SpecKit / Plan: Execute Implementation Planning

Execute the implementation planning workflow using the plan template to generate technical design artifacts.

## Pre-Execution Checks
Check `.specify/extensions.yml` for `hooks.before_plan`.

## Outline
1. Run `python3 .specify/scripts/python/check_prerequisites.py --json` to parse `FEATURE_SPEC`, `IMPL_PLAN`, `SPECS_DIR`, and `BRANCH`.
2. Load context: Read `FEATURE_SPEC`, `.specify/memory/constitution.md`, and copy `.specify/templates/plan-template.md` to `IMPL_PLAN` (`plan.md`).
3. Execute plan workflow:
   - Fill Technical Context & Architecture decisions.
   - Fill Constitution Check section and evaluate compliance gates.
   - Phase 0: Generate `research.md` (resolve technical unknowns).
   - Phase 1: Generate `data-model.md`, `contracts/`, and `quickstart.md`.
   - Re-evaluate Constitution Check post-design.

## Mandatory Post-Execution Hooks
Check `.specify/extensions.yml` for `hooks.after_plan`.

## Completion Report
Report generated plan artifacts (`plan.md`, `data-model.md`, `contracts/`, `research.md`, `quickstart.md`) and readiness for task generation (`/speckit.tasks`).
