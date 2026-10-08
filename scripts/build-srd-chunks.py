"""Split the Daggerheart SRD (markdown) into small, citable chunks for the rules bot.

Usage: python3 scripts/build-srd-chunks.py /path/to/daggerheart-srd/README.md
Writes rules/srd-chunks.json. Source: Daggerheart SRD 1.0 (c) Critical Role LLC,
Public Game Content under the Darrington Press Community Gaming License.
"""
import json,re,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
src=Path(sys.argv[1]).read_text().split('\n')
# bulky equipment/loot/adversary lists live elsewhere in the app: skip them here
SKIP_H={'PRIMARY WEAPON TABLES','SECONDARY WEAPON TABLES','ARMOR TABLES','LOOT','CONSUMABLES','ADVERSARIES BY TIER','COMBAT WHEELCHAIR','THE WITHERWILD','ENVIRONMENT STAT BLOCKS BY TIER'}
START,END_MAIN=71,None
def slug(t,seen):
    s=re.sub(r'[^\w\- ]','',t.lower()).replace(' ','-')
    n=seen.get(s,0);seen[s]=n+1
    return s if n==0 else f'{s}-{n}'
seen={};heads=[]  # (line_index, level, text, slug)
for i,l in enumerate(src):
    m=re.match(r'^(#{1,6}) (.+?)\s*$',l)
    if m: heads.append((i,len(m.group(1)),m.group(2).strip(),slug(m.group(2).strip(),seen)))
def clean(block):
    out=[]
    for l in block:
        t=l.strip()
        if not t or re.match(r'^\|?[\s\-:|]+\|?$',t): continue
        if t.startswith('|'): t=' | '.join(c.strip() for c in t.strip('|').split('|'))
        t=re.sub(r'^>\s?','',t).strip()
        t=re.sub(r'^[-*] ','• ',t)
        t=re.sub(r'(\*\*|__|\*|(?<!\w)_|_(?!\w))','',t).replace('­','')
        t=re.sub(r'\[([^\]]+)\]\([^)]*\)',r'\1',t)
        if t: out.append(t)
    return out
stack=[];chunks=[];skip_level=None
for k,(i,lv,tx,sl) in enumerate(heads):
    if i<START: continue
    while stack and stack[-1][0]>=lv: stack.pop()
    stack.append((lv,tx,sl))
    if skip_level is not None and lv<=skip_level: skip_level=None
    if skip_level is not None: continue
    if tx.upper() in SKIP_H: skip_level=lv;continue
    if any(t.upper().startswith('APPENDIX') for _,t,_ in stack[:1]): break
    nxt=heads[k+1][0] if k+1<len(heads) else len(src)
    body=clean(src[i+1:nxt])
    if not body: continue
    ACR={'Gm':'GM','Npcs':'NPCs','Pcs':'PCs','Npc':'NPC','Pc':'PC'}
    path=[re.sub(r'\b(Gm|Npcs|Pcs|Npc|Pc)\b',lambda m:ACR[m.group(1)],t.title()) if t.isupper() else t for _,t,_ in stack]
    text='\n'.join(body)
    parts=[];cur=''
    for ln in body:
        if cur and len(cur)+len(ln)>1500: parts.append(cur);cur=''
        cur+=('\n' if cur else '')+ln
    if cur: parts.append(cur)
    for n,p in enumerate(parts):
        chunks.append({'h':' › '.join(path),'a':sl,'t':p,**({'p':f'{n+1}/{len(parts)}'} if len(parts)>1 else {})})
(root/'rules/srd-chunks.json').write_text(json.dumps(chunks,ensure_ascii=False,separators=(',',':')))
print(len(chunks),'chunks',sum(len(c['t']) for c in chunks),'chars')
