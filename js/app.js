(function () {
  // ---------- robotic welcome voice ----------
  // Kick off voice loading as early as possible (iOS Safari especially is slow to
  // populate this list, and only starts once something calls getVoices()).
  if ('speechSynthesis' in window) window.speechSynthesis.getVoices();

  function getVoicesAsync() {
    return new Promise((resolve) => {
      const tryNow = () => {
        const list = window.speechSynthesis.getVoices();
        return list.length ? list : null;
      };
      const immediate = tryNow();
      if (immediate) { resolve(immediate); return; }

      let settled = false;
      const finish = (list) => {
        if (settled) return;
        settled = true;
        clearInterval(poll);
        resolve(list);
      };
      window.speechSynthesis.onvoiceschanged = () => {
        const list = tryNow();
        if (list) finish(list);
      };
      // iOS Safari sometimes never fires onvoiceschanged, so also poll directly.
      const poll = setInterval(() => {
        const list = tryNow();
        if (list) finish(list);
      }, 150);
      setTimeout(() => finish(window.speechSynthesis.getVoices()), 3000);
    });
  }

  async function speakWelcome() {
    if (!('speechSynthesis' in window)) return;
    const phrase = 'Welcome to uh don Games!';
    const allVoices = await getVoicesAsync();

    // Prefer an actual robot-style system voice (macOS/iOS ship "Zarvox" and
    // "Trinoids" for exactly this). If the device doesn't have one, fall back
    // to a normal English voice and fake the robotic sound with pitch/rate.
    const robotNames = ['zarvox', 'trinoids'];
    let voice = allVoices.find((v) => robotNames.indexOf(v.name.toLowerCase()) !== -1);
    const isRealRobot = !!voice;
    if (!voice) voice = allVoices.find((v) => v.lang === 'en-US');
    if (!voice) voice = allVoices.find((v) => v.lang && v.lang.indexOf('en') === 0);

    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(phrase);
    u.lang = 'en-US';
    if (voice) u.voice = voice;
    u.pitch = isRealRobot ? 1.0 : 0.3;
    u.rate = isRealRobot ? 0.95 : 0.82;
    u.volume = 1;
    window.speechSynthesis.speak(u);
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
