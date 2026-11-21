-- TEMPORARY POSTGRESQL PROOF / SAFE TO RUN IN A SINGLE ROLLED-BACK SESSION.
-- NO Production rows, persistent functions, sequence counters, or schema changes.
-- This demonstrates atomic SQL INSERT/UPDATE + rollback + idempotency using
-- real PostgreSQL; it DOES NOT demonstrate simultaneous independent sessions.
BEGIN;
CREATE TEMP TABLE pn_atomic_test_stock (
  product_key text PRIMARY KEY, available_ml numeric(10,2) NOT NULL CHECK(available_ml>=0)
) ON COMMIT DROP;
CREATE TEMP TABLE pn_atomic_test_orders (
  fingerprint text PRIMARY KEY, id text NOT NULL UNIQUE
) ON COMMIT DROP;
CREATE TEMP TABLE pn_atomic_test_reservations (
  fingerprint text PRIMARY KEY REFERENCES pn_atomic_test_orders(fingerprint),
  reserved_ml numeric(10,2) NOT NULL CHECK(reserved_ml>0)
) ON COMMIT DROP;
INSERT INTO pn_atomic_test_stock(product_key,available_ml) VALUES ('test:naxos',40);

CREATE FUNCTION pg_temp.pn_atomic_try_admit(
  p_fingerprint text, p_ml numeric, p_inject_failure boolean DEFAULT false
) RETURNS text LANGUAGE plpgsql AS $fn$
DECLARE v_id text;
BEGIN
  IF p_fingerprint !~ '^[a-z0-9]{2,32}$' OR p_ml<=0 OR p_ml>30
  THEN RETURN 'INVALID_ORDER'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('pn-audit:preview:fp:'||p_fingerprint,0));
  SELECT id INTO v_id FROM pg_temp.pn_atomic_test_orders
    WHERE fingerprint=p_fingerprint;
  IF FOUND THEN RETURN 'DUPLICATE'; END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended('pn-audit:preview:product:test:naxos',0));
  UPDATE pg_temp.pn_atomic_test_stock
    SET available_ml=available_ml-p_ml
    WHERE product_key='test:naxos' AND available_ml>=p_ml;
  IF NOT FOUND THEN RETURN 'STOCK_LIMIT_REACHED'; END IF;

  v_id:='PNTEST-SYNTHETIC-'||p_fingerprint;
  INSERT INTO pg_temp.pn_atomic_test_orders(fingerprint,id) VALUES(p_fingerprint,v_id);
  IF p_inject_failure THEN
    RAISE EXCEPTION 'INJECT_RESERVATION_WRITE_FAILURE';
  END IF;
  INSERT INTO pg_temp.pn_atomic_test_reservations(fingerprint,reserved_ml)
    VALUES(p_fingerprint,p_ml);
  RETURN 'ACCEPTED';
END $fn$;

DO $verify$
DECLARE v text;
BEGIN
  v:=pg_temp.pn_atomic_try_admit('buyera',30);
  IF v<>'ACCEPTED' THEN RAISE EXCEPTION 'first buyer: %',v; END IF;
  v:=pg_temp.pn_atomic_try_admit('buyerb',30);
  IF v<>'STOCK_LIMIT_REACHED' THEN RAISE EXCEPTION 'second buyer: %',v; END IF;
  v:=pg_temp.pn_atomic_try_admit('buyera',30);
  IF v<>'DUPLICATE' THEN RAISE EXCEPTION 'idempotent retry: %',v; END IF;
  BEGIN
    v:=pg_temp.pn_atomic_try_admit('buyerfail',10,true);
    RAISE EXCEPTION 'fault injection should have raised, returned %',v;
  EXCEPTION WHEN raise_exception THEN
    -- PostgreSQL rolls back all writes in this subtransaction.
    NULL;
  END;
  IF (SELECT available_ml FROM pg_temp.pn_atomic_test_stock
      WHERE product_key='test:naxos') <> 10
  THEN RAISE EXCEPTION 'inventory changed after rollback'; END IF;
  IF (SELECT count(*) FROM pg_temp.pn_atomic_test_orders) <> 1
    OR (SELECT count(*) FROM pg_temp.pn_atomic_test_reservations) <> 1
  THEN RAISE EXCEPTION 'ghost order/reservation remained after rollback'; END IF;
END $verify$;

SELECT 'PASS' AS result,
  (SELECT available_ml FROM pg_temp.pn_atomic_test_stock WHERE product_key='test:naxos') AS remaining_test_ml,
  (SELECT count(*) FROM pg_temp.pn_atomic_test_orders) AS test_orders,
  (SELECT count(*) FROM pg_temp.pn_atomic_test_reservations) AS test_reservations,
  'single session; NOT a concurrent-session proof' AS scope;
ROLLBACK;
