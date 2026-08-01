# R1-A live Render capture adapter — independent review R1 raw

**NO-GO** — no P1; two P2s.

## [P2] `"yes" → True` is never executed by any test — surviving mutant produces a false PASS

- **Code:** `scripts/platform-release-provider-capture.py:61-62`
- **Test anchor:** `tests/test_platform_release_provider_capture.py:82`

`LiveShapeRender` derives the enum from `enabled = service["autoDeploy"]`, and
every service in the base fixture is auto-deploy-off. No LiveShape test sets
`FakeRender.unsafe_service`, and `auto_deploy_overrides` is only set to invalid
values. The `"yes"` arm is dead in the suite.

Failure: mutate `auto_deploy = True` to `False`. The suite remains green. A
live service with `autoDeploy: "yes"` and `autoDeployTrigger: "commit"` is then
captured as disabled; agreement passes and the capture can emit `PASS` for a
service that deploys on push.

Required mutant: a live-shape test with an enabled service must prove the
canonical receipt value is the boolean `True` and the receipt is never
merge-safe.

## [P2] `"checksPass"` appears in no test — surviving mutant lets checksPass PASS

- **Code:** `scripts/platform-release-provider-capture.py:70`

The test diff covers `off`, `commit` and an invalid trigger, but never
`checksPass`. Mutating its normalized state from `True` to `False` makes
`autoDeploy: "no"` plus `autoDeployTrigger: "checksPass"` agree and become
PASS-eligible.

Required mutants: disabled plus `checksPass` must fail as inconsistent, and
enabled plus `checksPass` must produce a merge-unsafe receipt, never `PASS`.

## Verified clean

- the prior boolean/top-level shape remains accepted;
- enum comparison is exact, with no case folding or trimming;
- trigger agreement uses boolean singleton identity;
- top/nested Dockerfile equality is enforced;
- missing, non-string and out-of-allowlist Dockerfile paths fail closed;
- branch, identity, receipt-v1 and no-clobber paths are untouched.

## P3 observations

1. Reject unhashable trigger values before dictionary lookup.
2. Distinguish an absent trigger from an explicit JSON `null`.
3. Reject non-dict `serviceDetails` and `envSpecificDetails` as ambiguous.
4. Assert receipt booleans with identity, not equality.
5. Confirm the fake creates a fresh payload per request.
6. Add a successful equal top+nested Dockerfile case.

