"""Add the Italian accented capitals (and a plain apostrophe) to the Eveleth Clean subset taken from the
manual, which only ships A-Z, digits and a few marks. Accents are drawn as slanted bars above the caps.
Usage: python3 scripts/extend-eveleth.py  ->  players/assets/eveleth-clean-it.woff2"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.t2CharStringPen import T2CharStringPen
from fontTools.pens.boundsPen import BoundsPen
root=Path(__file__).resolve().parents[1]/'players/assets'
t=TTFont(root/'eveleth-clean.woff2');gs=t.getGlyphSet();cm=t.getBestCmap()
top=t['CFF '].cff.topDictIndex[0];cs=top.CharStrings
order=t.getGlyphOrder()[:]
ACCENTS={'grave':[(-60,860),(110,860),(10,1060),(-160,1060)],'acute':[(-110,860),(60,860),(160,1060),(-10,1060)]}
# (codepoints, base letter, accent): lowercase maps to the same glyph because the face is all capitals
LETTERS=[((0xC0,0xE0),'A','grave'),((0xC1,0xE1),'A','acute'),((0xC8,0xE8),'E','grave'),((0xC9,0xE9),'E','acute'),((0xCC,0xEC),'I','grave'),((0xCD,0xED),'I','acute'),
         ((0xD2,0xF2),'O','grave'),((0xD3,0xF3),'O','acute'),((0xD9,0xF9),'U','grave'),((0xDA,0xFA),'U','acute')]
for cps,base,acc in LETTERS:
    bg=cm[ord(base)];width=t['hmtx'][bg][0];bp=BoundsPen(gs);gs[bg].draw(bp);cx=(bp.bounds[0]+bp.bounds[2])/2
    name=f'{base}{acc}'
    pen=T2CharStringPen(width,gs);gs[bg].draw(pen)
    pts=[(x+cx,y) for x,y in ACCENTS[acc]];pen.moveTo(pts[0]);[pen.lineTo(p) for p in pts[1:]];pen.closePath()
    ch=pen.getCharString(private=getattr(top,'Private',None),globalSubrs=t['CFF '].cff.GlobalSubrs)
    cs.charStringsIndex.append(ch);cs.charStrings[name]=len(cs.charStringsIndex)-1
    order.append(name);t['hmtx'][name]=(width,t['hmtx'][bg][1])
    for cp in cps:
        for sub in t['cmap'].tables:
            if sub.isUnicode():sub.cmap[cp]=name
t.setGlyphOrder(order);top.charset=order
for sub in t['cmap'].tables:
    if sub.isUnicode():sub.cmap[0x27]=cm[0x2019]
t['maxp'].numGlyphs=len(order)
t.flavor='woff2';t.save(root/'eveleth-clean-it.woff2');print('glyphs',len(order))
