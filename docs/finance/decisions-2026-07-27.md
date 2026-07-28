# Financial director — decision receipt 2026-07-27

Статус: human decisions recorded; one provider mutation applied; no finance
runtime deployed.

## Approved policy inputs

| Scope | Decision | State |
|---|---|---|
| Render total | attention `$20 MTD` or `$25 forecast`; incident `$30 forecast` | approved; monitoring policy only |
| GitHub Actions | hard monthly budget `$30` | applied in GitHub billing UI |
| GitHub enforcement | stop usage at limit | enabled and preserved |
| GitHub alerts | provider threshold alerts | enabled and preserved |
| Telegram | separate operator-only `finance` destination | created; bots added; id not recorded |

At the moment the GitHub change was verified, the provider UI showed
`$13.63 spent / $30.00 budget` and `Stop usage: Yes`. This is an operational
receipt, not an invoice.

## Authority receipt

- The operator explicitly approved the GitHub budget change from `$20` to
  `$30`.
- No Render plan, capacity, service, budget or payment setting changed.
- No Telegram chat id, bot token, payment detail or account identifier was
  written to git.
- No finance schedule, delivery, collector or unattended runtime was
  enabled.

## Binding disposition

The current immutable A1 release accepts only:
`/bind digest`, `/bind attention`, `/bind incident`, and `/bind test`.
Therefore `/bind finance` must not be sent yet: it would be ignored.

The finance implementation must add an explicit
`AGENTS_TG_CHAT_FINANCE` contract, tests, preflight validation and a
reviewed immutable release. After that release is installed, the operator
sends `/bind finance` once from the new group and runs the future
finance-specific preflight; the chat id remains only in the protected env
file.

## Remaining gate

Review adapters first, then separately authorize minimal read-only billing
principals for Render and GitHub. Until then the role remains attended and
the 27.07 baseline is its only provider-authoritative snapshot.
