# SpecKit / Specify: Create or Update Feature Specification

Create or update the feature specification from a natural language feature description.

## User Input
Consider user arguments `$ARGUMENTS` before proceeding (if not empty).

## Pre-Execution Checks
**Check for extension hooks (before specification)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_specify` key.
- Filter out disabled hooks (`enabled: false`).
- Dispatch mandatory and optional hooks accordingly.

## Outline
1. **Generate a concise short name** (2-4 words) for the feature (action-noun format preferred, preserving acronyms).
2. **Branch creation** (optional, via hook): Note `BRANCH_NAME` and `FEATURE_NUM` if created by hook.
3. **Create the spec feature directory**:
   - Specs live under `specs/` unless `SPECIFY_FEATURE_DIRECTORY` is explicitly set.
   - Directory naming: `<prefix>-<short-name>` where prefix is sequential (`001`, `002`) or timestamp based on `.specify/init-options.json`.
   - Copy `.specify/templates/spec-template.md` (or resolved template) to `SPECIFY_FEATURE_DIRECTORY/spec.md`.
   - Save path to `.specify/feature.json`:
     ```json
     {
       "feature_directory": "specs/<directory-name>"
     }
     ```
4. Load `.specify/memory/constitution.md` if present for governance constraints.
5. Parse feature requirements, actors, actions, data, and constraints.
   - Limit `[NEEDS CLARIFICATION]` markers to a maximum of 3.
6. Fill User Scenarios, Functional Requirements, Success Criteria, and Key Entities.
7. Write specification to `SPEC_FILE` (`spec.md`).
8. **Specification Quality Validation**:
   - Generate checklist at `SPECIFY_FEATURE_DIRECTORY/checklists/requirements.md`.
   - Validate spec against content quality, requirement completeness, and feature readiness.
   - Handle clarifications with formatted option tables if markers remain.

## Mandatory Post-Execution Hooks
Check `.specify/extensions.yml` for `hooks.after_specify` and execute mandatory hooks.

## Completion Report
Report completion with `SPECIFY_FEATURE_DIRECTORY`, `SPEC_FILE`, checklist results summary, and readiness for `/speckit.clarify` or `/speckit.plan`.
