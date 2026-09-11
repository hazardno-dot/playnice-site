import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.resolve(__dirname, "../src/App.js");
let source = fs.readFileSync(appPath, "utf8").replace(/\r\n/g, "\n");

const MARKER = "HOME_TWO_PHASE_MOUNT";

if (source.includes(MARKER)) {
  console.log("Home two-phase transform already applied.");
  process.exit(0);
}

const replaceOnce = (label, search, replacement) => {
  const index = source.indexOf(search);
  if (index === -1) {
    throw new Error(`Home two-phase transform: ${label} anchor not found`);
  }

  if (source.indexOf(search, index + search.length) !== -1) {
    throw new Error(`Home two-phase transform: ${label} anchor is not unique`);
  }

  source = source.slice(0, index) + replacement + source.slice(index + search.length);
};

// 1) Home readiness state: first commit keeps only the critical viewport.
replaceOnce(
  "home readiness state",
  "const [communityTopThreeEntries, setCommunityTopThreeEntries] = useState({});\n\nconst isNewRequest",
  `const [communityTopThreeEntries, setCommunityTopThreeEntries] = useState({});\n\n// ${MARKER}: defer non-critical Home DOM until after the first paint.\nconst [homeDeferredReady, setHomeDeferredReady] = useState(() =>\n  getInitialView() !== \"home\"\n);\n\nconst isNewRequest`
);

// 2) Community data must not race the Hero/LCP path.
replaceOnce(
  "community loaded ref",
  "  const communityVoteInFlightRef = useRef(new Set());\n",
  "  const communityVoteInFlightRef = useRef(new Set());\n  const communityRequestsLoadedRef = useRef(false);\n"
);

// 3) Do not filter/sort the full Shop catalog while rendering Home.
replaceOnce(
  "shop filtering gate",
  " const filteredProducts = useMemo(() => {\n    const sourceProducts = heroCollectionFilter?.length",
  " const filteredProducts = useMemo(() => {\n    if (view !== \"shop\") return [];\n\n    const sourceProducts = heroCollectionFilter?.length"
);
replaceOnce(
  "shop filtering dependency",
  "}, [category, searchTerm, season, scentMood, sortBy, heroCollectionFilter]);",
  "}, [view, category, searchTerm, season, scentMood, sortBy, heroCollectionFilter]);"
);

// 4) New Arrivals and Discovery Builder data are only needed once their UI can mount.
replaceOnce(
  "new arrivals gate",
  "const newArrivalProducts = getJustInProducts(products);",
  "const newArrivalProducts = homeDeferredReady ? getJustInProducts(products) : [];"
);
replaceOnce(
  "discovery products gate",
  "const discoveryProducts = products.filter(\n  (product) =>\n    activeDiscoveryConfig.categories.includes(product.category) &&\n    product.sizes?.[activeDiscoveryConfig.size]\n);",
  "const discoveryProducts = discoveryBuilderOpen\n  ? products.filter(\n      (product) =>\n        activeDiscoveryConfig.categories.includes(product.category) &&\n        product.sizes?.[activeDiscoveryConfig.size]\n    )\n  : [];"
);

// 5) Release the second Home phase after the browser has had a paint opportunity.
const effectsAnchor = `/* =========================================\n   EFFECTS\n========================================= */\n`;
replaceOnce(
  "deferred Home effect",
  effectsAnchor,
  `${effectsAnchor}  useEffect(() => {\n    if (view !== \"home\" || homeDeferredReady) return undefined;\n\n    let idleId = null;\n    let timeoutId = null;\n    let secondFrame = null;\n\n    const releaseDeferredHome = () => {\n      setHomeDeferredReady(true);\n    };\n\n    const firstFrame = window.requestAnimationFrame(() => {\n      secondFrame = window.requestAnimationFrame(() => {\n        if (typeof window.requestIdleCallback === \"function\") {\n          idleId = window.requestIdleCallback(releaseDeferredHome, { timeout: 900 });\n        } else {\n          timeoutId = window.setTimeout(releaseDeferredHome, 0);\n        }\n      });\n    });\n\n    return () => {\n      window.cancelAnimationFrame(firstFrame);\n      if (secondFrame !== null) window.cancelAnimationFrame(secondFrame);\n      if (idleId !== null && typeof window.cancelIdleCallback === \"function\") {\n        window.cancelIdleCallback(idleId);\n      }\n      if (timeoutId !== null) window.clearTimeout(timeoutId);\n    };\n  }, [view, homeDeferredReady]);\n\n`
);

// 6) Effects whose targets live in phase two must rerun when phase two mounts.
replaceOnce(
  "closing observer gate",
  "  useEffect(() => {\n    if (view !== \"home\" || closingVisible) return;",
  "  useEffect(() => {\n    if (view !== \"home\" || !homeDeferredReady || closingVisible) return;"
);
replaceOnce(
  "closing observer deps",
  "  }, [view, closingVisible]);",
  "  }, [view, homeDeferredReady, closingVisible]);"
);
replaceOnce(
  "video frame gate",
  "  const videoFrame = videoFrameRef.current;\n  if (!videoFrame) return;",
  "  if (!homeDeferredReady) return;\n\n  const videoFrame = videoFrameRef.current;\n  if (!videoFrame) return;"
);
replaceOnce(
  "video effect deps",
  "}, [view]);\n\nuseEffect(() => {\n  const video = videoRef.current;",
  "}, [view, homeDeferredReady]);\n\nuseEffect(() => {\n  const video = videoRef.current;"
);

// 7) Community live data starts only when the deferred section is near the viewport.
const scentStart = source.indexOf("/* =========================================\n   SCENT REQUESTS COUNTER USEEFFECT\n========================================= */");
const vibeStart = source.indexOf("/* =========================================\n   VIBE TRACKER I RESOLVER\n========================================= */", scentStart);

if (scentStart === -1 || vibeStart === -1 || vibeStart <= scentStart) {
  throw new Error("Home two-phase transform: scent request effect boundaries not found");
}

const scentEffect = `/* =========================================\n   SCENT REQUESTS COUNTER USEEFFECT\n========================================= */\n\nuseEffect(() => {\n  if (view !== \"home\" || !homeDeferredReady || communityRequestsLoadedRef.current) {\n    return undefined;\n  }\n\n  let isMounted = true;\n  let observer = null;\n\n  const loadScentRequests = async () => {\n    if (communityRequestsLoadedRef.current) return;\n\n    try {\n      const response = await fetch(\n        \"https://script.google.com/macros/s/AKfycby38XWvXcD6Cgw2_ExKEpegaYg-mgiuYLVXzDgcwefVSCZtyWVL2QvVQzmX7nrltene/exec\"\n      );\n\n      const data = await response.json();\n\n      if (!isMounted) return;\n      communityRequestsLoadedRef.current = true;\n\n      if (data.status === \"ok\") {\n        const liveRequests = Array.isArray(data.requests) ? data.requests : [];\n        const liveExistingRequests = Array.isArray(data.existingRequests)\n          ? data.existingRequests\n          : [];\n\n        if (liveRequests.length > 0) {\n          setCommunityRequests(liveRequests);\n        }\n\n        const mergedExistingRequests = mergeExistingCollectionRequests(\n          liveRequests,\n          liveExistingRequests\n        );\n\n        if (mergedExistingRequests.length > 0) {\n          setExistingCollectionRequests(mergedExistingRequests);\n\n          try {\n            localStorage.setItem(\n              \"playnice_existing_collection_requests_v1\",\n              JSON.stringify(mergedExistingRequests)\n            );\n          } catch {}\n        }\n      }\n    } catch (error) {\n      if (isMounted) {\n        communityRequestsLoadedRef.current = false;\n      }\n      console.error(\"Failed to load scent requests:\", error);\n\n      try {\n        const cachedExistingRequests = JSON.parse(\n          localStorage.getItem(\"playnice_existing_collection_requests_v1\") || \"[]\"\n        );\n\n        setExistingCollectionRequests(\n          Array.isArray(cachedExistingRequests) && cachedExistingRequests.length > 0\n            ? cachedExistingRequests\n            : Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).map(([name, votes]) => ({\n                name,\n                votes,\n                lockedVotes: votes,\n              }))\n        );\n      } catch {\n        setExistingCollectionRequests(\n          Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).map(([name, votes]) => ({\n            name,\n            votes,\n            lockedVotes: votes,\n          }))\n        );\n      }\n    }\n  };\n\n  const section = document.querySelector(\".community-requests-section\");\n\n  if (!section || typeof IntersectionObserver === \"undefined\") {\n    loadScentRequests();\n  } else {\n    observer = new IntersectionObserver(\n      ([entry]) => {\n        if (!entry.isIntersecting) return;\n        observer?.disconnect();\n        loadScentRequests();\n      },\n      {\n        threshold: 0.01,\n        rootMargin: \"700px 0px\"\n      }\n    );\n\n    observer.observe(section);\n  }\n\n  return () => {\n    isMounted = false;\n    observer?.disconnect();\n  };\n}, [view, homeDeferredReady]);\n\n`;

source = source.slice(0, scentStart) + scentEffect + source.slice(vibeStart);

// 8) Keep Hero + value strip in phase one. Everything after it mounts in phase two.
replaceOnce(
  "Home deferred block start",
  `</section>\n\n{/* PLAYNICE FRAGRANCE INTELLIGENCE — V6 */}`,
  `</section>\n\n{homeDeferredReady && (\n  <>\n{/* PLAYNICE FRAGRANCE INTELLIGENCE — V6 */}`
);
replaceOnce(
  "Home deferred block end",
  `            </section>\n          </>\n        )}\n\n          {view === \"shop\" && (`,
  `            </section>\n          </>\n        )}\n          </>\n        )}\n\n          {view === \"shop\" && (`
);

// 9) Section navigation must force phase two before attempting to scroll.
replaceOnce(
  "home section navigation",
  `const goToHomeSection = (selector, block = \"start\") => {\n  const isAlreadyHome = view === \"home\";\n\n  switchView(\"home\", { scrollTop: false });`,
  `const goToHomeSection = (selector, block = \"start\") => {\n  const isAlreadyHome = view === \"home\";\n\n  setHomeDeferredReady(true);\n  switchView(\"home\", { scrollTop: false });`
);
replaceOnce(
  "journal scent request navigation",
  `  if (target === \"scent-request\") {\n    switchView(\"home\", { scrollTop: false });`,
  `  if (target === \"scent-request\") {\n    setHomeDeferredReady(true);\n    switchView(\"home\", { scrollTop: false });`
);

fs.writeFileSync(appPath, source, "utf8");
console.log("Applied guarded Home two-phase mount transform.");
