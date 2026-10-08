# Rules view

Cheat sheet for the GM, the "Chiedi al manuale" bot and the full rules reference, embedded in `sablewood-tracker.html`.

- `rules.js` / `rules.css`: UI, on-device search (BM25 + Italian→English glossary) and prompt for the bot.
- `srd-chunks.json`: the Daggerheart SRD 1.0 split into ~220 citable passages (section path + GitHub anchor).
- `SRD-LICENSE.txt`: license notice of the source markdown (Daggerheart SRD © Critical Role LLC, Public Game Content under the Darrington Press Community Gaming License).

The bot searches locally, sends only the 4 best passages to Claude with `modelTier: "quick"` (fastest/cheapest tier) and shows the exact passages it used, with the section path and a link to the SRD.

Rebuild after editing:

```sh
git clone --depth 1 https://github.com/seansbox/daggerheart-srd /tmp/srd   # only to regenerate the chunks
python3 scripts/build-srd-chunks.py /tmp/srd/README.md
python3 scripts/build-rules.py
node tests/rules-search.test.cjs
```
