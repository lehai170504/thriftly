# Thriftly Repository Rules

These rules apply to every Antigravity agent working in this repository.

## Read the scoped rules first

- For files under `backend/`, read `backend/AGENTS.md` before planning or editing.
- For files under `frontend/`, read `frontend/AGENTS.md` before planning or editing.
- For production hardening, security, database migrations, payments, wallet/escrow, Redis sessions, CSRF, concurrency, caching, observability, CI/CD, or launch readiness, explicitly use the `harden-thriftly-backend` skill and execute exactly one phase per task.

## Working agreement

- Inspect the current implementation and `git status` before editing. Treat existing changes as user-owned and preserve them.
- State the phase, scope, assumptions, files likely to change, risks, and verification plan before implementation.
- Keep each task small and reviewable. Do not silently broaden scope or combine hardening phases.
- Prefer root-cause fixes and repository conventions over local workarounds.
- Never commit, push, merge, deploy, rotate credentials, call real payment operations, or mutate a production database unless the user explicitly requests that exact action.
- Never expose or commit secrets. Use environment variables and documented placeholders.
- Do not weaken authentication, authorization, CSRF, CORS, cookie, validation, audit, idempotency, or transaction controls to make a test pass.
- Schema changes must be forward-only and reviewable. Never delete or rewrite user data without explicit approval and a rollback or recovery plan.
- Add or update tests for behavior changes. Run the smallest relevant checks first, then the phase gate.
- End every task with: files changed, behavior changed, commands run, results, remaining risks, rollback notes, and the next recommended action.

## Source of truth

- Roadmap: `docs/production/ROADMAP.md`
- Phase state and evidence: `docs/production/IMPLEMENTATION_STATUS.md`
- Launch gate: `docs/production/LAUNCH_CHECKLIST.md`
- Copy-paste Antigravity tasks: `docs/production/ANTIGRAVITY_PROMPTS.md`

An agent may mark a phase `READY_FOR_REVIEW` after all automated gates pass. Only the user or designated reviewer may mark it `APPROVED`.
