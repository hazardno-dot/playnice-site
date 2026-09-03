const fs = require('fs');
const path = 'playnice-site/src/App.js';
let text = fs.readFileSync(path, 'utf8');

const oldState = '  const [existingCollectionRequests, setExistingCollectionRequests] = useState([]);';
const newState = `  const [existingCollectionRequests, setExistingCollectionRequests] = useState(() => {
    const fallback = [
      { name: "Yves Saint Laurent Y Iced Cologne", votes: 27, lockedVotes: 27 },
      { name: "Prada Paradigme Eau de Parfum", votes: 25, lockedVotes: 25 },
      { name: "Valentino Uomo Born In Roma Coral Fantasy", votes: 16, lockedVotes: 16 },
      { name: "Lattafa Khamrah Waha Eau de Parfum", votes: 13, lockedVotes: 13 },
      { name: "Club De Nuit Intense Overdose", votes: 12, lockedVotes: 12 },
      { name: "Carolina Herrera Bad Boy Cobalt Eau de Parfum", votes: 5, lockedVotes: 5 },
      { name: "Rayhaan Azul Eau de Parfum", votes: 3, lockedVotes: 3 },
      { name: "Bois Impérial by Essential Parfums", votes: 1, lockedVotes: 1 },
    ];

    if (typeof window === "undefined") return fallback;

    try {
      const cached = JSON.parse(
        localStorage.getItem("playnice_existing_collection_requests_v1") || "[]"
      );

      return Array.isArray(cached) && cached.length > 0 ? cached : fallback;
    } catch {
      return fallback;
    }
  });`;

if (!text.includes('playnice_existing_collection_requests_v1") || "[]"') || text.includes(oldState)) {
  if (!text.includes(oldState)) throw new Error('existingCollectionRequests state marker not found');
  text = text.replace(oldState, newState);
}

const helperMarker = `const EXISTING_COLLECTION_LOCKED_VOTES = {
  "Yves Saint Laurent Y Iced Cologne": 27,
  "Prada Paradigme Eau de Parfum": 25,
  "Valentino Uomo Born In Roma Coral Fantasy": 16,
  "Lattafa Khamrah Waha Eau de Parfum": 13,
  "Club De Nuit Intense Overdose": 12,
  "Carolina Herrera Bad Boy Cobalt Eau de Parfum": 5,
  "Rayhaan Azul Eau de Parfum": 3,
  "Bois Impérial by Essential Parfums": 1,
};`;

const helperBlock = `${helperMarker}

const mergeExistingCollectionRequests = (requests = [], existingRequests = []) => {
  const merged = new Map();

  const addRequest = (item) => {
    if (!item?.name) return;

    const product = findExistingProductByRequest(item.name);
    if (!product) return;

    const key = String(product.id || product.slug || normalizeScentName(product.name));
    const current = merged.get(key) || {
      name: product.name,
      product,
      votes: 0,
      firstSeen: item.firstSeen || null,
    };

    const nextFirstSeen = [current.firstSeen, item.firstSeen]
      .filter(Boolean)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0] || null;

    merged.set(key, {
      ...current,
      name: product.name,
      product,
      votes: Number(current.votes || 0) + Number(item.votes || 0),
      firstSeen: nextFirstSeen,
    });
  };

  existingRequests.forEach(addRequest);
  requests.forEach(addRequest);

  Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).forEach(([name, lockedVotes]) => {
    const product = findExistingProductByRequest(name);
    if (!product) return;

    const key = String(product.id || product.slug || normalizeScentName(product.name));
    const current = merged.get(key) || {
      name: product.name,
      product,
      votes: 0,
      firstSeen: null,
    };

    merged.set(key, {
      ...current,
      name: product.name,
      product,
      lockedVotes,
    });
  });

  return Array.from(merged.values());
};`;

if (!text.includes('const mergeExistingCollectionRequests =')) {
  if (!text.includes(helperMarker)) throw new Error('locked votes marker not found');
  text = text.replace(helperMarker, helperBlock);
}

const oldLiveBlock = `      if (data.status === "ok") {
      if (Array.isArray(data.requests) && data.requests.length > 0) {
      setCommunityRequests(data.requests);
      }

      if (
        Array.isArray(data.existingRequests) &&
        data.existingRequests.length > 0
      ) {
        setExistingCollectionRequests(data.existingRequests);

        try {
          localStorage.setItem(
            "playnice_existing_collection_requests_v1",
            JSON.stringify(data.existingRequests)
          );
        } catch {}
      } else {
        try {
          const cachedExistingRequests = JSON.parse(
            localStorage.getItem("playnice_existing_collection_requests_v1") || "[]"
          );

          setExistingCollectionRequests(
            Array.isArray(cachedExistingRequests) && cachedExistingRequests.length > 0
              ? cachedExistingRequests
              : Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).map(([name, votes]) => ({
                  name,
                  votes,
                  lockedVotes: votes,
                }))
          );
        } catch {
          setExistingCollectionRequests(
            Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).map(([name, votes]) => ({
              name,
              votes,
              lockedVotes: votes,
            }))
          );
        }
      }
    }`;

const newLiveBlock = `      if (data.status === "ok") {
        const liveRequests = Array.isArray(data.requests) ? data.requests : [];
        const liveExistingRequests = Array.isArray(data.existingRequests)
          ? data.existingRequests
          : [];

        if (liveRequests.length > 0) {
          setCommunityRequests(liveRequests);
        }

        const mergedExistingRequests = mergeExistingCollectionRequests(
          liveRequests,
          liveExistingRequests
        );

        if (mergedExistingRequests.length > 0) {
          setExistingCollectionRequests(mergedExistingRequests);

          try {
            localStorage.setItem(
              "playnice_existing_collection_requests_v1",
              JSON.stringify(mergedExistingRequests)
            );
          } catch {}
        }
      }`;

if (!text.includes('const mergedExistingRequests = mergeExistingCollectionRequests(')) {
  if (!text.includes(oldLiveBlock)) throw new Error('live scent request block marker not found');
  text = text.replace(oldLiveBlock, newLiveBlock);
}

fs.writeFileSync(path, text, 'utf8');
