# make-artwork.py. Regenerates the "Help Is On The Way" print files into art/.
# Needs Pillow and the two fonts (Oswald, Barlow Condensed) in /tmp/fonts.
#   pip install pillow
#   python3 scripts/make-artwork.py && python3 scripts/make-artwork-preview.py

from PIL import Image, ImageDraw, ImageFont

FONTS, OUT = '/tmp/fonts/', '/home/user/cleared-for-takeoff/medaria-shop/art/'
CREAM, NAVY = (244, 239, 230, 255), (18, 28, 46, 255)
W, H = 9000, 11000

def oswald(size, weight='Bold'):
    f = ImageFont.truetype(FONTS + 'Oswald-var.ttf', size)
    try: f.set_variation_by_name(weight)
    except Exception: pass
    return f
def barlow(size, bold=True):
    return ImageFont.truetype(FONTS + ('BarlowCondensed-Bold.ttf' if bold else 'BarlowCondensed-Medium.ttf'), size)

class Stack:
    """Lays elements out top-down using MEASURED ink extents, not guessed line steps.
    The first version advanced y by fixed amounts smaller than the rendered glyphs, so
    footer rules were drawn straight through the headline."""
    def __init__(self, draw, cx, y):
        self.d, self.cx, self.y = draw, cx, y

    def text(self, s, font, fill, track=0, gap_after=0):
        widths = [self.d.textlength(c, font=font) for c in s]
        total = sum(widths) + track * (len(s) - 1)
        x = self.cx - total / 2
        # Measure the real ink box so the cursor lands below the glyphs, descenders included.
        box = self.d.textbbox((x, self.y), s, font=font)
        for c, w in zip(s, widths):
            self.d.text((x, self.y), c, font=font, fill=fill)
            x += w + track
        self.y = box[3] + gap_after
        return total

    def rule(self, width, thick, fill, gap_after=0):
        self.d.rectangle([self.cx - width // 2, self.y, self.cx + width // 2, self.y + thick], fill=fill)
        self.y += thick + gap_after

    def marks(self, pattern, thick, gap, fill, gap_after=0):
        total = sum(pattern) + gap * (len(pattern) - 1)
        x = self.cx - total // 2
        for wdt in pattern:
            self.d.rectangle([x, self.y, x + wdt, self.y + thick], fill=fill)
            x += wdt + gap
        self.y += thick + gap_after

    def cross(self, arm, thick, fill, gap_after=0):
        cx, top = self.cx, self.y
        self.d.rectangle([cx - thick // 2, top, cx + thick // 2, top + arm], fill=fill)
        self.d.rectangle([cx - arm // 2, top + arm // 2 - thick // 2,
                          cx + arm // 2, top + arm // 2 + thick // 2], fill=fill)
        self.y = top + arm + gap_after

def trim(img, pad=180):
    b = img.getbbox()
    if not b: return img
    l, t, r, bo = b
    return img.crop((max(0, l - pad), max(0, t - pad), min(img.width, r + pad), min(img.height, bo + pad)))

def concept_a(ink):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    s = Stack(d, W // 2, 1200)
    w = s.text('MEDARIA AID', barlow(230), ink, track=110, gap_after=150)
    d.rectangle([s.cx - w // 2 - 420, s.y - 300, s.cx - w // 2 - 120, s.y - 280], fill=ink)
    d.rectangle([s.cx + w // 2 + 120, s.y - 300, s.cx + w // 2 + 420, s.y - 280], fill=ink)
    s.text('HELP IS', oswald(1400), ink, track=14, gap_after=60)
    head_w = s.text('ON THE WAY', oswald(1400), ink, track=14, gap_after=240)
    # Keyed to the headline. A rule narrower than the type it sits under reads as a
    # botched underline rather than a divider.
    s.rule(int(head_w), 18, ink, gap_after=200)
    s.text('UKRAINE  ·  FRONTLINE MEDEVAC', barlow(200, bold=False), ink, track=70)
    return trim(img)

def concept_b(ink):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    s = Stack(d, W // 2, 1200)
    s.marks([460, 200, 200, 620, 200, 460, 200], 46, 110, ink, gap_after=420)
    for line in ('HELP IS', 'ON THE', 'WAY'):
        s.text(line, oswald(1180), ink, track=18, gap_after=40)
    s.y += 220
    s.text('MEDARIA AID', barlow(250), ink, track=120)
    return trim(img)

def concept_c(ink):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(img)
    s = Stack(d, W // 2, 1200)
    s.cross(1700, 560, ink, gap_after=560)
    s.text('HELP IS', barlow(1150), ink, track=26, gap_after=30)
    s.text('ON THE WAY', barlow(1150), ink, track=26, gap_after=330)
    s.rule(560, 16, ink, gap_after=250)
    s.text('MEDARIA AID  ·  UKRAINE', barlow(210, bold=False), ink, track=80)
    return trim(img)

for name, fn in (('a-field-stencil', concept_a), ('b-transmission', concept_b), ('c-cross', concept_c)):
    for ink_name, ink in (('light', CREAM), ('dark', NAVY)):
        img = fn(ink)
        sc = 6000 / max(img.size)
        if sc < 1:
            img = img.resize((round(img.width * sc), round(img.height * sc)), Image.LANCZOS)
        img.save(f'{OUT}{name}--{ink_name}.png', 'PNG')
    print(f'{name:18s} {img.size[0]}x{img.size[1]}   {img.size[0]/12:.0f} dpi across a 12in print')
