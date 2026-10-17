(function () {
  let canvas, ctx, container, paletteEl, resizeHandler;
  const cols = 16, rows = 12;
  let cellSize, offsetX, offsetY;
  let grid = [];
  let selected = 0;
  let painting = false;

  const BLOCKS = [
    { name: 'Grass', color: '#5fb84c' },
    { name: 'Dirt', color: '#8a5a2b' },
    { name: 'Stone', color: '#8d8d8d' },
    { name: 'Wood', color: '#6b4226' },
    { name: 'Water', color: '#3aa0ff' },
    { name: 'Lava', color: '#ff6a2b' },
    { name: 'Snow', color: '#f2f6ff' },
    { name: 'Eraser', color: null }
  ];

  function resetGrid() {
    grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  }

  function resize() {
    if (!container || !canvas) return;
    const availW = container.clientWidth - 20;
    const availH = Math.max(container.clientHeight - paletteEl.offsetHeight - 20, 100);
    cellSize = Math.max(14, Math.floor(Math.min(availW / cols, availH / rows, 48)));
    const cw = cellSize * cols, ch = cellSize * rows;
    canvas.width = cw;
    canvas.height = ch;
    canvas.style.width = cw + 'px';
    canvas.style.height = ch + 'px';
    offsetX = 0;
    offsetY = 0;
    draw();
  }

  function draw() {
    ctx.fillStyle = '#10121f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = offsetX + c * cellSize, y = offsetY + r * cellSize;
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.strokeRect(x, y, cellSize, cellSize);
        const col = grid[r][c];
        if (col) {
          ctx.fillStyle = col;
          ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        }
      }
    }
  }

  function cellFromPoint(px, py) {
    const c = Math.floor((px - offsetX) / cellSize);
    const r = Math.floor((py - offsetY) / cellSize);
    if (c < 0 || c >= cols || r < 0 || r >= rows) return null;
    return { c, r };
  }

  function paintAt(px, py) {
    const cell = cellFromPoint(px, py);
    if (!cell) return;
    grid[cell.r][cell.c] = BLOCKS[selected].color;
    draw();
  }

  function onPointerDown(e) {
    painting = true;
    const rect = canvas.getBoundingClientRect();
    paintAt(e.clientX - rect.left, e.clientY - rect.top);
  }
  function onPointerMove(e) {
    if (!painting) return;
    const rect = canvas.getBoundingClientRect();
    paintAt(e.clientX - rect.left, e.clientY - rect.top);
  }
  function onPointerUp() { painting = false; }

  function buildPalette() {
    paletteEl = document.createElement('div');
    paletteEl.className = 'blocks-palette';
    BLOCKS.forEach((b, i) => {
      const btn = document.createElement('button');
      btn.className = 'palette-btn' + (i === 0 ? ' active' : '');
      btn.type = 'button';
      btn.title = b.name;
      btn.style.background = b.color || 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 0/14px 14px';
      btn.addEventListener('click', () => {
        selected = i;
        paletteEl.querySelectorAll('.palette-btn').forEach((x) => x.classList.remove('active'));
        btn.classList.add('active');
      });
      paletteEl.appendChild(btn);
    });
    const clearBtn = document.createElement('button');
    clearBtn.className = 'palette-btn clear-btn';
    clearBtn.type = 'button';
    clearBtn.textContent = 'Clear';
    clearBtn.addEventListener('click', () => { resetGrid(); draw(); });
    paletteEl.appendChild(clearBtn);
  }

  window.startBlocksGame = function (mount) {
    container = mount;
    container.classList.add('blocks-stage');
    buildPalette();
    container.appendChild(paletteEl);
    canvas = document.createElement('canvas');
    canvas.className = 'game-canvas';
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');
    selected = 0;
    resetGrid();
    resize();
    resizeHandler = () => resize();
    window.addEventListener('resize', resizeHandler);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  window.stopBlocksGame = function () {
    window.removeEventListener('resize', resizeHandler);
    window.removeEventListener('pointerup', onPointerUp);
    if (canvas) {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
    }
    if (container) container.innerHTML = '';
    container = null;
    canvas = null;
    ctx = null;
    paletteEl = null;
  };
})();
