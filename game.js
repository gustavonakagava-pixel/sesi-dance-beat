const EMBEDDED_BEATMAP = {song:'sesidance.mp3',bpm:129.2,duration:78.48,approachTime:1.8,notes:[{t:2.136,l:0},{t:2.577,l:2},{t:3.065,l:1},{t:3.553,l:3},{t:4.017,l:0},{t:4.481,l:1},{t:4.946,l:2},{t:5.41,l:0},{t:5.875,l:1},{t:6.339,l:2},{t:6.803,l:3},{t:7.291,l:1},{t:7.755,l:0},{t:8.22,l:2},{t:8.684,l:1},{t:9.172,l:3},{t:9.636,l:0},{t:10.077,l:1},{t:10.565,l:3},{t:11.029,l:0},{t:11.494,l:1},{t:11.981,l:2},{t:12.446,l:3},{t:12.91,l:1},{t:13.375,l:0},{t:13.816,l:2},{t:14.303,l:1},{t:14.768,l:3},{t:15.256,l:0},{t:15.72,l:3},{t:16.184,l:2},{t:16.672,l:0},{t:17.136,l:1},{t:17.601,l:2},{t:18.065,l:3},{t:18.53,l:1},{t:18.994,l:3},{t:19.458,l:3},{t:19.946,l:1},{t:20.41,l:3},{t:20.875,l:0},{t:21.339,l:3},{t:21.827,l:2},{t:22.291,l:0},{t:22.756,l:3},{t:23.22,l:3},{t:23.684,l:0},{t:24.149,l:1},{t:24.636,l:0},{t:25.101,l:2},{t:25.565,l:1},{t:26.03,l:3},{t:26.494,l:0},{t:26.982,l:1},{t:27.446,l:2},{t:27.91,l:0},{t:28.375,l:1},{t:28.839,l:2},{t:29.327,l:3},{t:29.791,l:1},{t:30.256,l:0},{t:30.72,l:2},{t:31.184,l:1},{t:31.672,l:3},{t:32.136,l:0},{t:32.601,l:1},{t:33.065,l:2},{t:33.53,l:0},{t:33.994,l:1},{t:34.458,l:2},{t:34.946,l:3},{t:35.41,l:1},{t:35.875,l:0},{t:36.339,l:2},{t:36.827,l:1},{t:37.291,l:3},{t:37.756,l:0},{t:38.22,l:1},{t:38.684,l:2},{t:39.172,l:0},{t:39.636,l:1},{t:40.101,l:2},{t:40.565,l:3},{t:41.03,l:1},{t:41.494,l:0},{t:41.958,l:2},{t:42.446,l:1},{t:42.91,l:3},{t:43.375,l:0},{t:43.839,l:1},{t:44.327,l:2},{t:44.791,l:0},{t:45.256,l:1},{t:45.72,l:2},{t:46.184,l:3},{t:46.672,l:1},{t:47.137,l:0},{t:47.601,l:2},{t:48.065,l:1},{t:48.53,l:3},{t:49.017,l:0},{t:49.459,l:1},{t:49.946,l:2},{t:50.411,l:0},{t:50.875,l:1},{t:51.339,l:2},{t:51.827,l:3},{t:52.291,l:1},{t:52.756,l:0},{t:53.22,l:2},{t:53.685,l:1},{t:54.149,l:3},{t:54.637,l:0},{t:55.101,l:1},{t:55.565,l:2},{t:56.03,l:0},{t:56.494,l:1},{t:56.959,l:2},{t:57.446,l:3},{t:57.911,l:1},{t:58.375,l:0},{t:58.839,l:2},{t:59.327,l:1},{t:59.791,l:3},{t:60.256,l:0},{t:60.72,l:1},{t:61.185,l:2},{t:61.672,l:0},{t:62.137,l:1},{t:62.601,l:2},{t:63.065,l:3},{t:63.53,l:1},{t:63.994,l:0},{t:64.482,l:2},{t:64.946,l:1},{t:65.411,l:3},{t:65.875,l:0},{t:66.339,l:1},{t:66.827,l:2},{t:67.291,l:0},{t:67.756,l:1},{t:68.22,l:2},{t:68.685,l:3},{t:69.172,l:1},{t:69.637,l:0},{t:70.101,l:2},{t:70.565,l:1},{t:71.03,l:3},{t:71.494,l:0},{t:71.982,l:1},{t:72.446,l:2},{t:72.911,l:0},{t:73.375,l:1},{t:73.839,l:2},{t:74.327,l:3},{t:74.791,l:1},{t:75.256,l:0}]};

/* ============================================================
   SESI DANCE BEAT — motor do jogo (com níveis e ranking)
   - Sincronização por audio.currentTime + relógio interno de reserva
   - 3 níveis: densidade de notas, velocidade e janelas de acerto
   - Ranking local persistente (localStorage) por aparelho
   ============================================================ */
(() => {
'use strict';

const ICONS = ['👏','🕺','💃','⭐'];

// ---------- níveis de dificuldade ----------
// approach: segundos que a nota leva para descer (maior = mais fácil)
// wPerfect/wGood: tolerância de acerto em segundos (maior = mais fácil)
// offset: compensa reação + latência de áudio (premia o toque "no que se vê/ouve")
// minGap: espaçamento mínimo entre notas ao filtrar (maior = menos notas)
const DIFFS = {
  facil:   { nome:'Fácil',   approach:2.6, wPerfect:0.160, wGood:0.320, offset:0.11, minGap:0.95, cor:'#39E66B' },
  medio:   { nome:'Médio',   approach:1.9, wPerfect:0.120, wGood:0.260, offset:0.10, minGap:0.48, cor:'#19F0FF' },
  dificil: { nome:'Difícil', approach:1.4, wPerfect:0.090, wGood:0.200, offset:0.09, minGap:0.00, cor:'#FF4D6D' },
};
const PTS_PERFECT = 100, PTS_GOOD = 50;

// valores ativos (definidos ao escolher o nível)
let APPROACH = DIFFS.medio.approach;
let W_PERFECT = DIFFS.medio.wPerfect;
let W_GOOD = DIFFS.medio.wGood;
let OFFSET = DIFFS.medio.offset;
let curDiffKey = 'medio';
let playerName = '';

// ---------- elementos ----------
const $ = s => document.querySelector(s);
const loader      = $('#loader');
const startScreen = $('#startScreen');
const gameScreen  = $('#gameScreen');
const resultScreen= $('#resultScreen');
const rankScreen  = $('#rankScreen');
const audio       = $('#audio');
const playfield   = $('#playfield');
const tracks      = [...document.querySelectorAll('.track')];
const hitline     = $('#hitline');
const hitTargets  = $('#hitTargets');
const pads        = [...document.querySelectorAll('.pad')];
const scoreVal    = $('#scoreVal');
const comboVal    = $('#comboVal');
const progressBar = $('#progressBar');
const comboDisplay= $('#comboDisplay');
const comboNum    = $('#comboNum');
const judgeFx     = $('#judgeFeedback');
const nameInput   = $('#nameInput');

// ---------- estado ----------
let beatmap = null;       // beatmap completo (todas as notas)
let notes = [];           // notas ativas da partida {t,l,el,judged}
let running = false, rafId = null;
let hitY = 0, fieldH = 0;
let score=0, combo=0, maxCombo=0;
let countPerfect=0, countGood=0, countMiss=0;

// relógio robusto
let clockStart=0, audioActive=false, lastAudioTime=0;
function songTime(){
  if(audioActive && !audio.paused && audio.currentTime>0) return audio.currentTime;
  return (performance.now()-clockStart)/1000;
}

// ---------- carregamento do beatmap ----------
async function loadBeatmap(){
  try{
    const r = await fetch('beatmap.json',{cache:'no-store'});
    if(r.ok){ const j=await r.json(); if(j&&j.notes&&j.notes.length) return normalize(j); }
  }catch(e){}
  return EMBEDDED_BEATMAP;
}
function normalize(j){
  return { song:j.song, bpm:j.bpm, duration:j.duration,
    notes:j.notes.map(n=>('t' in n)?n:{t:n.time,l:n.lane}) };
}
// filtra notas conforme o espaçamento mínimo do nível
function buildLevelNotes(diff){
  const all=[...beatmap.notes].sort((a,b)=>a.t-b.t);
  if(diff.minGap<=0) return all;
  const out=[]; let last=-99;
  for(const n of all){ if(n.t-last>=diff.minGap){ out.push(n); last=n.t; } }
  return out;
}

// ---------- dimensões ----------
function measure(){
  fieldH=playfield.clientHeight;
  hitY=Math.round(fieldH*0.82);
  hitline.style.top=hitY+'px';
  hitTargets.style.top=hitY+'px';
}
window.addEventListener('resize',()=>{ if(running) measure(); });

// ---------- seleção de nível ----------
function selectDiff(key){
  curDiffKey=key;
  const d=DIFFS[key];
  APPROACH=d.approach; W_PERFECT=d.wPerfect; W_GOOD=d.wGood; OFFSET=d.offset;
  document.querySelectorAll('.diff-card').forEach(c=>{
    c.classList.toggle('sel', c.dataset.diff===key);
  });
}
document.querySelectorAll('.diff-card').forEach(c=>{
  c.addEventListener('click',()=>selectDiff(c.dataset.diff));
});

// ---------- partida ----------
function buildNotes(){
  tracks.forEach(t=>t.querySelectorAll('.note').forEach(n=>n.remove()));
  const levelNotes=buildLevelNotes(DIFFS[curDiffKey]);
  notes=levelNotes.map(n=>{
    const el=document.createElement('div');
    el.className='note'; el.dataset.lane=n.l; el.textContent=ICONS[n.l];
    el.style.transform='translate3d(0,-120px,0)';
    tracks[n.l].appendChild(el);
    return {t:n.t,l:n.l,el,judged:false};
  });
}
function resetState(){
  score=0;combo=0;maxCombo=0;countPerfect=0;countGood=0;countMiss=0;
  scoreVal.textContent='0';comboVal.textContent='0';progressBar.style.width='0%';
}
function startGame(){
  const nm=(nameInput.value||'').trim();
  if(!nm){
    // sem nome não entra no ranking — pede o nome com destaque
    nameInput.classList.add('shake');
    $('#nameHint').textContent='Digite seu nome para entrar no ranking';
    nameInput.focus();
    setTimeout(()=>nameInput.classList.remove('shake'),400);
    show(startScreen);
    return;
  }
  $('#nameHint').textContent='';
  playerName=nm.slice(0,16);
  try{ localStorage.setItem('sesidanceLastName',playerName); }catch(e){}
  dynOffset=OFFSET; calSamples=0;   // recomeça a calibração de latência
  resetState();
  show(gameScreen);
  measure();
  buildNotes();
  audio.currentTime=0;
  clockStart=performance.now();
  audioActive=false;
  const p=audio.play();
  if(p&&p.then){
    p.then(()=>{ audioActive=true; clockStart=performance.now()-audio.currentTime*1000; })
     .catch(()=>{ audioActive=false; });
  }
  running=true;
  rafId=requestAnimationFrame(loop);
}

// ---------- loop 60 FPS ----------
function loop(){
  if(!running) return;
  const now=songTime();
  const dur=beatmap.duration||audio.duration||1;
  progressBar.style.width=Math.min(100,(now/dur)*100)+'%';

  for(const n of notes){
    if(n.judged) continue;
    const dt=n.t-now;
    if(dt>APPROACH){ n.el.style.opacity='0'; continue; }
    n.el.style.opacity='1';
    const progress=1-(dt/APPROACH);
    const y=progress*hitY-32;
    n.el.style.transform='translate3d(0,'+y+'px,0)';
    // só vira erro quando a nota realmente passou da janela de acerto
    if(now-OFFSET-n.t > W_GOOD+0.05){ n.judged=true; n.el.classList.add('gone'); registerMiss(); }
  }
  if(now>=dur){ endGame(); return; }
  rafId=requestAnimationFrame(loop);
}

// ---------- julgamento ----------
// Calibração automática de latência: cada aparelho tem um atraso próprio
// (tela + áudio). Medimos o atraso real dos toques do jogador e ajustamos
// a compensação sozinhos durante a partida (limitada a uma faixa segura).
let dynOffset=OFFSET, calSamples=0;
function learnLatency(delta){
  // delta = quando tocou - quando a nota cruzou a linha (em s)
  const d=Math.min(Math.max(delta,-0.10),0.50);   // descarta valores absurdos
  calSamples++;
  if(calSamples<3){ dynOffset=(dynOffset+d)/2; return; }   // converge rápido no começo
  dynOffset=Math.min(Math.max(0.75*dynOffset+0.25*d, 0), 0.45);
}
const RESCUE=0.60;   // raio (s) para considerar que o toque foi uma tentativa de nota

function judgeLane(lane){
  if(!running) return;
  const raw=songTime();
  const now=raw-dynOffset;            // compensa latência aprendida do aparelho
  let target=null,best=Infinity;
  for(const n of notes){
    if(n.judged||n.l!==lane) continue;
    const adt=Math.abs(n.t-now);
    if(adt<best){ best=adt; target=n; }
  }
  // toque solto: nenhuma nota por perto nessa pista -> ignora (sem ERRO falso)
  if(!target || best>RESCUE) return;
  // foi uma tentativa real: usa para calibrar a latência do aparelho
  learnLatency(raw-target.t);
  if(best>W_GOOD){ breakCombo(); feedback('ERRO','var(--erro)'); countMiss++; return; }
  target.judged=true; target.el.classList.add('gone');
  if(best<=W_PERFECT){ countPerfect++; addScore(PTS_PERFECT); combo++; feedback('PERFEITO','var(--perfeito)'); }
  else { countGood++; addScore(PTS_GOOD); combo++; feedback('BOM','var(--bom)'); }
  maxCombo=Math.max(maxCombo,combo); showCombo(); refreshHud();
}
function registerMiss(){ countMiss++; breakCombo(); feedback('ERRO','var(--erro)'); }
function addScore(base){ const mult=Math.min(2,1+Math.floor(combo/10)*0.1); score+=Math.round(base*mult); }
function breakCombo(){ combo=0; comboVal.textContent='0'; }
function refreshHud(){ scoreVal.textContent=score; comboVal.textContent=combo; }

// ---------- feedback ----------
function feedback(txt,color){
  judgeFx.textContent=txt; judgeFx.style.color=color; judgeFx.style.textShadow='0 0 14px '+color;
  judgeFx.classList.remove('show'); void judgeFx.offsetWidth; judgeFx.classList.add('show');
}
function showCombo(){
  if(combo<2){ comboDisplay.classList.remove('show'); return; }
  comboNum.textContent=combo;
  comboDisplay.classList.remove('show'); void comboDisplay.offsetWidth; comboDisplay.classList.add('show');
}
function flashPad(lane){ const p=pads[lane]; p.classList.add('flash'); setTimeout(()=>p.classList.remove('flash'),120); }

// ---------- entrada ----------
// A TELA INTEIRA do jogo é tocável: a coluna onde o dedo cai define a pista.
// Assim funciona tocar na nota, na linha, na pista ou nos botões de baixo.
// Cobrimos pointerdown + touchstart + mousedown (aparelhos variados disparam
// conjuntos diferentes) e um guard por pista descarta repiques do mesmo gesto.
const lastTap={};
function handleTap(lane){
  const t=performance.now();
  if(lastTap[lane] && (t-lastTap[lane])<70) return;  // repique do mesmo toque
  lastTap[lane]=t;
  flashPad(lane);
  judgeLane(lane);
}
function laneFromX(x){
  const w=window.innerWidth||1;
  return Math.max(0,Math.min(3,Math.floor((x/w)*4)));
}
gameScreen.addEventListener('pointerdown', e=>{
  if(!running) return;
  e.preventDefault();
  handleTap(laneFromX(e.clientX));
});
gameScreen.addEventListener('touchstart', e=>{
  if(!running) return;
  e.preventDefault();   // evita eventos de mouse sintéticos e scroll
  for(const t of e.changedTouches) handleTap(laneFromX(t.clientX));
},{passive:false});
gameScreen.addEventListener('mousedown', e=>{
  if(!running) return;
  handleTap(laneFromX(e.clientX));
});
const KEYMAP={'1':0,'2':1,'3':2,'4':3};
window.addEventListener('keydown',e=>{
  if(e.repeat) return;
  const lane=KEYMAP[e.key];
  if(lane!==undefined) handleTap(lane);
});

// ---------- fim de jogo + medalha ----------
function endGame(){
  if(!running) return;
  running=false; cancelAnimationFrame(rafId); audio.pause();
  const total=notes.length||1;
  const accValue=(countPerfect*1.0+countGood*0.6)/total;
  const accPct=Math.round(accValue*100);
  const medal=pickMedal(accPct);

  $('#rScore').textContent=score;
  $('#rAcc').textContent=accPct+'%';
  $('#rCombo').textContent=maxCombo;
  $('#rPerf').textContent=countPerfect;
  $('#rGood').textContent=countGood;
  $('#rMiss').textContent=countMiss;
  $('#rPlayer').textContent=playerName;
  $('#medalIcon').textContent=medal.icon;
  $('#medalName').textContent=medal.name;
  $('#medalSub').textContent=medal.sub;

  // salva no ranking local (reserva) e mostra a posição local imediata
  const entry={name:playerName,score,acc:accPct,combo:maxCombo,diff:curDiffKey,ts:Date.now()};
  const pos=saveScore(entry);
  const rk=loadRank();
  $('#rRankPos').textContent='#'+pos+' de '+rk.length;
  $('#rDiffTag').textContent=DIFFS[curDiffKey].nome;
  $('#rDiffTag').style.color=DIFFS[curDiffKey].cor;
  // envia para o ranking geral (online), se configurado — sem travar a tela
  sendOnline(entry);

  show(resultScreen);
}
function pickMedal(acc){
  if(acc>=96) return {icon:'🌟',name:'Estrela SESI Dance',sub:'Performance impecável no palco.'};
  if(acc>=81) return {icon:'🏆',name:'Coreógrafo',sub:'Comando total da coreografia.'};
  if(acc>=61) return {icon:'🥈',name:'Dançarino',sub:'Ritmo afiado, siga evoluindo.'};
  return {icon:'🎟️',name:'Participante',sub:'Bom começo. Bora de novo!'};
}

// ============================================================
//  RANKING — persistência local por aparelho (localStorage)
// ============================================================
const RANK_KEY='sesidanceRank';
let memRank=null;                 // fallback em memória (file:// sem localStorage)
let storageOk=true;
function loadRank(){
  if(memRank) return memRank.slice();
  try{
    const r=JSON.parse(localStorage.getItem(RANK_KEY)||'[]');
    return Array.isArray(r)?r:[];
  }catch(e){ storageOk=false; memRank=memRank||[]; return memRank.slice(); }
}
function persist(rk){
  memRank=rk.slice();             // sempre mantém em memória
  try{ localStorage.setItem(RANK_KEY, JSON.stringify(rk.slice(0,200))); }
  catch(e){ storageOk=false; }    // sem persistência: segue só em memória
}
function saveScore(entry){
  const rk=loadRank();
  rk.push(entry);
  rk.sort((a,b)=>b.score-a.score);
  const pos=rk.findIndex(e=>e.ts===entry.ts)+1;
  persist(rk);
  return pos;
}
function clearRank(){
  if(confirm('Apagar todo o ranking deste aparelho?')){
    memRank=[];
    try{ localStorage.removeItem(RANK_KEY); }catch(e){}
    renderRank(); renderTeaser();
  }
}
function medalForPos(i){ return ['🥇','🥈','🥉'][i] || (i+1); }

// teaser do top 3 na tela inicial
function renderTeaser(){
  const rk=loadRank().slice(0,3);
  const box=$('#rankTeaser');
  if(!rk.length){ box.innerHTML='<div class="teaser-empty">Seja o primeiro no ranking 🏆</div>'; return; }
  box.innerHTML=rk.map((e,i)=>(
    '<div class="teaser-row"><span class="pos">'+medalForPos(i)+'</span>'+
    '<span class="nm">'+escapeHtml(e.name)+'</span>'+
    '<span class="sc">'+e.score+'</span></div>'
  )).join('');
}
// tabela: modo 'geral' (online) ou 'aparelho' (local)
function renderRank(){
  const tb=$('#rankRows');
  const status=$('#rankStatus');
  const url=getWebAppUrl();
  // atualiza botões de modo
  $('#modeGeral').classList.toggle('on', rankMode==='geral');
  $('#modeAparelho').classList.toggle('on', rankMode==='aparelho');
  $('#modeGeral').disabled = !url;

  if(rankMode==='aparelho' || !url){
    if(!url) rankMode='aparelho';
    status.textContent = url ? 'Somente este aparelho' : 'Ranking local — configure o online na engrenagem';
    paintRows(loadRank().slice(0,10));
    return;
  }
  // modo geral (online)
  status.textContent='Carregando ranking geral…';
  tb.innerHTML='<tr><td colspan="5" style="text-align:center;color:#9fc0ea;padding:18px">⏳</td></tr>';
  fetchOnlineTop().then(top=>{
    status.textContent='Ranking geral — todos os aparelhos';
    paintRows(top.slice(0,10));
  }).catch(()=>{
    status.textContent='Sem conexão com o ranking geral. Mostrando este aparelho.';
    paintRows(loadRank().slice(0,10));
  });
}
function paintRows(rk){
  const tb=$('#rankRows');
  if(!rk||!rk.length){ tb.innerHTML='<tr><td colspan="5" style="text-align:center;color:#9fc0ea;padding:18px">Nenhuma partida ainda.</td></tr>'; return; }
  tb.innerHTML=rk.map((e,i)=>(
    '<tr><td class="rk-pos">'+medalForPos(i)+'</td>'+
    '<td>'+escapeHtml(e.name)+'</td>'+
    '<td><span class="dtag" style="color:'+(DIFFS[e.diff]?DIFFS[e.diff].cor:'#fff')+'">'+(DIFFS[e.diff]?DIFFS[e.diff].nome:'—')+'</span></td>'+
    '<td>'+e.acc+'%</td>'+
    '<td class="rk-score">'+e.score+'</td></tr>'
  )).join('');
}
function escapeHtml(s){ return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// ============================================================
//  RANKING ONLINE (Google Apps Script + Planilha) — opcional
//  Configurável pela engrenagem na tela de ranking. Guardado
//  no aparelho. Sem URL configurada, usa só o ranking local.
// ============================================================
let rankMode = 'geral';   // 'geral' (online) | 'aparelho' (local)
// URL do app da Web (Google Apps Script) já embutida: o ranking online funciona
// sem configuração. A engrenagem permite sobrescrever em um aparelho específico.
const WEBAPP_URL_DEFAULT = 'https://script.google.com/macros/s/AKfycbzqFvYuC2unVps944f4FBD7x_XTUI19lf-BG0iK3dUL5Rm_ZLbtvaeTT8hyKGke-YigCQ/exec';
function getWebAppUrl(){
  try{
    const saved=(localStorage.getItem('sesidanceWebApp')||'').trim();
    return saved || WEBAPP_URL_DEFAULT;
  }catch(e){ return WEBAPP_URL_DEFAULT; }
}
function setWebAppUrl(u){
  try{ localStorage.setItem('sesidanceWebApp',(u||'').trim()); }catch(e){}
}
// envia o resultado para a planilha (fire-and-forget)
function sendOnline(entry){
  const url=getWebAppUrl();
  if(!url) return Promise.resolve(null);
  const q=url+'?action=add'
    +'&name='+encodeURIComponent(entry.name)
    +'&score='+entry.score+'&acc='+entry.acc
    +'&combo='+entry.combo+'&diff='+encodeURIComponent(entry.diff)+'&n=50';
  return fetch(q,{method:'GET'}).then(r=>r.json()).catch(()=>null);
}
// busca o ranking geral (online)
function fetchOnlineTop(){
  const url=getWebAppUrl();
  if(!url) return Promise.reject('no-url');
  return fetch(url+'?action=top&n=50',{method:'GET'})
    .then(r=>r.json())
    .then(j=>{ if(j&&j.ok&&Array.isArray(j.top)) return j.top; throw 'bad'; });
}

// ---------- navegação ----------
function show(screen){
  [startScreen,gameScreen,resultScreen,rankScreen].forEach(s=>s.classList.add('hidden'));
  screen.classList.remove('hidden');
}
$('#playBtn').addEventListener('click', startGame);
$('#againBtn').addEventListener('click', startGame);
$('#homeBtn').addEventListener('click', ()=>{ renderTeaser(); show(startScreen); });
$('#rankBtn').addEventListener('click', ()=>{ rankMode=getWebAppUrl()?'geral':'aparelho'; renderRank(); show(rankScreen); });
$('#rankResultBtn').addEventListener('click', ()=>{ rankMode=getWebAppUrl()?'geral':'aparelho'; renderRank(); show(rankScreen); });
$('#rankBackBtn').addEventListener('click', ()=>{ renderTeaser(); show(startScreen); });
$('#clearRankBtn').addEventListener('click', clearRank);
// alternar modo geral/aparelho
$('#modeGeral').addEventListener('click', ()=>{ rankMode='geral'; renderRank(); });
$('#modeAparelho').addEventListener('click', ()=>{ rankMode='aparelho'; renderRank(); });
// painel de configuração da URL online
$('#cfgBtn').addEventListener('click', ()=>{
  $('#cfgUrl').value=getWebAppUrl();
  $('#cfgPanel').classList.toggle('hidden');
});
$('#cfgSave').addEventListener('click', ()=>{
  setWebAppUrl($('#cfgUrl').value);
  $('#cfgPanel').classList.add('hidden');
  rankMode=getWebAppUrl()?'geral':'aparelho';
  renderRank();
});
$('#cfgTest').addEventListener('click', ()=>{
  setWebAppUrl($('#cfgUrl').value);
  $('#cfgTestMsg').textContent='Testando…';
  fetchOnlineTop()
    .then(()=>{ $('#cfgTestMsg').textContent='✅ Conectado ao ranking geral.'; })
    .catch(()=>{ $('#cfgTestMsg').textContent='❌ Não conectou. Confira a URL (deve terminar em /exec).'; });
});

// ---------- boot ----------
(async function init(){
  beatmap=await loadBeatmap();
  selectDiff('medio');
  renderTeaser();
  try{ const last=localStorage.getItem('sesidanceLastName'); if(last) nameInput.value=last; }catch(e){}
  nameInput.addEventListener('change',()=>{ try{ localStorage.setItem('sesidanceLastName', nameInput.value.trim()); }catch(e){} });

  function hideLoader(){ loader.classList.add('hidden'); }

  // iOS Safari bloqueia carregamento de áudio até o usuário tocar.
  // Não esperamos o áudio: após 600ms o loader some e o jogo aparece.
  // O áudio será iniciado pelo toque em Jogar, como sempre.
  const iosTimeout = setTimeout(hideLoader, 600);

  // Se o áudio carregar antes (Android / desktop), hidrata mais cedo
  const earlyEvents = ['loadedmetadata','loadeddata','canplay'];
  earlyEvents.forEach(ev =>
    audio.addEventListener(ev, ()=>{ clearTimeout(iosTimeout); hideLoader(); }, {once:true})
  );

  // Loader também é clicável/tocável — saída de emergência em qualquer aparelho
  loader.addEventListener('pointerdown', hideLoader, {once:true});
  loader.style.cursor='pointer';

  // Atualiza texto do loader para deixar claro que pode tocar
  const lp=$('#loader p');
  if(lp) setTimeout(()=>{ if(!loader.classList.contains('hidden')) lp.textContent='Toque para continuar'; }, 1200);
})();

})();
