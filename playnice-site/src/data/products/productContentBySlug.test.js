import { products } from "./index";
import {
  getProductContentBySlug,
  productCopyBySlug,
  productWearContextBySlug,
  productDoNotWearContextBySlug,
  productWhatToWearContextBySlug,
} from "./productContentBySlug";

describe("productContentBySlug", () => {
  test("resolves all product content by canonical slug", () => {
    for (const product of products) {
      expect(productCopyBySlug[product.slug]).toBeTruthy();
      expect(productWearContextBySlug[product.slug]).toBeTruthy();
      expect(productDoNotWearContextBySlug[product.slug]).toBeTruthy();
      expect(productWhatToWearContextBySlug[product.slug]).toBeTruthy();

      expect(getProductContentBySlug(product)).toEqual({
        copy: productCopyBySlug[product.slug],
        wear: productWearContextBySlug[product.slug],
        doNotWear: productDoNotWearContextBySlug[product.slug],
        whatToWear: productWhatToWearContextBySlug[product.slug],
      });
    }
  });

  test("returns null for missing product identity", () => {
    expect(getProductContentBySlug(null)).toBeNull();
    expect(getProductContentBySlug({})).toBeNull();
    expect(getProductContentBySlug("missing-product")).toEqual({
      copy: null,
      wear: null,
      doNotWear: null,
      whatToWear: null,
    });
  });
});
