import assert from "node:assert/strict";
import fs from "node:fs";
const sql=fs.readFileSync("control-center/supabase/shop_inventory_source_v1.sql","utf8");
assert.match(sql,/security definer/i);
assert.match(sql,/\bstable\b/i);
assert.match(sql,/SERVICE_ROLE_REQUIRED/);
assert.match(sql,/auth\.role\(\) is distinct from 'service_role'/);
assert.match(sql,/SOURCE_TOO_LARGE/);
assert.match(sql,/INCOMPLETE_SNAPSHOT/);
assert.match(sql,/revoke all on function public\.get_shop_inventory_source_v1\(\)\s+from public,anon,authenticated/);
assert.match(sql,/grant execute on function public\.get_shop_inventory_source_v1\(\)\s+to service_role/);
assert.match(sql,/source_payload',jsonb_build_object/);
assert.doesNotMatch(sql,/\b(update|insert|delete)\s+(?:into|from|public\.)/i);
for(const field of ["'email'","'phone'","'address'","'city'","'customer_name'"]){
  assert.equal(sql.includes(field),false,"Never return shopper personal data: "+field);
}
const src=fs.readFileSync("control-center/lib/inventory-shop-source.mjs","utf8");
assert.match(src,/remainingFromSupabaseSources/);
assert.match(src,/buildInventoryAnalytics\(orders,inventory\.rows,history\.commerce\)/);
console.log("PASS source RPC draft: restricted, read-only, no personal data, completeness guard");
