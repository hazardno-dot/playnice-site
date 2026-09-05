import { useEffect, useMemo, useRef, useState } from "react";
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
    label: button.textContent?.replace(/\s+/g, " ").trim() || "",
    active: button.getAttribute("aria-selected") === "true",
  }));

  if (!wasOpen && trigger.getAttribute("aria-expanded") === "true") {
    trigger.click();
    await nextFrame();
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
  const moodParam = new URLSearchParams(window.location.search).get("mood");

  return Array.from(document.querySelectorAll(".scent-mood-filter .scent-mood-chip")).map(
    (button, index) => ({
      index,
      label: button.textContent?.replace(/\s+/g, " ").trim() || "",
      active: moodParam ? button.classList.contains("active") : index === 0,
    })
  );
}

function chooseMood(index) {
  const button = document.querySelectorAll(".scent-mood-filter .scent-mood-chip")[index];
  if (!button) return false;
  button.click();
  return true;
}

function getSearchInput() {
  return document.getElementById("shop-search");
}

function setNativeSearchValue(value) {
  const input = getSearchInput();
  if (!input) return false;

  const setter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;

  if (setter) setter.call(input, value);
  else input.value = value;

  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

function getCategoryIcon(label = "") {
  const value = label.toLowerCase();
  if (value.includes("arabian") || value.includes("araps")) return "☾";
  if (value.includes("designer") || value.includes("dizajn")) return "◈";
  if (value.includes("niche")) return "✦";
  return "";
}

function getCategoryTone(label = "") {
  const value = label.toLowerCase();
  if (value.includes("arabian") || value.includes("araps")) return "arabian";
  if (value.includes("designer") || value.includes("dizajn")) return "designer";
  if (value.includes("niche")) return "niche";
  return "neutral";
}

export default function MobileShopV2() {
  const [host, setHost] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [lang, setLang] = useState(getLang);
  const [panel, setPanel] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [seasonOptions, setSeasonOptions] = useState([]);
  const [sortOptions, setSortOptions] = useState([]);
  const [moodOptions, setMoodOptions] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const menuRef = useRef(null);

  const copy = useMemo(
    () =>
      lang === "en"
        ? {
            mood: "Mood",
            moodDefault: "All moods",
            search: "Search",
            searchHint: "Brand or fragrance",
            filter: "Filter",
            filterDefault: "All filters",
            sort: "Sort",
            category: "Category",
            season: "Season",
            reset: "Reset filters",
            clear: "Clear",
            way: "THE PLAYNICE WAY",
            wayNote: "Less risk. More certainty. A better decision.",
          }
        : {
            mood: "Osećaj",
            moodDefault: "Svi osećaji",
            search: "Pretraga",
            searchHint: "Brend ili parfem",
            filter: "Filter",
            filterDefault: "Svi filteri",
            sort: "Sort",
            category: "Kategorija",
            season: "Sezona",
            reset: "Poništi filtere",
            clear: "Obriši",
            way: "PLAYNICE PRISTUP",
            wayNote: "Manje rizika. Više sigurnosti. Bolja odluka.",
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
      setHost(null);
      setPanel(null);
      return;
    }

    const intro = document.querySelector(".shop-collection-intro");
    if (!intro) return;

    let target = document.getElementById("mobile-shop-v2-host");
    if (!target) {
      target = document.createElement("div");
      target.id = "mobile-shop-v2-host";
      intro.insertAdjacentElement("afterend", target);
    }

    setHost(target);
    setSearchValue(getSearchInput()?.value || "");
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
    const categories = await readMenuOptions("category");
    const seasons = await readMenuOptions("season");
    const sorts = await readMenuOptions("sort");

    setCategoryOptions(categories);
    setSeasonOptions(seasons);
    setSortOptions(sorts);
    setMoodOptions(readMoodOptions());
    setSearchValue(getSearchInput()?.value || "");
  };

  useEffect(() => {
    if (!isMobile) return;
    refreshOptions();
  }, [isMobile]);

  useEffect(() => {
    if (!panel) return;

    const onPointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setPanel(null);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setPanel(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panel]);

  const openPanel = async (name) => {
    if (panel === name) {
      setPanel(null);
      return;
    }
    await refreshOptions();
    setPanel(name);
  };

  const applyMenu = async (name, index, close = false) => {
    await chooseMenuOption(name, index);
    await nextFrame();
    await nextFrame();
    await refreshOptions();
    if (close) setPanel(null);
  };

  const applyMood = async (index) => {
    chooseMood(index);
    await nextFrame();
    await nextFrame();
    await refreshOptions();
    setPanel(null);
  };

  const resetFilters = async () => {
    const nativeReset = document.querySelector(".clear-filters-button");

    if (nativeReset) {
      nativeReset.click();
      await nextFrame();
      await nextFrame();
    } else {
      await chooseMenuOption("category", 0);
      await nextFrame();
      await chooseMenuOption("season", 0);
      await nextFrame();
    }

    const moods = readMoodOptions();
    if (moods.length && !moods[0].active) {
      chooseMood(0);
      await nextFrame();
      await nextFrame();
    }

    await refreshOptions();
  };

  const activeMood = moodOptions.find((option) => option.active);
  const activeCategory = categoryOptions.find((option) => option.active);
  const activeSeason = seasonOptions.find((option) => option.active);
  const activeSort = sortOptions.find((option) => option.active);

  const filterCount = [activeCategory, activeSeason].filter(
    (option) => option && option.index !== 0
  ).length;

  if (!isMobile || !host) return null;

  const capsuleValue = (name) => {
    if (name === "mood") return activeMood?.label || copy.moodDefault;
    if (name === "search") return searchValue ? `“${searchValue}”` : copy.searchHint;
    if (name === "filter") {
      return filterCount ? `${filterCount} ${lang === "en" ? "active" : "aktivna"}` : copy.filterDefault;
    }
    return activeSort?.label || copy.sort;
  };

  const controls = [
    { name: "mood", label: copy.mood, icon: "◌" },
    { name: "search", label: copy.search, icon: "⌕" },
    { name: "filter", label: copy.filter, icon: "≡" },
    { name: "sort", label: copy.sort, icon: "↕" },
  ];

  const menu = (
    <section className="mobile-shop-menu" ref={menuRef} aria-label="Shop menu">
      <div className="mobile-shop-wayline">
        <strong>{copy.way}</strong>
        <span>{copy.wayNote}</span>
      </div>

      <div className="mobile-shop-board">
        <div className="mobile-shop-capsules">
          {controls.map(({ name, label, icon }) => (
            <button
              key={name}
              type="button"
              className={`mobile-shop-capsule ${panel === name ? "active" : ""}`}
              aria-label={`${label}: ${capsuleValue(name)}`}
              aria-expanded={panel === name}
              onClick={() => openPanel(name)}
            >
              <span className="mobile-shop-capsule-icon" aria-hidden="true">{icon}</span>
              <strong>{capsuleValue(name)}</strong>
              <span className="mobile-shop-capsule-arrow" aria-hidden="true">⌄</span>
            </button>
          ))}
        </div>

        {panel && (
          <div className={`mobile-shop-popover mobile-shop-popover-${panel}`}>
            {panel === "mood" && (
              <SelectionList options={moodOptions} onChoose={applyMood} />
            )}

            {panel === "search" && (
              <div className="mobile-shop-search-panel">
                <div>
                  <span aria-hidden="true">⌕</span>
                  <input
                    id="mobile-shop-search-proxy"
                    aria-label={copy.searchHint}
                    autoFocus
                    type="search"
                    value={searchValue}
                    placeholder={copy.searchHint}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSearchValue(value);
                      setNativeSearchValue(value);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") setPanel(null);
                    }}
                  />
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchValue("");
                        setNativeSearchValue("");
                      }}
                    >
                      {copy.clear}
                    </button>
                  )}
                </div>
              </div>
            )}

            {panel === "filter" && (
              <div className="mobile-shop-filter-panel">
                <SelectionSection
                  title={copy.category}
                  options={categoryOptions}
                  onChoose={(index) => applyMenu("category", index)}
                  kind="category"
                />
                <SelectionSection
                  title={copy.season}
                  options={seasonOptions}
                  onChoose={(index) => applyMenu("season", index)}
                />
                <button type="button" className="mobile-shop-reset-link" onClick={resetFilters}>
                  {copy.reset}
                </button>
              </div>
            )}

            {panel === "sort" && (
              <SelectionList
                options={sortOptions}
                onChoose={(index) => applyMenu("sort", index, true)}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );

  return createPortal(menu, host);
}

function SelectionSection({ title, options, onChoose, kind }) {
  if (!options?.length) return null;
  return (
    <div className="mobile-shop-selection-section">
      <h4>{title}</h4>
      <SelectionList options={options} onChoose={onChoose} kind={kind} />
    </div>
  );
}

function SelectionList({ options, onChoose, kind }) {
  if (!options?.length) return null;
  return (
    <div className="mobile-shop-selection-list">
      {options.map((option) => {
        const categoryIcon = kind === "category" ? getCategoryIcon(option.label) : "";
        const categoryTone = kind === "category" ? getCategoryTone(option.label) : "neutral";
        return (
          <button
            type="button"
            key={`${option.index}-${option.label}`}
            className={option.active ? "active" : ""}
            onClick={() => onChoose(option.index)}
          >
            <span className="mobile-shop-option-label">
              {categoryIcon && (
                <b
                  className={`mobile-shop-option-icon mobile-shop-option-icon-${categoryTone}`}
                  aria-hidden="true"
                >
                  {categoryIcon}
                </b>
              )}
              {option.label}
            </span>
            <i aria-hidden="true">{option.active ? "●" : "○"}</i>
          </button>
        );
      })}
    </div>
  );
}