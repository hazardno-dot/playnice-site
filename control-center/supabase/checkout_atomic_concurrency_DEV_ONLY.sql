-- DEVELOPMENT / TEST DATABASE ONLY. DO NOT RUN AGAINST PLAYNICE PRODUCTION.
-- Installed ONLY by the explicit isolated concurrency harness. All rows are synthetic.
-- The harness drops this schema in a finally block.
CREATE SCHEMA IF NOT EXISTS pn_inventory_concurrency_fixture;
CREATE TABLE pn_inventory_concurrency_fixture.stock (
  product_key text primary key, available_ml numeric(10,2) not null check(available_ml>=0)
);
CREATE TABLE pn_inventory_concurrency_fixture.orders (
  fingerprint text primary key, order_id text unique not null
);
CREATE TABLE pn_inventory_concurrency_fixture.reservations (
  fingerprint text not null references pn_inventory_concurrency_fixture.orders(fingerprint),
  product_key text not null references pn_inventory_concurrency_fixture.stock(product_key),
  reserved_ml numeric(10,2) not null check(reserved_ml>0),
  primary key(fingerprint,product_key)
);
INSERT INTO pn_inventory_concurrency_fixture.stock VALUES ('synthetic naxos',40.00);
CREATE FUNCTION pn_inventory_concurrency_fixture.admit(
 p_fingerprint text,p_product_key text,p_ml numeric,p_hold_seconds numeric default 0,
 p_inject_failure boolean default false
) RETURNS text LANGUAGE plpgsql SET search_path = '' AS $func$
DECLARE v_available numeric; v_existing boolean;
BEGIN
 IF p_fingerprint !~ '^[a-f0-9]{64}$' OR p_product_key IS NULL
    OR p_ml IS NULL OR p_ml<=0 OR p_ml>30
    OR p_ml*100<>trunc(p_ml*100)
    OR p_hold_seconds<0 OR p_hold_seconds>6 THEN
   RETURN 'INVALID_ORDER';
 END IF;
 -- Fingerprint idempotency lock precedes stock lock.
 PERFORM pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('pn-dev-fixture:fp:'||p_fingerprint,0)
 );
 SELECT EXISTS(SELECT 1 FROM pn_inventory_concurrency_fixture.orders
  WHERE fingerprint=p_fingerprint) INTO v_existing;
 IF v_existing THEN RETURN 'DUPLICATE'; END IF;
 PERFORM pg_catalog.pg_advisory_xact_lock(
  pg_catalog.hashtextextended('pn-dev-fixture:stock:'||p_product_key,0)
 );
 IF p_hold_seconds>0 THEN PERFORM pg_catalog.pg_sleep(p_hold_seconds); END IF;
 SELECT s.available_ml - coalesce((
   SELECT sum(r.reserved_ml) FROM pn_inventory_concurrency_fixture.reservations r
   WHERE r.product_key=s.product_key
 ),0) INTO v_available
 FROM pn_inventory_concurrency_fixture.stock s WHERE s.product_key=p_product_key;
 IF NOT FOUND THEN RETURN 'UNKNOWN'; END IF;
 IF p_ml>v_available THEN RETURN 'STOCK_LIMIT_REACHED'; END IF;
 INSERT INTO pn_inventory_concurrency_fixture.orders(fingerprint,order_id)
 VALUES(p_fingerprint,'SYNTHETIC-'||left(p_fingerprint,12));
 IF p_inject_failure THEN RAISE EXCEPTION 'SYNTHETIC_FAILURE'; END IF;
 INSERT INTO pn_inventory_concurrency_fixture.reservations
 (fingerprint,product_key,reserved_ml) VALUES(p_fingerprint,p_product_key,p_ml);
 RETURN 'ACCEPTED';
END;
$func$;
