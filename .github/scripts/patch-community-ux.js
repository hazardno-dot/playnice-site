const fs = require('fs');
const path = 'playnice-site/src/App.js';
let text = fs.readFileSync(path, 'utf8');

const oldScroll = '  productModalReturnScrollRef.current = window.scrollY;\n';
const newScroll = '  const requestScrollY = window.scrollY || window.pageYOffset || 0;\n  productModalReturnScrollRef.current = requestScrollY;\n  productModalScrollYRef.current = requestScrollY;\n';
if (!text.includes(newScroll)) {
  if (!text.includes(oldScroll)) throw new Error('scroll marker not found');
  text = text.replace(oldScroll, newScroll);
}

const oldExisting = `      if (\n      Array.isArray(data.existingRequests) &&\n      data.existingRequests.length > 0\n      )   {\n      setExistingCollectionRequests(data.existingRequests);\n      }`;

const newExisting = `      if (\n        Array.isArray(data.existingRequests) &&\n        data.existingRequests.length > 0\n      ) {\n        setExistingCollectionRequests(data.existingRequests);\n\n        try {\n          localStorage.setItem(\n            "playnice_existing_collection_requests_v1",\n            JSON.stringify(data.existingRequests)\n          );\n        } catch {}\n      } else {\n        try {\n          const cachedExistingRequests = JSON.parse(\n            localStorage.getItem("playnice_existing_collection_requests_v1") || "[]"\n          );\n\n          setExistingCollectionRequests(\n            Array.isArray(cachedExistingRequests) && cachedExistingRequests.length > 0\n              ? cachedExistingRequests\n              : Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).map(([name, votes]) => ({\n                  name,\n                  votes,\n                  lockedVotes: votes,\n                }))\n          );\n        } catch {\n          setExistingCollectionRequests(\n            Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).map(([name, votes]) => ({\n              name,\n              votes,\n              lockedVotes: votes,\n            }))\n          );\n        }\n      }`;

if (!text.includes('playnice_existing_collection_requests_v1')) {
  if (!text.includes(oldExisting)) throw new Error('existing requests marker not found');
  text = text.replace(oldExisting, newExisting);
}

const oldCatch = `    } catch (error) {\n      console.error("Failed to load scent requests:", error);\n    }`;
const newCatch = `    } catch (error) {\n      console.error("Failed to load scent requests:", error);\n\n      try {\n        const cachedExistingRequests = JSON.parse(\n          localStorage.getItem("playnice_existing_collection_requests_v1") || "[]"\n        );\n\n        setExistingCollectionRequests(\n          Array.isArray(cachedExistingRequests) && cachedExistingRequests.length > 0\n            ? cachedExistingRequests\n            : Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).map(([name, votes]) => ({\n                name,\n                votes,\n                lockedVotes: votes,\n              }))\n        );\n      } catch {\n        setExistingCollectionRequests(\n          Object.entries(EXISTING_COLLECTION_LOCKED_VOTES).map(([name, votes]) => ({\n            name,\n            votes,\n            lockedVotes: votes,\n          }))\n        );\n      }\n    }`;
if (!text.includes(newCatch)) {
  if (!text.includes(oldCatch)) throw new Error('load catch marker not found');
  text = text.replace(oldCatch, newCatch);
}

fs.writeFileSync(path, text);
