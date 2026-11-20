-- Execute ONLY after inventory-reservation-lab.sql in a disposable test database.
-- Sequential functional checks; NOT a substitute for two-session concurrency testing.
begin;
do $test$
declare
  v jsonb;
  v_reserved bigint;
  v_physical bigint;
begin
  select inventory_protection_lab.reserve(
    'PNTEST-A','test-fingerprint-a','[{"product_key":"naxos-test","centi_ml":4000}]'::jsonb
  ) into v;
  if v->>'result'<>'RESERVED' then raise exception 'A reserve failed'; end if;
  select inventory_protection_lab.reserve(
    'PNTEST-A-retry','test-fingerprint-a','[{"product_key":"naxos-test","centi_ml":4000}]'::jsonb
  ) into v;
  if v->>'result'<>'DUPLICATE' or v->>'order_id'<>'PNTEST-A' then
    raise exception 'Idempotency replay failed';
  end if;

  select inventory_protection_lab.reserve(
    'PNTEST-B','test-fingerprint-b','[{"product_key":"naxos-test","centi_ml":4000}]'::jsonb
  ) into v;
  if v->>'result'<>'RESERVED' then raise exception 'B reserve failed'; end if;

  begin
    perform inventory_protection_lab.reserve(
      'PNTEST-C','test-fingerprint-c','[{"product_key":"naxos-test","centi_ml":2000}]'::jsonb
    );
    raise exception 'Oversold: third order unexpectedly reserved';
  exception when others then
    if sqlerrm not like '%INSUFFICIENT_AVAILABLE%' then raise; end if;
  end;

  select reserved_centi_ml into v_reserved from inventory_protection_lab.balances
    where product_key='naxos-test';
  if v_reserved<>8000 then raise exception 'Expected total 8000 reserved, found %',v_reserved; end if;

  if inventory_protection_lab.transition('PNTEST-A','PACK') <> 'PACK' then
    raise exception 'Pack failed';
  end if;
  if inventory_protection_lab.transition('PNTEST-A','PACK') <> 'DUPLICATE' then
    raise exception 'Pack should be idempotent';
  end if;
  begin
    perform inventory_protection_lab.transition('PNTEST-A','CANCEL');
    raise exception 'Packed cancellation incorrectly returned stock';
  exception when others then
    if sqlerrm not like '%RECONCILIATION_REQUIRED%' then raise; end if;
  end;

  if inventory_protection_lab.transition('PNTEST-B','CANCEL') <> 'CANCEL' then
    raise exception 'Cancellation failed';
  end if;
  select physical_centi_ml,reserved_centi_ml into v_physical,v_reserved
    from inventory_protection_lab.balances where product_key='naxos-test';
  if v_physical<>4000 or v_reserved<>0 then
    raise exception 'Expected 4000 physical and zero reserved, got %/%',v_physical,v_reserved;
  end if;

  begin
    perform inventory_protection_lab.reserve(
      'PNTEST-MIX','test-fingerprint-mix',
      '[{"product_key":"naxos-test","centi_ml":3000},{"product_key":"ginger-test","centi_ml":4000}]'::jsonb
    );
    raise exception 'Mixed basket should be rejected';
  exception when others then
    if sqlerrm not like '%INSUFFICIENT_AVAILABLE%' then raise; end if;
  end;
  select reserved_centi_ml into v_reserved from inventory_protection_lab.balances
    where product_key='naxos-test';
  if v_reserved<>0 then raise exception 'Partial basket reservation leaked'; end if;

  begin
    perform inventory_protection_lab.reserve(
      'PNTEST-UNKNOWN','test-fingerprint-unknown',
      '[{"product_key":"unknown-test","centi_ml":100}]'::jsonb
    );
    raise exception 'Unverified stock incorrectly permitted';
  exception when others then
    if sqlerrm not like '%UNKNOWN_STOCK%' then raise; end if;
  end;
end;
$test$;
rollback;
-- The transaction rolls back *all* scenario orders, preserving the synthetic baseline.
