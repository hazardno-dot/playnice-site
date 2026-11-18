#!/usr/bin/env python3
"""DEV ONLY: real overlapping PostgreSQL sessions, never PlayNice Production.

Requires psql and PLAYNICE_ATOMIC_TEST_DSN pointing to a LOCAL database
named exactly playnice_atomic_test. Synthetic fixture schema is dropped in
finally, including on assertion failure. No PlayNice application tables.
"""
import os
import shutil
import subprocess
import time
from urllib.parse import urlparse

DSN = os.environ.get("PLAYNICE_ATOMIC_TEST_DSN", "")
parsed = urlparse(DSN)
if (parsed.scheme not in ("postgres", "postgresql")
    or parsed.hostname not in ("localhost", "127.0.0.1", "::1")
    or parsed.path != "/playnice_atomic_test"
    or os.environ.get("PLAYNICE_ATOMIC_TEST_ACK") != "ISOLATED_LOCAL_DATABASE"):
    raise SystemExit(
        "REFUSED: requires local playnice_atomic_test and explicit "
        "PLAYNICE_ATOMIC_TEST_ACK=ISOLATED_LOCAL_DATABASE"
    )
if not shutil.which("psql"):
    raise SystemExit("psql is required for PostgreSQL session-level proof")

FIXTURE = os.path.abspath(os.path.join(
    os.path.dirname(__file__), "..", "supabase",
    "checkout_atomic_concurrency_DEV_ONLY.sql"
))
def command(sql, name="pn-atomic-inspector", timeout=20):
    env = {**os.environ, "PGAPPNAME": name}
    result = subprocess.run(
        ["psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-d", DSN, "-c", sql],
        capture_output=True, text=True, timeout=timeout, env=env
    )
    if result.returncode:
        raise RuntimeError(f"psql ({name}): {result.stderr[-1200:]}")
    return result.stdout.strip()

def start(sql, name):
    return subprocess.Popen(
        ["psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-d", DSN, "-c", sql],
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
        env={**os.environ, "PGAPPNAME": name}
    )

def await_process(proc, name):
    out, err = proc.communicate(timeout=18)
    if proc.returncode:
        raise RuntimeError(f"{name}: {err[-1200:]}")
    return out.strip()

def count_activity(name, waiting=None):
    # All names below are hardcoded test-only identifiers.
    suffix = (" AND wait_event_type='Lock' AND wait_event='advisory'"
              if waiting else " AND wait_event='PgSleep'")
    return int(command(
        "SELECT count(*) FROM pg_stat_activity WHERE "
        f"application_name='{name}' AND state='active' {suffix}"
    ) or 0)

def wait_for(predicate, seconds=4):
    deadline = time.monotonic() + seconds
    while time.monotonic() < deadline:
        if predicate():
            return True
        time.sleep(0.12)
    return False

def admit(fingerprint, ml=30, hold=0, fail=False):
    return ("SELECT pn_inventory_concurrency_fixture.admit("
            f"'{fingerprint}', 'synthetic naxos',{ml},{hold},"
            f"{'true' if fail else 'false'});")

a, b, c = ("a" * 64, "b" * 64, "c" * 64)
conn_a = conn_b = None
try:
    command("DROP SCHEMA IF EXISTS pn_inventory_concurrency_fixture CASCADE;")
    subprocess.run([
        "psql", "-X", "-q", "-v", "ON_ERROR_STOP=1", "-d", DSN,
        "-f", FIXTURE
    ], check=True, timeout=20, env={**os.environ, "PGAPPNAME": "pn-atomic-setup"})
    # 6 s hold while A owns the product transaction advisory lock.
    conn_a = start(admit(a, hold=6), "pn-atomic-a")
    assert wait_for(lambda: count_activity("pn-atomic-a") > 0, 4), (
        "A never entered its hold after acquiring product lock"
    )
    conn_b = start(admit(b), "pn-atomic-b")
    assert wait_for(lambda: count_activity("pn-atomic-b", waiting=True) > 0, 4), (
        "B was not observed waiting on the advisory lock: NO concurrency proof"
    )
    assert await_process(conn_a, "A") == "ACCEPTED"
    assert await_process(conn_b, "B") == "STOCK_LIMIT_REACHED"
    assert command(admit(a)) == "DUPLICATE"
    assert command(admit(c, ml=31)) == "INVALID_ORDER"
    assert command("SELECT count(*)||':'||coalesce(sum(reserved_ml),0)::text "
                   "FROM pn_inventory_concurrency_fixture.reservations") == "1:30.00"
    # Exception after synthetic order insertion rolls back BOTH INSERTs.
    failure = subprocess.run(
        ["psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-d", DSN,
         "-c", admit(c, ml=5, fail=True)],
        capture_output=True, text=True, timeout=10,
        env={**os.environ, "PGAPPNAME": "pn-atomic-failure"}
    )
    assert failure.returncode != 0 and "SYNTHETIC_FAILURE" in failure.stderr
    assert command("SELECT count(*) FROM pn_inventory_concurrency_fixture.orders "
                   f"WHERE fingerprint='{c}'") == "0"
    assert command("SELECT count(*) FROM pn_inventory_concurrency_fixture.reservations") == "1"
    print("PASS: observed live advisory-lock wait; 1/2 distinct orders admitted; "
          "fingerprint dedupe; 30 ml cap; atomic rollback")
finally:
    for proc in (conn_a, conn_b):
        if proc and proc.poll() is None:
            proc.kill()
            proc.communicate(timeout=4)
    command("DROP SCHEMA IF EXISTS pn_inventory_concurrency_fixture CASCADE;")
