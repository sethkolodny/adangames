(function () {
  // ---------- "bunch of kids" welcome voice ----------
  function speakWelcome() {
    if (!('speechSynthesis' in window)) return;
    const phrase = 'Welcome to Adan Games!';
    const voices = window.speechSynthesis.getVoices();
    window.speechSynthesis.cancel();
    const voiceCount = 4;
    for (let i = 0; i < voiceCount; i++) {
      const u = new SpeechSynthesisUtterance(phrase);
      u.pitch = 1.4 + Math.random() * 0.8;
      u.rate = 0.95 + Math.random() * 0.3;
      u.volume = 1;
      if (voices.length) {
        u.voice = voices[(i + Math.floor(Math.random() * voices.length)) % voices.length];
      }
      window.speechSynthesis.speak(u);
    }
  }

  const soundBtn = document.getElementById('soundBtn');
  if (soundBtn) soundBtn.addEventListener('click', speakWelcome);

  let autoTried = false;
  function tryAutoSpeak() {
    if (autoTried) return;
    autoTried = true;
    speakWelcome();
  }
  if ('speechSynthesis' in window) {
    window.addEventListener('load', () => setTimeout(tryAutoSpeak, 700));
  }

  // ---------- game modal ----------
  const modal = document.getElementById('gameModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalArea = document.getElementById('modalGameArea');
  const closeBtn = document.getElementById('closeModal');

  const GAME_META = {
    factory: { title: '🧸 Spooky Toy Factory', start: 'startFactoryGame', stop: 'stopFactoryGame' },
    pets: { title: '🐶 Pet Collector', start: 'startPetsGame', stop: 'stopPetsGame' },
    blocks: { title: '🧱 Block World', start: 'startBlocksGame', stop: 'stopBlocksGame' }
  };

  let activeStopName = null;

  function openGame(key) {
    const meta = GAME_META[key];
    if (!meta) return;
    modalTitle.textContent = meta.title;
    modalArea.innerHTML = '';
    modalArea.className = 'modal-game-area';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    activeStopName = meta.stop;
    requestAnimationFrame(() => {
      const startFn = window[meta.start];
      if (typeof startFn === 'function') startFn(modalArea);
    });
  }

  function closeGame() {
    if (activeStopName && typeof window[activeStopName] === 'function') {
      window[activeStopName]();
    }
    activeStopName = null;
    modal.classList.add('hidden');
    modalArea.innerHTML = '';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.game-card').forEach((card) => {
    card.addEventListener('click', () => openGame(card.dataset.game));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openGame(card.dataset.game);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeGame);
})();
