# Financial Director v1-A — release-readiness packet

Date: 2026-07-27  
Scope: cost observability only; default-off  
Implementation: `Glera/swipe-agents` PR #8  
Exact implementation head: `06da4b6f7fa0015d2821b12c636feb0b581c16b1`  
Reviewed base: `69ed430d1dca3291e893275854d3b90e11aadda5`

## Verdict

Finance v1-A is code-complete and independently reviewed for release
readiness. It is not merged, installed, scheduled, connected to live billing
credentials or enabled for Telegram delivery.

The executable v1-A contour is deliberately narrower than the eventual
Financial Director role:

- GitHub personal metered usage is accepted only through a dedicated,
  non-network fixture adapter;
- Render billing is an attended redacted snapshot;
- Render bandwidth has a pure redacted parser but no credential-bearing
  transport;
- CDN is a projection of the Render bandwidth category and is excluded from
  provider-total addition.

## Approved policy identity

- Render attention: `$20.00` MTD or `$25.00` forecast;
- Render incident: `$30.00` forecast;
- GitHub Actions approved budget: `$30.00`;
- GitHub Actions hard-stop attestation: required.

Versioned artifacts:

- policy digest:
  `46f5e6b6d3025ceb8109d186e18fc9412e62e46fe73625b56b734f586ff2106f`;
- source-registry digest:
  `c91c4fcacb54702f3245739acc81f16864ddd88e027d08953c7be0a96353d367`.

Both parsed artifacts and the published loaded configuration are recursively
frozen after digest calculation.

## Implemented boundary

The implementation adds:

1. versioned policy, source-registry and snapshot JSON Schemas;
2. exact decimal normalization for money and utilization;
3. Render/GitHub/CDN detectors for thresholds, forecast growth, daily burn
   acceleration, new meters, staleness, unknown sources and currency drift;
4. append-only SQLite facts under migration `agents-0003`, with a singleton
   lease fence, immutable run manifests, source-consistent composite foreign
   keys and terminal receipts;
5. deterministic terminal-receipt reconstruction before exact replay;
6. a fixture-only shadow CLI that rejects delivery and live-source modes;
7. additive `/bind finance`, whose confirmation redacts the chat id;
8. an operator runbook and adversarial regression suite.

The shadow runner admits only nominally branded, frozen reviewed collector
implementations. Constructor spoofing, method monkey-patching, caller-authored
derived CDN facts, injected GitHub transport and overprivileged Render
transport are rejected before collection.

## Independent review

The blind review loop produced findings `F001` through `F020`; every finding
has disposition `fixed` in
`swipe-agents/docs/finance-v1a-auto-review-dispositions.json`.

The final closure review returned **GO** with no residual finding. Its last
pass independently checked:

- source/provider/budget binding on fresh, failure, crash-resume and completed
  replay paths;
- composite source integrity for the CDN projection;
- re-derivation of snapshot ids, deterministic signal ids, status,
  `wouldDeliver` and render digest before accepting a stored receipt;
- adversarial imported/corrupted-store regressions.

## Verification

Local exact-head verification:

- `npm run typecheck`: exit 0;
- `npm test`: 69 test files, 413 tests, all passed;
- `npm run finance:check`: exit 0 and both reviewed digests matched;
- auto-review disposition validator: 20 findings, exactly one disposition
  each, exit 0;
- `git diff --check`: exit 0;
- secret-aware review collection: `excludedSecrets: []`.

GitHub Actions authority:

- PR: <https://github.com/Glera/swipe-agents/pull/8>;
- exact-head run:
  <https://github.com/Glera/swipe-agents/actions/runs/30299178069>;
- `verify`: success (`npm ci`, typecheck and full test suite).

## Explicitly absent

No part of this packet authorizes or performs:

- merge or immutable release installation;
- changes to the running A1 quiet-week release;
- issuance, reading or storage of live billing credentials;
- a Render account API key;
- schedule, unattended runtime or Telegram delivery;
- budget, plan, payment-method, service-size, deployment or hard-stop
  mutation.

The existing operator-only finance Telegram destination has not been bound
because the installed quiet-week release does not contain `/bind finance`.

## Remaining human gates

1. Accept or reject PR #8 at its exact reviewed head.
2. Separately authorize an immutable release build and installation.
3. Run `/bind finance` using that new release, then execute the finance
   binding preflight.
4. In a later reviewed code round, admit a live GitHub `Plan: read`
   composition; only then issue the fine-grained read-only credential.
5. Perform attended byte/cent comparisons against GitHub and Render billing
   dashboards.
6. Run at least 48 hours of shadow collection with boundary injections.
7. Separately authorize a later sender/schedule release and delivery
   enablement.

Rollback before delivery enablement is stopping the finance invocation or
returning the immutable release symlink. No provider setting is changed by
v1-A.
