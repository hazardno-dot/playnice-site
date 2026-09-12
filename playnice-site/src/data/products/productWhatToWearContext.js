import { productWearContext } from "./productWearContext";
import part1 from "./productWhatToWearContext.part1";
import part2 from "./productWhatToWearContext.part2";
import part3 from "./productWhatToWearContext.part3";
import part4 from "./productWhatToWearContext.part4";

const copy = [...part1, ...part2, ...part3, ...part4];
const productNames = Object.keys(productWearContext);

export const productWhatToWearContext = productNames.reduce((result, productName, index) => {
  const entry = copy[index];
  if (entry) result[productName] = entry;
  return result;
}, {});

export const productWhatToWearCoverage = {
  products: productNames.length,
  copy: copy.length,
  mapped: Object.keys(productWhatToWearContext).length,
};
