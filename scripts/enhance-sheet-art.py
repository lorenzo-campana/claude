"""Add depth and outlines to the flat vector shapes taken from the manual's character sheet.
Reads players/assets/flat/*.svg (the extracted originals) and writes the contrasted versions to players/assets/*.svg.
Dark shapes are deepened and outlined; pale fills get a soft gradient and a dark outline; the viewBox grows by the outline."""
import re
from pathlib import Path
root=Path(__file__).resolve().parents[1]/'players/assets'
PAD=1.2;SW=0.9
def rgb(h):
    h=h.lstrip('#');h=h*2 if len(h)==3 and False else h
    if len(h)==3:h=''.join(c*2 for c in h)
    return tuple(int(h[i:i+2],16) for i in (0,2,4))
def hexs(c):return '#%02x%02x%02x'%tuple(max(0,min(255,round(v))) for v in c)
def mix(a,b,t):return tuple(x*(1-t)+y*t for x,y in zip(a,b))
def lum(c):return (0.299*c[0]+0.587*c[1]+0.114*c[2])/255
for src in sorted((root/'flat').glob('*.svg')):
    s=src.read_text();grads={}
    darks=[rgb(h) for h in re.findall(r'fill="(#[0-9a-fA-F]{6})"',s) if lum(rgb(h))<=0.8];accent=darks[0] if darks else (90,70,120)
    def path(m):
        tag=m.group(0);f=re.search(r'fill="(#[0-9a-fA-F]{3,6})"',tag)
        if not f:return tag
        c=rgb(f.group(1))
        if lum(c)>0.8:   # pale fill: soft vertical gradient, outlined in a deep tint of the same hue
            gid='g'+hexs(c)[1:];grads[gid]=(hexs(mix(c,(255,255,255),.6)),hexs(mix(c,accent,.32)))
            fill=f'url(#{gid})';stroke=hexs(mix(c,(0,0,0),.72))
        else:            # dark shape: deepen and outline
            d=mix(c,(0,0,0),.16);fill=hexs(d);stroke=hexs(mix(c,(0,0,0),.62))
        tag=tag.replace(f.group(0),f'fill="{fill}"')
        return tag.replace('<path ',f'<path stroke="{stroke}" stroke-width="{SW}" stroke-linejoin="round" ',1)
    s=re.sub(r'<path [^>]*>',path,s)
    defs=''.join(f'<linearGradient id="{g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>' for g,(a,b) in grads.items())
    def head(m):
        tag=m.group(0);vb=re.search(r'viewBox="([\d.\-]+) ([\d.\-]+) ([\d.\-]+) ([\d.\-]+)"',tag)
        x,y,w,h=map(float,vb.groups());tag=tag.replace(vb.group(0),f'viewBox="{x-PAD:g} {y-PAD:g} {w+2*PAD:g} {h+2*PAD:g}"')
        for k,v in (('width',w),('height',h)):
            tag=re.sub(rf'{k}="[\d.]+"',f'{k}="{v+2*PAD:g}"',tag)
        return tag+(f'<defs>{defs}</defs>' if defs else '')
    s=re.sub(r'<svg [^>]*>',head,s,count=1)
    (root/src.name).write_text(s);print(src.name,len(grads),'gradients')
