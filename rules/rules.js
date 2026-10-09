/* ================= regole: cheat sheet del GM, domande al manuale (SRD), riferimento completo =================
   Il testo del manuale (SRD 1.0, Public Game Content, © Critical Role LLC) è in SRD_CHUNKS (rules/srd-chunks.json).
   Il bot cerca i passaggi sul dispositivo, poi manda a Claude (modelTier "quick") solo i 4 migliori: poche migliaia di token. */
const RV={tab:"cheat"};
const RB={q:"",busy:false,ans:"",srcs:[],cited:[],err:"",tokens:0,tier:"",ctl:null,open:null};
const RV_TABS=[["cheat","Cheat sheet del GM"],["ask","Chiedi al manuale"],["ref","Regole complete"]];
const SRD_BASE="https://github.com/seansbox/daggerheart-srd#";
const RB_EXAMPLES=["Come funziona la Paura del GM?","Quando un PG segna Stress e non può?","Quanti punti battaglia servono per un incontro?","Come funziona un tiro di gruppo?","Cosa succede se un riposo viene interrotto?","Quanto danno fa una caduta?"];

/* ---------- cheat sheet ---------- */
const rvRef=p=>`<span class="rv-ref" title="Dove si trova nel manuale (SRD)">SRD › ${esc(p)}</span>`;
const rvCard=(t,body,ref,wide)=>`<section class="panel rv-card ${wide?"wide":""}"><h4>${t}</h4>${body}${ref?rvRef(ref):""}</section>`;
function rvCheat(){
  const outcomes=`<table class="rv-t"><thead><tr><th>Esito</th><th>Che succede</th><th>Mossa GM</th></tr></thead><tbody>
   <tr><td><b>Successo con Speranza</b><br><span class="muted">«Sì, e…»</span></td><td>Il PG ottiene 1 Speranza.</td><td>Il mondo reagisce al successo.</td></tr>
   <tr><td><b>Successo con Paura</b><br><span class="muted">«Sì, ma…»</span></td><td>Riesce, ma il GM ottiene 1 Paura.</td><td>Mossa <b>morbida</b>: costo, complicazione, Stress, un avversario attacca.</td></tr>
   <tr><td><b>Fallimento con Speranza</b><br><span class="muted">«No, ma…»</span></td><td>Il PG ottiene 1 Speranza.</td><td>Mossa <b>minore</b>, come sopra.</td></tr>
   <tr><td><b>Fallimento con Paura</b><br><span class="muted">«No, e…»</span></td><td>Il GM ottiene 1 Paura.</td><td>Mossa <b>dura</b>: pericolo immediato, più avversari addosso, gruppo diviso, occasione persa.</td></tr>
   <tr><td><b>Critico</b> (dadi uguali)</td><td>Successo automatico, +1 Speranza, −1 Stress. Conta «con Speranza».</td><td>Dai al PG un vantaggio in più. In attacco: danni critici.</td></tr></tbody></table>
   <p class="small">Tiro d'azione: <b>2d12</b> (Speranza + Paura) + tratto + bonus ≥ Difficoltà. Dichiara Esperienze, aiuti e dadi extra <b>prima</b> di tirare.</p>`;
  const gm=`<ul class="tight small"><li><b>Quando:</b> tiro con Paura, fallimento, conseguenza inevitabile, «occasione d'oro», i giocatori guardano a te.</li>
   <li><b>Morbide</b> con la Speranza, <b>dure</b> con la Paura. Una mossa ha sempre un impatto: «non succede niente» non esiste.</li>
   <li><b>Idee:</b> nuovo ostacolo o nemico · chiedi al giocatore cosa succede · segna Stress · un avversario attacca · alza la posta · separa il gruppo · mostra i danni collaterali · usa il passato di un PG.</li>
   <li><b>Avversario sotto i riflettori:</b> si muove entro Vicina e fa l'attacco standard <i>o</i> un'azione · toglie una condizione · scatta fino a Lontana/Molto Lontana.</li>
   <li>Altri riflettori costano <b>1 Paura</b> ciascuno. Dopo la tua mossa i riflettori tornano ai PG.</li></ul>`;
  const fear=`<ul class="tight small"><li><b>Inizio campagna:</b> 1 Paura per PG · <b>massimo 12</b> · si conserva tra le sessioni.</li>
   <li><b>Ottieni:</b> tiro con Paura · riposo · effetti che lo dicono.</li>
   <li><b>Spendi 1 per:</b> rubare i riflettori e fare una mossa · una mossa in più · Fear Feature di avversario o ambiente · aggiungere un'Esperienza dell'avversario al tiro.</li></ul>
   <table class="rv-t"><thead><tr><th>Scena</th><th>Paura da spendere</th></tr></thead><tbody>
   <tr><td>Incidentale</td><td>0–1</td></tr><tr><td>Minore</td><td>1–3</td></tr><tr><td>Standard</td><td>2–4</td></tr><tr><td>Maggiore (Solo/Leader)</td><td>4–8</td></tr><tr><td>Climax</td><td>6–12</td></tr></tbody></table>
   <p class="small muted">Con molta Paura: spendi in fretta, spesso, in grande.</p>`;
  const diff=`<table class="rv-t"><thead><tr><th>Diff.</th><th>Esempio di scala</th></tr></thead><tbody>
   <tr><td class="mono">5</td><td>Molto facile</td></tr><tr><td class="mono">10</td><td>Normale, sotto un po' di pressione</td></tr><tr><td class="mono">15</td><td>Impegnativo</td></tr><tr><td class="mono">20</td><td>Difficile</td></tr><tr><td class="mono">25</td><td>Quasi impossibile</td></tr><tr><td class="mono">30</td><td>Leggendario</td></tr></tbody></table>
   <ul class="tight small"><li>Avversari <b>Difficoltà</b> per tier: <span class="mono">11 · 14 · 17 · 20</span>. ATK <span class="mono">+1 · +2 · +3 · +4</span>.</li>
   <li>Meglio dare <b>vantaggio/svantaggio</b> (d6) che cambiare la Difficoltà.</li><li>Un tiro contro un avversario che non è un attacco: Difficoltà + (se pertinente) il bonus di una sua Esperienza.</li>
   <li>Se il successo sarebbe banale o il fallimento noioso: niente tiro.</li></ul>`;
  const atk=`<ul class="tight small"><li><b>PG:</b> tiro d'attacco con il tratto dell'arma contro la <b>Difficoltà</b> del bersaglio. Danni: <b>Competenza × dadi dell'arma + modificatore</b>. A mani nude: Competenza d4 (Forza o Finezza).</li>
   <li><b>Incantesimi:</b> tiro Incantesimo; se danneggia conta come attacco. Danni da tratto Incantesimo: tanti dadi quanto il tratto (se ≤ +0 non tiri).</li>
   <li><b>Critico:</b> tira i danni e <b>aggiungi il massimo</b> dei dadi (non del modificatore).</li>
   <li><b>Avversario:</b> d20 + ATK contro l'<b>Evasione</b>. 20 naturale = critico: aggiungi il massimo dei dadi.</li>
   <li><b>Più bersagli:</b> un solo tiro d'attacco e un solo tiro danni, applicati a ciascuno.</li><li>Danni da più fonti simultanee: si sommano prima di confrontarli con le soglie.</li></ul>`;
  const thr=`<table class="rv-t"><thead><tr><th>Danno finale</th><th>PF segnati</th></tr></thead><tbody>
   <tr><td>sotto la soglia Grave</td><td class="mono">1</td></tr><tr><td>≥ Grave</td><td class="mono">2</td></tr><tr><td>≥ Severa</td><td class="mono">3</td></tr></tbody></table>
   <ul class="tight small"><li>Soglie PG = soglie dell'armatura + <b>livello</b>. Senza armatura: Grave = livello, Severa = 2 × livello.</li>
   <li><b>Armatura:</b> segna 1 slot per ridurre la gravità di <b>una</b> soglia (Severo→Grave→Minore→niente).</li>
   <li><b>Resistenza</b> dimezza (prima delle soglie e dell'Armatura) · <b>Immunità</b> ignora · <b>Danno diretto</b> non si riduce con l'Armatura.</li>
   <li>Opzionale, Danni massicci: danno ≥ 2 × Severa → 4 PF.</li><li>Ultimo PF segnato: <b>mossa di morte</b>.</li></ul>`;
  const stress=`<ul class="tight small"><li>6 slot di Stress iniziali (max 12).</li><li><b>Ultimo Stress segnato → Vulnerabile</b> finché non ne cancelli almeno 1.</li>
   <li>Devi segnare Stress e non puoi → segni <b>1 PF</b>.</li><li>Con tutto lo Stress segnato non puoi usare mosse che costano Stress.</li><li>Il GM può far segnare Stress come mossa o come costo di un tiro.</li></ul>`;
  const cond=`<ul class="tight small"><li><b>Nascosto:</b> tiri contro di te con svantaggio. Finisce se un avversario si sposta dove ti vedrebbe, se ti muovi in vista o se attacchi.</li>
   <li><b>Trattenuto:</b> non puoi muoverti, ma puoi agire da dove sei.</li><li><b>Vulnerabile:</b> tiri contro di te con vantaggio.</li>
   <li><b>Temporanee:</b> si tolgono con una mossa. PG: tiro d'azione riuscito. Avversario: usa i riflettori, nessun tiro.</li>
   <li>La stessa condizione non si applica due volte allo stesso bersaglio.</li></ul>`;
  const adv=`<ul class="tight small"><li><b>Vantaggio:</b> +d6 al totale · <b>svantaggio:</b> −d6. Si annullano uno a uno.</li>
   <li><b>Aiutare un alleato:</b> 1 Speranza, l'alleato aggiunge un d6; con più aiutanti conta solo il più alto.</li>
   <li><b>Esperienza:</b> 1 Speranza per aggiungere il suo bonus (anche più Esperienze).</li>
   <li><b>Tiro di gruppo:</b> un PG guida; gli altri fanno tiri reazione: +1 al tiro del capo per ogni successo, −1 per ogni fallimento.</li>
   <li><b>Tiro di squadra (Tag Team):</b> 3 Speranza, una volta a sessione per PG; si tengono i risultati di uno dei due tiri.</li>
   <li><b>Avversario con vantaggio/svantaggio:</b> tira due d20 e tiene il più alto/basso.</li></ul>`;
  const hope=`<ul class="tight small"><li>Ogni PG parte con <b>2 Speranza</b>, massimo <b>6</b>, si conserva tra le sessioni.</li>
   <li><b>Spende per:</b> aiutare un alleato · usare un'Esperienza · tiro di squadra (3) · capacità di Speranza (di classe: 3).</li>
   <li><b>Tiro reazione:</b> non genera Speranza né Paura, non scatena mosse GM, non si può aiutare. Critico: ignori l'effetto negativo.</li>
   <li>Non puoi spendere Speranza o segnare Stress più volte sulla stessa capacità nello stesso tiro.</li></ul>`;
  const range=`<table class="rv-t"><thead><tr><th>Portata</th><th>Distanza</th></tr></thead><tbody>
   <tr><td>Mischia</td><td>a portata di mano</td></tr><tr><td>Molto Vicina</td><td>≈ 5–10 piedi (1,5–3 m)</td></tr><tr><td>Vicina</td><td>≈ 10–30 piedi (3–9 m)</td></tr><tr><td>Lontana</td><td>≈ 30–100 piedi (9–30 m)</td></tr><tr><td>Molto Lontana</td><td>≈ 100–300 piedi (30–90 m)</td></tr></tbody></table>
   <ul class="tight small"><li>Sotto pressione ti sposti entro <b>Vicina</b> come parte di un'azione; oltre, o senza azione: tiro di <b>Agilità</b>.</li>
   <li>Copertura parziale: attacchi con svantaggio. Effetti ad area: bersagli entro Molto Vicina da un punto.</li>
   <li>Griglia opzionale: 1 · 3 · 6 · 12 caselle.</li><li>Gli avversari si muovono gratis entro Vicina; fino a Molto Lontana è un'azione.</li></ul>`;
  const rest=`<table class="rv-t"><thead><tr><th></th><th>Riposo breve (~1 h)</th><th>Riposo lungo</th></tr></thead><tbody>
   <tr><td>Mosse</td><td colspan="2">2 a testa (anche la stessa due volte). Carte tra dotazione e deposito: gratis.</td></tr>
   <tr><td>PF</td><td>1d4 + tier</td><td>tutti</td></tr><tr><td>Stress</td><td>1d4 + tier</td><td>tutto</td></tr><tr><td>Armatura</td><td>1d4 + tier slot</td><td>tutti</td></tr>
   <tr><td>Altro</td><td>Prepararsi: +1 Speranza (+2 se insieme)</td><td>Prepararsi, oppure lavorare a un progetto</td></tr>
   <tr><td>GM</td><td>+1d4 Paura</td><td>+1d4 + n° PG Paura, e avanza un conto a lungo termine</td></tr></tbody></table>
   <ul class="tight small"><li>Tre riposi brevi di fila → il prossimo è <b>lungo</b>.</li><li>Breve interrotto: nessun beneficio · lungo interrotto: vale come breve.</li></ul>`;
  const death=`<ul class="tight small"><li><b>Gloria Finale:</b> un'ultima azione, critico automatico (col GM), poi muore.</li>
   <li><b>Evitare la Morte:</b> sviene; poi tira il dado Speranza: ≤ livello = <b>cicatrice</b> (perde per sempre uno slot Speranza). Si riprende quando un alleato cancella almeno 1 PF o dopo un riposo lungo.</li>
   <li><b>Rischiare Tutto:</b> tira i dadi della Dualità. Speranza più alto: cancelli PF/Stress pari al dado (divisibili). Paura più alto: muore. Dadi uguali: cancelli tutto.</li>
   <li>Se muore: nuovo PG al livello del gruppo prima della prossima sessione.</li></ul>`;
  const cd=`<ul class="tight small"><li><b>Standard:</b> scende di 1 a ogni tiro d'azione dei PG. «Conto alla rovescia [n]» = standard da n.</li><li>A 0 scatta l'effetto.</li></ul>
   <table class="rv-t"><thead><tr><th>Esito</th><th>Progresso</th><th>Conseguenza</th></tr></thead><tbody>
   <tr><td>Fallimento con Paura</td><td>–</td><td class="mono">−3</td></tr><tr><td>Fallimento con Speranza</td><td>–</td><td class="mono">−2</td></tr>
   <tr><td>Successo con Paura</td><td class="mono">−1</td><td class="mono">−1</td></tr><tr><td>Successo con Speranza</td><td class="mono">−2</td><td>–</td></tr><tr><td>Critico</td><td class="mono">−3</td><td>–</td></tr></tbody></table>
   <p class="small muted">Varianti: valore casuale, a ciclo (loop), crescenti/decrescenti, collegati, a lungo termine (avanzano coi riposi).</p>`;
  const enc=`<ul class="tight small"><li><b>Punti battaglia</b> = 3 × PG in combattimento + 2.</li><li><b>−1</b> scontro più facile/breve · <b>−2</b> due o più Solo · <b>−2</b> danni extra a tutti (+1d4 o +2) · <b>+1</b> avversario di tier inferiore · <b>+1</b> nessun Bruiser/Horde/Leader/Solo · <b>+2</b> più difficile/lungo.</li></ul>
   <table class="rv-t"><thead><tr><th>Avversario</th><th>Costo</th></tr></thead><tbody>
   <tr><td>Gruppo di Minion (= n° PG)</td><td class="mono">1</td></tr><tr><td>Sociale / Supporto</td><td class="mono">1</td></tr><tr><td>Horde / Ranged / Skulk / Standard</td><td class="mono">2</td></tr><tr><td>Leader</td><td class="mono">3</td></tr><tr><td>Bruiser</td><td class="mono">4</td></tr><tr><td>Solo</td><td class="mono">5</td></tr></tbody></table>
   <p class="small muted">Soglie di riferimento per tier (Grave/Severa): 7/12 · 10/20 · 20/32 · 25/45.</p>`;
  const lvl=`<ul class="tight small"><li>Si sale quando il GM decide (circa ogni 3 sessioni), tutti insieme. <b>Tier:</b> 1 = livello 1 · 2 = 2–4 · 3 = 5–7 · 4 = 8–10.</li>
   <li><b>Livelli 2, 5, 8:</b> nuova Esperienza +2 e Competenza +1 (a 5 e 8 si azzerano anche i tratti segnati).</li>
   <li><b>Ogni livello:</b> 2 avanzamenti → +1 a tutte le soglie → una nuova carta dominio. Multiclasse dal livello 5.</li></ul>`;
  const misc=`<ul class="tight small"><li><b>Arrotonda per eccesso.</b> Nel dubbio, a favore dei PG.</li><li><b>Ritiro:</b> si tiene sempre il nuovo risultato.</li>
   <li><b>Effetti:</b> tutto si somma tranne condizioni e vantaggio/svantaggio. L'ordine lo decide chi controlla gli effetti.</li>
   <li><b>Caduta:</b> Molto Vicina 1d10+3 · Vicina 1d20+5 · Lontana o più 1d100+15 (o morte, a tua scelta) — fisici. Collisione: 1d20+5 <b>diretti</b>.</li>
   <li><b>Sott'acqua:</b> attacchi con svantaggio; per chi non respira, conto alla rovescia (3) che avanza a ogni azione.</li>
   <li><b>Tiro del destino:</b> un giocatore tira un solo dado (Speranza o Paura) e lo interpreti come hai stabilito.</li>
   <li><b>Conflitto tra PG:</b> parlatene; attacco contro un PG = contro la sua Evasione; altri tiri = tiro di chi agisce contro il tiro reazione del bersaglio.</li></ul>`;
  const nav=`<nav class="rv-jump" aria-label="Sezioni della cheat sheet"><button class="cdc" data-a="rv-jump" data-k="rv-g1">Al tavolo</button><button class="cdc" data-a="rv-jump" data-k="rv-g2">Personaggi</button><button class="cdc" data-a="rv-jump" data-k="rv-g3">Scena e campagna</button></nav>`;
  return `${nav}
  <h3 class="rv-g" id="rv-g1">Al tavolo</h3><div class="rv-grid">
   ${rvCard("Esito di un tiro",outcomes,"Core Mechanics › Making Moves & Taking Action · Running an Adventure › Core GM Mechanics › Making Moves",true)}
   ${rvCard("Quando e come fai una mossa",gm,"Core Mechanics › GM Moves and Adversary Actions · Running an Adventure › Core GM Mechanics › Making Moves")}
   ${rvCard("Paura",fear,"Running an Adventure › Core GM Mechanics › Using Fear")}
   ${rvCard("Difficoltà",diff,"Running an Adventure › Core GM Mechanics › Difficulty Benchmarks")}
   ${rvCard("Attacchi e danni",atk,"Core Mechanics › Attacking · Running an Adventure › Core GM Mechanics › Rolling Dice")}
   ${rvCard("Vantaggio, aiuto e tiri speciali",adv,"Core Mechanics › Advantage & Disadvantage · Special Rolls")}</div>
  <h3 class="rv-g" id="rv-g2">Personaggi</h3><div class="rv-grid">
   ${rvCard("PF, soglie e Armatura",thr,"Core Mechanics › Combat › Hit Points & Damage Thresholds · Armor › Reducing Incoming Damage")}
   ${rvCard("Stress",stress,"Core Mechanics › Stress")}
   ${rvCard("Condizioni",cond,"Core Mechanics › Conditions")}
   ${rvCard("Speranza e tiri reazione",hope,"Core Mechanics › Hope & Fear · Special Rolls › Reaction Rolls")}
   ${rvCard("Mosse di morte",death,"Core Mechanics › Death")}
   ${rvCard("Avanzamento",lvl,"Core Mechanics › Leveling Up")}</div>
  <h3 class="rv-g" id="rv-g3">Scena e campagna</h3><div class="rv-grid">
   ${rvCard("Distanze e movimento",range,"Core Mechanics › Maps, Range, and Movement")}
   ${rvCard("Riposi",rest,"Core Mechanics › Downtime")}
   ${rvCard("Conti alla rovescia",cd,"Running an Adventure › Core GM Mechanics › Countdowns")}
   ${rvCard("Costruire un incontro",enc,"Running an Adventure › Adversaries and Environments › Building Balanced Encounters")}
   ${rvCard("Regole sparse",misc,"Core Mechanics › Additional Rules · Running an Adventure › Optional GM Mechanics",true)}</div>
  <p class="xsmall muted">Riassunto in italiano dell'SRD 1.0 di Daggerheart (© Critical Role LLC, Public Game Content, licenza Darrington Press Community Gaming). Per il testo originale usa «Chiedi al manuale».</p>`;
}

/* ---------- ricerca nel manuale (sul dispositivo, nessun token) ---------- */
// termini italiani del tavolo → parole del manuale inglese. «x*» = prefisso, altrimenti parola intera
const RB_GLOSS=[["speran*","hope"],["paur*","fear"],["stress*","stress"],["armatur*","armor armour slot"],["evasion*","evasion"],["sogli*","threshold major severe"],["grave","major"],["gravi","major"],["severa","severe"],["severi","severe"],
 ["dann*","damage"],["ferit*","hit points wound"],["ferite","hit points"],["pf","hit points"],["vantagg*","advantage"],["svantagg*","disadvantage"],["esperienz*","experience"],["ripos*","rest downtime short long"],["cur*","clear tend heal"],["guar*","clear heal"],
 ["mort*","death die"],["muor*","death die"],["muoi*","death die"],["muoia*","death die"],["pg","pc character"],["personagg*","pc character"],["giocator*","player"],["moribond*","death"],["attacc*","attack"],["tiro","roll"],["tiri","roll"],["dado","die dice"],["dadi","dice die"],["critic*","critical"],["condizion*","condition"],["vulnerab*","vulnerable"],["nascost*","hidden"],["trattenut*","restrained"],
 ["distanz*","range distance"],["portata","range"],["mischia","melee"],["vicin*","close"],["lontan*","far"],["rovescia","countdown"],["conto","countdown"],["conti","countdown"],["contator*","countdown"],["livell*","level"],["avanzament*","advancement level up"],["multiclass*","multiclass"],
 ["equipaggiament*","equipment"],["arm","weapon"],["armi","weapon"],["arma","weapon"],["scudo","armor"],["oro","gold"],["bottin*","loot"],["ricompens*","rewards"],["scen*","scene"],["riflettor*","spotlight"],["mossa","move"],["mosse","moves"],["gm","gm"],["master","gm"],
 ["avversar*","adversary adversaries"],["nemic*","adversary adversaries"],["mostr*","adversary"],["ambient*","environment"],["gregar*","minion"],["incontr*","encounter battle"],["battaglia","battle"],["punti","points"],["difficolt*","difficulty"],["tratt","trait"],["tratto","trait"],["tratti","traits"],
 ["agilit*","agility"],["forza","strength"],["finezza","finesse"],["istinto","instinct"],["presenza","presence"],["conoscenza","knowledge"],["incantesim*","spellcast spell"],["magi*","magic spell"],["fisic*","physical"],["resisten*","resistance"],["immun*","immunity"],["diretto","direct"],
 ["aiut*","help ally"],["squadra","tag team"],["gruppo","group"],["cadut*","falling fall"],["cad*","falling fall"],["acqua","underwater water"],["subacque*","underwater"],["copertur*","cover"],["muov*","movement move"],["movimento","movement"],["scatt*","sprint"],["sorpres*","surprise"],
 ["iniziativ*","turn order spotlight"],["turn*","turn order spotlight"],["destino","fate"],["riposare","rest"],["progett*","project"],["lungo","long"],["breve","short"],["interrott*","interrupted"],["cicatric*","scar"],["gloria","blaze glory"],["rischi*","risk"],["evitare","avoid"],
 ["classe","class"],["classi","class"],["sottoclass*","subclass"],["stirpe","ancestry"],["stirpi","ancestry"],["comunit*","community"],["dominio","domain"],["domini","domain"],["carta","card"],["carte","cards"],["deposito","vault loadout"],["dotazione","loadout"],["competenza","proficiency"],
 ["ritir*","reroll"],["arrotond*","rounding"],["sommar*","stacking"],["cumul*","stacking"],["somma*","stacking"],["effett*","effect"],["durata","duration"],["combattiment*","combat"],["combatt*","combat"],["passiv*","passive"],["reazion*","reaction"],["narrativ*","fiction"],["mondo","world"],["png","npc"],["npc","npc"],];
const RB_STOP=new Set(("il lo la i gli le un uno una di a da in con su per tra fra e o ma che chi cosa come quando quanto quanti quanta quante quale quali dove se si non è sono ho ha hanno posso può puoi devo deve fa fare fanno del della dei delle dello degli nel nella nei nelle sul sulla al alla ai alle allo agli mi ti ci vi mio mia suo sua loro anche più succede succedere accade accadere del dal dalla dai dalle cosa fa funziona funzionano regola regole the an of to is are do does can my you your what how when which for on and or if it its be with as at by from this that there their they them has have not").split(" "));
const rbNorm=s=>String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
const rbStem=w=>w.length>4?w.replace(/(ing|ed|es|s)$/,""):w;
const rbToks=s=>rbNorm(s).split(/[^a-z0-9]+/).filter(w=>w.length>1&&!RB_STOP.has(w));
let RBX=null;
function rbIndex(){
  if(RBX)return RBX;
  const docs=SRD_CHUNKS.map((c,i)=>{const tf=new Map(),add=(t,wt)=>{for(const w of rbToks(t).map(rbStem))tf.set(w,(tf.get(w)||0)+wt)};add(c.t,1);add(c.h,4);
    let len=0;tf.forEach(v=>len+=v);return {i,tf,len}});
  const df=new Map();docs.forEach(d=>d.tf.forEach((_,w)=>df.set(w,(df.get(w)||0)+1)));
  const avg=docs.reduce((a,d)=>a+d.len,0)/docs.length;
  return RBX={docs,df,avg,n:docs.length};
}
function rbQuery(q){
  const out=new Map(),words=rbToks(q);
  const put=(w,wt)=>{w=rbStem(w);out.set(w,Math.max(out.get(w)||0,wt))};
  for(const w of words){
    put(w,1);
    for(const [k,en] of RB_GLOSS){const pre=k.endsWith("*"),key=pre?k.slice(0,-1):k;if(pre?w.startsWith(key)&&key.length>=3:w===key)rbToks(en).forEach(e=>put(e,.9))}
  }
  return out;
}
function rbSearch(q,k=4){
  const X=rbIndex(),qt=rbQuery(q);if(!qt.size)return [];
  const k1=1.2,b=.75,res=[];
  for(const d of X.docs){
    let s=0;
    qt.forEach((wt,w)=>{const f=d.tf.get(w);if(!f)return;const n=X.df.get(w),idf=Math.log(1+(X.n-n+.5)/(n+.5));s+=wt*idf*(f*(k1+1))/(f+k1*(1-b+b*d.len/X.avg))});
    if(s>0)res.push({c:SRD_CHUNKS[d.i],s})
  }
  res.sort((a,b)=>b.s-a.s);
  if(!res.length||res[0].s<1.2)return [];
  return res.slice(0,k).filter((r,i)=>i===0||r.s>=res[0].s*.5);
}
const rbPath=c=>c.h+(c.p?` (${c.p})`:"");
function rbPrompt(q,hits){
  return `Assistente regole Daggerheart per il GM. Rispondi in italiano, massimo 90 parole, usando SOLO gli estratti del manuale (SRD) qui sotto. Dopo ogni affermazione metti il numero dell'estratto, es. [2]. Includi una citazione letterale breve (inglese, massimo 25 parole) tra «», seguita dal numero. Se gli estratti non bastano, scrivilo e non inventare.
Domanda: ${q}
${hits.map((h,i)=>`[${i+1}] ${rbPath(h.c)}\n${h.c.t}`).join("\n")}`;
}
async function rbAsk(q){
  q=String(q||"").trim();if(!q||RB.busy)return;
  RB.q=q;RB.ans="";RB.err="";RB.cited=[];RB.tier="";RB.open=null;
  const hits=rbSearch(q);RB.srcs=hits.map(h=>h.c);
  if(!hits.length){RB.err="Non trovo passaggi del manuale su questo. Prova con altre parole (anche in inglese, come «damage threshold»).";rbPaint();return}
  const prompt=rbPrompt(q,hits);RB.tokens=Math.round(prompt.length/3.6);
  let sample=null;try{sample=window.claude?.use?await window.claude.use("sample"):null}catch(e){sample=null}
  if(!sample){RB.err="Per la risposta scritta serve Claude: apri il tracker su claude.ai. Intanto ecco i passaggi trovati.";rbPaint();return}
  RB.busy=true;RB.ctl=new AbortController();rbPaint();
  try{
    const r=await sample(prompt,{modelTier:"quick",signal:RB.ctl.signal,onText:({text})=>{RB.ans=text;rbPaint()}});
    RB.ans=r.text;RB.tier=r.modelTierApplied||"quick";if(r.truncated)RB.err="Risposta troncata: i passaggi qui sotto sono completi.";
  }catch(e){
    if(e&&e.text&&e.code!=="refused")RB.ans=e.text;else RB.ans="";
    const m={not_granted:"Accesso a Claude negato per questa pagina: puoi riattivarlo dal menu Permessi dell'artefatto.",rate_limited:"Troppe richieste ravvicinate: riprova tra poco.",session_expired:"Sessione scaduta: ricarica la pagina.",sampling_disabled:"Claude non è attivo per questo account.",cancelled:"Interrotto."};
    RB.err=(m[e&&e.code]||"La risposta non è arrivata. I passaggi qui sotto restano consultabili.");
  }
  RB.busy=false;RB.ctl=null;
  RB.cited=[...new Set([...RB.ans.matchAll(/\[(\d)\]/g)].map(m=>+m[1]).filter(n=>n>=1&&n<=RB.srcs.length))];
  rbPaint();
}
function rbAnswerHTML(){
  if(!RB.ans)return "";
  return esc(RB.ans).replace(/\[(\d)\]/g,(m,n)=>+n>=1&&+n<=RB.srcs.length?`<sup><button class="lnk rb-ref" data-a="rb-open" data-n="${n}">[${n}]</button></sup>`:m).replace(/«([^»]+)»/g,'<q class="rb-q">$1</q>').replace(/\n/g,"<br>");
}
function rbSourcesHTML(){
  if(!RB.srcs.length)return "";
  return `<div class="rb-srcs"><span class="lab">Passaggi del manuale usati${RB.cited.length?" · in evidenza quelli citati":""}</span>${RB.srcs.map((c,i)=>{const n=i+1;
    return `<details class="rb-src ${RB.cited.includes(n)?"cited":""}" id="rb-s${n}" ${RB.open===n?"open":""}><summary><b class="mono">[${n}]</b> <span>${esc(rbPath(c))}</span><a class="rb-ext" href="${SRD_BASE}${esc(c.a)}" target="_blank" rel="noopener noreferrer" title="Apri questa sezione dell'SRD su GitHub">SRD ↗</a></summary><div class="rb-txt">${esc(c.t).replace(/\n/g,"<br>")}</div></details>`}).join("")}</div>`;
}
function rbPaint(){
  const el=document.getElementById("rb-out");if(!el)return;
  const btn=document.getElementById("rb-btn");if(btn){btn.disabled=RB.busy;btn.textContent=RB.busy?"Cerco…":"Chiedi"}
  const stop=RB.busy?`<button class="btn xs" data-a="rb-stop">Interrompi</button>`:"";
  const think=RB.busy&&!RB.ans?`<p class="small muted blink">Sto leggendo i passaggi…</p>`:"";
  const cost=RB.srcs.length&&RB.tokens?`<p class="xsmall muted">${RB.srcs.length} passagg${RB.srcs.length===1?"io":"i"} inviati (≈ ${RB.tokens.toLocaleString("it-IT")} token in ingresso) · modello veloce${RB.tier&&RB.tier!=="quick"?` (risposto dal livello «${esc(RB.tier)}»)`:""} · ricerca fatta sul dispositivo.</p>`:"";
  el.innerHTML=`${RB.q?`<p class="rb-qq"><span class="lab">Domanda</span> ${esc(RB.q)}</p>`:""}${RB.ans?`<div class="rb-a">${rbAnswerHTML()}</div>`:""}${think}${RB.err?`<div class="${RB.srcs.length?"note":"warn"} small">${esc(RB.err)}</div>`:""}${stop}${cost}${rbSourcesHTML()}`;
}
function rvAsk(){
  return `<div class="rbot stack"><div class="panel stack" style="gap:10px"><h4>Chiedi al manuale</h4>
   <p class="small muted" style="margin:0">Cerca nell'SRD ufficiale di Daggerheart (in inglese) e risponde in italiano citando i passaggi, con la sezione in cui si trovano. Usa un modello veloce e pochi passaggi per spendere poco.</p>
   <div class="row"><input type="text" id="rb-q" class="rb-in" value="${esc(RB.q)}" placeholder="Es. Quanto danno fa una caduta da lontano?" autocomplete="off" aria-label="Domanda sulle regole"><button class="btn pri" id="rb-btn" data-a="rb-ask">Chiedi</button></div></div>
   <div id="rb-out" class="stack" style="gap:10px"></div></div>`;
}

/* ---------- regole complete (riordinate per argomento) ---------- */
function rvRef2(){
  const g=(t,cards)=>`<h3 class="rv-g">${t}</h3><div class="grid2">${cards.map(([h,b])=>`<div class="panel"><h4>${h}</h4>${b}</div>`).join("")}</div>`;
  return `<div class="stack">
  ${g("Tirare i dadi",[
   ["Tiro d'azione","<p>Tira 2d12 (Speranza e Paura), somma il tratto e i bonus: ≥ Difficoltà è un successo.</p><ul class='tight'><li><b>Con Speranza</b>: il PG ottiene 1 Speranza.</li><li><b>Con Paura</b>: il GM ottiene 1 Paura e di solito fa una mossa.</li><li><b>Critico</b> (dadi uguali): successo automatico, +1 Speranza, −1 Stress; in attacco danni massimi più il tiro.</li></ul>"],
   ["Vantaggio, Esperienze, Aiuto","<ul class='tight'><li><b>Vantaggio</b> +d6, <b>svantaggio</b> −d6; si annullano.</li><li><b>Esperienza</b>: 1 Speranza per aggiungere il bonus (+2).</li><li><b>Aiutare</b>: 1 Speranza per dare un d6 di vantaggio a un alleato.</li><li><b>Tiro di Squadra</b>: 3 Speranza; tirano due PG, si tiene il migliore.</li></ul>"],
   ["Tiri reazione","<p>Per resistere a un effetto. Non generano Speranza né Paura.</p>"]])}
  ${g("Combattimento",[
   ["Soglie di danno","<p>Sotto la soglia <b>Grave</b>: 1 PF. Da Grave: 2 PF. Da <b>Severa</b>: 3 PF. Le soglie vengono dall'armatura più il livello. Uno slot <b>Armatura</b> riduce la gravità di una soglia. Se devi segnare Stress e non puoi, segni 1 PF. All'ultimo PF: Mossa di Morte.</p>"],
   ["Attacchi","<p>I PG attaccano con il tratto dell'arma contro la Difficoltà dell'avversario; i danni usano i dadi dell'arma per la Competenza. Gli avversari tirano d20 + ATK contro l'Evasione del PG.</p>"],
   ["Condizioni","<ul class='tight'><li><b>Vulnerabile</b>: i tiri contro di te hanno vantaggio.</li><li><b>Trattenuto</b>: non puoi muoverti; essendo temporanea, si toglie con un'azione riuscita.</li><li><b>Nascosto</b>: i tiri contro di te hanno svantaggio.</li></ul>"],
   ["Distanze","<p>Mischia · Molto Vicina · Vicina · Lontana · Molto Lontana.</p>"]])}
  ${g("Fra una scena e l'altra",[
   ["Riposo breve","<p>Due mosse a testa tra Curare ferite (1d4+1 PF), Ricomporsi (1d4+1 Stress), Riparare armatura (1d4+1 slot), Prepararsi (+1 Speranza, +2 se insieme). Il GM ottiene 1d4 Paura.</p>"],
   ["Mosse di Morte","<ul class='tight'><li><b>Gloria Finale</b>: un'ultima azione con successo critico automatico, poi il PG muore.</li><li><b>Evitare la Morte</b>: perdi i sensi; tira il dado Speranza: se ≤ livello ottieni una cicatrice.</li><li><b>Rischiare Tutto</b>: tira i Dadi della Dualità. Speranza più alto: recuperi PF/Stress per il suo valore. Paura più alto: muori. Critico: recuperi tutto.</li></ul>"]])}
  ${g("Il GM",[
   ["Il GM e la Paura","<p>Il GM inizia con 1 Paura per PG (massimo 12). Spende Paura per mosse extra, per mettere altri avversari sotto i riflettori, per azioni che costano Paura e per complicazioni. Non c'è ordine di turno: i riflettori passano a chi agisce.</p>"],
   ["Scene","<p>Una scena ha un luogo, dei personaggi e una posta in gioco. Il GM la inquadra, fa domande ai giocatori per coinvolgerli, sposta i riflettori e la chiude quando la posta è risolta. Se i PG prendono una strada inattesa, nasce una nuova scena: qui la improvvisi alla fine di quella appena giocata.</p>"]])}
  </div>`;
}

function rulesView(){
  const t=RV.tab,tabs=`<nav class="rv-nav" role="tablist" aria-label="Sezioni delle regole">${RV_TABS.map(([k,l])=>`<button role="tab" class="${t===k?"on":""}" aria-selected="${t===k}" data-a="rv-tab" data-k="${k}">${l}</button>`).join("")}</nav>`;
  return `<div class="stack rv"><div class="cd-head"><h2>Regole</h2><p class="small muted">Per il GM: cheat sheet, risposte dal manuale con riferimenti, regole complete.</p></div>${tabs}${t==="cheat"?rvCheat():t==="ask"?rvAsk():rvRef2()}</div>`;
}
function rulesAfter(){if(RV.tab==="ask")rbPaint()}
const RULES_ACT={
 "rv-tab":o=>{RV.tab=o.k;render();rulesAfter();if(o.k==="ask")document.getElementById("rb-q")?.focus()},
 "rv-jump":o=>{document.getElementById(o.k)?.scrollIntoView({behavior:"smooth",block:"start"})},
 "rb-ask":()=>rbAsk(document.getElementById("rb-q")?.value),
 "rb-ex":o=>{const q=RB_EXAMPLES[+o.i];const i=document.getElementById("rb-q");if(i)i.value=q;rbAsk(q)},
 "rb-stop":()=>RB.ctl?.abort(),
 "rb-open":o=>{RB.open=+o.n;rbPaint();setTimeout(()=>document.getElementById("rb-s"+o.n)?.scrollIntoView({behavior:"smooth",block:"center"}),30)}
};
document.addEventListener("input",e=>{if(e.target.id==="rb-q")RB.q=e.target.value});
document.addEventListener("keydown",e=>{if(e.target.id==="rb-q"&&e.key==="Enter"){e.preventDefault();rbAsk(e.target.value)}});
Object.assign(A,RULES_ACT);
