// ══════════════════════════════════════════════
// CHORES
// ══════════════════════════════════════════════
function renderChores(p) {
  p.innerHTML=`
  <div class="card">
    <div class="card-title">🧹 Việc Nhà Chung Mình</div>
    <div class="prog-bar-wrap">
      <div class="prog-head"><span>Tiến độ hôm nay</span><span id="ch-prog-txt">0/0</span></div>
      <div class="prog-track"><div class="prog-fill" id="ch-prog-fill" style="width:0%"></div></div>
    </div>
    <div class="pills" style="margin-bottom:.75rem" id="ch-filter-pills">
      <span class="pill on-sage on" data-v="pending" onclick="setChoreFilter(this,'pending')">Chưa làm</span>
      <span class="pill" data-v="all"   onclick="setChoreFilter(this,'all')">Tất cả</span>
      <span class="pill" data-v="done"  onclick="setChoreFilter(this,'done')">Đã xong</span>
    </div>
    <div class="chore-list" id="chore-list"></div>
  </div>
  <div class="card">
    <div class="card-title">➕ Thêm Việc Nhà</div>
    <div class="field"><label>Tên công việc</label><input id="ch-name" placeholder="vd: Rửa bát, quét nhà..."
      onkeydown="if(event.key==='Enter'){event.preventDefault();addChore();}"/></div>
    <div class="row2">
      <div class="field"><label>Phân công</label>
        <select id="ch-assign"><option>Đạt</option><option>TLinh</option><option>Cùng làm 💕</option></select>
      </div>
      <div class="field"><label>Tần suất</label>
        <select id="ch-freq"><option>Hằng ngày</option><option>Hằng tuần</option><option>Hằng tháng</option><option>Khi cần</option></select>
      </div>
    </div>
    <button class="btn btn-sage btn-full" onclick="addChore()">🧹 Thêm Công Việc</button>
  </div>`;
}

function setChoreFilter(el,val) {
  choresFilter=val;
  document.querySelectorAll('#ch-filter-pills .pill').forEach(p=>p.className='pill');
  el.className='pill on-sage on';
  loadChores();
}

async function loadChores() {
  let q=SB.from('chores').select('*').order('created_at',{ascending:true});
  if(choresFilter==='pending') q=q.eq('done',false);
  if(choresFilter==='done')    q=q.eq('done',true);
  const {data}=await q;
  choresData=data||[];
  // get full count for progress
  const {data:all}=await SB.from('chores').select('done');
  const tot=(all||[]).length, dn=(all||[]).filter(c=>c.done).length;
  const pt=$('ch-prog-txt'), pf=$('ch-prog-fill');
  if(pt) pt.textContent=`${dn}/${tot}`;
  if(pf) pf.style.width=tot?(dn/tot*100)+'%':'0%';
  renderChores2();
}

function renderChores2() {
  const list=$('chore-list'); if(!list) return;
  if(!choresData.length){list.innerHTML='<div class="empty"><span class="empty-icon">✨</span>Không có việc nào ở đây!</div>';return;}
  list.innerHTML=choresData.map(c=>`
    <div class="chore-item${c.done?' done':''}">
      <div class="chore-check" onclick="toggleChore('${c.id}',${c.done})">${c.done?'✓':''}</div>
      <div style="flex:1">
        <div class="chore-name">${c.name}</div>
        <div class="chore-assign">👤 ${c.assign}</div>
      </div>
      <span class="chore-freq">${c.freq}</span>
      <button class="del-btn" onclick="delChore('${c.id}')">✕</button>
    </div>`).join('');
}

async function addChore() {
  const name=$('ch-name').value.trim(); if(!name){toast('Nhập tên công việc nhé!','err');return;}
  await SB.from('chores').insert({name,assign:$('ch-assign').value,freq:$('ch-freq').value,done:false});
  $('ch-name').value=''; toast('✅ Đã thêm!'); loadChores();
}
async function toggleChore(id,done) {
  await SB.from('chores').update({done:!done,done_at:!done?new Date().toISOString():null}).eq('id',id);
  loadChores(); loadHomeStats();
}
async function delChore(id) {
  await SB.from('chores').delete().eq('id',id); toast('🗑️ Đã xoá'); loadChores();
}

