// ══════════════════════════════════════════════
// NOTES
// ══════════════════════════════════════════════
function renderNotes(p) {
  p.innerHTML=`
  <div class="card">
    <div class="card-title" style="margin-bottom:.6rem">📅 Sự Kiện Sắp Tới</div>
    <div class="event-list" id="ev-list"></div>
    <button class="btn btn-outline btn-sm" style="margin-top:.6rem" onclick="openModal('modal-event')">+ Thêm sự kiện</button>
  </div>
  <div class="card">
    <div class="card-title">📝 Ghi Chú</div>
    <div class="notes-masonry" id="notes-grid"></div>
    <button class="btn btn-lav btn-full" onclick="openModal('modal-note')">+ Thêm Ghi Chú</button>
  </div>`;
}

async function loadNotes() {
  const {data}=await SB.from('notes').select('*').order('created_at',{ascending:false});
  notesData=data||[];
  const grid=$('notes-grid'); if(!grid) return;
  if(!notesData.length){grid.innerHTML='<div class="empty" style="grid-column:span 2"><span class="empty-icon">📓</span>Chưa có ghi chú nào</div>';return;}
  grid.innerHTML=notesData.map(n=>{
    const d=new Date(n.created_at);
    return `<div class="note-card ${n.color||'nc-1'}">
      <button class="note-del" onclick="delNote('${n.id}')">✕</button>
      <div class="note-tag">${n.tag}</div>
      <div class="note-title">${n.title}</div>
      <div class="note-body">${n.body||''}</div>
      <div class="note-date">${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}</div>
    </div>`;
  }).join('');
}

async function addNote() {
  const title=$('n-title').value.trim(); if(!title){toast('Nhập tiêu đề nhé!','err');return;}
  await SB.from('notes').insert({title,body:$('n-body').value.trim(),tag:getPill('n-tag-pills')||'Ghi nhớ',color:NC[Math.floor(Math.random()*5)]});
  $('n-title').value=''; $('n-body').value='';
  closeModal('modal-note'); toast('📝 Đã lưu!'); loadNotes();
}
async function delNote(id) {
  await SB.from('notes').delete().eq('id',id); toast('🗑️ Đã xoá'); loadNotes();
}

async function loadEvents() {
  const today=new Date().toISOString().split('T')[0];
  const {data}=await SB.from('events').select('*').gte('event_date',today).order('event_date',{ascending:true});
  eventsData=data||[];
  const list=$('ev-list'); if(!list) return;
  if(!eventsData.length){list.innerHTML='<div class="empty"><span class="empty-icon">🗓️</span>Chưa có sự kiện sắp tới</div>';return;}
  const mnames=['Th.1','Th.2','Th.3','Th.4','Th.5','Th.6','Th.7','Th.8','Th.9','Th.10','Th.11','Th.12'];
  list.innerHTML=eventsData.map(e=>{
    const d=new Date(e.event_date+'T00:00:00');
    const now=new Date(); now.setHours(0,0,0,0);
    const diff=Math.round((d-now)/86400000);
    const diffLbl=diff===0?'🔴 Hôm nay!':diff===1?'🟡 Ngày mai':`còn ${diff} ngày`;
    return `<div class="event-item">
      <div class="ev-date"><div class="ev-day">${d.getDate()}</div><div class="ev-month">${mnames[d.getMonth()]}</div></div>
      <div style="flex:1">
        <div class="ev-name">${e.name}</div>
        <div class="ev-who">👤 ${e.who} · <span class="ev-diff">${diffLbl}</span></div>
      </div>
      <span class="ev-badge ${e.type==='chung'?'ev-b-chung':'ev-b-rieng'}">${e.type==='chung'?'💑':'👤'}</span>
      <button class="del-btn" onclick="delEvent('${e.id}')">✕</button>
    </div>`;
  }).join('');
}

async function addEvent() {
  const name=$('ev-name').value.trim(), date=$('ev-date').value;
  if(!name||!date){toast('Nhập đầy đủ thông tin nhé!','err');return;}
  await SB.from('events').insert({name,event_date:date,type:getPill('ev-type-pills')||'chung',who:$('ev-who').value});
  $('ev-name').value=''; $('ev-date').value='';
  closeModal('modal-event'); toast('📅 Đã lưu!'); loadEvents();
}
async function delEvent(id) {
  await SB.from('events').delete().eq('id',id); toast('🗑️ Đã xoá'); loadEvents();
}

