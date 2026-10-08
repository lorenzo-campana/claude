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
const plPregenInfo=k=>{const c=plPregenChar(k),st=plStats(c),g=PL_PREGENS[k],p=PREGEN[k],w=plEquip(c.primary),a=plEquip(c.armorId),hope=(plClass(c).hope||'').split(':'),dom=CDOM[plClass(c).domains[0]].c;
 const stat=(l,v)=>`<div><b>${esc(v)}</b><span>${l}</span></div>`;
 return `<div class="pl-pgd" style="--pl-accent:${dom}"><div class="pl-pg-img"><img src="diario/pg-${k}.png" alt="${esc(p.name)}"></div><div class="pl-pgd-info">
  <p class="pl-note" style="margin:0">${esc(g.className)} · ${esc(c.subclass)} · ${esc(plCard(g.ancestry).n)} ${esc(plCard(g.community).n)}${p.sage?' · Saggio di Corte':''} · ${esc(p.pron)}</p>
  <p style="margin:6px 0 12px">${esc(p.desc)}</p>
  <div class="pl-pgd-stats">${stat('Evasion',st.evasion)}${stat('Armor',st.armor)}${stat('HP',st.hp)}${stat('Stress',st.stress)}${stat('Major',st.major)}${stat('Severe',st.severe)}</div>
  <div class="pl-pgd-traits">${PL_TRAITS.map((t,i)=>`<div><b>${st.traits[i]>0?'+':''}${st.traits[i]}</b><span>${t}</span></div>`).join('')}</div>
  <dl class="pl-pgd-list"><dt>Arma</dt><dd>${esc(w.name)} · ${esc(w.trait)} · ${esc(w.range)} · ${esc(eqWeaponFormula(c,w))}</dd><dt>Armatura</dt><dd>${esc(a.name)} · ${st.major-1}/${st.severe-1} · punteggio ${st.armor}</dd>
  <dt>Esperienze</dt><dd>${c.experiences.map(x=>esc(x.name)+' +'+x.value).join(' · ')}</dd>
  <dt>Carte dominio</dt><dd>${c.cards.map(x=>esc(plCard(x.i).n)+' ('+CDOM[plCard(x.i).d].k+')').join(' · ')}</dd>
  <dt>Capacità di Speranza</dt><dd><b>${esc(hope[0])}</b>: ${esc(hope.slice(1).join(':').replace(/\s+/g,' ').trim())}</dd>
  ${p.q?`<dt>Domanda di background</dt><dd>${esc(p.q)}</dd>`:''}</dl>
  <div class="pl-actions">${plBtn('pregen',PL.chars.some(x=>x.id===k)?'Apri scheda':'Usa questo personaggio',`data-k="${k}"`,'pri')}${plBtn('pregen-sheet','Vedi scheda completa',`data-k="${k}"`)}</div></div></div>`};
const plPregenStrip=()=>`<section class="pl-box" style="margin-top:24px"><h3>Personaggi pregenerati · I Messaggeri del Sablewood</h3><p class="pl-note">Cinque personaggi pronti, con la stessa scheda di quelli creati da zero. Tocca uno per vedere il personaggio e prenderlo. Se il tuo master ha già il gruppo del Sablewood, unendoti alla campagna prendi il suo posto.</p><div class="pl-pregens">${Object.keys(PL_PREGENS).map(k=>{const p=PREGEN[k],g=PL_PREGENS[k],own=PL.chars.some(x=>x.id===k),dom=CDOM[plClass({className:g.className}).domains[0]].c;return `<button type="button" class="pl-pg" data-pl="pregen-info" data-k="${k}" style="--pl-accent:${dom}" aria-label="${esc(p.name)}, ${esc(g.className)}: apri i dettagli"><span class="pl-pg-img"><img src="diario/pg-${k}.png" alt="" loading="lazy"></span><span class="pl-pg-t"><b>${esc(p.name)}</b><small>${esc(g.className)} · ${esc(plCard(g.subcard).n)}</small>${own?'<span class="pl-badge">Già tuo</span>':''}</span></button>`}).join('')}</div></section>`;
