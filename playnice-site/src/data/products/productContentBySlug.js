import { products } from "./index";
import { productCopy } from "./productCopy";
import { productWearContext } from "./productWearContext";
import { productDoNotWearContext } from "./productDoNotWearContext";
import { productWhatToWearContext } from "./productWhatToWearContext";

const indexBySlug = (source) =>
  Object.fromEntries(
    products.map((product) => [
      product.slug,
      source[product.name] || null,
    ])
  );

export const productCopyBySlug = indexBySlug(productCopy);
export const productWearContextBySlug = indexBySlug(productWearContext);
export const productDoNotWearContextBySlug = indexBySlug(productDoNotWearContext);
export const productWhatToWearContextBySlug = indexBySlug(productWhatToWearContext);

export const getProductContentBySlug = (productOrSlug) => {
  const slug =
    typeof productOrSlug === "string"
      ? productOrSlug
      : productOrSlug?.slug;

  if (!slug) return null;

  return {
    copy: productCopyBySlug[slug] || null,
    wear: productWearContextBySlug[slug] || null,
    doNotWear: productDoNotWearContextBySlug[slug] || null,
    whatToWear: productWhatToWearContextBySlug[slug] || null,
  };
};
