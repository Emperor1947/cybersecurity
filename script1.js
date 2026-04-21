// ═══════════════════════════════════════════
//   SECUREVAULT — script1.js  (Upload Page)
// ═══════════════════════════════════════════

/* ─── Matrix Rain ─── */
(function () {
  const canvas = document.getElementById('matrixCanvas');
  const ctx    = canvas.getContext('2d');

  const POOL = [
    '0','1','0','1','0','1','0','1','0','1','0','1',
    '0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F',
    'ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ',
    'サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト',
    'ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ',
    'マ','ミ','ム','メ','モ','ヤ','ユ','ヨ','ラ','リ',
    'ル','レ','ロ','ワ','ヲ','ン',
    'Ω','Ψ','Δ','Φ','λ','β','∑','∞','≈','π','μ','σ','θ','ε',
    'Я','Ж','Э','Ю','Б','Д','И','Ц','Ч','Ш','Щ','Ъ',
    '#','@','!','%','&','*','+','=','<','>','~','^',
    '◈','⬡','◆','▲','■','●','◀','▶','░','▒',
  ];

  const FS = 14, LH = 15;
  let W, H, cols, streams = [], lastTime = 0;

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function randChar()  { return POOL[Math.floor(Math.random() * POOL.length)]; }

  function makeStream(col, offsetY) {
    const len    = Math.floor(rnd(10, 30));
    const startY = offsetY !== undefined ? offsetY : -len - Math.floor(rnd(0, 40));
    return {
      col, y: startY, length: len,
      speed:   rnd(0.25, 1.1),
      chars:   Array.from({ length: len }, randChar),
      opacity: rnd(0.5, 1.0),
      isBurst: Math.random() < 0.035,
      mutRate: rnd(0.01, 0.07),
    };
  }

  function init() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols    = Math.floor(W / FS);
    streams = [];
    ctx.font = `${FS}px 'Share Tech Mono', monospace`;
    for (let c = 0; c < cols; c++) {
      const n = 1 + Math.floor(Math.random() * 3);
      for (let k = 0; k < n; k++) streams.push(makeStream(c));
    }
  }

  function drawFrame() {
    ctx.fillStyle = 'rgba(0,5,8,0.036)';
    ctx.fillRect(0, 0, W, H);
    const dead = [];

    for (let si = 0; si < streams.length; si++) {
      const s = streams[si];
      if (Math.random() < s.mutRate)
        s.chars[Math.floor(Math.random() * s.length)] = randChar();

      const x = s.col * FS;

      for (let r = 0; r < s.length; r++) {
        const py    = (s.y - r) * LH;
        if (py < -LH || py > H + LH) continue;
        const decay = 1 - r / s.length;
        ctx.shadowBlur = 0;

        if (r === 0) {
          ctx.fillStyle   = s.isBurst ? '#ffffff' : '#d0ffe4';
          ctx.shadowColor = '#00ff9f';
          ctx.shadowBlur  = s.isBurst ? 24 : 16;
        } else if (r === 1) {
          ctx.fillStyle   = `rgba(0,255,159,${s.opacity})`;
          ctx.shadowColor = '#00ff9f';
          ctx.shadowBlur  = s.isBurst ? 12 : 7;
        } else if (r < 5) {
          ctx.fillStyle = `rgba(0,${Math.floor(180*decay+60)},${Math.floor(80*decay)},${s.opacity*decay*1.1})`;
        } else if (r < s.length * 0.65) {
          ctx.fillStyle = `rgba(0,${Math.floor(140*decay+30)},40,${s.opacity*decay*0.85})`;
        } else {
          ctx.fillStyle = `rgba(0,70,25,${Math.max(0,decay*0.28)})`;
        }

        ctx.fillText(s.chars[r], x, py);
        ctx.shadowBlur = 0;
      }

      s.y += s.speed;
      if ((s.y - s.length) * LH > H) dead.push(si);
    }

    for (let i = dead.length - 1; i >= 0; i--) {
      const col = streams[dead[i]].col;
      streams.splice(dead[i], 1);
      streams.push(makeStream(col));
    }

    if (Math.random() < 0.007) {
      const s = makeStream(Math.floor(Math.random() * cols), 0);
      s.isBurst = true; s.length = Math.floor(rnd(3,10));
      s.speed = rnd(0.9,1.8); s.opacity = 1;
      streams.push(s);
    }
  }

  function loop(ts) {
    if (ts - lastTime > 16) { drawFrame(); lastTime = ts; }
    requestAnimationFrame(loop);
  }

  init();
  requestAnimationFrame(loop);
  window.addEventListener('resize', init);
})();


/* ─── Inject keyframes ─── */
(function () {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes cornerPulse {
      0%,100% { opacity:.9; box-shadow:0 0 6px #00ff9f; }
      50%     { opacity:.3; box-shadow:0 0 20px #00ff9f; }
    }
    @keyframes rippleAnim { to { transform:scale(65); opacity:0; } }
    @keyframes modalFadeOut { from{opacity:1} to{opacity:0} }
  `;
  document.head.appendChild(s);

  /* Stagger corner bracket pulses */
  document.querySelectorAll('.vault-card .corner').forEach((c, i) => {
    c.style.animation = `cornerPulse ${1.8 + i * 0.5}s ease-in-out infinite ${i * 0.35}s`;
  });
})();


/* ─── Button ripple helper ─── */
function addRipple(el, color) {
  el.addEventListener('click', function (e) {
    const r   = el.getBoundingClientRect();
    const rpl = document.createElement('span');
    rpl.style.cssText = `
      position:absolute;border-radius:50%;width:6px;height:6px;
      background:${color};
      left:${e.clientX - r.left - 3}px;
      top:${e.clientY - r.top - 3}px;
      transform:scale(0);pointer-events:none;z-index:30;
      animation:rippleAnim .65s ease-out forwards;
    `;
    el.appendChild(rpl);
    setTimeout(() => rpl.remove(), 700);
  });
}

addRipple(document.getElementById('enterBtn'), 'rgba(0,255,159,0.55)');


/* ─── File Input: browse + drag & drop ─── */
(function () {
  const fileInput   = document.getElementById('fileInput');
  const enterBtn    = document.getElementById('enterBtn');
  const previewArea = document.getElementById('previewArea');
  const previewImg  = document.getElementById('previewImg');
  const previewMeta = document.getElementById('previewMeta');
  const vaultCard   = document.getElementById('vaultCard');

  /* Drag over card */
  vaultCard.addEventListener('dragover', e => {
    e.preventDefault();
    vaultCard.style.borderColor = 'rgba(0,255,159,0.65)';
    vaultCard.style.boxShadow   = '0 0 70px rgba(0,255,159,0.28)';
  });

  vaultCard.addEventListener('dragleave', () => {
    vaultCard.style.borderColor = '';
    vaultCard.style.boxShadow   = '';
  });

  vaultCard.addEventListener('drop', e => {
    e.preventDefault();
    vaultCard.style.borderColor = '';
    vaultCard.style.boxShadow   = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadFile(file);
  });

  /* File picker */
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) loadFile(fileInput.files[0]);
  });

  function loadFile(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      previewImg.src = ev.target.result;

      const kb = (file.size / 1024).toFixed(1);
      const mb = (file.size / 1048576).toFixed(2);
      previewMeta.textContent =
        `◈  ${file.name}  ·  ${mb > 1 ? mb + ' MB' : kb + ' KB'}  ·  ${file.type.replace('image/','').toUpperCase()}`;

      /* Hide button, reveal preview */
      enterBtn.style.display = 'none';
      previewArea.classList.add('show');

      /* Flash card */
      vaultCard.style.transition = 'box-shadow 0.3s ease';
      vaultCard.style.boxShadow  = '0 0 90px rgba(0,255,159,0.38), 0 30px 70px rgba(0,0,0,0.75)';
      setTimeout(() => { vaultCard.style.boxShadow = ''; }, 700);

      /* Ripple on upload button */
      const ubtn = document.querySelector('.upload-btn');
      if (ubtn) addRipple(ubtn, 'rgba(0,229,255,0.55)');
    };
    reader.readAsDataURL(file);
  }

  /* Expose clear globally */
  window.clearImage = function () {
    fileInput.value = '';
    previewImg.src  = '';
    previewArea.classList.remove('show');
    enterBtn.style.display = '';
  };
})();


/* ─── Upload Handler ─── */
window.handleUpload = function () {
  const overlay = document.getElementById('modalOverlay');
  const codeEl  = document.getElementById('modalCode');

  const id = 'SVF_' +
    Math.random().toString(36).substring(2,7).toUpperCase() + '_' +
    Date.now().toString(36).toUpperCase();

  codeEl.textContent = 'FILE_ID: ' + id;
  overlay.classList.add('open');

  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  }, { once: true });
};

window.closeModal = function () {
  const overlay = document.getElementById('modalOverlay');
  overlay.style.animation = 'modalFadeOut 0.3s ease forwards';
  setTimeout(() => {
    overlay.classList.remove('open');
    overlay.style.animation = '';
    window.clearImage();
  }, 300);
};