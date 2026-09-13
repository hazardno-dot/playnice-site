import { SOCIAL_SHADOW_MODE } from "../src/socialEvent.mjs";
import { META_PUBLISH_ENABLED, publishSocialEvent } from "../src/metaPublishAdapter.mjs";

const json = (res, status, body) => res.status(status).json(body);

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  if (SOCIAL_SHADOW_MODE || !META_PUBLISH_ENABLED) {
    return json(res, 423, {
      ok: false,
      status: "locked",
      reason: "PUBLISH_LOCKED",
      message: "Social Publisher v1 is infrastructure-only. Meta publishing is intentionally disabled.",
    });
  }

  const event = req.body?.event || {};
  const result = await publishSocialEvent(event);
  return json(res, result.ok ? 200 : result.status === "locked" ? 423 : 501, result);
}
