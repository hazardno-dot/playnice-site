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

  if (!wasOpen) {
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
  return Array.from(document.querySelectorAll(".scent-mood-chip")).map(
    (button, index) => ({
      index,
      label: button.textContent?.replace(/\s+/g, " ").trim() || "",
      active: button.classList.contains("active"),
    })
  );
}

function chooseMood(index) {
  const button = document.querySelectorAll(".scent-mood-chip")[index];
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
  const [host, setHost] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [lang, setLang] = useState(getLang);
  const [sheet, setSheet] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [seasonOptions, setSeasonOptions] = useState([]);
  const [sortOptions, setSortOptions] = useState([]);
  const [moodOptions, setMoodOptions] = useState([]);
  const [collectionCount, setCollectionCount] = useState("");

  const copy = useMemo(
    () =>
      lang === "en"
        ? {
            info: "Why decants?",
            filter: "Filter",
            sort: "Sort",
            filters: "Filters",
            category: "Category",
            season: "Season",
            mood: "Mood",
            reset: "Reset",
            done: "Show fragrances",
            close: "Close",
            way: "The PlayNice Way",
            title: "Try the scent before the full bottle.",
            text: "Designer and niche bottles often cost €80–€200+. With PlayNice, you can get to know them from €3.",
            full: "€80–€200+",
            fullLabel: "designer and niche full bottles",
            try: "€3+",
            tryLabel: "enough to try before you buy",
            note: "Less risk. More certainty. A better decision.",
          }
        : {
            info: "Zašto dekanti?",
            filter: "Filter",
            sort: "Sort",
            filters: "Filteri",
            category: "Kategorija",
            season: "Sezona",
            mood: "Osećaj",
            reset: "Poništi",
            done: "Prikaži parfeme",
            close: "Zatvori",
            way: "PlayNice pristup",
            title: "Probaj miris pre pune bočice.",
            text: "Designer i niche parfemi često koštaju €80–€200+. Kod PlayNice možeš da ih upoznaš već od €3.",
            full: "€80–€200+",
            fullLabel: "pune designer i niche bočice",
            try: "€3+",
            tryLabel: "dovoljno da probaš pre kupovine",
            note: "Manje rizika. Više sigurnosti. Bolja odluka.",
          },
    [lang]
  );

  const syncSurface = () => {
    const media = window.matchMedia(MOBILE_QUERY);
    const onShop = window.location.pathname === "/shop";
    setIsMobile(media.matches && onShop);
    setLang(getLang());

    if (!media.matches || !onShop) {
      setHost(null);
      setSheet(null);
      return;
    }

    const toolbar = document.querySelector(".shop-toolbar-compact");
    if (!toolbar) return;

    let target = document.getElementById("mobile-shop-v2-host");
    if (!target) {
      target = document.createElement("div");
      target.id = "mobile-shop-v2-host";
      const controls = toolbar.querySelector(".toolbar-row-controls");
      toolbar.insertBefore(target, controls || null);
    }

    setHost(target);
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

  const openSheet = async (name) => {
    await refreshOptions();
    setSheet(name);
    document.body.classList.add("mobile-shop-sheet-open");
  };

  const closeSheet = () => {
    setSheet(null);
    document.body.classList.remove("mobile-shop-sheet-open");
    requestAnimationFrame(() => setCollectionCount(getCollectionCount(getLang())));
  };

  useEffect(() => () => document.body.classList.remove("mobile-shop-sheet-open"), []);

  const applyMenu = async (name, index) => {
    await chooseMenuOption(name, index);
    await nextFrame();
    await refreshOptions();
  };

  const applyMood = async (index) => {
    chooseMood(index);
    await nextFrame();
    await refreshOptions();
  };

  const resetFilters = async () => {
    await chooseMenuOption("category", 0);
    await nextFrame();
    await chooseMenuOption("season", 0);
    await nextFrame();
    chooseMood(0);
    await nextFrame();
    await refreshOptions();
  };

  if (!isMobile || !host) return null;

  const inline = (
    <div className="mobile-shop-command" aria-label="Mobile shop controls">
      <button type="button" className="mobile-shop-info-trigger" onClick={() => openSheet("info")}>
        <span>PLAYNICE</span>
        <strong>{copy.info}</strong>
        <i aria-hidden="true">→</i>
      </button>

      <div className="mobile-shop-control-row">
        <span className="mobile-shop-count">{collectionCount}</span>
        <button type="button" onClick={() => openSheet("filter")}>
          {copy.filter}
          <span aria-hidden="true">⌄</span>
        </button>
        <button type="button" onClick={() => openSheet("sort")}>
          {copy.sort}
          <span aria-hidden="true">⌄</span>
        </button>
      </div>

      {categoryOptions.length > 0 && (
        <div className="mobile-shop-quick-categories" aria-label={copy.category}>
          {categoryOptions.map((option) => (
            <button
              type="button"
              key={`${option.index}-${option.label}`}
              className={option.active ? "active" : ""}
              onClick={() => applyMenu("category", option.index)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const overlay = sheet ? (
    <div className="mobile-shop-sheet-layer" role="presentation" onMouseDown={(e) => {
      if (e.target === e.currentTarget) closeSheet();
    }}>
      <section className="mobile-shop-sheet" role="dialog" aria-modal="true" aria-label={sheet === "info" ? copy.way : sheet === "sort" ? copy.sort : copy.filters}>
        <div className="mobile-shop-sheet-grabber" aria-hidden="true" />
        <header className="mobile-shop-sheet-header">
          <div>
            <span>{sheet === "info" ? copy.way : "PLAYNICE SHOP"}</span>
            <h3>{sheet === "info" ? copy.title : sheet === "sort" ? copy.sort : copy.filters}</h3>
          </div>
          <button type="button" onClick={closeSheet} aria-label={copy.close}>×</button>
        </header>

        {sheet === "info" && (
          <div className="mobile-shop-info-sheet">
            <p>{copy.text}</p>
            <div className="mobile-shop-info-points">
              <div><strong>{copy.full}</strong><span>{copy.fullLabel}</span></div>
              <div className="highlight"><strong>{copy.try}</strong><span>{copy.tryLabel}</span></div>
            </div>
            <small>{copy.note}</small>
          </div>
        )}

        {sheet === "filter" && (
          <div className="mobile-shop-filter-sheet">
            <FilterGroup title={copy.category} options={categoryOptions} onChoose={(index) => applyMenu("category", index)} />
            <FilterGroup title={copy.season} options={seasonOptions} onChoose={(index) => applyMenu("season", index)} />
            <FilterGroup title={copy.mood} options={moodOptions} onChoose={applyMood} />
            <div className="mobile-shop-sheet-actions">
              <button type="button" className="ghost" onClick={resetFilters}>{copy.reset}</button>
              <button type="button" className="primary" onClick={closeSheet}>{copy.done}</button>
            </div>
          </div>
        )}

        {sheet === "sort" && (
          <div className="mobile-shop-sort-sheet">
            <FilterGroup title={copy.sort} options={sortOptions} onChoose={async (index) => {
              await applyMenu("sort", index);
              closeSheet();
            }} />
          </div>
        )}
      </section>
    </div>
  ) : null;

  return (
    <>
      {createPortal(inline, host)}
      {overlay}
    </>
  );
}

function FilterGroup({ title, options, onChoose }) {
  if (!options?.length) return null;
  return (
    <div className="mobile-shop-filter-group">
      <h4>{title}</h4>
      <div>
        {options.map((option) => (
          <button
            type="button"
            key={`${option.index}-${option.label}`}
            className={option.active ? "active" : ""}
            onClick={() => onChoose(option.index)}
          >
            {option.label}
            {option.active && <span aria-hidden="true">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
