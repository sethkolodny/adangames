(function () {
  // ---------- "bunch of kids" welcome voice ----------
  function getVoicesAsync() {
    return new Promise((resolve) => {
      const existing = window.speechSynthesis.getVoices();
      if (existing.length) { resolve(existing); return; }
      let settled = false;
      window.speechSynthesis.onvoiceschanged = () => {
        if (settled) return;
        settled = true;
        resolve(window.speechSynthesis.getVoices());
      };
      setTimeout(() => {
        if (settled) return;
        settled = true;
        resolve(window.speechSynthesis.getVoices());
      }, 1200);
    });
  }

  async function speakWelcome() {
    if (!('speechSynthesis' in window)) return;
    const phrase = 'Welcome to uh-DON Games!';
    const allVoices = await getVoicesAsync();
    const novelty = ['bad news', 'good news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'jester',
      'organ', 'pipe organ', 'trinoids', 'whisper', 'wobble', 'zarvox', 'albert', 'fred', 'junior', 'ralph'];
    const isClear = (v) => novelty.indexOf(v.name.toLowerCase()) === -1;
    let americanVoices = allVoices.filter((v) => v.lang === 'en-US' && isClear(v));
    if (!americanVoices.length) americanVoices = allVoices.filter((v) => v.lang === 'en-US');
    if (!americanVoices.length) americanVoices = allVoices.filter((v) => v.lang && v.lang.indexOf('en') === 0);
    window.speechSynthesis.cancel();
    const voiceCount = 4;
    for (let i = 0; i < voiceCount; i++) {
      const u = new SpeechSynthesisUtterance(phrase);
      u.lang = 'en-US';
      u.pitch = 1.1 + Math.random() * 0.5;
      u.rate = 0.92 + Math.random() * 0.16;
      u.volume = 1;
      if (americanVoices.length) {
        u.voice = americanVoices[i % americanVoices.length];
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
