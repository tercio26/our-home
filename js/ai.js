// ══════════════════════════════════════════════
// AI
// ══════════════════════════════════════════════
const SUGGESTS=[
  ['🛒 Đi chợ','Hôm nay đi chợ 120k và mua cát mèo 80k'],
  ['✅ Xong việc','Dọn khay mèo và quét nhà xong rồi'],
  ['💍 Ước mơ','Tiết kiệm đám cưới thêm 2 triệu rồi'],
  ['📝 Ghi chú','Nhắc mua thuốc tẩy giun cho mèo'],
  ['💰 Lương','Lương tháng này 8 triệu về rồi'],
];
const AI_WELCOME=`Chào Đạt & TLinh! Tớ là trợ lý Tổ Ấm 🏡<br><br>Chỉ cần nhắn tự nhiên, tớ tự ghi vào đúng chỗ nhé!<br><br>💰 <i>"Đi chợ 120k, mua cát mèo 80k"</i><br>🐱 <i>"Dọn khay mèo và quét nhà xong"</i><br>🌟 <i>"Tiết kiệm cưới thêm 2 triệu"</i><br>📝 <i>"Nhắc mua thuốc tẩy giun mèo"</i>`;

function renderAI(p) {
  p.innerHTML=`
  <div class="ai-banner">
    <h3>🤖 Trợ Lý Tổ Ấm</h3>
    <p>Nhắn tự nhiên — tớ tự ghi vào đúng chỗ cho cậu 🌸</p>
  </div>
  <div class="suggest-wrap">${SUGGESTS.map(s=>`<button class="suggest-chip" onclick="fillAI('${s[1].replace(/'/g,"\\'")}')"> ${s[0]}</button>`).join('')}</div>
  <div class="chat-box">
    <div class="chat-msgs" id="ai-msgs">
      <div class="msg ai"><div class="msg-av">🤖</div><div class="msg-bub">${AI_WELCOME}</div></div>
    </div>
    <div class="chat-input-row">
      <button class="mic-btn" id="mic-btn" onclick="toggleMic()" title="Giọng nói">🎤</button>
      <textarea id="ai-in" placeholder="Nhắn gì đó... vd: hôm nay ăn sáng 45k" rows="1"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendAI();}"
        oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,90)+'px'"></textarea>
      <button class="send-btn" id="ai-send" onclick="sendAI()">➤</button>
    </div>
  </div>
  <div class="tip-card">
    🛒 <b>Chi tiêu:</b> "mua rau 30k, thịt 80k"<br>
    💰 <b>Thu nhập:</b> "lương tháng 8 về 8 triệu"<br>
    ✅ <b>Việc nhà:</b> "xong rửa bát và lau nhà"<br>
    🌟 <b>Ước mơ:</b> "tiết kiệm cưới thêm 2 triệu"<br>
    📝 <b>Ghi chú:</b> "nhớ mua thuốc tẩy giun mèo"<br>
    🐱 <b>Mèo:</b> "cho cả 5 bé ăn xong rồi"
  </div>`;
}

function fillAI(t) { const el=$('ai-in'); if(el){el.value=t;el.focus();} }

function addMsg(role,html,tag) {
  const box=$('ai-msgs'); if(!box) return null;
  const d=document.createElement('div'); d.className='msg '+role;
  const av=document.createElement('div'); av.className='msg-av'; av.textContent=role==='ai'?'🤖':'🏡';
  const bub=document.createElement('div'); bub.className='msg-bub'; bub.innerHTML=html;
  if(tag){const t=document.createElement('div');t.innerHTML=`<span class="act-tag ${tag.c}">${tag.l}</span>`;bub.appendChild(t);}
  d.appendChild(av); d.appendChild(bub); box.appendChild(d);
  box.scrollTop=box.scrollHeight; return bub;
}

async function sendAI() {
  const inp=$('ai-in'); if(!inp) return;
  const text=inp.value.trim(); if(!text||aiLoading) return;
  aiLoading=true; inp.value=''; inp.style.height='auto';
  const sb=$('ai-send'); if(sb) sb.disabled=true;
  addMsg('user',text);
  aiHistory.push({role:'user',content:text});
  const typBub=addMsg('ai','<div class="typing-dots"><span></span><span></span><span></span></div>');

  const ctx={
    transactions:txData.slice(0,8).map(t=>({desc:t.desc,amount:t.amount,type:t.type,cat:t.cat})),
    chores:choresData.map(c=>({name:c.name,done:c.done})),
    dreams:dreamsData.map(d=>({title:d.title,progress:d.progress}))
  };
  const sys=`Bạn là trợ lý "Tổ Ấm". Gia đình: Đạt và TLinh, 5 con mèo. Mục tiêu: tiết kiệm kết hôn, xây nhà, mở tiệm hoa.
Dữ liệu: ${JSON.stringify(ctx)}
Trả về JSON duy nhất (không có text ngoài JSON):
{"reply":"...","actions":[{"type":"ADD_TRANSACTION","data":{"desc":"","amount":0,"transType":"expense|income","cat":"🛒 Thực phẩm|🏠 Nhà cửa|🚗 Di chuyển|💊 Sức khỏe|🎉 Giải trí|👗 Quần áo|💼 Thu nhập|🐱 Thú cưng|🎁 Khác","person":"Đạt|TLinh|Cả hai"}}]}
Loại action: ADD_TRANSACTION | COMPLETE_CHORE({"name":""}) | UPDATE_DREAM_PROGRESS({"title":"","progress":0}) | ADD_NOTE({"title":"","body":"","tag":"Ghi nhớ|Cùng nhau|Mua sắm|Ý tưởng"})
Quy đổi: k=*1000, triệu=*1000000. Phản hồi thân thiện, emoji 🐱 khi liên quan mèo.`;

  try {
    const res=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:1000,system:sys,messages:aiHistory})});
    const data=await res.json();
    const raw=data.content?.[0]?.text||'{}';
    let parsed; try{parsed=JSON.parse(raw.replace(/```json|```/g,'').trim());}catch{parsed={reply:raw,actions:[]};}
    aiHistory.push({role:'assistant',content:raw});
    let tag=null;
    for(const a of (parsed.actions||[])){
      if(a.type==='ADD_TRANSACTION'&&a.data){
        await SB.from('transactions').insert({desc:a.data.desc||'Chi tiêu',amount:a.data.amount||0,type:a.data.transType||'expense',cat:a.data.cat||'🎁 Khác',person:a.data.person||'Cả hai'});
        tag={l:a.data.transType==='income'?'💰 Đã ghi thu':'💸 Đã ghi chi',c:'at-f'};
        if(cur==='finance')loadTx(); loadHomeStats();
      }
      if(a.type==='COMPLETE_CHORE'&&a.data){
        const kw=(a.data.name||'').toLowerCase();
        const ch=choresData.find(c=>c.name.toLowerCase().includes(kw));
        if(ch){await SB.from('chores').update({done:true,done_at:new Date().toISOString()}).eq('id',ch.id);if(cur==='chores')loadChores();}
        tag={l:'✅ Đã đánh dấu xong',c:'at-c'};
      }
      if(a.type==='UPDATE_DREAM_PROGRESS'&&a.data){
        const kw=(a.data.title||'').toLowerCase();
        const dr=dreamsData.find(d=>d.title.toLowerCase().includes(kw));
        if(dr){await SB.from('dreams').update({progress:Math.min(100,a.data.progress||0)}).eq('id',dr.id);if(cur==='dreams')loadDreams();loadHomeStats();}
        tag={l:'🌟 Cập nhật ước mơ',c:'at-d'};
      }
      if(a.type==='ADD_NOTE'&&a.data){
        await SB.from('notes').insert({title:a.data.title||'Ghi chú',body:a.data.body||'',tag:a.data.tag||'Ghi nhớ',color:NC[Math.floor(Math.random()*5)]});
        if(cur==='notes')loadNotes();
        tag={l:'📝 Đã lưu ghi chú',c:'at-n'};
      }
    }
    if(typBub){typBub.innerHTML=parsed.reply||'Tớ đã xử lý rồi nhé! 🌸'; if(tag){const t=document.createElement('div');t.innerHTML=`<span class="act-tag ${tag.c}">${tag.l}</span>`;typBub.appendChild(t);}}
  } catch(e) {
    if(typBub) typBub.innerHTML='Ôi có lỗi kết nối rồi! Cậu thử lại nhé 😅';
  }
  aiLoading=false; const sb2=$('ai-send'); if(sb2)sb2.disabled=false;
  const box=$('ai-msgs'); if(box) box.scrollTop=box.scrollHeight;
}

function toggleMic() {
  const btn=$('mic-btn');
  if(!('webkitSpeechRecognition'in window)&&!('SpeechRecognition'in window)){toast('Thử Chrome nhé!','err');return;}
  if(micOn){recog&&recog.stop();return;}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  recog=new SR(); recog.lang='vi-VN'; recog.interimResults=false;
  recog.onstart=()=>{micOn=true;if(btn)btn.classList.add('rec');};
  recog.onresult=e=>{const el=$('ai-in');if(el)el.value=e.results[0][0].transcript;};
  recog.onend=()=>{micOn=false;if(btn)btn.classList.remove('rec');};
  recog.start();
}

