(function () {
  let raf = null;
  let canvas, ctx, container, resizeHandler;
  let cols, rows, cellSize, offsetX, offsetY;
  let maze = [];
  let player, monster, toys, lives, collected, totalToys, state;
  let keys = {};
  let lastPlayerMove = 0;
  let lastMonsterMove = 0;
  let hitFlashUntil = 0;

  const LAYOUT = [
    '###########',
    '#.........#',
    '#.##.#.##.#',
    '#.........#',
    '#.##.#.##.#',
    '#.........#',
    '###########'
  ];

  function buildMaze() {
    maze = LAYOUT.map((row) => row.split(''));
    rows = maze.length;
    cols = maze[0].length;
  }

  function resetState() {
    buildMaze();
    player = { c: 1, r: 1 };
    monster = { c: cols - 2, r: rows - 2 };
    const spots = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (maze[r][c] === '.' && !(r === player.r && c === player.c) && !(r === monster.r && c === monster.c)) {
          spots.push({ r, c });
        }
      }
    }
    for (let i = spots.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [spots[i], spots[j]] = [spots[j], spots[i]];
    }
    toys = spots.slice(0, Math.min(8, spots.length));
    collected = 0;
    totalToys = toys.length;
    lives = 3;
    state = 'playing';
    hitFlashUntil = 0;
  }

  function resize() {
    if (!container) return;
    const dpadReserve = 190;
    const availW = container.clientWidth - 20;
    const availH = container.clientHeight - dpadReserve;
    cellSize = Math.max(18, Math.floor(Math.min(availW / cols, availH / rows, 58)));
    const cw = cellSize * cols, ch = cellSize * rows;
    canvas.width = cw;
    canvas.height = ch;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    offsetX = 0;
    offsetY = 0;
  }

  function isWall(c, r) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return true;
    return maze[r][c] === '#';
  }

  function tryMovePlayer(dc, dr) {
    const nc = player.c + dc, nr = player.r + dr;
    if (!isWall(nc, nr)) {
      player.c = nc;
      player.r = nr;
    }
    for (let i = toys.length - 1; i >= 0; i--) {
      if (toys[i].c === player.c && toys[i].r === player.r) {
        toys.splice(i, 1);
        collected++;
      }
    }
    if (collected >= totalToys) state = 'won';
  }

  function moveMonster() {
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(
      ([dc, dr]) => !isWall(monster.c + dc, monster.r + dr)
    );
    if (!dirs.length) return;
    let choice;
    if (Math.random() < 0.6) {
      dirs.sort((a, b) => {
        const da = Math.hypot(monster.c + a[0] - player.c, monster.r + a[1] - player.r);
        const db = Math.hypot(monster.c + b[0] - player.c, monster.r + b[1] - player.r);
        return da - db;
      });
      choice = dirs[0];
    } else {
      choice = dirs[Math.floor(Math.random() * dirs.length)];
    }
    monster.c += choice[0];
    monster.r += choice[1];
    if (monster.c === player.c && monster.r === player.r) onCaught();
  }

  function onCaught() {
    if (performance.now() < hitFlashUntil) return;
    lives--;
    hitFlashUntil = performance.now() + 900;
    player.c = 1;
    player.r = 1;
    if (lives <= 0) state = 'lost';
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#20233f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * cellSize, y = offsetY + r * cellSize;
        if (maze[r][c] === '#') {
          ctx.fillStyle = '#3a2d55';
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = '#4e3d70';
          ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        } else {
          ctx.fillStyle = '#2b2f55';
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }
    }

    ctx.font = `${cellSize * 0.6}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    toys.forEach((t) => {
      ctx.fillText('🧸', offsetX + t.c * cellSize + cellSize / 2, offsetY + t.r * cellSize + cellSize / 2);
    });

    const flashing = performance.now() < hitFlashUntil;
    ctx.globalAlpha = flashing ? (Math.floor(performance.now() / 100) % 2 === 0 ? 0.35 : 1) : 1;
    ctx.fillText('🙂', offsetX + player.c * cellSize + cellSize / 2, offsetY + player.r * cellSize + cellSize / 2);
    ctx.globalAlpha = 1;

    ctx.fillText('👾', offsetX + monster.c * cellSize + cellSize / 2, offsetY + monster.r * cellSize + cellSize / 2);

    ctx.textAlign = 'left';
    ctx.font = `bold ${Math.max(14, cellSize * 0.4)}px sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.fillText(`🧸 ${collected}/${totalToys}`, 10, 22);
    ctx.textAlign = 'right';
    ctx.fillText(lives > 0 ? '❤️'.repeat(lives) : '💔', canvas.width - 10, 22);

    if (state !== 'playing') {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, canvas.height / 2 - 60, canvas.width, 120);
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(18, cellSize * 0.7)}px sans-serif`;
      ctx.fillText(
        state === 'won' ? '🎉 You collected them all! 🎉' : '👾 The toy monster got you!',
        canvas.width / 2,
        canvas.height / 2 - 15
      );
      ctx.font = `${Math.max(14, cellSize * 0.45)}px sans-serif`;
      ctx.fillText('Tap anywhere to play again', canvas.width / 2, canvas.height / 2 + 22);
    }
  }

  function loop(ts) {
    if (state === 'playing') {
      if (ts - lastPlayerMove > 140) {
        if (keys.up) { tryMovePlayer(0, -1); lastPlayerMove = ts; }
        else if (keys.down) { tryMovePlayer(0, 1); lastPlayerMove = ts; }
        else if (keys.left) { tryMovePlayer(-1, 0); lastPlayerMove = ts; }
        else if (keys.right) { tryMovePlayer(1, 0); lastPlayerMove = ts; }
      }
      if (ts - lastMonsterMove > 480) { moveMonster(); lastMonsterMove = ts; }
    }
    draw();
    raf = requestAnimationFrame(loop);
  }

  const KEY_MAP = {
    ArrowUp: 'up', w: 'up', W: 'up',
    ArrowDown: 'down', s: 'down', S: 'down',
    ArrowLeft: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right'
  };

  function onKeyDown(e) {
    if (KEY_MAP[e.key]) { keys[KEY_MAP[e.key]] = true; e.preventDefault(); }
  }
  function onKeyUp(e) {
    if (KEY_MAP[e.key]) keys[KEY_MAP[e.key]] = false;
  }

  function makeDpad() {
    const wrap = document.createElement('div');
    wrap.className = 'dpad';
    wrap.innerHTML =
      '<button data-dir="up" aria-label="Up">▲</button>' +
      '<div class="dpad-mid">' +
      '<button data-dir="left" aria-label="Left">◀</button>' +
      '<button data-dir="right" aria-label="Right">▶</button>' +
      '</div>' +
      '<button data-dir="down" aria-label="Down">▼</button>';
    container.appendChild(wrap);
    wrap.querySelectorAll('button').forEach((btn) => {
      const dir = btn.dataset.dir;
      const down = (e) => { e.preventDefault(); keys[dir] = true; };
      const up = (e) => { e.preventDefault(); keys[dir] = false; };
      btn.addEventListener('pointerdown', down);
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointerleave', up);
      btn.addEventListener('pointercancel', up);
    });
  }

  function onCanvasTap() {
    if (state !== 'playing') resetState();
  }

  window.startFactoryGame = function (mount) {
    container = mount;
    container.classList.add('factory-stage');
    canvas = document.createElement('canvas');
    canvas.className = 'game-canvas';
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resetState();
    resize();
    makeDpad();
    resizeHandler = () => resize();
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('pointerdown', onCanvasTap);
    lastPlayerMove = performance.now();
    lastMonsterMove = performance.now();
    raf = requestAnimationFrame(loop);
  };

  window.stopFactoryGame = function () {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    keys = {};
    if (container) container.innerHTML = '';
    container = null;
    canvas = null;
    ctx = null;
  };
})();
