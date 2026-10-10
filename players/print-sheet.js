/* Scheda cartacea A4: solo ciò che non cambia al tavolo. Niente soglie né punteggi che dipendono dall'armatura,
   niente carte dominio né inventory weapon (sono carte stampate tenute accanto al foglio): per armi e armatura
   equipaggiate restano i posti delle mini card 41×63 mm. Anteprima a schermo, poi PDF con html2canvas + jsPDF. */
function plPrintBoxes(n,cls='pr-box'){return `<span class="pr-boxes">${Array.from({length:n},()=>`<i class="${cls}"></i>`).join('')}</span>`}
function plPrintSheet(c){const k=plClass(c),st=plStats(c),cls=[[c.className,k?.features]];if(c.multiclass)cls.push([c.multiclass.className,PLAYER_RULES.classes[c.multiclass.className]?.features]);
 const accent=CDOM[k.domains[0]]?.c||'#6e57a5',hopeT=String(k.hope||''),hi=hopeT.indexOf(':');
 const feats=cls.flatMap(([n,t])=>plFxParts(t).map(f=>({...f,cls:n})));
 const featHTML=feats.map(f=>`<div class="pr-feat"><b>${esc(f.name)}${cls.length>1?` <small>${esc(f.cls)}</small>`:''}</b>${f.items.map(x=>x.li!==undefined?`<p class="li">• ${esc(x.li)}</p>`:`<p>${esc(x.p)}</p>`).join('')}</div>`).join('');
 const xp=Array.from({length:5},(_,i)=>{const e=c.experiences[i];return `<div class="pr-line"><span>${e?esc(e.name):''}</span><b>${e&&e.name?sgn(e.value):''}</b></div>`}).join('');
 const slot=(label,sub)=>`<div class="pr-slot"><b>${label}</b><small>${sub}</small></div>`;
 return `<div class="pr-page" style="--pa:${accent}">
 <header class="pr-head"><div class="pr-class"><h1>${esc(c.className)}</h1><p>${k.domains.map(i=>esc(CDOM[i].k)).join(' & ')}${c.multiclass?' · '+esc(c.multiclass.className):''}</p></div>
  <div class="pr-id"><div><small>Nome</small><b>${esc(c.name||'')}</b></div><div><small>Pronomi</small><b>${esc(c.pronouns||'')}</b></div><div><small>Heritage</small><b>${esc(plCard(c.ancestry)?.n||'')}${c.mixed!==''&&c.mixed!=null?' / '+esc(plCard(c.mixed)?.n||''):''} · ${esc(plCard(c.community)?.n||'')}</b></div><div><small>Subclass</small><b>${esc(c.subclass||'')}${c.multiclass?' · '+esc(c.multiclass.subclass):''}</b></div></div>
  <div class="pr-level"><b>${c.level}</b><small>Livello</small></div></header>
 <section class="pr-top"><div class="pr-def"><div class="pr-big"><small>Evasion</small><i></i><em>base ${k.evasion+(c.evasionBonus||0)}</em></div><div class="pr-big"><small>Armor</small><i></i><em>dall'armatura</em></div><div class="pr-armslots"><small>Armor Slots</small>${plPrintBoxes(12,'pr-box sm')}</div></div>
  <div class="pr-traits">${PL_TRAITS.map((n,i)=>`<div class="pr-trait"><small>${n}</small><b>${sgn(c.traits[i])}</b><em>${PL_VERBS[i]}</em></div>`).join('')}</div></section>
 <section class="pr-equip"><h2>Equipment</h2><div class="pr-equip-in"><div class="pr-prof"><small>Proficiency</small>${Array.from({length:6},(_,i)=>`<i class="${i<c.proficiency?'on':''}"></i>`).join('')}</div>
  <div class="pr-slots">${slot('Arma primaria','mini card')}${slot('Arma secondaria','mini card')}${slot('Armatura','mini card')}</div>
  <div class="pr-inv"><small>Inventario · oggetti senza carta</small>${Array.from({length:6},()=>'<div class="pr-line"></div>').join('')}<div class="pr-gold"><small>Gold</small><span>Handfuls ${plPrintBoxes(9,'pr-box sm')}</span><span>Bags ${plPrintBoxes(9,'pr-box sm')}</span><span>Chest ${plPrintBoxes(1,'pr-box sm')}</span></div></div></div></section>
 <div class="pr-cols"><div class="pr-col">
  <section><h2>Damage & Health</h2><div class="pr-thr"><span>Minor<br><em>1 HP</em></span><i></i><span>Major<br><em>2 HP</em></span><i></i><span>Severe<br><em>3 HP</em></span></div><p class="pr-hint">Soglie = armatura + livello (${c.level})</p><div class="pr-track"><b>HP</b>${plPrintBoxes(st.hp)}</div><div class="pr-track"><b>Stress</b>${plPrintBoxes(st.stress)}</div></section>
  <section><h2>Hope</h2><div class="pr-track">${plPrintBoxes(st.hope,'pr-box dia')}</div><div class="pr-hope"><b>${esc(hi>0?hopeT.slice(0,hi):'Hope Feature')}</b> ${esc((hi>0?hopeT.slice(hi+1):hopeT).replace(/\s*\n\s*/g,' ').trim())}</div></section>
  <section><h2>Experience</h2>${xp}</section></div>
  <div class="pr-col"><section class="pr-feats"><h2>Class Features</h2>${featHTML}</section></div></div>
 <footer class="pr-foot"><span>Daggerheart © Darrington Press 2025</span><span>${esc(c.name||'')} · ${esc(c.className)} ${c.level}</span></footer></div>`}
// il testo delle feature si rimpicciolisce finché la pagina sta in un A4
function plPrintFit(root){const page=root.querySelector('.pr-page'),f=root.querySelector('.pr-feats');if(!page||!f)return;let pt=9;f.style.fontSize=pt+'pt';while((f.scrollHeight>f.clientHeight+1||page.scrollHeight>page.clientHeight+1)&&pt>5.4){pt-=.2;f.style.fontSize=pt+'pt'}}
function plPrintOpen(c){let el=document.getElementById('pl-print');if(!el){el=document.createElement('div');el.id='pl-print';el.className='pl-print-ov';document.body.appendChild(el)}
 el.innerHTML=`<div class="pl-print-bar"><b>Anteprima di stampa · A4</b><span class="pl-print-msg" role="status"></span><button type="button" class="btn pri" data-pl="print-pdf">Scarica PDF</button><button type="button" class="btn" data-pl="print-close">Chiudi</button></div><div class="pl-print-stage"><div class="pl-print-scale">${plPrintSheet(c)}</div></div>`;
 el.hidden=false;document.body.classList.add('pl-print-on');(document.fonts?.ready||Promise.resolve()).then(()=>{plPrintFit(el);plPrintScale()})}
function plPrintScale(){const el=document.getElementById('pl-print'),st=el?.querySelector('.pl-print-stage'),sc=el?.querySelector('.pl-print-scale'),pg=sc?.querySelector('.pr-page');if(!pg)return;sc.style.transform='none';const k=Math.min((st.clientWidth-32)/pg.offsetWidth,1.6);sc.style.transform=`scale(${k})`;sc.style.height=pg.offsetHeight*k+'px';sc.style.width=pg.offsetWidth*k+'px'}
function plPrintClose(){const el=document.getElementById('pl-print');if(el){el.innerHTML='';el.hidden=true}document.body.classList.remove('pl-print-on')}
async function plPrintPdf(c){const el=document.getElementById('pl-print'),msg=el?.querySelector('.pl-print-msg');if(msg)msg.textContent='Creo il PDF…';
 const host=document.createElement('div');host.className='pl-print-capture';host.innerHTML=plPrintSheet(c);document.body.appendChild(host);
 try{await Promise.all([loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'),loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js')]);await (document.fonts?.ready||Promise.resolve());plPrintFit(host);
  const cv=await html2canvas(host.querySelector('.pr-page'),{scale:3,backgroundColor:'#ffffff',logging:false}),pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',compress:true});
  pdf.addImage(cv.toDataURL('image/jpeg',.92),'JPEG',0,0,210,297,undefined,'FAST');const blob=pdf.output('blob'),name=(c.name||'personaggio').replace(/[\\/:*?"<>|]/g,'-')+' - scheda.pdf';
  const dl=window.claude?.use?await window.claude.use('downloads').catch(()=>null):null;
  if(dl){try{await dl.save({filename:name,data:blob})}catch(e){if(e?.code!=='declined')throw e}}
  else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}
  if(msg)msg.textContent='PDF pronto.'}
 catch(e){if(msg)msg.textContent='Non sono riuscito a creare il PDF: riprova.'}
 finally{host.remove()}}
