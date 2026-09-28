import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import ManualOrderDialog from "./ManualOrderDialog";
import { products } from "@shop/data/products/index.js";
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

const giftProducts = [...products].sort((a, b) => String(a.name).localeCompare(String(b.name)));

function normalizeCustomerKey(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "");
}

function parseLegacyGift(value) {
  const text = String(value || "").trim();
  if (!text) return { sampleName: "", sampleSize: "2ml", extraGift: "" };
  const match = text.match(/^(.*?)\s*[-–—]\s*([0-9]+(?:\.[0-9]+)?\s*ml)(?:\s*\+\s*(.*))?$/i);
  if (!match) return { sampleName: "", sampleSize: "2ml", extraGift: text };
  return {
    sampleName: String(match[1] || "").trim(),
    sampleSize: String(match[2] || "2ml").replace(/\s+/g, ""),
    extraGift: String(match[3] || "").trim()
  };
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
  const [settlementSelection, setSettlementSelection] = useState([]);
  const [manualOrderOpen, setManualOrderOpen] = useState(false);
  const [giftSampleName, setGiftSampleName] = useState("");
  const [giftSampleSize, setGiftSampleSize] = useState("2ml");
  const [giftExtra, setGiftExtra] = useState("");

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
  useEffect(() => {
    const data = selected?.source_payload || {};
    const sample = Array.isArray(data.giftSamples) ? data.giftSamples[0] : null;
    const extra = Array.isArray(data.giftExtras) ? data.giftExtras[0] : "";
    const legacy = parseLegacyGift(data.freeGift);
    setGiftSampleName(sample?.name || legacy.sampleName || "");
    setGiftSampleSize(sample?.size || legacy.sampleSize || "2ml");
    setGiftExtra(extra || legacy.extraGift || "");
  }, [selected?.id, selected?.source_payload?.freeGift]);

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
  const settlementEligible = useMemo(() => saleOrders.filter((order) =>
    ["SHIPPED","OUT_FOR_DELIVERY","DELIVERED"].includes(order.status) &&
    order.courier_payment_status === "PENDING"
  ), [saleOrders]);
  const codPending = useMemo(() => settlementEligible.reduce((sum, order) =>
    sum + Number(order.source_payload?.total || 0), 0
  ), [settlementEligible]);
  const settlementSelectedOrders = useMemo(() => settlementEligible.filter((order) =>
    settlementSelection.includes(order.id)
  ), [settlementEligible, settlementSelection]);
  const settlementSelectedTotal = useMemo(() => settlementSelectedOrders.reduce((sum, order) =>
    sum + Number(order.source_payload?.total || 0), 0
  ), [settlementSelectedOrders]);
  const settlementHistory = useMemo(() => {
    const batches = new Map();
    for (const order of saleOrders) {
      if (order.courier_payment_status !== "PAID" || !order.courier_batch_id) continue;
      const current = batches.get(order.courier_batch_id) || {
        batch_id: order.courier_batch_id,
        paid_at: order.courier_paid_at,
        orders: [],
        total: 0
      };
      current.orders.push(order);
      current.total += Number(order.source_payload?.total || 0);
      if (!current.paid_at || (order.courier_paid_at && order.courier_paid_at > current.paid_at)) current.paid_at = order.courier_paid_at;
      batches.set(order.courier_batch_id, current);
    }
    return [...batches.values()].sort((a, b) => String(b.paid_at || "").localeCompare(String(a.paid_at || "")));
  }, [saleOrders]);
  const legacyPaidCount = useMemo(() => saleOrders.filter((order) =>
    order.courier_payment_status === "PAID" && !order.courier_batch_id
  ).length, [saleOrders]);
  const selectedEvents = useMemo(() => events.filter((event) => event.order_id === selectedId), [events, selectedId]);
  const giftEditable = Boolean(writeEnabled && selected?.status === "NEW");
  const savedGift = useMemo(() => {
    const data = selected?.source_payload || {};
    const sample = Array.isArray(data.giftSamples) ? data.giftSamples[0] : null;
    const extra = Array.isArray(data.giftExtras) ? data.giftExtras[0] : "";
    const legacy = parseLegacyGift(data.freeGift);
    return {
      sampleName: sample?.name || legacy.sampleName || "",
      sampleSize: sample?.size || legacy.sampleSize || "2ml",
      extraGift: extra || legacy.extraGift || ""
    };
  }, [selected?.id, selected?.source_payload?.freeGift]);
  const giftChanged =
    giftSampleName !== savedGift.sampleName ||
    giftSampleSize !== savedGift.sampleSize ||
    giftExtra !== savedGift.extraGift;
  const customerGiftHistory = useMemo(() => {
    if (!selected) return [];
    const current = selected.source_payload || {};
    const emailKey = normalizeCustomerKey(current.email);
    const phoneKey = String(current.phone || "").replace(/\D/g, "").slice(-8);
    return orders.filter((order) => {
      if (order.id === selected.id || order.status === "DUPLICATE") return false;
      const data = order.source_payload || {};
      if (!String(data.freeGift || "").trim()) return false;
      const sameEmail = emailKey && normalizeCustomerKey(data.email) === emailKey;
      const samePhone = phoneKey && String(data.phone || "").replace(/\D/g, "").slice(-8) === phoneKey;
      return sameEmail || samePhone;
    }).map((order) => ({
      order_id: order.order_id,
      created_at: order.created_at,
      freeGift: order.source_payload?.freeGift || ""
    })).sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  }, [orders, selected]);

  const mutate = async (body, key) => {
    setBusy(key); setError(""); setNotice("");
    try {
      const result = await ordersApi("POST", body);
      absorb(result);
      if (key === "settlement") setSettlementSelection([]);
      if (result?.mirror_warning) setNotice(result.mirror_warning);
      else if (result?.settlement?.batch_id) {
        setNotice("Courier settlement " + result.settlement.batch_id + " recorded · " + money(result.settlement.total) + ".");
      }
    } catch (actionError) {
      setError(actionError.message || String(actionError));
    } finally {
      setBusy("");
    }
  };

  const payload = selected?.source_payload || {};
  const items = Array.isArray(payload.items) ? payload.items : [];
  const editable = Boolean(writeEnabled && selected && selected.status !== "DUPLICATE");
  const nextStatus =
    selected?.status === "NEW" ? "PACKED" :
    selected?.status === "PACKED" ? "SHIPPED" :
    selected?.status === "SHIPPED" ? "OUT_FOR_DELIVERY" :
    selected?.status === "OUT_FOR_DELIVERY" ? "DELIVERED" :
    null;

  const setStatus = (status) => mutate({ action: "set_status", id: selected.id, status }, "status:" + status);
  const setPayment = (status) => mutate({ action: "set_courier_payment", id: selected.id, status }, "payment");
  const settleSelected = () => {
    if (!settlementSelection.length) return;
    const confirmed = window.confirm(
      "Record courier payout for " + settlementSelection.length + " order" +
      (settlementSelection.length === 1 ? "" : "s") + " · " + money(settlementSelectedTotal) +
      "?\n\nThis creates a settlement batch and marks the selected orders as PAID."
    );
    if (!confirmed) return;
    mutate({ action: "settle_courier_batch", order_ids: settlementSelection }, "settlement");
  };
  const toggleSettlement = (id) => setSettlementSelection((current) =>
    current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
  );
  const toggleAllSettlement = () => setSettlementSelection((current) =>
    current.length === settlementEligible.length ? [] : settlementEligible.map((order) => order.id)
  );
  const retrySync = () => mutate({ action: "retry_sheet_sync", id: selected.id }, "retry");
  const setDeliveryIssue = (delivery_issue) => mutate({ action: "set_delivery_issue", id: selected.id, delivery_issue }, "delivery:" + delivery_issue);
  const saveGiftSample = () => mutate({
    action: "set_gift_sample",
    id: selected.id,
    sample_name: giftSampleName,
    sample_size: giftSampleName ? giftSampleSize : "",
    extra_gift: giftExtra
  }, "gift");

  const printLabel = () => {
    if (!selected || selected.status === "DUPLICATE") return;
    const data = selected.source_payload || {};
    const labelOrder = {
      orderId: selected.order_id,
      timestamp: selected.shipped_at || selected.packed_at || selected.created_at,
      fullName: data.fullName || "",
      address: data.address || "",
      city: data.city || "",
      phone: data.phone || "",
      note: data.note || "",
      items: Array.isArray(data.items) ? data.items : [],
      subtotal: Number(data.subtotal || 0),
      shipping: Number(data.shipping || 0),
      trackingNumber: selected.tracking_number || selected.order_id
    };

    try {
      window.localStorage.setItem("PLAYNICE_CC_LABEL_ORDER", JSON.stringify(labelOrder));
      const popup = window.open("/PlayNice-Label-Generator.html?cc=1", "_blank");
      if (!popup) setError("Label window was blocked by the browser. Allow pop-ups for Control Center and try again.");
    } catch (labelError) {
      setError(labelError?.message || "Could not prepare the shipping label.");
    }
  };

  const createManualOrder = async (order) => {
    setBusy("manual:create"); setError(""); setNotice("");
    try {
      const result = await ordersApi("POST", { action: "create_manual_order", order });
      absorb(result);
      const recordId = result?.manual_order?.record_id;
      if (recordId) setSelectedId(recordId);
      setManualOrderOpen(false);
      const created = result?.manual_order;
      if (created?.duplicate) {
        setNotice("Identical manual order already existed · " + created.order_id + ". Existing order selected.");
      } else {
        setNotice("Manual order " + created?.order_id + " created · " + money(created?.total) + ". Google Sheets backup sync is queued.");
      }
    } catch (actionError) {
      setError(actionError.message || String(actionError));
      throw actionError;
    } finally {
      setBusy("");
    }
  };

  return <section className="orders-manager">
    <div className="orders-banner">
      <div>
        <span>OPERATIONS / ORDERS</span>
        <h2>Fulfillment desk</h2>
        <p>Pack, ship, track and settle COD orders from one operational view.</p>
      </div>
      <div className="orders-banner-actions">
        <button type="button" className="primary" onClick={() => setManualOrderOpen(true)} disabled={!writeEnabled || loading || Boolean(busy)}>+ Create order</button>
        <button type="button" onClick={load} disabled={loading || Boolean(busy)}>{loading ? "Loading…" : "Refresh"}</button>
      </div>
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
      <div><span>ALL RECORDS</span><strong>{orders.length}</strong><small>{saleOrders.length} orders · {counts.DUPLICATE || 0} duplicate</small></div>
      <div><span>NEW</span><strong>{counts.NEW || 0}</strong><small>waiting to pack</small></div>
      <div><span>PACKED</span><strong>{counts.PACKED || 0}</strong><small>ready for courier</small></div>
      <div><span>IN TRANSIT</span><strong>{(counts.SHIPPED || 0) + (counts.OUT_FOR_DELIVERY || 0)}</strong><small>shipped / delivery</small></div>
      <div><span>DELIVERED</span><strong>{counts.DELIVERED || 0}</strong><small>completed orders</small></div>
      <div><span>FAILED</span><strong>{counts.DELIVERY_FAILED || 0}</strong><small>delivery failed</small></div>
      <div><span>COD PENDING</span><strong>{money(codPending)}</strong><small>courier settlement</small></div>
    </div>

    <section className="orders-settlement">
      <div className="orders-settlement-head">
        <div>
          <span>COURIER SETTLEMENT V1</span>
          <h3>COD payout desk</h3>
          <p>Courier payout confirms delivery when live courier status is unavailable. Settling a shipped order marks it delivered and paid in one step.</p>
        </div>
        <div className="orders-settlement-summary">
          <strong>{money(codPending)}</strong>
          <span>{settlementEligible.length} pending COD order{settlementEligible.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      {settlementEligible.length ? <div className="orders-settlement-body">
        <div className="orders-settlement-actions">
          <button type="button" onClick={toggleAllSettlement} disabled={!writeEnabled || Boolean(busy)}>
            {settlementSelection.length === settlementEligible.length ? "Clear selection" : "Select all"}
          </button>
          <div><span>SELECTED</span><strong>{settlementSelection.length} · {money(settlementSelectedTotal)}</strong></div>
          <button type="button" className="primary" onClick={settleSelected} disabled={!writeEnabled || !settlementSelection.length || Boolean(busy)}>
            {busy === "settlement" ? "Recording…" : "Record courier payout"}
          </button>
        </div>
        <div className="orders-settlement-list">
          {settlementEligible.map((order) => {
            const data = order.source_payload || {};
            const checked = settlementSelection.includes(order.id);
            return <label key={order.id} className={checked ? "selected" : ""}>
              <input type="checkbox" checked={checked} onChange={() => toggleSettlement(order.id)} disabled={!writeEnabled || Boolean(busy)} />
              <div><strong>{order.order_id}</strong><span>{data.fullName || "Customer"} · {data.city || "—"}</span></div>
              <strong>{money(data.total)}</strong>
            </label>;
          })}
        </div>
      </div> : <div className="orders-settlement-empty">No shipped or delivered COD orders are waiting for courier payout.</div>}

      <details className="orders-settlement-history">
        <summary>Settlement history <strong>{settlementHistory.length}</strong></summary>
        <div>
          {settlementHistory.length ? settlementHistory.map((batch) => <div className="orders-settlement-batch" key={batch.batch_id}>
            <div><strong>{batch.batch_id}</strong><span>{dateTime(batch.paid_at)} · {batch.orders.length} order{batch.orders.length === 1 ? "" : "s"}</span></div>
            <strong>{money(batch.total)}</strong>
          </div>) : <div className="orders-settlement-empty">No v1 settlement batches recorded yet.</div>}
          {legacyPaidCount ? <div className="orders-settlement-legacy">{legacyPaidCount} earlier paid order{legacyPaidCount === 1 ? "" : "s"} remain as legacy individual settlements.</div> : null}
        </div>
      </details>
    </section>

    <div className="orders-toolbar">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, city, tracking, product…" />
      <div className="orders-status-filters">
        {["ALL","NEW","PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","DELIVERY_FAILED","RETURNED","CANCELLED","DUPLICATE"].map((status) =>
          <button type="button" key={status} className={`filter-status filter-status-${status.toLowerCase()} ${statusFilter === status ? "active" : ""}`} onClick={() => setStatusFilter(status)}>
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
            return <button type="button" key={order.id} className={`orders-row status-row-${String(order.status || "").toLowerCase()} ${selectedId === order.id ? "active" : ""}`} onClick={() => setSelectedId(order.id)}>
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
            <div className="orders-detail-head-actions">
              <button type="button" onClick={printLabel} disabled={selected.status === "DUPLICATE"}>Print label</button>
              <span className={"order-status large status-" + String(selected.status || "").toLowerCase()}>{STATUS_LABELS[selected.status] || selected.status}</span>
            </div>
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

          <section className="orders-gift">
            <div className="orders-section-title">
              <span>GIFT / SAMPLE</span>
              <strong>{payload.freeGift || "None"}</strong>
            </div>
            <div className="orders-gift-editor">
              <label>
                <span>SAMPLE FRAGRANCE</span>
                <input
                  list="orders-gift-products"
                  value={giftSampleName}
                  onChange={(event) => setGiftSampleName(event.target.value)}
                  placeholder="Search fragrance…"
                  disabled={!giftEditable || Boolean(busy)}
                />
                <datalist id="orders-gift-products">
                  {giftProducts.map((product) => <option value={product.name} key={product.slug} />)}
                </datalist>
              </label>
              <label>
                <span>SAMPLE SIZE</span>
                <select value={giftSampleSize} onChange={(event) => setGiftSampleSize(event.target.value)} disabled={!giftEditable || !giftSampleName || Boolean(busy)}>
                  {["2ml","5ml","10ml","20ml"].map((size) => <option value={size} key={size}>{size}</option>)}
                </select>
              </label>
              <label>
                <span>EXTRA GIFT</span>
                <input value={giftExtra} onChange={(event) => setGiftExtra(event.target.value)} placeholder="e.g. olovka" disabled={!giftEditable || Boolean(busy)} />
              </label>
              <button type="button" className="primary" onClick={saveGiftSample} disabled={!giftEditable || !giftChanged || Boolean(busy)}>
                {busy === "gift" ? "Saving…" : giftEditable ? "Save gift" : "Gift locked"}
              </button>
            </div>
            {!giftEditable && selected?.status !== "NEW" ? <div className="orders-gift-lock-note">Gift/sample is locked once the order is packed.</div> : null}
            <div className="orders-gift-preview">
              <span>CURRENT RECORD</span>
              <strong>{giftSampleName ? giftSampleName + " - " + giftSampleSize + (giftExtra ? " + " + giftExtra : "") : (giftExtra || "No gift recorded")}</strong>
            </div>
            <details className="orders-gift-history">
              <summary>Customer sample history <strong>{customerGiftHistory.length}</strong></summary>
              <div>
                {customerGiftHistory.length ? customerGiftHistory.map((entry) => <div key={entry.order_id}>
                  <span>{entry.order_id} · {dateTime(entry.created_at)}</span>
                  <strong>{entry.freeGift}</strong>
                </div>) : <p>No earlier gift/sample recorded for this customer.</p>}
              </div>
            </details>
          </section>

          <section className="orders-tracking">
            <div className="orders-section-title"><span>ORDER REFERENCE</span><strong>{selected.tracking_number || "Not set"}</strong></div>
            <div className="orders-readonly-value">
              {selected.tracking_number || "No internal order reference recorded"}
            </div>
          </section>

          <section className="orders-actions">
            <div className="orders-section-title"><span>FULFILLMENT ACTIONS</span><strong>Write-through v1</strong></div>
            <div className="orders-action-row">
              {editable && selected.status === "PACKED" ? <button type="button" onClick={() => setStatus("NEW")} disabled={Boolean(busy)}>{busy === "status:NEW" ? "Updating…" : "Return to new"}</button> : null}
              {editable && selected.status === "OUT_FOR_DELIVERY" ? <button type="button" onClick={() => setStatus("SHIPPED")} disabled={Boolean(busy)}>{busy === "status:SHIPPED" ? "Updating…" : "Return to shipped"}</button> : null}
              {editable && nextStatus ? <button type="button" className="primary" onClick={() => setStatus(nextStatus)} disabled={Boolean(busy)}>
                {busy === "status:" + nextStatus ? "Updating…" :
                  nextStatus === "PACKED" ? "Mark packed" :
                  nextStatus === "SHIPPED" ? "Mark shipped" :
                  nextStatus === "OUT_FOR_DELIVERY" ? "Out for delivery" :
                  "Mark delivered"}
              </button> : null}
              {editable && ["NEW","PACKED"].includes(selected.status) ? <button type="button" className="danger" onClick={() => setStatus("CANCELLED")} disabled={Boolean(busy)}>Cancel order</button> : null}
              {editable && ["SHIPPED","OUT_FOR_DELIVERY"].includes(selected.status) ? <button type="button" className="danger" onClick={() => setStatus("DELIVERY_FAILED")} disabled={Boolean(busy)}>{busy === "status:DELIVERY_FAILED" ? "Updating…" : "Mark delivery failed"}</button> : null}
              {editable && selected.status === "DELIVERY_FAILED" ? <button type="button" className="primary" onClick={() => setStatus("OUT_FOR_DELIVERY")} disabled={Boolean(busy)}>{busy === "status:OUT_FOR_DELIVERY" ? "Updating…" : "Retry delivery"}</button> : null}
              {editable && selected.status === "DELIVERY_FAILED" ? <button type="button" className="danger" onClick={() => setStatus("RETURNED")} disabled={Boolean(busy)}>{busy === "status:RETURNED" ? "Updating…" : "Mark returned"}</button> : null}
              {["DELIVERED","RETURNED"].includes(selected.status) ? <span className="orders-action-note">Terminal fulfillment state. Further changes require a corrective workflow.</span> : null}
            </div>
          </section>

          <section className="orders-delivery">
            <div className="orders-section-title"><span>DELIVERY ISSUE</span><strong>{selected.delivery_issue || "None"}</strong></div>
            {["SHIPPED","OUT_FOR_DELIVERY","DELIVERY_FAILED"].includes(selected.status) ? <div className="orders-action-row">
              {["UNREACHABLE","REFUSED","RETURNED","RESOLVED"].map((issue) =>
                <button type="button" key={issue} className={selected.delivery_issue === issue ? "primary" : ""} onClick={() => setDeliveryIssue(issue)} disabled={!editable || Boolean(busy)}>
                  {busy === "delivery:" + issue ? "Updating…" : issue}
                </button>
              )}
            </div> : <div className="orders-readonly-value">Delivery issue controls are available while the order is in the delivery lifecycle.</div>}
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
              {editable && selected.courier_payment_status === "PAID" && !selected.courier_batch_id ? <button type="button" onClick={() => setPayment("PENDING")} disabled={Boolean(busy)}>
                {busy === "payment" ? "Updating…" : "Mark pending"}
              </button> : null}
              {selected.courier_payment_status === "PAID" && selected.courier_batch_id
                ? <span className="orders-action-note">Settled in batch {selected.courier_batch_id}. Batch settlements stay locked per order.</span>
                : selected.status === "DELIVERED" && selected.courier_payment_status === "PENDING"
                  ? <span className="orders-action-note">Use Courier Settlement v1 above to record this payout.</span>
                  : null}
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
    <ManualOrderDialog
      open={manualOrderOpen}
      busy={busy === "manual:create"}
      onClose={() => { if (busy !== "manual:create") setManualOrderOpen(false); }}
      onCreate={createManualOrder}
    />
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
