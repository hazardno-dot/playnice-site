import { useEffect } from "react";
import "./MobileCommunityV2.css";

const MOBILE_QUERY = "(max-width: 640px)";
const ACTIVE_VISIBLE = 5;
const ADDED_VISIBLE = 4;
const ACTIVATION_MARGIN = "700px 0px";

function MobileCommunityV2() {
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);

    let contentObserver = null;
    let proximityObserver = null;
    let currentSection = null;
    let scheduled = false;
    let focusScheduled = false;
    let enhanceFrame = 0;
    let focusFrame = 0;
    let bindFrame = 0;
    let active = false;

    const isEnglish = (section) => {
      const kicker = section?.querySelector(".scent-request-kicker")?.textContent || "";
      return /community/i.test(kicker);
    };

    const revealLabel = (type, english, expanded) => {
      if (type === "active") {
        if (expanded) {
          return english ? "SHOW LESS REQUESTS" : "PRIKAŽI MANJE ZAHTEVA";
        }
        return english ? "SHOW ALL REQUESTS" : "PRIKAŽI SVE ZAHTEVE";
      }

      if (expanded) {
        return english ? "SHOW LESS ADDED SCENTS" : "PRIKAŽI MANJE DODATIH PARFEMA";
      }
      return english ? "SHOW ALL ADDED SCENTS" : "PRIKAŽI SVE DODATE PARFEME";
    };

    const updateCommunityFocus = () => {
      focusScheduled = false;
      focusFrame = 0;

      if (!media.matches || !active || !currentSection) {
        document.body.classList.remove(
          "community-mobile-focus",
          "mobile-sticky-cta-suppressed"
        );
        return;
      }

      const panel =
        currentSection.querySelector(".community-request-panel-full") || currentSection;
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      const rect = panel.getBoundingClientRect();
      const hasEntered = rect.top < viewportHeight - 96;
      const communityStillOwnsBottom = rect.bottom > viewportHeight;
      const communityFocused = hasEntered && communityStillOwnsBottom;

      document.body.classList.toggle("community-mobile-focus", communityFocused);
      document.body.classList.toggle(
        "mobile-sticky-cta-suppressed",
        communityFocused
      );
    };

    const scheduleFocusUpdate = () => {
      if (!active || focusScheduled) return;
      focusScheduled = true;
      focusFrame = requestAnimationFrame(updateCommunityFocus);
    };

    const syncRevealControl = (list, items, limit, type, english, enhanceCommunity) => {
      if (!list) return;

      const parent = list.parentElement;
      if (!parent) return;

      let control = parent.querySelector(
        `.community-mobile-reveal[data-reveal="${type}"]`
      );
      const expanded = list.dataset.mobileExpanded === "true";

      items.forEach((item, index) => {
        item.classList.toggle(
          "community-mobile-hidden",
          !expanded && index >= limit
        );
      });

      if (items.length <= limit) {
        control?.remove();
        return;
      }

      if (!control) {
        control = document.createElement("button");
        control.type = "button";
        control.className = "community-mobile-reveal";
        control.dataset.reveal = type;
        control.innerHTML =
          '<span></span><strong></strong><i aria-hidden="true">↓</i><span></span>';

        control.addEventListener("click", () => {
          const willExpand = list.dataset.mobileExpanded !== "true";
          list.dataset.mobileExpanded = willExpand ? "true" : "false";
          enhanceCommunity();
        });

        list.insertAdjacentElement("afterend", control);
      }

      control.classList.toggle("is-expanded", expanded);
      control.setAttribute("aria-expanded", expanded ? "true" : "false");

      const label = control.querySelector("strong");
      if (label) label.textContent = revealLabel(type, english, expanded);

      const arrow = control.querySelector("i");
      if (arrow) arrow.textContent = expanded ? "↑" : "↓";
    };

    const enhanceCommunity = () => {
      scheduled = false;
      enhanceFrame = 0;
      if (!media.matches || !active || !currentSection) return;

      const section = currentSection;
      const english = isEnglish(section);
      const activeList = section.querySelector(".community-most-wanted-list");
      const activeItems = activeList
        ? [...activeList.querySelectorAll(":scope > .community-most-wanted-item")]
        : [];

      syncRevealControl(
        activeList,
        activeItems,
        ACTIVE_VISIBLE,
        "active",
        english,
        enhanceCommunity
      );

      const addedList = section.querySelector(".already-in-collection-list");
      const addedItems = addedList
        ? [...addedList.querySelectorAll(":scope > .already-in-collection-item")]
        : [];

      syncRevealControl(
        addedList,
        addedItems,
        ADDED_VISIBLE,
        "added",
        english,
        enhanceCommunity
      );

      scheduleFocusUpdate();
    };

    const resetDesktop = () => {
      document.body.classList.remove(
        "community-mobile-focus",
        "mobile-sticky-cta-suppressed"
      );
      document
        .querySelectorAll(".community-mobile-hidden")
        .forEach((item) => item.classList.remove("community-mobile-hidden"));
      document
        .querySelectorAll(".community-mobile-reveal")
        .forEach((control) => control.remove());
    };

    const deactivate = () => {
      active = false;
      contentObserver?.disconnect();
      contentObserver = null;
      window.removeEventListener("scroll", scheduleFocusUpdate);
      window.removeEventListener("resize", scheduleFocusUpdate);
      document.body.classList.remove(
        "community-mobile-focus",
        "mobile-sticky-cta-suppressed"
      );
    };

    const activate = () => {
      if (active || !media.matches || !currentSection) return;
      active = true;
      proximityObserver?.disconnect();
      proximityObserver = null;

      currentSection.classList.add("community-mobile-v2");

      contentObserver = new MutationObserver(() => {
        if (scheduled) return;
        scheduled = true;
        enhanceFrame = requestAnimationFrame(enhanceCommunity);
      });
      contentObserver.observe(currentSection, { childList: true, subtree: true });

      window.addEventListener("scroll", scheduleFocusUpdate, { passive: true });
      window.addEventListener("resize", scheduleFocusUpdate, { passive: true });
      enhanceCommunity();
    };

    const bindSection = () => {
      bindFrame = 0;

      if (!media.matches) {
        proximityObserver?.disconnect();
        proximityObserver = null;
        deactivate();
        currentSection?.classList.remove("community-mobile-v2");
        currentSection = null;
        resetDesktop();
        return;
      }

      const nextSection = document.querySelector(".community-requests-section");
      if (nextSection === currentSection && (active || proximityObserver)) return;

      proximityObserver?.disconnect();
      proximityObserver = null;
      deactivate();
      currentSection?.classList.remove("community-mobile-v2");
      currentSection = nextSection;

      if (!currentSection) return;

      proximityObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) activate();
        },
        { rootMargin: ACTIVATION_MARGIN }
      );
      proximityObserver.observe(currentSection);
    };

    const scheduleBind = () => {
      if (bindFrame) return;
      bindFrame = requestAnimationFrame(bindSection);
    };

    const languageObserver = new MutationObserver(() => {
      if (!active || scheduled) return;
      scheduled = true;
      enhanceFrame = requestAnimationFrame(enhanceCommunity);
    });

    languageObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    window.addEventListener("popstate", scheduleBind);
    window.addEventListener("playnice:locationchange", scheduleBind);
    media.addEventListener?.("change", scheduleBind);
    scheduleBind();

    return () => {
      languageObserver.disconnect();
      proximityObserver?.disconnect();
      deactivate();
      window.removeEventListener("popstate", scheduleBind);
      window.removeEventListener("playnice:locationchange", scheduleBind);
      media.removeEventListener?.("change", scheduleBind);
      if (enhanceFrame) cancelAnimationFrame(enhanceFrame);
      if (focusFrame) cancelAnimationFrame(focusFrame);
      if (bindFrame) cancelAnimationFrame(bindFrame);
      currentSection?.classList.remove("community-mobile-v2");
      resetDesktop();
    };
  }, []);

  return null;
}

export default MobileCommunityV2;
