import {
  getAppSeoMetadata,
} from "./appSeo";

const deps = {
  siteBaseUrl: "https://playniceshop.me",
  getProductSeoTitle: (product, lang) =>
    `${product.name} ${lang}`,
  getProductMetaDescription: (product, lang) =>
    `${product.name} description ${lang}`,
  getSeoProductUrl: (product) =>
    `https://playniceshop.me/product/${product.slug}`,
  getSeoProductImage: (product) =>
    `https://playniceshop.me${product.image}`,
};

describe("getAppSeoMetadata", () => {
  test("builds Serbian home metadata", () => {
    expect(
      getAppSeoMetadata({
        view: "home",
        selectedProduct: null,
        lang: "sr",
        ...deps,
      })
    ).toEqual({
      title:
        "PlayNice | Premium parfemi i dekanti u Crnoj Gori",
      description:
        "Premium dekanti i originalni parfemi u Crnoj Gori. Probaj prije kupovine uz PlayNice — designer, niche i Arabian mirisi.",
      canonicalUrl:
        "https://playniceshop.me/",
      imageUrl:
        "https://playniceshop.me/og-image.jpg",
      ogType: "website",
      twitterCard:
        "summary_large_image",
    });
  });

  test("builds English Shop metadata", () => {
    const result =
      getAppSeoMetadata({
        view: "shop",
        selectedProduct: null,
        lang: "en",
        ...deps,
      });

    expect(result.title).toBe(
      "Shop | Premium fragrances and decants in Montenegro | PlayNice"
    );
    expect(result.canonicalUrl).toBe(
      "https://playniceshop.me/shop"
    );
  });

  test("builds Journal canonical and website OG type", () => {
    const result =
      getAppSeoMetadata({
        view: "journal",
        selectedProduct: null,
        lang: "sr",
        ...deps,
      });

    expect(result.canonicalUrl).toBe(
      "https://playniceshop.me/journal"
    );
    expect(result.ogType).toBe(
      "website"
    );
  });

  test("delegates product metadata to product SEO helpers", () => {
    const product = {
      name: "Test",
      slug: "test",
      image: "/products/test.webp",
    };

    expect(
      getAppSeoMetadata({
        view: "shop",
        selectedProduct: product,
        lang: "en",
        ...deps,
      })
    ).toEqual({
      title: "Test en",
      description:
        "Test description en",
      canonicalUrl:
        "https://playniceshop.me/product/test",
      imageUrl:
        "https://playniceshop.me/products/test.webp",
      ogType: "product",
      twitterCard:
        "summary_large_image",
    });
  });
});
