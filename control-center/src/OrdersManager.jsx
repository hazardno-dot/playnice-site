import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import "./orders-manager.css";

const STATUS_LABELS = {
  NEW: "New",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  DELIVERY_FAILED: "Delivery failed",
  RETURNED: "Returned",
  CANCELLED: "Cancelled",
  DUPLICATE: "Duplicate"
};

const money = (value) => {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number.toLocaleString("en-IE", { style: "currency", currency: "EUR" }) : "€0.00";
};

const dateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("sr-ME", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

async function sessionToken() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) throw error || new Error("Authenticated admin session is required.");
  return data.session.access_token;
}

async function ordersApi(method = "GET", body = null) {
  const token = await sessionToken();
  const response = await fetch("/api/orders", {
    method,
    headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Orders request failed (" + response.status + ").");
  return payload;
}

function itemSummary(items) {
  if (!Array.isArray(items) || !items.length) return "No items";
  return items.map((item) => {
    const qty = Number(item?.quantity || 1);
    const size = item?.size ? " · " + item.size : "";
    return String(item?.name || "Item") + size + (qty > 1 ? " × " + qty : "");
  }).join(", ");
}

function syncLabel(order) {
  const status = order?.sheet_state_sync_status || "synced";
  if (status === "failed") return "Backup sync failed";
  if (status === "pending") return "Backup sync pending";
  return "Google backup synced";
}

function OrdersWorkspace() {
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [writeEnabled, setWriteEnabled] = useState(false);
  const [tracking, setTracking] = useState("");

  const absorb = (payload) => {
    const nextOrders = Array.isArray(payload?.orders) ? payload.orders : [];
    setOrders(nextOrders);
    setEvents(Array.isArray(payload?.events) ? payload.events : []);
    setWriteEnabled(Boolean(payload?.write_enabled));
    setSelectedId((current) => nextOrders.some((order) => order.id === current) ? current : (nextOrders[0]?.id || ""));
  };

  const load = async () => {
    setLoading(true); setError(""); setNotice("");
    try { absorb(await ordersApi("GET")); }
    catch (loadError) { setError(loadError.message || String(loadError)); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const selected = orders.find((order) => order.id === selectedId) || null;
  useEffect(() => { setTracking(selected?.tracking_number || ""); }, [selected?.id, selected?.tracking_number]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return orders.filter((order) => {
      if (statusFilter !== "ALL" && order.status !== statusFilter) return false;
      if (!needle) return true;
      const payload = order.source_payload || {};
      const haystack = [
        order.order_id, order.tracking_number, payload.fullName, payload.city, payload.phone,
        itemSummary(payload.items)
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(needle);
    });
  }, [orders, query, statusFilter]);

  const counts = useMemo(() => {
    const result = { ALL: orders.length };
    for (const order of orders) result[order.status] = (result[order.status] || 0) + 1;
    return result;
  }, [orders]);

  const saleOrders = useMemo(() => orders.filter((order) => order.status !== "DUPLICATE" && order.origin !== "regression_test"), [orders]);
  const codPending = useMemo(() => saleOrders.reduce((sum, order) => {
    if (order.courier_payment_status !== "PENDING") return sum;
    return sum + Number(order.source_payload?.total || 0);
  }, 0), [saleOrders]);
  const selectedEvents = useMemo(() => events.filter((event) => event.order_id === selectedId), [events, selectedId]);

  const mutate = async (body, key) => {
    setBusy(key); setError(""); setNotice("");
    try {
      const result = await ordersApi("POST", body);
      absorb(result);
      if (result?.mirror_warning) setNotice(result.mirror_warning);
    } catch (actionError) {
      setError(actionError.message || String(actionError));
    } finally {
      setBusy("");
    }
  };

  const payload = selected?.source_payload || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const editable = Boolean(writeEnabled && selected && selected.status !== "DUPLICATE");
  const nextStatus = selected?.status === "NEW" ? "PACKED" : selected?.status === "PACKED" ? "SHIPPED" : null;

  const saveTracking = () => mutate({ action: "save_tracking", id: selected.id, tracking_number: tracking }, "tracking");
  const setStatus = (status) => mutate({ action: "set_status", id: selected.id, status }, "status:" + status);
  const setPayment = (status) => mutate({ action: "set_courier_payment", id: selected.id, status }, "payment");
  const retrySync = () => mutate({ action: "retry_sheet_sync", id: selected.id }, "retry");
  const setDeliveryIssue = (delivery_issue) => mutate({ action: "set_delivery_issue", id: selected.id, delivery_issue }, "delivery:" + delivery_issue);

  return <section className="orders-manager">
    <div className="orders-banner">
      <div>
        <span>OPERATIONS / ORDERS</span>
        <h2>Fulfillment desk</h2>
        <p>Pack, ship, track and settle COD orders from one operational view.</p>
      </div>
      <button type="button" onClick={load} disabled={loading || Boolean(busy)}>{loading ? "Loading…" : "Refresh"}</button>
    </div>

    {error ? <div className="orders-error">{error}</div> : null}
    {notice ? <div className="orders-warning">{notice}</div> : null}

    <div className={writeEnabled ? "orders-write-mode active" : "orders-write-mode"}>
      <strong>{writeEnabled ? "WRITE-THROUGH ACTIVE" : "READ-ONLY MIGRATION PHASE"}</strong>
      <span>{writeEnabled
        ? "Supabase is primary. Every Control Center change is mirrored to Google Sheets and sync failures stay visible."
        : "Supabase is canonical. Operational edits remain in Google Sheets until the write-through mirror is configured."}</span>
    </div>

    <div className="orders-kpis">
      <div><span>ALL RECORDS</span><strong>{orders.length}</strong><small>{saleOrders.length} sales · {counts.DUPLICATE || 0} duplicate</small></div>
      <div><span>NEW</span><strong>{counts.NEW || 0}</strong><small>waiting to pack</small></div>
      <div><span>PACKED</span><strong>{counts.PACKED || 0}</strong><small>ready for courier</small></div>
      <div><span>IN TRANSIT</span><strong>{(counts.SHIPPED || 0) + (counts.OUT_FOR_DELIVERY || 0)}</strong><small>shipped / delivery</small></div>
      <div><span>DELIVERED</span><strong>{counts.DELIVERED || 0}</strong><small>completed orders</small></div>
      <div><span>COD PENDING</span><strong>{money(codPending)}</strong><small>courier settlement</small></div>
    </div>

    <div className="orders-toolbar">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, city, tracking, product…" />
      <div className="orders-status-filters">
        {["ALL","NEW","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","DELIVERY_FAILED","RETURNED","CANCELLED","DUPLICATE"].map((status) =>
          <button type="button" key={status} className={statusFilter === status ? "active" : ""} onClick={() => setStatusFilter(status)}>
            {status === "ALL" ? "All" : STATUS_LABELS[status]} <em>{counts[status] || 0}</em>
          </button>
        )}
      </div>
    </div>

    <div className="orders-layout">
      <div className="orders-list-panel">
        <div className="orders-list-head"><strong>{filtered.length} orders</strong><span>{statusFilter === "ALL" ? "All statuses" : STATUS_LABELS[statusFilter]}</span></div>
        <div className="orders-list">
          {loading ? <div className="orders-empty">Loading orders…</div> : filtered.length ? filtered.map((order) => {
            const data = order.source_payload || {};
            return <button type="button" key={order.id} className={"orders-row " + (selectedId === order.id ? "active" : "")} onClick={() => setSelectedId(order.id)}>
              <div className="orders-row-main"><strong>{order.order_id}</strong><span>{data.fullName || "Customer"} · {data.city || "—"}</span><small>{itemSummary(data.items)}</small></div>
              <div className="orders-row-side"><strong>{money(data.total)}</strong><span className={"order-status status-" + String(order.status || "").toLowerCase()}>{STATUS_LABELS[order.status] || order.status}</span><time>{dateTime(order.created_at)}</time></div>
            </button>;
          }) : <div className="orders-empty">No orders match this filter.</div>}
        </div>
      </div>

      <div className="orders-detail-panel">
        {!selected ? <div className="orders-empty">Select an order.</div> : <>
          <div className="orders-detail-head">
            <div><span>ORDER</span><h3>{selected.order_id}</h3><p>{dateTime(selected.created_at)}</p></div>
            <span className={"order-status large status-" + String(selected.status || "").toLowerCase()}>{STATUS_LABELS[selected.status] || selected.status}</span>
          </div>

          <div className="orders-detail-grid">
            <section>
              <span>CUSTOMER</span>
              <strong>{payload.fullName || "—"}</strong>
              <p>{payload.phone || "—"}</p>
              <p>{payload.email || "—"}</p>
              <p>{payload.address || "—"}, {payload.city || "—"}</p>
            </section>
            <section>
              <span>ORDER TOTAL</span>
              <strong>{money(payload.total)}</strong>
              <p>Subtotal {money(payload.subtotal)}</p>
              <p>Shipping {money(payload.shipping)}</p>
              <p>{payload.orderSource || payload.source || "webshop"}</p>
            </section>
          </div>

          <section className="orders-items">
            <div className="orders-section-title"><span>ITEMS</span><strong>{items.length}</strong></div>
            {items.map((item, index) => <div className="orders-item" key={String(item?.name || "item") + index}>
              <div><strong>{item?.name || "Item"}</strong><span>{item?.size || "—"} · qty {Number(item?.quantity || 1)}</span></div>
              <strong>{money(Number(item?.price || 0) * Number(item?.quantity || 1))}</strong>
            </div>)}
          </section>

          <section className="orders-tracking">
            <div className="orders-section-title"><span>TRACKING</span><strong>{selected.tracking_number || "Not set"}</strong></div>
            {editable ? <div><input value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="Tracking number" /><button type="button" onClick={saveTracking} disabled={Boolean(busy)}>{busy === "tracking" ? "Saving…" : "Save tracking"}</button></div>
              : <div className="orders-readonly-value">{selected.tracking_number || "No tracking number recorded"}</div>}
          </section>

          <section className="orders-actions">
            <div className="orders-section-title"><span>FULFILLMENT ACTIONS</span><strong>Write-through v1</strong></div>
            <div className="orders-action-row">
              {editable && selected.status === "PACKED" ? <button type="button" onClick={() => setStatus("NEW")} disabled={Boolean(busy)}>{busy === "status:NEW" ? "Updating…" : "Return to new"}</button> : null}
              {editable && nextStatus ? <button type="button" className="primary" onClick={() => setStatus(nextStatus)} disabled={Boolean(busy)}>
                {busy === "status:" + nextStatus ? "Updating…" : nextStatus === "PACKED" ? "Mark packed" : "Mark shipped"}
              </button> : null}
              {editable && ["NEW","PACKED"].includes(selected.status) ? <button type="button" className="danger" onClick={() => setStatus("CANCELLED")} disabled={Boolean(busy)}>Cancel order</button> : null}
              {editable && selected.status === "SHIPPED" ? <button type="button" className="danger" onClick={() => setStatus("DELIVERY_FAILED")} disabled={Boolean(busy)}>{busy === "status:DELIVERY_FAILED" ? "Updating…" : "Mark delivery failed"}</button> : null}
              {editable && selected.status === "DELIVERY_FAILED" ? <button type="button" onClick={() => setStatus("SHIPPED")} disabled={Boolean(busy)}>{busy === "status:SHIPPED" ? "Updating…" : "Return to shipped"}</button> : null}
              {selected.status === "SHIPPED" ? <span className="orders-action-note">Extended delivery lifecycle stays locked until the remaining legacy delivery automation is migrated.</span> : null}
            </div>
          </section>

          <section className="orders-delivery">
            <div className="orders-section-title"><span>DELIVERY ISSUE</span><strong>{selected.delivery_issue || "None"}</strong></div>
            {["SHIPPED","DELIVERY_FAILED"].includes(selected.status) ? <div className="orders-action-row">
              {["UNREACHABLE","REFUSED","RETURNED","RESOLVED"].map((issue) =>
                <button type="button" key={issue} className={selected.delivery_issue === issue ? "primary" : ""} onClick={() => setDeliveryIssue(issue)} disabled={!editable || Boolean(busy)}>
                  {busy === "delivery:" + issue ? "Updating…" : issue}
                </button>
              )}
            </div> : <div className="orders-readonly-value">Delivery issue controls are available after shipment.</div>}
            <div className="orders-delivery-note">
              {selected.delivery_issue === "UNREACHABLE"
                ? (selected.delivery_alert_email_status === "YES" ? "Customer alert email sent." : selected.delivery_alert_email_status === "NO_EMAIL" ? "No customer email available." : "UNREACHABLE will trigger the existing customer alert email.")
                : "Only UNREACHABLE triggers the existing customer alert email."}
            </div>
          </section>

          <section className="orders-payment">
            <div className="orders-section-title"><span>COURIER / COD</span><strong>{selected.courier_payment_status || "N/A"}</strong></div>
            <div className="orders-payment-row">
              <div>
                <strong>{money(payload.total)}</strong>
                <span>{selected.courier_payment_status === "PAID"
                  ? "Courier payout received " + dateTime(selected.courier_paid_at)
                  : selected.courier_payment_status === "PENDING"
                    ? "Waiting for courier payout"
                    : "No courier payout tracking for this historical order"}</span>
              </div>
              {editable && ["PENDING","PAID"].includes(selected.courier_payment_status) ? <button type="button" onClick={() => setPayment(selected.courier_payment_status === "PAID" ? "PENDING" : "PAID")} disabled={Boolean(busy)}>
                {busy === "payment" ? "Updating…" : selected.courier_payment_status === "PAID" ? "Mark pending" : "Mark paid"}
              </button> : null}
            </div>
          </section>

          <section className="orders-sync">
            <div className="orders-section-title"><span>GOOGLE BACKUP</span><strong className={"orders-sync-state " + (selected.sheet_state_sync_status || "synced")}>{syncLabel(selected)}</strong></div>
            <div className="orders-sync-row">
              <span>{selected.sheet_state_sync_status === "failed" ? selected.sheet_state_sync_error || "Last backup sync failed." : selected.sheet_state_synced_at ? "Last synced " + dateTime(selected.sheet_state_synced_at) : "Historical parity confirmed."}</span>
              {writeEnabled && selected.sheet_state_sync_status === "failed" ? <button type="button" onClick={retrySync} disabled={Boolean(busy)}>{busy === "retry" ? "Retrying…" : "Retry backup sync"}</button> : null}
            </div>
          </section>

          <section className="orders-source">
            <div className="orders-section-title"><span>RECORD SOURCE</span><strong>{selected.origin === "google_sheets_canonical" ? "Canonical import" : selected.origin || "Supabase"}</strong></div>
            <div className="orders-readonly-value">{selected.legacy_sheet_row ? "Google Sheets Orders row " + selected.legacy_sheet_row : "Supabase-native order"}</div>
          </section>

          <section className="orders-timeline">
            <div className="orders-section-title"><span>ORDER TIMELINE</span><strong>{selectedEvents.length} events</strong></div>
            <div className="orders-timeline-list">
              {selectedEvents.map((event) => <div className="orders-timeline-row" key={event.id}>
                <i></i><div><strong>{STATUS_LABELS[event.status] || event.status}</strong><span>{event.source === "google_sheets_canonical_import" ? "Imported from Google Sheets" : event.source === "backfill" ? "Initial imported state" : "Control Center"}</span></div><time>{dateTime(event.created_at)}</time>
              </div>)}
            </div>
          </section>
        </>}
      </div>
    </div>
  </section>;
}

export default function OrdersManager() {
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;

    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1");
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading?.textContent?.trim() !== "Orders") {
        setSlot(null);
        return;
      }
      placeholder.classList.add("orders-module-active");
      let nextSlot = placeholder.querySelector("#orders-manager-slot");
      if (!nextSlot) {
        nextSlot = document.createElement("div");
        nextSlot.id = "orders-manager-slot";
        nextSlot.className = "orders-manager-slot";
        placeholder.appendChild(nextSlot);
      }
      setSlot(nextSlot);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return slot ? createPortal(<OrdersWorkspace />, slot) : null;
}
