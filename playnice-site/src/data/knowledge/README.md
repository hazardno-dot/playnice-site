# PlayNice FI Knowledge

This folder is the curated factual layer for Fragrance Intelligence.

## Rules

1. Source-backed facts only. Prefer official brand, employer, perfumer-house or manufacturer sources.
2. Do not resolve an uncertain name by guessing. Unknown people stay unknown until verified.
3. Keep aliases separate from canonical identity. Aliases may include common misspellings.
4. Product recommendation scoring remains in the existing deterministic Discovery Engine.
5. Knowledge data must not be imported into the global app bundle until the FI knowledge UI is intentionally integrated; use lazy loading when that happens.
6. Store source URLs with each entity so entries can be audited later.
7. Batch knowledge additions and tests into logical passes to avoid deployment churn.

## v1 scope

The first slice establishes:
- perfumer entities;
- typo-tolerant identity lookup;
- a knowledge query classifier;
- deterministic source-backed answers;
- a guard against hallucinating unknown identities.

No production FI behavior is changed by this foundation commit.
