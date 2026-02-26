// ══════════════════════════════════════════════
// DREAMS
// ══════════════════════════════════════════════
function renderDreams(p) {
  p.innerHTML=`
  <div style="background:linear-gradient(135deg,#FDF8EE,#F8EEFF);border-radius:var(--r);border:1px solid var(--border);padding:1.1rem 1.1rem .9rem;margin-bottom:.8rem;">
    <div class="card-title">🎯 Mục Tiêu Của Chúng Mình</div>
    <p style="font-size:.76rem;color:var(--ink2);font-style:italic;margin-bottom:1rem;">"Từng bước nhỏ, chúng mình sẽ đến đích cùng nhau 🌿"</p>
    <div id="dream-list"></div>
  </div>
  <button class="btn btn-peach btn-full" onclick="openModal('modal-dream')">🎯 Thêm Mục Tiêu Mới</button>`;
}

async function loadDreams() {
  const {data}=await SB.from('dreams').select('*').order('created_at',{ascending:true});
  dreamsData=data||[];
  const list=$('dream-list'); if(!list) return;
  if(!dreamsData.length){list.innerHTML='<div class="empty"><span class="empty-icon">🎯</span>Cùng nhau đặt ra những mục tiêu nhé!</div>';return;}
  list.innerHTML=dreamsData.map(d=>{
    const cat=CAT[d.cat]||CAT.travel;
    return `<div class="dream-item${d.done?' done':''}">
      <div class="dr-top">
        <div class="dr-title">${d.title}</div>
        <span class="dr-cat ${cat.c}">${cat.l}</span>
      </div>
      ${d.note?`<div class="dr-note">${d.note}</div>`:''}
      <div class="dr-prog-label"><span>Tiến độ</span><span id="dpv-${d.id}">${d.progress}%</span></div>
      <div class="dr-track"><div class="dr-fill" id="drf-${d.id}" style="width:${d.progress}%"></div></div>
      <input type="range" min="0" max="100" value="${d.progress}" style="--pct:${d.progress}%"
        oninput="previewDream('${d.id}',this.value);updateRangeStyle(this)"
        onchange="saveDreamProgress('${d.id}',this.value)"/>
      <div class="dr-footer">
        <button class="dr-done-btn" onclick="toggleDream('${d.id}',${d.done})">${d.done?'✓ Đã hoàn thành!':'🎯 Đánh dấu hoàn thành'}</button>
        <button class="del-btn" onclick="delDream('${d.id}')">✕</button>
      </div>
    </div>`;
  }).join('');
}

function previewDream(id,val) {
  const lbl=$(`dpv-${id}`), fill=$(`drf-${id}`);
  if(lbl) lbl.textContent=val+'%';
  if(fill) fill.style.width=val+'%';
}
async function saveDreamProgress(id,val) {
  await SB.from('dreams').update({progress:parseInt(val)}).eq('id',id);
  loadHomeStats();
}
async function toggleDream(id,done) {
  await SB.from('dreams').update({done:!done,progress:!done?100:undefined}).eq('id',id);
  loadDreams(); loadHomeStats();
}
async function delDream(id) {
  await SB.from('dreams').delete().eq('id',id); toast('🗑️ Đã xoá'); loadDreams(); loadHomeStats();
}
async function addDream() {
  const title=$('dr-title').value.trim(); if(!title){toast('Nhập tên mục tiêu nhé!','err');return;}
  await SB.from('dreams').insert({title,note:$('dr-note').value.trim(),cat:getPill('dr-cat-pills')||'travel',progress:parseInt($('dr-progress').value)||0,done:false});
  $('dr-title').value=''; $('dr-note').value=''; $('dr-progress').value=0;
  closeModal('modal-dream'); toast('🌟 Đã thêm!'); loadDreams(); loadHomeStats();
}

