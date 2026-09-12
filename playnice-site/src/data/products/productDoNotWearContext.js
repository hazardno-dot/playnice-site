import { productWearContext } from "./productWearContext";
import part1 from "./productDoNotWearContext.part1";
import part2 from "./productDoNotWearContext.part2";
import part3 from "./productDoNotWearContext.part3";
import part4 from "./productDoNotWearContext.part4";

const copy = [...part1, ...part2, ...part3, ...part4];
const productNames = Object.keys(productWearContext);

export const productDoNotWearContext = productNames.reduce((result, productName, index) => {
  const entry = copy[index];
  if (entry) result[productName] = entry;
  return result;
}, {});

export const productDoNotWearCoverage = {
  products: productNames.length,
  copy: copy.length,
  mapped: Object.keys(productDoNotWearContext).length,
};
