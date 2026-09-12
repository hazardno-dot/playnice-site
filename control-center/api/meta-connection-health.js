const json = (res, status, body) => res.status(status).json(body);

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  const configured = {
    app_id: Boolean(process.env.META_APP_ID),
    app_secret: Boolean(process.env.META_APP_SECRET),
    page_id: Boolean(process.env.META_PAGE_ID),
    instagram_user_id: Boolean(process.env.META_IG_USER_ID),
    page_access_token: Boolean(process.env.META_PAGE_ACCESS_TOKEN),
  };

  return json(res, 200, {
    ok: true,
    mode: "shadow",
    configured,
    ready_for_connection_test: Object.values(configured).every(Boolean),
    publishing_enabled: false,
  });
}
