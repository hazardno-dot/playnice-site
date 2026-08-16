import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import "./HeaderNext.css";

const CartIcon = () => (
  <span className="header-next-cart-icon" aria-hidden="true">
    🛒
  </span>
);

const HeartIcon = ({ filled = false }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      className={filled ? "is-filled" : "is-outline"}
      d="M20.8 5.9c-1.8-2.1-5.1-2.2-7-.3L12 7.4l-1.8-1.8c-1.9-1.9-5.2-1.8-7 .3-1.7 2-1.4 5 .5 6.9L12 21l8.3-8.2c1.9-1.9 2.2-4.9.5-6.9Z"
    />
  </svg>
);

function HeaderNext({
  lang,
  view,
  hasNewShopProducts,
  hasNewJournalArticle,
  cartCount,
  wishlistCount,
  onHome,
  onShop,
  onJournal,
  onCommunity,
  onExhibition,
  onCart,
  onWishlist,
  onLanguage,
  onHowItWorks,
  onDiscoverySets,
  onWhyPlayNice,
  onScentRequest
}) {
  const rootRef = useRef(null);
  const railRef = useRef(null);
  const itemRefs = useRef({});
  const motionTimerRef = useRef(null);
  const [hoveredKey, setHoveredKey] = useState("");
  const [lensStyle, setLensStyle] = useState({ opacity: 0 });
  const [lensMoving, setLensMoving] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const copy = useMemo(
    () =>
      lang === "sr"
        ? {
            home: "Početna",
            shop: "Shop",
            journal: "Le Journal",
            community: "Zajednica",
            exhibition: "Izložba",
            exhibitionNote: "Ideje koje traju",
            discover: "Otkrij",
            how: "Kako funkcioniše",
            sets: "Discovery setovi",
            why: "Zašto PlayNice",
            scent: "Predloži parfem",
            menu: "Meni",
            close: "Zatvori meni",
            cart: "Korpa",
            wishlist: "Private Selection",
            language: "Promijeni jezik"
          }
        : {
            home: "Home",
            shop: "Shop",
            journal: "Le Journal",
            community: "Community",
            exhibition: "Exhibition",
            exhibitionNote: "Still Great Ideas",
            discover: "Discover",
            how: "How it works",
            sets: "Discovery Sets",
            why: "Why PlayNice",
            scent: "Scent Request",
            menu: "Menu",
            close: "Close menu",
            cart: "Cart",
            wishlist: "Private Selection",
            language: "Change language"
          },
    [lang]
  );

  const primaryItems = useMemo(
    () => [
      { key: "home", label: copy.home, action: onHome },
      { key: "shop", label: copy.shop, action: onShop, isNew: hasNewShopProducts },
      { key: "journal", label: copy.journal, action: onJournal, hasUnread: hasNewJournalArticle },
      { key: "community", label: copy.community, action: onCommunity },
      { key: "exhibition", label: copy.exhibition, note: copy.exhibitionNote, action: onExhibition }
    ],
    [
      copy,
      hasNewJournalArticle,
      hasNewShopProducts,
      onCommunity,
      onExhibition,
      onHome,
      onJournal,
      onShop
    ]
  );

  const discoverItems = useMemo(
    () => [
      { key: "how", label: copy.how, action: onHowItWorks },
      { key: "sets", label: copy.sets, action: onDiscoverySets },
      { key: "why", label: copy.why, action: onWhyPlayNice },
      { key: "scent", label: copy.scent, action: onScentRequest }
    ],
    [copy, onDiscoverySets, onHowItWorks, onScentRequest, onWhyPlayNice]
  );

  const activeKey =
    view === "shop"
      ? "shop"
      : view === "journal"
      ? "journal"
      : view === "exhibition"
      ? "exhibition"
      : "home";
  const lensTarget = hoveredKey || activeKey;

  const positionLens = useCallback((key, animate = true) => {
    const rail = railRef.current;
    const item = itemRefs.current[key];

    if (!rail || !item) return;

    const railBox = rail.getBoundingClientRect();
    const itemBox = item.getBoundingClientRect();

    setLensStyle({
      opacity: 1,
      width: `${itemBox.width}px`,
      transform: `translate3d(${itemBox.left - railBox.left}px, 0, 0)`
    });

    if (!animate) return;

    setLensMoving(true);
    window.clearTimeout(motionTimerRef.current);
    motionTimerRef.current = window.setTimeout(() => setLensMoving(false), 420);
  }, []);

  useLayoutEffect(() => {
    positionLens(lensTarget, false);
  }, [lensTarget, positionLens]);

  useEffect(() => {
    const handleResize = () => positionLens(lensTarget, false);
    const observer =
      typeof ResizeObserver !== "undefined" && railRef.current
        ? new ResizeObserver(handleResize)
        : null;

    if (observer && railRef.current) observer.observe(railRef.current);
    window.addEventListener("resize", handleResize);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [lensTarget, positionLens]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setDiscoverOpen(false);
      setMobileOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleOutsidePointer = (event) => {
      if (rootRef.current?.contains(event.target)) return;
      setDiscoverOpen(false);
      setMobileOpen(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointer);
    return () => document.removeEventListener("pointerdown", handleOutsidePointer);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(
    () => () => {
      window.clearTimeout(motionTimerRef.current);
    },
    []
  );

  const runAction = (action) => {
    setDiscoverOpen(false);
    setMobileOpen(false);
    action?.();
  };

  const renderPrimaryButton = (item, mobile = false) => (
    <button
      key={item.key}
      ref={mobile ? undefined : (node) => {
        itemRefs.current[item.key] = node;
      }}
      className={`header-next-link ${activeKey === item.key ? "is-active" : ""} ${
        item.isNew ? "has-new" : ""
      } ${item.hasUnread ? "has-unread-journal" : ""}`}
      type="button"
      onClick={() => runAction(item.action)}
      onPointerEnter={mobile ? undefined : () => {
        setHoveredKey(item.key);
        positionLens(item.key);
      }}
      onFocus={mobile ? undefined : () => {
        setHoveredKey(item.key);
        positionLens(item.key);
      }}
      aria-current={activeKey === item.key ? "page" : undefined}
      aria-label={item.note ? `${item.label} — ${item.note}` : item.label}
    >
      <span>{item.label}</span>
      {item.isNew && <small className="header-next-new">NEW</small>}
    </button>
  );

  return (
    <header
      ref={rootRef}
      className={`header-next ${mobileOpen ? "is-mobile-open" : ""}`}
    >
      <div className="header-next-bar">
        <button className="header-next-brand" type="button" onClick={() => runAction(onHome)}>
          <span>PlayNice</span>
          <small>Remember. PlayNice.</small>
        </button>

        <div className="header-next-center">
          <nav
            className="header-next-rail"
            ref={railRef}
            aria-label="Primary navigation"
            onPointerLeave={() => {
              setHoveredKey("");
              positionLens(activeKey);
            }}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setHoveredKey("");
                positionLens(activeKey);
              }
            }}
          >
            <span
              className={`header-next-lens ${lensMoving ? "is-moving" : ""}`}
              style={lensStyle}
              aria-hidden="true"
            />
            {primaryItems.map((item) => renderPrimaryButton(item))}
          </nav>

          <div className={`header-next-discover ${discoverOpen ? "is-open" : ""}`}>
            <button
              ref={(node) => {
                itemRefs.current.discover = node;
              }}
              className="header-next-discover-trigger"
              type="button"
              aria-expanded={discoverOpen}
              aria-controls="header-next-discover-panel"
              onClick={() => setDiscoverOpen((current) => !current)}
            >
              <span>{copy.discover}</span>
              <i className="header-next-discover-chevron" aria-hidden="true" />
            </button>

            <div
              className="header-next-discover-panel"
              id="header-next-discover-panel"
              aria-hidden={!discoverOpen}
            >
              {discoverItems.map((item, index) => (
                <button
                  key={item.key}
                  type="button"
                  style={{ "--discover-index": index }}
                  onClick={() => runAction(item.action)}
                >
                  <span className="header-next-discover-label">
                    {item.label}
                  </span>

                  <span
                    className="header-next-discover-arrow"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="header-next-utility">
  <button
    className="header-next-language"
    type="button"
    onClick={onLanguage}
    aria-label={copy.language}
  >
    {lang.toUpperCase()}
  </button>

  <button
    type="button"
    onClick={onWishlist}
    aria-label={copy.wishlist}
    title={copy.wishlist}
  >
    <HeartIcon filled={wishlistCount > 0} />
    {wishlistCount > 0 && (
      <span className="header-next-count is-heart">
        {wishlistCount}
      </span>
    )}
  </button>

  <button
    type="button"
    onClick={onCart}
    aria-label={copy.cart}
    title={copy.cart}
  >
    <CartIcon />
    {cartCount > 0 && (
      <span className="header-next-count">
        {cartCount}
      </span>
    )}
  </button>
</div>

        <div className="header-next-mobile-actions">
          <button
            type="button"
            onClick={() => runAction(onWishlist)}
            aria-label={copy.wishlist}
          >
            <HeartIcon filled={wishlistCount > 0} />
            {wishlistCount > 0 && <span className="header-next-count is-heart">{wishlistCount}</span>}
          </button>
          <button type="button" onClick={() => runAction(onCart)} aria-label={copy.cart}>
            <CartIcon />
            {cartCount > 0 && <span className="header-next-count">{cartCount}</span>}
          </button>
          <button
            className={`header-next-menu-trigger ${mobileOpen ? "is-open" : ""}`}
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            aria-expanded={mobileOpen}
            aria-controls="header-next-mobile-panel"
            aria-label={mobileOpen ? copy.close : copy.menu}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      <div
        className="header-next-mobile-panel"
        id="header-next-mobile-panel"
        aria-hidden={!mobileOpen}
      >
        <div className="header-next-mobile-primary">
          {primaryItems.map((item, index) => (
            <div key={item.key} style={{ "--mobile-index": index }}>
              {renderPrimaryButton(item, true)}
              {item.note && <small>{item.note}</small>}
            </div>
          ))}
        </div>

        <div className="header-next-mobile-discover">
          <p>{copy.discover}</p>
          <div>
            {discoverItems.map((item, index) => (
              <button
                key={item.key}
                type="button"
                style={{ "--mobile-index": index + primaryItems.length }}
                onClick={() => runAction(item.action)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button className="header-next-mobile-language" type="button" onClick={onLanguage}>
          <span>{copy.language}</span>
          <strong>{lang === "sr" ? "SR / EN" : "EN / SR"}</strong>
        </button>
      </div>
    </header>
  );
}

export default HeaderNext;
