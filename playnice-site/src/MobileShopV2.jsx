import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

const MOBILE_QUERY = "(max-width: 640px)";

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const getLang = () =>
  localStorage.getItem("playnice_lang") === "en" ? "en" : "sr";

const getGroup = (name) => document.querySelector(`.toolbar-group-${name}`);

const getTrigger = (name) =>
  getGroup(name)?.querySelector(".premium-category-trigger, .premium-filter-trigger");

const getMenuOptions = (name) => {
  const id = name === "category" ? "shop-category-menu" : `shop-${name}-menu`;
  return Array.from(document.querySelectorAll(`#${id} [role='option']`));
};

async function readMenuOptions(name) {
  const trigger = getTrigger(name);
  if (!trigger) return [];

  const wasOpen = trigger.getAttribute("aria-expanded") === "true";
  if (!wasOpen) {
    trigger.click();
    await nextFrame();
  }

  const options = getMenuOptions(name).map((button, index) => ({
    index,
    label: button.textContent?.trim() || "",
    active: button.getAttribute("aria-selected") === "true",
  }));

  if (!wasOpen && trigger.getAttribute("aria-expanded") === "true") {
    trigger.click();
  }

  return options;
}

async function chooseMenuOption(name, index) {
  const trigger = getTrigger(name);
  if (!trigger) return false;

  if (trigger.getAttribute("aria-expanded") !== "true") {
    trigger.click();
    await nextFrame();
  }

  const option = getMenuOptions(name)[index];
  if (!option) {
    if (trigger.getAttribute("aria-expanded") === "true") trigger.click();
    return false;
  }

  option.click();
  return true;
}

function readMoodOptions() {
  return Array.from(document.querySelectorAll(".scent-mood-filter .scent-mood-chip")).map(
    (button, index) => ({
      index,
      label: button.textContent?.replace(/\s+/g, " ").trim() || "",
      active: button.classList.contains("active"),
    })
  );
}

function chooseMood(index) {
  const button = document.querySelectorAll(".scent-mood-filter .scent-mood-chip")[index];
  if (!button) return false;
  button.click();
  return true;
}

function getCollectionCount(lang) {
  const dockText = document.querySelector(".sticky-cta-copy small")?.textContent?.trim();
  if (dockText) return dockText;
  return lang === "sr" ? "Kolekcija" : "Collection";
}

export default function MobileShopV2() {
  const [commandHost, setCommandHost] = useState(null);
  const [moodHost, setMoodHost] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [lang, setLang] = useState(getLang);
  const [panel, setPanel] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [seasonOptions, setSeasonOptions] = useState([]);
  const [sortOptions, setSortOptions] = useState([]);
  const [moodOptions, setMoodOptions] = useState([]);
  const [collectionCount, setCollectionCount] = useState("");

  const copy = useMemo(
    () =>
      lang === "en"
        ? {
            filter: "Filter",
            sort: "Sort",
            category: "Category",
            season: "Season",
            mood: "Browse by mood",
            moodNote: "Don’t search notes. Find the moment.",
            reset: "Reset filters",
          }
        : {
            filter: "Filter",
            sort: "Sort",
            category: "Kategorija",
            season: "Sezona",
            mood: "Biraj po osećaju",
            moodNote: "Ne traži note. Pronađi trenutak.",
            reset: "Poništi filtere",
          },
    [lang]
  );

  const syncSurface = () => {
    const media = window.matchMedia(MOBILE_QUERY);
    const onShop = window.location.pathname === "/shop";
    const active = media.matches && onShop;

    setIsMobile(active);
    setLang(getLang());

    if (!active) {
      setCommandHost(null);
      setMoodHost(null);
      setPanel(null);
      return;
    }

    const toolbar = document.querySelector(".shop-toolbar-compact");
    const intro = document.querySelector(".shop-collection-intro");
    if (!toolbar || !intro) return;

    let moodTarget = document.getElementById("mobile-shop-mood-host");
    if (!moodTarget) {
      moodTarget = document.createElement("div");
      moodTarget.id = "mobile-shop-mood-host";
      intro.insertAdjacentElement("afterend", moodTarget);
    }

    let commandTarget = document.getElementById("mobile-shop-v2-host");
    if (!commandTarget) {
      commandTarget = document.createElement("div");
      commandTarget.id = "mobile-shop-v2-host";
      const controls = toolbar.querySelector(".toolbar-row-controls");
      toolbar.insertBefore(commandTarget, controls || null);
    }

    setMoodHost(moodTarget);
    setCommandHost(commandTarget);
    setCollectionCount(getCollectionCount(getLang()));
  };

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);
    let frame = 0;

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        syncSurface();
      });
    };

    syncSurface();

    const observer = new MutationObserver(schedule);
    observer.observe(document.getElementById("root") || document.body, {
      childList: true,
      subtree: true,
    });

    media.addEventListener?.("change", schedule);
    window.addEventListener("popstate", schedule);

    return () => {
      observer.disconnect();
      media.removeEventListener?.("change", schedule);
      window.removeEventListener("popstate", schedule);
      if (frame) cancelAnimationFrame(frame);
      document.getElementById("mobile-shop-v2-host")?.remove();
      document.getElementById("mobile-shop-mood-host")?.remove();
    };
  }, []);

  const refreshOptions = async () => {
    const [categories, seasons, sorts] = await Promise.all([
      readMenuOptions("category"),
      readMenuOptions("season"),
      readMenuOptions("sort"),
    ]);

    setCategoryOptions(categories);
    setSeasonOptions(seasons);
    setSortOptions(sorts);
    setMoodOptions(readMoodOptions());
    setCollectionCount(getCollectionCount(getLang()));
  };

  useEffect(() => {
    if (!isMobile) return;
    refreshOptions();
  }, [isMobile]);

  const togglePanel = async (name) => {
    if (panel === name) {
      setPanel(null);
      return;
    }
    await refreshOptions();
    setPanel(name);
  };

  const applyMenu = async (name, index) => {
    await chooseMenuOption(name, index);
    await nextFrame();
    await nextFrame();
    await refreshOptions();
  };

  const applyMood = async (index) => {
    chooseMood(index);
    await nextFrame();
    await nextFrame();
    await refreshOptions();
  };

  const resetFilters = async () => {
    const nativeReset = document.querySelector(".clear-filters-button");

    if (nativeReset) {
      nativeReset.click();
    } else {
      await chooseMenuOption("category", 0);
      await nextFrame();
      await chooseMenuOption("season", 0);
      await nextFrame();
      chooseMood(0);
    }

    await nextFrame();
    await nextFrame();
    await refreshOptions();
  };

  if (!isMobile || !commandHost || !moodHost) return null;

  const moodRail = (
    <section className="mobile-shop-mood" aria-label={copy.mood}>
      <div className="mobile-shop-mood-head">
        <strong>{copy.mood}</strong>
        <span>{copy.moodNote}</span>
      </div>
      <div className="mobile-shop-mood-rail">
        {moodOptions.map((option) => (
          <button
            type="button"
            key={`${option.index}-${option.label}`}
            className={option.active ? "active" : ""}
            onClick={() => applyMood(option.index)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </section>
  );

  const inline = (
    <div className="mobile-shop-command" aria-label="Mobile shop controls">
      <div className="mobile-shop-meta-row">
        <span>{collectionCount}</span>
      </div>

      <div className="mobile-shop-segmented" role="group" aria-label="Shop controls">
        <button
          type="button"
          className={panel === "filter" ? "active" : ""}
          aria-expanded={panel === "filter"}
          onClick={() => togglePanel("filter")}
        >
          <span>{copy.filter}</span>
          <i aria-hidden="true">⌄</i>
        </button>
        <button
          type="button"
          className={panel === "sort" ? "active" : ""}
          aria-expanded={panel === "sort"}
          onClick={() => togglePanel("sort")}
        >
          <span>{copy.sort}</span>
          <i aria-hidden="true">⌄</i>
        </button>
      </div>

      {panel === "filter" && (
        <div className="mobile-shop-inline-panel mobile-shop-inline-filter">
          <CompactFilterGroup
            title={copy.category}
            options={categoryOptions}
            onChoose={(index) => applyMenu("category", index)}
          />
          <CompactFilterGroup
            title={copy.season}
            options={seasonOptions}
            onChoose={(index) => applyMenu("season", index)}
          />
          <button type="button" className="mobile-shop-reset" onClick={resetFilters}>
            {copy.reset}
          </button>
        </div>
      )}

      {panel === "sort" && (
        <div className="mobile-shop-inline-panel mobile-shop-inline-sort">
          {sortOptions.map((option) => (
            <button
              type="button"
              key={`${option.index}-${option.label}`}
              className={option.active ? "active" : ""}
              onClick={async () => {
                await applyMenu("sort", option.index);
                setPanel(null);
              }}
            >
              <span>{option.label}</span>
              {option.active && <i aria-hidden="true">✓</i>}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      {createPortal(moodRail, moodHost)}
      {createPortal(inline, commandHost)}
    </>
  );
}

function CompactFilterGroup({ title, options, onChoose }) {
  if (!options?.length) return null;

  return (
    <div className="mobile-shop-compact-group">
      <span>{title}</span>
      <div>
        {options.map((option) => (
          <button
            type="button"
            key={`${option.index}-${option.label}`}
            className={option.active ? "active" : ""}
            onClick={() => onChoose(option.index)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
