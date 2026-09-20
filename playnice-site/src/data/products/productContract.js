export const PRODUCT_CATEGORIES = [
  "Arabian",
  "Designer",
  "Niche",
];

export const PRODUCT_SEASONS = [
  "all",
  "summer",
  "winter",
];

export const PRODUCT_COPY_FIELDS = [
  "miniTag",
  "card",
  "modal",
  "scentType",
  "dominantNotes",
  "tags",
  "whyChoose",
];

const isNonEmptyString = (value) =>
  typeof value === "string" &&
  value.trim().length > 0;

const isPositiveFiniteNumber = (value) =>
  Number.isFinite(Number(value)) &&
  Number(value) > 0;

const pushError = (
  errors,
  product,
  field,
  message
) => {
  const identity =
    product?.slug ||
    product?.name ||
    product?.id ||
    "unknown-product";

  errors.push(
    `${identity}: ${field} ${message}`
  );
};

const validateLocalizedText = ({
  errors,
  product,
  value,
  field,
  expectArray = false,
}) => {
  for (const lang of ["sr", "en"]) {
    const localizedValue = value?.[lang];

    if (expectArray) {
      if (
        !Array.isArray(localizedValue) ||
        localizedValue.length === 0 ||
        localizedValue.some(
          (item) => !isNonEmptyString(item)
        )
      ) {
        pushError(
          errors,
          product,
          `${field}.${lang}`,
          "must be a non-empty string array"
        );
      }

      continue;
    }

    if (!isNonEmptyString(localizedValue)) {
      pushError(
        errors,
        product,
        `${field}.${lang}`,
        "must be a non-empty string"
      );
    }
  }
};

export const validateProduct = (
  product,
  { knownSlugs } = {}
) => {
  const errors = [];

  if (
    !Number.isInteger(product?.id) ||
    product.id <= 0
  ) {
    pushError(
      errors,
      product,
      "id",
      "must be a positive integer"
    );
  }

  for (const field of [
    "slug",
    "name",
    "shortName",
    "category",
    "image",
    "badge",
    "ratingLabel",
    "season",
  ]) {
    if (!isNonEmptyString(product?.[field])) {
      pushError(
        errors,
        product,
        field,
        "must be a non-empty string"
      );
    }
  }

  if (
    isNonEmptyString(product?.category) &&
    !PRODUCT_CATEGORIES.includes(
      product.category
    )
  ) {
    pushError(
      errors,
      product,
      "category",
      `must be one of ${PRODUCT_CATEGORIES.join(", ")}`
    );
  }

  if (
    isNonEmptyString(product?.season) &&
    !PRODUCT_SEASONS.includes(
      product.season
    )
  ) {
    pushError(
      errors,
      product,
      "season",
      `must be one of ${PRODUCT_SEASONS.join(", ")}`
    );
  }

  if (
    !isPositiveFiniteNumber(product?.rating)
  ) {
    pushError(
      errors,
      product,
      "rating",
      "must be a positive finite number"
    );
  }

  const sizeEntries = Object.entries(
    product?.sizes || {}
  );

  if (sizeEntries.length === 0) {
    pushError(
      errors,
      product,
      "sizes",
      "must contain at least one size"
    );
  }

  for (const [size, price] of sizeEntries) {
    if (!/^\d+ml$/.test(size)) {
      pushError(
        errors,
        product,
        `sizes.${size}`,
        "must use the <number>ml key format"
      );
    }

    if (!isPositiveFiniteNumber(price)) {
      pushError(
        errors,
        product,
        `sizes.${size}`,
        "must have a positive finite price"
      );
    }
  }

  if (
    !Array.isArray(product?.moods) ||
    product.moods.length === 0 ||
    product.moods.some(
      (mood) => !isNonEmptyString(mood)
    )
  ) {
    pushError(
      errors,
      product,
      "moods",
      "must be a non-empty string array"
    );
  }

  if (
    !Array.isArray(
      product?.recommendations
    ) ||
    product.recommendations.length === 0 ||
    product.recommendations.some(
      (slug) => !isNonEmptyString(slug)
    )
  ) {
    pushError(
      errors,
      product,
      "recommendations",
      "must be a non-empty slug array"
    );
  } else if (knownSlugs) {
    for (const slug of product.recommendations) {
      if (!knownSlugs.has(slug)) {
        pushError(
          errors,
          product,
          "recommendations",
          `references unknown slug "${slug}"`
        );
      }
    }
  }

  for (const tier of [
    "top",
    "heart",
    "base",
  ]) {
    const notes =
      product?.noteMap?.[tier];

    if (
      !Array.isArray(notes) ||
      notes.length === 0 ||
      notes.some(
        (note) => !isNonEmptyString(note)
      )
    ) {
      pushError(
        errors,
        product,
        `noteMap.${tier}`,
        "must be a non-empty string array"
      );
    }
  }

  if (product?.addedAt != null) {
    const parsed = Date.parse(
      product.addedAt
    );

    if (!Number.isFinite(parsed)) {
      pushError(
        errors,
        product,
        "addedAt",
        "must be a valid date when present"
      );
    }
  }

  return errors;
};

export const validateProductCopy = (
  product,
  copy
) => {
  const errors = [];

  if (!copy) {
    pushError(
      errors,
      product,
      "productCopy",
      "is missing"
    );
    return errors;
  }

  for (const field of PRODUCT_COPY_FIELDS) {
    validateLocalizedText({
      errors,
      product,
      value: copy[field],
      field,
      expectArray:
        field === "dominantNotes" ||
        field === "tags",
    });
  }

  return errors;
};

export const validateLocalizedProductContext = (
  product,
  context,
  field
) => {
  const errors = [];

  if (!context) {
    pushError(
      errors,
      product,
      field,
      "is missing"
    );
    return errors;
  }

  validateLocalizedText({
    errors,
    product,
    value: context,
    field,
  });

  return errors;
};

export const validateProductWearContext = (
  product,
  wearContext
) =>
  validateLocalizedProductContext(
    product,
    wearContext,
    "productWearContext"
  );

export const validateProductCatalog = ({
  products = [],
  productCopyBySlug = {},
  productWearContextBySlug = {},
  productDoNotWearContextBySlug = {},
  productWhatToWearContextBySlug = {},
}) => {
  const errors = [];
  const ids = new Set();
  const slugs = new Set();
  const names = new Set();

  for (const product of products) {
    if (ids.has(product.id)) {
      pushError(
        errors,
        product,
        "id",
        "must be unique"
      );
    }
    ids.add(product.id);

    if (slugs.has(product.slug)) {
      pushError(
        errors,
        product,
        "slug",
        "must be unique"
      );
    }
    slugs.add(product.slug);

    if (names.has(product.name)) {
      pushError(
        errors,
        product,
        "name",
        "must be unique for source adapter integrity"
      );
    }
    names.add(product.name);
  }

  for (const product of products) {
    errors.push(
      ...validateProduct(product, {
        knownSlugs: slugs,
      }),
      ...validateProductCopy(
        product,
        productCopyBySlug[product.slug]
      ),
      ...validateProductWearContext(
        product,
        productWearContextBySlug[
          product.slug
        ]
      ),
      ...validateLocalizedProductContext(
        product,
        productDoNotWearContextBySlug[
          product.slug
        ],
        "productDoNotWearContext"
      ),
      ...validateLocalizedProductContext(
        product,
        productWhatToWearContextBySlug[
          product.slug
        ],
        "productWhatToWearContext"
      )
    );
  }

  return errors;
};

export const assertProductCatalogContract = (
  input
) => {
  const errors =
    validateProductCatalog(input);

  if (errors.length > 0) {
    throw new Error(
      [
        "Product Data Contract v2 failed:",
        ...errors.map(
          (error) => `- ${error}`
        ),
      ].join("\n")
    );
  }

  return true;
};
