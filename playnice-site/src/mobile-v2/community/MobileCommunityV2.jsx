import { useEffect } from "react";
import "./MobileCommunityV2.css";

const MOBILE_QUERY = "(max-width: 640px)";
const ACTIVE_VISIBLE = 5;
const ADDED_VISIBLE = 4;

function MobileCommunityV2() {
  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);

    let contentObserver = null;
    let currentSection = null;
    let scheduled = false;
    let focusScheduled = false;
    let enhanceFrame = 0;
    let focusFrame = 0;

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

      if (!media.matches) {
        document.body.classList.remove(
          "community-mobile-focus",
          "mobile-sticky-cta-suppressed"
        );
        return;
      }

      const section = document.querySelector(".community-requests-section");
      const panel =
        section?.querySelector(".community-request-panel-full") || section;
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      let communityFocused = false;

      if (panel) {
        const rect = panel.getBoundingClientRect();
        const hasEntered = rect.top < viewportHeight - 96;
        const communityStillOwnsBottom = rect.bottom > viewportHeight;
        communityFocused = hasEntered && communityStillOwnsBottom;
      }

      document.body.classList.toggle("community-mobile-focus", communityFocused);
      document.body.classList.toggle(
        "mobile-sticky-cta-suppressed",
        communityFocused
      );
    };

    const scheduleFocusUpdate = () => {
      if (focusScheduled) return;
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
      if (!media.matches) return;

      const section = document.querySelector(".community-requests-section");
      if (!section) return;

      if (currentSection !== section) {
        currentSection = section;
        section.classList.add("community-mobile-v2");

        contentObserver?.disconnect();
        contentObserver = new MutationObserver(() => {
          if (scheduled) return;
          scheduled = true;
          enhanceFrame = requestAnimationFrame(enhanceCommunity);
        });
        contentObserver.observe(section, { childList: true, subtree: true });
      }

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

    const boot = () => {
      if (media.matches) enhanceCommunity();
      else resetDesktop();
    };

    const appObserver = new MutationObserver(() => {
      if (!media.matches || scheduled) return;
      scheduled = true;
      enhanceFrame = requestAnimationFrame(enhanceCommunity);
    });

    appObserver.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", scheduleFocusUpdate, { passive: true });
    window.addEventListener("resize", scheduleFocusUpdate, { passive: true });
    media.addEventListener?.("change", boot);
    boot();

    return () => {
      appObserver.disconnect();
      contentObserver?.disconnect();
      window.removeEventListener("scroll", scheduleFocusUpdate);
      window.removeEventListener("resize", scheduleFocusUpdate);
      media.removeEventListener?.("change", boot);
      if (enhanceFrame) cancelAnimationFrame(enhanceFrame);
      if (focusFrame) cancelAnimationFrame(focusFrame);
      currentSection?.classList.remove("community-mobile-v2");
      resetDesktop();
    };
  }, []);

  return null;
}

export default MobileCommunityV2;
