/* Sablewood pregenerated characters, built on the same character model as the creator.
   Names, pronouns, traits, Experiences and descriptions come from PREGEN; the rest is the Quickstart loadout. */
const PL_PREGENS={
 marlowe:{className:'Sorcerer',subcard:202,ancestry:253,community:246,cards:[3,14],primary:'primary-dualstaff',armorId:'Leather Armor',potion:'Minor Stamina Potion'},
 barnacle:{className:'Rogue',subcard:197,ancestry:266,community:245,cards:[11,16],primary:'primary-dagger',armorId:'Gambeson Armor',potion:'Minor Stamina Potion'},
 garrick:{className:'Warrior',subcard:205,ancestry:262,community:243,cards:[4,5],primary:'primary-longsword',armorId:'Leather Armor',potion:'Minor Health Potion'},
 khari:{className:'Guardian',subcard:193,ancestry:261,community:244,cards:[7,26],primary:'primary-battleaxe',armorId:'Chainmail Armor',potion:'Minor Health Potion'},
 varian:{className:'Ranger',subcard:194,ancestry:268,community:251,cards:[8,24],primary:'primary-shortbow',armorId:'Leather Armor',potion:'Minor Stamina Potion'}
};
function plPregenChar(key){
 const g=PL_PREGENS[key],p=PREGEN[key];if(!g||!p)throw Error('Personaggio pregenerato non disponibile.');
 const c=plNew();
 Object.assign(c,{id:key,pregen:key,name:p.name,pronouns:p.pron,className:g.className,subclass:plCard(g.subcard).n,subcards:[g.subcard],ancestry:g.ancestry,community:g.community,
  traits:[...p.tr],primary:g.primary,secondary:'',armorId:g.armorId,potion:g.potion,description:p.desc,
  experiences:p.exp.map(([name,value])=>({name,value})),background:p.q?'Domanda di background: '+p.q+'\n\nRisposta:\n':''});
 c.classItem=plClassItems(c)[0];
 if(p.sage)c.notes='Solo per il Saggio di Corte: '+SECRET.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
 for(const i of g.cards)plGrant(c,i,true);
 plInitResources(c);plRecord(c,'Created from the Sablewood pregenerated characters');
 return c;
}
const plPregenStrip=()=>`<section class="pl-box" style="margin-top:24px"><h3>Personaggi pregenerati · I Messaggeri del Sablewood</h3><p class="pl-note">Cinque personaggi pronti, con la stessa scheda di quelli creati da zero. Scegline uno: lo ritrovi tra i tuoi personaggi, con equipaggiamento e carte già pronti. Se il tuo master ha già il gruppo del Sablewood, unendoti alla campagna prendi il suo posto.</p><div class="pl-grid">${Object.keys(PL_PREGENS).map(k=>{const p=PREGEN[k],g=PL_PREGENS[k],own=PL.chars.some(x=>x.id===k),dom=CDOM[plClass({className:g.className}).domains[0]].c;return `<article class="pl-box pl-person" style="--pl-accent:${dom}"><div class="pl-actions"><div class="pl-avatar">${esc(p.name.slice(0,1))}</div><div><h3>${esc(p.name)}</h3><span class="pl-note">${esc(g.className)} · ${esc(plCard(g.subcard).n)}</span></div></div><div><span class="pl-badge">${esc(plCard(g.ancestry).n)}</span><span class="pl-badge">${esc(plCard(g.community).n)}</span>${p.sage?'<span class="pl-badge">Saggio di Corte</span>':''}${own?'<span class="pl-badge">Già tuo</span>':''}</div><p class="pl-note" style="margin:0">${esc(p.desc)}</p><div class="pl-actions">${plBtn('pregen',own?'Apri scheda':'Usa questo personaggio',`data-k="${k}"`,'pri')}</div></article>`}).join('')}</div></section>`;
