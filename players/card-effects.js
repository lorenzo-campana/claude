/* Effetti delle carte sulla scheda.
   Ogni regola riproduce un effetto passivo (o uno stato attivabile) letto dalla carta originale:
   Core Rulebook dall'SRD 1.0, Hope & Fear dalle carte HD. Una regola vale solo se la carta è
   davvero in gioco: carte dominio nel loadout attivo (Vitality e Master of the Craft anche nel
   vault, perché permanenti), sottoclassi fino al tier raggiunto, ancestry e community sempre.
   Gli effetti a tiro singolo (spendi Hope, una volta per riposo…) restano sulle carte stesse. */
const PL_BARE_BONES=[[9,19],[11,24],[13,31],[15,38]];
const PL_FX_TRAIT=['Agility','Strength','Finesse','Instinct','Presence','Knowledge'];
// kind: domain (loadout) · owned (anche nel vault) · sub (tier minimo) · anc (feature 1 o 2) · com · tra
// mode: passive · toggle (stato on/off sulla scheda) · choice (scelta permanente) · note (si applica al tiro)
const PL_CARD_FX=[
 // ancestry
 {kind:'anc',card:'Giant',slot:1,label:'Endurance',text:'+1 Hit Point slot',apply:st=>{st.hp++}},
 {kind:'anc',card:'Human',slot:1,label:'High Stamina',text:'+1 Stress slot',apply:st=>{st.stress++}},
 {kind:'anc',card:'Simiah',slot:2,label:'Nimble',text:'+1 Evasion',apply:st=>{st.evasion++}},
 {kind:'anc',card:'Galapa',slot:1,label:'Shell',text:'Soglie + Proficiency',apply:(st,x)=>{st.major+=st.proficiency;st.severe+=st.proficiency}},
 {kind:'anc',card:'Earthkin',slot:1,label:'Stoneskin',text:'+1 Armor Score e soglie',apply:st=>{st.armor++;st.major++;st.severe++}},
 // transformation
 {kind:'tra',card:'Demigod',label:'Gifted',text:'+1 ai tiri d’azione, di reazione e di danno',apply:st=>{st.rollBonus++;st.damageBonus++}},
 {kind:'tra',card:'Werewolf',label:'Wolf Form',mode:'toggle',key:'wolf',text:'+1d10 ai tiri d’attacco e di danno (tiralo a parte)',apply:()=>{}},
 // sottoclassi
 {kind:'sub',card:'School of War',tier:1,label:'Battlemage',text:'+1 Hit Point slot',apply:st=>{st.hp++}},
 {kind:'sub',card:'School of War',tier:2,label:'Conjure Shield',text:'Con almeno 2 Hope: Evasion + Proficiency',req:x=>x.c.hope>=2||'serve almeno 2 Hope',apply:st=>{st.evasion+=st.proficiency}},
 {kind:'sub',card:'Nightwalker',tier:3,label:'Fleeting Shadow',text:'+1 Evasion',apply:st=>{st.evasion++}},
 {kind:'sub',card:'Vengeance',tier:1,label:'At Ease',text:'+1 Stress slot',apply:st=>{st.stress++}},
 {kind:'sub',card:'Stalwart',tier:1,label:'Unwavering',text:'+1 alle soglie',apply:st=>{st.major++;st.severe++}},
 {kind:'sub',card:'Stalwart',tier:2,label:'Unrelenting',text:'+2 alle soglie',apply:st=>{st.major+=2;st.severe+=2}},
 {kind:'sub',card:'Stalwart',tier:3,label:'Undaunted',text:'+3 alle soglie',apply:st=>{st.major+=3;st.severe+=3}},
 {kind:'sub',card:'Winged Sentinel',tier:3,label:'Ascendant',text:'+4 alla soglia Severe',apply:st=>{st.severe+=4}},
 {kind:'sub',card:'Juggernaut',tier:1,label:'Rugged',text:'+3 alla soglia Severe',apply:st=>{st.severe+=3}},
 {kind:'sub',card:'Moon',tier:3,label:'Lunar Phases',text:'Effetto della fase sul dado della carta',req:x=>x.c.cardState?.[293]?.face>1||'fase New (1): spendi Hope per annullare un danno Minor',apply:(st,x)=>{const f=x.c.cardState[293].face;if(f<=3)st.damageBonus+=2;else if(f===4){st.major+=3;st.severe+=3}else st.evasion++}},
 {kind:'sub',card:'Moon',tier:2,label:'Moonbeam',mode:'toggle',key:'moonbeam',text:'Nella luce lunare: +1 ai tiri di Spellcast',apply:st=>{st.spellBonus++}},
 {kind:'sub',card:'Pact of the Endless',tier:1,label:'Patron’s Mantle',mode:'toggle',key:'mantle',text:'Soglie + tier finché è attivo',apply:(st,x)=>{st.major+=x.tier;st.severe+=x.tier}},
 {kind:'sub',card:'Hedge',tier:3,label:'Circle of Power',mode:'toggle',key:'circle',text:'Nel cerchio: +2 a soglie, tiri d’attacco ed Evasion',apply:st=>{st.major+=2;st.severe+=2;st.attackBonus+=2;st.evasion+=2}},
 {kind:'sub',card:'Warden of the Elements',tier:1,label:'Elemental Incarnation',mode:'toggle',key:'channel',options:[['earth','Earth'],['fire','Fire'],['water','Water'],['air','Air']],text:'Channel: Earth dà soglie + Proficiency; con la Mastery Fire +1 Proficiency, Air +1 Evasion',apply:(st,x)=>{const el=x.fx.channelEl||'earth',m=x.subTier('Warden of the Elements')>=3;if(el==='earth'){st.major+=st.proficiency;st.severe+=st.proficiency}if(m&&el==='fire')st.proficiency++;if(m&&el==='air')st.evasion++}},
 {kind:'sub',card:'Elemental Origin',tier:3,label:'Transcendence',mode:'toggle',key:'transcend',text:'Scegli due benefici fino al prossimo riposo',pick:2,options:[['severe','+4 Severe'],['trait','+1 a un tratto'],['prof','+1 Proficiency'],['evasion','+2 Evasion']],apply:(st,x)=>{const p=x.fx.transcendPick||[];if(p.includes('severe'))st.severe+=4;if(p.includes('prof'))st.proficiency++;if(p.includes('evasion'))st.evasion+=2;if(p.includes('trait'))st.traits[+(x.fx.transcendTrait||0)]++},traits:true},
 // carte dominio nel loadout
 {kind:'domain',card:'Bone-Touched',label:'Bone-Touched',text:'Con 4+ carte Bone nel loadout: +1 Agility',req:x=>x.dom('Bone')>=4||`servono 4 carte Bone nel loadout (${x.dom('Bone')})`,apply:st=>{st.traits[0]++},traits:true},
 {kind:'domain',card:'Full Surge',label:'Full Surge',mode:'toggle',key:'surge',text:'+2 a tutti i tratti fino al prossimo riposo',apply:st=>{st.traits=st.traits.map(v=>v+2)},traits:true},
 {kind:'domain',card:'Bare Bones',label:'Bare Bones',text:'Senza armatura: Armor Score 3 + Strength e soglie base del tier',req:x=>!x.armored||'hai un’armatura equipaggiata',base:true},
 {kind:'domain',card:'Armorer',label:'Armorer',text:'Con armatura: +1 Armor Score',req:x=>x.armored||'nessuna armatura equipaggiata',apply:st=>{st.armor++}},
 {kind:'domain',card:'Valor-Touched',label:'Valor-Touched',text:'Con 4+ carte Valor nel loadout: +1 Armor Score',req:x=>x.dom('Valor')>=4||`servono 4 carte Valor nel loadout (${x.dom('Valor')})`,apply:st=>{st.armor++}},
 {kind:'domain',card:'Fortified Armor',label:'Fortified Armor',text:'Con armatura: +2 alle soglie',req:x=>x.armored||'nessuna armatura equipaggiata',apply:st=>{st.major+=2;st.severe+=2}},
 {kind:'domain',card:'Rise Up',label:'Rise Up',text:'Severe + Proficiency',apply:st=>{st.severe+=st.proficiency}},
 {kind:'domain',card:'Blade-Touched',label:'Blade-Touched',text:'Con 4+ carte Blade nel loadout: +2 ai tiri d’attacco, +4 Severe',req:x=>x.dom('Blade')>=4||`servono 4 carte Blade nel loadout (${x.dom('Blade')})`,apply:st=>{st.attackBonus+=2;st.severe+=4}},
 {kind:'domain',card:'Splendor-Touched',label:'Splendor-Touched',text:'Con 4+ carte Splendor nel loadout: +3 Severe',req:x=>x.dom('Splendor')>=4||`servono 4 carte Splendor nel loadout (${x.dom('Splendor')})`,apply:st=>{st.severe+=3}},
 {kind:'domain',card:'Arcana-Touched',label:'Arcana-Touched',text:'Con 4+ carte Arcana nel loadout: +1 ai tiri di Spellcast',req:x=>x.dom('Arcana')>=4||`servono 4 carte Arcana nel loadout (${x.dom('Arcana')})`,apply:st=>{st.spellBonus++}},
 {kind:'domain',card:'Sage-Touched',label:'Sage-Touched',mode:'toggle',key:'nature',text:'Con 4+ carte Sage, in un ambiente naturale: +2 ai tiri di Spellcast',req:x=>x.dom('Sage')>=4||`servono 4 carte Sage nel loadout (${x.dom('Sage')})`,apply:st=>{st.spellBonus+=2}},
 {kind:'domain',card:'Untouchable',label:'Untouchable',text:'Evasion + metà Agility (per eccesso)',apply:st=>{st.evasion+=Math.max(0,Math.ceil(st.traits[0]/2))}},
 {kind:'domain',card:'Shadowhunter',label:'Shadowhunter',mode:'toggle',key:'shadow',text:'In penombra o al buio: +1 Evasion (e vantaggio agli attacchi)',apply:st=>{st.evasion++}},
 {kind:'domain',card:'Frenzy',label:'Frenzy',mode:'toggle',key:'frenzy',text:'Frenzied: +8 Severe, +10 ai danni, niente Armor Slot',apply:st=>{st.severe+=8;st.damageBonus+=10;st.noArmorSlots=true}},
 {kind:'domain',card:'Deadly Focus',label:'Deadly Focus',mode:'toggle',key:'focus',text:'Contro il bersaglio scelto: +1 Proficiency',apply:st=>{st.proficiency++}},
 {kind:'domain',card:'Eldritch Flesh',label:'Eldritch Flesh',text:'Soglie +1 per ogni Stress segnato',apply:(st,x)=>{st.major+=x.c.stress;st.severe+=x.c.stress}},
 {kind:'domain',card:'Voice of Reason',label:'Voice of Reason',text:'Con tutto lo Stress segnato: +1 Proficiency ai danni',req:(x,st)=>x.c.stress>=st.stress||'non hai tutto lo Stress segnato',apply:st=>{st.proficiency++}},
 {kind:'domain',card:'Body Basher',label:'Body Basher',text:'Attacchi in Melee: + Strength al danno',apply:st=>{st.meleeDamage+=st.traits[1]}},
 {kind:'domain',card:'Cruel Precision',label:'Cruel Precision',text:'Attacchi con arma: + Finesse o Agility (la più alta) al danno',apply:st=>{st.weaponDamage+=Math.max(st.traits[2],st.traits[0],0)}},
 // permanenti, anche se la carta finisce nel vault
 {kind:'owned',card:'Vitality',label:'Vitality',mode:'choice',key:'vitality',pick:2,options:[['stress','+1 Stress slot'],['hp','+1 Hit Point slot'],['thr','+2 alle soglie']],text:'Scegli due benefici permanenti',apply:(st,x)=>{const p=x.fx.vitality||[];if(p.includes('stress'))st.stress++;if(p.includes('hp'))st.hp++;if(p.includes('thr')){st.major+=2;st.severe+=2}}},
 {kind:'owned',card:'Master of the Craft',label:'Master of the Craft',mode:'choice',key:'craft',text:'+2 a due Experiences oppure +3 a una',apply:(st,x)=>{const m=x.fx.craft||'',[a,b]=m.split(':');if(a==='3'&&st.experiences[+b])st.experiences[+b].value+=3;if(a==='2')for(const i of String(b).split(','))if(st.experiences[+i])st.experiences[+i].value+=2}}
];
function plFxContext(c){
 const active=plActive(c).map(x=>plCard(x.i)).filter(Boolean),owned=plOwned(c).map(x=>plCard(x.i)).filter(Boolean),dom=n=>active.filter(x=>CDOM[x.d]?.k===n).length;
 const subs=[...(c.subcards||[])].map(plCard).filter(Boolean),subTier=n=>Math.max(0,...subs.filter(x=>x.n===n).map(x=>x.tier||1));
 const anc=plCard(c.ancestry)?.n,mix=plCard(c.mixed)?.n;
 c.cardFx=c.cardFx||{};return {c,active,owned,dom,subTier,tier:plTier(c.level),armored:!!plEquip(c.armorId),fx:c.cardFx,
  has:r=>r.kind==='domain'?active.some(x=>x.n===r.card):r.kind==='owned'?owned.some(x=>x.n===r.card):r.kind==='sub'?subTier(r.card)>=r.tier:r.kind==='anc'?(r.slot===1?anc===r.card:(mix||anc)===r.card):r.kind==='com'?plCard(c.community)?.n===r.card:r.kind==='tra'?plCard(c.transformation)?.n===r.card:false};
}
/* Base dell'armatura con Bare Bones: sostituisce Armor Score e soglie base quando non si indossa armatura. */
function plBareBones(c){const x=plFxContext(c);return !x.armored&&x.active.some(y=>y.n==='Bare Bones')?{major:PL_BARE_BONES[x.tier-1][0],severe:PL_BARE_BONES[x.tier-1][1],score:3+(c.traits[1]||0),evasion:0}:null}
function plCardEffects(c,st){
 const x=plFxContext(c);Object.assign(st,{rollBonus:0,spellBonus:0,attackBonus:0,damageBonus:0,meleeDamage:0,weaponDamage:0,cardFx:[]});
 const rules=PL_CARD_FX.filter(r=>x.has(r)),order=[...rules.filter(r=>r.traits),...rules.filter(r=>!r.traits)];
 for(const r of order){const on=r.mode==='toggle'?!!x.fx[r.key]:true,req=r.req?r.req(x,st):true,ok=on&&req===true;
  if(ok&&r.apply)r.apply(st,x);st.cardFx.push({r,on,ok,why:req===true?'':req})}
 st.armor=Math.max(0,st.armor);st.proficiency=Math.max(1,st.proficiency);return st;
}
/* Pannello "Card effects" della scheda: cosa sta modificando i numeri, e gli interruttori per gli stati temporanei. */
function plCardFxPanel(c,st){
 if(!st.cardFx.length)return '';const x=plFxContext(c);
 const pool=[...x.owned,...(c.subcards||[]).map(plCard),...[c.ancestry,c.mixed,c.community,c.transformation].map(i=>i===''||i==null?null:plCard(i))].filter(Boolean),cardOf=n=>pool.filter(y=>y.n===n).sort((a,b)=>(b.tier||0)-(a.tier||0))[0];
 const row=({r,on,ok,why})=>{const k=r.key,tg=r.mode==='toggle',ch=r.mode==='choice';let ctl='';
  if(tg)ctl+=`<button type="button" class="pl-fx-switch ${on?'on':''}" data-pl="cardfx" data-k="${k}" aria-pressed="${on}" aria-label="${esc(r.label)}: ${on?'attivo':'non attivo'}"><i></i></button>`;
  if(r.options&&r.key==='channel'&&on)ctl+=`<select data-pl-field="cardFx.channelEl" aria-label="Elemento">${r.options.map(([v,n])=>`<option value="${v}" ${(x.fx.channelEl||'earth')===v?'selected':''}>${n}</option>`).join('')}</select>`;
  if(r.pick&&(on||ch)){const key=r.key==='transcend'?'transcendPick':r.key,cur=x.fx[key]||[];ctl+=`<span class="pl-fx-picks">${r.options.map(([v,n])=>`<button type="button" class="${cur.includes(v)?'on':''}" data-pl="cardfx-pick" data-k="${key}" data-v="${v}" data-max="${r.pick}" aria-pressed="${cur.includes(v)}">${n}</button>`).join('')}</span>`;if(r.key==='transcend'&&cur.includes('trait'))ctl+=`<select data-pl-field="cardFx.transcendTrait" aria-label="Tratto">${PL_FX_TRAIT.map((n,i)=>`<option value="${i}" ${+(x.fx.transcendTrait||0)===i?'selected':''}>${n}</option>`).join('')}</select>`}
  if(r.key==='craft'){const xp=c.experiences.map((e,i)=>[i,e.name||'Experience '+(i+1)]),opts=[['','Scegli…'],...xp.map(([i,n])=>['3:'+i,'+3 a '+n]),...xp.flatMap(([i,n])=>xp.filter(([j])=>j>i).map(([j,m])=>['2:'+i+','+j,'+2 a '+n+' e '+m]))];ctl+=`<select data-pl-field="cardFx.craft" aria-label="Master of the Craft">${opts.map(([v,n])=>`<option value="${esc(v)}" ${(x.fx.craft||'')===v?'selected':''}>${esc(n)}</option>`).join('')}</select>`}
  const card=cardOf(r.card),tip=esc(r.label+' · '+r.text+(why&&on?' · '+why:''));
  return {chip:`<li class="pl-fx ${ok?'ok':''} ${tg?'tg':''}" title="${tip}"><span class="pl-fx-dot" aria-hidden="true"></span>${card?`<button type="button" class="pl-fx-name" data-pl="gallery-preview" data-i="${card.i}" aria-label="Apri la carta ${esc(r.label)}">${esc(r.label)}</button>`:`<b>${esc(r.label)}</b>`}${tg?ctl.slice(0,ctl.indexOf('</button>')+9):''}</li>`,ctl:tg?ctl.slice(ctl.indexOf('</button>')+9):ctl,label:r.label}};
 const extra=[st.rollBonus&&`Tiri ${sgn(st.rollBonus)}`,st.attackBonus&&`Attacco ${sgn(st.attackBonus)}`,st.spellBonus&&`Spellcast ${sgn(st.spellBonus)}`,(st.damageBonus||st.weaponDamage)&&`Danni ${sgn(st.damageBonus+st.weaponDamage)}`,st.meleeDamage&&`Danni in Melee ${sgn(st.meleeDamage)}`].filter(Boolean);
 const rows=st.cardFx.map(row);
 return `<ul class="pl-fx-list pl-fx-chips-row">${rows.map(x=>x.chip).join('')}</ul>${rows.filter(x=>x.ctl).map(x=>`<div class="pl-fx-ctlrow"><b>${esc(x.label)}</b><div class="pl-fx-ctl">${x.ctl}</div></div>`).join('')}${extra.length?`<p class="pl-fx-sum">Già applicati ai lanci della scheda: ${extra.join(' · ')}</p>`:''}${st.noArmorSlots?'<p class="pl-fx-sum"><b>Frenzy:</b> finché dura non puoi segnare Armor Slot.</p>':''}`;
}
