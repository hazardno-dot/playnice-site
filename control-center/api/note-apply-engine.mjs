const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const stableJson = (value) => {
  const normalize = (item) => {
    if (Array.isArray(item)) return item.map(normalize);
    if (item && typeof item === "object") return Object.keys(item).sort().reduce((out, key) => {
      if (typeof item[key] !== "undefined") out[key] = normalize(item[key]);
      return out;
    }, {});
    return item;
  };
  return JSON.stringify(normalize(value ?? null));
};

export const formatNoteKey = (value) => String(value || "")
  .split("-")
  .filter(Boolean)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(" ");

export const normalizeNotePayload = (value = {}) => {
  const key = String(value.key || value.note_key || "").trim().toLowerCase();
  return {
    key,
    srLabel: String(value.srLabel || value.sr || "").trim(),
    enLabel: String(value.enLabel || value.en || formatNoteKey(key)).trim(),
    assetPath: String(value.assetPath || (key ? `/note-map/${key}.webp` : "")).trim(),
  };
};

const extractSection = (source, startMarker, endMarker) => {
  const start = source.indexOf(startMarker);
  if (start < 0) throw new Error(`Could not locate ${startMarker}.`);
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (end < 0) throw new Error(`Could not locate ${endMarker}.`);
  return { start, end, text: source.slice(start, end) };
};

const unescape = (value) => String(value || "")
  .replace(/\\"/g, '"')
  .replace(/\\n/g, "\n")
  .replace(/\\'/g, "'")
  .replace(/\\\\/g, "\\");

export function findLibraryEntry(source, key) {
  const section = extractSection(source, "const NOTE_LIBRARY = {", "const NOTE_SR = {");
  const escaped = escapeRegex(key);
  const pattern = new RegExp(`(?:^|\\n)(\\s*)(?:${escaped}|[\"']${escaped}[\"'])\\s*:\\s*\\{([\\s\\S]*?)\\n\\1\\},?`, "m");
  const match = pattern.exec(section.text);
  if (!match) return null;
  const relativeStart = match.index + (match[0].startsWith("\n") ? 1 : 0);
  const block = match[0].startsWith("\n") ? match[0].slice(1) : match[0];
  return { start: section.start + relativeStart, end: section.start + relativeStart + block.length, block, body: match[2], indent: match[1] || "  " };
}

export function findSrEntry(source, key) {
  const section = extractSection(source, "const NOTE_SR = {", "const NOTE_LEVELS = [");
  const escaped = escapeRegex(key);
  const pattern = new RegExp(`(?:^|\\n)(\\s*)(?:${escaped}|[\"']${escaped}[\"'])\\s*:\\s*\"((?:\\\\.|[^\"])*)\"\\s*,?`, "m");
  const match = pattern.exec(section.text);
  if (!match) return null;
  const relativeStart = match.index + (match[0].startsWith("\n") ? 1 : 0);
  const block = match[0].startsWith("\n") ? match[0].slice(1) : match[0];
  return { start: section.start + relativeStart, end: section.start + relativeStart + block.length, block, value: unescape(match[2]) };
}

export function resolveLiveNote(source, key) {
  const library = findLibraryEntry(source, key);
  if (library) {
    const sr = library.body.match(/\bsr\s*:\s*"((?:\\.|[^"])*)"/);
    const en = library.body.match(/\ben\s*:\s*"((?:\\.|[^"])*)"/);
    const image = library.body.match(/\bimage\s*:\s*"((?:\\.|[^"])*)"/);
    const fallback = library.body.match(/\bfallback\s*:\s*"((?:\\.|[^"])*)"/);
    return {
      payload: normalizeNotePayload({ key, srLabel: sr ? unescape(sr[1]) : "", enLabel: en ? unescape(en[1]) : formatNoteKey(key), assetPath: image ? unescape(image[1]) : `/note-map/${key}.webp` }),
      mode: "library",
      fallback: fallback ? unescape(fallback[1]) : "•",
      block: library.block,
    };
  }
  const sr = findSrEntry(source, key);
  if (!sr) return null;
  return { payload: normalizeNotePayload({ key, srLabel: sr.value, enLabel: formatNoteKey(key), assetPath: `/note-map/${key}.webp` }), mode: "sr", fallback: "•", block: sr.block };
}

export function noteExists(source, key) {
  return Boolean(findLibraryEntry(source, key) || findSrEntry(source, key));
}

export function renderLibraryEntry(payload, fallback = "•") {
  const value = normalizeNotePayload(payload);
  return [
    `  ${JSON.stringify(value.key)}: {`,
    `    sr: ${JSON.stringify(value.srLabel)},`,
    `    en: ${JSON.stringify(value.enLabel)},`,
    `    image: ${JSON.stringify(value.assetPath)},`,
    `    fallback: ${JSON.stringify(fallback || "•")},`,
    "  },",
  ].join("\n");
}

export function upsertLibraryNote(source, payload) {
  const value = normalizeNotePayload(payload);
  const existing = findLibraryEntry(source, value.key);
  const live = resolveLiveNote(source, value.key);
  const rendered = renderLibraryEntry(value, live?.fallback || "•");
  if (existing) {
    return { source: source.slice(0, existing.start) + rendered + source.slice(existing.end), before: existing.block, after: rendered, mode: "replace-library" };
  }
  const marker = "const NOTE_SR = {";
  const sectionEnd = source.indexOf(marker);
  if (sectionEnd < 0) throw new Error("Could not locate NOTE_LIBRARY boundary.");
  const close = source.lastIndexOf("};", sectionEnd);
  if (close < 0) throw new Error("Could not locate NOTE_LIBRARY closing brace.");
  const prefix = source.slice(0, close).replace(/\s*$/, "");
  const suffix = source.slice(close);
  return { source: `${prefix}\n${rendered}\n${suffix}`, before: null, after: rendered, mode: live ? "promote-to-library" : "insert-library" };
}
