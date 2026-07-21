# SpecKit / TasksToIssues: GitHub Issues Synchronization

Convert existing tasks into actionable, dependency-ordered GitHub issues for the feature based on available design artifacts.

## Pre-Execution Checks
Check `.specify/extensions.yml` for `hooks.before_taskstoissues`.

## Outline
1. Run `python3 .specify/scripts/python/check_prerequisites.py --json --require-tasks --include-tasks`.
2. Load `.specify/memory/constitution.md` if available.
3. Validate Git Remote:
   ```bash
   git config --get remote.origin.url
   ```
   *Only proceed if remote is a GitHub repository URL.*
4. Fetch existing GitHub issues for deduplication:
   - Match issue titles against task ID pattern `\bT\d{3}\b`.
   - Skip tasks that already have a GitHub issue.
5. Create GitHub Issues:
   - Strip leading `- [ ]` and `[P]`/`[US#]` markers.
   - Title format: `T001: <description>`.
   - Use GitHub MCP server (`issue_write` / `list_issues`).

## Post-Execution Checks
Check `.specify/extensions.yml` for `hooks.after_taskstoissues`.

## Completion Summary
Report total created issues, skipped duplicates, and links to created GitHub issues.
