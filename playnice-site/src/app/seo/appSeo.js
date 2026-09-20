export const getAppSeoMetadata = ({
  view,
  selectedProduct,
  lang,
  siteBaseUrl,
  getProductSeoTitle,
  getProductMetaDescription,
  getSeoProductUrl,
  getSeoProductImage,
}) => {
  const title = selectedProduct
    ? getProductSeoTitle(
        selectedProduct,
        lang
      )
    : view === "shop"
    ? lang === "en"
      ? "Shop | Premium fragrances and decants in Montenegro | PlayNice"
      : "Shop | Premium parfemi i dekanti u Crnoj Gori | PlayNice"
    : view === "journal"
    ? lang === "en"
      ? "Le Journal | Fragrance stories and recommendations | PlayNice"
      : "Le Journal | Mirisne priče i preporuke | PlayNice"
    : lang === "en"
    ? "PlayNice | Premium fragrances and decants in Montenegro"
    : "PlayNice | Premium parfemi i dekanti u Crnoj Gori";

  const description = selectedProduct
    ? getProductMetaDescription(
        selectedProduct,
        lang
      )
    : view === "shop"
    ? lang === "en"
      ? "Explore the PlayNice collection of premium fragrance decants in Montenegro. Designer, niche and Arabian fragrances with delivery across Montenegro."
      : "Istraži PlayNice kolekciju premium parfema i dekanata u Crnoj Gori. Designer, niche i Arabian mirisi, dostava širom Crne Gore."
    : view === "journal"
    ? lang === "en"
      ? "Le Journal by PlayNice brings short fragrance stories, recommendations and guides for choosing the right perfume."
      : "PlayNice rubrika Le Journal donosi kratke mirisne priče, preporuke i vodiče za bolji izbor parfema."
    : lang === "en"
    ? "Premium fragrance decants and original perfumes in Montenegro. Try before you buy with PlayNice — designer, niche and Arabian fragrances."
    : "Premium dekanti i originalni parfemi u Crnoj Gori. Probaj prije kupovine uz PlayNice — designer, niche i Arabian mirisi.";

  const canonicalUrl = selectedProduct
    ? getSeoProductUrl(selectedProduct)
    : view === "shop"
    ? `${siteBaseUrl}/shop`
    : view === "journal"
    ? `${siteBaseUrl}/journal`
    : `${siteBaseUrl}/`;

  const imageUrl = selectedProduct
    ? getSeoProductImage(selectedProduct)
    : `${siteBaseUrl}/og-image.jpg`;

  return {
    title,
    description,
    canonicalUrl,
    imageUrl,
    ogType: selectedProduct
      ? "product"
      : "website",
    twitterCard: "summary_large_image",
  };
};
