\set ON_ERROR_STOP on
\set QUIET on
\pset pager off
\pset format unaligned
\pset tuples_only on

-- Read-only capability profile for one Render-managed PostgreSQL credential.
-- Capture once with the old default user and once with the proposed new user:
--
--   # Connection is supplied through operator-local PG* environment, never
--   # as a URL argv visible in the process list.
--   psql -X -q -f scripts/platform-reliability-r1-db-capability.sql \
--     > <profile.jsonl>
--
-- The profile contains object/role names but never a password or connection
-- string. Keep raw profiles operator-local because the meta row includes the
-- username and ACL/config values; the comparator hashes credential, database,
-- cluster, object identities and non-primitive difference values.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL statement_timeout = '30s';
SET LOCAL lock_timeout = '3s';
SET LOCAL TimeZone = 'UTC';

SELECT json_build_object(
  'kind', 'meta',
  'observedAt', to_char(
    clock_timestamp() AT TIME ZONE 'UTC',
    'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
  ),
  'database', current_database(),
  'databaseOid', (
    SELECT oid::text FROM pg_database WHERE datname = current_database()
  ),
  'user', current_user,
  'sessionUser', session_user,
  'readOnly', current_setting('transaction_read_only') = 'on',
  'timezone', current_setting('TimeZone'),
  'serverVersionNum', current_setting('server_version_num'),
  'serverAddress', inet_server_addr()::text,
  'serverPort', inet_server_port(),
  'systemIdentifier', (
    SELECT CASE
      WHEN control.oid IS NOT NULL
       AND has_function_privilege(current_user, control.oid, 'EXECUTE')
      THEN (SELECT system_identifier::text FROM pg_control_system())
    END
    FROM (
      SELECT to_regprocedure('pg_catalog.pg_control_system()') AS oid
    ) AS control
  )
)::text;

SELECT json_build_object(
  'kind', 'role',
  'identity', 'current',
  'superuser', rol.rolsuper,
  'login', rol.rolcanlogin,
  'inherit', rol.rolinherit,
  'createRole', rol.rolcreaterole,
  'createDb', rol.rolcreatedb,
  'replication', rol.rolreplication,
  'bypassRls', rol.rolbypassrls,
  'connectionLimit', rol.rolconnlimit,
  'searchPath', current_setting('search_path'),
  'rowSecuritySetting', current_setting('row_security'),
  'roleConfig', ARRAY(
    SELECT setting
    FROM unnest(coalesce(rol.rolconfig, ARRAY[]::text[])) AS setting
    ORDER BY setting
  )
)::text
FROM pg_roles AS rol
WHERE rol.rolname = current_user;

SELECT json_build_object(
  'kind', 'membership',
  'identity', member_of.rolname,
  'member', pg_has_role(current_user, member_of.oid, 'MEMBER'),
  'usage', pg_has_role(current_user, member_of.oid, 'USAGE'),
  'setRole', CASE
    WHEN current_setting('server_version_num')::integer >= 160000
    THEN pg_has_role(current_user, member_of.oid, 'SET')
  END,
  'adminOption', pg_has_role(
    current_user,
    member_of.oid,
    'MEMBER WITH ADMIN OPTION'
  )
)::text
FROM pg_roles AS member_of
WHERE member_of.rolname <> current_user
  AND pg_has_role(current_user, member_of.oid, 'MEMBER')
ORDER BY member_of.rolname;

SELECT json_build_object(
  'kind', 'database',
  'identity', current_database(),
  'owner', owner.rolname,
  'ownerMember', pg_has_role(current_user, db.datdba, 'MEMBER'),
  'connect', has_database_privilege(current_user, current_database(), 'CONNECT'),
  'connectGrant', has_database_privilege(
    current_user,
    current_database(),
    'CONNECT WITH GRANT OPTION'
  ),
  'create', has_database_privilege(current_user, current_database(), 'CREATE'),
  'createGrant', has_database_privilege(
    current_user,
    current_database(),
    'CREATE WITH GRANT OPTION'
  ),
  'temporary', has_database_privilege(
    current_user,
    current_database(),
    'TEMPORARY'
  ),
  'temporaryGrant', has_database_privilege(
    current_user,
    current_database(),
    'TEMPORARY WITH GRANT OPTION'
  )
)::text
FROM pg_database AS db
JOIN pg_roles AS owner ON owner.oid = db.datdba
WHERE db.datname = current_database();

SELECT json_build_object(
  'kind', 'schema',
  'identity', quote_ident(n.nspname),
  'owner', owner.rolname,
  'ownerMember', pg_has_role(current_user, n.nspowner, 'MEMBER'),
  'usage', has_schema_privilege(current_user, n.oid, 'USAGE'),
  'usageGrant', has_schema_privilege(
    current_user,
    n.oid,
    'USAGE WITH GRANT OPTION'
  ),
  'create', has_schema_privilege(current_user, n.oid, 'CREATE'),
  'createGrant', has_schema_privilege(
    current_user,
    n.oid,
    'CREATE WITH GRANT OPTION'
  )
)::text
FROM pg_namespace AS n
JOIN pg_roles AS owner ON owner.oid = n.nspowner
WHERE n.nspname !~ '^pg_'
  AND n.nspname <> 'information_schema'
ORDER BY n.nspname;

SELECT json_build_object(
  'kind', 'relation',
  'identity', quote_ident(n.nspname) || '.' || quote_ident(c.relname),
  'relationKind', c.relkind,
  'owner', owner.rolname,
  'ownerMember', pg_has_role(current_user, c.relowner, 'MEMBER'),
  'rowSecurity', c.relrowsecurity,
  'forceRowSecurity', c.relforcerowsecurity,
  'rowSecurityActive', row_security_active(c.oid),
  'select', has_table_privilege(current_user, c.oid, 'SELECT'),
  'selectGrant', has_table_privilege(
    current_user,
    c.oid,
    'SELECT WITH GRANT OPTION'
  ),
  'insert', has_table_privilege(current_user, c.oid, 'INSERT'),
  'insertGrant', has_table_privilege(
    current_user,
    c.oid,
    'INSERT WITH GRANT OPTION'
  ),
  'update', has_table_privilege(current_user, c.oid, 'UPDATE'),
  'updateGrant', has_table_privilege(
    current_user,
    c.oid,
    'UPDATE WITH GRANT OPTION'
  ),
  'delete', has_table_privilege(current_user, c.oid, 'DELETE'),
  'deleteGrant', has_table_privilege(
    current_user,
    c.oid,
    'DELETE WITH GRANT OPTION'
  ),
  'truncate', has_table_privilege(current_user, c.oid, 'TRUNCATE'),
  'truncateGrant', has_table_privilege(
    current_user,
    c.oid,
    'TRUNCATE WITH GRANT OPTION'
  ),
  'references', has_table_privilege(current_user, c.oid, 'REFERENCES'),
  'referencesGrant', has_table_privilege(
    current_user,
    c.oid,
    'REFERENCES WITH GRANT OPTION'
  ),
  'trigger', has_table_privilege(current_user, c.oid, 'TRIGGER'),
  'triggerGrant', has_table_privilege(
    current_user,
    c.oid,
    'TRIGGER WITH GRANT OPTION'
  ),
  -- MAINTAIN became a grantable table privilege in PostgreSQL 17. Profiles
  -- from older servers carry null explicitly instead of failing the probe.
  'maintain', CASE
    WHEN current_setting('server_version_num')::integer >= 170000
    THEN has_table_privilege(current_user, c.oid, 'MAINTAIN')
  END,
  'maintainGrant', CASE
    WHEN current_setting('server_version_num')::integer >= 170000
    THEN has_table_privilege(
      current_user,
      c.oid,
      'MAINTAIN WITH GRANT OPTION'
    )
  END
)::text
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
JOIN pg_roles AS owner ON owner.oid = c.relowner
WHERE n.nspname !~ '^pg_'
  AND n.nspname <> 'information_schema'
  AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
ORDER BY n.nspname, c.relname;

SELECT json_build_object(
  'kind', 'column',
  'identity',
    quote_ident(n.nspname) || '.' || quote_ident(c.relname)
    || '.' || quote_ident(a.attname),
  'select', has_column_privilege(current_user, c.oid, a.attnum, 'SELECT'),
  'selectGrant', has_column_privilege(
    current_user,
    c.oid,
    a.attnum,
    'SELECT WITH GRANT OPTION'
  ),
  'insert', has_column_privilege(current_user, c.oid, a.attnum, 'INSERT'),
  'insertGrant', has_column_privilege(
    current_user,
    c.oid,
    a.attnum,
    'INSERT WITH GRANT OPTION'
  ),
  'update', has_column_privilege(current_user, c.oid, a.attnum, 'UPDATE'),
  'updateGrant', has_column_privilege(
    current_user,
    c.oid,
    a.attnum,
    'UPDATE WITH GRANT OPTION'
  ),
  'references', has_column_privilege(
    current_user,
    c.oid,
    a.attnum,
    'REFERENCES'
  ),
  'referencesGrant', has_column_privilege(
    current_user,
    c.oid,
    a.attnum,
    'REFERENCES WITH GRANT OPTION'
  )
)::text
FROM pg_attribute AS a
JOIN pg_class AS c ON c.oid = a.attrelid
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname !~ '^pg_'
  AND n.nspname <> 'information_schema'
  AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
  AND a.attnum > 0
  AND NOT a.attisdropped
ORDER BY n.nspname, c.relname, a.attnum;

SELECT json_build_object(
  'kind', 'sequence',
  'identity', quote_ident(n.nspname) || '.' || quote_ident(c.relname),
  'owner', owner.rolname,
  'ownerMember', pg_has_role(current_user, c.relowner, 'MEMBER'),
  'usage', has_sequence_privilege(current_user, c.oid, 'USAGE'),
  'usageGrant', has_sequence_privilege(
    current_user,
    c.oid,
    'USAGE WITH GRANT OPTION'
  ),
  'select', has_sequence_privilege(current_user, c.oid, 'SELECT'),
  'selectGrant', has_sequence_privilege(
    current_user,
    c.oid,
    'SELECT WITH GRANT OPTION'
  ),
  'update', has_sequence_privilege(current_user, c.oid, 'UPDATE'),
  'updateGrant', has_sequence_privilege(
    current_user,
    c.oid,
    'UPDATE WITH GRANT OPTION'
  )
)::text
FROM pg_class AS c
JOIN pg_namespace AS n ON n.oid = c.relnamespace
JOIN pg_roles AS owner ON owner.oid = c.relowner
WHERE n.nspname !~ '^pg_'
  AND n.nspname <> 'information_schema'
  AND c.relkind = 'S'
ORDER BY n.nspname, c.relname;

SELECT json_build_object(
  'kind', 'routine',
  'identity',
    quote_ident(n.nspname) || '.' || quote_ident(p.proname)
    || '(' || pg_get_function_identity_arguments(p.oid) || ')',
  'owner', owner.rolname,
  'ownerMember', pg_has_role(current_user, p.proowner, 'MEMBER'),
  'execute', has_function_privilege(current_user, p.oid, 'EXECUTE'),
  'executeGrant', has_function_privilege(
    current_user,
    p.oid,
    'EXECUTE WITH GRANT OPTION'
  )
)::text
FROM pg_proc AS p
JOIN pg_namespace AS n ON n.oid = p.pronamespace
JOIN pg_roles AS owner ON owner.oid = p.proowner
WHERE n.nspname !~ '^pg_'
  AND n.nspname <> 'information_schema'
ORDER BY
  n.nspname,
  p.proname,
  pg_get_function_identity_arguments(p.oid);

SELECT json_build_object(
  'kind', 'type',
  'identity', quote_ident(n.nspname) || '.' || quote_ident(t.typname),
  'owner', owner.rolname,
  'ownerMember', pg_has_role(current_user, t.typowner, 'MEMBER'),
  'usage', has_type_privilege(current_user, t.oid, 'USAGE'),
  'usageGrant', has_type_privilege(
    current_user,
    t.oid,
    'USAGE WITH GRANT OPTION'
  )
)::text
FROM pg_type AS t
JOIN pg_namespace AS n ON n.oid = t.typnamespace
JOIN pg_roles AS owner ON owner.oid = t.typowner
WHERE n.nspname !~ '^pg_'
  AND n.nspname <> 'information_schema'
  AND t.typtype IN ('b', 'c', 'd', 'e', 'm', 'r')
ORDER BY n.nspname, t.typname;

SELECT json_build_object(
  'kind', 'policy',
  'identity',
    quote_ident(n.nspname) || '.' || quote_ident(c.relname)
    || '.' || quote_ident(policy.polname),
  'permissive', policy.polpermissive,
  'command', policy.polcmd,
  'roles', ARRAY(
    SELECT CASE
      WHEN role_oid = 0 THEN 'PUBLIC'
      ELSE (SELECT rolname FROM pg_roles WHERE oid = role_oid)
    END
    FROM unnest(policy.polroles) AS role_oid
    ORDER BY 1
  ),
  'applies', (
    0 = ANY(policy.polroles)
    OR EXISTS (
      SELECT 1
      FROM unnest(policy.polroles) AS role_oid
      WHERE role_oid <> 0
        -- Policy role matching follows normal inheritance rules. USAGE asks
        -- whether the role's privileges apply without an explicit SET ROLE.
        AND pg_has_role(current_user, role_oid, 'USAGE')
    )
  ),
  'usingExpression', pg_get_expr(policy.polqual, policy.polrelid),
  'checkExpression', pg_get_expr(policy.polwithcheck, policy.polrelid)
)::text
FROM pg_policy AS policy
JOIN pg_class AS c ON c.oid = policy.polrelid
JOIN pg_namespace AS n ON n.oid = c.relnamespace
WHERE n.nspname !~ '^pg_'
  AND n.nspname <> 'information_schema'
ORDER BY n.nspname, c.relname, policy.polname;

SELECT json_build_object(
  'kind', 'defaultAcl',
  'identity',
    coalesce(quote_ident(n.nspname), '*')
    || ':' || defaults.defaclobjtype::text,
  'acl', ARRAY(
    SELECT normalized.entry
    FROM (
      SELECT json_build_object(
        'grantee', CASE
          WHEN acl.grantee = 0 THEN 'PUBLIC'
          WHEN acl.grantee = defaults.defaclrole THEN 'CURRENT_USER'
          ELSE 'ROLE:' || grantee.rolname
        END,
        'grantor', CASE
          WHEN acl.grantor = defaults.defaclrole THEN 'CURRENT_USER'
          ELSE 'ROLE:' || grantor.rolname
        END,
        'privilege', acl.privilege_type,
        'grantable', acl.is_grantable
      )::text AS entry
      FROM aclexplode(
        coalesce(defaults.defaclacl, ARRAY[]::aclitem[])
      ) AS acl
      LEFT JOIN pg_roles AS grantee ON grantee.oid = acl.grantee
      LEFT JOIN pg_roles AS grantor ON grantor.oid = acl.grantor
    ) AS normalized
    ORDER BY normalized.entry
  )
)::text
FROM pg_default_acl AS defaults
LEFT JOIN pg_namespace AS n ON n.oid = defaults.defaclnamespace
WHERE defaults.defaclrole = (
  SELECT oid FROM pg_roles WHERE rolname = current_user
)
ORDER BY n.nspname NULLS FIRST, defaults.defaclobjtype;

SELECT json_build_object(
  'kind', 'setting',
  'identity',
    CASE WHEN settings.setdatabase = 0
      THEN 'all-databases'
      ELSE 'current-database'
    END,
  'config', ARRAY(
    SELECT value
    FROM unnest(coalesce(settings.setconfig, ARRAY[]::text[])) AS value
    ORDER BY value
  )
)::text
FROM pg_db_role_setting AS settings
WHERE settings.setrole = (
    SELECT oid FROM pg_roles WHERE rolname = current_user
  )
  AND settings.setdatabase IN (
    0,
    (SELECT oid FROM pg_database WHERE datname = current_database())
  )
ORDER BY settings.setdatabase;

SELECT json_build_object(
  'kind', 'complete',
  'roleCount', (
    SELECT count(*) FROM pg_roles WHERE rolname = current_user
  ),
  'membershipCount', (
    SELECT count(*)
    FROM pg_roles AS member_of
    WHERE member_of.rolname <> current_user
      AND pg_has_role(current_user, member_of.oid, 'MEMBER')
  ),
  'databaseCount', 1,
  'schemaCount', (
    SELECT count(*)
    FROM pg_namespace
    WHERE nspname !~ '^pg_' AND nspname <> 'information_schema'
  ),
  'relationCount', (
    SELECT count(*)
    FROM pg_class AS c
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname !~ '^pg_'
      AND n.nspname <> 'information_schema'
      AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
  ),
  'columnCount', (
    SELECT count(*)
    FROM pg_attribute AS a
    JOIN pg_class AS c ON c.oid = a.attrelid
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname !~ '^pg_'
      AND n.nspname <> 'information_schema'
      AND c.relkind IN ('r', 'p', 'v', 'm', 'f')
      AND a.attnum > 0
      AND NOT a.attisdropped
  ),
  'sequenceCount', (
    SELECT count(*)
    FROM pg_class AS c
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname !~ '^pg_'
      AND n.nspname <> 'information_schema'
      AND c.relkind = 'S'
  ),
  'routineCount', (
    SELECT count(*)
    FROM pg_proc AS p
    JOIN pg_namespace AS n ON n.oid = p.pronamespace
    WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
  ),
  'typeCount', (
    SELECT count(*)
    FROM pg_type AS t
    JOIN pg_namespace AS n ON n.oid = t.typnamespace
    WHERE n.nspname !~ '^pg_'
      AND n.nspname <> 'information_schema'
      AND t.typtype IN ('b', 'c', 'd', 'e', 'm', 'r')
  ),
  'policyCount', (
    SELECT count(*)
    FROM pg_policy AS policy
    JOIN pg_class AS c ON c.oid = policy.polrelid
    JOIN pg_namespace AS n ON n.oid = c.relnamespace
    WHERE n.nspname !~ '^pg_' AND n.nspname <> 'information_schema'
  ),
  'defaultAclCount', (
    SELECT count(*)
    FROM pg_default_acl
    WHERE defaclrole = (
      SELECT oid FROM pg_roles WHERE rolname = current_user
    )
  ),
  'settingCount', (
    SELECT count(*)
    FROM pg_db_role_setting
    WHERE setrole = (
        SELECT oid FROM pg_roles WHERE rolname = current_user
      )
      AND setdatabase IN (
        0,
        (SELECT oid FROM pg_database WHERE datname = current_database())
      )
  ),
  'status', 'ok'
)::text;

ROLLBACK;
