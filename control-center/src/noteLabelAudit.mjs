const extractBlock = (source, startMarker, endMarker) => {
  const start = source.indexOf(startMarker);
  if (start < 0) return "";
  const from = start + startMarker.length;
  const end = source.indexOf(endMarker, from);
  return end < 0 ? source.slice(from) : source.slice(from, end);
};

const unescapeString = (value) => String(value || "")
  .replace(/\\"/g, '"')
  .replace(/\\n/g, "\n")
  .replace(/\\'/g, "'")
  .replace(/\\\\/g, "\\");

export function parseNoteLabels(source = "") {
  const librarySource = extractBlock(source, "const NOTE_LIBRARY = {", "const NOTE_SR = {");
  const srSource = extractBlock(source, "const NOTE_SR = {", "const NOTE_LEVELS = [");

  const library = {};
  const libraryEntry = /(?:^|\n)\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_-]+))\s*:\s*\{([\s\S]*?)\n\s*\},?/g;
  let match;
  while ((match = libraryEntry.exec(librarySource))) {
    const key = match[1] || match[2] || match[3];
    const body = match[4] || "";
    const sr = body.match(/\bsr\s*:\s*"((?:\\.|[^"])*)"/);
    const en = body.match(/\ben\s*:\s*"((?:\\.|[^"])*)"/);
    const image = body.match(/\bimage\s*:\s*"((?:\\.|[^"])*)"/);
    library[key] = {
      sr: sr ? unescapeString(sr[1]) : "",
      en: en ? unescapeString(en[1]) : "",
      image: image ? unescapeString(image[1]) : "",
    };
  }

  const sr = {};
  const srEntry = /(?:^|\n)\s*(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_-]+))\s*:\s*"((?:\\.|[^"])*)"\s*,?/g;
  while ((match = srEntry.exec(srSource))) {
    const key = match[1] || match[2] || match[3];
    sr[key] = unescapeString(match[4]);
  }

  return { library, sr };
}

export function auditNoteLabels(noteRows = [], source = "") {
  const { library, sr } = parseNoteLabels(source);
  const issues = [];
  const rows = (Array.isArray(noteRows) ? noteRows : []).map((row) => {
    const custom = library[row.key] || null;
    const srLabel = custom?.sr || sr[row.key] || "";
    const enLabel = custom?.en || row.label || "";
    const srSource = custom?.sr ? "NOTE_LIBRARY" : sr[row.key] ? "NOTE_SR" : "FALLBACK";
    const enSource = custom?.en ? "NOTE_LIBRARY" : "KEY FORMAT";

    if (!srLabel) issues.push({ level: "warning", key: row.key, field: "sr", message: "Missing Serbian note label; UI would fall back to the formatted key." });
    if (!enLabel) issues.push({ level: "error", key: row.key, field: "en", message: "Missing English note label." });
    if (custom?.image && custom.image !== row.assetPath) issues.push({ level: "warning", key: row.key, field: "image", message: `NOTE_LIBRARY image ${custom.image} differs from canonical ${row.assetPath}.` });

    return { ...row, srLabel: srLabel || row.label, enLabel, srSource, enSource, customLibrary: Boolean(custom) };
  });

  const referenced = new Set(rows.map((row) => row.key));
  const orphanSr = Object.keys(sr).filter((key) => !referenced.has(key));
  const orphanLibrary = Object.keys(library).filter((key) => !referenced.has(key));

  return {
    rows,
    library,
    sr,
    srCovered: rows.filter((row) => row.srSource !== "FALLBACK").length,
    enCovered: rows.filter((row) => Boolean(row.enLabel)).length,
    customLibraryCount: rows.filter((row) => row.customLibrary).length,
    fallbackSrCount: rows.filter((row) => row.srSource === "FALLBACK").length,
    orphanSr,
    orphanLibrary,
    issues,
    errors: issues.filter((issue) => issue.level === "error"),
    warnings: issues.filter((issue) => issue.level === "warning"),
  };
}
