import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { products } from "@shop/data/products/index.js";
import { getScentRequestMatchResult } from "@shop/features/scent-request/scentRequestMatching.js";
import { EXISTING_COLLECTION_LOCKED_VOTES } from "@shop/features/scent-request/communityRequestHelpers.js";
import { supabase } from "./supabase";
import { requestOpenProduct } from "./productNavigation.mjs";
import "./scent-requests-manager.css";

const dateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("sr-ME", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

async function loadCommunityIntake() {
  const { data, error } = await supabase.rpc("get_control_center_community_intake");
  if (error) throw error;
  return data || {};
}

function ScentRequestsWorkspace() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("ALL");

  const load = async () => {
    setLoading(true);
    try {
      const data = await loadCommunityIntake();
      setRows(Array.isArray(data?.scent_requests) ? data.scent_requests : []);
      setError("");
    } catch (loadError) {
      setError(loadError?.message || String(loadError));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const enriched = useMemo(() => {
    const merged = new Map();

    rows.forEach((row) => {
      const match = getScentRequestMatchResult(row.fragrance, products);
      const product = match?.product || null;
      const status = product ? "IN_COLLECTION" : match?.ambiguous ? "REVIEW" : "OPEN";
      const key = product ? `product:${product.slug}` : `request:${row.fragrance_normalized}`;

      merged.set(key, {
        ...row,
        product,
        status,
        display_votes: Number(row.votes || 0),
        locked_votes: null,
        historical_only: false
      });
    });

    Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).forEach(([name, lockedVotes]) => {
      const match = getScentRequestMatchResult(name, products);
      const product = match?.product || null;
      if (!product) return;

      const key = `product:${product.slug}`;
      const current = merged.get(key);

      if (current) {
        merged.set(key, {
          ...current,
          display_votes: Number(lockedVotes),
          locked_votes: Number(lockedVotes)
        });
        return;
      }

      merged.set(key, {
        fragrance: product.name,
        fragrance_normalized: name.toLowerCase(),
        votes: 0,
        unique_devices: 0,
        first_requested_at: null,
        last_requested_at: null,
        product,
        status: "IN_COLLECTION",
        display_votes: Number(lockedVotes),
        locked_votes: Number(lockedVotes),
        historical_only: true
      });
    });

    return [...merged.values()].sort((a, b) =>
      Number(b.display_votes || 0) - Number(a.display_votes || 0) ||
      String(a.fragrance || "").localeCompare(String(b.fragrance || ""))
    );
  }, [rows]);

  const summary = useMemo(() => ({
    votes: rows.reduce((sum, row) => sum + Number(row.votes || 0), 0),
    fragrances: rows.length,
    open: enriched.filter((row) => row.status === "OPEN").length,
    collection: enriched.filter((row) => row.status === "IN_COLLECTION").length,
    review: enriched.filter((row) => row.status === "REVIEW").length
  }), [rows, enriched]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return enriched.filter((row) => {
      if (filter !== "ALL" && row.status !== filter) return false;
      if (!needle) return true;
      return [
        row.fragrance,
        row.product?.name,
        row.fragrance_normalized
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [enriched, filter, query]);

  return <section className="scent-requests-manager">
    <div className="scent-requests-head">
      <div>
        <span>COMMUNITY / DEMAND</span>
        <h2>Scent requests</h2>
        <p>Canonical Supabase view of customer fragrance demand. Collection status is derived from the live catalog.</p>
      </div>
      <div className="scent-requests-live">
        <span className={loading ? "loading" : error ? "error" : "ok"}>{loading ? "SYNCING" : error ? "ERROR" : "LIVE"}</span>
        <small>Supabase canonical · Google Sheets history imported</small>
      </div>
    </div>

    {error ? <div className="scent-requests-error">{error}</div> : null}

    <div className="scent-request-kpis">
      <div><span>REQUEST EVENTS</span><strong>{summary.votes}</strong><small>valid historical scent_request rows</small></div>
      <div><span>RAW GROUPS</span><strong>{summary.fragrances}</strong><small>normalized request groups in Supabase</small></div>
      <div><span>OPEN DEMAND</span><strong>{summary.open}</strong><small>not currently in catalog</small></div>
      <div><span>IN COLLECTION</span><strong>{summary.collection}</strong><small>derived from live products</small></div>
      {summary.review ? <div className="warn"><span>REVIEW MATCH</span><strong>{summary.review}</strong><small>ambiguous catalog match</small></div> : null}
    </div>

    <div className="scent-request-toolbar">
      <div className="scent-request-filters">
        {[
          ["ALL", "All"],
          ["OPEN", "Open"],
          ["IN_COLLECTION", "In collection"],
          ["REVIEW", "Review match"]
        ].map(([value, label]) => <button
          key={value}
          type="button"
          className={filter === value ? "active" : ""}
          onClick={() => setFilter(value)}
        >{label}</button>)}
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search requested fragrance…"
      />
    </div>

    <div className="scent-request-table">
      <div className="scent-request-row scent-request-row-head">
        <span>Fragrance</span>
        <span>Votes</span>
        <span>Known devices</span>
        <span>First request</span>
        <span>Last request</span>
        <span>Status</span>
      </div>

      {visible.map((row) => <div className="scent-request-row" key={row.fragrance_normalized}>
        <div className="scent-request-name">
          <strong>{row.fragrance}</strong>
          <small>{row.fragrance_normalized}</small>
        </div>
        <div className="scent-request-vote-cell"><strong className="scent-request-votes">{Number(row.display_votes ?? row.votes ?? 0)}</strong>{row.locked_votes ? <small>historical locked</small> : null}</div>
        <span>{Number(row.unique_devices || 0)}</span>
        <time>{dateTime(row.first_requested_at)}</time>
        <time>{dateTime(row.last_requested_at)}</time>
        <div className="scent-request-status">
          {row.status === "IN_COLLECTION" ? <>
            <button type="button" className="collection-link" onClick={() => requestOpenProduct(row.product?.slug)}>
              IN COLLECTION
            </button>
            <small>{row.product?.name}</small>
          </> : row.status === "REVIEW" ? <span className="status-review">REVIEW MATCH</span> : <span className="status-open">OPEN</span>}
        </div>
      </div>)}

      {!loading && !visible.length ? <div className="scent-request-empty">No scent requests match this view.</div> : null}
    </div>

    <div className="scent-request-footnote">
      <strong>Historical note.</strong> “Known devices” excludes older request rows created before device IDs were introduced. In-collection rows with preserved public historical totals are marked “historical locked” and remain derived from the same storefront constants used by “From request to collection ✦”.
    </div>
  </section>;
}

export default function ScentRequestsManager() {
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;

    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1")?.textContent?.trim();
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading !== "Scent Requests") {
        setSlot(null);
        return;
      }

      placeholder.classList.add("scent-requests-module-active");
      let nextSlot = placeholder.querySelector("#scent-requests-manager-slot");
      if (!nextSlot) {
        nextSlot = document.createElement("div");
        nextSlot.id = "scent-requests-manager-slot";
        nextSlot.className = "scent-requests-manager-slot";
        placeholder.appendChild(nextSlot);
      }
      setSlot(nextSlot);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return slot ? createPortal(<ScentRequestsWorkspace />, slot) : null;
}
