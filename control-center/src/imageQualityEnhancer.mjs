const ACCEPTED_IMAGE = /^image\/(jpeg|png|webp)$/i;
const MAX_ANALYSIS_EDGE = 420;
const MAX_ENHANCE_EDGE = 1600;
const ALPHA_CONTENT_THRESHOLD = 18;
const BG_DISTANCE_THRESHOLD = 24;

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

function averageCornerBackground(data, width, height) {
  const patch = Math.max(2, Math.round(Math.min(width, height) * 0.06));
  const corners = [
    [0, 0],
    [Math.max(0, width - patch), 0],
    [0, Math.max(0, height - patch)],
    [Math.max(0, width - patch), Math.max(0, height - patch)],
  ];
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 0;
  let samples = 0;

  for (const [startX, startY] of corners) {
    for (let y = startY; y < Math.min(height, startY + patch); y += 1) {
      for (let x = startX; x < Math.min(width, startX + patch); x += 1) {
        const idx = (y * width + x) * 4;
        r += data[idx];
        g += data[idx + 1];
        b += data[idx + 2];
        a += data[idx + 3];
        samples += 1;
      }
    }
  }

  const safe = Math.max(1, samples);
  return { r: r / safe, g: g / safe, b: b / safe, a: a / safe };
}

function findContentBounds(data, width, height) {
  const background = averageCornerBackground(data, width, height);
  const transparentBackground = background.a < 40;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let contentPixels = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const alpha = data[idx + 3];
      let isContent = false;

      if (transparentBackground) {
        isContent = alpha >= ALPHA_CONTENT_THRESHOLD;
      } else if (alpha >= ALPHA_CONTENT_THRESHOLD) {
        const dr = data[idx] - background.r;
        const dg = data[idx + 1] - background.g;
        const db = data[idx + 2] - background.b;
        const distance = Math.sqrt(dr * dr + dg * dg + db * db);
        isContent = distance >= BG_DISTANCE_THRESHOLD;
      }

      if (!isContent) continue;
      contentPixels += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY || contentPixels < Math.max(16, width * height * 0.002)) {
    return { x: 0, y: 0, width, height, coverage: 1, detected: false };
  }

  const rawWidth = maxX - minX + 1;
  const rawHeight = maxY - minY + 1;
  const padX = Math.max(2, Math.round(rawWidth * 0.06));
  const padY = Math.max(2, Math.round(rawHeight * 0.06));
  const x = Math.max(0, minX - padX);
  const y = Math.max(0, minY - padY);
  const right = Math.min(width - 1, maxX + padX);
  const bottom = Math.min(height - 1, maxY + padY);
  const boundedWidth = right - x + 1;
  const boundedHeight = bottom - y + 1;
  const coverage = (boundedWidth * boundedHeight) / Math.max(1, width * height);

  if (coverage > 0.94) return { x: 0, y: 0, width, height, coverage: 1, detected: false };
  return { x, y, width: boundedWidth, height: boundedHeight, coverage, detected: true };
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
      gray[p] = 0;
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
      const pixel = idx * 4;
      if (data[pixel + 3] < ALPHA_CONTENT_THRESHOLD) continue;
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

    const fullImage = ctx.getImageData(0, 0, size.width, size.height);
    const bounds = findContentBounds(fullImage.data, size.width, size.height);
    const cropped = bounds.detected
      ? ctx.getImageData(bounds.x, bounds.y, bounds.width, bounds.height)
      : fullImage;
    const metrics = analyzePixels(cropped.data, cropped.width, cropped.height);
    return { ...metrics, contentCoverage: bounds.coverage, contentDetected: bounds.detected };
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

function finalStatus({ finalMetrics, enhanced, finalQuality }) {
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
        grade: sourceQuality.grade,
        issues: sourceQuality.issues,
        sourceMetrics,
        finalMetrics: sourceMetrics,
        notes: [sourceMetrics.contentDetected ? "quality measured on detected product area" : "source already within PlayNice quality range"],
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
    const grade = finalStatus({ finalMetrics, enhanced: true, finalQuality });
    const notes = [
      `applied: ${adjustments.notes.join(", ")}`,
      metricDeltaLabel(sourceMetrics, finalMetrics),
      finalMetrics.contentDetected ? "measured on detected product area" : "measured on full frame",
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
