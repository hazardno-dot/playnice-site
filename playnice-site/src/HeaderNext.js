import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import "./HeaderNext.css";

const CartIcon = ({ filled = false }) => (
  <span className={`header-next-cart-icon ${filled ? "is-full" : ""}`}>
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        className="cart-outline"
        d="M3.5 4.5h2.2l1.5 9.2h10.9l2-6.8H6.3"
      />
      <path
        className="cart-handle"
        d="M7.3 13.7h10.5"
      />
      <circle cx="9" cy="18.2" r="1.15" />
      <circle cx="17" cy="18.2" r="1.15" />

      {filled && (
        <>
          <rect x="8.2" y="8.1" width="3.4" height="3.5" rx="0.5" />
          <rect x="12.4" y="7.3" width="3.5" height="4.3" rx="0.5" />
          <rect x="16.3" y="8.6" width="2.4" height="3" rx="0.45" />
        </>
      )}
    </svg>
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

const BRAND_TAGLINES = [
  "Remember. PlayNice.",
  "Try before you buy",
  "Fragrance Intelligence"
];

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
  const brandFlipTimerRef = useRef(null);
  const brandFlipResetRef = useRef(null);
  const languageSpinTimerRef = useRef(null);
  const languageSwitchTimerRef = useRef(null);
  const previousCartCountRef = useRef(cartCount);
  const cartSpinTimerRef = useRef(null);
  const cartSwitchTimerRef = useRef(null);
  const cartSpinStartTimerRef = useRef(null);
  const previousWishlistCountRef = useRef(wishlistCount);
  const wishlistBeatTimerRef = useRef(null);
  const wishlistFeedbackTimerRef = useRef(null);
  const [hoveredKey, setHoveredKey] = useState("");
  const [lensStyle, setLensStyle] = useState({ opacity: 0 });
  const [lensMoving, setLensMoving] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [brandTaglineIndex, setBrandTaglineIndex] = useState(0);
  const [brandTaglinePhase, setBrandTaglinePhase] = useState("idle");
  const [languageSpinning, setLanguageSpinning] = useState(false);
  const [cartSpinning, setCartSpinning] = useState(false);
  const [cartFeedbackCount, setCartFeedbackCount] = useState(null);
  const [wishlistBeating, setWishlistBeating] = useState(false);
  const [wishlistFeedbackCount, setWishlistFeedbackCount] = useState(null);

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
            discover: "Istraži",
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

  const handleLanguageSpin = () => {
    if (languageSpinning) return;

    setLanguageSpinning(true);

    window.clearTimeout(languageSwitchTimerRef.current);
    window.clearTimeout(languageSpinTimerRef.current);

    languageSwitchTimerRef.current = window.setTimeout(() => {
      onLanguage?.();
    }, 290);

    languageSpinTimerRef.current = window.setTimeout(() => {
      setLanguageSpinning(false);
    }, 620);
  };

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
      window.clearTimeout(languageSwitchTimerRef.current);
      window.clearTimeout(languageSpinTimerRef.current);
      window.clearTimeout(cartSwitchTimerRef.current);
      window.clearTimeout(cartSpinTimerRef.current);
      window.clearTimeout(cartSpinStartTimerRef.current);
      window.clearTimeout(wishlistBeatTimerRef.current);
      window.clearTimeout(wishlistFeedbackTimerRef.current);
    },
    []
  );

  useEffect(() => {
    const startFlip = () => {
      setBrandTaglinePhase("out");

      brandFlipTimerRef.current = window.setTimeout(() => {
        setBrandTaglineIndex(
          (current) => (current + 1) % BRAND_TAGLINES.length
        );

        setBrandTaglinePhase("in");

        brandFlipResetRef.current = window.setTimeout(() => {
          setBrandTaglinePhase("idle");
        }, 480);
      }, 360);
    };

    const interval = window.setInterval(startFlip, 5000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(brandFlipTimerRef.current);
      window.clearTimeout(brandFlipResetRef.current);
    };
  }, []);

  useEffect(() => {
  const previousCount = previousCartCountRef.current;

  if (cartCount > previousCount) {
    window.clearTimeout(cartSpinStartTimerRef.current);
    window.clearTimeout(cartSwitchTimerRef.current);
    window.clearTimeout(cartSpinTimerRef.current);

    // 1. Odmah pokaži novi broj
    setCartFeedbackCount(cartCount);
    setCartSpinning(false);

    // 2. Daj broju 320ms da se jasno vidi
    cartSpinStartTimerRef.current = window.setTimeout(() => {
      setCartSpinning(true);
    }, 320);

    // 3. Tokom skrivene polovine spina broj postaje puna kolica
    cartSwitchTimerRef.current = window.setTimeout(() => {
      setCartFeedbackCount(null);
    }, 600);

    // 4. Završetak cijele sekvence
    cartSpinTimerRef.current = window.setTimeout(() => {
      setCartSpinning(false);
    }, 920);
  }

  previousCartCountRef.current = cartCount;
}, [cartCount]);

  useEffect(() => {
    const previousCount = previousWishlistCountRef.current;

    if (wishlistCount > previousCount) {
      window.clearTimeout(wishlistBeatTimerRef.current);
      window.clearTimeout(wishlistFeedbackTimerRef.current);

      setWishlistFeedbackCount(wishlistCount);
      setWishlistBeating(false);

      requestAnimationFrame(() => {
        setWishlistBeating(true);
      });

      wishlistFeedbackTimerRef.current = window.setTimeout(() => {
        setWishlistFeedbackCount(null);
      }, 540);

      wishlistBeatTimerRef.current = window.setTimeout(() => {
        setWishlistBeating(false);
      }, 700);
    }

    previousWishlistCountRef.current = wishlistCount;
  }, [wishlistCount]);

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
        <button
          className="header-next-brand"
          type="button"
          onClick={() => runAction(onHome)}
        >
          <span>PlayNice</span>

          <small
            className={`header-next-brand-tagline is-${brandTaglinePhase}`}
            aria-hidden="true"
          >
            <span>{BRAND_TAGLINES[brandTaglineIndex]}</span>
          </small>
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
    className={`header-next-language ${
      languageSpinning ? "is-spinning" : ""
    }`}
    type="button"
    onClick={handleLanguageSpin}
    aria-label={copy.language}
    aria-busy={languageSpinning}
    disabled={languageSpinning}
  >
    <span>{lang.toUpperCase()}</span>
  </button>

  <button
    className={`header-next-wishlist-button ${
      wishlistBeating ? "is-beating" : ""
    }`}
    type="button"
    onClick={onWishlist}
    aria-label={copy.wishlist}
    title={copy.wishlist}
  >
    <span
      className={`header-next-heart-wrap ${
        wishlistFeedbackCount !== null ? "is-feedback" : ""
      }`}
    >
      <HeartIcon filled={wishlistCount > 0} />

      {wishlistFeedbackCount !== null && (
        <span className="header-next-heart-feedback">
          {wishlistFeedbackCount}
        </span>
      )}
    </span>
  </button>

  <button
    className={`header-next-cart-button ${
      cartSpinning ? "is-spinning" : ""
    }`}
    type="button"
    onClick={onCart}
    aria-label={copy.cart}
    title={copy.cart}
  >
    {cartFeedbackCount !== null ? (
      <span className="header-next-cart-feedback">
        {cartFeedbackCount}
      </span>
    ) : (
      <CartIcon filled={cartCount > 0} />
    )}
  </button>
</div>

    <div className="header-next-mobile-menu">
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

    <div className="header-next-mobile-actions">
      <button
        className={`header-next-wishlist-button ${
          wishlistBeating ? "is-beating" : ""
        }`}
        type="button"
        onClick={() => runAction(onWishlist)}
        aria-label={copy.wishlist}
        title={copy.wishlist}
      >
        <span
          className={`header-next-heart-wrap ${
            wishlistFeedbackCount !== null ? "is-feedback" : ""
          }`}
        >
          <HeartIcon filled={wishlistCount > 0} />

          {wishlistFeedbackCount !== null && (
            <span className="header-next-heart-feedback">
              {wishlistFeedbackCount}
            </span>
          )}
        </span>
      </button>

      <button
        className={`header-next-cart-button ${
          cartSpinning ? "is-spinning" : ""
        }`}
        type="button"
        onClick={() => runAction(onCart)}
        aria-label={copy.cart}
      >
        {cartFeedbackCount !== null ? (
          <span className="header-next-cart-feedback">
            {cartFeedbackCount}
          </span>
        ) : (
          <CartIcon filled={cartCount > 0} />
        )}
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
