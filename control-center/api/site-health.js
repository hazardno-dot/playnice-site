const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const ORIGIN = "https://www.playniceshop.me";

const json = (res, status, body) => res.status(status).json(body);

async function supabaseFetch(path, token) {
  return fetch(`${SUPABASE_URL}${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` },
  });
}

async function authenticate(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: [401, "Missing admin session."] };
  const userRes = await supabaseFetch("/auth/v1/user", token);
  if (!userRes.ok) return { error: [401, "Invalid admin session."] };
  const user = await userRes.json();
  const adminRes = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`, token);
  const admins = adminRes.ok ? await adminRes.json() : [];
  if (!admins.length) return { error: [403, "This account is not authorized for Site Health."] };
  return { token, user };
}

const TARGETS = [
  { key: "home", label: "Home", path: "/", kind: "page" },
  { key: "shop", label: "Shop", path: "/shop", kind: "page" },
  { key: "journal", label: "Journal", path: "/journal", kind: "page" },
  { key: "community", label: "Community", path: "/community", kind: "page" },
  { key: "exhibition", label: "Exhibition", path: "/exhibition", kind: "page" },
  { key: "robots", label: "robots.txt", path: "/robots.txt", kind: "asset" },
  { key: "sitemap", label: "sitemap.xml", path: "/sitemap.xml", kind: "asset" },
];

function validateContract(target, text, contentType, finalUrl) {
  const issues = [];
  const warnings = [];
  const normalizedType = String(contentType || "").toLowerCase();
  const final = new URL(finalUrl || `${ORIGIN}${target.path}`);
  const allowedHosts = new Set(["playniceshop.me", "www.playniceshop.me"]);

  if (!allowedHosts.has(final.hostname)) issues.push(`Unexpected final host: ${final.hostname}`);
  if (final.pathname !== target.path) warnings.push(`Redirected to ${final.pathname}`);

  if (target.kind === "page") {
    if (!normalizedType.includes("text/html")) issues.push(`Expected HTML, received ${contentType || "unknown content type"}`);
    if (!/PlayNice/i.test(text)) issues.push("PlayNice HTML shell marker is missing");
  }

  if (target.key === "robots") {
    if (!/User-agent:\s*\*/i.test(text)) issues.push("robots.txt is missing User-agent: *");
    if (!/Allow:\s*\//i.test(text)) issues.push("robots.txt is missing Allow: /");
    if (!/Sitemap:\s*https:\/\/(?:www\.)?playniceshop\.me\/sitemap\.xml/i.test(text)) issues.push("robots.txt is missing the canonical sitemap declaration");
  }

  if (target.key === "sitemap") {
    if (!/<urlset\b/i.test(text)) issues.push("sitemap.xml is missing <urlset>");
    if (!/https:\/\/(?:www\.)?playniceshop\.me\//i.test(text)) issues.push("sitemap.xml has no PlayNice URLs");
    if (!/https:\/\/(?:www\.)?playniceshop\.me\/shop(?:<|\/|\s)/i.test(text)) warnings.push("sitemap.xml has no explicit /shop URL");
    if (!/https:\/\/(?:www\.)?playniceshop\.me\/journal(?:<|\/|\s)/i.test(text)) warnings.push("sitemap.xml has no explicit /journal URL");
  }

  return { contractOk: issues.length === 0, issues, warnings };
}

async function probe(target) {
  const started = Date.now();
  try {
    const response = await fetch(`${ORIGIN}${target.path}`, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "PlayNice-Control-Center-Site-Health/1.1", "Cache-Control": "no-cache" },
      signal: AbortSignal.timeout(8000),
    });
    const responseMs = Date.now() - started;
    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();
    const contract = validateContract(target, text, contentType, response.url);
    const ok = response.ok && contract.contractOk;
    return {
      ...target,
      ok,
      status: response.status,
      responseMs,
      latency: responseMs > 2500 ? "slow" : "normal",
      contentType,
      finalUrl: response.url,
      contractOk: contract.contractOk,
      issues: contract.issues,
      warnings: contract.warnings,
    };
  } catch (error) {
    return {
      ...target,
      ok: false,
      status: 0,
      responseMs: Date.now() - started,
      latency: "failed",
      contentType: "",
      finalUrl: "",
      contractOk: false,
      issues: [error?.name === "TimeoutError" ? "Timed out after 8s" : (error?.message || String(error))],
      warnings: [],
    };
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Supabase server configuration is missing." });

  const auth = await authenticate(req);
  if (auth.error) return json(res, auth.error[0], { error: auth.error[1] });

  const checkedAt = new Date().toISOString();
  const checks = await Promise.all(TARGETS.map(probe));
  const failed = checks.filter((item) => !item.ok);
  const slow = checks.filter((item) => item.ok && item.responseMs > 2500);
  const semanticFailures = checks.filter((item) => !item.contractOk);
  const warnings = checks.flatMap((item) => item.warnings || []);
  const timings = checks.filter((item) => item.status > 0).map((item) => item.responseMs);
  const avgResponseMs = timings.length ? Math.round(timings.reduce((sum, value) => sum + value, 0) / timings.length) : 0;
  const maxResponseMs = timings.length ? Math.max(...timings) : 0;
  const overall = failed.length ? "error" : (slow.length || warnings.length) ? "warning" : "healthy";

  res.setHeader("Cache-Control", "no-store");
  return json(res, 200, {
    overall,
    checkedAt,
    origin: ORIGIN,
    summary: {
      total: checks.length,
      healthy: checks.length - failed.length,
      failed: failed.length,
      slow: slow.length,
      semanticFailures: semanticFailures.length,
      warnings: warnings.length,
      avgResponseMs,
      maxResponseMs,
    },
    checks,
  });
}
