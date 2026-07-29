\set ON_ERROR_STOP on
\pset pager off
\pset format unaligned
\pset fieldsep '\t'
\pset tuples_only on

-- Reproducible read-only evidence collector for Platform Reliability R1-0.
-- Usage:
--   node scripts/platform-reliability-r1-db-capture.mjs \
--     --url-file "$R1_DB_URL_FILE" \
--     --output <snapshot.tsv> \
--     --not-before <ISO timestamp>
--
-- The transaction-level guard is deliberate: a future edit that accidentally
-- adds a mutating statement must fail at PostgreSQL, not rely on reviewer intent.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL statement_timeout = '30s';
SET LOCAL lock_timeout = '3s';
SET LOCAL TimeZone = 'UTC';

SELECT 'snapshot_meta',
       to_char(clock_timestamp(), 'YYYY-MM-DD HH24:MI:SS TZ'),
       current_database(),
       current_setting('transaction_read_only'),
       current_setting('TimeZone'),
       current_setting('server_version_num'),
       pg_database_size(current_database()),
       pg_size_pretty(pg_database_size(current_database()));

SELECT 'schema',
       (SELECT count(*) FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'),
       (SELECT string_agg(version_num, ',' ORDER BY version_num)
        FROM alembic_version);

SELECT 'relation_totals',
       count(*),
       count(*) FILTER (WHERE n_live_tup > 0),
       sum(pg_total_relation_size(relid)),
       pg_size_pretty(sum(pg_total_relation_size(relid))),
       sum(pg_relation_size(relid)),
       pg_size_pretty(sum(pg_relation_size(relid))),
       sum(pg_indexes_size(relid)),
       pg_size_pretty(sum(pg_indexes_size(relid)))
FROM pg_stat_user_tables
WHERE schemaname = 'public';

SELECT 'table_size',
       schemaname || '.' || relname,
       pg_total_relation_size(relid),
       pg_size_pretty(pg_total_relation_size(relid)),
       n_live_tup,
       n_dead_tup,
       CASE
         WHEN n_live_tup > 0 THEN pg_total_relation_size(relid) / n_live_tup
       END
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(relid) DESC, relname
LIMIT 50;

-- Exact row counts are safe at the current database size and make the next
-- 24–48 hour snapshot comparable even when pg_stat estimates lag.
WITH parts AS (
  SELECT format(
    'SELECT %L::text AS table_name, count(*)::bigint AS exact_rows FROM %I.%I',
    schemaname || '.' || relname,
    schemaname,
    relname
  ) AS sql_part
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
)
SELECT
  'SELECT ''exact_row_count'', table_name, exact_rows '
  || 'FROM (' || string_agg(sql_part, ' UNION ALL ') || ') q '
  || 'WHERE exact_rows > 0 ORDER BY exact_rows DESC, table_name;'
FROM parts
\gexec

-- Exact coverage/total sentinel. Unlike n_live_tup, this cannot drift merely
-- because ANALYZE has not run; the comparator uses it to reject truncated TSV.
WITH parts AS (
  SELECT format(
    'SELECT count(*)::bigint AS exact_rows FROM %I.%I',
    schemaname,
    relname
  ) AS sql_part
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
)
SELECT
  'SELECT ''exact_row_summary'', '
  || 'count(*) FILTER (WHERE exact_rows > 0), '
  || 'sum(exact_rows) '
  || 'FROM (' || string_agg(sql_part, ' UNION ALL ') || ') q;'
FROM parts
\gexec

-- Pick one insertion-like clock per table. Mutable updated_at is deliberately
-- last priority and is labelled in output so it is never mistaken for inserts.
WITH ranked AS (
  SELECT
    table_name,
    column_name,
    row_number() OVER (
      PARTITION BY table_name
      ORDER BY
        CASE column_name
          WHEN 'created_at' THEN 1
          WHEN 'received_at' THEN 2
          WHEN 'recorded_at' THEN 3
          WHEN 'registered_at' THEN 4
          WHEN 'occurred_at' THEN 5
          WHEN 'revealed_at' THEN 6
          WHEN 'planned_at' THEN 7
          WHEN 'evaluated_at' THEN 8
          WHEN 'ingested_at' THEN 9
          WHEN 'issued_at' THEN 10
          WHEN 'materialized_at' THEN 11
          WHEN 'activated_at' THEN 12
          WHEN 'assigned_at' THEN 13
          WHEN 'started_at' THEN 14
          WHEN 'first_served_at' THEN 15
          WHEN 'failed_at' THEN 16
          WHEN 'updated_at' THEN 90
          ELSE 50
        END,
        ordinal_position
    ) AS rn
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND data_type IN (
      'timestamp with time zone',
      'timestamp without time zone',
      'date'
    )
    AND column_name IN (
      'created_at', 'received_at', 'recorded_at', 'registered_at',
      'occurred_at', 'revealed_at', 'planned_at', 'evaluated_at',
      'ingested_at', 'issued_at', 'materialized_at', 'activated_at',
      'assigned_at', 'started_at', 'first_served_at', 'failed_at',
      'updated_at'
    )
), parts AS (
  SELECT format(
    'SELECT %L::text AS table_name, %L::text AS clock, '
    || 'count(*)::bigint AS total_rows, '
    || 'count(*) FILTER (WHERE %I >= now() - interval ''7 days'')::bigint AS rows_7d, '
    || 'count(*) FILTER (WHERE %I >= now() - interval ''30 days'')::bigint AS rows_30d '
    || 'FROM public.%I',
    table_name,
    column_name,
    column_name,
    column_name,
    table_name
  ) AS sql_part
  FROM ranked
  WHERE rn = 1
)
SELECT
  'SELECT ''clock_growth'', table_name, clock, total_rows, rows_7d, rows_30d '
  || 'FROM (' || string_agg(sql_part, ' UNION ALL ') || ') q '
  || 'WHERE rows_30d > 0 '
  || 'ORDER BY rows_30d DESC, total_rows DESC, table_name;'
FROM parts
\gexec

-- Reproduce the player-linear projection from owned writes in nine principal
-- gameplay/feed tables. Rows without a user identity are reported separately
-- and deliberately excluded from active-user-day normalization.
WITH activity(table_name, rows_7d, user_days, unowned_rows_7d) AS (
  SELECT 'events', count(*) FILTER (WHERE user_id IS NOT NULL),
         count(DISTINCT (user_id, created_at::date)) FILTER (WHERE user_id IS NOT NULL),
         count(*) FILTER (WHERE user_id IS NULL)
  FROM public.events WHERE created_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'cp_event_inbox', count(*), count(DISTINCT (user_id, received_at::date)), 0
  FROM public.cp_event_inbox WHERE received_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'feed_decisions', count(*), count(DISTINCT (user_id, created_at::date)), 0
  FROM public.feed_decisions WHERE created_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'content_impressions', count(*), count(DISTINCT (user_id, revealed_at::date)), 0
  FROM public.content_impressions WHERE revealed_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'affinity_impression_evidence', count(*),
         count(DISTINCT (user_id, created_at::date)), 0
  FROM public.affinity_impression_evidence
  WHERE created_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'reward_ledger', count(*), count(DISTINCT (user_id, created_at::date)), 0
  FROM public.reward_ledger WHERE created_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'verified_runs', count(*), count(DISTINCT (user_id, created_at::date)), 0
  FROM public.verified_runs WHERE created_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'run_tickets', count(*), count(DISTINCT (user_id, created_at::date)), 0
  FROM public.run_tickets WHERE created_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'puzzle_ledger', count(*), count(DISTINCT (user_id, created_at::date)), 0
  FROM public.puzzle_ledger WHERE created_at >= now() - interval '7 days'
), payload(table_name, average_payload_bytes) AS (
  SELECT 'events', avg(pg_column_size(t)) FILTER (WHERE user_id IS NOT NULL)
  FROM public.events t WHERE created_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'cp_event_inbox', avg(pg_column_size(t))
  FROM public.cp_event_inbox t WHERE received_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'feed_decisions', avg(pg_column_size(t))
  FROM public.feed_decisions t WHERE created_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'content_impressions', avg(pg_column_size(t))
  FROM public.content_impressions t WHERE revealed_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'affinity_impression_evidence', avg(pg_column_size(t))
  FROM public.affinity_impression_evidence t
  WHERE created_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'reward_ledger', avg(pg_column_size(t))
  FROM public.reward_ledger t WHERE created_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'verified_runs', avg(pg_column_size(t))
  FROM public.verified_runs t WHERE created_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'run_tickets', avg(pg_column_size(t))
  FROM public.run_tickets t WHERE created_at >= now() - interval '7 days'
  UNION ALL
  SELECT 'puzzle_ledger', avg(pg_column_size(t))
  FROM public.puzzle_ledger t WHERE created_at >= now() - interval '7 days'
), footprint AS (
  SELECT relname AS table_name,
         pg_total_relation_size(relid)::numeric AS relation_bytes,
         n_live_tup::numeric AS estimated_rows
  FROM pg_stat_user_tables
  WHERE schemaname = 'public'
)
SELECT 'user_day_model',
       a.table_name,
       a.rows_7d,
       a.user_days,
       a.unowned_rows_7d,
       round(a.rows_7d::numeric / nullif(a.user_days, 0), 2),
       round(p.average_payload_bytes),
       round(f.relation_bytes / nullif(f.estimated_rows, 0)),
       round(
         a.rows_7d::numeric / nullif(a.user_days, 0)
         * p.average_payload_bytes
       ),
       round(
         a.rows_7d::numeric / nullif(a.user_days, 0)
         * f.relation_bytes / nullif(f.estimated_rows, 0)
       )
FROM activity a
JOIN payload p USING (table_name)
JOIN footprint f USING (table_name)
ORDER BY a.table_name;

-- C1 manifests have no row timestamp. Bind their growth to the immutable
-- report's materialization day, and expose both membership and byte inputs.
WITH recent AS (
  SELECT i.*
  FROM public.content_analytics_report_inputs i
  JOIN public.content_analytics_reports r USING (report_id)
  WHERE r.materialized_at >= now() - interval '7 days'
), report_days AS (
  SELECT count(*) AS rows_7d,
         count(DISTINCT r.materialized_at::date) AS days_7d
  FROM public.content_analytics_report_inputs i
  JOIN public.content_analytics_reports r USING (report_id)
  WHERE r.materialized_at >= now() - interval '7 days'
), payload AS (
  SELECT avg(pg_column_size(t)) AS average_payload_bytes
  FROM recent t
), footprint AS (
  SELECT pg_total_relation_size('public.content_analytics_report_inputs')::numeric
           AS relation_bytes,
         count(*)::numeric AS total_rows
  FROM public.content_analytics_report_inputs
)
SELECT 'c1_manifest_model',
       d.rows_7d,
       d.days_7d,
       round(d.rows_7d::numeric / nullif(d.days_7d, 0), 2),
       round(p.average_payload_bytes),
       round(f.relation_bytes / nullif(f.total_rows, 0)),
       round(
         d.rows_7d::numeric / nullif(d.days_7d, 0)
         * p.average_payload_bytes
       ),
       round(
         d.rows_7d::numeric / nullif(d.days_7d, 0)
         * f.relation_bytes / nullif(f.total_rows, 0)
       )
FROM report_days d
CROSS JOIN payload p
CROSS JOIN footprint f;

SELECT 'runtime',
       'connections',
       count(*),
       current_setting('max_connections')
FROM pg_stat_activity
WHERE datname = current_database();

SELECT 'runtime',
       'lock_waiters',
       count(*)
FROM pg_stat_activity
WHERE datname = current_database()
  AND wait_event_type = 'Lock';

SELECT 'runtime',
       'database_stats',
       xact_commit,
       xact_rollback,
       blks_read,
       blks_hit,
       temp_files,
       temp_bytes,
       deadlocks,
       conflicts,
       to_char(stats_reset, 'YYYY-MM-DD HH24:MI:SS TZ')
FROM pg_stat_database
WHERE datname = current_database();

SELECT 'index_fanout',
       relname,
       count(*) AS indexes,
       count(*) FILTER (WHERE idx_scan = 0) AS zero_scan_indexes,
       sum(pg_relation_size(indexrelid)) AS index_bytes,
       sum(idx_scan) AS total_scans
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
GROUP BY relname
HAVING count(*) >= 6
ORDER BY count(*) DESC, sum(pg_relation_size(indexrelid)) DESC;

SELECT 'snapshot_complete', 'ok';

ROLLBACK;
