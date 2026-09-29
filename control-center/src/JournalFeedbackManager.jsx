import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "./supabase";
import "./journal-feedback-manager.css";

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

function JournalFeedbackWorkspace() {
  const [feedback, setFeedback] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("COMMENTS");

  const load = async () => {
    setLoading(true);
    try {
      const data = await loadCommunityIntake();
      setFeedback(Array.isArray(data?.journal_feedback) ? data.journal_feedback : []);
      setArticles(Array.isArray(data?.journal_articles) ? data.journal_articles : []);
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

  const summary = useMemo(() => ({
    records: feedback.length,
    positive: feedback.filter((row) => row.vote === "up").length,
    negative: feedback.filter((row) => row.vote === "down").length,
    comments: feedback.filter((row) => String(row.note || "").trim()).length,
    articles: articles.length
  }), [feedback, articles]);

  const visibleFeedback = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return feedback.filter((row) => {
      if (filter === "COMMENTS" && !String(row.note || "").trim()) return false;
      if (filter === "UP" && row.vote !== "up") return false;
      if (filter === "DOWN" && row.vote !== "down") return false;
      if (!needle) return true;
      return [
        row.article_title,
        row.note,
        row.language,
        row.article,
        row.page
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(needle));
    });
  }, [feedback, filter, query]);

  return <section className="journal-feedback-manager">
    <div className="journal-feedback-head">
      <div>
        <span>COMMUNITY / JOURNAL</span>
        <h2>Journal feedback</h2>
        <p>Reader reactions and comments, grouped by article and preserved as the current feedback state for each known reader/article pair.</p>
      </div>
      <div className="journal-feedback-live">
        <span className={loading ? "loading" : error ? "error" : "ok"}>{loading ? "SYNCING" : error ? "ERROR" : "LIVE"}</span>
        <small>Supabase canonical · Google Sheets history imported</small>
      </div>
    </div>

    {error ? <div className="journal-feedback-error">{error}</div> : null}

    <div className="journal-feedback-kpis">
      <div><span>FEEDBACK RECORDS</span><strong>{summary.records}</strong><small>canonical current-state rows</small></div>
      <div><span>POSITIVE</span><strong>{summary.positive}</strong><small>up votes</small></div>
      <div><span>COMMENTS</span><strong>{summary.comments}</strong><small>free-text reader notes</small></div>
      <div><span>ARTICLES</span><strong>{summary.articles}</strong><small>articles with feedback</small></div>
      {summary.negative ? <div className="warn"><span>NEGATIVE</span><strong>{summary.negative}</strong><small>down votes</small></div> : null}
    </div>

    <div className="journal-feedback-grid">
      <article className="journal-feedback-panel article-performance">
        <div className="journal-feedback-panel-head">
          <div><span>ARTICLE VIEW</span><h3>Feedback by article</h3></div>
          <small>{articles.length} articles</small>
        </div>
        <div className="article-feedback-list">
          {articles.map((article) => <div className="article-feedback-row" key={article.article}>
            <div>
              <strong>{article.article_title || `Article ${article.article}`}</strong>
              <small>Article {article.article} · latest {dateTime(article.latest_at)}</small>
            </div>
            <span>{Number(article.total_votes || 0)} votes</span>
            <span>{Number(article.comments || 0)} comments</span>
            <em>{Number(article.positive || 0)} ↑ / {Number(article.negative || 0)} ↓</em>
          </div>)}
          {!loading && !articles.length ? <div className="journal-feedback-empty">No Journal feedback has been recorded yet.</div> : null}
        </div>
      </article>

      <article className="journal-feedback-panel latest-feedback">
        <div className="journal-feedback-panel-head">
          <div><span>READER VOICE</span><h3>Latest feedback</h3></div>
          <small>Comments stay prominent</small>
        </div>

        <div className="journal-feedback-toolbar">
          <div className="journal-feedback-filters">
            {[
              ["COMMENTS", "Comments"],
              ["ALL", "All"],
              ["UP", "Up"],
              ["DOWN", "Down"]
            ].map(([value, label]) => <button
              key={value}
              type="button"
              className={filter === value ? "active" : ""}
              onClick={() => setFilter(value)}
            >{label}</button>)}
          </div>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search feedback…" />
        </div>

        <div className="latest-feedback-list">
          {visibleFeedback.map((row) => <div className="latest-feedback-row" key={row.id}>
            <div className="latest-feedback-meta">
              <span className={row.vote === "down" ? "vote-down" : "vote-up"}>{row.vote === "down" ? "↓" : "↑"}</span>
              <div>
                <strong>{row.article_title || `Article ${row.article}`}</strong>
                <small>{String(row.language || "—").toUpperCase()} · {dateTime(row.updated_at)}</small>
              </div>
            </div>
            {String(row.note || "").trim()
              ? <p>“{row.note}”</p>
              : <p className="no-comment">Vote only · no written comment</p>}
          </div>)}
          {!loading && !visibleFeedback.length ? <div className="journal-feedback-empty">No feedback matches this view.</div> : null}
        </div>
      </article>
    </div>

    <div className="journal-feedback-footnote">
      <strong>Data model.</strong> Journal Feedback is a current-state record, not a click log. When the same reader updates a vote, the canonical row is updated and an existing written comment is preserved.
    </div>
  </section>;
}

export default function JournalFeedbackManager() {
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    const mainStage = document.querySelector(".main-stage");
    if (!mainStage) return;

    const sync = () => {
      const heading = mainStage.querySelector(".topbar h1")?.textContent?.trim();
      const placeholder = mainStage.querySelector(".placeholder-panel");
      if (!placeholder || heading !== "Journal Feedback") {
        setSlot(null);
        return;
      }

      placeholder.classList.add("journal-feedback-module-active");
      let nextSlot = placeholder.querySelector("#journal-feedback-manager-slot");
      if (!nextSlot) {
        nextSlot = document.createElement("div");
        nextSlot.id = "journal-feedback-manager-slot";
        nextSlot.className = "journal-feedback-manager-slot";
        placeholder.appendChild(nextSlot);
      }
      setSlot(nextSlot);
    };

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(mainStage, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);

  return slot ? createPortal(<JournalFeedbackWorkspace />, slot) : null;
}
