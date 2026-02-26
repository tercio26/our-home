// ══════════════════════════════════════════════
// HOME
// ══════════════════════════════════════════════
function renderHome(p) {
  p.innerHTML=`
  <div class="welcome">
    <div class="welcome-title">Chào Đạt & TLinh ☀️</div>
    <div class="welcome-sub">Mỗi ngày là một trang mới để chúng mình cùng viết💕</div>
  </div>
  <div class="stat-row">
    <div class="stat-box"><div class="stat-num" id="hs-balance">…</div><div class="stat-label">Số dư tháng</div></div>
    <div class="stat-box"><div class="stat-num" id="hs-chores">…</div><div class="stat-label">Việc nhà</div></div>
    <div class="stat-box"><div class="stat-num" id="hs-dreams">…</div><div class="stat-label">Mục tiêu</div></div>
  </div>
  <div class="home-grid">
    <div class="home-card hc-finance" onclick="go('finance',document.querySelector('[data-t=finance]'))"><span class="hc-emoji">💰</span><div class="hc-title">Thu Chi</div><div class="hc-sub">Quản lý ngân sách</div></div>
    <div class="home-card hc-chores"  onclick="go('chores',document.querySelector('[data-t=chores]'))"><span class="hc-emoji">🧹</span><div class="hc-title">Việc Nhà</div><div class="hc-sub">Phân công cùng nhau</div></div>
    <div class="home-card hc-notes"   onclick="go('notes',document.querySelector('[data-t=notes]'))"><span class="hc-emoji">📝</span><div class="hc-title">Ghi Chú</div><div class="hc-sub">Sự kiện & nhắn nhỏ</div></div>
    <div class="home-card hc-dreams"  onclick="go('dreams',document.querySelector('[data-t=dreams]'))"><span class="hc-emoji">🎯</span><div class="hc-title">Mục Tiêu</div><div class="hc-sub">Theo dõi tiến độ</div></div>
  </div>
  <div class="sec">💌 Nhắn Nhau Đi</div>
  <div class="love-wrap">
    <div class="love-input-row">
      <textarea id="love-txt" placeholder="Viết gì đó ngọt ngào... 🌸" style="min-height:44px"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();saveLove();}"></textarea>
      <button class="btn btn-rose btn-sm" onclick="saveLove()">💌 Gửi</button>
    </div>
    <div class="love-list" id="love-list"></div>
  </div>`;
  loadLove();
}

async function loadHomeStats() {
  const from=new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString();
  const {data:txs}=await SB.from('transactions').select('amount,type').gte('created_at',from);
  let i=0,e=0; (txs||[]).forEach(t=>t.type==='income'?i+=Number(t.amount):e+=Number(t.amount));
  const hb=$('hs-balance'); if(hb) hb.textContent=fmt(i-e);
  const {data:ch}=await SB.from('chores').select('done');
  const tot=(ch||[]).length,dn=(ch||[]).filter(c=>c.done).length;
  const hc=$('hs-chores'); if(hc) hc.textContent=`${dn}/${tot}`;
  const {data:dr}=await SB.from('dreams').select('progress');
  const avg=(dr||[]).length?Math.round(dr.reduce((s,d)=>s+d.progress,0)/dr.length):0;
  const hd=$('hs-dreams'); if(hd) hd.textContent=avg+'%';
}

async function loadLove() {
  const {data}=await SB.from('love_notes').select('*').order('created_at',{ascending:false}).limit(5);
  const list=$('love-list'); if(!list) return;
  if(!(data||[]).length){list.innerHTML='';return;}
  list.innerHTML=(data||[]).map(n=>{
    const d=new Date(n.created_at);
    return `<div class="love-item"><span class="love-time">${d.getDate()}/${d.getMonth()+1} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}</span>"${n.text}"</div>`;
  }).join('');
}

async function saveLove() {
  const txt=$('love-txt').value.trim(); if(!txt) return;
  await SB.from('love_notes').insert({text:txt});
  $('love-txt').value=''; toast('💌 Đã gửi!'); loadLove();
}

