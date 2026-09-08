globalThis.module = { exports: null };
await import("./create-note-apply.js");

const handler = globalThis.module?.exports;
if (typeof handler !== "function") {
  throw new Error("Notes Controlled Apply legacy handler did not export a function.");
}

export default handler;
