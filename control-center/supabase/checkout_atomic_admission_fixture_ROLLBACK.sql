-- ISOLATED SQL FIXTURE. NEVER USE AS PRODUCTION ADMISSION.
-- Run only on an isolated development database or in an explicitly approved
-- single-session rollback transaction. This DOES NOT establish concurrency.
-- All objects are temporary and the script ends with ROLLBACK.
BEGIN;

CREATE TEMP TABLE fixture_inventory_stock (
  product_key text PRIMARY KEY,
  available_ml numeric(10,2) NOT NULL CHECK (available_ml >= 0)
) ON COMMIT DROP;

CREATE TEMP TABLE fixture_checkout_orders (
  fingerprint text PRIMARY KEY,
  order_id text NOT NULL UNIQUE
) ON COMMIT DROP;

CREATE TEMP TABLE fixture_stock_reservations (
  fingerprint text NOT NULL REFERENCES fixture_checkout_orders(fingerprint),
  product_key text NOT NULL,
  reserved_ml numeric(10,2) NOT NULL CHECK(reserved_ml > 0),
  PRIMARY KEY (fingerprint,product_key)
) ON COMMIT DROP;

INSERT INTO fixture_inventory_stock(product_key,available_ml)
VALUES ('naxos fixture',40.00);

CREATE FUNCTION pg_temp.try_admit_inventory_fixture(
  p_fingerprint text,
  p_product_key text,
  p_requested_ml numeric,
  p_limit_ml numeric DEFAULT 30.00,
  p_inject_failure boolean DEFAULT false
)
RETURNS text LANGUAGE plpgsql AS $function$
DECLARE
  v_remaining numeric(10,2);
  v_new_order_id text;
BEGIN
  IF p_fingerprint IS NULL OR p_fingerprint !~ '^[a-f0-9]{64}$'
     OR p_product_key IS NULL OR p_product_key <> lower(btrim(p_product_key))
     OR p_requested_ml IS NULL OR p_requested_ml <= 0
     OR p_requested_ml*100 <> trunc(p_requested_ml*100)
     OR p_limit_ml IS NULL OR p_limit_ml <= 0 THEN
    RETURN 'INVALID_ORDER';
  END IF;

  -- Same-fingerprint idempotency must be tested BEFORE a fresh stock debit.
  PERFORM pg_advisory_xact_lock(
    hashtextextended('pn-fixture:preview:fp:'||p_fingerprint,0)
  );
  IF EXISTS(SELECT 1 FROM pg_temp.fixture_checkout_orders WHERE fingerprint=p_fingerprint) THEN
    RETURN 'DUPLICATE';
  END IF;

  -- Distinct fingerprints for one fragrance contend on the SAME lock key.
  -- In a real admission function, sort and lock ALL requested fragrances.
  PERFORM pg_advisory_xact_lock(
    hashtextextended('pn-fixture:preview:fragrance:'||p_product_key,0)
  );

  IF p_requested_ml > p_limit_ml THEN RETURN 'PURCHASE_CAP_REACHED'; END IF;

  SELECT s.available_ml - COALESCE(
    (SELECT sum(r.reserved_ml)
       FROM pg_temp.fixture_stock_reservations r
       WHERE r.product_key=s.product_key),0)
    INTO v_remaining
  FROM pg_temp.fixture_inventory_stock s
  WHERE s.product_key=p_product_key;

  IF NOT FOUND THEN RETURN 'UNKNOWN'; END IF;
  IF p_requested_ml > v_remaining THEN RETURN 'STOCK_LIMIT_REACHED'; END IF;

  v_new_order_id := 'SYNTHETIC-'||left(p_fingerprint,12);
  INSERT INTO pg_temp.fixture_checkout_orders(fingerprint,order_id)
  VALUES(p_fingerprint,v_new_order_id);

  IF p_inject_failure THEN RAISE EXCEPTION 'INTENTIONAL_ROLLBACK_TEST'; END IF;

  INSERT INTO pg_temp.fixture_stock_reservations(fingerprint,product_key,reserved_ml)
  VALUES(p_fingerprint,p_product_key,p_requested_ml);

  RETURN 'ACCEPTED';
END;
$function$;

-- Sequential transaction semantics, NOT an overlapping-session contention test.
DO $assert$
DECLARE
  v_a text := repeat('a',64);
  v_b text := repeat('b',64);
  v_c text := repeat('c',64);
  v_d text := repeat('d',64);
  v_result text;
BEGIN
  v_result := pg_temp.try_admit_inventory_fixture(v_a,'naxos fixture',30);
  IF v_result <> 'ACCEPTED' THEN RAISE EXCEPTION 'first accepted: %',v_result; END IF;

  v_result := pg_temp.try_admit_inventory_fixture(v_b,'naxos fixture',30);
  IF v_result <> 'STOCK_LIMIT_REACHED' THEN
    RAISE EXCEPTION 'second distinct order must fail: %',v_result;
  END IF;

  v_result := pg_temp.try_admit_inventory_fixture(v_a,'naxos fixture',30);
  IF v_result <> 'DUPLICATE' THEN RAISE EXCEPTION 'retry: %',v_result; END IF;

  v_result := pg_temp.try_admit_inventory_fixture(v_c,'naxos fixture',31);
  IF v_result <> 'PURCHASE_CAP_REACHED' THEN RAISE EXCEPTION 'cap: %',v_result; END IF;

  -- PL/pgSQL nested exception block forms a savepoint; a reservation failure
  -- must roll back the preceding INSERT for this fingerprint as well.
  BEGIN
    PERFORM pg_temp.try_admit_inventory_fixture(v_d,'naxos fixture',5,30,true);
    RAISE EXCEPTION 'Expected injected failure did not happen';
  EXCEPTION WHEN raise_exception THEN
    IF SQLERRM <> 'INTENTIONAL_ROLLBACK_TEST' THEN RAISE; END IF;
    IF EXISTS(SELECT 1 FROM pg_temp.fixture_checkout_orders WHERE fingerprint=v_d)
       OR EXISTS(SELECT 1 FROM pg_temp.fixture_stock_reservations WHERE fingerprint=v_d) THEN
      RAISE EXCEPTION 'Failed order or reservation persisted';
    END IF;
  END;

  IF (SELECT count(*) FROM pg_temp.fixture_checkout_orders) <> 1
     OR (SELECT coalesce(sum(reserved_ml),0) FROM pg_temp.fixture_stock_reservations) <> 30 THEN
    RAISE EXCEPTION 'Fixture conservation mismatch';
  END IF;
  RAISE NOTICE 'PASS: SQL fixture single-session admission, denial, retry, cap, rollback';
END;
$assert$;

-- No persistent rows, functions, or schema objects remain after this.
ROLLBACK;
