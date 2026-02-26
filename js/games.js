// ══════════════════════════════════════════════
// GAMES  —  Hôm nay ăn gì · Thử thách tuần · Quiz đôi
// ══════════════════════════════════════════════

// ── SHARED DATA ───────────────────────────────
const DEFAULT_FOODS = [
  'Bún bò 🍜','Cơm tấm 🍚','Bánh mì 🥖','Phở 🍲','Mì Ý 🍝',
  'Cháo gà 🍵','Bánh cuốn 🫔','Cơm rang 🍳','Lẩu 🥘','Pizza 🍕',
  'Bún riêu 🍜','Xôi 🍙','Bún chả 🍢','Bánh xèo 🥞','Bún đậu 🫘'
];

const CHALLENGES = [
  { emoji:'🚫', text:'Không order đồ ăn 3 ngày liên tiếp', days:3 },
  { emoji:'🍳', text:'Tự nấu ăn sáng mỗi ngày trong tuần', days:7 },
  { emoji:'💰', text:'Tiết kiệm 100k/ngày trong 5 ngày', days:5 },
  { emoji:'🐱', text:'Chụp ảnh cả 5 bé mèo mỗi ngày', days:7 },
  { emoji:'💌', text:'Nhắn nhau 1 tin nhắn yêu thương mỗi ngày', days:7 },
  { emoji:'🚶', text:'Đi dạo cùng nhau ít nhất 15 phút mỗi ngày', days:5 },
  { emoji:'📵', text:'Không điện thoại trong bữa ăn cả tuần', days:7 },
  { emoji:'🌱', text:'Mỗi người đọc ít nhất 10 trang sách mỗi ngày', days:5 },
  { emoji:'☕', text:'Tự pha cà phê, không mua ngoài 5 ngày', days:5 },
  { emoji:'🎨', text:'Cùng làm một điều sáng tạo mỗi tối', days:5 },
];

const QUIZ_QUESTIONS = [
  {
    q: 'Con mèo nào hay bắt nạt mấy bé kia nhất?',
    hint: 'Chỉ hai người mình mới biết 😄',
    type: 'open'
  },
  {
    q: 'Nếu được đi du lịch ngay bây giờ, Đạt sẽ chọn đâu?',
    hint: 'Đoán xem nửa kia nghĩ gì!',
    type: 'open'
  },
  {
    q: 'Món ăn yêu thích nhất của TLinh là gì?',
    hint: 'Ai trả lời đúng được 1 điểm 🏆',
    type: 'open'
  },
  {
    q: 'Nếu được siêu năng lực, Đạt sẽ chọn năng lực nào?',
    options: ['Bay được 🦅', 'Đọc suy nghĩ 🧠', 'Dừng thời gian ⏱️', 'Vô hình 👻'],
    type: 'choice'
  },
  {
    q: 'TLinh thích được tặng quà kiểu nào nhất?',
    options: ['Quà vật chất 🎁', 'Trải nghiệm cùng nhau 🌟', 'Viết thư tay 💌', 'Bất ngờ bất kỳ 🎉'],
    type: 'choice'
  },
  {
    q: 'Buổi hẹn hò lý tưởng của hai người là gì?',
    options: ['Xem phim ở nhà 🎬', 'Đi ăn nhà hàng 🍽️', 'Cà phê nói chuyện ☕', 'Đi chơi ngoài trời 🌳'],
    type: 'choice'
  },
  {
    q: 'Con mèo nào ngủ nhiều nhất?',
    hint: '5 bé mèo, mỗi đứa một tính 😸',
    type: 'open'
  },
  {
    q: 'Đạt sẽ làm gì đầu tiên khi trúng số 1 tỷ?',
    options: ['Mua nhà 🏠', 'Đi du lịch ✈️', 'Tiết kiệm 💰', 'Mua đồ cho mèo 🐱'],
    type: 'choice'
  },
];

// ── GAME STATE ────────────────────────────────
let foodList = [...DEFAULT_FOODS];
let spinAnimFrame = null;
let isSpinning = false;

let challenge = null;       // { text, emoji, days, startDate, checks: [] }
let challengeLoading = false;

let quizIdx = 0;
let quizScore = { dat: 0, tlinh: 0 };
let quizAnswered = false;

// ── RENDER GAMES HUB ──────────────────────────
function renderGames(p) {
  p.innerHTML = `
  <div class="games-hero">
    <div class="games-hero-title">🎲 Góc Vui Của Chúng Mình</div>
    <div class="games-hero-sub">Giải trí nhỏ · Kết nối lớn 💕</div>
  </div>
  <div class="games-grid">
    <div class="game-card gc-food" onclick="showGame('food')">
      <div class="gc-emoji">🍜</div>
      <div class="gc-title">Hôm nay ăn gì?</div>
      <div class="gc-desc">Khó chọn quá? Để vòng quay quyết định!</div>
    </div>
    <div class="game-card gc-challenge" onclick="showGame('challenge')">
      <div class="gc-emoji">🎯</div>
      <div class="gc-title">Thử thách tuần</div>
      <div class="gc-desc">Cùng nhau hoàn thành một thử thách nhỏ</div>
    </div>
    <div class="game-card gc-quiz" onclick="showGame('quiz')">
      <div class="gc-emoji">💬</div>
      <div class="gc-title">Quiz đôi</div>
      <div class="gc-desc">Đoán xem nửa kia đang nghĩ gì nào?</div>
    </div>
  </div>
  <div id="game-area"></div>`;
}

function showGame(name) {
  const area = $('game-area');
  if (!area) return;
  if (name === 'food')      renderFoodSpinner(area);
  if (name === 'challenge') renderChallenge(area);
  if (name === 'quiz')      renderQuiz(area);
  // smooth scroll to it
  setTimeout(() => area.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
}

// ══════════════════════════════════════════════
// GAME 1 — HÔM NAY ĂN GÌ?  (Spin Wheel)
// ══════════════════════════════════════════════
function renderFoodSpinner(container) {
  container.innerHTML = `
  <div class="game-section" id="game-food">
    <div class="game-section-title">🍜 Hôm Nay Ăn Gì?</div>

    <div class="wheel-wrap">
      <div class="wheel-pointer">▼</div>
      <canvas id="wheel-canvas" width="280" height="280"></canvas>
    </div>

    <div class="wheel-result" id="wheel-result" style="display:none">
      <span id="wheel-result-text"></span>
    </div>

    <div style="display:flex;gap:.5rem;justify-content:center;margin:.8rem 0">
      <button class="btn btn-peach" onclick="spinWheel()" id="spin-btn">🎰 Quay thôi!</button>
      <button class="btn btn-outline btn-sm" onclick="toggleFoodEdit()">✏️ Sửa danh sách</button>
    </div>

    <div id="food-edit" style="display:none">
      <div class="food-edit-box">
        <div style="font-size:.75rem;font-weight:600;color:var(--ink2);margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.04em">Danh sách món ăn</div>
        <div id="food-tags" class="food-tags"></div>
        <div style="display:flex;gap:.4rem;margin-top:.6rem">
          <input id="food-new-input" placeholder="Thêm món mới..." style="flex:1"
            onkeydown="if(event.key==='Enter'){addFood();}"/>
          <button class="btn btn-peach btn-sm" onclick="addFood()">+</button>
        </div>
      </div>
    </div>
  </div>`;

  drawWheel();
}

const WHEEL_COLORS = [
  '#F5DCC8','#C8DFD0','#D8D0F0','#FEFBE8','#FFE8E4',
  '#E8F0FE','#FFF4F2','#EAF4EE','#F0EDF8','#FBF5E4',
  '#FAE0CC','#D4E8D0','#E8E2F2','#F5E4B0','#F2D5D0',
];
const WHEEL_STROKES = [
  '#E8A87C','#7FAF8A','#9B8EC4','#C9A84C','#D4877A',
  '#7BA3E8','#D4877A','#7FAF8A','#9B8EC4','#C9A84C',
  '#E8A87C','#7FAF8A','#9B8EC4','#E8A87C','#D4877A',
];

let wheelAngle = 0;

function drawWheel(highlightIdx = -1) {
  const canvas = $('wheel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const r = cx - 8;
  const items = foodList.length ? foodList : ['...'];
  const slice = (2 * Math.PI) / items.length;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // shadow circle
  ctx.save();
  ctx.shadowColor = 'rgba(44,36,32,.15)';
  ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2*Math.PI);
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.restore();

  items.forEach((item, i) => {
    const start = wheelAngle + i * slice;
    const end = start + slice;
    const mid = start + slice / 2;

    // slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = i === highlightIdx
      ? '#F5C5A3'
      : WHEEL_COLORS[i % WHEEL_COLORS.length];
    ctx.fill();
    ctx.strokeStyle = WHEEL_STROKES[i % WHEEL_STROKES.length];
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // text
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(mid);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#4A3728';
    const fontSize = items.length > 10 ? 10 : 12;
    ctx.font = `600 ${fontSize}px DM Sans, sans-serif`;
    // truncate long names
    const label = item.length > 14 ? item.slice(0,12)+'…' : item;
    ctx.fillText(label, r - 10, 4);
    ctx.restore();
  });

  // center circle
  ctx.beginPath();
  ctx.arc(cx, cy, 20, 0, 2*Math.PI);
  ctx.fillStyle = '#fff';
  ctx.strokeStyle = '#EDE8E0';
  ctx.lineWidth = 2;
  ctx.fill(); ctx.stroke();

  ctx.font = '600 14px DM Sans';
  ctx.fillStyle = '#4A3728';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🎲', cx, cy);
}

function spinWheel() {
  if (isSpinning) return;
  isSpinning = true;
  const btn = $('spin-btn');
  if (btn) btn.disabled = true;

  const result = $('wheel-result');
  if (result) result.style.display = 'none';

  const items = foodList.length ? foodList : ['...'];
  const extraSpins = (5 + Math.floor(Math.random() * 5)) * 2 * Math.PI;
  const targetSlice = Math.floor(Math.random() * items.length);
  const sliceAngle = (2 * Math.PI) / items.length;
  // spin so targetSlice lands at top (pointer at -π/2)
  const targetAngle = -Math.PI / 2 - (targetSlice * sliceAngle + sliceAngle / 2);
  const totalRotation = extraSpins + ((targetAngle - wheelAngle) % (2 * Math.PI));

  const startAngle = wheelAngle;
  const duration = 3000 + Math.random() * 1000;
  const startTime = performance.now();

  function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

  function frame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    wheelAngle = startAngle + totalRotation * easeOut(progress);
    drawWheel();

    if (progress < 1) {
      spinAnimFrame = requestAnimationFrame(frame);
    } else {
      isSpinning = false;
      wheelAngle = startAngle + totalRotation;
      drawWheel(targetSlice);
      if (btn) btn.disabled = false;
      // show result
      if (result) {
        const rt = $('wheel-result-text');
        if (rt) rt.textContent = items[targetSlice];
        result.style.display = 'block';
        result.classList.add('pop');
        setTimeout(() => result.classList.remove('pop'), 400);
      }
      toast('🍜 Hôm nay ăn: ' + items[targetSlice] + '!');
    }
  }
  requestAnimationFrame(frame);
}

function toggleFoodEdit() {
  const el = $('food-edit');
  if (!el) return;
  const open = el.style.display !== 'none';
  el.style.display = open ? 'none' : 'block';
  if (!open) renderFoodTags();
}

function renderFoodTags() {
  const el = $('food-tags'); if (!el) return;
  el.innerHTML = foodList.map((f, i) => `
    <span class="food-tag">
      ${f}
      <button onclick="removeFood(${i})" class="food-tag-del">×</button>
    </span>`).join('');
}

function addFood() {
  const inp = $('food-new-input'); if (!inp) return;
  const val = inp.value.trim();
  if (!val) return;
  if (foodList.includes(val)) { toast('Món này đã có rồi!','err'); return; }
  foodList.push(val);
  inp.value = '';
  renderFoodTags();
  drawWheel();
  toast('✅ Đã thêm: ' + val);
}

function removeFood(idx) {
  if (foodList.length <= 2) { toast('Cần ít nhất 2 món nhé!','err'); return; }
  foodList.splice(idx, 1);
  renderFoodTags();
  drawWheel();
}

// ══════════════════════════════════════════════
// GAME 2 — THỬ THÁCH TUẦN
// ══════════════════════════════════════════════
async function renderChallenge(container) {
  // Load from Supabase
  const { data } = await SB.from('notes')
    .select('*').eq('tag', '__challenge__')
    .order('created_at', { ascending: false }).limit(1);

  if (data && data.length) {
    try { challenge = JSON.parse(data[0].body); challenge._dbId = data[0].id; } catch(e) { challenge = null; }
  }

  renderChallengeUI(container);
}

function renderChallengeUI(container) {
  if (!challenge) {
    container.innerHTML = `
    <div class="game-section" id="game-challenge">
      <div class="game-section-title">🎯 Thử Thách Tuần</div>
      <div class="challenge-empty">
        <div style="font-size:2.5rem;margin-bottom:.5rem">🎰</div>
        <div style="font-weight:600;color:var(--ink);">Chưa có thử thách nào!</div>
        <div style="font-size:.8rem;color:var(--ink3);margin:.3rem 0 1rem">Hãy bắt đầu một thử thách mới nhé</div>
        <button class="btn btn-peach" onclick="randomChallenge()">🎲 Random thử thách!</button>
        <div style="margin:.5rem 0;font-size:.75rem;color:var(--ink3)">— hoặc —</div>
        <div style="display:flex;gap:.4rem;max-width:300px;margin:0 auto">
          <input id="custom-challenge" placeholder="Tự đặt thử thách..." style="flex:1;font-size:.82rem"/>
          <button class="btn btn-outline btn-sm" onclick="startCustomChallenge()">Bắt đầu</button>
        </div>
      </div>
    </div>`;
    return;
  }

  const start = new Date(challenge.startDate);
  const today = new Date(); today.setHours(0,0,0,0);
  const totalDays = challenge.days;
  const checks = challenge.checks || [];
  const todayStr = today.toISOString().split('T')[0];
  const checkedToday = checks.includes(todayStr);
  const streak = calcStreak(checks);
  const pct = Math.round((checks.length / totalDays) * 100);
  const daysLeft = totalDays - checks.length;
  const done = checks.length >= totalDays;

  container.innerHTML = `
  <div class="game-section" id="game-challenge">
    <div class="game-section-title">🎯 Thử Thách Tuần</div>
    <div class="challenge-card ${done ? 'challenge-done' : ''}">
      <div class="challenge-emoji">${challenge.emoji}</div>
      <div class="challenge-text">${challenge.text}</div>
      <div class="challenge-meta">${totalDays} ngày · Streak: ${streak} 🔥</div>

      <div class="challenge-prog-label">
        <span>Tiến độ</span>
        <span>${checks.length}/${totalDays} ngày</span>
      </div>
      <div class="challenge-prog-track">
        <div class="challenge-prog-fill" style="width:${pct}%"></div>
      </div>

      <div class="challenge-days">
        ${Array.from({length: totalDays}, (_,i) => {
          const d = new Date(start); d.setDate(d.getDate() + i);
          const ds = d.toISOString().split('T')[0];
          const checked = checks.includes(ds);
          const isToday = ds === todayStr;
          return `<div class="challenge-day ${checked?'day-done':''} ${isToday?'day-today':''}">
            ${checked ? '✓' : (isToday ? '●' : d.getDate())}
          </div>`;
        }).join('')}
      </div>

      ${done ? `
        <div class="challenge-congrats">🎉 Hoàn thành rồi! Hai người giỏi quá!</div>
        <button class="btn btn-sage btn-full" style="margin-top:.5rem" onclick="endChallenge()">🎲 Thử thách mới!</button>
      ` : `
        <div style="display:flex;gap:.5rem;margin-top:.8rem">
          ${!checkedToday ? `
            <button class="btn btn-sage btn-full" onclick="checkInChallenge()">✅ Check-in hôm nay!</button>
          ` : `
            <div class="btn btn-outline btn-full" style="cursor:default;opacity:.6">✅ Đã check-in hôm nay</div>
          `}
        </div>
        <button class="btn btn-outline btn-sm" style="margin-top:.5rem;width:100%" onclick="endChallenge()">🔄 Đổi thử thách</button>
      `}
    </div>
  </div>`;
}

function calcStreak(checks) {
  if (!checks.length) return 0;
  const sorted = [...checks].sort();
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    const a = new Date(sorted[i]), b = new Date(sorted[i-1]);
    if ((a - b) === 86400000) streak++;
    else break;
  }
  return streak;
}

function randomChallenge() {
  const c = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
  startChallenge(c.emoji, c.text, c.days);
}

function startCustomChallenge() {
  const inp = $('custom-challenge'); if (!inp) return;
  const text = inp.value.trim(); if (!text) { toast('Nhập nội dung thử thách nhé!','err'); return; }
  startChallenge('🎯', text, 7);
}

async function startChallenge(emoji, text, days) {
  challenge = { emoji, text, days, startDate: new Date().toISOString().split('T')[0], checks: [] };
  await saveChallenge();
  const area = $('game-area'); if (area) renderChallengeUI(area);
  toast('🎯 Bắt đầu thử thách!');
}

async function checkInChallenge() {
  if (!challenge) return;
  const today = new Date().toISOString().split('T')[0];
  if (challenge.checks.includes(today)) { toast('Hôm nay check-in rồi!','err'); return; }
  challenge.checks.push(today);
  await saveChallenge();
  const area = $('game-area'); if (area) renderChallengeUI(area);
  const done = challenge.checks.length >= challenge.days;
  toast(done ? '🎉 Hoàn thành thử thách rồi!!!' : `✅ Check-in! Streak: ${calcStreak(challenge.checks)} 🔥`);
}

async function endChallenge() {
  if (challenge?._dbId) await SB.from('notes').delete().eq('id', challenge._dbId);
  challenge = null;
  const area = $('game-area'); if (area) renderChallengeUI(area);
}

async function saveChallenge() {
  const body = JSON.stringify(challenge);
  if (challenge._dbId) {
    await SB.from('notes').update({ body }).eq('id', challenge._dbId);
  } else {
    const { data } = await SB.from('notes').insert({
      title: 'Thử thách: ' + challenge.text.slice(0,30),
      body, tag: '__challenge__', color: 'nc-3'
    }).select();
    if (data?.[0]) challenge._dbId = data[0].id;
  }
}

// ══════════════════════════════════════════════
// GAME 3 — QUIZ ĐÔI
// ══════════════════════════════════════════════
function renderQuiz(container) {
  quizIdx = 0;
  quizScore = { dat: 0, tlinh: 0 };
  renderQuizQuestion(container);
}

function renderQuizQuestion(container) {
  if (quizIdx >= QUIZ_QUESTIONS.length) {
    renderQuizResult(container);
    return;
  }
  const q = QUIZ_QUESTIONS[quizIdx];
  const total = QUIZ_QUESTIONS.length;
  quizAnswered = false;

  container.innerHTML = `
  <div class="game-section" id="game-quiz">
    <div class="game-section-title">💬 Quiz Đôi</div>
    <div class="quiz-card">
      <div class="quiz-progress">
        <div class="quiz-prog-track">
          <div class="quiz-prog-fill" style="width:${(quizIdx/total*100)}%"></div>
        </div>
        <span>${quizIdx + 1}/${total}</span>
      </div>

      <div class="quiz-score-row">
        <span class="quiz-score-badge">Đạt: ${quizScore.dat} ⭐</span>
        <span class="quiz-score-badge">TLinh: ${quizScore.tlinh} ⭐</span>
      </div>

      <div class="quiz-q">${q.q}</div>
      ${q.hint ? `<div class="quiz-hint">💡 ${q.hint}</div>` : ''}

      ${q.type === 'choice' ? `
        <div class="quiz-options">
          ${q.options.map((opt,i) => `
            <button class="quiz-opt" onclick="answerQuiz(${i})">${opt}</button>
          `).join('')}
        </div>
      ` : `
        <div class="quiz-open">
          <textarea id="quiz-answer" placeholder="Cả hai cùng viết câu trả lời..." style="min-height:70px"></textarea>
          <div style="display:flex;gap:.5rem;margin-top:.5rem">
            <button class="btn btn-peach" style="flex:1" onclick="submitOpenAnswer()">💬 Reveal!</button>
          </div>
        </div>
      `}

      <div class="quiz-actions" id="quiz-actions" style="display:none">
        <div class="quiz-reveal-box" id="quiz-reveal"></div>
        <div style="display:flex;gap:.5rem;margin-top:.8rem">
          <button class="btn btn-outline" style="flex:1" onclick="awardPoint('dat')">+1 Đạt đúng</button>
          <button class="btn btn-outline" style="flex:1" onclick="awardPoint('tlinh')">+1 TLinh đúng</button>
        </div>
        <button class="btn btn-peach btn-full" style="margin-top:.5rem" onclick="nextQuiz()">Câu tiếp → </button>
      </div>
    </div>
  </div>`;
}

function answerQuiz(idx) {
  if (quizAnswered) return;
  quizAnswered = true;
  const q = QUIZ_QUESTIONS[quizIdx];
  // highlight chosen
  document.querySelectorAll('.quiz-opt').forEach((btn, i) => {
    btn.classList.add(i === idx ? 'quiz-opt-chosen' : 'quiz-opt-dim');
    btn.disabled = true;
  });
  const actions = $('quiz-actions'), reveal = $('quiz-reveal');
  if (reveal) reveal.innerHTML = `<span style="font-size:.85rem;color:var(--ink2)">Cùng thảo luận xem ai đoán đúng nhé! 😄</span>`;
  if (actions) actions.style.display = 'block';
}

function submitOpenAnswer() {
  quizAnswered = true;
  const ans = $('quiz-answer')?.value.trim() || '';
  const actions = $('quiz-actions'), reveal = $('quiz-reveal');
  if (reveal) reveal.innerHTML = `<div style="background:var(--peach-xl);border-radius:12px;padding:.75rem;font-style:italic;font-size:.85rem">"${ans || '(Chưa viết gì)'}"</div>`;
  if (actions) actions.style.display = 'block';
}

function awardPoint(who) {
  quizScore[who]++;
  toast(who === 'dat' ? '⭐ +1 điểm cho Đạt!' : '⭐ +1 điểm cho TLinh!');
  nextQuiz();
}

function nextQuiz() {
  quizIdx++;
  const area = $('game-area');
  if (area) renderQuizQuestion(area);
}

function renderQuizResult(container) {
  const winner = quizScore.dat > quizScore.tlinh ? 'Đạt' :
                 quizScore.tlinh > quizScore.dat ? 'TLinh' : null;
  container.innerHTML = `
  <div class="game-section" id="game-quiz">
    <div class="game-section-title">💬 Quiz Đôi — Kết quả</div>
    <div class="quiz-card" style="text-align:center">
      <div style="font-size:3rem;margin-bottom:.5rem">${winner ? '🏆' : '🤝'}</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:600;color:var(--ink);margin-bottom:.3rem">
        ${winner ? winner + ' thắng rồi!' : 'Hòa nhau! Hai người đều hiểu nhau 💕'}
      </div>
      <div class="quiz-score-row" style="justify-content:center;margin:1rem 0">
        <span class="quiz-score-badge quiz-score-lg">Đạt: ${quizScore.dat} ⭐</span>
        <span class="quiz-score-badge quiz-score-lg">TLinh: ${quizScore.tlinh} ⭐</span>
      </div>
      <p style="font-size:.8rem;color:var(--ink3);font-style:italic;margin-bottom:1rem">
        ${winner ? `${winner} hiểu nửa kia hơn một chút 😄` : 'Hai người hiểu nhau rất tốt rồi! 🌿'}
      </p>
      <button class="btn btn-peach btn-full" onclick="showGame('quiz')">🔄 Chơi lại</button>
    </div>
  </div>`;
}
