# SpecKit / Converge: Codebase & Specification Gap Assessment

Assess the current codebase against the feature's `spec.md`, `plan.md`, and `tasks.md`, then append any remaining unbuilt work as new tasks to `tasks.md` so `implement` can complete it.

## Operating Constraints
- **APPEND-ONLY, NEVER REWRITE**: Only append a `## Phase N: Convergence` section to `tasks.md`. Never modify `spec.md` or `plan.md`, never edit existing tasks, and never modify application code directly.
- If codebase fully satisfies intent, leave `tasks.md` byte-for-byte unchanged.

## Execution Steps
1. Run `python3 .specify/scripts/python/check_prerequisites.py --json --require-tasks --include-tasks`.
2. Load `spec.md`, `plan.md`, `tasks.md`, and `.specify/memory/constitution.md`.
3. Build Intent Inventory and Code-scope map.
4. Assess Codebase & Classify Findings into gap types:
   - `missing`: Required work absent.
   - `partial`: Work exists but incomplete.
   - `contradicts`: Code conflicts with spec/plan or constitution.
   - `unrequested`: Work in code not called for by artifacts.
5. Severity Grading: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
6. Output In-Session Findings Summary table.
7. Append Convergence Tasks:
   - If findings exist: Add header `## Phase N: Convergence` at end of `tasks.md` with new zero-padded IDs `T{M+1:03d}`.
   - If no findings: Report "✅ Converged — the implementation satisfies the spec, plan, and tasks."
8. Next Actions handoff to `/speckit.implement` or PR review.

## Post-Execution Checks
Check `.specify/extensions.yml` for `hooks.after_converge`.
