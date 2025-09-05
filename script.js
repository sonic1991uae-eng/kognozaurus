(function () {
  'use strict';

  // ===== Константы =====
  const TOTAL_QUESTIONS = 15;
  const MAX_LIVES = 5;
  const THEME_KEY = 'quiz_theme';
  const SOUND_KEY = 'quiz_sound';
  const PLAYER_NAME_KEY = 'quiz_player_name';
  const SCORES_KEY = 'quiz_scores_v1';
  const REACTION_MS = 5000; // длительность показа эмоции динозавра (мс) // { [name]: { best:{correct,lives,dino,date}, games:number } }

  // ===== Динозавры =====
  const DINOS = {
    focus: { name: 'PAWозавр', emoji: '🦖', reward: '🧠', img: 'assets/pawozavr.png' },
    logic: { name: 'Фидоцератепс', emoji: '🦕', reward: '🧩', img: 'assets/fidocerateps.png' },
    creo:  { name: 'Кубодокс',     emoji: '🦅', reward: '💡', img: 'assets/kubodoks.png' },
  };

  // Колода бонусов
  const BONUS_DECK = [
    { name: 'Корона', icon: '👑' },
    { name: 'Щит', icon: '🛡' },
    { name: 'Меч', icon: '⚔️' },
    { name: 'Кинжал', icon: '🗡' },
    { name: 'Ноутбук', icon: '💻' },
    { name: 'Мышь', icon: '🖱' },
    { name: 'Торт', icon: '🎂' },
    { name: 'Повышение ЗП', icon: '💵' },
    { name: 'Индексация ЗП', icon: '₽' },
    { name: 'Очки', icon: '👓' },
    { name: 'Седло', icon: '🐴' },
    { name: 'Игрушка', icon: '🧸' },
    { name: 'Сертификат IBM', icon: '📜' },
    { name: 'Фонарик', icon: '🔦' },
    { name: 'Рюкзак', icon: '🎒' },
  ];

  // ===== DOM =====
  const startScreen = document.getElementById('start-screen');
  const quizScreen = document.getElementById('quiz-screen');
  const failScreen = document.getElementById('fail-screen');
  const resultScreen = document.getElementById('result-screen');

  const dinoCards = Array.from(document.querySelectorAll('.dino-card'));
  const startBtn = document.getElementById('start-btn');

  const playerNameInput = document.getElementById('player-name');
  const nameRandomBtn = document.getElementById('name-random-btn');
  const personalBestNote = document.getElementById('personal-best');

  const playerBadge = document.getElementById('player-badge');
  const dinoFigureEl = document.getElementById('dino-figure');
  const dinoNameBigEl = document.getElementById('dino-name-big');
  const dinoPanelEl = document.getElementById('dino-panel');
  const dinoMoodEmoji = document.getElementById('dino-mood-emoji');

  const progressIndexEl = document.getElementById('progress-index');
  const progressTotalEl = document.getElementById('progress-total');
  const progressFill = document.getElementById('progress-fill');
  const livesContainer = document.getElementById('lives');
  const rewardCountEl = document.getElementById('reward-count');
  const rewardsTray = document.getElementById('rewards-tray');
  const answersContainer = document.getElementById('answers');
  const questionTextEl = document.getElementById('question-text');
  const nextBtn = document.getElementById('next-btn');

  const resultSummary = document.getElementById('result-summary');
  const resultRewards = document.getElementById('result-rewards');
  const resultMistakes = document.getElementById('result-mistakes');
  const playAgainBtn = document.getElementById('play-again-btn');
  const showMistakesBtn = document.getElementById('show-mistakes-btn');

  const failSummaryEl = document.getElementById('fail-summary');
  const failMistakesEl = document.getElementById('fail-mistakes');
  const failRetryBtn = document.getElementById('fail-retry-btn');
  const failShowMistakesBtn = document.getElementById('fail-show-mistakes-btn');

  const soundToggleBtns = Array.from(document.querySelectorAll('.sound-toggle-btn'));
  const themeToggleBtns = Array.from(document.querySelectorAll('.theme-toggle-btn'));

  const fxLayer = document.getElementById('fx-layer');

  // ===== Состояние =====
  const state = {
    selectedDinoKey: null,
    questionIndices: [],
    currentIndex: 0,
    correctCount: 0,
    lives: MAX_LIVES,
    rewards: [],
    answerLocked: false,
    mistakes: [],
    bonusDeck: [],
    bonusIndex: 0,
    soundOn: false,
    audioCtx: null,
    playerName: ''
  };

  // ===== Хранилище результатов =====
  function readScores() { try { return JSON.parse(localStorage.getItem(SCORES_KEY) || '{}'); } catch { return {}; } }
  function writeScores(data) { try { localStorage.setItem(SCORES_KEY, JSON.stringify(data)); } catch {} }
  function getBestFor(name) { const db = readScores(); const rec = db[name]; return rec && rec.best ? rec.best : null; }
  function saveRun(name, result) {
    const db = readScores(); const now = new Date().toISOString();
    if (!db[name]) db[name] = { best: null, games: 0 };
    db[name].games += 1;
    const curBest = db[name].best;
    const better = !curBest || result.correct > curBest.correct || (result.correct === curBest.correct && result.lives > curBest.lives);
    if (better) db[name].best = { ...result, date: now };
    writeScores(db);
    return { isRecord: better, best: db[name].best, games: db[name].games };
  }

  // ===== Тема/звук =====
  function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark'); }
  function syncToggleButtons() {
    soundToggleBtns.forEach(btn => { btn.setAttribute('aria-pressed', state.soundOn ? 'true' : 'false'); btn.textContent = state.soundOn ? '🔊' : '🔇'; btn.title = `Звук: ${state.soundOn ? 'вкл' : 'выкл'}`; });
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    themeToggleBtns.forEach(btn => { btn.textContent = theme === 'light' ? '☀️' : '🌙'; });
  }
  function loadPrefs() {
    const theme = localStorage.getItem(THEME_KEY) || 'dark'; applyTheme(theme);
    const sound = localStorage.getItem(SOUND_KEY) || 'off'; state.soundOn = sound === 'on';
    const savedName = localStorage.getItem(PLAYER_NAME_KEY) || '';
    playerNameInput.value = savedName;
    state.playerName = (savedName || '').trim();
    updatePersonalBestNote();
    updateStartBtnState();
    syncToggleButtons();
  }
  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next); localStorage.setItem(THEME_KEY, next); syncToggleButtons();
  }

  // ===== Звук =====
  function ensureAudio() { if (!state.audioCtx) { try { state.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} } }
  function playBeep(type = 'ok') {
    if (!state.soundOn) return; ensureAudio(); if (!state.audioCtx) return;
    const ctx = state.audioCtx, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
    if (type === 'ok') o.frequency.setValueAtTime(880, ctx.currentTime);
    if (type === 'fail') o.frequency.setValueAtTime(220, ctx.currentTime);
    if (type === 'reward') o.frequency.setValueAtTime(1320, ctx.currentTime);
    g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);
    o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.3);
  }

  // 🔊 Основная функция для проигрывания твоих WAV/MP3
  // Ищет по порядку:
  //   assets/{dino}_{kind}.wav → assets/{dino}_{kind}.mp3 → assets/{kind}.wav → assets/{kind}.mp3
  function playDinoSound(kind) {
    if (!state.soundOn) return;
    const dino = state.selectedDinoKey || 'focus';
    const variants = [
      `assets/${dino}_${kind}.wav`,
      `assets/${dino}_${kind}.mp3`,
      `assets/${kind}.wav`,
      `assets/${kind}.mp3`,
    ];
    const audio = new Audio();
    let i = 0;
    const tryNext = () => {
      if (i >= variants.length) return;
      audio.src = variants[i++];
      audio.play().catch(() => { /* autoplay блок — попробуем следующее */ });
    };
    audio.addEventListener('error', tryNext);
    tryNext();
  }

  // ===== FX: маленькие вспышки/флэш =====
  function fireworks() {
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div'); p.className = 'fx-firework';
      const a = (Math.PI * 2 * i) / 24, r = 140 + Math.random() * 80;
      p.style.left = `${cx}px`; p.style.top = `${cy}px`;
      p.style.setProperty('--dx', `${Math.cos(a) * r}px`); p.style.setProperty('--dy', `${Math.sin(a) * r}px`);
      p.style.background = ['#ffd166','#ff6b6b','#41d497','#7c9cff'][i%4];
      fxLayer.appendChild(p); setTimeout(() => p.remove(), 900);
    }
  }
  function failFlashAndShake() {
    const flash = document.createElement('div'); flash.className = 'fx-flash'; fxLayer.appendChild(flash);
    setTimeout(() => flash.remove(), 320);
    dinoPanelEl.classList.add('shake'); setTimeout(() => dinoPanelEl.classList.remove('shake'), 360);
  }
  function setMoodEmoji(kind) { dinoMoodEmoji.textContent = kind === 'happy' ? '😊' : kind === 'sad' ? '😢' : ''; }

  // ===== SUPER FIREWORKS (канвасная анимация победы) =====
  const winCanvas = document.getElementById('win-canvas');
  const WFX = { ctx:null, running:false, tEnd:0, rockets:[], parts:[], lastLaunch:0, onEnd:null };

  function wfxResize(){
    if(!winCanvas) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = innerWidth, h = innerHeight;
    winCanvas.width = Math.floor(w * dpr);
    winCanvas.height = Math.floor(h * dpr);
    winCanvas.style.width = w + 'px';
    winCanvas.style.height = h + 'px';
    WFX.ctx = winCanvas.getContext('2d');
    WFX.ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  window.addEventListener('resize', wfxResize); wfxResize();

  function launchRocket(){
    const x = Math.random()*innerWidth*0.8 + innerWidth*0.1;
    const targetX = Math.random()*innerWidth*0.8 + innerWidth*0.1;
    const vx = (targetX - x) * (0.006 + Math.random()*0.004);
    const vy = -(6 + Math.random()*2);
    WFX.rockets.push({ x, y: innerHeight+10, vx, vy, trail: [], color: `hsl(${Math.floor(Math.random()*360)},100%,60%)` });
  }
  function explode(x,y,color){
    const count = 120 + Math.floor(Math.random()*120);
    for(let i=0;i<count;i++){
      const a = (i/count)*Math.PI*2;
      const speed = 2 + Math.random()*4;
      WFX.parts.push({
        x, y,
        vx: Math.cos(a)*speed*(0.7+Math.random()*0.6),
        vy: Math.sin(a)*speed*(0.7+Math.random()*0.6),
        g: 0.05 + Math.random()*0.08,
        drag: 0.995 - Math.random()*0.01,
        life: 0.9 + Math.random()*0.4,
        age: 0,
        color
      });
    }
  }
  function wfxStep(ts){
    if(!WFX.running) return;
    const ctx = WFX.ctx;
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0,0,innerWidth,innerHeight);

    // 🚫 Запускаем новые ракеты только до окончания окна шоу
    if (performance.now() < WFX.tEnd && (ts - WFX.lastLaunch > 180)) {
      for(let i=0;i<3;i++) launchRocket();
      WFX.lastLaunch = ts;
    }

    for(let i=WFX.rockets.length-1;i>=0;i--){
      const r = WFX.rockets[i];
      r.vy += -0.02;
      r.x += r.vx; r.y += r.vy;
      r.trail.push({x:r.x,y:r.y}); if(r.trail.length>12) r.trail.shift();

      ctx.beginPath();
      for(let j=0;j<r.trail.length;j++){
        const p = r.trail[j];
        j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);
      }
      ctx.strokeStyle = r.color; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(r.x,r.y,2.2,0,Math.PI*2); ctx.fill();

      if(r.y < innerHeight*0.3 || Math.random()<0.01){
        explode(r.x,r.y,r.color);
        WFX.rockets.splice(i,1);
      }
    }

    for(let i=WFX.parts.length-1;i>=0;i--){
      const p = WFX.parts[i];
      p.vx *= p.drag; p.vy = p.vy*p.drag + p.g;
      p.x += p.vx; p.y += p.vy; p.age += 0.016;
      const alpha = Math.max(0,(p.life - p.age)/p.life);
      if(alpha<=0){ WFX.parts.splice(i,1); continue; }
      ctx.globalAlpha = alpha; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x,p.y,2.2,0,Math.PI*2); ctx.fill();
      ctx.globalAlpha = 1;
    }

    if(performance.now() < WFX.tEnd || WFX.parts.length || WFX.rockets.length){
      requestAnimationFrame(wfxStep);
    } else {
      WFX.running = false;
      ctx.clearRect(0,0,innerWidth,innerHeight);
      const cb = WFX.onEnd; WFX.onEnd = null;
      if (typeof cb === 'function') cb();
    }
  }
  function startWinShow(ms=7000, onEnd=null){
    if(!winCanvas) return;
    wfxResize();
    if (WFX.ctx) WFX.ctx.clearRect(0,0,innerWidth,innerHeight);
    WFX.running = true; WFX.tEnd = performance.now() + ms;
    WFX.rockets.length = 0; WFX.parts.length = 0; WFX.lastLaunch = 0;
    WFX.onEnd = (typeof onEnd === 'function') ? onEnd : null;
    requestAnimationFrame(wfxStep);
  }
  function stopWinShow(triggerEnd=true){
    if(!WFX.running) return;
    WFX.running = false;
    if(WFX.ctx) WFX.ctx.clearRect(0,0,innerWidth,innerHeight);
    if (triggerEnd && typeof WFX.onEnd === 'function') {
      const cb = WFX.onEnd; WFX.onEnd = null; cb();
    }
  }
  document.addEventListener('visibilitychange', ()=>{ if(document.hidden) stopWinShow(true); });

  // ===== Картинки динозавров =====
  function setFigureImage(containerEl, dino) {
    if (!containerEl) return;
    if (dino.img) {
      const test = new Image();
      test.onload = () => { containerEl.innerHTML = `<img src="${dino.img}" alt="${dino.name}">`; };
      test.onerror = () => { containerEl.textContent = dino.emoji; };
      test.src = dino.img;
    } else { containerEl.textContent = dino.emoji; }
  }
  function enhanceDinoCardsWithImages() {
    dinoCards.forEach(card => {
      const key = card.getAttribute('data-dino'), d = DINOS[key]; if (!d || !d.img) return;
      const holder = card.querySelector('.dino-emoji'); if (!holder) return;
      const test = new Image(); test.onload = () => { holder.innerHTML = `<img src="${d.img}" alt="${d.name}">`; }; test.src = d.img;
    });
  }
  
  function updateBadgeColor(key){
    playerBadge.classList.remove('focus','logic','creo');
    if(key) playerBadge.classList.add(key);
  }

  function setCardPressed(key) {
    dinoCards.forEach(c => c.setAttribute('aria-pressed', c.getAttribute('data-dino') === key ? 'true' : 'false'));
  }

  // ===== Утилиты =====
  function showScreen(screen) {
    [startScreen, quizScreen, failScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
    // 🔄 Обновляем индикацию звука/темы на всех экранах
    syncToggleButtons();
  }
  function shuffleInPlace(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  function sampleIndices(total, count) {
    const need = Math.min(total, count);
    const idx = Array.from({ length: total }, (_, i) => i);
    shuffleInPlace(idx);
    return idx.slice(0, need);
  }
  function setBadgeMood(mood) {
    dinoPanelEl.classList.remove('happy', 'sad');
    if (mood === 'happy') { dinoPanelEl.classList.add('happy'); }
    if (mood === 'sad') { dinoPanelEl.classList.add('sad'); }
    setMoodEmoji(mood);
  }
  function renderLives() {
    livesContainer.innerHTML = '';
    for (let i = 0; i < MAX_LIVES; i++) {
      const span = document.createElement('span'); span.className = 'life'; span.textContent = '❤️';
      if (i >= state.lives) span.style.opacity = '0.25';
      livesContainer.appendChild(span);
    }
  }
  function updateProgress() {
    progressIndexEl.textContent = String(Math.min(state.currentIndex + 1, TOTAL_QUESTIONS));
    progressTotalEl.textContent = String(TOTAL_QUESTIONS);
    const ratio = Math.min(state.currentIndex / TOTAL_QUESTIONS, 1); progressFill.style.width = `${Math.floor(ratio * 100)}%`;
  }
  function addRewardChip(bonus) {
    const chip = document.createElement('div'); chip.className = 'reward-chip'; chip.textContent = `${bonus.icon} ${bonus.name}`;
    rewardsTray.appendChild(chip); state.rewards.push(bonus); rewardCountEl.textContent = String(state.rewards.length); playBeep('reward');
  }
  function fxPop(x, y, content) { const node = document.createElement('div'); node.className = 'fx-pop'; node.style.left = `${x}px`; node.style.top = `${y}px`; node.textContent = content; fxLayer.appendChild(node); setTimeout(() => node.remove(), 3000); }

  // ===== Имя игрока =====
  function normalizeName(s) { return (s || '').trim(); }
  function updateStartBtnState() {
    const hasName = normalizeName(state.playerName).length > 0;
    const hasDino = !!state.selectedDinoKey;
    startBtn.disabled = !(hasName && hasDino);
    playerBadge.textContent = `👤 ${hasName ? state.playerName : '—'}`;
  }
  function updatePersonalBestNote() {
    const name = normalizeName(state.playerName);
    if (!name) { personalBestNote.textContent = 'Введите имя или нажмите «Придумать имя». ⬆️'; return; }
    const best = getBestFor(name);
    if (best) personalBestNote.textContent = `Личный рекорд для «${name}»: ${best.correct}/${TOTAL_QUESTIONS}, жизней ${best.lives}.`;
    else personalBestNote.textContent = `Для «${name}» ещё нет рекорда. Удачи!`;
  }
  function markNameError(on) {
    playerNameInput.classList.toggle('error', !!on);
    playerNameInput.setAttribute('aria-invalid', on ? 'true' : 'false');
    if (on) {
      personalBestNote.textContent = 'Пожалуйста, впишите имя или нажмите «Придумать имя».';
      playerNameInput.focus();
      playerNameInput.closest('.start-form')?.classList.add('shake');
      setTimeout(() => playerNameInput.closest('.start-form')?.classList.remove('shake'), 350);
    }
  }
  const NAME_LEFT = ['Мега','Супер','Турбо','Шустрый','Хитрый','Отважный','Тихий','Лютый','Зоркий','Логичный','MDX'];
  const NAME_RIGHT = ['Павозавр','Фидо','Кубо','Дино','Когнозавр','Фидер','Чорик','Сэндвич','Агрегатор','Сапсэт'];
  function genRandomName() {
    const L = NAME_LEFT[Math.floor(Math.random()*NAME_LEFT.length)];
    const R = NAME_RIGHT[Math.floor(Math.random()*NAME_RIGHT.length)];
    const N = Math.floor(100 + Math.random()*900);
    return `${L}${R}${N}`;
  }
  function onNameChange(v) {
    state.playerName = normalizeName(v);
    localStorage.setItem(PLAYER_NAME_KEY, state.playerName);
    markNameError(false);
    updatePersonalBestNote();
    updateStartBtnState();
  }

  // ===== Эмоции динозавра =====
  let moodHideTimer = null, figureWasMood = false;

  function showVideoWithFallback(container, posterPng, sources) {
    // sources: [{src:'assets/paw_ok.webm', type:'video/webm'}, {src:'assets/paw_ok.mp4', type:'video/mp4'}]
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.width = 360;
    video.height = 360;
    if (posterPng) video.setAttribute('poster', posterPng);

    sources.forEach(s => {
      const src = document.createElement('source');
      src.src = s.src;
      src.type = s.type;
      video.appendChild(src);
    });

    container.innerHTML = '';
    container.appendChild(video);

    let endedOrTimeout = false;
    const safeHide = () => {
      if (endedOrTimeout) return;
      endedOrTimeout = true;
      hideDinoMood();
    };

    clearTimeout(moodHideTimer);
    moodHideTimer = setTimeout(safeHide, REACTION_MS);
  }

  function showDinoMood(kind) {
    const d = DINOS[state.selectedDinoKey]; if (!d || !dinoFigureEl) return;

    // 🦖 PAWозавр — ВИДЕО на OK и FAIL
    if (state.selectedDinoKey === 'focus') {
      figureWasMood = true;
      if (kind === 'ok') {
        showVideoWithFallback(
          dinoFigureEl,
          'assets/paw_ok.png',
          [
            { src: 'assets/paw_ok.webm', type: 'video/webm' },
            { src: 'assets/paw_ok.mp4',  type: 'video/mp4'  },
          ]
        );
      } else {
        showVideoWithFallback(
          dinoFigureEl,
          'assets/paw_fail.png',
          [
            { src: 'assets/paw_fail.webm', type: 'video/webm' },
            { src: 'assets/paw_fail.mp4',  type: 'video/mp4'  },
          ]
        );
      }
      return;
    }

    // 🦕 Фидоцератепс — ВИДЕО на OK и FAIL
    if (state.selectedDinoKey === 'logic') {
      figureWasMood = true;
      if (kind === 'ok') {
        showVideoWithFallback(
          dinoFigureEl,
          'assets/fido_ok.png',
          [
            { src: 'assets/fido_ok.webm', type: 'video/webm' },
            { src: 'assets/fido_ok.mp4',  type: 'video/mp4'  },
          ]
        );
      } else {
        showVideoWithFallback(
          dinoFigureEl,
          'assets/fido_fail.png',
          [
            { src: 'assets/fido_fail.webm', type: 'video/webm' },
            { src: 'assets/fido_fail.mp4',  type: 'video/mp4'  },
          ]
        );
      }
      return;
    }

    // 🦅 Кубодокс — ВИДЕО на OK и FAIL
    if (state.selectedDinoKey === 'creo') {
      figureWasMood = true;
      if (kind === 'ok') {
        showVideoWithFallback(
          dinoFigureEl,
          'assets/kubo_ok.png',
          [
            { src: 'assets/kubo_ok.webm', type: 'video/webm' },
            { src: 'assets/kubo_ok.mp4',  type: 'video/mp4'  },
          ]
        );
      } else {
        showVideoWithFallback(
          dinoFigureEl,
          'assets/kubo_fail.png',
          [
            { src: 'assets/kubo_fail.webm', type: 'video/webm' },
            { src: 'assets/kubo_fail.mp4',  type: 'video/mp4'  },
          ]
        );
      }
      return;
    }
  }

  function hideDinoMood() {
    if (!figureWasMood) return;
    const d = DINOS[state.selectedDinoKey];
    setFigureImage(dinoFigureEl, d);
    figureWasMood = false;
  }

  // ===== Игровая логика =====
  function pickDino(dinoKey) {
    state.selectedDinoKey = dinoKey;
    const d = DINOS[dinoKey];
    setFigureImage(dinoFigureEl, d);
    dinoNameBigEl.textContent = d.name;
    figureWasMood = false;
    setCardPressed(dinoKey);
    updateStartBtnState();
  }
  function resetGameState(keepDino = false) {
    const total = (window.QUESTIONS_DB && window.QUESTIONS_DB.length) || 0;
    if (total === 0) { console.warn('QUESTIONS_DB пуст.'); }
    state.questionIndices = sampleIndices(total, TOTAL_QUESTIONS);
    state.currentIndex = 0; state.correctCount = 0; state.lives = MAX_LIVES; state.rewards = [];
    state.answerLocked = false; state.mistakes = []; state.bonusDeck = shuffleInPlace([...BONUS_DECK]); state.bonusIndex = 0;
    rewardsTray.innerHTML = ''; rewardCountEl.textContent = '0'; nextBtn.disabled = true;
    if (!keepDino) pickDino(Object.keys(DINOS)[0]);
    renderLives(); updateProgress(); setBadgeMood('neutral'); hideDinoMood();
  }
  function renderQuestion() {
    hideDinoMood();
    const qIdx = state.questionIndices[state.currentIndex], q = window.QUESTIONS_DB[qIdx];
    questionTextEl.textContent = q.q;
    const mapped = q.options.map((text, idx) => ({ text, isCorrect: idx === q.correctIndex })); shuffleInPlace(mapped);
    answersContainer.innerHTML = '';
    mapped.forEach(opt => {
      const btn = document.createElement('button'); btn.className = 'answer-btn'; btn.textContent = opt.text;
      btn.addEventListener('click', (ev) => handleAnswerClick(btn, opt.isCorrect, ev));
      answersContainer.appendChild(btn);
    });
    nextBtn.disabled = true; state.answerLocked = false; setBadgeMood('neutral'); updateProgress();
  }
  function lockAnswers() { Array.from(answersContainer.children).forEach(btn => { btn.classList.add('disabled'); btn.setAttribute('aria-disabled', 'true'); }); }
  function revealCorrect() {
    Array.from(answersContainer.children).forEach(btn => {
      const qIdx = state.questionIndices[state.currentIndex], q = window.QUESTIONS_DB[qIdx];
      const idx = q.options.findIndex(o => o === btn.textContent); if (idx === q.correctIndex) btn.classList.add('correct');
    });
  }
  function handleAnswerClick(btn, isCorrect, ev) {
    if (state.answerLocked) return; state.answerLocked = true; lockAnswers();
    const qIdx = state.questionIndices[state.currentIndex], q = window.QUESTIONS_DB[qIdx];
    if (isCorrect) {
      btn.classList.add('correct'); state.correctCount += 1;
      const bonus = state.bonusDeck[state.bonusIndex % state.bonusDeck.length]; state.bonusIndex += 1; addRewardChip(bonus);
      setBadgeMood('happy'); const x = (ev && ev.clientX) || (window.innerWidth / 2), y = (ev && ev.clientY) || (window.innerHeight / 2);
      fxPop(x, y, '⭐'); fireworks(); playDinoSound('ok'); showDinoMood('ok');
    } else {
      btn.classList.add('wrong'); revealCorrect(); state.lives = Math.max(0, state.lives - 1); renderLives();
      setBadgeMood('sad'); fxPop(window.innerWidth - 80, 80, '😢'); failFlashAndShake(); playDinoSound('fail'); showDinoMood('fail');
      state.mistakes.push({ q: q.q, yourAnswer: btn.textContent, correctAnswer: q.options[q.correctIndex] });
    }
    if (state.lives <= 0) { setTimeout(showFailScreen, 400); return; }
    nextBtn.disabled = false;
  }
  function nextQuestion() { hideDinoMood(); if (state.currentIndex + 1 >= TOTAL_QUESTIONS) { finishGame(); return; } state.currentIndex += 1; renderQuestion(); }

  // вывод ошибок как список с нумерацией
  function renderMistakesInto(container) {
    if (!container) return;
    container.innerHTML = '';
    const list = document.createElement('ul'); list.className = 'mistakes-list';
    state.mistakes.forEach(m => {
      const li = document.createElement('li'); li.className = 'mistake-item';
      const qEl = document.createElement('p'); qEl.className = 'mis-q'; qEl.textContent = `Вопрос: ${m.q}`;
      const aEl = document.createElement('p'); aEl.className = 'mis-a'; aEl.textContent = `Ваш ответ: ${m.yourAnswer} · Верный: ${m.correctAnswer}`;
      li.appendChild(qEl); li.appendChild(aEl); list.appendChild(li);
    });
    container.appendChild(list);
  }

  function showFailScreen() {
    hideDinoMood();
    const d = DINOS[state.selectedDinoKey] || { name: 'Когнозавр' };
    const summary = `«${d.name}» пал в бою на вопросе ${state.currentIndex + 1} из ${TOTAL_QUESTIONS}. Верных ответов: ${state.correctCount}.`;
    failSummaryEl.textContent = summary;
    if (failMistakesEl) failMistakesEl.style.display = 'none';
    if (state.playerName) saveRun(state.playerName, { correct: state.correctCount, lives: 0, dino: d.name });
    showScreen(failScreen);
  }

  function finishGame() {
    hideDinoMood();
    const allCorrect = state.correctCount === TOTAL_QUESTIONS && state.lives > 0;
    const title = allCorrect ? 'Идеально! Все 15 открыты!' : 'Итоги игры';
    const summary = `Верно ${state.correctCount} из ${TOTAL_QUESTIONS}. Жизней осталось: ${state.lives}.`;
    resultSummary.textContent = `${title} ${summary}`;

    resultRewards.innerHTML = '';
    state.rewards.forEach(r => { const chip = document.createElement('div'); chip.className = 'reward-chip'; chip.textContent = `${r.icon} ${r.name}`; resultRewards.appendChild(chip); });

    const d = DINOS[state.selectedDinoKey] || { name: 'Когнозавр' };
    if (state.playerName) {
      const info = saveRun(state.playerName, { correct: state.correctCount, lives: state.lives, dino: d.name });
      if (info.isRecord) fxPop(window.innerWidth/2, 120, '🏆 Новый рекорд!');
    }

    // ===== САЛЮТ 10 секунд, итоги после полного завершения частиц =====
    const duration = 10000; // 10s
    startWinShow(duration, () => {
      showScreen(resultScreen);
    });

    updatePersonalBestNote();
    if (resultMistakes) resultMistakes.style.display = 'none';
  }

  // ===== Слушатели =====
  dinoCards.forEach(card => {
    card.addEventListener('click', () => { pickDino(card.getAttribute('data-dino')); });
  });

  playerNameInput.addEventListener('input', (e) => onNameChange(e.target.value));
  playerNameInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') startBtn.click(); });
  nameRandomBtn?.addEventListener('click', () => { const n = genRandomName(); playerNameInput.value = n; onNameChange(n); });

  function tryStartGuard() {
    const nameOk = normalizeName(state.playerName).length > 0;
    if (!nameOk) { markNameError(true); playBeep('fail'); return false; }
    return true;
  }
  function startGame() {
    if (!tryStartGuard()) return;
    localStorage.setItem(PLAYER_NAME_KEY, state.playerName);
    playerBadge.textContent = `👤 ${state.playerName}`;
    resetGameState(true); renderQuestion(); showScreen(quizScreen);
  }
  startBtn.addEventListener('click', startGame);
  nextBtn.addEventListener('click', nextQuestion);

  
  // Кнопка "Меню" (выйти из игры)
  const exitBtn = document.getElementById('exit-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      showConfirmExit(exitBtn).then((sure) => {
        if (sure) {
          stopWinShow();
          showScreen(startScreen);
          updatePersonalBestNote();
          updateStartBtnState();
        }
      });
    });
  }
  playAgainBtn.addEventListener('click', () => {
    stopWinShow(); // на всякий случай
    showScreen(startScreen);
    updatePersonalBestNote(); updateStartBtnState();
  });
  showMistakesBtn?.addEventListener('click', () => {
    const hidden = resultMistakes.style.display === 'none' || resultMistakes.style.display === '';
    if (hidden) { renderMistakesInto(resultMistakes); resultMistakes.style.display = 'block'; } else { resultMistakes.style.display = 'none'; }
  });

  failRetryBtn.addEventListener('click', () => {
    stopWinShow();
    showScreen(startScreen);
    updatePersonalBestNote(); updateStartBtnState();
  });
  failShowMistakesBtn.addEventListener('click', () => {
    const hidden = failMistakesEl.style.display === 'none' || failMistakesEl.style.display === '';
    if (hidden) { renderMistakesInto(failMistakesEl); failMistakesEl.style.display = 'block'; } else { failMistakesEl.style.display = 'none'; }
  });

  soundToggleBtns.forEach(btn => btn.addEventListener('click', () => {
    state.soundOn = !state.soundOn; localStorage.setItem(SOUND_KEY, state.soundOn ? 'on' : 'off'); syncToggleButtons(); if (state.soundOn) ensureAudio();
  }));
  themeToggleBtns.forEach(btn => btn.addEventListener('click', () => { toggleTheme(); syncToggleButtons(); }));

  // ===== Кастомное подтверждение выхода =====
  function showConfirmExit(triggerBtn) {
    return new Promise((resolve) => {
      const root = document.getElementById('confirm-exit');
      const btnYes = document.getElementById('confirm-exit-yes');
      const btnNo  = document.getElementById('confirm-exit-no');
      if (!root || !btnYes || !btnNo) { resolve(false); return; }

      root.classList.add('open');
      root.setAttribute('aria-hidden', 'false');

      const prevActive = document.activeElement;
      btnNo.focus();

      const cleanup = (result) => {
        root.classList.remove('open');
        root.setAttribute('aria-hidden', 'true');
        btnYes.removeEventListener('click', onYes);
        btnNo.removeEventListener('click', onNo);
        root.removeEventListener('click', onBackdrop);
        document.removeEventListener('keydown', onKey);
        if (triggerBtn && triggerBtn.focus) triggerBtn.focus();
        else if (prevActive && prevActive.focus) prevActive.focus();
        resolve(result);
      };

      const onYes = () => cleanup(true);
      const onNo  = () => cleanup(false);
      const onBackdrop = (e) => { if (e.target && e.target.dataset && e.target.dataset.close) cleanup(false); };
      const onKey = (e) => { if (e.key === 'Escape') cleanup(false); if (e.key === 'Enter') cleanup(true); };

      btnYes.addEventListener('click', onYes);
      btnNo.addEventListener('click', onNo);
      root.addEventListener('click', onBackdrop);
      document.addEventListener('keydown', onKey, { capture: true });
    });
  }


  // ===== Init =====
  (function init() {
    enhanceDinoCardsWithImages();
    pickDino('focus');          // авто-выбор динозавра
    resetGameState(true);       // не переопределяем выбранного
    loadPrefs();                // подтягиваем имя/настройки
    updateStartBtnState();      // актуализируем кнопку старта

    // На время прелоадера — блокируем переключение темы (чтобы логотипы не "мигали")
    themeToggleBtns.forEach(btn => btn.disabled = true);

    // Прелоадер: показываем логотип 3 секунды, затем старт-экран
    const preload = document.getElementById('preload-screen');
    setTimeout(() => {
      if (preload) preload.style.display = 'none';
      // Снимаем блокировку и синхронизируем кнопки
      themeToggleBtns.forEach(btn => btn.disabled = false);
      syncToggleButtons();
      showScreen(startScreen);
    }, 3000);
  })();
})();
