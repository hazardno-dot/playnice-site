module.exports = async function handler(req, res) {
  const mod = await import("../lib/create-new-product-engine.mjs");
  return mod.default(req, res);
};
