# Content workflow

Directory content lives in `src/data/directory.ts`.

## Add or edit a place

1. Update the matching `directorySpots` entry or append a new one.
2. Use an existing category id from `categories`.
3. Run `npm run images:listings` if a new listing image is needed.
4. Run `npm run test` before building.

## Required listing fields

- `n` and `n_en`: Hindi and English names.
- `i` and `i_en`: short highlights.
- `a` and `a_en`: area or route.
- `s` and `s_en`: known shops, institutions, or references.
- `q`: Google Maps search query.
- `cats`: one or more category ids.
- `en`: extra English search keywords.

## Validation

- `npm run data:validate` checks ids, categories, slugs, required fields, and listing images.
- `npm run search:test` checks core search and category behavior.
- `npm run test` runs both.

## URL filters

The directory supports shareable filtered URLs:

- `/?q=kachori#explore`
- `/?tag=streetfood#explore`
- `/?q=gurudwara&tag=temple&lang=hi&view=map#explore`
