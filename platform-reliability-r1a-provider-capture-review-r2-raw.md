# R1-A live Render capture adapter — independent review R2 raw

**GO** — no P1/P2. Both R1 P2 findings are closed and no surviving
false-PASS path remains.

## Disposition verification

**P2 `yes → True` — closed.**
`test_capture_live_yes_enum_is_never_merge_safe` pins the enabled live enum to
the boolean `True`, `status == "FAIL"` and `mergeSafe is False`. The live PASS
test pins all disabled values with `is False`.

**P2 `checksPass` — closed in both directions.** A disabled service plus
`checksPass` must raise `service_autodeploy_inconsistent`; an enabled service
plus `checksPass` is captured as unsafe. Structurally, `checksPass` either
normalizes to `True` and makes the receipt unsafe, or disagrees and fails.

**P3 unhashable/null triggers — closed.** The string type guard precedes map
lookup and tests include list, dict and null values.

**P3 malformed nested shapes — closed.** Non-dict `serviceDetails` and
`envSpecificDetails` fail with a typed capture error.

**P3 boolean identity — closed.** Tests use `is True`/`is False`; integer zero
is rejected as an unreadable enum.

**P3 equal top+nested path — closed.** A positive equality case now exists.

Contract items remain intact: canonical booleans, exact enums, trigger
allowlist and consistency, exact Dockerfile allowlist/equality, exact service
identity/type/branch, receipt schema v1 and no-clobber publication.

## P3 observations (non-blocking)

1. Add absent-`envSpecificDetails` tests for top-level PASS and no-path failure.
2. Pin a non-string top-level Dockerfile path error code.
3. Explicit top-level null now reports invalid rather than missing; both fail
   closed.
4. `_fail` must remain annotated `NoReturn`; it is.
5. Add case variants such as `"No"` to the exact-enum mutant set.
6. Assert the exact recorded path in the equal top+nested success test.
7. A hypothetical sibling `serviceDetails.dockerfilePath` is ignored; it is
   outside Render's documented/live shape and creates no false PASS there.

