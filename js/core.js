// ── SUPABASE ──────────────────────────────────
const SB = supabase.createClient(
  'https://jdbublamnvzjspmmqldf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkYnVibGFtbnZ6anNwbW1xbGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzI4MDgsImV4cCI6MjA4NzY0ODgwOH0.8HJo46GvdepnIM0PCqFzYdhBBjhZn_F6RFK6I3EAMmI'
);

// ── HELPERS ───────────────────────────────────
const $ = id => document.getElementById(id);
const fmt = n => Number(n||0).toLocaleString('vi-VN')+'đ';
const vnd = s => { s=String(s||0).toLowerCase().replace(/,/g,'').trim(); if(s.includes('triệu'))return Math.round(parseFloat(s)*1e6); if(s.includes('k'))return Math.round(parseFloat(s)*1e3); return Math.round(parseFloat(s)); };

let toastTimer;
function toast(msg, type='ok') {
  const el=$('toast'); el.textContent=msg; el.className='show '+type;
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.className='',2600);
}

function updateRangeStyle(el) {
  const pct = ((el.value-el.min)/(el.max-el.min)*100).toFixed(1);
  el.style.setProperty('--pct', pct+'%');
}

// ── STATE ─────────────────────────────────────
let cur = 'home';
let finFilter = { month: new Date().getMonth(), year: new Date().getFullYear(), person:'all' };
let choresFilter = 'pending';
let txData=[], choresData=[], notesData=[], eventsData=[], dreamsData=[], loveData=[];
let homeStats = { balance:'0đ', chores:'0/0', dreams:'0%' };
let chartInst = null;
let aiHistory=[], aiLoading=false;
let micOn=false, recog=null;

const MONTHS = ['Th.1','Th.2','Th.3','Th.4','Th.5','Th.6','Th.7','Th.8','Th.9','Th.10','Th.11','Th.12'];
const NC = ['nc-1','nc-2','nc-3','nc-4','nc-5'];
const CAT = { travel:{l:'✈️ Du lịch',c:'dc-travel'}, home:{l:'🏠 Tổ ấm',c:'dc-home'}, life:{l:'💑 Cuộc sống',c:'dc-life'}, money:{l:'💰 Tài chính',c:'dc-money'} };

// ── DATE ──────────────────────────────────────
(function(){
  const d=new Date(), days=['CN','T2','T3','T4','T5','T6','T7'];
  $('date-chip').textContent=`${days[d.getDay()]}, ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
})();

// ── PILL PICKER ───────────────────────────────
function pickPill(el, groupId) {
  document.querySelectorAll('#'+groupId+' .pill').forEach(p=>{
    p.className='pill'; // reset
  });
  el.classList.add('on');
}
function getPill(groupId) {
  const a=document.querySelector('#'+groupId+' .pill.on');
  return a?a.dataset.v:'';
}

// ── MODALS ────────────────────────────────────
function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }

// ── NAVIGATION ────────────────────────────────
function go(name, btn) {
  cur=name;
  document.querySelectorAll('.nav-btn').forEach(b=>{ b.className='nav-btn'; });
  btn.className='nav-btn on';
  render();
}

function render() {
  const main=$('main');
  main.innerHTML='';
  const page=document.createElement('div');
  page.className='page';
  if (cur==='home')    renderHome(page);
  if (cur==='finance') { renderFinance(page); loadTx(); }
  if (cur==='chores')  { renderChores(page); loadChores(); }
  if (cur==='notes')   { renderNotes(page); loadNotes(); loadEvents(); }
  if (cur==='dreams')  { renderDreams(page); loadDreams(); }
  if (cur==='ai')      renderAI(page);
  if (cur==='games')   renderGames(page);
  main.appendChild(page);
  if (cur==='home') loadHomeStats();
}

