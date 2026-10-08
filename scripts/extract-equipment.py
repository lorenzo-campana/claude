"""Import the standard equipment and loot tables from both supplied manuals."""
import argparse,re,json,unicodedata
from pathlib import Path
import pdfplumber
parser=argparse.ArgumentParser();parser.add_argument('--core',required=True);parser.add_argument('--hope-fear',required=True);args=parser.parse_args()
root=Path(__file__).resolve().parents[1];rules=json.loads((root/'players/rules.json').read_text());old=json.loads(__import__('subprocess').check_output(['git','show','HEAD:players/rules.json'],cwd=root))['equipment'];items=[]
def clean(v):return re.sub(r'\s+',' ',v or '').strip()
def slug(v):return re.sub('[^a-z0-9]+','-',unicodedata.normalize('NFKD',v).encode('ascii','ignore').decode().lower()).strip('-')
for filename,book,pages in [(args.core,'core',list(range(116,123))+[124,125,126,127,128,130,131,132,133,134,276,277]),(args.hope_fear,'hf',list(range(44,61)))]:
 pdf=pdfplumber.open(filename)
 for number in pages:
  p=pdf.pages[number-1];words=p.extract_words();headers=[w for w in words if w['text'] in ['Name','Armor','Loot','LOOT']];sets=[]
  for w in headers:
   cells=[r for r in p.rects if r['top']<=w['top']+1 and r['bottom']>=w['bottom']-1 and 8<r['height']<42 and r['x0']<=w['x0'] and r['x1']>=w['x1']]
   if not cells:continue
   cell=min(cells,key=lambda r:r['width']);row=[r for r in p.rects if abs(r['top']-cell['top'])<.2 and abs(r['bottom']-cell['bottom'])<.2 and r['width']>10]
   # Left and right loot tables can share a header baseline: split at the gutter.
   row=[r for r in row if (w['text'] in ['Name','Armor'] or abs(r['x0']-cell['x0'])<300) and not (len(row)>=6 and ((cell['x0']<306)!=(r['x0']<306)) and w['text'] not in ['Name','Armor'])]
   xs=[]
   for x in sorted(r[v] for r in row for v in ['x0','x1']):
    if not xs or x-xs[-1]>.3:xs.append(x)
   if len(xs) in [4,5,7] and xs not in sets:sets.append(xs)
  tierheads=[]
  for w in words:
   if w['text'].upper()=='TIER':
    nums=[z for z in words if z['text'] in ['1','2','3','4'] and abs(z['top']-w['top'])<3 and 0<z['x0']-w['x1']<20]
    if nums:tierheads.append((w['top'],int(nums[0]['text'])))
  for xs in sets:
   crop=p.filter(lambda o:o.get('object_type')!='char' or ('Eveleth' not in o.get('fontname','') and o.get('top',0)<750)).crop((max(0,xs[0]-.2),0,min(p.width,xs[-1]+.2),p.height))
   last=max((c['bottom'] for c in crop.chars),default=p.height-25)+3
   lines=crop.horizontal_edges+[{'x0':xs[0],'x1':xs[-1],'top':last,'bottom':last,'width':xs[-1]-xs[0],'height':0,'orientation':'h','object_type':'line'}]
   tables=crop.find_tables({'vertical_strategy':'explicit','explicit_vertical_lines':xs,'horizontal_strategy':'explicit','explicit_horizontal_lines':lines,'intersection_tolerance':4})
   for table in tables:
    for row,geom in zip(table.extract(),table.rows):
     row=list(map(clean,row));top=geom.bbox[1];tier=max((t for y,t in tierheads if y<top),default=({46:2,48:3,50:4}.get(number,1) if book=='hf' else 1))
     entry=None
     sections=[(w['top'],w['text'].lower()) for w in words if w['text'] in ['Primary','Secondary'] and w['top']<top]
     section=max(sections,default=(0,'primary'))[1]
     if len(row)==6 and row[1] in ['Agility','Strength','Finesse','Instinct','Presence','Knowledge'] and 'Handed' in row[4]:
      name,trait,rng,damage,burden,feature=row;name=re.sub(r' [A-Z][A-Z ’&-]{3,}$','',name);kind='secondary' if (book=='core' and number in [125,126] or book=='hf' and number in [51,52]) else 'secondary' if section=='secondary' else 'primary'
      name=name.removesuffix(' Armor') if name.startswith('Flare Launcher') else name
      entry=dict(name=name,kind=kind,trait=trait,range=rng,damage=damage,hands=2 if 'Two' in burden else 1,feature=feature,magic='mag' in damage,tier=tier)
     elif len(row)==4 and re.fullmatch(r'\d+\s*/\s*\d+',row[1]) and row[2].isdigit():
      major,severe=map(int,row[1].split('/'));feature=row[3];entry=dict(name=re.sub(r' [A-Z][A-Z ’&-]{3,}$','',row[0]),kind='armor',major=major,severe=severe,score=int(row[2]),feature=feature,tier=tier,magic=False,evasion=0,agility=0)
      ev=re.search(r'([+−-]\d+) (?:to )?Evasion',feature);ag=re.search(r'([+−-]\d+) to Agility',feature)
      if ev:entry['evasion']=int(ev[1].replace('−','-'))
      if ag:entry['agility']=int(ag[1].replace('−','-'))
      if feature.startswith('Difficult:'):entry['evasion']=-1
     elif len(row)==3 and row[0].isdigit() and 1<=int(row[0])<=60:
      roll=int(row[0]);kind='consumable' if book=='core' and number>=133 or book=='hf' and number>=58 else 'item';entry=dict(name=row[1],kind=kind,feature=row[2],magic=bool(re.search('magic|magical|Spellcast',row[2],re.I)),tier=None,roll=roll,rarity='Common' if roll<=12 else 'Uncommon' if roll<=24 else 'Rare' if roll<=48 else 'Legendary')
     if not entry or not entry['name'] or entry['name'].startswith('Chapter'):continue
     match=next((x for x in old if x['name']==entry['name'] and x['kind']==entry['kind']),None)
     entry['id']=match['id'] if match and book=='core' else ('hf-' if book=='hf' else '')+entry['kind']+'-'+slug(entry['name']);entry['feature']=re.sub(r' [A-Z][A-Z ’&-]{3,}$','',entry['feature'])
     if number in [276,277,318,153,154]:
      entry['campaign']='Beast Feast' if number in [276,277] else 'Colossus of the Drylands' if number==318 else 'Dark Heart of Andaluria';entry['id']='campaign-'+slug(entry['campaign'])+'-'+entry['kind']+'-'+slug(entry['name'])
     entry['book']=book;entry['page']=number-1;entry['pdfPage']=number
     if not any(x['id']==entry['id'] for x in items):items.append(entry)

# Final unshaded rows have no closing rule in the PDFs; include their verified text explicitly.
extras=[('core',13,'Potion of Stability','You can drink this potion to choose one additional downtime move.',133),('core',60,'Stardrop','You can use this stardrop to summon a hailstorm of comets that deals 8d20 physical damage to all targets within Very Far range.',134),('hf',19,'Snapthorn Seed','You can throw this seed at a point you can see. It explodes into a tangle of binding vines that temporarily Restrains all creatures within Close range of that point.',58),('hf',60,'Featherstep Potion','You can drink this potion to sprout small wings from your ankles that give you a bonus to your Evasion equal to your tier until your next rest.',60)]
for book,roll,name,feature,page in extras:
 items=[x for x in items if not(x.get('roll')==roll and x['book']==book and x['kind']=='consumable')]
 items.append(dict(id=('hf-' if book=='hf' else '')+'consumable-'+slug(name),name=name,kind='consumable',feature=feature,tier=None,roll=roll,rarity='Common' if roll<=12 else 'Uncommon' if roll<=24 else 'Rare' if roll<=48 else 'Legendary',book=book,page=page-1,pdfPage=page,magic=bool(re.search('magic',feature,re.I))))
for entry in old:
 if entry.get('brawler'):continue
 if not any(x['kind']==entry['kind'] and slug(x['name'])==slug(entry['name']) for x in items):items.append(dict(entry,book='core',page={'Longbow':115,"Keeper's Staff":117,'Spiked Bow':118,'Ilmari’s Rifle':119}.get(entry['name'],115),pdfPage={'Longbow':116,"Keeper's Staff":118,'Spiked Bow':119,'Ilmari’s Rifle':120}.get(entry['name'],116)))

# Campaign equipment lists all four tiers inside a single PDF cell.
# Expand those printed variants into separate selectable cards.
campaigns=[
 ('core','Colossus of the Drylands',318,[
 ('Revolver','primary','Finesse','Far','d6',1,1,'Six Shot: Place 6 Ammo tokens on your character sheet. Spend 1 Ammo token to make an attack. You can mark a Stress to regain spent Ammo tokens.'),
 ('Rifle','primary','Agility','Very Far','d8',2,2,'Sightline: Spend 2 Hope to gain advantage on an attack roll.'),
 ('Shotgun','primary','Strength','Very Close','d6',2,2,'Scattershot: When you make an attack, target all creatures in front of you within range.'),
 ('Lasso','secondary','Agility','Very Close','d4',0,1,'Roped: On a successful attack, you can temporarily Rope the target instead of dealing damage. While Roped, the target is Restrained and Vulnerable, but you must remain within Very Close range of the target. When the target clears this condition, you can make a Strength Reaction Roll. On a success, they remain Roped.'),
 ('Small Revolver','secondary','Finesse','Far','d6',0,1,'Quick Shot: Spend 2 Hope to gain a +4 bonus to primary weapon damage.')]),
 ('hf','Dark Heart of Andaluria',153,[
 ('Blessed Brass Knuckles','primary','Strength','Melee','d8',1,1,'—'),
 ('Holy Shotgun','primary','Agility','Very Close','d6',2,2,'Scattershot: When you make an attack, target all creatures in front of you within range.'),
 ('Repeating Crossbow','primary','Finesse','Far','d6',2,2,'Quick: When you make an attack, you can mark a Stress to target another creature within range.'),
 ('Wooden Stake','secondary','Strength','Melee','d8',0,1,'Paired: Gain a bonus equal to 1 + your tier to primary weapon damage to targets within Melee range.'),
 ('Hallowed Shield','secondary','Instinct','Melee','d4',0,1,'Resonant: When you critically succeed on a primary weapon attack, you gain an additional Hope.'),
 ('Chain Whip','secondary','Presence','Very Close','d6',1,1,'Hooked: On a successful attack, you can pull the target into Melee range.')])]
for book,campaign,page,rows in campaigns:
 for name,kind,trait,rng,die,base,hands,feature in rows:
  for tier in range(1,5):
   magic=name in ['Blessed Brass Knuckles','Holy Shotgun','Hallowed Shield'];step=2 if book=='hf' and kind=='secondary' else 3;bonus=base+(tier-1)*step
   items.append(dict(id='campaign-'+slug(campaign)+'-'+kind+'-'+slug(name)+'-t'+str(tier),name=name,kind=kind,trait=trait,range=rng,damage=die+('+'+str(bonus) if bonus else '')+(' mag' if magic else ' phy'),hands=hands,feature=feature,magic=magic,tier=tier,book=book,page=page-1,pdfPage=page,campaign=campaign))
for name,thresholds,feature in [
 ('Coffinwood Armor',[(4,10),(6,15),(8,22),(10,31)],'Splintering: Gain a bonus to your damage thresholds equal to your unmarked Armor Slots.'),
 ('Leather Longcoat',[(5,12),(8,18),(10,25),(12,34)],'Quiet: Gain a +2 bonus to rolls you make to move silently.'),
 ('Silverweave Armor',[(5,11),(7,16),(9,23),(11,32)],'Warded: You reduce incoming magic damage by your Armor Score before applying it to your damage thresholds.')]:
 for tier,(major,severe) in enumerate(thresholds,1):items.append(dict(id='campaign-dark-heart-of-andaluria-armor-'+slug(name)+'-t'+str(tier),name=name,kind='armor',major=major,severe=severe,score=tier+2,feature=feature,tier=tier,magic=False,evasion=0,agility=0,book='hf',page=153,pdfPage=154,campaign='Dark Heart of Andaluria'))
items.append(dict(id='campaign-colossus-of-the-drylands-consumable-dynamite',name='Dynamite',kind='consumable',feature='You can light this dynamite and toss it within Close range. All creatures within Very Close range of where the dynamite lands must make a Reaction Roll (14). Targets who fail take 1d20+5 physical damage. Targets who succeed must mark a Stress. Dynamite deals double damage to inanimate objects or structures.',tier=None,magic=False,book='core',page=317,pdfPage=318,campaign='Colossus of the Drylands'))
for e in items:
 if not e['feature']:e['feature']='—'

from collections import Counter
print(Counter((x['book'],x['kind']) for x in items))
for x in old:
 if x.get('brawler'):items.append(dict(x,book='hf',page=6))
# Standard starting supplies have no loot roll or printed tier.
for name in ['Torch','50 feet of rope','Basic supplies']:
 items.append(dict(id='supply-'+slug(name),name=name,kind='item',feature='Starting equipment.',tier=None,magic=False,book='core',page=17))
(root/'players/equipment.json').write_text(json.dumps(items,ensure_ascii=False,indent=2)+'\n')
rules['equipment']=[x for x in items if x['kind'] in ['primary','secondary','armor']];(root/'players/rules.json').write_text(json.dumps(rules,ensure_ascii=False,indent=2)+'\n')
