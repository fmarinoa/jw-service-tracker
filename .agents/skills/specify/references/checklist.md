# SpecKit / Checklist: Requirements Quality Validation ("Unit Tests for English")

Generate a custom requirements quality checklist (`[domain].md`) for the current feature based on user requirements.

## Core Concept
Checklists test **REQUIREMENTS QUALITY**, NOT implementation behavior:
- ❌ NOT "Verify button works"
- ✅ "Are visual hierarchy requirements defined with measurable criteria?" [Clarity]

## Pre-Execution Checks
Check `.specify/extensions.yml` for `hooks.before_checklist`.

## Execution Steps
1. Run `python3 .specify/scripts/python/check_prerequisites.py --json` for `FEATURE_DIR`.
2. Load `.specify/memory/constitution.md` if present.
3. Clarify intent dynamically (up to 3-5 targeted contextual questions).
4. Combine `$ARGUMENTS` + answers to establish checklist theme (e.g. `ux.md`, `api.md`, `security.md`).
5. Load `spec.md`, `plan.md`, `tasks.md` context.
6. Create or append to `FEATURE_DIR/checklists/[domain].md`.
   - Start IDs at `CHK001` (or continue from highest existing ID).
   - Group by requirement quality dimensions: Completeness, Clarity, Consistency, Acceptance Criteria Quality, Scenario Coverage, Edge Cases, Non-Functional Requirements, Dependencies & Assumptions.
7. Format with standard checklist markdown.

## Post-Execution Checks
Check `.specify/extensions.yml` for `hooks.after_checklist`.

## Completion Report
Report generated/appended checklist file path, total items, and quality focus areas.
