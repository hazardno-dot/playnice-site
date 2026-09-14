import { presentationLimit } from "./productPresentationContract.mjs";

export const CARD_COPY_TARGET_WIDTH = 250;
export const CARD_COPY_HORIZONTAL_PADDING = 24;
export const CARD_COPY_MAX_LINES = 2;
export const CARD_COPY_FONT = 'italic 400 15.2px "Cormorant Garamond"';
export const CARD_COPY_LINE_HEIGHT = 21.28;
export const CARD_COPY_LETTER_SPACING = 0.228;
const FONT_LINK_ID = "playnice-card-copy-fit-font";

export function cardCopyTextWidth(boxWidth = CARD_COPY_TARGET_WIDTH) {
  const parsed = Number(boxWidth);
  const width = Number.isFinite(parsed) ? parsed : CARD_COPY_TARGET_WIDTH;
  return Math.max(1, width - CARD_COPY_HORIZONTAL_PADDING);
}

export function ensureCardCopyFont() {
  if (typeof document === "undefined") return;
  if (document.getElementById(FONT_LINK_ID)) return;
  const link = document.createElement("link");
  link.id = FONT_LINK_ID;
  link.rel = "stylesheet";
  link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,400&display=swap";
  document.head.appendChild(link);
}

export function isCardCopyFontReady() {
  if (typeof document === "undefined") return false;
  if (!document.fonts?.check) return true;
  return document.fonts.check(CARD_COPY_FONT);
}

export function measureCardCopyLines(text, width = CARD_COPY_TARGET_WIDTH) {
  const value = String(text || "").trim();
  if (!value) return 0;
  if (typeof document === "undefined" || !document.body || !isCardCopyFontReady()) return null;

  const node = document.createElement("div");
  Object.assign(node.style, {
    position: "fixed",
    left: "-10000px",
    top: "0",
    visibility: "hidden",
    pointerEvents: "none",
    width: `${cardCopyTextWidth(width)}px`,
    margin: "0",
    padding: "0",
    border: "0",
    whiteSpace: "normal",
    overflowWrap: "normal",
    wordBreak: "normal",
    fontFamily: '"Cormorant Garamond", serif',
    fontStyle: "italic",
    fontWeight: "400",
    fontSize: "15.2px",
    lineHeight: `${CARD_COPY_LINE_HEIGHT}px`,
    letterSpacing: `${CARD_COPY_LETTER_SPACING}px`,
  });
  node.textContent = value;
  document.body.appendChild(node);
  const height = node.getBoundingClientRect().height;
  node.remove();
  return Math.max(1, Math.round(height / CARD_COPY_LINE_HEIGHT));
}

export function classifyCardCopyFit(text, lang, { width = CARD_COPY_TARGET_WIDTH, isNewProduct = false } = {}) {
  const value = String(text || "").trim();
  const chars = Array.from(value).length;
  const lines = measureCardCopyLines(value, width);
  const legacyMax = presentationLimit("card", lang, { isNewProduct: false });
  const newMax = presentationLimit("card", lang, { isNewProduct: true });
  const activeMax = presentationLimit("card", lang, { isNewProduct });
  const visualMeasured = Number.isFinite(lines);
  const visualPass = visualMeasured ? lines <= CARD_COPY_MAX_LINES : null;
  const characterPass = !activeMax || chars <= activeMax;

  let status = "ok";
  if (visualPass === false) status = "visual-fail";
  else if (visualPass === true && lines === CARD_COPY_MAX_LINES && chars >= Math.floor(newMax * 0.85)) status = "near";

  return {
    value,
    chars,
    lines,
    boxWidth: Number(width),
    textWidth: cardCopyTextWidth(width),
    legacyMax,
    newMax,
    activeMax,
    characterPass,
    visualMeasured,
    visualPass,
    mismatch: visualPass === false && chars <= legacyMax,
    status,
  };
}
