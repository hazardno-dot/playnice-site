# FI Ultra Knowledge Data Contract

This contract protects the curated fragrance knowledge graph as it grows.

It verifies:

- unique IDs inside each knowledge collection
- source-backed perfumers, houses and terminology
- valid perfume -> house relationships
- valid perfume -> perfumer relationships
- valid house -> perfumer relationships
- no normalized alias collisions within perfumes or terminology
- unique PlayNice catalog slug mappings

The contract intentionally does not validate editorial truth from the internet at test time.
Source verification remains a curation responsibility; automated tests protect structural integrity
and prevent silent graph corruption.
