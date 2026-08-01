# Independent R1-A / Stage 1 adapter-policy review R4 — raw report

# GO

No P1 and no P2 in the uncommitted three-file diff. **This verdict authorizes
nothing operational — no push, merge, workflow dispatch, rehearsal, or
production action.**

## Evidence reproduced independently

- All 15 tests in `tests/test_mission_architecture_guard.py` passed. The full
  implementer count reconciled as 37 across guard and release suites.
- Guard CLI on the R1-A root passed with policy SHA-256
  `b2c7995914744674ed96bb42d0e8fbfd2931e14035af6f77b1077ebd05c50d92`.
- The new guard and policy returned an empty error list against exact Stage 1
  backend head `2029867495578310dda92c170a2e07c71203eefa`; that fixture stayed
  clean and unchanged.
- No stale policy-SHA pin exists. Both CI entry points invoke the guard
  directly, and a policy `ValueError` maps to fail-closed exit 2.

## Requirements reproduced under mutation

- Adapter imports match exactly: a prefix cannot grant `app.config` or one of
  its submodules accidentally.
- `app.rewards` remains forbidden even if added to an adapter grant.
- Mission modules sorting before and after the adapters cannot inherit
  `app.config`; the global allowed set is never mutated.
- Twelve path-normalization mutants were rejected, including nested,
  traversal, separator, case and whitespace variants.
- Missing/null/wrong-container values, malformed import lists and duplicate
  entries were rejected.
- The bootstrap closes when Stage 1 appears: zero mission files is allowed;
  once any mission file exists, a deleted or missing declared adapter raises.
- Stage 1's two adapters read only the documented gate state, and no other
  mission module imports config.

## P3 (non-blocking)

1. The pre-existing contour check catches `app/mission/` but not every
   `mission_*` package-directory refactor. Stage 1 is currently flat and this
   diff did not introduce the escape; schedule separately.
2. Duplicate JSON object keys remain last-wins, as in pre-existing policy
   objects; policy SHA changes expose the edit. A duplicate-rejecting loader is
   a separate hardening option.
3. Naming a globally forbidden module in an adapter grant is accepted but
   grants nothing because forbidden precedence wins.
4. Additional tests could cover malformed shapes and CLI exit mapping more
   directly; independent mutation reproduced them successfully.
5. Dynamic `importlib.import_module` calls remain outside the static AST import
   contour; this is pre-existing.

The reviewer proposed no edits and identified the package-contour escape as
the only P3 worth scheduling separately.
