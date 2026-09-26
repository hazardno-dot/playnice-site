import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import { journalArticles } from "@shop/data/journal/index.js";
import { auditProductNotes } from "./noteAudit.mjs";
import { supabase } from "./supabase";
import "./analytics-manager.css";

const STATUS_ORDER = ["draft", "ready", "approved"];
const fmtDate = (value) => value ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "—";
const thirtyDaysAgo = () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
const countStatuses = (rows = []) => STATUS_ORDER.reduce((out, status) => ({ ...out, [status]: rows.filter((row) => String(row.review_status || "draft").toLowerCase() === status).length }), {});
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ productDrafts: [], heroDrafts: [], journalDrafts: [], noteDrafts: [], publishHistory: [], auditLog: [], heroSlides: 0, orderAnalytics: {} });
  const noteAudit = useMemo(() => auditProductNotes(products), []);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;
    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1")?.textContent?.trim();
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading !== "Analytics") { setSlot(null); return; }
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
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const since = thirtyDaysAgo();
      const [productDrafts, heroDrafts, journalDrafts, noteDrafts, publishHistory, auditLog, heroSlides, orderAnalytics] = await Promise.all([
        supabase.from("product_drafts").select("product_slug,review_status,updated_at,apply_pr_number,published_at").order("updated_at", { ascending: false }),
        supabase.from("hero_drafts").select("hero_key,review_status,updated_at,apply_pr_number,preview_verified_at").order("updated_at", { ascending: false }),
        supabase.from("journal_drafts").select("article_id,review_status,updated_at,apply_pr_number").order("updated_at", { ascending: false }),
        supabase.from("note_drafts").select("note_key,review_status,updated_at,apply_pr_number").order("updated_at", { ascending: false }),
        supabase.from("publish_history").select("product_slug,published_at,apply_pr_number,published_commit_sha").gte("published_at", since).order("published_at", { ascending: false }).limit(30),
        supabase.from("draft_audit_log").select("id,product_slug,action,created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(30),
        supabase.from("hero_slides").select("hero_key", { count: "exact", head: true }).eq("enabled", true),
        loadOrderAnalytics().then((analytics) => ({ data: analytics, error: null })).catch((loadError) => ({ data: {}, error: loadError })),
      ]);
      if (cancelled) return;
      const firstError = [productDrafts, heroDrafts, journalDrafts, noteDrafts, publishHistory, auditLog, heroSlides, orderAnalytics].find((result) => result.error)?.error;
      if (firstError) setError(firstError.message); else setError("");
      setData({
        productDrafts: productDrafts.data || [],
        heroDrafts: heroDrafts.data || [],
        journalDrafts: journalDrafts.data || [],
        noteDrafts: noteDrafts.data || [],
        publishHistory: publishHistory.data || [],
        auditLog: auditLog.data || [],
        heroSlides: heroSlides.count || 0,
        orderAnalytics: orderAnalytics.data || {},
      });
      setLoading(false);
    };
    load();
    const channels = ["product_drafts", "hero_drafts", "journal_drafts", "note_drafts", "publish_history", "draft_audit_log"].map((table) =>
      supabase.channel(`analytics-${table}`).on("postgres_changes", { event: "*", schema: "public", table }, load).subscribe()
    );
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      channels.forEach((channel) => supabase.removeChannel(channel));
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const productStatus = useMemo(() => countStatuses(data.productDrafts), [data.productDrafts]);
  const heroStatus = useMemo(() => countStatuses(data.heroDrafts), [data.heroDrafts]);
  const journalStatus = useMemo(() => countStatuses(data.journalDrafts), [data.journalDrafts]);
  const noteStatus = useMemo(() => countStatuses(data.noteDrafts), [data.noteDrafts]);
  const allManaged = [...data.productDrafts, ...data.heroDrafts, ...data.journalDrafts, ...data.noteDrafts];
  const totalDrafts = allManaged.length;
  const totalApproved = productStatus.approved + heroStatus.approved + journalStatus.approved + noteStatus.approved;
  const openPrs = allManaged.filter((row) => row.apply_pr_number).length;
  const verifiedHeroPreviews = data.heroDrafts.filter((row) => row.preview_verified_at).length;

  const sales = data.orderAnalytics?.summary || {};
  const monthlySales = data.orderAnalytics?.monthly || [];
  const topProducts = data.orderAnalytics?.top_products || [];
  const salesByCity = data.orderAnalytics?.cities || [];
  const salesBySize = data.orderAnalytics?.sizes || [];
  const salesBySource = data.orderAnalytics?.sources || [];
  const fullBottles = data.orderAnalytics?.full_bottles || [];
  const giftProducts = data.orderAnalytics?.gifts || [];

  const recent = useMemo(() => [
    ...data.publishHistory.map((row) => ({ type: "PUBLISH", subject: row.product_slug, detail: row.apply_pr_number ? `PR #${row.apply_pr_number}` : "published", at: row.published_at })),
    ...data.auditLog.map((row) => ({ type: "PRODUCT", subject: row.product_slug, detail: String(row.action || "activity").replace(/_/g, " "), at: row.created_at })),
    ...data.heroDrafts.filter((row) => row.updated_at).map((row) => ({ type: "HERO", subject: row.hero_key, detail: row.preview_verified_at ? "preview verified" : String(row.review_status || "draft"), at: row.updated_at })),
  ].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 12), [data.publishHistory, data.auditLog, data.heroDrafts]);

  if (!slot) return null;
  return createPortal(<section className="analytics-manager">
    {error ? <div className="analytics-error">{error}</div> : null}

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

    <div className="workflow-section-head">
      <div><span>CONTROL CENTER WORKFLOW</span><h3>Editorial & release operations</h3></div>
      <p>Separate from commerce metrics above.</p>
    </div>

    <div className="analytics-kpis">
      <div><span>PRODUCTS</span><strong>{products.length}</strong><small>live catalog</small></div>
      <div><span>HERO</span><strong>{data.heroSlides}</strong><small>managed live slides</small></div>
      <div><span>JOURNAL</span><strong>{journalArticles.length}</strong><small>live articles</small></div>
      <div><span>NOTES</span><strong>{noteAudit.uniqueNotes}</strong><small>{noteAudit.placements} placements</small></div>
      <div><span>ACTIVE DRAFTS</span><strong>{totalDrafts}</strong><small>all managed modules</small></div>
      <div><span>APPROVED</span><strong>{totalApproved}</strong><small>awaiting next step</small></div>
    </div>

    <div className="analytics-grid">
      <article className="analytics-panel workflow-panel"><div className="analytics-panel-head"><div><span>WORKFLOW</span><h3>Draft state by module</h3></div><small>Realtime</small></div>
        <div className="workflow-table">
          {[
            {name:"Products", total:data.productDrafts.length, status:productStatus},
            {name:"Hero", total:data.heroDrafts.length, status:heroStatus},
            {name:"Journal", total:data.journalDrafts.length, status:journalStatus},
            {name:"Notes", total:data.noteDrafts.length, status:noteStatus}
          ].map((row) => <div className="workflow-row" key={row.name}><strong>{row.name}</strong><span>{row.total}</span><em className="draft">D {row.status.draft}</em><em className="ready">R {row.status.ready}</em><em className="approved">A {row.status.approved}</em></div>)}
        </div>
      </article>

      <article className="analytics-panel"><div className="analytics-panel-head"><div><span>CONTROLLED APPLY</span><h3>Release queue</h3></div><strong>{openPrs}</strong></div>
        <div className="analytics-summary"><div><span>Draft PR metadata</span><strong>{openPrs}</strong></div><div><span>Hero previews verified</span><strong>{verifiedHeroPreviews}</strong></div></div>
        <p className="analytics-note">Apply metadata is operational state only. Merge remains manual and Production is never changed from this analytics surface.</p>
      </article>
    </div>

    <article className="analytics-panel activity-panel"><div className="analytics-panel-head"><div><span>RECENT ACTIVITY</span><h3>Latest workflow events</h3></div><small>Newest first</small></div>
      <div className="activity-list">{recent.length ? recent.map((item, index) => <div className="activity-row" key={`${item.type}-${item.subject}-${item.at}-${index}`}><span className={item.type.toLowerCase()}>{item.type}</span><strong>{item.subject || "—"}</strong><small>{item.detail}</small><time>{fmtDate(item.at)}</time></div>) : <div className="activity-empty">No workflow activity recorded in the last 30 days.</div>}</div>
    </article>
  </section>, slot);
}
