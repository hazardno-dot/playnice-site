import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import { supabase } from "./supabase";
import "./analytics-manager.css";

const money = (value) => Number(value || 0).toLocaleString("en-IE", { style: "currency", currency: "EUR" });
const number = (value, digits = 0) => Number(value || 0).toLocaleString("en-IE", { maximumFractionDigits: digits });
const percent = (value) => number(value, 1) + "%";

async function loadOrderAnalytics() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data?.session?.access_token) throw error || new Error("Authenticated admin session is required.");
  const response = await fetch("/api/orders?view=analytics", {
    headers: { Authorization: "Bearer " + data.session.access_token }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || "Could not load order analytics.");
  return payload.analytics || {};
}

export default function AnalyticsManager() {
  const [slot, setSlot] = useState(null);
  const [module, setModule] = useState("Commerce");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ orderAnalytics: {} });
  const [inventoryProduct, setInventoryProduct] = useState("");
  const [inventoryMl, setInventoryMl] = useState("");
  const [inventoryNote, setInventoryNote] = useState("");
  const [inventoryBusy, setInventoryBusy] = useState(false);
  const [inventoryNotice, setInventoryNotice] = useState("");

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1")?.textContent?.trim();
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || !["Commerce", "Inventory", "Conversion"].includes(heading)) { setSlot(null); return; }
      setModule(heading);
      let nextSlot = placeholder.querySelector("#analytics-manager-slot");
      if (!nextSlot) {
        placeholder.classList.add("analytics-module-active");
        nextSlot = document.createElement("div");
        nextSlot.id = "analytics-manager-slot";
        nextSlot.className = "analytics-manager-slot";
        placeholder.appendChild(nextSlot);
      }
      setSlot(nextSlot);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!slot) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const orderAnalytics = await loadOrderAnalytics();
        if (cancelled) return;
        setData({ orderAnalytics });
        setError("");
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || String(loadError));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [slot]);

  const sales = data.orderAnalytics?.summary || {};
  const monthlySales = data.orderAnalytics?.monthly || [];
  const topProducts = data.orderAnalytics?.top_products || [];
  const salesByCity = data.orderAnalytics?.cities || [];
  const salesBySize = data.orderAnalytics?.sizes || [];
  const salesBySource = data.orderAnalytics?.sources || [];
  const fullBottles = data.orderAnalytics?.full_bottles || [];
  const giftProducts = data.orderAnalytics?.gifts || [];
  const inventory = data.orderAnalytics?.inventory || {};
  const inventoryRows = inventory.rows || [];
  const inventoryTrackedNames = new Set(inventoryRows.map((row) => String(row.product_name || "").toLowerCase()));
  const inventoryIsTracked = inventoryTrackedNames.has(String(inventoryProduct || "").toLowerCase());

  const addInventoryStock = async () => {
    const quantity = Number(inventoryMl);
    if (!inventoryProduct || !Number.isFinite(quantity) || quantity <= 0) {
      setInventoryNotice("Select a fragrance and enter a valid ml quantity.");
      return;
    }
    setInventoryBusy(true);
    setInventoryNotice("");
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.access_token) throw sessionError || new Error("Authenticated admin session is required.");
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + sessionData.session.access_token
        },
        body: JSON.stringify({
          action: "add_inventory_stock",
          product_name: inventoryProduct,
          quantity_ml: quantity,
          note: inventoryNote
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not record inventory stock.");
      setData((current) => ({ ...current, orderAnalytics: payload.analytics || current.orderAnalytics }));
      setInventoryNotice(
        payload.inventory_event?.event_type === "OPENING"
          ? "Opening balance recorded."
          : "Restock recorded."
      );
      setInventoryMl("");
      setInventoryNote("");
    } catch (inventoryError) {
      setInventoryNotice(inventoryError.message || String(inventoryError));
    } finally {
      setInventoryBusy(false);
    }
  };

  if (!slot) return null;
  return createPortal(<section className="analytics-manager">
    {error ? <div className="analytics-error">{error}</div> : null}
    {module === "Conversion" ? <section className="conversion-intelligence">
  <div className="sales-section-head conversion-head"><div><span>ORDERS / OUTCOMES</span><h2>Purchase signals</h2></div>
    <div className="sales-head-meta"><span className={`analytics-live ${loading ? "loading" : error ? "error" : "ok"}`}>{loading ? "SYNCING" : error ? "PARTIAL DATA" : "LIVE"}</span><small>Supabase orders · no visitor tracking added</small></div>
  </div>
  <details className="conversion-pending-note"><summary>Visitor funnel not connected · GA4 required</summary><p>These are verified order outcomes, not visitor conversion rates. Page views, cart activity and abandoned checkouts cannot yet be calculated from Supabase order data alone.</p></details>
  <div className="sales-kpis conversion-kpis">
    <div><span>DELIVERED ORDERS</span><strong>{number(sales.completed_orders)}</strong><small>Fulfilled purchases</small></div>
    <div><span>ACTIVE ORDERS</span><strong>{number(sales.active_orders)}</strong><small>Pending fulfillment</small></div>
    <div><span>DELIVERY FAILURES</span><strong>{number(sales.failed_orders)}</strong><small>Not checkout abandonment</small></div>
    <div><span>REPEAT CUSTOMERS</span><strong>{number(sales.repeat_customers)}</strong><small>From delivered order history</small></div>
  </div>
  <div className="sales-grid">
    <article className="analytics-panel"><div className="analytics-panel-head"><div><span>ORDER ORIGINS</span><h3>Delivered sales by source</h3></div><small>Not website visitor acquisition</small></div>
      <div className="ranking-list">{salesBySource.length ? salesBySource.map(row=><div className="ranking-row source-row" key={row.order_source}><div><strong>{row.order_source}</strong><small>{number(row.orders)} delivered orders</small></div><span>{money(row.revenue)}</span></div>) : <p className="conversion-empty">No delivered source data yet.</p>}</div>
    </article>
    <article className="analytics-panel"><div className="analytics-panel-head"><div><span>COMPLETED SALES</span><h3>Top selling fragrances</h3></div><small>Delivered only · not product views</small></div>
      <div className="ranking-list">{topProducts.filter(row=>Number(row.sold_units)>0).slice().sort((a,b)=>Number(b.sold_units)-Number(a.sold_units)).slice(0,8).map(row=><div className="ranking-row source-row" key={row.product_name}><div><strong>{row.product_name}</strong><small>{number(row.sold_units)} sold units</small></div><span>{money(row.revenue)}</span></div>)}</div>
    </article>
  </div>
</section> : module === "Commerce" ? <>
    <section className="sales-intelligence">
      <div className="sales-section-head">
        <div>
          <span>ORDERS / SALES</span>
          <h2>Commerce intelligence</h2>
          <p>Revenue, fulfillment, fragrance volume and customer geography from completed orders.</p>
        </div>
        <div className="sales-head-meta">
          <span className={`analytics-live ${loading ? "loading" : error ? "error" : "ok"}`}>{loading ? "SYNCING" : error ? "PARTIAL DATA" : "LIVE"}</span>
          <small>Supabase canonical · Sheets history reconciled</small>
        </div>
      </div>

      <div className="sales-subsection-label"><strong>MONEY</strong><span>What was earned from completed deliveries</span></div>
      <div className="sales-kpis money-kpis">
        <div><span>COMPLETED</span><strong>{number(sales.completed_orders)}</strong><small>delivered orders</small></div>
        <div><span>REVENUE</span><strong>{money(sales.gross_revenue)}</strong><small>products + delivery</small></div>
        <div><span>NET</span><strong>{money(sales.net_after_delivery)}</strong><small>after courier cost</small></div>
        <div><span>AOV</span><strong>{money(sales.aov)}</strong><small>average completed order</small></div>
        <div><span>COD PENDING</span><strong>{money(sales.cod_pending)}</strong><small>still awaiting payout</small></div>
        <div><span>FAILED</span><strong>{number(sales.failed_orders)}</strong><small>excluded from revenue</small></div>
      </div>

      <div className="sales-subsection-label"><strong>FRAGRANCE VOLUME</strong><span>Paid decants, gifts and full bottles are separated</span></div>
      <div className="sales-kpis volume-kpis">
        <div><span>SOLD DECANT ML</span><strong>{number(sales.sold_decant_ml, 1)} ml</strong><small>paid decants only</small></div>
        <div><span>GIFT SAMPLES</span><strong>{number(sales.gift_samples)}</strong><small>{number(sales.gift_ml, 1)} ml gifted</small></div>
        <div><span>FULL BOTTLES</span><strong>{number(sales.full_bottles)}</strong><small>{number(sales.full_bottle_ml, 1)} ml</small></div>
        <div><span>TOTAL FRAGRANCE OUT</span><strong>{number(sales.total_ml_out, 1)} ml</strong><small>sold + gifted</small></div>
        <div><span>FREE SHIPPING</span><strong>{percent(sales.free_shipping_rate)}</strong><small>completed orders</small></div>
        <div><span>REPEAT CUSTOMERS</span><strong>{number(sales.repeat_customers)}</strong><small>completed history</small></div>
      </div>

      <div className="sales-grid">
        <article className="analytics-panel sales-wide">
          <div className="analytics-panel-head"><div><span>MONTHLY</span><h3>Revenue by order month</h3></div><small>Delivered only</small></div>
          <div className="sales-table">
            <div className="sales-row sales-row-head"><span>Month</span><span>Orders</span><span>Revenue</span><span>Net</span></div>
            {monthlySales.map((row) => <div className="sales-row" key={row.month_key}><strong>{row.month_key}</strong><span>{row.orders}</span><span>{money(row.gross_revenue)}</span><span>{money(row.net_after_delivery)}</span></div>)}
          </div>
        </article>

        <article className="analytics-panel">
          <div className="analytics-panel-head"><div><span>ORDER ECONOMICS</span><h3>Revenue composition</h3></div></div>
          <div className="analytics-summary sales-summary">
            <div><span>Product sales</span><strong>{money(sales.product_sales)}</strong></div>
            <div><span>Shipping revenue</span><strong>{money(sales.shipping_revenue)}</strong></div>
            <div><span>Courier cost</span><strong>{money(sales.courier_cost)}</strong></div>
            <div><span>Discounts</span><strong>{money(sales.discount_total)}</strong></div>
          </div>
        </article>
      </div>

      <div className="sales-grid">
        <article className="analytics-panel sales-wide">
          <div className="analytics-panel-head"><div><span>FRAGRANCES</span><h3>Fragrance volume</h3></div><small>Sold + gift ml</small></div>
          <div className="ranking-list">
            {topProducts.slice(0, 14).map((row, index) => <div className="ranking-row fragrance-row" key={row.product_name}>
              <em>{index + 1}</em>
              <div><strong>{row.product_name}</strong><small>{number(row.sold_ml, 1)} ml sold · {number(row.gift_ml, 1)} ml gift · {money(row.revenue)}</small></div>
              <span>{number(row.total_ml_out, 1)} ml</span>
            </div>)}
          </div>
        </article>

        <article className="analytics-panel">
          <div className="analytics-panel-head"><div><span>GIFTS</span><h3>Gift samples</h3></div><small>2 ml each</small></div>
          <div className="ranking-list">
            {giftProducts.map((row) => <div className="ranking-row source-row" key={row.product_name}>
              <div><strong>{row.product_name}</strong><small>{number(row.samples)} samples</small></div>
              <span>{number(row.ml, 1)} ml</span>
            </div>)}
          </div>
          {sales.pen_only_gifts ? <p className="analytics-note">{number(sales.pen_only_gifts)} completed order also had a pen-only gift.</p> : null}
        </article>
      </div>

      <div className="sales-grid">
        <article className="analytics-panel">
          <div className="analytics-panel-head"><div><span>DECANTS</span><h3>Size mix</h3></div><small>Paid vs gift</small></div>
          <div className="sales-table compact">
            {salesBySize.map((row) => <div className="sales-row size-row" key={row.size_label}>
              <strong>{row.size_label}</strong>
              <span>{number(row.sold_units, 1)} sold</span>
              <span>{number(row.gift_units, 1)} gift</span>
              <span>{number(row.total_ml, 1)} ml total</span>
            </div>)}
          </div>
        </article>

        <article className="analytics-panel">
          <div className="analytics-panel-head"><div><span>FULL BOTTLES</span><h3>Full bottle sales</h3></div><small>Excluded from decant mix</small></div>
          <div className="ranking-list">
            {fullBottles.length ? fullBottles.map((row) => <div className="ranking-row source-row" key={row.product_name}>
              <div><strong>{row.product_name}</strong><small>{number(row.units)} bottle · {number(row.ml, 1)} ml</small></div>
              <span>{money(row.revenue)}</span>
            </div>) : <div className="activity-empty">No full bottle sales recorded.</div>}
          </div>
        </article>
      </div>

      <div className="sales-grid">
        <article className="analytics-panel">
          <div className="analytics-panel-head"><div><span>GEOGRAPHY</span><h3>Sales by city</h3></div><small>Delivered</small></div>
          <div className="ranking-list">
            {salesByCity.map((row, index) => <div className="ranking-row" key={row.city}><em>{index + 1}</em><div><strong>{row.city}</strong><small>{row.orders} orders</small></div><span>{money(row.revenue)}</span></div>)}
          </div>
        </article>

        <article className="analytics-panel">
          <div className="analytics-panel-head"><div><span>CHANNEL</span><h3>Order source</h3></div><small>Delivered</small></div>
          <div className="ranking-list">
            {salesBySource.map((row) => <div className="ranking-row source-row" key={row.order_source}><div><strong>{row.order_source}</strong><small>{row.orders} orders</small></div><span>{money(row.revenue)}</span></div>)}
          </div>
        </article>
      </div>
    </section>


    </> : <>
    <section className="inventory-intelligence">
      <div className="sales-section-head">
        <div>
          <span>STOCK / CONSUMPTION</span>
          <h2>Fragrance inventory</h2>
          <p>Current measured stock, restocks and decant consumption after tracking starts.</p>
        </div>
        <div className="sales-head-meta">
          <span className={`analytics-live ${loading ? "loading" : error ? "error" : "ok"}`}>{loading ? "SYNCING" : error ? "PARTIAL DATA" : "LIVE"}</span>
          <small>Supabase canonical inventory ledger</small>
        </div>
      </div>
      <div className="sales-grid inventory-grid">
        <article className="analytics-panel sales-wide inventory-panel">
          <div className="analytics-panel-head">
            <div><span>INVENTORY</span><h3>Inventory watch</h3></div>
            <small>Current measured stock · decant consumption after tracking starts</small>
          </div>

          <div className="inventory-summary">
            <div><span>TRACKED</span><strong>{number(inventory.tracked_count)}</strong></div>
            <div><span>LOW STOCK</span><strong>{number(inventory.low_count)}</strong></div>
            <div><span>DEPLETED</span><strong>{number(inventory.depleted_count)}</strong></div>
            <div><span>REMAINING</span><strong>{number(inventory.remaining_total_ml, 1)} ml</strong></div>
          </div>

          <div className="inventory-list">
            {inventoryRows.length ? inventoryRows.map((row) => <div className={"inventory-row stock-" + String(row.stock_status || "ok").toLowerCase()} key={row.product_name}>
              <div>
                <strong>{row.product_name}</strong>
                <small>Opening {number(row.opening_balance_ml, 1)} ml · restocked {number(row.restock_ml, 1)} ml · consumed {number(row.consumed_since_tracking_ml, 1)} ml</small>
              </div>
              <span>{number(row.remaining_ml, 1)} ml</span>
              {row.stock_status === "OK" ? null : <em>{row.stock_status}</em>}
            </div>) : <div className="activity-empty">No fragrances are tracked yet. Start with the current physical ml remaining in a bottle.</div>}
          </div>
        </article>

        <article className="analytics-panel inventory-entry-panel">
          <div className="analytics-panel-head">
            <div><span>STOCK LEDGER</span><h3>{inventoryIsTracked ? "Add stock" : "Start tracking"}</h3></div>
            <small>{inventoryIsTracked ? "Restock" : "Current physical balance"}</small>
          </div>
          <div className="inventory-form">
            <label>
              <span>FRAGRANCE</span>
              <input list="inventory-products" value={inventoryProduct} onChange={(event) => setInventoryProduct(event.target.value)} placeholder="Search fragrance…" />
              <datalist id="inventory-products">
                {[...products].sort((a,b) => String(a.name).localeCompare(String(b.name))).map((product) => <option value={product.name} key={product.slug} />)}
              </datalist>
            </label>
            <label>
              <span>{inventoryIsTracked ? "ADD ML" : "CURRENT ML"}</span>
              <input type="number" min="0.1" step="0.1" value={inventoryMl} onChange={(event) => setInventoryMl(event.target.value)} placeholder={inventoryIsTracked ? "e.g. 100" : "e.g. 62"} />
            </label>
            <label>
              <span>NOTE · OPTIONAL</span>
              <input value={inventoryNote} onChange={(event) => setInventoryNote(event.target.value)} placeholder={inventoryIsTracked ? "New bottle / restock" : "Measured opening balance"} />
            </label>
            <button type="button" onClick={addInventoryStock} disabled={inventoryBusy || !inventoryProduct || !(Number(inventoryMl) > 0)}>
              {inventoryBusy ? "Saving…" : inventoryIsTracked ? "+ Add stock" : "Start tracking"}
            </button>
            <p>First entry is the current physical balance. Future entries add stock; packed orders and gift samples reduce the estimate automatically.</p>
            {inventoryNotice ? <div className="inventory-notice">{inventoryNotice}</div> : null}
          </div>
        </article>
      </div>
    </section>
    </>}
  </section>, slot);
}
