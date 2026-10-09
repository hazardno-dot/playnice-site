const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const json = (res, status, body) => res.status(status).json(body);

async function supabaseFetch(path, token, options = {}) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });
}

async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) return { error: "Missing admin session.", status: 401 };

  const userRes = await supabaseFetch("/auth/v1/user", token);
  if (!userRes.ok) return { error: "Invalid admin session.", status: 401 };
  const user = await userRes.json();

  const adminRes = await supabaseFetch(`/rest/v1/admin_users?user_id=eq.${encodeURIComponent(user.id)}&select=user_id&limit=1`, token);
  const admins = adminRes.ok ? await adminRes.json() : [];
  if (!admins.length) return { error: "This account is not authorized.", status: 403 };

  return { token, user };
}

const channelAllowed = (value) => ["instagram_feed", "instagram_story", "facebook"].includes(String(value || ""));
const mediaUrl = (item) => String(item?.src || item?.url || "").trim();

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return json(res, 500, { error: "Server configuration is incomplete." });
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const auth = await requireAdmin(req);
    if (auth.error) return json(res, auth.status, { error: auth.error });

    const id = String(req.body?.id || "").trim();
    const action = String(req.body?.action || "").trim();
    const channel = String(req.body?.channel || "").trim();
    if (!id) return json(res, 400, { error: "Social event id is required." });
    if (!channelAllowed(channel)) return json(res, 400, { error: "Unsupported Social channel." });
    if (!["set_media", "approve_visual", "set_carousel", "clear_carousel", "approve_carousel"].includes(action)) return json(res, 400, { error: "Unsupported Social media action." });

    const eventRes = await supabaseFetch(`/rest/v1/social_events?id=eq.${encodeURIComponent(id)}&select=*&limit=1`, auth.token);
    if (!eventRes.ok) return json(res, 400, { error: "Could not load Social event." });
    const [event] = await eventRes.json();
    if (!event) return json(res, 404, { error: "Social event not found." });
    if (event.status !== "draft") return json(res, 409, { error: "Return this Social event to draft before changing Social media." });

    let patch;
    let auditAction;
    let auditDetails;

    if (action === "set_carousel") {
      if (event.source_type !== "custom") return json(res, 409, { error: "Carousel v1 is available for manual blank Social posts." });
      const supplied = req.body?.items;
      if (!Array.isArray(supplied) || supplied.length < 1 || supplied.length > 10) return json(res, 400, { error: "Choose 1–10 images while editing; 2–10 required for approval." });
      const items = supplied.map((item, index) => ({
        src: mediaUrl(item), url: mediaUrl(item), format: "4:5",
        source: "social_carousel", carousel_index: index,
        width: Number(item?.width), height: Number(item?.height),
        bytes: Number(item?.bytes) || null, storage_path: String(item?.storage_path || ""),
      }));
      if (items.some((item) => !item.src.startsWith("https://") || item.width !== 1080 || item.height !== 1350 || !item.storage_path.startsWith(`${event.id}/`) ||
        item.src !== `${SUPABASE_URL.replace(/\\/$/, "")}/storage/v1/object/public/social-media/${item.storage_path}`)) {
        return json(res, 400, { error: "Each carousel asset must be an uploaded public JPEG at 1080 × 1350." });
      }
      const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {};
      const approvals = { ...(metadata.social_media_approval || {}) };
      delete approvals.instagram_feed;
      delete approvals.facebook;
      patch = {
        media: [...(Array.isArray(event.media) ? event.media : []).filter((item) => item?.source !== "social_carousel"),
          ...["instagram_feed", "facebook"].flatMap((carouselChannel) => items.map((item) => ({ ...item, channel: carouselChannel })))],
        channels: ["instagram_feed", "facebook"],
        draft_content: event.draft_content || null,
        approved_content: null,
        metadata: { ...metadata, social_carousel: true,
          carousel_original_channels: metadata.carousel_original_channels || event.channels,
          social_media_approval: approvals },
      };
      auditAction = "social_carousel_updated";
      auditDetails = { image_count: items.length, channels: patch.channels };
    } else if (action === "clear_carousel") {
      const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {};
      const approvals = { ...(metadata.social_media_approval || {}) };
      delete approvals.instagram_feed;
      delete approvals.facebook;
      patch = {
        media: (Array.isArray(event.media) ? event.media : []).filter((item) => item?.source !== "social_carousel"),
        channels: Array.isArray(metadata.carousel_original_channels) ? metadata.carousel_original_channels : ["instagram_feed", "instagram_story", "facebook"],
        metadata: { ...metadata, social_carousel: false, social_media_approval: approvals },
        draft_content: event.draft_content || null, approved_content: null,
      };
      auditAction = "social_carousel_cleared";
      auditDetails = {};
    } else if (action === "approve_carousel") {
      if (!event.metadata?.social_carousel) return json(res, 409, { error: "Carousel mode is not active." });
      const media = Array.isArray(event.media) ? event.media : [];
      const urls = media.filter((item) => item?.source === "social_carousel" && item?.channel === "instagram_feed")
        .sort((a, b) => a.carousel_index - b.carousel_index).map(mediaUrl);
      if (urls.length < 2 || urls.length > 10) return json(res, 409, { error: "Carousel approval needs 2–10 uploaded images." });
      const facebookUrls = media.filter((item) => item?.source === "social_carousel" && item?.channel === "facebook")
        .sort((a, b) => a.carousel_index - b.carousel_index).map(mediaUrl);
      if (JSON.stringify(urls) !== JSON.stringify(facebookUrls)) return json(res, 409, { error: "Instagram/Facebook carousel assets differ." });
      const metadata = event.metadata;
      const approval = { approved: true, src: urls[0], carousel_urls: urls, approved_at: new Date().toISOString(), approved_by: auth.user.id };
      patch = { metadata: { ...metadata, social_media_approval: { ...(metadata.social_media_approval || {}),
        instagram_feed: approval, facebook: approval } } };
      auditAction = "social_carousel_visual_approved";
      auditDetails = { image_count: urls.length, channels: ["instagram_feed", "facebook"] };
    } else if (action === "set_media") {
      const entry = req.body?.entry && typeof req.body.entry === "object" ? req.body.entry : null;
      const source = String(entry?.source || "");
      if (!entry || !["social_upload", "social_generated"].includes(source)) return json(res, 400, { error: "Invalid Social media entry." });
      if (String(entry.channel || "") !== channel) return json(res, 400, { error: "Social media entry channel mismatch." });
      if (!mediaUrl(entry).startsWith("https://")) return json(res, 400, { error: "Social media URL must use HTTPS." });

      const currentMedia = Array.isArray(event.media) ? event.media : [];
      const nextMedia = [entry, ...currentMedia.filter((item) => !(item?.source === source && item?.channel === channel))];
      patch = { media: nextMedia };
      auditAction = source === "social_upload" ? "social_media_uploaded" : "social_media_generated";
      auditDetails = {
        channel,
        format: entry.format || null,
        width: entry.width || null,
        height: entry.height || null,
        bytes: entry.bytes || null,
        storage_path: entry.storage_path || null,
        fit: "contain",
        background: "#000000",
        ...(entry.source_url ? { source_url: entry.source_url } : {}),
      };
    } else {
      const src = String(req.body?.src || "").trim();
      if (!src.startsWith("https://")) return json(res, 400, { error: "Visual approval requires an HTTPS asset URL." });
      const metadata = event.metadata && typeof event.metadata === "object" ? event.metadata : {};
      const approvals = metadata.social_media_approval && typeof metadata.social_media_approval === "object" ? metadata.social_media_approval : {};
      patch = {
        metadata: {
          ...metadata,
          social_media_approval: {
            ...approvals,
            [channel]: {
              approved: true,
              src,
              approved_at: new Date().toISOString(),
              approved_by: auth.user.id,
            },
          },
        },
      };
      auditAction = "social_media_visual_approved";
      auditDetails = { channel, src };
    }

    const updateRes = await supabaseFetch(`/rest/v1/social_events?id=eq.${encodeURIComponent(id)}`, auth.token, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    const updateText = await updateRes.text();
    let updatedRows = [];
    try { updatedRows = updateText ? JSON.parse(updateText) : []; } catch { updatedRows = []; }
    if (!updateRes.ok) {
      const detail = String(updatedRows?.message || updatedRows?.details || updateText || `HTTP ${updateRes.status}`).slice(0, 240);
      return json(res, 400, { error: `SOCIAL EVENT UPDATE FAILED: ${detail}` });
    }
    const updated = Array.isArray(updatedRows) ? updatedRows[0] : null;

    const auditRes = await supabaseFetch("/rest/v1/social_audit_log", auth.token, {
      method: "POST",
      body: JSON.stringify({ social_event_id: id, actor_id: auth.user.id, action: auditAction, details: auditDetails }),
    });

    return json(res, 200, {
      ok: true,
      event: updated,
      audit_logged: auditRes.ok,
      ...(auditRes.ok ? {} : { audit_warning: `AUDIT LOG FAILED: HTTP ${auditRes.status}` }),
    });
  } catch (error) {
    return json(res, 400, { error: error?.message || "Could not update Social media." });
  }
}
