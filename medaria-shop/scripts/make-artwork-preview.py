# make-artwork-preview.py. Contact sheet of every concept on four garment colours.

from PIL import Image, ImageDraw, ImageFont
ART = '/home/user/cleared-for-takeoff/medaria-shop/art/'
F = '/tmp/fonts/'

CONCEPTS = [('a-field-stencil', 'A. Field Stencil'),
            ('b-transmission', 'B. Transmission'),
            ('c-cross',        'C. The Cross')]
# Gildan 64000 approximations. Sky Blue is the problem child: it is light, so the
# cream ink that carries the dark garments disappears on it.
GARMENTS = [('Military Green', (92, 95, 75),   'light'),
            ('Black',          (26, 26, 26),   'light'),
            ('Sky Blue',       (143, 193, 222),'dark'),
            ('White',          (245, 245, 245),'dark')]

CELL_W, CELL_H = 620, 720
PAD, LABEL_H, HEAD_H = 26, 52, 96
COLS, ROWS = len(GARMENTS), len(CONCEPTS)

sheet_w = PAD + COLS * (CELL_W + PAD)
sheet_h = HEAD_H + ROWS * (CELL_H + LABEL_H + PAD) + PAD
sheet = Image.new('RGB', (sheet_w, sheet_h), (18, 20, 26))
d = ImageDraw.Draw(sheet)

f_head = ImageFont.truetype(F + 'BarlowCondensed-Bold.ttf', 46)
f_lab  = ImageFont.truetype(F + 'BarlowCondensed-Bold.ttf', 30)
f_sm   = ImageFont.truetype(F + 'BarlowCondensed-Medium.ttf', 26)

d.text((PAD, 30), 'MEDARIA AID  ·  "HELP IS ON THE WAY"  ·  three concepts, one ink, on four garment colours',
       font=f_head, fill=(244, 239, 230))

y = HEAD_H
for slug, title in CONCEPTS:
    x = PAD
    for gname, gcol, ink in GARMENTS:
        d.rectangle([x, y, x + CELL_W, y + CELL_H], fill=gcol)
        art = Image.open(f'{ART}{slug}--{ink}.png').convert('RGBA')
        # Place it where a chest print sits: centred, upper third, ~62% of chest width.
        target_w = int(CELL_W * 0.62)
        scale = target_w / art.width
        art = art.resize((target_w, max(1, round(art.height * scale))), Image.LANCZOS)
        if art.height > CELL_H * 0.55:
            s2 = (CELL_H * 0.55) / art.height
            art = art.resize((round(art.width * s2), round(art.height * s2)), Image.LANCZOS)
        sheet.paste(art, (x + (CELL_W - art.width) // 2, y + int(CELL_H * 0.17)), art)
        note = f'{gname}  ·  {"cream ink" if ink == "light" else "navy ink"}'
        d.text((x + 6, y + CELL_H + 10), note, font=f_lab, fill=(210, 214, 222))
        x += CELL_W + PAD
    d.text((PAD, y + CELL_H + 10 + 34), title, font=f_sm, fill=(150, 156, 168))
    y += CELL_H + LABEL_H + PAD

sheet.save('/home/user/cleared-for-takeoff/medaria-shop/art/PREVIEW-concepts.png', 'PNG')
print('preview', sheet.size)
