export const buildEcommerceItem = (
  item,
  overrides = {}
) => ({
  item_id: String(
    overrides.item_id ??
      item?.id ??
      item?.key ??
      ""
  ),
  item_name:
    overrides.item_name ??
    item?.name ??
    "",
  item_variant:
    overrides.item_variant ??
    item?.size ??
    "",
  ...(overrides.item_category ??
  item?.category
    ? {
        item_category:
          overrides.item_category ??
          item?.category,
      }
    : {}),
  price: Number(
    overrides.price ??
      item?.price ??
      0
  ),
  quantity: Number(
    overrides.quantity ??
      item?.quantity ??
      1
  ),
});

export const buildEcommerceItems = (
  items = []
) =>
  items.map((item) =>
    buildEcommerceItem(item)
  );

export const getEcommerceValue = (
  items = []
) =>
  Number(
    items
      .reduce(
        (sum, item) =>
          sum +
          Number(item?.price || 0) *
            Number(item?.quantity || 1),
        0
      )
      .toFixed(2)
  );
