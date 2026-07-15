/* ===================================================================
   PM QUEST — Product Management quiz game (v2)
   Requires global QUESTION_BANK (array) from questions.js
   =================================================================== */
(function () {
  "use strict";

  const STORE = "pmquest_v2";
  const OLD_STORE = "pmquest_v1";
  const ROUND_SIZE = 10;
  const Q_TIME_MS = 30000;               // per-question countdown
  const SPEED_MAX_BONUS = 10;            // max speed XP per question

  const LEVELS = [
    { name: "Estagiário", min: 0,    ic: "🌱" },
    { name: "Júnior",     min: 120,  ic: "🐣" },
    { name: "Associado",  min: 350,  ic: "📘" },
    { name: "Intermédio", min: 750,  ic: "⚙️" },
    { name: "Sénior",     min: 1400, ic: "🚀" },
    { name: "Líder",      min: 2400, ic: "👑" },
  ];
  const POINTS = { junior: 10, mid: 15, senior: 20 };

  const ACHIEVEMENTS = [
    { id: "first",       ic: "🎬", nm: "Primeira Ronda",   ds: "Completa 1 exercício",          cond: s => s.rounds >= 1 },
    { id: "perfect",     ic: "💯", nm: "Ronda Perfeita",   ds: "Acerta 10/10 numa ronda",       cond: s => s.perfectRounds >= 1 },
    { id: "a100",        ic: "📚", nm: "Centurião",        ds: "Responde a 100 questões",       cond: s => s.answered >= 100 },
    { id: "a500",        ic: "🏛️", nm: "Erudito",          ds: "Responde a 500 questões",       cond: s => s.answered >= 500 },
    { id: "streak3",     ic: "🔥", nm: "Em Chamas",        ds: "Sequência de 3 dias",           cond: s => s.streak.best >= 3 },
    { id: "streak7",     ic: "⚡", nm: "Imparável",        ds: "Sequência de 7 dias",           cond: s => s.streak.best >= 7 },
    { id: "senior25",    ic: "🧠", nm: "Mente Sénior",     ds: "25 questões difíceis certas",   cond: s => s.seniorCorrect >= 25 },
    { id: "speed",       ic: "⏱️", nm: "Relâmpago",        ds: "10 respostas rápidas certas",   cond: s => s.speedAnswers >= 10 },
    { id: "sharp",       ic: "🎯", nm: "Afiado",           ds: "90% precisão (50+ respostas)",  cond: s => s.answered >= 50 && s.correct / s.answered >= 0.9 },
    { id: "reachSenior", ic: "🚀", nm: "Product Sénior",   ds: "Atinge o nível Sénior",         cond: s => levelIndex(s.xp) >= 4 },
    { id: "reachLider",  ic: "👑", nm: "Líder de Produto",  ds: "Atinge o nível Líder",          cond: s => levelIndex(s.xp) >= 5 },
    { id: "comeback",    ic: "🔁", nm: "Regresso",         ds: "Domina 10 erros na revisão",    cond: s => s.reviewCleared >= 10 },
    { id: "allq",        ic: "🎓", nm: "Banco Completo",    ds: "Respondeu a TODAS as perguntas", cond: s => BANK.length > 0 && (s.everSeen || []).length >= BANK.length },
  ];

  // topic keyword -> external reference (for "Saber mais")
  const REFS = [
    { kw: ["scrum", "sprint", "backlog", "increment", "daily", "retrospective", "definition of", "empiric", "kanban", "agile manifesto", "timebox", "developers", "scrum master"], label: "Scrum Guide", url: "https://scrumguides.org/" },
    { kw: ["safe", "art", "pi planning", "release train", "wsjf", "enabler", "lean budget", "program board", "features vs", "trains", "solution train", "little's law", "flow metric", "cost of delay"], label: "Scaled Agile (SAFe)", url: "https://scaledagileframework.com/" },
    { kw: ["jtbd", "jobs to be done", "discovery", "interview", "persona", "usability", "prototyp", "opportunity", "assumption", "hypothesis", "riskiest", "empathy", "confirmation", "problem vs", "dual-track"], label: "Continuous Discovery / NN/g", url: "https://www.nngroup.com/articles/" },
    { kw: ["north star", "okr", "kano", "rice", "wsjf", "moscow", "roadmap", "prioriti", "story mapping", "value vs effort", "feature factory", "goal", "trade-off", "saying no"], label: "Roman Pichler — frameworks", url: "https://www.romanpichler.com/blog/" },
    { kw: ["aarrr", "retention", "cohort", "funnel", "churn", "ltv", "cac", "north star", "a/b", "statistical", "sample", "heart", "dau", "activation", "leading", "guardrail", "revenue", "vanity"], label: "Amplitude / Reforge — metrics", url: "https://amplitude.com/north-star" },
    { kw: ["stakeholder", "raci", "feedback", "leadership", "negotiat", "psychological", "coaching", "communication", "meeting", "conflict", "managing up", "servant", "driving alignment", "cross-functional", "team health", "expectation"], label: "HBR — leadership", url: "https://hbr.org/topic/leadership" },
    { kw: ["api", "rest", "sql", "database", "cloud", "architecture", "ai/ml", "generative", "llm", "security", "privacy", "devops", "ci/cd", "latency", "version control", "feature flag", "webhook", "data pipeline", "mobile vs", "technical debt"], label: "Atlassian — tech for PMs", url: "https://www.atlassian.com/agile" },
    { kw: ["bank", "fintech", "loan", "deposit", "card", "payment", "kyc", "aml", "pricing", "margin", "p&l", "go-to-market", "monetiz", "unit econ", "ussd", "interest", "apr", "mortgage", "leasing", "overdraft", "regulation", "digital channel", "customer acqui", "product-led"], label: "CFI — finance & fintech", url: "https://corporatefinanceinstitute.com/resources/" },
    { kw: ["positioning", "moat", "competitiv", "business model", "value proposition", "product-market", "life cycle", "vision", "strategy", "differ", "marty cagan", "principle", "mission", "porter", "swot"], label: "SVPG — Marty Cagan", url: "https://www.svpg.com/articles/" },
  ];
  function refFor(topic) {
    const t = (topic || "").toLowerCase();
    for (const r of REFS) if (r.kw.some(k => t.includes(k))) return r;
    return null;
  }

  // ---------- bank prep ----------
  function hash(str) { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0; return "q" + h.toString(36); }
  function norm(s) { return String(s || "").trim().toLowerCase().replace(/\s+/g, " "); }
  function decode(s) { return String(s || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'"); }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  // Current UI language + Portuguese translations (keyed by the exact English
  // question text). Falls back to English wherever a translation is missing.
  const LANG = (window.PMQ_I18N && PMQ_I18N.getLang) ? PMQ_I18N.getLang() : "pt";
  const QPT = window.QUESTION_BANK_PT || {};

  function prepBank(raw) {
    const seen = new Set(), out = [];
    (raw || []).forEach(it => {
      if (!it || typeof it.q !== "string" || !Array.isArray(it.options) || it.options.length !== 4) return;
      if (typeof it.answer !== "number" || it.answer < 0 || it.answer > 3) return;
      const key = norm(it.q); if (seen.has(key)) return; seen.add(key);
      const dif = ["junior", "mid", "senior"].includes(it.difficulty) ? it.difficulty : "mid";

      // Pick PT text if available (options must be in the SAME order as EN so
      // the answer index still points at the correct option).
      let qTxt = it.q, optArr = it.options, expTxt = it.explanation;
      const tr = LANG === "pt" ? QPT[it.q] : null;
      if (tr) {
        if (typeof tr.q === "string") qTxt = tr.q;
        if (Array.isArray(tr.options) && tr.options.length === 4) optArr = tr.options;
        if (typeof tr.explanation === "string") expTxt = tr.explanation;
      }

      // FEATURE 8: answer-index shuffle
      const opts = optArr.map((t, i) => ({ t: decode(t), correct: i === it.answer }));
      shuffle(opts);
      out.push({
        id: hash(it.q), q: decode(qTxt).trim(),
        options: opts.map(o => o.t), answer: opts.findIndex(o => o.correct),
        explanation: decode(expTxt || "").trim(),
        topic: decode(it.topic || "Product").trim(), difficulty: dif,
      });
    });
    return out;
  }
  const BANK = prepBank(window.QUESTION_BANK);
  const BY_ID = {}; BANK.forEach(q => BY_ID[q.id] = q);
  const TOPICS = [...new Set(BANK.map(q => q.topic))].sort((a, b) => a.localeCompare(b));

  // ---------- state ----------
  function fresh() {
    return {
      xp: 0, answered: 0, correct: 0, rounds: 0, perfectRounds: 0,
      seniorCorrect: 0, speedAnswers: 0, reviewCleared: 0,
      seen: [], everSeen: [], wrong: [], byTopic: {}, achievements: [], xpHistory: [],
      streak: { count: 0, best: 0, last: "" },
      settings: { mode: "study", sound: true, theme: "light", timer: true },
    };
  }
  function load() {
    try { const s = JSON.parse(localStorage.getItem(STORE)); if (s && typeof s.xp === "number") return migrateShape(s); } catch (e) {}
    // migrate from v1
    try {
      const o = JSON.parse(localStorage.getItem(OLD_STORE));
      if (o && typeof o.xp === "number") { const s = fresh(); s.xp = o.xp; s.answered = o.answered || 0; s.correct = o.correct || 0; s.rounds = o.rounds || 0; s.seen = o.seen || []; s.byTopic = o.byTopic || {}; return s; }
    } catch (e) {}
    return fresh();
  }
  function migrateShape(s) { const f = fresh(); return Object.assign(f, s, { settings: Object.assign(f.settings, s.settings || {}), streak: Object.assign(f.streak, s.streak || {}) }); }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
    // Notify the optional cloud-sync layer (no-op if supabase-sync.js is absent).
    if (window.PMQuestCloud && typeof window.PMQuestCloud.onSave === "function") {
      try { window.PMQuestCloud.onSave(state); } catch (e) {}
    }
  }
  let state = load();

  // ---------- helpers ----------
  function levelIndex(xp) { let i = 0; for (let k = 0; k < LEVELS.length; k++) if (xp >= LEVELS[k].min) i = k; return i; }
  function nextLevel(xp) { const i = levelIndex(xp); return i < LEVELS.length - 1 ? LEVELS[i + 1] : null; }
  const $ = id => document.getElementById(id);
  function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  const SCREENS = ["home", "quiz", "res", "stats", "lead"];
  function show(name) { SCREENS.forEach(k => $("screen-" + k).classList.toggle("hidden", k !== name)); window.scrollTo(0, 0); }

  // ---------- sound (Web Audio) ----------
  let AC = null;
  function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return AC; }
  function beep(freqs, dur, type, gain) {
    if (!state.settings.sound) return; const c = ac(); if (!c) return;
    let t = c.currentTime;
    freqs.forEach((f, i) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain || 0.15, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur); t += dur * 0.85;
    });
  }
  const sndCorrect = () => beep([660, 990], 0.13, "sine", 0.16);
  const sndWrong = () => beep([200, 150], 0.18, "square", 0.12);
  const sndLevel = () => beep([523, 659, 784, 1047], 0.16, "triangle", 0.18);

  // ---------- confetti ----------
  function confetti() {
    const cv = $("confetti"), ctx = cv.getContext("2d");
    cv.width = innerWidth; cv.height = innerHeight;
    const cols = ["#f2b705", "#0033a0", "#e2231a", "#1a9e5f", "#2f6bd6"];
    const P = Array.from({ length: 140 }, () => ({ x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.4, r: 4 + Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)], vy: 2 + Math.random() * 4, vx: -2 + Math.random() * 4, a: Math.random() * 6.28 }));
    let frames = 0;
    (function draw() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      P.forEach(p => { p.y += p.vy; p.x += p.vx; p.a += 0.1; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6); ctx.restore(); });
      if (++frames < 160) requestAnimationFrame(draw); else ctx.clearRect(0, 0, cv.width, cv.height);
    })();
  }

  // ---------- theme ----------
  function applyTheme() { document.body.classList.toggle("dark", state.settings.theme === "dark"); }

  // =====================================================================
  //  HOME / DASHBOARD
  // =====================================================================
  function renderHome() {
    checkStreakDecay();
    const li = levelIndex(state.xp), lv = LEVELS[li], nx = nextLevel(state.xp);
    $("medal").textContent = lv.ic; $("rankName").textContent = lv.name;
    $("xpLine").textContent = state.xp + " XP" + (nx ? "  ·  próximo: " + nx.name : "  ·  nível máximo!");
    const base = lv.min, target = nx ? nx.min : lv.min;
    $("bar").style.width = (nx ? Math.min(100, Math.round(((state.xp - base) / (target - base)) * 100)) : 100) + "%";
    $("barFrom").textContent = lv.name; $("barTo").textContent = nx ? nx.name + " (" + target + " XP)" : "MAX";

    const acc = state.answered ? Math.round(state.correct / state.answered * 100) : 0;
    const remaining = Math.max(0, BANK.length - state.seen.length);
    $("stAnswered").textContent = state.answered; $("stAcc").textContent = acc + "%";
    $("stRounds").textContent = state.rounds; $("stRemaining").textContent = remaining;

    const track = $("levelsTrack"); track.innerHTML = "";
    LEVELS.forEach((L, i) => { const d = document.createElement("div"); d.className = "lv" + (i < li ? " done" : "") + (i === li ? " cur" : ""); d.innerHTML = '<div class="ball">' + (i < li ? "✓" : L.ic) + "</div>" + L.name; track.appendChild(d); });

    renderWeakChips();

    // streak chip
    const sc = $("streakChip");
    if (state.streak.count > 0) { sc.classList.remove("off"); sc.innerHTML = "🔥 " + state.streak.count + " dia" + (state.streak.count > 1 ? "s" : ""); }
    else { sc.classList.add("off"); sc.innerHTML = "🔥 0"; }

    $("startBtn").textContent = remaining <= 0 ? "🎉 Banco completo! Recomeçar questões" : "▶  Iniciar Exercício (10 questões)";
    $("reviewBtn").innerHTML = "🔁 Rever Erros<span> (" + state.wrong.length + ")</span>";
    $("reviewBtn").disabled = state.wrong.length === 0;
    $("bankTotal").textContent = BANK.length;
  }
  function renderWeakChips() {
    const wrap = $("weakWrap"), chips = $("weakChips");
    const e = Object.keys(state.byTopic).map(t => ({ t, c: state.byTopic[t][0], n: state.byTopic[t][1] })).filter(x => x.n >= 3);
    if (!e.length) { wrap.classList.add("hidden"); return; }
    wrap.classList.remove("hidden"); e.sort((a, b) => a.c / a.n - b.c / b.n); chips.innerHTML = "";
    e.slice(0, 6).forEach(x => { const r = Math.round(x.c / x.n * 100); const c = document.createElement("span"); c.className = "chip" + (r >= 70 ? " good" : ""); c.textContent = x.t + " · " + r + "%"; chips.appendChild(c); });
  }

  // =====================================================================
  //  ROUND BUILDING
  // =====================================================================
  let round = null;   // {items, idx, answers[], config}
  let lastConfig = { type: "normal" };
  let timerId = null, qStart = 0;

  function poolFor(config) {
    const seenSet = new Set(state.seen);
    let pool;
    if (config.type === "review") {
      pool = state.wrong.map(id => BY_ID[id]).filter(Boolean);
      return shuffle(pool).slice(0, ROUND_SIZE);
    }
    if (config.type === "weak") {
      const weak = Object.keys(state.byTopic).map(t => ({ t, r: state.byTopic[t][1] ? state.byTopic[t][0] / state.byTopic[t][1] : 1, n: state.byTopic[t][1] }))
        .filter(x => x.n >= 3).sort((a, b) => a.r - b.r).slice(0, 6).map(x => x.t);
      const set = new Set(weak);
      pool = BANK.filter(q => set.has(q.topic) && !seenSet.has(q.id));
      if (pool.length < ROUND_SIZE) pool = pool.concat(BANK.filter(q => set.has(q.topic) && !pool.includes(q)));
      return shuffle(pool).slice(0, ROUND_SIZE);
    }
    // normal or filtered
    pool = BANK.filter(q => {
      if (config.topic && config.topic !== "__all__" && q.topic !== config.topic) return false;
      if (config.difficulty && config.difficulty !== "all" && q.difficulty !== config.difficulty) return false;
      return true;
    });
    let unseen = pool.filter(q => !seenSet.has(q.id));
    if (unseen.length === 0) { // exhausted this filter -> reset seen for these & reuse
      if (config.type === "normal" && (!config.topic || config.topic === "__all__") && (!config.difficulty || config.difficulty === "all")) { state.seen = []; save(); }
      unseen = pool.slice();
    }
    shuffle(unseen);
    // bias to level difficulty for plain normal rounds
    if (config.type === "normal" && (!config.difficulty || config.difficulty === "all")) {
      const li = levelIndex(state.xp), wMid = li >= 2, wSen = li >= 4;
      unseen.sort((a, b) => w(b, wMid, wSen) - w(a, wMid, wSen));
      const top = unseen.slice(0, ROUND_SIZE * 3); shuffle(top); return top.slice(0, ROUND_SIZE);
    }
    return unseen.slice(0, ROUND_SIZE);
  }
  function w(q, wMid, wSen) { let x = Math.random() * 0.6; if (q.difficulty === "junior") x += 1; if (q.difficulty === "mid") x += wMid ? 1.4 : 0.6; if (q.difficulty === "senior") x += wSen ? 1.6 : 0.3; return x; }

  function startRound(config) {
    lastConfig = config || lastConfig || { type: "normal" };
    const items = poolFor(lastConfig);
    if (!items.length) { alert("Sem questões disponíveis para este modo/filtro."); return; }
    round = { items, idx: 0, answers: items.map(() => ({ sel: null, remMs: 0, answered: false })), config: lastConfig };
    ac(); // unlock audio on gesture
    show("quiz"); renderQuestion();
  }

  // =====================================================================
  //  QUIZ
  // =====================================================================
  const KEYS = ["A", "B", "C", "D"];
  function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }
  function startTimer() {
    stopTimer(); if (!state.settings.timer) { $("timerWrap").classList.add("hidden"); return; }
    $("timerWrap").classList.remove("hidden"); qStart = Date.now();
    tick();
    timerId = setInterval(tick, 100);
  }
  function tick() {
    const elapsed = Date.now() - qStart, rem = Math.max(0, Q_TIME_MS - elapsed);
    const pct = rem / Q_TIME_MS * 100;
    const bar = $("timerBar"); bar.querySelector("i").style.width = pct + "%";
    bar.className = "timerbar" + (pct < 20 ? " danger" : pct < 45 ? " warn" : "");
    $("timerNum").textContent = Math.ceil(rem / 1000) + "s";
    if (rem <= 0) { stopTimer(); onTimeout(); }
  }

  function renderQuestion() {
    const q = round.items[round.idx], a = round.answers[round.idx];
    const dots = $("dots"); dots.innerHTML = "";
    round.items.forEach((_, i) => {
      const el = document.createElement("i");
      const ans = round.answers[i];
      if (ans.answered) el.className = state.settings.mode === "study" ? (ans.sel === round.items[i].answer ? "ok" : "bad") : "done";
      else if (i === round.idx) el.className = "now";
      dots.appendChild(el);
    });
    $("qCount").textContent = "Questão " + (round.idx + 1) + " / " + round.items.length;
    $("qTopic").textContent = q.topic;
    const dt = $("qDif"); dt.textContent = q.difficulty === "junior" ? "Fácil" : q.difficulty === "mid" ? "Médio" : "Difícil"; dt.className = "dif-" + q.difficulty;
    $("qText").textContent = q.q;
    $("reveal").classList.add("hidden");

    const opts = $("opts"); opts.innerHTML = "";
    const revealed = a.answered && (state.settings.mode === "study" || false);
    q.options.forEach((text, i) => {
      const b = document.createElement("button");
      b.className = "opt" + (a.sel === i ? " sel" : "");
      b.setAttribute("aria-label", KEYS[i] + ": " + text);
      if (revealed) {
        b.disabled = true;
        if (i === q.answer) b.classList.add("correct");
        else if (i === a.sel) b.classList.add("wrong");
      }
      let mark = "";
      if (revealed && i === q.answer) mark = '<span class="mark">✓</span>';
      else if (revealed && i === a.sel) mark = '<span class="mark">✗</span>';
      b.innerHTML = '<span class="k">' + KEYS[i] + '</span><span class="tx">' + esc(text) + "</span>" + mark;
      b.onclick = () => choose(i);
      opts.appendChild(b);
    });

    if (revealed) showReveal(q, a);

    const nav = $("nextBtn");
    nav.disabled = !a.answered;
    nav.textContent = round.idx === round.items.length - 1 ? "Terminar  ✓" : "Próxima  →";

    if (!a.answered) startTimer(); else { stopTimer(); $("timerWrap").classList.toggle("hidden", !state.settings.timer); }
  }

  function showReveal(q, a) {
    const r = $("reveal"); const ok = a.sel === q.answer;
    r.className = "reveal " + (ok ? "ok" : "bad");
    const ref = refFor(q.topic);
    r.innerHTML = '<div class="rl">' + (ok ? "✓ Correcto!" : "✗ Incorrecto") + "</div>" +
      "<div><b>Porquê:</b> " + esc(q.explanation || "—") + "</div>" +
      (ref ? '<a class="srclink" href="' + ref.url + '" target="_blank" rel="noopener">🔗 Saber mais: ' + esc(ref.label) + "</a>" : "");
    r.classList.remove("hidden");
  }

  function choose(i) {
    const a = round.answers[round.idx];
    if (a.answered && state.settings.mode === "study") return;   // locked after reveal in study
    if (!a.answered) a.remMs = state.settings.timer ? Math.max(0, Q_TIME_MS - (Date.now() - qStart)) : Q_TIME_MS;
    a.sel = i; a.answered = true;
    stopTimer();
    if (state.settings.mode === "study") { const q = round.items[round.idx]; (a.sel === q.answer ? sndCorrect : sndWrong)(); }
    renderQuestion();
  }

  function onTimeout() {
    const a = round.answers[round.idx];
    if (!a.answered) { a.answered = true; a.sel = null; a.remMs = 0; }
    if (state.settings.mode === "study") { sndWrong(); renderQuestion(); }
    else { nextQuestion(); }   // exam: auto-submit
  }

  function nextQuestion() {
    const a = round.answers[round.idx];
    if (!a.answered) return;
    stopTimer();
    if (round.idx < round.items.length - 1) { round.idx++; renderQuestion(); }
    else finishRound();
  }

  // =====================================================================
  //  RESULTS
  // =====================================================================
  function speedBonus(a, q) {
    if (!state.settings.timer) return 0;
    if (a.sel !== q.answer) return 0;
    return Math.max(0, Math.min(SPEED_MAX_BONUS, Math.round(a.remMs / 1000 / 3)));
  }

  function finishRound() {
    let correct = 0, xpGained = 0, bonusTotal = 0, roundSpeed = 0;
    const wrongs = [];
    round.items.forEach((q, i) => {
      const a = round.answers[i], ok = a.sel === q.answer;
      if (ok) {
        correct++; const bon = speedBonus(a, q); bonusTotal += bon; xpGained += POINTS[q.difficulty] + bon;
        if (q.difficulty === "senior") state.seniorCorrect++;
        if (bon > 0) { state.speedAnswers++; roundSpeed++; }
        if (round.config.type === "review") { const k = state.wrong.indexOf(q.id); if (k >= 0) { state.wrong.splice(k, 1); state.reviewCleared++; } }
      } else {
        wrongs.push({ q, sel: a.sel });
        if (!state.wrong.includes(q.id)) state.wrong.push(q.id);
      }
      const t = q.topic; if (!state.byTopic[t]) state.byTopic[t] = [0, 0]; state.byTopic[t][1]++; if (ok) state.byTopic[t][0]++;
      if (!state.seen.includes(q.id)) state.seen.push(q.id);
      if (!state.everSeen) state.everSeen = [];
      if (!state.everSeen.includes(q.id)) state.everSeen.push(q.id); // never reset, for the "all questions" badge
    });
    const perfect = correct === round.items.length;
    if (perfect) { xpGained += 20; state.perfectRounds++; }

    const prevLevel = levelIndex(state.xp);
    state.xp += xpGained; state.answered += round.items.length; state.correct += correct; state.rounds++;
    state.xpHistory.push({ acc: Math.round(correct / round.items.length * 100), xp: xpGained });
    if (state.xpHistory.length > 60) state.xpHistory.shift();
    bumpStreak();
    const newLevel = levelIndex(state.xp);
    const newlyUnlocked = checkAchievements();
    save();

    renderResults(correct, xpGained, bonusTotal, wrongs, newLevel > prevLevel ? LEVELS[newLevel] : null, newlyUnlocked, perfect);
    if (newLevel > prevLevel || perfect) { confetti(); sndLevel(); }
    show("res");
  }

  // ---------- LinkedIn sharing ----------
  // The app's public URL, used for the LinkedIn preview. Change if you host elsewhere.
  const SHARE_URL = (location.protocol.indexOf("http") === 0)
    ? location.origin + location.pathname.replace(/[^/]*$/, "")
    : "https://pmquest-ten.vercel.app/";

  function toastText(t) {
    const el = $("toast"); el.innerHTML = '<div class="nm">' + esc(t) + '</div>';
    el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 3400);
  }
  function shareLinkedIn(caption) {
    const share = "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(SHARE_URL);
    // LinkedIn no longer accepts custom text via URL, so copy a caption to paste.
    try { if (navigator.clipboard) navigator.clipboard.writeText(caption + " " + SHARE_URL); } catch (e) {}
    window.open(share, "_blank", "noopener,noreferrer,width=680,height=640");
    toastText("Legenda copiada — cola na tua publicação do LinkedIn! 🔗");
  }
  function shareBtn(caption) {
    return '<button class="btn-share" data-cap="' + esc(caption) + '">in Partilhar no LinkedIn</button>';
  }
  function wireShares(container) {
    container.querySelectorAll(".btn-share").forEach(b => {
      b.onclick = () => shareLinkedIn(b.getAttribute("data-cap"));
    });
  }

  function renderResults(correct, xp, bonus, wrongs, leveledTo, unlocked, perfect) {
    const total = round.items.length, pct = Math.round(correct / total * 100);
    $("resScore").innerHTML = correct + '<small>/' + total + "</small>";
    let msg = "Continua a praticar! 💪";
    if (pct === 100) msg = "Perfeito! Impecável. 🏆"; else if (pct >= 80) msg = "Excelente trabalho! 🚀";
    else if (pct >= 60) msg = "Bom — estás a evoluir. 👍"; else if (pct >= 40) msg = "No caminho certo. 📘";
    $("resMsg").textContent = msg;
    $("resBadges").innerHTML = '<span class="xp">+' + xp + " XP</span>" +
      (bonus > 0 ? '<span class="sub">⏱️ +' + bonus + " bónus rapidez</span>" : "") +
      '<span class="sub">' + pct + "% precisão</span>";

    const lu = $("levelup");
    if (leveledTo) {
      lu.classList.remove("hidden");
      lu.innerHTML = "🎉 Subiste de nível! Agora és <b>" + leveledTo.ic + " " + leveledTo.name + "</b>" +
        '<div style="margin-top:10px">' + shareBtn("Gostaria de partilhar que subi ao nível " + leveledTo.name + " " + leveledTo.ic + " no PM Quest! A desenvolver as minhas competências de Product Management. 🚀 #ProductManagement #PMQuest") + "</div>";
    }
    else lu.classList.add("hidden");

    const au = $("achUnlocked");
    if (unlocked.length) {
      au.classList.remove("hidden");
      au.innerHTML = unlocked.map(a => '<div class="au"><span class="e">' + a.ic + '</span><div style="flex:1"><div class="nm">' + a.nm + '</div><div class="ds">' + a.ds + "</div>" +
        '<div style="margin-top:8px">' + shareBtn("Gostaria de partilhar que conquistei o badge “" + a.nm + "” " + a.ic + " no PM Quest! 🏆 A evoluir em Product Management. #ProductManagement #PMQuest") + "</div></div></div>").join("");
    }
    else au.classList.add("hidden");
    wireShares($("screen-res"));

    const rev = $("reviewList");
    if (!wrongs.length) { $("reviewTitle").textContent = "Resultado"; rev.innerHTML = '<div class="allgood">✅ Sem erros nesta ronda — dominaste todas as questões!</div>'; }
    else {
      $("reviewTitle").textContent = "Revisão dos teus erros (" + wrongs.length + ")";
      rev.innerHTML = wrongs.map(({ q, sel }) => {
        const ref = refFor(q.topic);
        return '<div class="rev-item"><div class="rq">' + esc(q.q) + "</div>" +
          '<div class="rev-line wrong">✗ <span><b>A tua resposta:</b> ' + (sel === null ? "<i>(tempo esgotado)</i>" : esc(q.options[sel])) + "</span></div>" +
          '<div class="rev-line right">✓ <span><b>Correcta:</b> ' + esc(q.options[q.answer]) + "</span></div>" +
          '<div class="rev-exp"><b>Porquê:</b> ' + esc(q.explanation || "—") +
          (ref ? '<br><a class="srclink" href="' + ref.url + '" target="_blank" rel="noopener">🔗 Saber mais: ' + esc(ref.label) + "</a>" : "") + "</div></div>";
      }).join("");
    }
    $("againBtn").textContent = round.config.type === "review" ? "Rever mais →" : "Novo Exercício →";
  }

  // ---------- streak ----------
  function today() { const d = new Date(); return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(); }
  function daysBetween(a, b) { const pa = a.split("-").map(Number), pb = b.split("-").map(Number); return Math.round((Date.UTC(pb[0], pb[1] - 1, pb[2]) - Date.UTC(pa[0], pa[1] - 1, pa[2])) / 86400000); }
  function bumpStreak() {
    const t = today(); if (state.streak.last === t) return;
    if (state.streak.last && daysBetween(state.streak.last, t) === 1) state.streak.count++; else state.streak.count = 1;
    state.streak.last = t; state.streak.best = Math.max(state.streak.best || 0, state.streak.count);
  }
  function checkStreakDecay() { if (state.streak.last && daysBetween(state.streak.last, today()) > 1) state.streak.count = 0; }

  // ---------- achievements ----------
  function checkAchievements() {
    const have = new Set(state.achievements), newly = [];
    ACHIEVEMENTS.forEach(a => { if (!have.has(a.id) && a.cond(state)) { state.achievements.push(a.id); newly.push(a); } });
    return newly;
  }
  function toast(a) {
    const el = $("toast"); el.innerHTML = '<span class="e">' + a.ic + '</span><div><div class="nm">Conquista: ' + a.nm + '</div><div class="ds">' + a.ds + "</div></div>";
    el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 3200);
  }

  // =====================================================================
  //  STATS
  // =====================================================================
  function renderStats() {
    const acc = state.answered ? Math.round(state.correct / state.answered * 100) : 0;
    const avgXp = state.rounds ? Math.round(state.xpHistory.reduce((s, h) => s + h.xp, 0) / Math.max(1, state.xpHistory.length)) : 0;
    $("kpiXp").textContent = state.xp; $("kpiAcc").textContent = acc + "%"; $("kpiRounds").textContent = state.rounds;
    $("kpiStreak").textContent = state.streak.count; $("kpiBest").textContent = state.streak.best || 0; $("kpiAvg").textContent = avgXp;

    // sparkline
    const h = state.xpHistory.map(x => x.acc); const sp = $("sparkSvg");
    if (h.length < 2) sp.innerHTML = '<text x="6" y="40" fill="#8ba0c2" font-size="12">Joga mais rondas para ver a tendência.</text>';
    else {
      const W = 600, H = 70, max = 100, step = W / (h.length - 1);
      const pts = h.map((v, i) => [i * step, H - (v / max) * (H - 8) - 4]);
      const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
      const area = line + " L" + W + " " + H + " L0 " + H + " Z";
      sp.setAttribute("viewBox", "0 0 " + W + " " + H); sp.setAttribute("preserveAspectRatio", "none");
      sp.innerHTML = '<path d="' + area + '" fill="rgba(0,51,160,.12)"/><path d="' + line + '" fill="none" stroke="#0033a0" stroke-width="2.5" stroke-linejoin="round"/>' +
        pts.map(p => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="2.5" fill="#f2b705"/>').join("");
    }

    // topic bars
    const entries = Object.keys(state.byTopic).map(t => ({ t, c: state.byTopic[t][0], n: state.byTopic[t][1], r: state.byTopic[t][0] / state.byTopic[t][1] })).filter(x => x.n >= 2);
    const best = [...entries].sort((a, b) => b.r - a.r).slice(0, 6);
    const weak = [...entries].sort((a, b) => a.r - b.r).slice(0, 6);
    $("bestBars").innerHTML = best.length ? best.map(barRow).join("") : '<div class="foot">Sem dados suficientes.</div>';
    $("weakBars").innerHTML = weak.length ? weak.map(x => barRow(x, true)).join("") : '<div class="foot">Sem dados suficientes.</div>';

    // achievements grid
    const have = new Set(state.achievements);
    $("achGrid").innerHTML = ACHIEVEMENTS.map(a => '<div class="ach' + (have.has(a.id) ? " on" : "") + '"><div class="e">' + (have.has(a.id) ? a.ic : "🔒") + '</div><div class="nm">' + a.nm + '</div><div class="ds">' + a.ds + "</div></div>").join("");
  }
  function barRow(x, low) { const p = Math.round(x.r * 100); return '<div class="tbar' + (low && p < 60 ? " low" : "") + '"><span class="nm" title="' + esc(x.t) + '">' + esc(x.t) + '</span><span class="tk"><i style="width:' + p + '%"></i></span><span class="pc">' + p + "%</span></div>"; }

  // =====================================================================
  //  MODALS  (filter + settings)
  // =====================================================================
  function openFilter() {
    const sel = $("fTopic");
    if (sel.options.length <= 1) { TOPICS.forEach(t => { const o = document.createElement("option"); o.value = t; o.textContent = t; sel.appendChild(o); }); }
    $("overlayFilter").classList.remove("hidden");
  }
  let fDiff = "all";
  function openSettings() {
    $("setModeStudy").checked = state.settings.mode === "study";
    $("setSound").checked = state.settings.sound;
    $("setTheme").checked = state.settings.theme === "dark";
    $("setTimer").checked = state.settings.timer;
    $("overlaySettings").classList.remove("hidden");
  }
  function closeModals() { $("overlayFilter").classList.add("hidden"); $("overlaySettings").classList.add("hidden"); }

  // export / import
  function exportProgress() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "pmquest-progress.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }
  function importProgress(file) {
    const rd = new FileReader();
    rd.onload = () => { try { const s = JSON.parse(rd.result); if (typeof s.xp !== "number") throw 0; state = migrateShape(s); save(); applyTheme(); closeModals(); renderHome(); show("home"); alert("Progresso importado com sucesso!"); } catch (e) { alert("Ficheiro inválido."); } };
    rd.readAsText(file);
  }

  // =====================================================================
  //  LEADERBOARD
  // =====================================================================
  function renderLeaderboard() {
    const list = $("leadList");
    const cloud = window.PMQuestCloud;
    if (!cloud || typeof cloud.fetchLeaderboard !== "function") {
      list.innerHTML = '<div class="foot">Leaderboard indisponível — inicia sessão e liga-te à internet.</div>';
      return;
    }
    list.innerHTML = '<div class="foot">A carregar…</div>';
    const me = (cloud.getIdentity && cloud.getIdentity()) || {};
    const admin = !!me.is_admin;
    cloud.fetchLeaderboard().then(rows => {
      if (!rows || !rows.length) { list.innerHTML = '<div class="foot">Ainda ninguém no leaderboard. Sê o primeiro! 🚀</div>'; return; }
      const adminBar = admin
        ? '<div class="lead-admin-bar"><span class="lb">🛠️ ADMIN</span><button class="btn btn-ghost" id="adminResetXp" style="min-height:auto;padding:8px 12px;font-size:13px;width:auto;">↺ Reset de todos os XP</button></div>'
        : "";
      list.innerHTML = adminBar + rows.map((r, i) => {
        const lv = LEVELS[levelIndex(r.xp || 0)];
        const mine = me.uid && r.id === me.uid;
        const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1);
        return '<div class="lead-row' + (mine ? " me" : "") + '">' +
          '<span class="lead-rank">' + medal + '</span>' +
          '<span class="lead-medal">' + lv.ic + '</span>' +
          '<span class="lead-name">' + esc(r.name || "—") + (mine ? " (tu)" : "") + '</span>' +
          '<span class="lead-xp">' + (r.xp || 0) + ' XP</span>' +
          (admin && !mine
            ? '<button class="lead-reset" title="Zerar XP deste utilizador" data-id="' + esc(r.id) + '" data-name="' + esc(r.name || "") + '">↺</button>' +
              '<button class="lead-del" title="Eliminar utilizador" data-id="' + esc(r.id) + '" data-name="' + esc(r.name || "") + '">🗑</button>'
            : "") +
          '</div>';
      }).join("");

      if (admin) {
        const reset = $("adminResetXp");
        if (reset) reset.onclick = () => {
          if (!confirm("ADMIN: repor a ZERO o XP de TODOS os utilizadores e apagar o progresso guardado? Isto é irreversível.")) return;
          cloud.adminResetAllXp().then(ok => { toastText(ok ? "XP de todos reposto." : "Falhou (sem permissão de admin?)."); renderLeaderboard(); });
        };
        list.querySelectorAll(".lead-reset").forEach(b => b.onclick = () => {
          const id = b.getAttribute("data-id"), nm = b.getAttribute("data-name");
          if (!confirm('ADMIN: zerar o XP de "' + nm + '"? Isto apaga o progresso deste utilizador. Irreversível.')) return;
          cloud.adminResetUserXp(id).then(ok => { toastText(ok ? "XP zerado." : "Falhou (sem permissão de admin?)."); renderLeaderboard(); });
        });
        list.querySelectorAll(".lead-del").forEach(b => b.onclick = () => {
          const id = b.getAttribute("data-id"), nm = b.getAttribute("data-name");
          if (!confirm('ADMIN: eliminar o utilizador "' + nm + '"? Isto apaga a conta e o progresso. Irreversível.')) return;
          cloud.adminDeleteUser(id).then(ok => { toastText(ok ? "Utilizador eliminado." : "Falhou (sem permissão de admin?)."); renderLeaderboard(); });
        });
      }
    }).catch(() => { list.innerHTML = '<div class="foot">Não foi possível carregar o leaderboard.</div>'; });
  }

  // =====================================================================
  //  WIRE UP
  // =====================================================================
  $("startBtn").onclick = () => startRound({ type: "normal" });
  $("weakBtn").onclick = () => { if (!Object.keys(state.byTopic).some(t => state.byTopic[t][1] >= 3)) { alert("Responde a mais algumas rondas primeiro para identificarmos as tuas áreas fracas."); return; } startRound({ type: "weak" }); };
  $("filterBtn").onclick = openFilter;
  $("reviewBtn").onclick = () => { if (state.wrong.length) startRound({ type: "review" }); };
  $("statsBtn").onclick = () => { renderStats(); show("stats"); };
  $("statsBack").onclick = () => { renderHome(); show("home"); };
  $("leadBtn").onclick = () => { renderLeaderboard(); show("lead"); };
  $("leadBack").onclick = () => { renderHome(); show("home"); };
  $("nextBtn").onclick = nextQuestion;
  $("quitBtn").onclick = () => { stopTimer(); renderHome(); show("home"); };
  $("againBtn").onclick = () => startRound(lastConfig);
  $("homeBtn").onclick = () => { renderHome(); show("home"); };
  $("settingsBtn").onclick = openSettings;
  $("streakChip").onclick = () => { renderStats(); show("stats"); };

  // filter modal
  document.querySelectorAll("#fDiffSeg button").forEach(b => b.onclick = () => { fDiff = b.dataset.d; document.querySelectorAll("#fDiffSeg button").forEach(x => x.classList.toggle("on", x === b)); });
  $("fStart").onclick = () => { closeModals(); startRound({ type: "filter", topic: $("fTopic").value, difficulty: fDiff }); };
  $("fCancel").onclick = closeModals;

  // settings modal
  $("setModeStudy").onchange = e => { state.settings.mode = e.target.checked ? "study" : "exam"; save(); };
  $("setSound").onchange = e => { state.settings.sound = e.target.checked; save(); if (e.target.checked) sndCorrect(); };
  $("setTheme").onchange = e => { state.settings.theme = e.target.checked ? "dark" : "light"; applyTheme(); save(); };
  $("setTimer").onchange = e => { state.settings.timer = e.target.checked; save(); };
  $("setExport").onclick = exportProgress;
  $("setLogout").onclick = () => {
    if (window.PMQuestCloud && typeof window.PMQuestCloud.signOut === "function") window.PMQuestCloud.signOut();
    else location.replace("login.html");
  };
  $("setReset").onclick = () => {
    if (!confirm("Recomeçar do zero termina a sessão e apaga o progresso local. Terás de entrar novamente com email e password, ou continuar com um nome. Continuar?")) return;
    const th = state.settings.theme;
    state = fresh(); state.settings.theme = th; save();
    try { localStorage.removeItem("pmquest_guest"); localStorage.removeItem("pmquest_name"); localStorage.removeItem("pmquest_pending_name"); } catch (e) {}
    if (window.PMQuestCloud && typeof window.PMQuestCloud.signOut === "function") window.PMQuestCloud.signOut();
    else location.replace("login.html");
  };
  $("setClose").onclick = closeModals;
  document.querySelectorAll(".overlay").forEach(o => o.onclick = e => { if (e.target === o) closeModals(); });

  // keyboard: 1-4 answer, Enter next, Esc close
  document.addEventListener("keydown", e => {
    if (!$("overlayFilter").classList.contains("hidden") || !$("overlaySettings").classList.contains("hidden")) { if (e.key === "Escape") closeModals(); return; }
    if ($("screen-quiz").classList.contains("hidden")) return;
    if (["1", "2", "3", "4"].includes(e.key)) { const i = +e.key - 1; if (round && round.items[round.idx] && i < 4) choose(i); }
    else if (e.key === "Enter") { if (!$("nextBtn").disabled) nextQuestion(); }
  });

  // achievement toast queue via monkey-check on unlock during play handled in results; also toast newest on home load
  // ---------- boot ----------
  applyTheme();
  if (!BANK.length) { $("startBtn").disabled = true; $("startBtn").textContent = "⚠ Banco de questões não carregado"; }
  renderHome(); show("home");

  // ---------- cloud bridge ----------
  // Read/replace state for the optional supabase-sync.js layer. If that file
  // is not loaded, this object simply sits unused and the app stays offline.
  window.PMQuestCloud = {
    getState: function () { return state; },
    replaceState: function (s) {
      try { state = migrateShape(s); save(); applyTheme(); renderHome(); show("home"); } catch (e) {}
    },
    // Wipe local progress to a clean slate (keeps the theme). Used when a
    // DIFFERENT account signs in on this browser, so no data is inherited.
    resetLocal: function () {
      try { var th = state.settings.theme; state = fresh(); state.settings.theme = th; save(); applyTheme(); renderHome(); show("home"); } catch (e) {}
    },
    onSave: null, // sync layer assigns a function here once a user signs in
  };
})();
