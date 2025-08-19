(function () {
	'use strict';

	// Константы игры
	const TOTAL_QUESTIONS = 15;
	const MAX_LIVES = 5;
	const THEME_KEY = 'quiz_theme';
	const SOUND_KEY = 'quiz_sound';

	// Карточки когнозавров + базовые PNG
	const DINOS = {
		focus: { name: 'PAWозавр', emoji: '🦖', reward: '🧠', img: 'assets/pawozavr.png' },
		logic: { name: 'Фидоцератепс', emoji: '🦕', reward: '🧩', img: 'assets/fidocerateps.png' },
		creo:  { name: 'Кубодокс',     emoji: '🦅', reward: '💡', img: 'assets/kubodoks.png' },
	};

	// Колода бонусов
	const BONUS_DECK = [
		{ name: 'Корона', icon: '👑' }, { name: 'Щит', icon: '🛡' }, { name: 'Меч', icon: '⚔️' },
		{ name: 'Кинжал', icon: '🗡' }, { name: 'Ноутбук', icon: '💻' }, { name: 'Мышь', icon: '🖱' },
		{ name: 'Торт', icon: '🎂' }, { name: 'Повышение ЗП', icon: '💵' }, { name: 'Индексация ЗП', icon: '₽' },
		{ name: 'Очки', icon: '👓' }, { name: 'Седло', icon: '🐴' }, { name: 'Игрушка', icon: '🧸' },
		{ name: 'Сертификат IBM', icon: '📜' }, { name: 'Фонарик', icon: '🔦' }, { name: 'Рюкзак', icon: '🎒' },
	];

	// DOM
	const startScreen = document.getElementById('start-screen');
	const quizScreen = document.getElementById('quiz-screen');
	const resultScreen = document.getElementById('result-screen');

	const dinoCards = Array.from(document.querySelectorAll('.dino-card'));
	const startBtn = document.getElementById('start-btn');

	const selectedDinoBadge = document.getElementById('selected-dino-badge');
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

	const soundToggleBtns = Array.from(document.querySelectorAll('.sound-toggle-btn'));
	const themeToggleBtns = Array.from(document.querySelectorAll('.theme-toggle-btn'));

	const fxLayer = document.getElementById('fx-layer');

	// Состояние
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
	};

	// ===== ТЕМА =====
	function applyTheme(theme) { document.documentElement.setAttribute('data-theme', theme === 'light' ? 'light' : 'dark'); }
	function syncToggleButtons() {
		soundToggleBtns.forEach(btn => { btn.setAttribute('aria-pressed', state.soundOn ? 'true' : 'false'); btn.textContent = state.soundOn ? '🔊' : '🔇'; btn.title = `Звук: ${state.soundOn ? 'вкл' : 'выкл'}`; });
		const theme = document.documentElement.getAttribute('data-theme') || 'dark';
		themeToggleBtns.forEach(btn => { btn.textContent = theme === 'light' ? '☀️' : '🌙'; });
	}
	function loadPrefs() {
		const theme = localStorage.getItem(THEME_KEY) || 'dark'; applyTheme(theme);
		const sound = localStorage.getItem(SOUND_KEY) || 'off'; state.soundOn = sound === 'on';
		syncToggleButtons();
	}
	function toggleTheme() {
		const current = document.documentElement.getAttribute('data-theme') || 'dark';
		const next = current === 'dark' ? 'light' : 'dark';
		applyTheme(next); localStorage.setItem(THEME_KEY, next); syncToggleButtons();
	}

	// ===== ЗВУК =====
	function ensureAudio() { if (!state.audioCtx) { try { state.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } }
	function playBeep(type = 'ok') {
		if (!state.soundOn) return; ensureAudio(); if (!state.audioCtx) return;
		const ctx = state.audioCtx, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
		if (type === 'ok') o.frequency.setValueAtTime(880, ctx.currentTime);
		if (type === 'fail') o.frequency.setValueAtTime(220, ctx.currentTime);
		if (type === 'reward') o.frequency.setValueAtTime(1320, ctx.currentTime);
		g.gain.setValueAtTime(0.0001, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
		g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25); o.connect(g).connect(ctx.destination); o.start(); o.stop(ctx.currentTime + 0.3);
	}

	// ===== ЭФФЕКТЫ =====
	function fireworks() {
		const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
		for (let i = 0; i < 24; i++) {
			const p = document.createElement('div'); p.className = 'fx-firework';
			const a = (Math.PI * 2 * i) / 24, r = 140 + Math.random() * 80;
			p.style.left = `${cx}px`; p.style.top = `${cy}px`;
			p.style.setProperty('--dx', `${Math.cos(a) * r}px`); p.style.setProperty('--dy', `${Math.sin(a) * r}px`);
			fxLayer.appendChild(p); setTimeout(() => p.remove(), 900);
		}
	}
	function failFlashAndShake() {
		const flash = document.createElement('div'); flash.className = 'fx-flash'; fxLayer.appendChild(flash);
		setTimeout(() => flash.remove(), 320); dinoPanelEl.classList.add('shake'); setTimeout(() => dinoPanelEl.classList.remove('shake'), 360);
	}
	function setMoodEmoji(kind) { if (!dinoMoodEmoji) return; dinoMoodEmoji.textContent = kind === 'happy' ? '😊' : kind === 'sad' ? '😢' : ''; }

	// ===== PNG-эмоции (ok/fail) =====
	let moodHideTimer = null, figureWasMood = false;
	function showDinoMood(kind) {
		const d = DINOS[state.selectedDinoKey]; if (!d || !dinoFigureEl) return;
		let moodSrc = '';
		if (state.selectedDinoKey === 'focus') moodSrc = kind === 'ok' ? 'assets/paw_ok.png' : 'assets/paw_fail.png';
		else if (state.selectedDinoKey === 'logic') moodSrc = kind === 'ok' ? 'assets/fido_ok.png' : 'assets/fido_fail.png';
		else if (state.selectedDinoKey === 'creo') moodSrc = kind === 'ok' ? 'assets/kubo_ok.png' : 'assets/kubo_fail.png';
		if (!moodSrc) return;
		dinoFigureEl.innerHTML = `<img src="${moodSrc}" alt="${d.name} ${kind}">`; figureWasMood = true;
		clearTimeout(moodHideTimer); moodHideTimer = setTimeout(hideDinoMood, 1500);
	}
	function hideDinoMood() { if (!figureWasMood) return; const d = DINOS[state.selectedDinoKey]; setFigureImage(dinoFigureEl, d); figureWasMood = false; }

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

	// ===== Утилиты =====
	function showScreen(screen) { [startScreen, quizScreen, resultScreen].forEach(s => s.classList.remove('active')); screen.classList.add('active'); }
	function shuffleInPlace(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }
	function sampleIndices(total, count) { const idx = Array.from({ length: total }, (_, i) => i); shuffleInPlace(idx); return idx.slice(0, count); }
	function setBadgeMood(mood) {
		selectedDinoBadge.classList.remove('happy', 'sad'); dinoPanelEl.classList.remove('happy', 'sad');
		if (mood === 'happy') { selectedDinoBadge.classList.add('happy'); dinoPanelEl.classList.add('happy'); }
		if (mood === 'sad') { selectedDinoBadge.classList.add('sad'); dinoPanelEl.classList.add('sad'); }
		setMoodEmoji(mood);
	}
	function renderLives() {
		livesContainer.innerHTML = '';
		for (let i = 0; i < MAX_LIVES; i++) {
			const span = document.createElement('span'); span.className = 'life'; span.textContent = '❤️';
			if (i >= state.lives) span.style.opacity = '0.25'; livesContainer.appendChild(span);
		}
	}
	function updateProgress() {
		progressIndexEl.textContent = String(Math.min(state.currentIndex + 1, TOTAL_QUESTIONS));
		progressTotalEl.textContent = String(TOTAL_QUESTIONS);
		const ratio = Math.min(state.currentIndex / TOTAL_QUESTIONS, 1); progressFill.style.width = `${Math.floor(ratio * 100)}%`;
	}
	function addRewardChip(bonus) { const chip = document.createElement('div'); chip.className = 'reward-chip'; chip.textContent = `${bonus.icon} ${bonus.name}`; rewardsTray.appendChild(chip); state.rewards.push(bonus); rewardCountEl.textContent = String(state.rewards.length); playBeep('reward'); }
	function fxPop(x, y, content) { const node = document.createElement('div'); node.className = 'fx-pop'; node.style.left = `${x}px`; node.style.top = `${y}px`; node.textContent = content; fxLayer.appendChild(node); setTimeout(() => node.remove(), 3000); }

	// ===== Игровая логика =====
	function pickDino(dinoKey) {
		state.selectedDinoKey = dinoKey;
		const d = DINOS[dinoKey];
		selectedDinoBadge.textContent = ''; // ← эмодзи и имя убраны
		setFigureImage(dinoFigureEl, d);
		if (dinoNameBigEl) dinoNameBigEl.textContent = d.name;
		figureWasMood = false;
	}
	function resetSelectionUI() { dinoCards.forEach(c => c.setAttribute('aria-pressed', 'false')); startBtn.disabled = true; }
	function resetGameState(keepDino = false) {
		state.questionIndices = sampleIndices(window.QUESTIONS_DB.length, TOTAL_QUESTIONS);
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
		mapped.forEach(opt => { const btn = document.createElement('button'); btn.className = 'answer-btn'; btn.textContent = opt.text; btn.addEventListener('click', (ev) => handleAnswerClick(btn, opt.isCorrect, ev)); answersContainer.appendChild(btn); });
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
			fxPop(x, y, '⭐'); fireworks(); playBeep('ok'); showDinoMood('ok');
		} else {
			btn.classList.add('wrong'); revealCorrect(); state.lives = Math.max(0, state.lives - 1); renderLives();
			setBadgeMood('sad'); fxPop(window.innerWidth - 80, 80, '😢'); failFlashAndShake(); playBeep('fail'); showDinoMood('fail');
			state.mistakes.push({ q: q.q, yourAnswer: btn.textContent, correctAnswer: q.options[q.correctIndex] });
		}
		if (state.lives <= 0) { setTimeout(finishGame, 400); return; }
		nextBtn.disabled = false;
	}
	function nextQuestion() { hideDinoMood(); if (state.currentIndex + 1 >= TOTAL_QUESTIONS) { finishGame(); return; } state.currentIndex += 1; renderQuestion(); }
	function renderMistakes() {
		if (!resultMistakes) return; resultMistakes.innerHTML = '';
		state.mistakes.forEach(m => {
			const wrap = document.createElement('div'); wrap.className = 'mistake-item';
			const qEl = document.createElement('p'); qEl.className = 'mistake-q'; qEl.textContent = `Вопрос: ${m.q}`;
			const aEl = document.createElement('p'); aEl.className = 'mistake-a'; aEl.textContent = `Ваш ответ: ${m.yourAnswer} · Верный: ${m.correctAnswer}`;
			wrap.appendChild(qEl); wrap.appendChild(aEl); resultMistakes.appendChild(wrap);
		});
	}
	function finishGame() {
		hideDinoMood();
		const allCorrect = state.correctCount === TOTAL_QUESTIONS && state.lives > 0;
		const title = allCorrect ? 'Идеально! Все 15 открыты!' : 'Итоги игры';
		const summary = `Верно ${state.correctCount} из ${TOTAL_QUESTIONS}. Жизней осталось: ${state.lives}.`; // ← без эмодзи и имени
		resultSummary.textContent = `${title} ${summary}`;
		resultRewards.innerHTML = ''; state.rewards.forEach(r => { const chip = document.createElement('div'); chip.className = 'reward-chip'; chip.textContent = `${r.icon} ${r.name}`; resultRewards.appendChild(chip); });
		if (resultMistakes) resultMistakes.style.display = 'none';
		showScreen(resultScreen);
	}

	// Слушатели выбора динозавра
	dinoCards.forEach(card => {
		card.addEventListener('click', () => {
			dinoCards.forEach(c => c.setAttribute('aria-pressed', 'false'));
			card.setAttribute('aria-pressed', 'true');
			const key = card.getAttribute('data-dino'); pickDino(key); startBtn.disabled = false;
		});
	});

	// Кнопки
	startBtn.addEventListener('click', startGame);
	nextBtn.addEventListener('click', nextQuestion);
	playAgainBtn.addEventListener('click', () => { resetSelectionUI(); showScreen(startScreen); });
	if (showMistakesBtn) {
		showMistakesBtn.addEventListener('click', () => {
			if (!resultMistakes) return;
			const isHidden = resultMistakes.style.display === 'none' || resultMistakes.style.display === '';
			if (isHidden) { renderMistakes(); resultMistakes.style.display = 'block'; } else { resultMistakes.style.display = 'none'; }
		});
	}
	soundToggleBtns.forEach(btn => {
		btn.addEventListener('click', () => { state.soundOn = !state.soundOn; localStorage.setItem(SOUND_KEY, state.soundOn ? 'on' : 'off'); syncToggleButtons(); if (state.soundOn) ensureAudio(); });
	});
	themeToggleBtns.forEach(btn => { btn.addEventListener('click', toggleTheme); });

	// Запуск
	function startGame() { resetGameState(true); renderQuestion(); showScreen(quizScreen); }

	// Инициализация
	(function init() { enhanceDinoCardsWithImages(); pickDino('focus'); resetGameState(false); loadPrefs(); showScreen(startScreen); })();
})();
