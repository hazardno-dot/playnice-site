const clean = (value) => String(value || "").trim();

export function isModernSupabaseSecretKey(value) {
  return /^sb_secret_/i.test(clean(value));
}

export function supabaseRestHeaders({
  token = "",
  publishableKey = "",
  serverKey = "",
  includeContentType = true,
  extra = {},
} = {}) {
  const accessToken = clean(token);
  const publicKey = clean(publishableKey);
  const secretKey = clean(serverKey);
  const serverRequest = Boolean(accessToken && secretKey && accessToken === secretKey);

  const headers = {};

  if (serverRequest) {
    headers.apikey = secretKey;
    // New sb_secret_* keys authenticate through the apikey header and are not JWTs.
    // Legacy service_role keys are JWTs, so keep the Bearer header for compatibility.
    if (!isModernSupabaseSecretKey(secretKey)) {
      headers.Authorization = `Bearer ${secretKey}`;
    }
  } else {
    if (publicKey) headers.apikey = publicKey;
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  }

  if (includeContentType) headers["Content-Type"] = "application/json";
  return { ...headers, ...(extra || {}) };
}
