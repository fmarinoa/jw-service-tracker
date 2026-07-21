# SpecKit / Analyze: Cross-Artifact Consistency Analysis

Perform a non-destructive cross-artifact consistency and quality analysis across `spec.md`, `plan.md`, and `tasks.md` after task generation.

## Operating Constraints
**STRICTLY READ-ONLY**: Do **not** modify any files. Output a structured analysis report.
**Constitution Authority**: `.specify/memory/constitution.md` principles are non-negotiable.

## Execution Steps
1. Run `python3 .specify/scripts/python/check_prerequisites.py --json --require-tasks --include-tasks` to verify `spec.md`, `plan.md`, and `tasks.md` exist.
2. Load artifacts using progressive disclosure.
3. Build semantic models:
   - Requirements inventory (FR-###, SC-###)
   - User story / action inventory
   - Task coverage mapping
   - Constitution rule set
4. Execute detection passes:
   - Duplication Detection
   - Ambiguity Detection (vague adjectives, TODOs)
   - Underspecification
   - Constitution Alignment
   - Coverage Gaps (unmapped requirements or tasks)
   - Inconsistency (terminology drift, stack conflicts)
5. Severity Assignment: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
6. Output Markdown report:
   - Specification Analysis Report Table
   - Coverage Summary Table
   - Constitution Alignment Issues
   - Unmapped Tasks
   - Metrics summary
7. Next Actions & Remediation Offer.

## Post-Execution Checks
Check `.specify/extensions.yml` for `hooks.after_analyze`.
