"""Embed player sources so the HTML can still be pasted as a Claude artifact."""
from pathlib import Path
import json,re,base64
root=Path(__file__).resolve().parents[1]
p=root/'sablewood-tracker.html';s=p.read_text()
sheet_css=(root/'players/player.css').read_text()
def embed_asset(m):
 asset=root/m.group(1);mime='font/woff2' if asset.suffix=='.woff2' else 'image/svg+xml'
 return 'url("data:'+mime+';base64,'+base64.b64encode(asset.read_bytes()).decode()+'")'
sheet_css=re.sub(r'url\("(players/assets/[^"]+)"\)',embed_asset,sheet_css)
css='/* PLAYER_STYLE_START */\n'+sheet_css+'\n/* PLAYER_STYLE_END */'
js='/* PLAYER_CODE_START */\nconst PLAYER_RULES='+json.dumps(json.loads((root/'players/rules.json').read_text()),ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\nconst PL_CARD_RULES='+json.dumps(json.loads((root/'players/card-controls.json').read_text()),ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n'+'const EQ_CATALOG='+json.dumps(json.loads((root/'players/equipment.json').read_text()),ensure_ascii=False,separators=(',',':')).replace('</','<\\/')+';\n'+(root/'players/equipment.js').read_text()+'\n'+(root/'players/card-resources.js').read_text()+'\n'+(root/'players/player.js').read_text()+'\n/* PLAYER_CODE_END */'
if '/* PLAYER_STYLE_START */' in s:s=re.sub(r'/\* PLAYER_STYLE_START \*/.*?/\* PLAYER_STYLE_END \*/',lambda m:css,s,flags=re.S)
else:s=s.replace('</style>',css+'\n</style>',1)
if '/* PLAYER_CODE_START */' in s:s=re.sub(r'/\* PLAYER_CODE_START \*/.*?/\* PLAYER_CODE_END \*/',lambda m:js,s,flags=re.S)
else:s=s.replace('// all\'avvio: la vista dei giocatori',js+'\n// all\'avvio: la vista dei giocatori',1)
p.write_text(s)
