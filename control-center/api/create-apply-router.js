import createApply from "./create-apply.js";
import refreshProductApply from "./refresh-product-apply.js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function loadDraftState(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const slug = String(req.body?.product_slug || "").trim();
  if (!token || !slug || !SUPABASE_URL || !SUPABASE_KEY) return null;

  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/product_drafts?product_slug=eq.${encodeURIComponent(slug)}&select=apply_branch,apply_pr_number&limit=1`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) return null;
  const [draft] = await response.json();
  return draft || null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return createApply(req, res);

  try {
    const state = await loadDraftState(req);
    if (state?.apply_branch && state?.apply_pr_number) {
      return refreshProductApply(req, res);
    }
  } catch {
    // Fall through to the established create path; it owns the canonical errors.
  }

  return createApply(req, res);
}
