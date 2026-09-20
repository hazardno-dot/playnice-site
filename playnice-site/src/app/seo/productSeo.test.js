import { products } from "../../data/products";
import {
  getProductFromPathname,
  getProductSlug,
  getProductUrl,
} from "./productSeo";

describe("productSeo routing contract", () => {
  test("resolves a canonical PDP pathname back to the same catalog product", () => {
    const product = products[0];
    const pathname = getProductUrl(product);

    expect(pathname).toBe(
      `/product/${getProductSlug(product)}`
    );

    expect(
      getProductFromPathname(pathname)
    ).toBe(product);
  });

  test("returns null for unknown, incomplete and malformed product routes", () => {
    expect(
      getProductFromPathname(
        "/product/not-a-real-product"
      )
    ).toBeNull();

    expect(
      getProductFromPathname("/product/")
    ).toBeNull();

    expect(
      getProductFromPathname(
        "/product/%E0%A4%A"
      )
    ).toBeNull();
  });

  test("does not treat nested paths as a PDP route", () => {
    const product = products[0];

    expect(
      getProductFromPathname(
        `${getProductUrl(product)}/extra`
      )
    ).toBeNull();
  });
});
