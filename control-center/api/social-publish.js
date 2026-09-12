import { SOCIAL_SHADOW_MODE } from "../src/socialEvent.mjs";

const json = (res, status, body) => res.status(status).json(body);

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  if (SOCIAL_SHADOW_MODE) {
    return json(res, 423, {
      ok: false,
      status: "locked",
      reason: "shadow_mode",
      message: "Social Publisher v1 is infrastructure-only. Meta publishing is intentionally disabled.",
    });
  }

  return json(res, 501, {
    ok: false,
    status: "not_implemented",
    message: "Meta publishing adapter has not been enabled.",
  });
}
