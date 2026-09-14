const ACCEPTED_IMAGE = /^image\/(jpeg|png|webp)$/i;
const MAX_ANALYSIS_EDGE = 420;
const MAX_ENHANCE_EDGE = 1600;

function readImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read selected image for quality analysis."));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas, type = "image/png", quality = 0.94) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function scaledDimensions(width, height, maxEdge) {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function analyzePixels(data, width, height) {
  let lumSum = 0;
  let lumSqSum = 0;
  let satSum = 0;
  let samples = 0;
  const gray = new Float32Array(width * height);

  for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
    const alpha = data[i + 3] / 255;
    if (alpha < 0.05) {
      gray[p] = 255;
      continue;
    }
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    gray[p] = lum;
    lumSum += lum;
    lumSqSum += lum * lum;
    satSum += sat;
    samples += 1;
  }

  const safeSamples = Math.max(1, samples);
  const brightness = lumSum / safeSamples;
  const variance = Math.max(0, lumSqSum / safeSamples - brightness * brightness);
  const contrast = Math.sqrt(variance);
  const saturation = satSum / safeSamples;

  let edgeSum = 0;
  let edgeSamples = 0;
  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const idx = y * width + x;
      const gx = gray[idx + 1] - gray[idx - 1];
      const gy = gray[idx + width] - gray[idx - width];
      edgeSum += Math.sqrt(gx * gx + gy * gy);
      edgeSamples += 1;
    }
  }
  const sharpness = edgeSamples ? edgeSum / edgeSamples : 0;

  return { brightness, contrast, saturation, sharpness };
}

async function analyzeImageFile(file) {
  const { image, url } = await readImage(file);
  try {
    const size = scaledDimensions(image.naturalWidth, image.naturalHeight, MAX_ANALYSIS_EDGE);
    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Could not analyze image quality.");
    ctx.drawImage(image, 0, 0, size.width, size.height);
    return analyzePixels(ctx.getImageData(0, 0, size.width, size.height).data, size.width, size.height);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function buildAdjustments(metrics) {
  let brightness = 1;
  let contrast = 1;
  let saturation = 1;
  let sharpen = false;
  const notes = [];

  if (metrics.brightness < 92) {
    brightness = 1.08;
    notes.push("lifted exposure");
  } else if (metrics.brightness > 205) {
    brightness = 0.96;
    notes.push("reduced highlights");
  }

  if (metrics.contrast < 42) {
    contrast = 1.08;
    notes.push("added clarity");
  } else if (metrics.contrast > 82) {
    contrast = 0.98;
  }

  if (metrics.saturation < 0.13) {
    saturation = 1.06;
    notes.push("restored color");
  } else if (metrics.saturation > 0.55) {
    saturation = 0.97;
    notes.push("softened saturation");
  }

  if (metrics.sharpness < 11) {
    sharpen = true;
    notes.push("mild sharpening");
  }

  return { brightness, contrast, saturation, sharpen, notes };
}

function sharpenImageData(imageData, amount = 0.12) {
  const { data, width, height } = imageData;
  const source = new Uint8ClampedArray(data);
  const center = 1 + 4 * amount;
  const side = -amount;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const idx = (y * width + x) * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        const value =
          source[idx + channel] * center +
          source[idx - 4 + channel] * side +
          source[idx + 4 + channel] * side +
          source[idx - width * 4 + channel] * side +
          source[idx + width * 4 + channel] * side;
        data[idx + channel] = Math.max(0, Math.min(255, Math.round(value)));
      }
    }
  }
  return imageData;
}

function qualityLabel(metrics) {
  const issues = [];
  if (metrics.brightness < 75 || metrics.brightness > 220) issues.push("exposure");
  if (metrics.contrast < 34) issues.push("clarity");
  if (metrics.sharpness < 8) issues.push("sharpness");
  if (metrics.saturation < 0.08 || metrics.saturation > 0.68) issues.push("color");
  return issues.length ? { grade: "CHECK", issues } : { grade: "GOOD", issues: [] };
}

function finalStatus({ sourceMetrics, finalMetrics, enhanced, finalQuality }) {
  if (finalMetrics.sharpness < 8) return "SOURCE TOO SOFT";
  if (!enhanced && finalQuality.grade === "GOOD") return "GOOD";
  if (enhanced && finalQuality.grade === "GOOD") return "IMPROVED";
  return "CHECK";
}

function metricDeltaLabel(source, final) {
  const sourceSharpness = Math.round(source.sharpness);
  const finalSharpness = Math.round(final.sharpness);
  if (sourceSharpness === finalSharpness) return `final sharpness ${finalSharpness}`;
  return `sharpness ${sourceSharpness} → ${finalSharpness}`;
}

export async function assessAndEnhanceProductImage(file) {
  if (!file || !ACCEPTED_IMAGE.test(file.type)) throw new Error("Choose a JPG, PNG or WebP image.");

  const sourceMetrics = await analyzeImageFile(file);
  const sourceQuality = qualityLabel(sourceMetrics);
  const adjustments = buildAdjustments(sourceMetrics);
  const needsEnhancement = adjustments.notes.length > 0;

  if (!needsEnhancement) {
    return {
      file,
      enhanced: false,
      report: {
        ...sourceMetrics,
        grade: "GOOD",
        issues: sourceQuality.issues,
        sourceMetrics,
        finalMetrics: sourceMetrics,
        notes: ["source already within PlayNice quality range"],
      },
    };
  }

  const { image, url } = await readImage(file);
  try {
    const enhancedSize = scaledDimensions(image.naturalWidth, image.naturalHeight, MAX_ENHANCE_EDGE);
    const canvas = document.createElement("canvas");
    canvas.width = enhancedSize.width;
    canvas.height = enhancedSize.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: adjustments.sharpen });
    if (!ctx) throw new Error("Could not prepare image enhancement.");

    ctx.filter = `brightness(${adjustments.brightness}) contrast(${adjustments.contrast}) saturate(${adjustments.saturation})`;
    ctx.drawImage(image, 0, 0, enhancedSize.width, enhancedSize.height);
    ctx.filter = "none";

    if (adjustments.sharpen && enhancedSize.width * enhancedSize.height <= 2_600_000) {
      const imageData = ctx.getImageData(0, 0, enhancedSize.width, enhancedSize.height);
      ctx.putImageData(sharpenImageData(imageData), 0, 0);
    }

    const blob = await canvasToBlob(canvas, "image/png");
    if (!blob) throw new Error("Could not create enhanced image.");
    const enhancedFile = new File([blob], "playnice-enhanced.png", { type: "image/png", lastModified: Date.now() });
    const finalMetrics = await analyzeImageFile(enhancedFile);
    const finalQuality = qualityLabel(finalMetrics);
    const grade = finalStatus({ sourceMetrics, finalMetrics, enhanced: true, finalQuality });
    const notes = [
      `applied: ${adjustments.notes.join(", ")}`,
      metricDeltaLabel(sourceMetrics, finalMetrics),
    ];
    if (grade === "SOURCE TOO SOFT") notes.push("source is still soft — consider a higher-quality image");
    else if (grade === "CHECK" && finalQuality.issues.length) notes.push(`recheck: ${finalQuality.issues.join(", ")}`);

    return {
      file: enhancedFile,
      enhanced: true,
      report: {
        ...finalMetrics,
        grade,
        issues: finalQuality.issues,
        sourceMetrics,
        finalMetrics,
        notes,
      },
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function formatQualityMetric(value, type) {
  if (!Number.isFinite(value)) return "—";
  if (type === "saturation") return `${Math.round(value * 100)}%`;
  return Math.round(value).toString();
}
