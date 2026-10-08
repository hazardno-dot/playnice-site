import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const bridge = fs.readFileSync(path.join(root, "control-center/src/InlineValidationBridge.jsx"), "utf8");
const noteMap = fs.readFileSync(path.join(root, "playnice-site/src/features/note-map/TheNoteMapImpl.jsx"), "utf8");

assert.match(bridge, /import noteMapSource from "@shop\/features\/note-map\/TheNoteMapImpl\.jsx\?raw"/);
assert.match(bridge, /\.\.\.noteLibraryKeys\(noteMapSource\)/);
assert.match(bridge, /knownNoteKeys: NOTE_KEYS/);

const start = noteMap.indexOf("const NOTE_LIBRARY = {");
const end = noteMap.indexOf("const NOTE_SR = {", start);
assert.ok(start >= 0 && end > start, "Note library boundaries are present");
const keys = [...noteMap.slice(start, end).matchAll(/^  (?:(?:"([^"]+)")|(?:'([^']+)')|([A-Za-z0-9_-]+))\s*:\s*\{/gm)]
  .map((match) => match[1] || match[2] || match[3]);
assert.ok(keys.includes("seaweed"), "Recently added seaweed note is available in the canonical library");
assert.ok(keys.includes("ginger"), "Unquoted canonical keys remain supported");

console.log("PASS Inline Note Map validation includes canonical Note Library entries (seaweed)");
