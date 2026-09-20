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
  ...(
    overrides.item_list_id ??
    item?.analyticsListId
      ? {
          item_list_id:
            overrides.item_list_id ??
            item?.analyticsListId,
        }
      : {}
  ),
  ...(
    overrides.item_list_name ??
    item?.analyticsListName
      ? {
          item_list_name:
            overrides.item_list_name ??
            item?.analyticsListName,
        }
      : {}
  ),
  ...(
    Number.isFinite(
      Number(
        overrides.index ??
        item?.analyticsListIndex
      )
    )
      ? {
          index: Number(
            overrides.index ??
            item?.analyticsListIndex
          ),
        }
      : {}
  ),
  ...(
    overrides.item_source ??
    item?.analyticsOrigin
      ? {
          item_source:
            overrides.item_source ??
            item?.analyticsOrigin,
        }
      : {}
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


export const buildProductListItem = (
  product,
  {
    index,
    listId,
    listName,
    price,
    variant,
  } = {}
) => {
  const item = buildEcommerceItem(
    product,
    {
      price:
        price ??
        product?.price ??
        0,
      item_variant:
        variant ??
        "",
      quantity: 1,
    }
  );

  return {
    ...item,
    ...(listId
      ? { item_list_id: listId }
      : {}),
    ...(listName
      ? { item_list_name: listName }
      : {}),
    ...(Number.isFinite(Number(index))
      ? { index: Number(index) }
      : {}),
  };
};

export const buildProductListEvent = ({
  products = [],
  listId,
  listName,
  getPrice,
}) => ({
  item_list_id: listId,
  item_list_name: listName,
  items: products.map(
    (product, index) =>
      buildProductListItem(
        product,
        {
          index: index + 1,
          listId,
          listName,
          price: getPrice
            ? getPrice(product)
            : product?.price ?? 0,
        }
      )
  ),
});

export const buildProductSelectionEvent = ({
  product,
  index,
  listId,
  listName,
  price,
  variant,
}) => ({
  item_list_id: listId,
  item_list_name: listName,
  items: [
    buildProductListItem(
      product,
      {
        index,
        listId,
        listName,
        price,
        variant,
      }
    ),
  ],
});
