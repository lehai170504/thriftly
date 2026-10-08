# Phase 08 — Architecture and refactoring

## Objective
Reduce duplication and oversized services while preserving tested behavior and useful module boundaries.

## Prerequisite
Phases 03–07 are `APPROVED` so financial/security behavior has regression coverage.

## Implement
- Map dependencies, cycles, duplicated policy, large classes/methods, hidden mapper I/O, and misplaced transactions.
- Choose one bounded high-value slice; add characterization tests first.
- Refactor toward thin controllers, explicit application use cases, pure domain policies, repositories/adapters, deterministic mappers, and after-commit events.
- Replace cross-feature entity mutation with explicit use-case APIs/events. Add ArchUnit/module tests for meaningful direction rules.
- Reuse abstractions only when semantics match; keep contracts, security, transactions, and event timing stable unless explicitly approved.

## Exclude
No big-bang rewrite, microservice split, incidental dependency upgrades, caching, new features, or generic base layers that erase domain meaning.

## Gate
Focused and full regression suites pass, API/OpenAPI differences are none or explicitly approved, and complexity/duplication in the chosen slice measurably improves. Report before/after structure, metrics, behavior, remaining debt, and rollback.
