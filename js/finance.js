// ══════════════════════════════════════════════
// FINANCE
// ══════════════════════════════════════════════
function renderFinance(p) {
  p.innerHTML=`
  <div class="balance-hero">
    <div class="balance-label">Số dư — <span id="month-lbl">${MONTHS[finFilter.month]}/${finFilter.year}</span></div>
    <div class="balance-num" id="bal-num">…</div>
    <div class="balance-split">
      <span class="bal-in">▲ <span id="bal-in">0đ</span></span>
      <span class="bal-out">▼ <span id="bal-out">0đ</span></span>
    </div>
  </div>
  <!-- filter -->
  <div class="filter-row">
    <div class="month-ctrl">
      <button onclick="prevMonth()">◀</button>
      <span id="month-ctrl-lbl">${MONTHS[finFilter.month]}/${finFilter.year}</span>
      <button onclick="nextMonth()">▶</button>
    </div>
    <div class="pills" id="person-pills" style="margin:0">
      ${['all','Đạt','TLinh','Cả hai'].map((v,i)=>`<span class="pill${v===finFilter.person?' on':''}" data-v="${v}" onclick="pickPersonFilter(this)">${v==='all'?'Tất cả':v}</span>`).join('')}
    </div>
  </div>
  <!-- add form -->
  <div class="card">
    <div class="card-title">➕ Thêm Giao Dịch</div>
    <div class="pills" id="tx-type-pills">
      <span class="pill on" data-v="expense" onclick="pickPill(this,'tx-type-pills')">Chi tiêu</span>
      <span class="pill"    data-v="income"  onclick="pickPill(this,'tx-type-pills')">Thu nhập</span>
    </div>
    <div class="row2">
      <div class="field"><label>Mô tả</label><input id="tx-desc" placeholder="vd: tiền chợ..."
        onkeydown="if(event.key==='Enter'){event.preventDefault();addTx();}"/></div>
      <div class="field">
        <label>Số tiền <span id="tx-amt-preview" style="font-weight:700;color:var(--peach);font-size:.8rem;"></span></label>
        <input id="tx-amt" type="text" placeholder="vd: 50, 1.5tr, 200k"
          oninput="previewAmt(this)"
          onkeydown="if(event.key==='Enter'){event.preventDefault();addTx();}"/>
      </div>
    </div>
    <div class="row2">
      <div class="field"><label>Danh mục</label>
        <select id="tx-cat">
          <option>🛒 Thực phẩm</option><option>🏠 Nhà cửa</option><option>🚗 Di chuyển</option>
          <option>💊 Sức khỏe</option><option>🎉 Giải trí</option><option>👗 Quần áo</option>
          <option>💼 Thu nhập</option><option>🐱 Thú cưng</option><option>🎁 Khác</option>
        </select>
      </div>
      <div class="field"><label>Người chi</label>
        <select id="tx-person"><option>Đạt</option><option>TLinh</option><option>Cả hai</option></select>
      </div>
    </div>
    <button class="btn btn-amber btn-full" onclick="addTx()">💰 Thêm Giao Dịch</button>
  </div>
  <!-- list -->
  <div class="card">
    <div class="card-title">📋 Giao Dịch</div>
    <div class="tx-list" id="tx-list"></div>
    <div class="chart-section" id="chart-section" style="display:none">
      <div class="chart-label">Phân bổ chi tiêu</div>
      <canvas id="fin-chart" style="max-height:190px"></canvas>
    </div>
  </div>`;
}

function pickPersonFilter(el) {
  document.querySelectorAll('#person-pills .pill').forEach(p=>p.className='pill');
  el.className='pill on';
  finFilter.person=el.dataset.v;
  loadTx();
}
function prevMonth(){finFilter.month--;if(finFilter.month<0){finFilter.month=11;finFilter.year--;}updateMonthLabel();loadTx();}
function nextMonth(){finFilter.month++;if(finFilter.month>11){finFilter.month=0;finFilter.year++;}updateMonthLabel();loadTx();}
function updateMonthLabel(){
  const lbl=MONTHS[finFilter.month]+'/'+finFilter.year;
  const a=$('month-lbl'), b=$('month-ctrl-lbl');
  if(a)a.textContent=lbl; if(b)b.textContent=lbl;
}

async function loadTx() {
  const from=new Date(finFilter.year,finFilter.month,1).toISOString();
  const to=new Date(finFilter.year,finFilter.month+1,0,23,59,59).toISOString();
  let q=SB.from('transactions').select('*').gte('created_at',from).lte('created_at',to).order('created_at',{ascending:false});
  if(finFilter.person!=='all') q=q.eq('person',finFilter.person);
  const {data}=await q;
  txData=data||[];
  renderTx();
}

// ── SMART AMOUNT INPUT ────────────────────────
// Parses: "50" → 50,000 | "1.5tr" → 1,500,000 | "200k" → 200,000 | "50000" → 50,000
function parseAmt(raw) {
  if (!raw) return 0;
  const s = String(raw).toLowerCase().replace(/\s/g,'').replace(/,/g,'.');
  // Explicit units
  if (/triệu|tr/.test(s))  return Math.round(parseFloat(s) * 1_000_000);
  if (/k/.test(s))          return Math.round(parseFloat(s) * 1_000);
  const n = parseFloat(s);
  if (isNaN(n)) return 0;
  // Auto-zero: nếu số < 1000 và không có dấu chấm → thêm 3 số 0
  if (n < 1000 && !s.includes('.')) return n * 1000;
  return Math.round(n);
}

function previewAmt(el) {
  const parsed = parseAmt(el.value);
  const preview = document.getElementById('tx-amt-preview');
  if (preview) preview.textContent = parsed > 0 ? '= ' + fmt(parsed) : '';
}

async function addTx() {
  const desc=$('tx-desc').value.trim();
  const rawAmt = $('tx-amt').value.trim();
  const amt = parseAmt(rawAmt);
  if(!desc||!amt||amt<=0){toast('Nhập đầy đủ thông tin nhé!','err');return;}
  await SB.from('transactions').insert({desc,amount:amt,type:getPill('tx-type-pills')||'expense',cat:$('tx-cat').value,person:$('tx-person').value});
  $('tx-desc').value=''; $('tx-amt').value='';
  const preview=$('tx-amt-preview'); if(preview) preview.textContent='';
  toast('✅ Đã ghi ' + fmt(amt) + '!'); loadTx(); loadHomeStats();
}

async function delTx(id) {
  await SB.from('transactions').delete().eq('id',id);
  toast('🗑️ Đã xoá'); loadTx(); loadHomeStats();
}

function renderTx() {
  const list=$('tx-list'); if(!list) return;
  let inc=0,exp=0;
  txData.forEach(t=>t.type==='income'?inc+=Number(t.amount):exp+=Number(t.amount));
  const bn=$('bal-num'),bi=$('bal-in'),bo=$('bal-out');
  if(bn)bn.textContent=fmt(inc-exp);
  if(bi)bi.textContent=fmt(inc);
  if(bo)bo.textContent=fmt(exp);
  if(!txData.length){list.innerHTML='<div class="empty"><span class="empty-icon">💸</span>Chưa có giao dịch tháng này</div>';return;}
  list.innerHTML=txData.map(t=>{
    const d=new Date(t.created_at);
    return `<div class="tx-item ${t.type}">
      <div style="flex:1">
        <div class="tx-desc">${t.cat} ${t.desc}</div>
        <div class="tx-meta">${t.person} · ${d.getDate()}/${d.getMonth()+1}</div>
      </div>
      <div class="tx-amt ${t.type}">${t.type==='income'?'+':'-'}${fmt(t.amount)}</div>
      <button class="del-btn" onclick="delTx('${t.id}')">✕</button>
    </div>`;
  }).join('');
  // chart
  const expenses=txData.filter(t=>t.type==='expense');
  const cs=$('chart-section'); if(cs) cs.style.display=expenses.length?'block':'none';
  if(expenses.length) drawChart(expenses);
}

function drawChart(expenses) {
  const cv=$('fin-chart'); if(!cv) return;
  const cats={};
  expenses.forEach(t=>{cats[t.cat]=(cats[t.cat]||0)+Number(t.amount);});
  if(chartInst) chartInst.destroy();
  chartInst=new Chart(cv.getContext('2d'),{
    type:'doughnut',
    data:{labels:Object.keys(cats),datasets:[{data:Object.values(cats),
      backgroundColor:['#E8A87C','#7FAF8A','#9B8EC4','#C9A84C','#D4877A','#C8DFD0','#EEE0B0','#F5DCC8'],
      borderWidth:2,borderColor:'#FFFFFF'}]},
    options:{plugins:{legend:{position:'bottom',labels:{font:{family:'DM Sans',size:10},padding:10}}},cutout:'62%'}
  });
}

