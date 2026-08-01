# Platform Reliability R1-A — disposable rehearsal cost preflight

Observed: `2026-08-01`  
Scope: disposable rehearsal only; production cutover excluded.

## GitHub

Authenticated GitHub billing UI for the current August 2026 cycle showed:

- Actions Linux: `568 min` at `$0.006/min`;
- gross usage: `$3.41`;
- billed usage: `$0.00`.

GitHub Pro includes 3,000 Actions minutes per month, leaving approximately
2,432 included Linux minutes at this boundary. The rehearsal's conservative
workflow timeout envelope is 210 minutes: two image runs plus four coordinator
runs, each capped at 35 minutes. It therefore fits inside the current included
allowance with more than 2,200 minutes of headroom. Expected Actions charge:
`$0.00`.

GitHub currently documents Container registry image storage and bandwidth as
free. The runbook nevertheless retains its post-baseline size/transfer stop
because that is useful operational evidence and protects against a policy
change. Two immutable image versions and their 90-day Actions sidecars are the
only retained rehearsal artifacts.

Official references:

- https://docs.github.com/en/billing/reference/product-usage-included
- https://docs.github.com/en/billing/concepts/product-billing/github-actions
- https://docs.github.com/en/billing/concepts/product-billing/github-packages

## Render

Disposable resources:

- free PostgreSQL 16: `$0`;
- one Starter web service: `$7/month`, prorated for the attended window;
- two Starter cron services: billed by active time but each has a `$1` monthly
  minimum;
- short Starter one-off jobs: prorated by the second.

For a same-day rehearsal lasting no more than four hours, the web service is
about `$0.04`; short one-off compute should remain below `$0.10`; the two cron
minimums dominate at `$2.00`. Expected Render total: about `$2.05–$2.15`.

Operational spend ceiling: **`$3.00`**. Before the first paid creation, if the
Render confirmation UI estimates more than `$3.00`, or requires a paid
workspace/database plan, stop and obtain new operator authority. Delete all
disposable Render resources and credentials immediately after evidence capture.

Official references:

- https://render.com/docs/cronjobs
- https://render.com/docs/scaling
- https://render.com/articles/top-heroku-alternatives-agencies

This preflight is not spending authority. It exists so the operator's next GO
can name an explicit maximum amount and exact external mutations.
