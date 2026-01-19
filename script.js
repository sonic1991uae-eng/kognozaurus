(function () {
  'use strict';

  // ===== Константы =====
  const TOTAL_QUESTIONS = 15;
  const MAX_LIVES = 5;
  const THEME_KEY = 'quiz_theme';
  const SOUND_KEY = 'quiz_sound';
  const PLAYER_NAME_KEY = 'quiz_player_name';
  const SCORES_KEY = 'quiz_scores_v1';
  const LANGUAGE_KEY = 'quiz_language';
  const DEFAULT_LANGUAGE = 'ru';
  const SUPPORTED_LANGUAGES = ['ru', 'en'];
  const REACTION_MS = 5000; // длительность показа эмоции динозавра (мс)
  const PRELOADER_DURATION_MS = 3000; // длительность прелоадера
  const WIN_SHOW_DURATION_MS = 10000; // длительность финального салюта
  const ROCKET_LAUNCH_INTERVAL_MS = 180; // интервал запуска ракет в салюте
  const FX_POP_DURATION_MS = 3000; // длительность всплывающих эффектов

  const I18N = {
    ru: {
      documentTitle: 'Когнос TM1 — Квиз с когнозаврами',
      languageToggle: '🌐 RU',
      static: {
        'app-title': 'Когнос TM1 · Квиз',
        subtitle: 'Выберите своего когнозавра, введите имя и начните игру!',
        'player-name-label': 'Имя игрока',
        'random-name': '🎲 Придумать имя',
        'sound-label': 'Звук',
        'theme-label': 'Тема',
        'language-label': 'Язык',
        'start-button': 'Начать квиз',
        'score-label': 'Бонусы:',
        'menu-button': 'Меню',
        'question-placeholder': 'Вопрос',
        'next-button': 'Дальше',
        'fail-title': 'Ваш когнозавр пал 💀',
        'play-again': 'Сыграть ещё',
        'show-mistakes': 'Показать ошибки',
        'result-title': 'Итоги игры',
        'confirm-title': 'Выйти в меню?',
        'confirm-desc': 'Прогресс не сохранится. Вы уверены, что хотите выйти?',
        'confirm-yes': 'Да, выйти 🏠',
        'confirm-no': 'Отмена ↩️',
      },
      dinos: {
        focus: { name: 'PAWозавр', desc: 'Сила фокуса и скорость решений' },
        logic: { name: 'Фидоцератепс', desc: 'Креатив и широкий обзор' },
        creo:  { name: 'Кубодокс', desc: 'Логика, терпение и структура' },
      },
      toggles: {
        soundOnTitle: 'Звук: вкл',
        soundOffTitle: 'Звук: выкл',
        themeTitle: 'Тема',
        languageTitle: 'Язык',
      },
      aria: {
        dinoSelect: 'Выбор когнозавра',
        dinoPanel: 'Ваш когнозавр',
        lives: 'Жизни',
        answers: 'Варианты ответа',
        playerBadge: 'Имя игрока',
        scoreTitle: 'Количество бонусов',
      },
      misc: {
        exitTitle: 'Выйти в меню (прогресс не сохранится)',
      },
      format: {
        personalBestEmpty: 'Введите имя или нажмите «Придумать имя». ⬆️',
        personalBestRecord: (name, best, total) => `Личный рекорд для «${name}»: ${best.correct}/${total}, жизней ${best.lives}.`,
        personalBestMissing: (name) => `Для «${name}» ещё нет рекорда. Удачи!`,
        nameError: 'Пожалуйста, впишите имя или нажмите «Придумать имя».',
        failSummary: (dinoName, index, total, correct) => `«${dinoName}» пал в бою на вопросе ${index} из ${total}. Верных ответов: ${correct}.`,
        resultHeadline: (allCorrect, total) => allCorrect ? `Идеально! Все ${total} открыты!` : 'Итоги игры',
        resultDetails: (correct, total, lives) => `Верно ${correct} из ${total}. Жизней осталось: ${lives}.`,
        mistakeQuestion: (q) => `Вопрос: ${q}`,
        mistakeAnswer: (your, correct) => `Ваш ответ: ${your} · Верный: ${correct}`,
        newRecord: '🏆 Новый рекорд!',
      },
      bonusNames: {
        crown: 'Корона',
        shield: 'Щит',
        sword: 'Меч',
        dagger: 'Кинжал',
        laptop: 'Ноутбук',
        mouse: 'Мышь',
        cake: 'Торт',
        raise: 'Повышение ЗП',
        indexation: 'Индексация ЗП',
        glasses: 'Очки',
        saddle: 'Седло',
        toy: 'Игрушка',
        certificate: 'Сертификат IBM',
        flashlight: 'Фонарик',
        backpack: 'Рюкзак',
      },
      randomNames: {
        left: ['Мега','Супер','Турбо','Шустрый','Хитрый','Отважный','Тихий','Лютый','Зоркий','Логичный','MDX'],
        right: ['Павозавр','Фидо','Кубо','Дино','Когнозавр','Фидер','Чорик','Сэндвич','Агрегатор','Сапсэт'],
      },
    },
    en: {
      documentTitle: 'Cognos TM1 — Quiz with Cognosaurs',
      languageToggle: '🌐 EN',
      static: {
        'app-title': 'Cognos TM1 · Quiz',
        subtitle: 'Pick your cognosaur, enter a name and start the game!',
        'player-name-label': 'Player name',
        'random-name': '🎲 Generate name',
        'sound-label': 'Sound',
        'theme-label': 'Theme',
        'language-label': 'Language',
        'start-button': 'Start quiz',
        'score-label': 'Rewards:',
        'menu-button': 'Menu',
        'question-placeholder': 'Question',
        'next-button': 'Next',
        'fail-title': 'Your cognosaur fell 💀',
        'play-again': 'Play again',
        'show-mistakes': 'Show mistakes',
        'result-title': 'Game summary',
        'confirm-title': 'Leave to menu?',
        'confirm-desc': 'Progress will not be saved. Are you sure you want to exit?',
        'confirm-yes': 'Yes, exit 🏠',
        'confirm-no': 'Cancel ↩️',
      },
      dinos: {
        focus: { name: 'PAWosaur', desc: 'Power of focus and fast decisions' },
        logic: { name: 'Fidoceratops', desc: 'Creativity and a wide outlook' },
        creo:  { name: 'Cubodox', desc: 'Logic, patience and structure' },
      },
      toggles: {
        soundOnTitle: 'Sound: on',
        soundOffTitle: 'Sound: off',
        themeTitle: 'Theme',
        languageTitle: 'Language',
      },
      aria: {
        dinoSelect: 'Cognosaur selection',
        dinoPanel: 'Your cognosaur',
        lives: 'Lives',
        answers: 'Answer options',
        playerBadge: 'Player name',
        scoreTitle: 'Number of rewards',
      },
      misc: {
        exitTitle: 'Go to menu (progress will be lost)',
      },
      format: {
        personalBestEmpty: 'Type a name or press “Generate name”. ⬆️',
        personalBestRecord: (name, best, total) => `Personal best for “${name}”: ${best.correct}/${total}, lives ${best.lives}.`,
        personalBestMissing: (name) => `No record for “${name}” yet. Good luck!`,
        nameError: 'Please enter a name or press “Generate name”.',
        failSummary: (dinoName, index, total, correct) => `“${dinoName}” fell on question ${index} of ${total}. Correct answers: ${correct}.`,
        resultHeadline: (allCorrect, total) => allCorrect ? `Perfect! All ${total} cleared!` : 'Game summary',
        resultDetails: (correct, total, lives) => `Correct ${correct} of ${total}. Lives left: ${lives}.`,
        mistakeQuestion: (q) => `Question: ${q}`,
        mistakeAnswer: (your, correct) => `Your answer: ${your} · Correct: ${correct}`,
        newRecord: '🏆 New record!',
      },
      bonusNames: {
        crown: 'Crown',
        shield: 'Shield',
        sword: 'Sword',
        dagger: 'Dagger',
        laptop: 'Laptop',
        mouse: 'Mouse',
        cake: 'Cake',
        raise: 'Pay raise',
        indexation: 'Salary indexation',
        glasses: 'Glasses',
        saddle: 'Saddle',
        toy: 'Toy',
        certificate: 'IBM certificate',
        flashlight: 'Flashlight',
        backpack: 'Backpack',
      },
      randomNames: {
        left: ['Mega','Super','Turbo','Swift','Clever','Brave','Quiet','Fierce','Sharp','Logical','MDX'],
        right: ['Pawo','Fido','Cubo','Dino','Cognosaur','Feeder','Chory','Sandwich','Aggregator','Subset'],
      },
    },
  };

  const DINOS = {
    focus: { emoji: '🦖', img: 'assets/pawozavr.png' },
    logic: { emoji: '🦕', img: 'assets/fidocerateps.png' },
    creo:  { emoji: '🦅', img: 'assets/kubodoks.png' },
  };

  const BONUS_ITEMS = [
    { id: 'crown', icon: '👑' },
    { id: 'shield', icon: '🛡' },
    { id: 'sword', icon: '⚔️' },
    { id: 'dagger', icon: '🗡' },
    { id: 'laptop', icon: '💻' },
    { id: 'mouse', icon: '🖱' },
    { id: 'cake', icon: '🎂' },
    { id: 'raise', icon: '💵' },
    { id: 'indexation', icon: '₽' },
    { id: 'glasses', icon: '👓' },
    { id: 'saddle', icon: '🐴' },
    { id: 'toy', icon: '🧸' },
    { id: 'certificate', icon: '📜' },
    { id: 'flashlight', icon: '🔦' },
    { id: 'backpack', icon: '🎒' },
  ];

  const BONUS_LOOKUP = BONUS_ITEMS.reduce((acc, item) => { acc[item.id] = item; return acc; }, {});

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

  const exitBtn = document.getElementById('exit-btn');

  const soundToggleBtns = Array.from(document.querySelectorAll('.sound-toggle-btn'));
  const themeToggleBtns = Array.from(document.querySelectorAll('.theme-toggle-btn'));
  const languageToggleBtns = Array.from(document.querySelectorAll('.language-toggle-btn'));
  const staticTextNodes = Array.from(document.querySelectorAll('[data-i18n-key]'));
  const dinoTextNodes = Array.from(document.querySelectorAll('[data-i18n-dino]'));
  const dinoSelectGrid = document.querySelector('.dino-select-grid');
  const scoreContainer = document.querySelector('.score');

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
    bonusIndex: 0,
    soundOn: false,
    audioCtx: null,
    playerName: '',
    language: DEFAULT_LANGUAGE
  };

  function normalizeLanguage(lang) {
    if (!lang) return DEFAULT_LANGUAGE;
    const low = String(lang).toLowerCase();
    return SUPPORTED_LANGUAGES.includes(low) ? low : DEFAULT_LANGUAGE;
  }

  function getLangConfig(lang = state.language) {
    return I18N[normalizeLanguage(lang)] || I18N[DEFAULT_LANGUAGE];
  }

  function getCurrentLangConfig() {
    return getLangConfig(state.language);
  }

  function getBonusName(id) {
    const cfg = getCurrentLangConfig();
    return (cfg.bonusNames && cfg.bonusNames[id]) || id;
  }

  function getBonusIcon(id) {
    return (BONUS_LOOKUP[id] && BONUS_LOOKUP[id].icon) || '';
  }

  function getQuestionsForLang(lang) {
    const source = window.QUESTIONS_DB_BY_LANG || {};
    const normalized = normalizeLanguage(lang);
    if (Array.isArray(source[normalized])) return source[normalized];
    if (Array.isArray(source[DEFAULT_LANGUAGE])) return source[DEFAULT_LANGUAGE];
    if (Array.isArray(window.QUESTIONS_DB)) return window.QUESTIONS_DB;
    return [];
  }

  function getQuestions() {
    return getQuestionsForLang(state.language);
  }

  function getDinoConfig(key) {
    return DINOS[key] || null;
  }

  function getDinoName(key) {
    const cfg = getCurrentLangConfig();
    if (cfg.dinos && cfg.dinos[key]) return cfg.dinos[key].name;
    if (cfg.dinos && cfg.dinos.focus) return cfg.dinos.focus.name;
    return key || '';
  }

  function getDinoDesc(key) {
    const cfg = getCurrentLangConfig();
    if (cfg.dinos && cfg.dinos[key]) return cfg.dinos[key].desc;
    if (cfg.dinos && cfg.dinos.focus) return cfg.dinos.focus.desc;
    return '';
  }

  function renderRewardsInto(container) {
    if (!container) return;
    container.innerHTML = '';
    state.rewards.forEach(id => {
      const chip = document.createElement('div');
      chip.className = 'reward-chip';
      chip.textContent = `${getBonusIcon(id)} ${getBonusName(id)}`;
      container.appendChild(chip);
    });
  }

  function renderRewardsTray() {
    renderRewardsInto(rewardsTray);
    if (rewardCountEl) rewardCountEl.textContent = String(state.rewards.length);
  }

  function renderResultRewardsList() {
    renderRewardsInto(resultRewards);
  }

  function updateDinoPanelText() {
    if (dinoNameBigEl) dinoNameBigEl.textContent = getDinoName(state.selectedDinoKey) || '';
  }

  function updateQuestionTextsForLanguage() {
    const cfg = getCurrentLangConfig();
    const questions = getQuestions();
    const hasRenderedAnswers = answersContainer && answersContainer.children.length > 0;
    if (!state.questionIndices.length || !questions.length || !hasRenderedAnswers) {
      if (questionTextEl && cfg.static && cfg.static['question-placeholder']) {
        questionTextEl.textContent = cfg.static['question-placeholder'];
      }
      return;
    }
    const qIdx = state.questionIndices[state.currentIndex];
    const q = questions[qIdx];
    if (!q) return;
    if (questionTextEl) questionTextEl.textContent = q.q;
    Array.from(answersContainer?.children || []).forEach(btn => {
      const optionIndex = Number(btn.dataset.optionIndex);
      if (!Number.isNaN(optionIndex) && q.options && q.options[optionIndex] !== undefined) {
        btn.textContent = q.options[optionIndex];
      }
    });
  }

  function applyLanguage() {
    const cfg = getCurrentLangConfig();
    document.documentElement.setAttribute('lang', state.language);
    if (cfg.documentTitle) document.title = cfg.documentTitle;

    staticTextNodes.forEach(node => {
      const key = node.dataset.i18nKey;
      if (key && cfg.static && cfg.static[key] !== undefined) {
        node.textContent = cfg.static[key];
      }
    });

    dinoTextNodes.forEach(node => {
      const descriptor = node.dataset.i18nDino;
      if (!descriptor) return;
      const [key, field] = descriptor.split('-');
      if (field === 'name') node.textContent = getDinoName(key);
      if (field === 'desc') node.textContent = getDinoDesc(key);
    });

    dinoCards.forEach(card => {
      const key = card.getAttribute('data-dino');
      const img = card.querySelector('.dino-emoji img');
      if (img) img.alt = getDinoName(key);
    });
    const figureImg = dinoFigureEl?.querySelector('img');
    if (figureImg) figureImg.alt = getDinoName(state.selectedDinoKey);

    if (dinoSelectGrid && cfg.aria) dinoSelectGrid.setAttribute('aria-label', cfg.aria.dinoSelect);
    if (dinoPanelEl && cfg.aria) dinoPanelEl.setAttribute('aria-label', cfg.aria.dinoPanel);
    if (livesContainer && cfg.aria) livesContainer.setAttribute('aria-label', cfg.aria.lives);
    if (answersContainer && cfg.aria) answersContainer.setAttribute('aria-label', cfg.aria.answers);
    if (playerBadge && cfg.aria) playerBadge.title = cfg.aria.playerBadge;
    if (scoreContainer && cfg.aria) scoreContainer.title = cfg.aria.scoreTitle;
    if (exitBtn && cfg.misc) exitBtn.title = cfg.misc.exitTitle;

    if (nameRandomBtn && cfg.static && cfg.static['random-name']) {
      const titleText = cfg.static['random-name'].replace(/^🎲\s*/, '');
      nameRandomBtn.title = titleText;
    }

    languageToggleBtns.forEach(btn => {
      if (cfg.languageToggle) btn.textContent = cfg.languageToggle;
      if (cfg.toggles) btn.title = cfg.toggles.languageTitle;
    });

    syncToggleButtons();
    updateDinoPanelText();
    updateQuestionTextsForLanguage();
    renderRewardsTray();
    if (resultScreen.classList.contains('active')) {
      renderResultRewardsList();
      updateResultSummaryText();
      if (resultMistakes && resultMistakes.style.display === 'block') renderMistakesInto(resultMistakes);
    }
    if (failScreen.classList.contains('active')) {
      updateFailSummaryText();
      if (failMistakesEl && failMistakesEl.style.display === 'block') renderMistakesInto(failMistakesEl);
    }
    updatePersonalBestNote();
  }

  function setLanguage(lang, { persist = true } = {}) {
    const normalized = normalizeLanguage(lang);
    state.language = normalized;
    if (persist) {
      try { localStorage.setItem(LANGUAGE_KEY, normalized); } catch {}
    }
    applyLanguage();
  }

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
    const cfg = getCurrentLangConfig();
    soundToggleBtns.forEach(btn => {
      btn.setAttribute('aria-pressed', state.soundOn ? 'true' : 'false');
      btn.textContent = state.soundOn ? '🔊' : '🔇';
      if (cfg.toggles) btn.title = state.soundOn ? cfg.toggles.soundOnTitle : cfg.toggles.soundOffTitle;
    });
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    themeToggleBtns.forEach(btn => {
      btn.textContent = theme === 'light' ? '☀️' : '🌙';
      if (cfg.toggles) btn.title = cfg.toggles.themeTitle;
    });
    languageToggleBtns.forEach(btn => {
      if (cfg.languageToggle) btn.textContent = cfg.languageToggle;
      if (cfg.toggles) btn.title = cfg.toggles.languageTitle;
    });
  }
  function loadPrefs() {
    const theme = localStorage.getItem(THEME_KEY) || 'dark'; applyTheme(theme);
    const sound = localStorage.getItem(SOUND_KEY) || 'off'; state.soundOn = sound === 'on';
    const lang = localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE;
    setLanguage(lang, { persist: false });
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

  // Audio pool to prevent memory leaks
  const audioPool = new Audio();
  let isAudioPlaying = false;

  // 🔊 Основная функция для проигрывания твоих WAV/MP3
  // Ищет по порядку:
  //   assets/{dino}_{kind}.wav → assets/{dino}_{kind}.mp3 → assets/{kind}.wav → assets/{kind}.mp3
  function playDinoSound(kind) {
    if (!state.soundOn || isAudioPlaying) return;
    const dino = state.selectedDinoKey || 'focus';
    const variants = [
      `assets/${dino}_${kind}.wav`,
      `assets/${dino}_${kind}.mp3`,
      `assets/${kind}.wav`,
      `assets/${kind}.mp3`,
    ];
    let i = 0;

    const cleanup = () => {
      isAudioPlaying = false;
      audioPool.onerror = null;
      audioPool.onended = null;
    };

    const tryNext = () => {
      if (i >= variants.length) {
        cleanup();
        return;
      }
      audioPool.src = variants[i++];
      audioPool.play().catch(() => { tryNext(); });
    };

    audioPool.onerror = tryNext;
    audioPool.onended = cleanup;
    isAudioPlaying = true;
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
    if (performance.now() < WFX.tEnd && (ts - WFX.lastLaunch > ROCKET_LAUNCH_INTERVAL_MS)) {
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
  function setFigureImage(containerEl, dinoKey) {
    if (!containerEl) return;
    const dino = getDinoConfig(dinoKey) || {};
    if (dino.img) {
      const alt = getDinoName(dinoKey);
      const test = new Image();
      test.onload = () => {
        const img = document.createElement('img');
        img.src = dino.img;
        img.alt = alt;
        containerEl.innerHTML = '';
        containerEl.appendChild(img);
      };
      test.onerror = () => { containerEl.textContent = dino.emoji || ''; };
      test.src = dino.img;
    } else { containerEl.textContent = dino.emoji || ''; }
  }
  function enhanceDinoCardsWithImages() {
    dinoCards.forEach(card => {
      const key = card.getAttribute('data-dino'), d = getDinoConfig(key); if (!d || !d.img) return;
      const holder = card.querySelector('.dino-emoji'); if (!holder) return;
      const test = new Image();
      test.onload = () => {
        const img = document.createElement('img');
        img.src = d.img;
        img.alt = getDinoName(key);
        holder.innerHTML = '';
        holder.appendChild(img);
      };
      test.onerror = () => { holder.textContent = d.emoji || ''; };
      test.src = d.img;
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
  function setLanguageToggleVisibility(shouldShow) {
    const hide = !shouldShow;
    languageToggleBtns.forEach(btn => {
      const wrap = btn.closest('.toggle-wrap');
      if (wrap) {
        wrap.classList.toggle('hidden', hide);
      } else {
        btn.classList.toggle('hidden', hide);
      }
    });
  }

  function showScreen(screen) {
    [startScreen, quizScreen, failScreen, resultScreen].forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
    setLanguageToggleVisibility(screen === startScreen);
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
  function fxPop(x, y, content) { const node = document.createElement('div'); node.className = 'fx-pop'; node.style.left = `${x}px`; node.style.top = `${y}px`; node.textContent = content; fxLayer.appendChild(node); setTimeout(() => node.remove(), FX_POP_DURATION_MS); }

  // ===== Имя игрока =====
  function normalizeName(s) {
    return (s || '')
      .trim()
      .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
      .substring(0, 44); // Enforce maxlength
  }
  function updateStartBtnState() {
    const hasName = normalizeName(state.playerName).length > 0;
    const hasDino = !!state.selectedDinoKey;
    startBtn.disabled = !(hasName && hasDino);
    playerBadge.textContent = `👤 ${hasName ? state.playerName : '—'}`;
  }
  function updatePersonalBestNote() {
    const name = normalizeName(state.playerName);
    const cfg = getCurrentLangConfig();
    if (!name) { personalBestNote.textContent = cfg.format.personalBestEmpty; return; }
    const best = getBestFor(name);
    if (best) personalBestNote.textContent = cfg.format.personalBestRecord(name, best, TOTAL_QUESTIONS);
    else personalBestNote.textContent = cfg.format.personalBestMissing(name);
  }
  function markNameError(on) {
    playerNameInput.classList.toggle('error', !!on);
    playerNameInput.setAttribute('aria-invalid', on ? 'true' : 'false');
    if (on) {
      personalBestNote.textContent = getCurrentLangConfig().format.nameError;
      playerNameInput.focus();
      playerNameInput.closest('.start-form')?.classList.add('shake');
      setTimeout(() => playerNameInput.closest('.start-form')?.classList.remove('shake'), 350);
    }
  }
  function genRandomName() {
    const cfg = getCurrentLangConfig();
    const parts = cfg.randomNames || { left: ['Hero'], right: ['Player'] };
    const left = parts.left || ['Hero'];
    const right = parts.right || ['Player'];
    const L = left[Math.floor(Math.random()*left.length)] || '';
    const R = right[Math.floor(Math.random()*right.length)] || '';
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
    video.classList.add('dino-reaction');
    video.removeAttribute('width');
    video.removeAttribute('height');
    video.style.width = '100%';
    video.style.height = 'auto';
    if (posterPng) video.setAttribute('poster', posterPng);

    sources.forEach(s => {
      const src = document.createElement('source');
      src.src = s.src;
      src.type = s.type;
      video.appendChild(src);
    });

    container.innerHTML = '';
    container.appendChild(video);

    let hasEnded = false;
    const safeHide = () => {
      if (hasEnded) return;
      hasEnded = true;
      hideDinoMood();
      video.remove(); // Explicitly remove video element from DOM
    };

    // Use 'once' option to auto-remove event listeners
    video.addEventListener('ended', safeHide, { once: true });
    video.addEventListener('error', safeHide, { once: true });

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
    setFigureImage(dinoFigureEl, state.selectedDinoKey);
    figureWasMood = false;
  }

  // ===== Игровая логика =====
  function pickDino(dinoKey) {
    state.selectedDinoKey = dinoKey;
    setFigureImage(dinoFigureEl, dinoKey);
    updateDinoPanelText();
    figureWasMood = false;
    setCardPressed(dinoKey);
    updateStartBtnState();
  }
  function resetGameState(keepDino = false) {
    const total = getQuestions().length;
    if (total === 0) { console.warn('QUESTIONS_DB пуст.'); }
    state.questionIndices = sampleIndices(total, TOTAL_QUESTIONS);
    state.currentIndex = 0;
    state.correctCount = 0;
    state.lives = MAX_LIVES;
    state.rewards = [];
    state.answerLocked = false;
    state.mistakes = [];
    state.bonusIndex = 0;
    renderRewardsTray();
    nextBtn.disabled = true;
    if (!keepDino) pickDino(Object.keys(DINOS)[0]);
    renderLives();
    updateProgress();
    setBadgeMood('neutral');
    hideDinoMood();
    updateQuestionTextsForLanguage();
  }
  function renderQuestion() {
    hideDinoMood();
    const questions = getQuestions();
    const qIdx = state.questionIndices[state.currentIndex];
    const q = questions[qIdx];
    if (!q) return;
    questionTextEl.textContent = q.q;
    const mapped = q.options.map((text, idx) => ({ text, optionIndex: idx, isCorrect: idx === q.correctIndex }));
    shuffleInPlace(mapped);
    answersContainer.innerHTML = '';
    mapped.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn';
      btn.textContent = opt.text;
      btn.dataset.optionIndex = String(opt.optionIndex);
      btn.addEventListener('click', (ev) => handleAnswerClick(btn, opt.isCorrect, opt.optionIndex, ev));
      answersContainer.appendChild(btn);
    });
    nextBtn.disabled = true;
    state.answerLocked = false;
    setBadgeMood('neutral');
    updateProgress();
  }
  function lockAnswers() { Array.from(answersContainer.children).forEach(btn => { btn.classList.add('disabled'); btn.setAttribute('aria-disabled', 'true'); }); }
  function revealCorrect() {
    const questions = getQuestions();
    const qIdx = state.questionIndices[state.currentIndex];
    const q = questions[qIdx];
    if (!q) return;
    Array.from(answersContainer.children).forEach(btn => {
      const idx = Number(btn.dataset.optionIndex);
      if (!Number.isNaN(idx) && idx === q.correctIndex) btn.classList.add('correct');
    });
  }
  function handleAnswerClick(btn, isCorrect, optionIndex, ev) {
    if (state.answerLocked) return; state.answerLocked = true; lockAnswers();
    const questions = getQuestions();
    const qIdx = state.questionIndices[state.currentIndex], q = questions[qIdx];
    if (!q) return;
    if (isCorrect) {
      btn.classList.add('correct'); state.correctCount += 1;
      const bonus = BONUS_ITEMS[state.bonusIndex % BONUS_ITEMS.length];
      state.bonusIndex += 1;
      state.rewards.push(bonus.id);
      renderRewardsTray();
      playBeep('reward');
      setBadgeMood('happy'); const x = (ev && ev.clientX) || (window.innerWidth / 2), y = (ev && ev.clientY) || (window.innerHeight / 2);
      fxPop(x, y, '⭐'); fireworks(); playDinoSound('ok'); showDinoMood('ok');
    } else {
      btn.classList.add('wrong'); revealCorrect(); state.lives = Math.max(0, state.lives - 1); renderLives();
      setBadgeMood('sad'); fxPop(window.innerWidth - 80, 80, '😢'); failFlashAndShake(); playDinoSound('fail'); showDinoMood('fail');
      state.mistakes.push({ questionIdx: qIdx, chosenIdx: optionIndex, correctIdx: q.correctIndex });
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
    const questions = getQuestions();
    const cfg = getCurrentLangConfig();
    state.mistakes.forEach(m => {
      const li = document.createElement('li'); li.className = 'mistake-item';
      const question = questions[m.questionIdx] || {};
      const qText = question.q || '';
      const yourAnswer = (question.options && question.options[m.chosenIdx]) || '';
      const correctAnswer = (question.options && question.options[m.correctIdx]) || '';
      const qEl = document.createElement('p'); qEl.className = 'mis-q'; qEl.textContent = cfg.format.mistakeQuestion(qText);
      const aEl = document.createElement('p'); aEl.className = 'mis-a'; aEl.textContent = cfg.format.mistakeAnswer(yourAnswer, correctAnswer);
      li.appendChild(qEl); li.appendChild(aEl); list.appendChild(li);
    });
    container.appendChild(list);
  }

  function updateFailSummaryText() {
    if (!failSummaryEl) return;
    const cfg = getCurrentLangConfig();
    const dinoName = getDinoName(state.selectedDinoKey) || '';
    const questionNumber = Math.min(state.currentIndex + 1, TOTAL_QUESTIONS);
    failSummaryEl.textContent = cfg.format.failSummary(dinoName, questionNumber, TOTAL_QUESTIONS, state.correctCount);
  }

  function updateResultSummaryText() {
    if (!resultSummary) return;
    const cfg = getCurrentLangConfig();
    const allCorrect = state.correctCount === TOTAL_QUESTIONS && state.lives > 0;
    const headline = cfg.format.resultHeadline(allCorrect, TOTAL_QUESTIONS);
    const details = cfg.format.resultDetails(state.correctCount, TOTAL_QUESTIONS, state.lives);
    const joiner = /[.!?]$/.test(headline) ? ' ' : '. ';
    resultSummary.textContent = `${headline}${joiner}${details}`;
  }

  function showFailScreen() {
    hideDinoMood();
    updateFailSummaryText();
    if (failMistakesEl) failMistakesEl.style.display = 'none';
    const dName = getDinoName(state.selectedDinoKey) || 'Cognosaur';
    if (state.playerName) saveRun(state.playerName, { correct: state.correctCount, lives: 0, dino: dName });
    showScreen(failScreen);
  }

  function finishGame() {
    hideDinoMood();
    updateResultSummaryText();
    renderResultRewardsList();

    const dName = getDinoName(state.selectedDinoKey) || 'Cognosaur';
    if (state.playerName) {
      const info = saveRun(state.playerName, { correct: state.correctCount, lives: state.lives, dino: dName });
      if (info.isRecord) fxPop(window.innerWidth/2, 120, getCurrentLangConfig().format.newRecord);
    }

    // ===== САЛЮТ, итоги после полного завершения частиц =====
    startWinShow(WIN_SHOW_DURATION_MS, () => {
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
  languageToggleBtns.forEach(btn => btn.addEventListener('click', () => {
    const nextLang = state.language === 'ru' ? 'en' : 'ru';
    setLanguage(nextLang);
  }));

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

    // Прелоадер: показываем логотип, затем старт-экран
    const preload = document.getElementById('preload-screen');
    setTimeout(() => {
      if (preload) preload.style.display = 'none';
      // Снимаем блокировку и синхронизируем кнопки
      themeToggleBtns.forEach(btn => btn.disabled = false);
      syncToggleButtons();
      showScreen(startScreen);
    }, PRELOADER_DURATION_MS);
  })();
})();
