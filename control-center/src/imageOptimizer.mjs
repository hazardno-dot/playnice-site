export const IMAGE_SOURCE_MAX_BYTES = 8_000_000;

export const IMAGE_OPTIMIZER_PRESETS = Object.freeze({
  notes: Object.freeze({
    outputType: "image/webp",
    maxEdge: 1024,
    maxBytes: 200_000,
    qualities: [0.86, 0.8, 0.74, 0.68, 0.62, 0.56],
    scales: [1, 0.9, 0.8, 0.7],
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

export async function optimizeImage(file, preset) {
  if (!file || !ACCEPTED_IMAGE.test(file.type)) throw new Error("Choose a JPG, PNG or WebP image.");
  if (file.size > IMAGE_SOURCE_MAX_BYTES) throw new Error(`Source image is larger than ${formatImageBytes(IMAGE_SOURCE_MAX_BYTES)}.`);
  if (!preset?.maxEdge || !preset?.maxBytes || !preset?.outputType) throw new Error("Image optimizer preset is incomplete.");

  const { image, url } = await readImage(file);
  try {
    const originalWidth = image.naturalWidth;
    const originalHeight = image.naturalHeight;
    const longest = Math.max(originalWidth, originalHeight);
    const fitScale = longest > preset.maxEdge ? preset.maxEdge / longest : 1;
    const scales = (preset.scales || [1]).map((scale) => Math.min(1, fitScale * scale));
    const qualities = preset.qualities || [0.82, 0.72, 0.62];
    let smallest = null;

    for (const scale of scales) {
      const width = Math.max(1, Math.round(originalWidth * scale));
      const height = Math.max(1, Math.round(originalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not prepare image optimization.");
      ctx.drawImage(image, 0, 0, width, height);

      for (const quality of qualities) {
        const blob = await canvasToBlob(canvas, preset.outputType, quality);
        if (!blob) continue;
        const candidate = { blob, width, height, quality, originalWidth, originalHeight, originalBytes: file.size };
        if (!smallest || blob.size < smallest.blob.size) smallest = candidate;
        if (blob.size <= preset.maxBytes) return candidate;
      }
    }

    if (!smallest) throw new Error("Could not create optimized image.");
    throw new Error(`Image is still ${formatImageBytes(smallest.blob.size)} after optimization. Please use a simpler or smaller source image.`);
  } finally {
    URL.revokeObjectURL(url);
  }
}
