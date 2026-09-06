(() => {
  const MOBILE_QUERY = "(max-width: 640px)";
  const ACTIVE_VISIBLE = 5;
  const ADDED_VISIBLE = 4;
  const media = window.matchMedia(MOBILE_QUERY);

  let sectionObserver = null;
  let contentObserver = null;
  let currentSection = null;
  let scheduled = false;

  const isEnglish = (section) => {
    const kicker = section?.querySelector(".scent-request-kicker")?.textContent || "";
    return /community/i.test(kicker);
  };

  const revealLabel = (type, english) => {
    if (type === "active") {
      return english ? "SHOW ALL REQUESTS" : "PRIKAŽI SVE ZAHTEVE";
    }

    return english ? "SHOW ALL ADDED SCENTS" : "PRIKAŽI SVE DODATE PARFEME";
  };

  const ensureRevealControl = (list, items, limit, type, english) => {
    if (!list) return;

    const parent = list.parentElement;
    if (!parent) return;

    let control = parent.querySelector(`.community-mobile-reveal[data-reveal="${type}"]`);
    const expanded = list.dataset.mobileExpanded === "true";

    items.forEach((item, index) => {
      item.classList.toggle("community-mobile-hidden", !expanded && index >= limit);
    });

    if (expanded || items.length <= limit) {
      control?.remove();
      return;
    }

    if (!control) {
      control = document.createElement("button");
      control.type = "button";
      control.className = "community-mobile-reveal";
      control.dataset.reveal = type;
      control.innerHTML = `<span></span><strong></strong><i aria-hidden="true">↓</i><span></span>`;

      control.addEventListener("click", () => {
        list.dataset.mobileExpanded = "true";
        items.forEach((item) => item.classList.remove("community-mobile-hidden"));
        control.remove();
      });

      list.insertAdjacentElement("afterend", control);
    }

    const label = control.querySelector("strong");
    if (label) label.textContent = revealLabel(type, english);
  };

  const enhanceCommunity = () => {
    scheduled = false;
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
        requestAnimationFrame(enhanceCommunity);
      });
      contentObserver.observe(section, { childList: true, subtree: true });

      sectionObserver?.disconnect();
      sectionObserver = new IntersectionObserver(
        ([entry]) => {
          document.body.classList.toggle(
            "community-mobile-focus",
            Boolean(entry?.isIntersecting) && media.matches
          );
        },
        {
          threshold: 0,
          rootMargin: "-88px 0px -54px 0px",
        }
      );
      sectionObserver.observe(section);
    }

    const english = isEnglish(section);
    const activeList = section.querySelector(".community-most-wanted-list");
    const activeItems = activeList
      ? [...activeList.querySelectorAll(":scope > .community-most-wanted-item")]
      : [];

    ensureRevealControl(
      activeList,
      activeItems,
      ACTIVE_VISIBLE,
      "active",
      english
    );

    const addedList = section.querySelector(".already-in-collection-list");
    const addedItems = addedList
      ? [...addedList.querySelectorAll(":scope > .already-in-collection-item")]
      : [];

    ensureRevealControl(
      addedList,
      addedItems,
      ADDED_VISIBLE,
      "added",
      english
    );
  };

  const resetDesktop = () => {
    document.body.classList.remove("community-mobile-focus");
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
    requestAnimationFrame(enhanceCommunity);
  });

  const start = () => {
    appObserver.observe(document.body, { childList: true, subtree: true });
    boot();
  };

  media.addEventListener?.("change", boot);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
