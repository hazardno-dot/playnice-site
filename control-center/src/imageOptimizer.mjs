export const IMAGE_SOURCE_MAX_BYTES = 8_000_000;

export const IMAGE_OPTIMIZER_PRESETS = Object.freeze({
  notes: Object.freeze({
    outputType: "image/webp",
    width: 256,
    height: 256,
    fit: "cover",
    maxBytes: 20_000,
    qualities: [0.84, 0.78, 0.72, 0.66, 0.6, 0.54, 0.48],
  }),
  productShop: Object.freeze({
    outputType: "image/png",
    width: 600,
    height: 600,
    fit: "contain",
    transparent: true,
    maxBytes: 500_000,
  }),
  productJustIn: Object.freeze({
    outputType: "image/webp",
    width: 320,
    height: 320,
    fit: "contain",
    transparent: true,
    maxBytes: 30_000,
    qualities: [0.86, 0.8, 0.74, 0.68, 0.62, 0.56, 0.5],
  }),
  heroDesktop: Object.freeze({
    outputType: "image/jpeg",
    width: 1920,
    height: 700,
    fit: "strict",
    ratioTolerance: 0.03,
    background: "#000000",
    maxBytes: 500_000,
    qualities: [0.9, 0.86, 0.82, 0.78, 0.74, 0.7, 0.66],
  }),
  heroMobile: Object.freeze({
    outputType: "image/jpeg",
    width: 1200,
    height: 900,
    fit: "strict",
    ratioTolerance: 0.03,
    background: "#000000",
    maxBytes: 150_000,
    neverIncreaseBytes: true,
    qualities: [0.9, 0.86, 0.82, 0.78, 0.74, 0.7, 0.66, 0.62, 0.58, 0.54, 0.5, 0.46],
  }),
  socialFeed: Object.freeze({
    outputType: "image/jpeg",
    width: 1080,
    height: 1080,
    fit: "contain",
    background: "#000000",
    backgroundPattern: "/playnice-social-pattern.webp",
    patternOpacity: 0.62,
    patternShade: 0.05,
    patternPanel: "square",
    safeZonePadding: 0.16,
    safeZoneStrength: 0.94,
    maxBytes: 500_000,
    qualities: [0.9, 0.86, 0.82, 0.78, 0.74, 0.7, 0.66, 0.62],
  }),
  socialStory: Object.freeze({
    outputType: "image/jpeg",
    width: 1080,
    height: 1920,
    fit: "contain",
    background: "#000000",
    backgroundPattern: "/playnice-social-pattern.webp",
    patternOpacity: 0.65,
    patternShade: 0.05,
    patternPanel: "story",
    safeZonePadding: 0.18,
    safeZoneStrength: 0.94,
    maxBytes: 700_000,
    qualities: [0.9, 0.86, 0.82, 0.78, 0.74, 0.7, 0.66, 0.62],
  }),
  socialFacebook: Object.freeze({
    outputType: "image/jpeg",
    width: 1200,
    height: 900,
    fit: "contain",
    background: "#000000",
    backgroundPattern: "/playnice-social-pattern.webp",
    patternOpacity: 0.60,
    patternShade: 0.05,
    patternPanel: "facebook",
    safeZonePadding: 0.16,
    safeZoneStrength: 0.94,
    maxBytes: 500_000,
    qualities: [0.9, 0.86, 0.82, 0.78, 0.74, 0.7, 0.66, 0.62],
  }),
  journal: Object.freeze({
    outputType: "image/webp",
    maxEdge: 1600,
    maxBytes: 500_000,
    scales: [1, 0.88, 0.76, 0.64],
    qualities: [0.84, 0.78, 0.72, 0.66],
  }),
});

const ACCEPTED_IMAGE = /^image\/(jpeg|png|webp)$/i;

export const formatImageBytes = (bytes = 0) => bytes < 1000 ? `${bytes} B` : `${Math.round(bytes / 1000)} KB`;

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(reader.error || new Error("Could not read optimized image."));
    reader.readAsDataURL(blob);
  });
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read selected image."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function drawCover(ctx, image, targetWidth, targetHeight) {
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;
  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetWidth / targetHeight;

  let sx = 0;
  let sy = 0;
  let sw = sourceWidth;
  let sh = sourceHeight;

  if (sourceRatio > targetRatio) {
    sw = sourceHeight * targetRatio;
    sx = (sourceWidth - sw) / 2;
  } else if (sourceRatio < targetRatio) {
    sh = sourceWidth / targetRatio;
    sy = (sourceHeight - sh) / 2;
  }

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
}

function containRect(image, targetWidth, targetHeight) {
  const scale = Math.min(targetWidth / image.naturalWidth, targetHeight / image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const x = Math.round((targetWidth - width) / 2);
  const y = Math.round((targetHeight - height) / 2);
  return { x, y, width, height, scale };
}

function drawContain(ctx, image, targetWidth, targetHeight) {
  const rect = containRect(image, targetWidth, targetHeight);
  ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
  return rect;
}

const backgroundImageCache = new Map();

function readBackgroundImage(src) {
  if (!src) return Promise.resolve(null);
  if (backgroundImageCache.has(src)) return backgroundImageCache.get(src);
  const pending = new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
  backgroundImageCache.set(src, pending);
  return pending;
}

function visibleAlphaBounds(image) {
  const maxEdge = 420;
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);

  let pixels;
  try {
    pixels = ctx.getImageData(0, 0, width, height).data;
  } catch {
    return null;
  }

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let visible = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha <= 10) continue;
      visible += 1;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  if (!visible || visible / (width * height) > 0.96 || maxX < minX || maxY < minY) return null;
  return {
    x: minX / scale,
    y: minY / scale,
    width: (maxX - minX + 1) / scale,
    height: (maxY - minY + 1) / scale,
  };
}

function objectBoundsInTarget(image, targetWidth, targetHeight) {
  const rect = containRect(image, targetWidth, targetHeight);
  const alphaBounds = visibleAlphaBounds(image);
  if (!alphaBounds) return rect;
  return {
    x: rect.x + alphaBounds.x * rect.scale,
    y: rect.y + alphaBounds.y * rect.scale,
    width: alphaBounds.width * rect.scale,
    height: alphaBounds.height * rect.scale,
  };
}

function drawSafeZone(ctx, bounds, targetWidth, targetHeight, preset) {
  const padding = Number(preset.safeZonePadding ?? 0.16);
  const strength = Number(preset.safeZoneStrength ?? 0.94);
  const centerX = bounds.x + bounds.width / 2;
  const centerY = bounds.y + bounds.height / 2;
  const radiusX = Math.max(bounds.width * (0.5 + padding), targetWidth * 0.19);
  const radiusY = Math.max(bounds.height * (0.5 + padding), targetHeight * 0.14);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(radiusX, radiusY);
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  gradient.addColorStop(0, `rgba(0,0,0,${strength})`);
  gradient.addColorStop(0.58, `rgba(0,0,0,${Math.max(0, strength - 0.06)})`);
  gradient.addColorStop(0.82, `rgba(0,0,0,${Math.max(0, strength * 0.48)})`);
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(-1.35, -1.35, 2.7, 2.7);
  ctx.restore();
}

async function drawBrandedBackground(ctx, image, targetWidth, targetHeight, preset) {
  ctx.fillStyle = preset.background || "#000000";
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  const patternImage = await readBackgroundImage(preset.backgroundPattern);
  if (patternImage) {
    // Build a format-specific panel from the canonical PlayNice artwork.
    // The source is fitted to the exact target width, then repeated vertically
    // only when the target canvas is taller (1:1 and 9:16). 4:3 resolves to
    // one exact panel. This avoids the old native-size tile/crop behaviour.
    const panelWidth = targetWidth;
    const panelHeight = Math.max(1, Math.round(patternImage.naturalHeight * (panelWidth / patternImage.naturalWidth)));
    ctx.save();
    ctx.globalAlpha = Number(preset.patternOpacity ?? 0.60);
    for (let y = 0; y < targetHeight; y += panelHeight) {
      ctx.drawImage(patternImage, 0, y, panelWidth, panelHeight);
    }
    ctx.restore();
  }

  const shade = Number(preset.patternShade ?? 0.16);
  if (shade > 0) {
    ctx.fillStyle = `rgba(0,0,0,${Math.min(1, Math.max(0, shade))})`;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  drawSafeZone(ctx, objectBoundsInTarget(image, targetWidth, targetHeight), targetWidth, targetHeight, preset);
}

function prepareCanvas(width, height, preset) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image optimization.");
  if (!preset.transparent && preset.background) {
    ctx.fillStyle = preset.background;
    ctx.fillRect(0, 0, width, height);
  }
  return { canvas, ctx };
}

export async function optimizeImage(file, preset) {
  if (!file || !ACCEPTED_IMAGE.test(file.type)) throw new Error("Choose a JPG, PNG or WebP image.");
  if (file.size > IMAGE_SOURCE_MAX_BYTES) throw new Error(`Source image is larger than ${formatImageBytes(IMAGE_SOURCE_MAX_BYTES)}.`);
  if (!preset?.maxBytes || !preset?.outputType) throw new Error("Image optimizer preset is incomplete.");

  const fixedSize = Number(preset.width) > 0 && Number(preset.height) > 0;
  if (!fixedSize && !preset?.maxEdge) throw new Error("Image optimizer preset needs fixed dimensions or maxEdge.");

  const targetBytes = preset.neverIncreaseBytes
    ? Math.min(preset.maxBytes, file.size)
    : preset.maxBytes;

  const { image, url } = await readImage(file);
  try {
    const originalWidth = image.naturalWidth;
    const originalHeight = image.naturalHeight;
    const originalRatio = originalWidth / originalHeight;
    const qualities = preset.qualities || [0.82, 0.72, 0.62];
    let smallest = null;

    if (fixedSize) {
      const width = Math.round(preset.width);
      const height = Math.round(preset.height);
      const targetRatio = width / height;
      if (preset.fit === "strict" && Math.abs(originalRatio - targetRatio) > Number(preset.ratioTolerance || 0)) {
        throw new Error(`Image ratio ${originalRatio.toFixed(2)}:1 does not match required ${targetRatio.toFixed(2)}:1 (${width} × ${height}px). Use the correct composition; Hero images are never auto-cropped.`);
      }

      const { canvas, ctx } = prepareCanvas(width, height, preset);
      if (preset.backgroundPattern && preset.fit === "contain") {
        await drawBrandedBackground(ctx, image, width, height, preset);
      }
      if (preset.fit === "cover") drawCover(ctx, image, width, height);
      else if (preset.fit === "contain") drawContain(ctx, image, width, height);
      else ctx.drawImage(image, 0, 0, width, height);

      for (const quality of qualities) {
        const blob = await canvasToBlob(canvas, preset.outputType, quality);
        if (!blob) continue;
        const candidate = { blob, width, height, quality, originalWidth, originalHeight, originalBytes: file.size, targetBytes };
        if (!smallest || blob.size < smallest.blob.size) smallest = candidate;
        if (blob.size <= targetBytes) return candidate;
      }
    } else {
      const longest = Math.max(originalWidth, originalHeight);
      const fitScale = longest > preset.maxEdge ? preset.maxEdge / longest : 1;
      const scales = (preset.scales || [1]).map((scale) => Math.min(1, fitScale * scale));

      for (const scale of scales) {
        const width = Math.max(1, Math.round(originalWidth * scale));
        const height = Math.max(1, Math.round(originalHeight * scale));
        const { canvas, ctx } = prepareCanvas(width, height, preset);
        ctx.drawImage(image, 0, 0, width, height);

        for (const quality of qualities) {
          const blob = await canvasToBlob(canvas, preset.outputType, quality);
          if (!blob) continue;
          const candidate = { blob, width, height, quality, originalWidth, originalHeight, originalBytes: file.size, targetBytes };
          if (!smallest || blob.size < smallest.blob.size) smallest = candidate;
          if (blob.size <= targetBytes) return candidate;
        }
      }
    }

    if (!smallest) throw new Error("Could not create optimized image.");
    throw new Error(`Image is still ${formatImageBytes(smallest.blob.size)} after optimization. Target is ${formatImageBytes(targetBytes)} or less. Please use a simpler source image.`);
  } finally {
    URL.revokeObjectURL(url);
  }
}
