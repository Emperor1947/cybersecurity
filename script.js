// ═══════════════════════════════════════════
//   SECUREVAULT — script.js
//   Matrix Rain + Multilingual Button + UI + Validation
// ═══════════════════════════════════════════

/* ─── Matrix Rain ─── */
(function () {
  const canvas = document.getElementById('matrixCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H, cols, drops;

  // Characters: mix of binary + katakana + symbols for depth
  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ01ハヒフヘホマミムメモヤユヨラリルレロワヲン0110101011ΩΨΔΦλβ∑∞≈01'.split('');

  function init() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    const fontSize = 14;
    cols = Math.floor(W / fontSize);
    drops = Array.from({ length: cols }, () => Math.random() * -50);
    ctx.font = `${fontSize}px 'Share Tech Mono', monospace`;
  }

  function draw() {
    // Fade trail — reduced alpha for more visible persistent characters
    ctx.fillStyle = 'rgba(0, 8, 12, 0.025)';
    ctx.fillRect(0, 0, W, H);

    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * 14;

      const brightness = Math.random();
      if (brightness > 0.96) {
        // Bright white-green lead — ultra vivid
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00ff9f';
        ctx.shadowBlur  = 18;
      } else if (brightness > 0.80) {
        // Bright neon green
        ctx.fillStyle = '#00ff9f';
        ctx.shadowColor = '#00ff9f';
        ctx.shadowBlur  = 10;
      } else if (brightness > 0.45) {
        // Mid green — noticeably brighter
        ctx.fillStyle = '#00e87a';
        ctx.shadowColor = '#00cc6a';
        ctx.shadowBlur  = 4;
      } else {
        // Dim green — raised from #004d2e to be more visible
        ctx.fillStyle = '#00994d';
        ctx.shadowBlur  = 0;
      }

      ctx.fillText(char, x, y * 14);
      ctx.shadowBlur = 0;

      // Reset or advance
      if (y * 14 > H && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.5 + Math.random() * 0.5;
    });
  }

  init();
  setInterval(draw, 35);
  window.addEventListener('resize', init);
})();


/* ─── Multilingual Login Label ─── */
(function () {
  const words = [
    'Inloggen',
    'Connexion',
    'Anmelden',
    'ログイン',
    'Iniciar sesión',
    'Accedi',
    '登录',
    'Войти',
    'تسجيل الدخول',
    'Giriş Yap',
    '로그인',
    'Masuk',
    'Entrar',
    'Connecter',
    'Přihlásit se',
    'Zaloguj się',
    'Kirjaudu',
    'Logga in',
    'Giriş',
    'LOGIN',
  ];

  const el       = document.getElementById('langLabel');
  let   index    = 0;
  let   interval = null;

  function scramble(target, callback) {
    const chars   = 'アイウ01ΩΨλ#@!%∞≈★◈⬡ABCDEFGXYZabcde';
    let   frame   = 0;
    const total   = 10;
    const id      = setInterval(() => {
      if (frame >= total) { clearInterval(id); el.textContent = target; if (callback) callback(); return; }
      let scrambled = '';
      for (let i = 0; i < Math.max(target.length, 4); i++) {
        scrambled += chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = scrambled.slice(0, target.length + 2);
      frame++;
    }, 45);
  }

  function cycle() {
    el.style.opacity = '0';
    setTimeout(() => {
      el.style.opacity = '1';
      scramble(words[index], () => {
        index = (index + 1) % words.length;
        if (words[index - 1] === 'LOGIN') {
          clearInterval(interval);
          setTimeout(() => {
            index = 0;
            interval = setInterval(cycle, 1200);
          }, 2500);
        }
      });
    }, 150);
  }

  setTimeout(() => {
    cycle();
    interval = setInterval(cycle, 1200);
  }, 900);
})();


/* ─── Tab Switcher ─── */
function switchTab(tab) {
  const loginPanel    = document.getElementById('loginPanel');
  const registerPanel = document.getElementById('registerPanel');
  const loginTab      = document.getElementById('loginTab');
  const registerTab   = document.getElementById('registerTab');
  const indicator     = document.getElementById('tabIndicator');

  // Clear all messages on tab switch
  clearMsg('loginError');
  clearMsg('registerError');
  clearMsg('registerSuccess');

  if (tab === 'login') {
    loginPanel.classList.add('active');
    registerPanel.classList.remove('active');
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    indicator.classList.remove('right');
  } else {
    registerPanel.classList.add('active');
    loginPanel.classList.remove('active');
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    indicator.classList.add('right');
  }
}


/* ─── Simple In-Memory User Store ─── */
// Stored as array of { name, email, password }
const userStore = [];


/* ─── Helpers ─── */
function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '⚠ ' + msg;
  el.style.display = 'block';
  // Shake animation
  el.classList.remove('shake');
  void el.offsetWidth; // reflow
  el.classList.add('shake');
}

function showSuccess(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '✔ ' + msg;
  el.style.display = 'block';
}

function clearMsg(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.style.display = 'none';
}

function isValidEmail(email) {
  // Standard email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}


/* ─── Register Handler ─── */
function handleRegister() {
  clearMsg('registerError');
  clearMsg('registerSuccess');

  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm  = document.getElementById('regConfirm').value;

  // 1. Name too long (max 30 characters)
  if (name.length > 30) {
    showError('registerError', 'Username is too big. Max 30 characters allowed.');
    return;
  }

  // 2. Name empty
  if (name.length === 0) {
    showError('registerError', 'Please enter your full name.');
    return;
  }

  // 3. Valid email
  if (!isValidEmail(email)) {
    showError('registerError', 'Please enter a valid email address.');
    return;
  }

  // 4. Password too short (min 6 characters)
  if (password.length < 6) {
    showError('registerError', 'Password is too small. Minimum 6 characters required.');
    return;
  }

  // 5. Passwords match
  if (password !== confirm) {
    showError('registerError', 'Passwords do not match. Please try again.');
    return;
  }

  // 6. Email already registered
  const exists = userStore.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    showError('registerError', 'This email is already registered. Please login.');
    return;
  }

  // ✔ All good — save user
  userStore.push({ name, email, password });

  // Show success message
  showSuccess('registerSuccess', 'Registration completed! You can now login.');

  // Clear form fields
  document.getElementById('regName').value    = '';
  document.getElementById('regEmail').value   = '';
  document.getElementById('regPassword').value = '';
  document.getElementById('regConfirm').value  = '';

  // Reset strength bar
  document.querySelectorAll('.strength-bar span').forEach(b => b.className = '');
  const strengthLabel = document.querySelector('.password-strength small');
  if (strengthLabel) strengthLabel.textContent = 'Password strength';

  // Switch to login after 1.8s so user reads the success message
  setTimeout(() => switchTab('login'), 1800);
}


/* ─── Login Handler ─── */
function handleLogin() {
  clearMsg('loginError');

  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  const loginBtn = document.getElementById('loginBtn');
  const btnText  = document.getElementById('btnText');

  // 1. Empty fields check
  if (!email && !password) {
    showError('loginError', 'Please enter your username and password.');
    return;
  }
  if (!email) {
    showError('loginError', 'Please enter your username.');
    return;
  }
  if (!password) {
    showError('loginError', 'Please enter your password.');
    return;
  }

  // 2. Valid email format
  if (!isValidEmail(email)) {
    showError('loginError', 'Please enter a valid email address.');
    return;
  }

  // 3. Check if registered
  const user = userStore.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    showError('loginError', 'Not registered yet. Please register first.');
    return;
  }

  // 4. Check password
  if (user.password !== password) {
    showError('loginError', 'Incorrect username or password. Please try again.');
    return;
  }

  // ✔ Valid — animate and redirect
  if (btnText) btnText.textContent = 'AUTHENTICATING...';
  if (loginBtn) {
    loginBtn.style.pointerEvents = 'none';
    loginBtn.style.opacity = '0.85';
  }

  const card = document.getElementById('authCard');
  card.classList.add('exiting');

  const flash = document.createElement('div');
  flash.className = 'page-exit-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);

  setTimeout(() => {
    window.location.href = 'index1.html';
  }, 520);
}


/* ─── Password Strength Meter ─── */
(function () {
  const pwInput = document.getElementById('regPassword');
  const bars    = document.querySelectorAll('.strength-bar span');
  const label   = document.querySelector('.password-strength small');

  if (!pwInput) return;

  pwInput.addEventListener('input', function () {
    const val = this.value;
    let score = 0;
    if (val.length >= 6)  score++;
    if (val.length >= 10) score++;
    if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    bars.forEach((b, i) => {
      b.className = '';
      if (i < score) {
        if (score === 1) b.classList.add('weak');
        else if (score === 2) b.classList.add('medium');
        else b.classList.add('strong');
      }
    });

    const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];
    if (label) label.textContent = val.length ? `Strength: ${labels[score] || 'Very Strong'}` : 'Password strength';
  });
})();


/* ─── Button Ripple Effect ─── */
document.querySelectorAll('.cta-btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    const rect   = btn.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;
      border-radius:50%;
      width:6px;height:6px;
      background:rgba(0,255,159,0.6);
      left:${e.clientX - rect.left - 3}px;
      top:${e.clientY - rect.top - 3}px;
      transform:scale(0);
      animation:rippleAnim 0.6s ease-out forwards;
      pointer-events:none;
      z-index:10;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
});

// Inject ripple keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes rippleAnim {
    to { transform: scale(60); opacity: 0; }
  }
`;
document.head.appendChild(style);