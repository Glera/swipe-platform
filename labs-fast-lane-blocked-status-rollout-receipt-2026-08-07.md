# Labs Fast Lane blocked-status rollout receipt — 2026-08-07

## Scope

Один rolling rollout reviewed blocked-status пакета в порядке Backend 0075 →
Feed → Generator-writer. Retry, rollback и дополнительные production mutation
не выполнялись.

## Backend

- source: `swipe-backend@bbc8026bfc775470b257ffecf8e56adb977506bb`;
- immutable image workflow: run `31187976429`, attempt 1, PASS;
- manifest SHA-256:
  `f56c6705b7e2805260e6cb0b40c0079be550ba8bfe632c01265e1d87b7a32f18`;
- image digest:
  `sha256:3d2889a6646de067b5c6951c3410f0c07b6ea38c637396163bee8c3c85f99ce5`;
- manifest pins predecessor `0074_feed_playable_release_scope`, target
  `0075_playable_rework_status`, reviewed Feed `d9cbafc`, Playables `affe8acd`
  and current production LKG;
- production workflow: run `31188304631`, attempt 1, PASS;
- Render deploy: `dep-d9quqaqd0e5s73b5u01g`;
- verification job: `job-d9quqlflk1mc73fnc5mg`;
- coordinator receipt SHA-256:
  `1c6ee085d9295804e1814309fe0e64c4b086d53cab3813253b4314661f4659cd`.

The coordinator receipt proves one CAS-bound deploy, the 0074→0075 preDeploy
under the platform release lock, live health and the applied release receipt.

## Feed

- source: `feed-prototype@d9cbafc870ede74503a16f800075b3cf701b3363`;
- feed-only deploy; no playable export and no roster change;
- published archive: `swipe-platform@54af24873dca53ccd5dbe0a00d1d80b818acbf8d`;
- exact live `index.html` SHA-256:
  `8e0ec0856137e2c2a5163594f5aaaa20ced40f8d9ccaadb91da1c2efd2f88d07`;
- bundle proof: exact-user `42692410`, Island gates false, blocked projection
  and `! Нужна помощь` present.

## Generator and first projection

- live checkout: `swipe-generator@e3f960120510c56c81b259725229ebf3d051561d`;
- LaunchAgent reinstalled with preserved data-root/env; health PASS;
- request `01aaf0e3-f744-4697-b431-f0218de6c00b` projected once to
  `execution.state=blocked` at `2026-08-07T14:39:46.467Z`;
- public code: `playable_rework_agent_check_failed`;
- public summary: `Проверки механики не прошли; изменения не опубликованы.`;
- original instruction remains exact: `Хочу уменьшим скорость вращения ленты
  в 3 раза`;
- no release exists for this request. Telegram delivery and the mobile badge
  remain pending operator observation before recoverable reset/retry.
