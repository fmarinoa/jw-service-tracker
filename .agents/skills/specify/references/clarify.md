# SpecKit / Clarify: Reduce Ambiguity in Feature Specification

Identify underspecified areas in the current feature spec by asking up to 5 highly targeted clarification questions and encoding answers back into the spec.

## Pre-Execution Checks
Check `.specify/extensions.yml` for `hooks.before_clarify`.

## Outline
1. Run `python3 .specify/scripts/python/check_prerequisites.py --json --paths-only` to parse `FEATURE_DIR` and `FEATURE_SPEC`.
2. Load `.specify/memory/constitution.md` if available.
3. Perform ambiguity & coverage scan across:
   - Functional Scope & Behavior
   - Domain & Data Model
   - Interaction & UX Flow
   - Non-Functional Quality Attributes
   - Integration & Dependencies
   - Edge Cases & Failure Handling
   - Constraints & Tradeoffs
   - Terminology & Consistency
4. Generate a prioritized queue of up to 5 candidate clarification questions.
5. Interactive Sequential Questioning Loop:
   - Ask EXACTLY ONE question at a time.
   - Highlight recommended/suggested option with rationale.
   - Format multiple-choice options as Markdown table.
   - Accept option letter, "yes", "recommended", or custom short answer (<=5 words).
   - Stop when all critical ambiguities resolved, user signals completion, or 5 questions asked.
6. Incremental Integration:
   - Add/update `## Clarifications` section with `### Session YYYY-MM-DD` subheadings.
   - Immediately update relevant sections of `spec.md` (Functional Requirements, Data Model, Success Criteria, etc.).
   - Save `spec.md` atomically after each accepted answer.
7. Re-validate `FEATURE_DIR/checklists/requirements.md` if present and update checkbox states.

## Mandatory Post-Execution Hooks
Check `.specify/extensions.yml` for `hooks.after_clarify`.

## Completion Report
Report questions asked/answered, updated spec path, sections touched, checklist status diff, and coverage summary table.
