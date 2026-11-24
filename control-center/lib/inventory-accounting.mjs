const PRODUCT_ALIASES = new Map([
  ["al haramain signature blue", "Haramain Signature Blue Eau de Parfum"],
  ["thomas kosmala no. 4 après l'amour edp", "Thomas Kosmala No. 4 Après l'Amour Eau de Parfum"],
  ["thomas kosmala no. 4 après l'amour eau de parfum", "Thomas Kosmala No. 4 Après l'Amour Eau de Parfum"],
  ["thomas kosmala no. 7 le sel de la terre", "Thomas Kosmala No. 7 Le Sel de la Terre Eau de Parfum"],
  ["thomas kosmala no. 7 le sel de la terre eau de parfum", "Thomas Kosmala No. 7 Le Sel de la Terre Eau de Parfum"],
  ["afnan supremacy collector's edition pour homme", "Afnan Supremacy Collector's Edition Pour Homme Eau de Parfum"],
  ["afnan supremacy collector's edition pour homme eau de parfum", "Afnan Supremacy Collector's Edition Pour Homme Eau de Parfum"],
  ["afnan turathi blue", "Afnan Turathi Blue Homme Eau de Parfum"],
  ["afnan turathi blue homme eau de parfum", "Afnan Turathi Blue Homme Eau de Parfum"],
  ["arabiat prestige marwa edp", "Arabiyat Prestige Marwa Eau de Parfum"],
  ["arabiyat p. marwa", "Arabiyat Prestige Marwa Eau de Parfum"],
  ["arabiyat prestige marwa", "Arabiyat Prestige Marwa Eau de Parfum"],
  ["arabiyat prestige marwa eau de parfum", "Arabiyat Prestige Marwa Eau de Parfum"],
  ["french avenue ravine ginger edp", "French Avenue Ravine Ginger Extrait de Parfum"],
  ["the french avenue ravine ginger extrait de parfum", "French Avenue Ravine Ginger Extrait de Parfum"],
  ["french avenue ravine ginger extrait de parfum", "French Avenue Ravine Ginger Extrait de Parfum"],
  ["my geisha jasmine in the sun extrait de parfum", "My Geisha Jasmine in the Sun Extrait de Parfum"],
  ["rayhaan pacific aura", "Rayhaan Pacific Aura Eau de Parfum"],
  ["rayhaan pacific aura eau de parfum", "Rayhaan Pacific Aura Eau de Parfum"],
  ["afnan 9am", "Afnan 9 AM Eau de Parfum"],
  ["afnan 9 am eau de parfum", "Afnan 9 AM Eau de Parfum"],
  ["rayhaan aquatica", "Rayhaan Aquatica Eau de Parfum"],
  ["rayhaan aquatica eau de parfum", "Rayhaan Aquatica Eau de Parfum"],
  ["french avenue safari breeze", "French Avenue Safari Breeze Eau de Parfum"],
  ["lattafa dynasty", "Lattafa Dynasty Eau de Parfum"],
  ["narciso poudrée", "Narciso Rodriguez NARCISO Poudrée Eau de Parfum"],
  ["armaf sillage", "Armaf Club de Nuit Sillage Eau de Parfum"],
  ["armaf club de nuit intense overdose edp", "Armaf Club de Nuit Intense Overdose Eau de Parfum"],
  ["paris corner north stag expressions ii deux", "Paris Corner North Stag Expressions II Deux Extrait de Parfum"],
  ["kadlaj island dreams", "Khadlaj Island Dreams Extrait de Parfum"],
  ["khadlaj island dreams", "Khadlaj Island Dreams Extrait de Parfum"]
]);

export function canonicalProductName(value) {
  const name = String(value || "").trim();
  return PRODUCT_ALIASES.get(name.toLowerCase()) || name;
}

export function parseMl(value) {
  const match = String(value || "").match(/([0-9]+(?:\.[0-9]+)?)\s*ml/i);
  return match ? Number(match[1]) : 0;
}

export function inventorySaleItems(items) {
  const out = [];
  for (const item of Array.isArray(items) ? items : []) {
    const qty = Math.max(1, Number(item?.quantity || 1));
    const bundles = Array.isArray(item?.bundleItems) ? item.bundleItems : [];
    const bundleMatch = String(item?.size || "").match(/^\s*([0-9]+(?:\.[0-9]+)?)\s*ml\s*[×xX]\s*([0-9]+)\s*$/i);
    if (bundleMatch && String(item?.name || "").includes(" / ")) {
      const names = String(item.name).split(/\s*\/\s*/);
      if (names.length === Number(bundleMatch[2])) {
        for (const name of names) out.push({product_name:canonicalProductName(name),ml:Number(bundleMatch[1])*qty});
      }
      continue;
    }
    if (bundles.length) {
      for (const bundle of bundles) {
        const sizeMl = parseMl(bundle?.size);
        if (sizeMl > 0 && sizeMl < 50) out.push({ product_name: canonicalProductName(bundle?.name), ml: sizeMl * qty });
      }
      continue;
    }
    const sizeMl = Number(item?.sizeMl || 0) || parseMl(item?.size);
    if (sizeMl > 0 && sizeMl < 50) out.push({ product_name: canonicalProductName(item?.name), ml: sizeMl * qty });
  }
  return out;
}

function inventoryResaleBottles(items) {
  return (Array.isArray(items) ? items : []).flatMap((item) => {
    const sizeMl = Number(item?.sizeMl || 0) || parseMl(item?.size);
    const quantity = Number(item?.quantity || 1);
    if (!(sizeMl >= 50) || !Number.isFinite(quantity) || quantity <= 0) return [];
    return [{ product_name: canonicalProductName(item.name), ml: sizeMl * quantity }];
  });
}

export function inventoryGiftItems(payload) {
  const samples = Array.isArray(payload?.giftSamples) ? payload.giftSamples : [];
  if (samples.length) {
    return samples.map((sample) => ({
      product_name: canonicalProductName(sample?.name),
      ml: Number(sample?.sizeMl || 0) || parseMl(sample?.size)
    })).filter((sample) => sample.product_name && sample.ml > 0);
  }

  const legacy = String(payload?.freeGift || "").trim().match(/^(.*?)\s*[-–—]\s*([0-9]+(?:\.[0-9]+)?)\s*ml/i);
  return legacy ? [{ product_name: canonicalProductName(legacy[1]), ml: Number(legacy[2]) }] : [];
}

// Keep existing stock totals authoritative; do not invent a split for inconsistent historical data.
export function consumptionBreakdown(total, sold, gift) {
  const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
  if (![total, sold, gift].every(Number.isFinite) || sold < 0 || gift < 0 || Math.abs(total - sold - gift) > 0.011) {
    return { orders_out_ml: null, gift_out_ml: null };
  }
  return { orders_out_ml: round(sold), gift_out_ml: round(gift) };
}

export function buildInventoryAnalytics(orders, stockRows, commerce) {
  const tracked = new Map((Array.isArray(stockRows) ? stockRows : []).map((row) => [
    canonicalProductName(row.product_name).toLowerCase(),
    {
      ...row,
      product_name: canonicalProductName(row.product_name),
      tracking_started_at: row.tracking_started_at,
      opening_balance_ml: Number(row.opening_balance_ml || 0),
      restock_ml: Number(row.restock_ml || 0),
      stock_in_ml: Number(row.stock_in_ml || 0),
      manual_out_ml: Number(row.manual_out_ml || 0),
      estimated: Boolean(row.estimated),
      baseline_verified: Boolean(row.baseline_verified),
      historical_baseline: Boolean(row.historical_baseline),
      consumed_since_tracking_ml: 0,
      sold_since_tracking_ml: 0,
      gift_since_tracking_ml: 0
    }
  ]));

  const historical = new Map();
  // Active, non-delivered orders have already committed stock but are absent
  // from the CC delivered-only historical commerce RPC.
  const historicalTransit = new Map();
  const transitBreakdown = new Map();
  const resale = new Map();
  for (const item of commerce.full_bottles || []) {
    const product_name = canonicalProductName(item.product_name);
    const key = product_name.toLowerCase();
    resale.set(key, {product_name,ml:Number(item.ml || 0)});
  }
  for (const item of commerce.top_products || []) {
    const product_name = canonicalProductName(item.product_name);
    const key = product_name.toLowerCase();
    const fullBottleMl = resale.get(key)?.ml || 0;
    historical.set(key, {product_name,ml:Math.max(0,Number(item.total_ml_out || 0)-fullBottleMl),sold_ml:Number(item.sold_ml || 0)-fullBottleMl,gift_ml:Number(item.gift_ml || 0)});
  }

  for (const order of Array.isArray(orders) ? orders : []) {
    if (!["PACKED","SHIPPED","OUT_FOR_DELIVERY","DELIVERED","DELIVERY_FAILED"].includes(order.status)) continue;
    const consumedAt = order.packed_at || order.shipped_at || order.updated_at || order.created_at;
    if (!consumedAt) continue;
    const payload = order.source_payload || {};
    const entries = [...inventorySaleItems(payload.items).map(entry => ({...entry, kind: 'sold'})), ...inventoryGiftItems(payload).map(entry => ({...entry, kind: 'gift'}))];
    for (const entry of entries) {
      const key = String(entry.product_name || "").toLowerCase();
      const row = tracked.get(key);
      if (!row || (!row.estimated && new Date(consumedAt) < new Date(row.tracking_started_at))) continue;
      row.consumed_since_tracking_ml += Number(entry.ml || 0);
      row[entry.kind === 'gift' ? 'gift_since_tracking_ml' : 'sold_since_tracking_ml'] += Number(entry.ml || 0);
      if (row.historical_baseline &&
          ["PACKED","SHIPPED","OUT_FOR_DELIVERY"].includes(order.status)) {
        historicalTransit.set(key,(historicalTransit.get(key)||0)+Number(entry.ml||0));
        const split = transitBreakdown.get(key) || {sold:0,gift:0};
        split[entry.kind] += Number(entry.ml || 0);
        transitBreakdown.set(key, split);
      }
    }
  }

  // Read-only audit of accepted NEW order demand. This is NOT an actual reservation:
  // it cannot protect against concurrent checkout and must never drive public blocking.
  // Ignore preview and PNTEST orders to avoid contaminating production availability.
  const newDemand = new Map();
  for (const order of Array.isArray(orders) ? orders : []) {
    if (order?.status !== "NEW" || order?.environment === "preview" ||
        order?.origin === "regression_test" || String(order?.order_id || "").startsWith("PNTEST")) continue;
    for (const entry of inventorySaleItems(order?.source_payload?.items)) {
      const key = String(entry.product_name || "").trim().toLowerCase();
      const ml = Number(entry.ml);
      if (!key || !Number.isFinite(ml) || ml <= 0) continue;
      newDemand.set(key, (newDemand.get(key) || 0) + ml);
    }
  }

  const rows = [...tracked.values()].map((row) => {
    const consumed = row.historical_baseline
      ? Number(historical.get(row.product_name.toLowerCase())?.ml || 0) +
        Number(historicalTransit.get(row.product_name.toLowerCase()) || 0)
      : Math.round((row.consumed_since_tracking_ml + Number.EPSILON) * 100) / 100;
    const history = historical.get(row.product_name.toLowerCase());
    const transit = transitBreakdown.get(row.product_name.toLowerCase());
    const breakdown = row.historical_baseline
      ? consumptionBreakdown(consumed, (history?.sold_ml || 0) + (transit?.sold || 0), (history?.gift_ml || 0) + (transit?.gift || 0))
      : consumptionBreakdown(consumed, row.sold_since_tracking_ml, row.gift_since_tracking_ml);
    const remaining = Math.round((row.stock_in_ml - consumed - row.manual_out_ml + Number.EPSILON) * 100) / 100;
    return {
      ...row,
      resale_in_ml: resale.get(row.product_name.toLowerCase())?.ml || 0,
      resale_out_ml: resale.get(row.product_name.toLowerCase())?.ml || 0,
      consumed_since_tracking_ml: consumed,
      ...breakdown,
      // Audit estimate only. Not subtracted from the operational remaining_ml.
      pending_new_ml: Math.round(((newDemand.get(row.product_name.toLowerCase()) || 0) + Number.EPSILON) * 100) / 100,
      hypothetical_after_new_ml: Math.round((remaining - (newDemand.get(row.product_name.toLowerCase()) || 0) + Number.EPSILON) * 100) / 100,
      remaining_ml: remaining,
      stock_status: remaining < 0 && row.estimated ? "REVIEW" : remaining <= 0 ? "DEPLETED" : remaining <= 20 ? "LOW" : "OK"
    };
  }).sort((a, b) => a.remaining_ml - b.remaining_ml || a.product_name.localeCompare(b.product_name));

  return {
    tracked_count: rows.filter((row) => !row.estimated).length,
    estimated_count: rows.filter((row) => row.estimated).length,
    historical_consumption: [...historical.values()],
    resale_bottles: [...resale.values()],
    low_count: rows.filter((row) => row.stock_status === "LOW").length,
    depleted_count: rows.filter((row) => row.stock_status === "DEPLETED").length,
    remaining_total_ml: Math.round((rows.reduce((sum, row) => sum + Math.max(0, row.remaining_ml), 0) + Number.EPSILON) * 100) / 100,
    pending_new_total_ml: Math.round(([...newDemand.values()].reduce((sum, ml) => sum + ml, 0) + Number.EPSILON) * 100) / 100,
    pending_new_unmatched: [...newDemand.entries()]
      .filter(([key]) => !tracked.has(key))
      .map(([product_name, ml]) => ({ product_name, ml: Math.round(ml * 100) / 100 })),
    rows
  };
}

