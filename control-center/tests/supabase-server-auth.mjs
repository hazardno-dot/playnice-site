import assert from "node:assert/strict";
import { isModernSupabaseSecretKey, supabaseRestHeaders } from "../lib/supabase-server-auth.mjs";

const modern = "sb_secret_test_only";
const legacy = "eyJhbGciOiJIUzI1NiJ9.service_role.test";
const publishable = "sb_publishable_test";
const userJwt = "eyJhbGciOiJIUzI1NiJ9.authenticated.test";

assert.equal(isModernSupabaseSecretKey(modern), true);
assert.equal(isModernSupabaseSecretKey(legacy), false);

const modernHeaders = supabaseRestHeaders({
  token: modern,
  publishableKey: publishable,
  serverKey: modern,
});
assert.equal(modernHeaders.apikey, modern);
assert.equal("Authorization" in modernHeaders, false, "Modern sb_secret key must not be sent as Bearer JWT.");

const legacyHeaders = supabaseRestHeaders({
  token: legacy,
  publishableKey: publishable,
  serverKey: legacy,
});
assert.equal(legacyHeaders.apikey, legacy);
assert.equal(legacyHeaders.Authorization, `Bearer ${legacy}`);

const userHeaders = supabaseRestHeaders({
  token: userJwt,
  publishableKey: publishable,
  serverKey: modern,
});
assert.equal(userHeaders.apikey, publishable);
assert.equal(userHeaders.Authorization, `Bearer ${userJwt}`);

console.log("PASS  Supabase server auth distinguishes modern secret keys, legacy service-role JWTs and user JWTs");
