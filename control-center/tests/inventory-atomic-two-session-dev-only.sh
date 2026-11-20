#!/usr/bin/env bash
# DEVELOPMENT DATABASE ONLY. Two independent psql sessions test contention.
# Required: PG_TEST_DATABASE_URL and ISOLATED_DEV_DB_ACK=I_CONFIRM_DISPOSABLE_DEV_DB
# This writes/drops ONLY the fixture schema in that development database.
set -euo pipefail
: "${PG_TEST_DATABASE_URL:?Set connection string to an isolated development Supabase branch}"
if [[ "${ISOLATED_DEV_DB_ACK:-}" != "I_CONFIRM_DISPOSABLE_DEV_DB" ]]; then
  echo "Refusing to use a database without explicit disposable DEV acknowledgement" >&2
  exit 2
fi
command -v psql >/dev/null || { echo "psql required" >&2; exit 2; }
tmpdir="$(mktemp -d)"
cleanup() {
  psql "$PG_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -q -c 'DROP SCHEMA IF EXISTS pn_atomic_test_fixture CASCADE' >/dev/null 2>&1 || true
  rm -rf "$tmpdir"
}
trap cleanup EXIT

psql "$PG_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -q <<'SQL'
CREATE SCHEMA pn_atomic_test_fixture;
CREATE TABLE pn_atomic_test_fixture.stock (
 product_key text PRIMARY KEY,
 available_ml numeric NOT NULL CHECK (available_ml >= 0)
);
CREATE TABLE pn_atomic_test_fixture.orders (
 fingerprint text PRIMARY KEY,
 product_key text NOT NULL,
 reserved_ml numeric NOT NULL CHECK (reserved_ml > 0)
);
INSERT INTO pn_atomic_test_fixture.stock VALUES ('naxos fixture',40);
CREATE FUNCTION pn_atomic_test_fixture.admit(
  p_fp text,p_ml numeric,p_hold_sec numeric DEFAULT 0,
  p_inject_error boolean DEFAULT false
) RETURNS text LANGUAGE plpgsql
SET search_path = 'pg_catalog'
AS $$
DECLARE v_available numeric;
BEGIN
  IF p_fp !~ '^[a-f0-9]{64}$' OR p_ml<=0 OR p_ml>30
    THEN RETURN 'INVALID_OR_CAP'; END IF;
  PERFORM pg_advisory_xact_lock(
    hashtextextended('pn-fixture:fp:'||p_fp,0)
  );
  IF EXISTS(SELECT 1 FROM pn_atomic_test_fixture.orders WHERE fingerprint=p_fp)
    THEN RETURN 'DUPLICATE'; END IF;
  PERFORM pg_advisory_xact_lock(
    hashtextextended('pn-fixture:product:naxos fixture',0)
  );
  SELECT s.available_ml-COALESCE((
    SELECT sum(o.reserved_ml)
    FROM pn_atomic_test_fixture.orders o
    WHERE o.product_key='naxos fixture'
  ),0) INTO v_available FROM pn_atomic_test_fixture.stock s
  WHERE s.product_key='naxos fixture';
  IF p_ml>v_available THEN RETURN 'STOCK_LIMIT_REACHED'; END IF;
  INSERT INTO pn_atomic_test_fixture.orders
    (fingerprint,product_key,reserved_ml)
  VALUES(p_fp,'naxos fixture',p_ml);
  IF p_inject_error THEN
    RAISE EXCEPTION 'INTENTIONAL_ROLLBACK';
  END IF;
  IF p_hold_sec>0 THEN PERFORM pg_sleep(p_hold_sec); END IF;
  RETURN 'ACCEPTED';
END;
$$;
SQL

fp_a="$(printf '%064d' 0 | tr 0 a)"
fp_b="$(printf '%064d' 0 | tr 0 b)"
fp_c="$(printf '%064d' 0 | tr 0 c)"
# Two *separate* psql processes/connections, same product advisory lock.
psql "$PG_TEST_DATABASE_URL" -At -v ON_ERROR_STOP=1 -c \
  "SELECT pn_atomic_test_fixture.admit('$fp_a',30,4)" > "$tmpdir/a.out" 2>"$tmpdir/a.err" &
pid_a=$!
sleep 0.4
psql "$PG_TEST_DATABASE_URL" -At -v ON_ERROR_STOP=1 -c \
  "SELECT pn_atomic_test_fixture.admit('$fp_b',30,0)" > "$tmpdir/b.out" 2>"$tmpdir/b.err" &
pid_b=$!
# Observe B blocked on advisory lock if both sessions overlap.
sleep 1
waiting="$(psql "$PG_TEST_DATABASE_URL" -At -v ON_ERROR_STOP=1 -c \
  "SELECT count(*) FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND wait_event='advisory' AND query LIKE '%pn_atomic_test_fixture.admit%'")"
wait "$pid_a"
wait "$pid_b"
a="$(cat "$tmpdir/a.out")"
b="$(cat "$tmpdir/b.out")"
if [[ "$a" != "ACCEPTED" || "$b" != "STOCK_LIMIT_REACHED" ]]; then
  echo "FAIL concurrent admit: A=$a B=$b" >&2
  exit 1
fi
if (( waiting < 1 )); then
  echo "FAIL: no observed advisory-lock waiting in second session" >&2
  exit 1
fi
duplicate="$(psql "$PG_TEST_DATABASE_URL" -At -v ON_ERROR_STOP=1 -c \
  "SELECT pn_atomic_test_fixture.admit('$fp_a',30,0)")"
[[ "$duplicate" == "DUPLICATE" ]] || { echo "FAIL duplicate=$duplicate" >&2; exit 1; }
if psql "$PG_TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -q -c \
 "SELECT pn_atomic_test_fixture.admit('$fp_c',5,0,true)" \
 > "$tmpdir/rollback.out" 2>&1; then
  echo "FAIL injected transaction error did not abort" >&2
  exit 1
fi
state="$(psql "$PG_TEST_DATABASE_URL" -At -v ON_ERROR_STOP=1 -c \
  "SELECT count(*)||':'||coalesce(sum(reserved_ml),0) FROM pn_atomic_test_fixture.orders")"
[[ "$state" == "1:30" ]] || { echo "FAIL conservation=$state" >&2; exit 1; }
echo "PASS two PostgreSQL sessions: advisory contention observed; A accepted 30ml; B denied; retry duplicate; rollback; 1 reservation/30ml"
