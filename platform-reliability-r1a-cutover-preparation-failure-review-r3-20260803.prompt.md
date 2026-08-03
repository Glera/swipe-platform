Focused independent R3. Previous review found one P2: although the Render key
reveal was a no-observation zone, the write step did not literally forbid the
secret from entering a tool parameter, shell argument, returned object or
trace.

The runbook now adds this exact normative paragraph immediately after the
already accepted no-snapshot/direct-to-0600 rule:

> The read, validation and file write must occur inside one non-emitting local
> browser-runtime call. The call source may contain the already-created handoff
> path but never the key value. Write through the runtime's filesystem API; do
> not pass the value to a shell, subprocess, command argument, tool parameter,
> clipboard, returned object, stdout or stderr. Do not call any output helper,
> and make the call return no value. The next tool call is permitted only after
> the reveal dialog is closed and the `0600` mode/non-zero-size checks have
> passed without reading the file contents.

The surrounding accepted rules still require immediate revocation, empty-list
verification, handoff-file removal, bounded FAIL receipt and full stop if any
browser/tool result contains the key; no replacement key is allowed under the
same GO. The prior window remains consumed and the refreshed request remains
`authority: not-granted`. All merge/deploy/dispatch/Render-mutation/migration/
publication/Stage 1 prohibitions remain unchanged.

Does this close the prior P2 without creating a new P1/P2? Return exactly `GO`
if yes. Otherwise return only concise `[P1]`/`[P2]` findings.
