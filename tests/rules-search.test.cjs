// Retrieval checks for the rules bot: Italian questions must land on the right SRD sections.
const fs=require('fs');
const chunks=JSON.parse(fs.readFileSync(__dirname+'/../rules/srd-chunks.json','utf8'));
const src=fs.readFileSync(__dirname+'/../rules/rules.js','utf8');
const f=new Function('esc','SRD_CHUNKS','A','document',src+';return {rbSearch}');
const {rbSearch}=f(x=>x,chunks,{},{addEventListener(){}});
const cases=[
 ['Come funziona la Paura del GM?',/Using Fear|Hope & Fear/],
 ['Quando un PG segna Stress e non può?',/Stress/],
 ['Quanti punti battaglia servono per un incontro?',/Building Balanced Encounters/],
 ['Come funziona un tiro di gruppo?',/Group Action/],
 ['Cosa succede se un riposo viene interrotto?',/Downtime/],
 ['Quanto danno fa una caduta?',/Falling/],
 ['Cosa fa la condizione vulnerabile?',/Conditions/],
 ['Come si calcolano le soglie di danno?',/Damage Thresholds|Armor/],
 ['Cos\'è un conto alla rovescia dinamico?',/Countdown/],
 ['Come funziona il vantaggio?',/Advantage/],
 ['Cosa succede quando un PG muore?',/Death/],
 ['what is a critical success on damage',/Critical/],
];
let bad=0;
for(const [q,re] of cases){const r=rbSearch(q);const ok=r.slice(0,3).some(x=>re.test(x.c.h));if(!ok)bad++;
  console.log(ok?'ok  ':'FAIL',q,'->',r.slice(0,3).map(x=>x.c.h.split(' › ').slice(-2).join(' › ')+' '+x.s.toFixed(1)).join(' | '))}
process.exit(bad?1:0);
