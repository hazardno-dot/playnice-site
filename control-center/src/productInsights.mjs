// Descriptive signals only; item events are not unique visitors or conversion rates.
export function deriveProductInsights(items = []) {
  const eligible = items.filter(x => Number.isFinite(x.views) && x.views >= 20);
  const by = (filter, comparator) => eligible.filter(filter).sort(comparator).slice(0,5);
  return {
    attention: by(x => x.views >= 40 && x.purchased === 0, (a,b) => b.views-a.views),
    cartInterest: by(x => x.adds >= 5, (a,b) => b.adds-a.adds),
    views: items.slice().sort((a,b) => b.views-a.views).slice(0,5)
  };
}
