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
    maxBytes: 450_000,
    qualities: [0.9, 0.86, 0.82, 0.78, 0.74, 0.7, 0.66],
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

function drawContain(ctx, image, targetWidth, targetHeight) {
  const scale = Math.min(targetWidth / image.naturalWidth, targetHeight / image.naturalHeight);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const x = Math.round((targetWidth - width) / 2);
  const y = Math.round((targetHeight - height) / 2);
  ctx.drawImage(image, x, y, width, height);
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
      if (preset.fit === "cover") drawCover(ctx, image, width, height);
      else if (preset.fit === "contain") drawContain(ctx, image, width, height);
      else ctx.drawImage(image, 0, 0, width, height);

      for (const quality of qualities) {
        const blob = await canvasToBlob(canvas, preset.outputType, quality);
        if (!blob) continue;
        const candidate = { blob, width, height, quality, originalWidth, originalHeight, originalBytes: file.size };
        if (!smallest || blob.size < smallest.blob.size) smallest = candidate;
        if (blob.size <= preset.maxBytes) return candidate;
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
          const candidate = { blob, width, height, quality, originalWidth, originalHeight, originalBytes: file.size };
          if (!smallest || blob.size < smallest.blob.size) smallest = candidate;
          if (blob.size <= preset.maxBytes) return candidate;
        }
      }
    }

    if (!smallest) throw new Error("Could not create optimized image.");
    throw new Error(`Image is still ${formatImageBytes(smallest.blob.size)} after optimization. Please use a simpler source image.`);
  } finally {
    URL.revokeObjectURL(url);
  }
}
