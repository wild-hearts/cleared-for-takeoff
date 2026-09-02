# "Help Is On The Way" artwork

Three concepts, each in two ink versions. Open `PREVIEW-concepts.png` to compare them on
four garment colours.

| File | Use on |
|---|---|
| `a-field-stencil--light.png` | dark garments (Military Green, Black, Navy) |
| `a-field-stencil--dark.png` | light grounds (natural tote, white mug, Sky Blue, White) |
| `b-transmission--light/dark.png` | as above |
| `c-cross--light/dark.png` | as above |

All are transparent PNG, single ink, and comfortably over 300dpi across a 12 inch print
(A and C are ~500dpi, B ~340dpi).

## One ink per file, and why the garment list has to match it

There is no single file that works on both Military Green and Sky Blue. Cream on Sky Blue
is unreadable; navy on Military Green is mud. The original merch document paired those two
colours on one product, which cannot be produced from one upload.

So `lib/products.js` now sells the tee on **dark garments only**, with the cream file, and
points the tote and mug at the navy file because canvas and ceramic are light grounds. To
sell a light-coloured tee, add it as a **second product** using the `--dark` artwork, rather
than adding a colour to the existing one.

## Swapping concepts

Change the `artwork` filename in `lib/products.js` and re-run
`node scripts/printify-setup.mjs build --shop <id> --confirm`.

## How these were made

`scripts/make-artwork.py`, from Oswald and Barlow Condensed (both SIL Open Font License, so
free to use commercially, including on merchandise). Single flat colour on transparency,
which is the cheapest and most reliable thing to print and holds up at any size. Re-run the
script to change wording, spacing or colour; do not hand-edit the PNGs, they regenerate.

Not a substitute for a designer. If Medaria wants an illustrated mark rather than set type,
this is not that.
