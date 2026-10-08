"""Embed the rules view (cheat sheet + SRD bot) into sablewood-tracker.html.
Run after editing rules/rules.js, rules/rules.css or rules/srd-chunks.json (see scripts/build-srd-chunks.py)."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
p=root/'sablewood-tracker.html';s=p.read_text()
css='/* RULES_STYLE_START */\n'+(root/'rules/rules.css').read_text()+'/* RULES_STYLE_END */'
chunks=json.dumps(json.loads((root/'rules/srd-chunks.json').read_text()),ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
js='/* RULES_CODE_START */\nconst SRD_CHUNKS='+chunks+';\n'+(root/'rules/rules.js').read_text()+'\n/* RULES_CODE_END */'
if '/* RULES_STYLE_START */' in s:s=re.sub(r'/\* RULES_STYLE_START \*/.*?/\* RULES_STYLE_END \*/',lambda m:css,s,flags=re.S)
else:s=s.replace('</style>',css+'\n</style>',1)
if '/* RULES_CODE_START */' in s:s=re.sub(r'/\* RULES_CODE_START \*/.*?/\* RULES_CODE_END \*/',lambda m:js,s,flags=re.S)
else:s=s.replace('/* PLAYER_CODE_START */',js+'\n/* PLAYER_CODE_START */',1)
p.write_text(s)
