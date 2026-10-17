(function () {
  let container, hatchBtn, eggEl, listEl, countEl, totalCount = 0;
  let hatchTimeout = null;
  let resetTimeout = null;

  const PETS = [
    { e: '🐶', n: 'Puppy', r: 'Common' },
    { e: '🐱', n: 'Kitten', r: 'Common' },
    { e: '🐰', n: 'Bunny', r: 'Common' },
    { e: '🐹', n: 'Hamster', r: 'Common' },
    { e: '🐢', n: 'Turtle', r: 'Common' },
    { e: '🦊', n: 'Fox', r: 'Rare' },
    { e: '🐼', n: 'Panda', r: 'Rare' },
    { e: '🦉', n: 'Owl', r: 'Rare' },
    { e: '🐨', n: 'Koala', r: 'Rare' },
    { e: '🐉', n: 'Dragon', r: 'Epic' },
    { e: '🦄', n: 'Unicorn', r: 'Epic' },
    { e: '🐺', n: 'Wolf', r: 'Epic' },
    { e: '🌟', n: 'Star Pet', r: 'Legendary' },
    { e: '🐲', n: 'Mega Dragon', r: 'Legendary' },
    { e: '👑', n: 'Royal Pet', r: 'Legendary' }
  ];

  function rollRarity() {
    const roll = Math.random() * 100;
    if (roll < 60) return 'Common';
    if (roll < 85) return 'Rare';
    if (roll < 97) return 'Epic';
    return 'Legendary';
  }

  function rollPet() {
    const rarity = rollRarity();
    const pool = PETS.filter((p) => p.r === rarity);
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function hatch() {
    if (eggEl.classList.contains('cracking')) return;
    eggEl.classList.add('cracking');
    hatchTimeout = setTimeout(() => {
      eggEl.classList.remove('cracking');
      const pet = rollPet();
      totalCount++;
      countEl.textContent = `Pets collected: ${totalCount}`;
      const card = document.createElement('div');
      card.className = 'pet-card pet-' + pet.r.toLowerCase();
      card.innerHTML =
        `<span class="pet-emoji">${pet.e}</span>` +
        `<span class="pet-name">${pet.n}</span>` +
        `<span class="pet-rarity">${pet.r}</span>`;
      listEl.prepend(card);
      eggEl.textContent = pet.e;
      resetTimeout = setTimeout(() => { eggEl.textContent = '🥚'; }, 700);
    }, 500);
  }

  window.startPetsGame = function (mount) {
    container = mount;
    container.classList.add('pets-stage');
    container.innerHTML =
      '<div class="pets-hatch">' +
      '<div id="petEgg" class="egg">🥚</div>' +
      '<button id="hatchBtn" class="hatch-btn" type="button">Hatch an Egg!</button>' +
      '<p id="petCount" class="pet-count">Pets collected: 0</p>' +
      '<p class="free-note">✨ Every pet is 100% FREE ✨</p>' +
      '</div>' +
      '<div id="petList" class="pet-list"></div>';
    eggEl = container.querySelector('#petEgg');
    hatchBtn = container.querySelector('#hatchBtn');
    countEl = container.querySelector('#petCount');
    listEl = container.querySelector('#petList');
    totalCount = 0;
    hatchBtn.addEventListener('click', hatch);
  };

  window.stopPetsGame = function () {
    if (hatchTimeout) clearTimeout(hatchTimeout);
    if (resetTimeout) clearTimeout(resetTimeout);
    if (hatchBtn) hatchBtn.removeEventListener('click', hatch);
    if (container) container.innerHTML = '';
    container = null;
    hatchBtn = null;
    eggEl = null;
    listEl = null;
    countEl = null;
  };
})();
