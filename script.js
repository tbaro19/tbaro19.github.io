/**
 * Thai Bao Huynh — Personal Academic Homepage Script
 * Inspired by NLP_UIT Architecture
 * Features:
 * - Dual Light/Dark Theme Switcher with Persistence
 * - Spotify Music Player Widget (Badtrip - MCK) with Rotating Vinyl Disc
 * - Phonemic & Segmentation-Free LM Interactive Visualizer
 * - Bi-directional Scroll-Reveal Animation
 * - BibTeX Citation Toggle & Copy
 * - Mobile Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeManager();
  initSpotifyPlayer();
  initPhonemicVisualizer();
  initBibtexToggles();
  initScrollReveal();
  initMobileNav();
});

/* ============================================================
   1. Theme Manager (Light / Dark Mode)
   ============================================================ */
function initThemeManager() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeStatusText = document.getElementById('themeStatusText');
  
  const savedTheme = localStorage.getItem('tb_portfolio_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const initialTheme = savedTheme ? savedTheme : (prefersDark ? 'dark' : 'light');
  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem('tb_portfolio_theme', nextTheme);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeStatusText) {
      themeStatusText.textContent = theme.toUpperCase();
    }
  }
}

/* ============================================================
   2. Spotify Music Player Widget with Spinning Vinyl Record
   Song: Badtrip - MCK
   YouTube ID: LPx7ERqFYM0
   ============================================================ */
function initSpotifyPlayer() {
  const dock = document.getElementById('spotifyMusicDock');
  if (!dock) return;

  const playPauseBtn = document.getElementById('spotifyPlayPauseBtn');
  const playBtnIcon = document.getElementById('spotifyPlayBtnIcon');
  const vinylWrapper = document.getElementById('vinylRecordWrapper');
  const minimizeBtn = document.getElementById('spotifyMinimizeBtn');
  const minIcon = document.getElementById('spotifyMinIcon');
  const progressTrack = document.getElementById('spotifyProgressTrack');
  const progressBar = document.getElementById('spotifyProgressBar');
  const currentTimeEl = document.getElementById('spotifyCurrentTime');
  const ytContainer = document.getElementById('spotifyYoutubeContainer');

  const TRACK_TOTAL_SECONDS = 204; // 03:24 for Badtrip - MCK
  const YT_VIDEO_ID = 'LPx7ERqFYM0';

  let isPlaying = false;
  let isMinimized = false;
  let currentSeconds = 0;
  let tickerInterval = null;
  let ytIframe = null;

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function createOrGetIframe() {
    if (!ytIframe && ytContainer) {
      ytIframe = document.createElement('iframe');
      ytIframe.id = 'spotifyYtIframe';
      ytIframe.src = `https://www.youtube.com/embed/${YT_VIDEO_ID}?enablejsapi=1&autoplay=1&origin=${encodeURIComponent(window.location.origin)}`;
      ytIframe.allow = 'autoplay; encrypted-media';
      ytIframe.style.width = '200px';
      ytIframe.style.height = '200px';
      ytContainer.appendChild(ytIframe);
    }
    return ytIframe;
  }

  function sendYtCommand(func, args) {
    if (!ytIframe || !ytIframe.contentWindow) return;
    try {
      const payload = JSON.stringify({
        event: 'command',
        func: func,
        args: args || []
      });
      ytIframe.contentWindow.postMessage(payload, '*');
    } catch (e) {
      console.warn('YT postMessage warning:', e);
    }
  }

  function setPlaybackState(play) {
    isPlaying = play;
    dock.classList.toggle('is-playing', isPlaying);

    if (playBtnIcon) {
      playBtnIcon.textContent = isPlaying ? '❚❚' : '▶';
    }

    if (isPlaying) {
      createOrGetIframe();
      sendYtCommand('playVideo');

      if (!tickerInterval) {
        tickerInterval = setInterval(() => {
          currentSeconds++;
          if (currentSeconds >= TRACK_TOTAL_SECONDS) {
            currentSeconds = 0;
          }
          updateProgressUI();
        }, 1000);
      }
    } else {
      sendYtCommand('pauseVideo');
      if (tickerInterval) {
        clearInterval(tickerInterval);
        tickerInterval = null;
      }
    }
  }

  function updateProgressUI() {
    if (currentTimeEl) {
      currentTimeEl.textContent = formatTime(currentSeconds);
    }
    if (progressBar) {
      const pct = Math.min(100, Math.max(0, (currentSeconds / TRACK_TOTAL_SECONDS) * 100));
      progressBar.style.width = `${pct}%`;
    }
  }

  // Toggle Play/Pause on Button click
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setPlaybackState(!isPlaying);
    });
  }

  // Toggle Play/Pause on Vinyl Disc click
  if (vinylWrapper) {
    vinylWrapper.addEventListener('click', () => {
      setPlaybackState(!isPlaying);
    });
  }

  // Scrubber Seek
  if (progressTrack) {
    progressTrack.addEventListener('click', (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      currentSeconds = Math.floor(pct * TRACK_TOTAL_SECONDS);
      updateProgressUI();
      sendYtCommand('seekTo', [currentSeconds, true]);
      if (!isPlaying) {
        setPlaybackState(true);
      }
    });
  }

  // Minimize / Expand Dock
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      isMinimized = !isMinimized;
      dock.classList.toggle('is-minimized', isMinimized);
      if (minIcon) {
        minIcon.textContent = isMinimized ? '[+]' : '[—]';
      }
    });
  }
}

/* ============================================================
   3. Phonemic & Segmentation-Free LM Interactive Visualizer
   Demonstrating Thai Bao's Core Research Focus:
   IPA Triplet Representation & Token-Free Dynamics
   ============================================================ */
function initPhonemicVisualizer() {
  const sampleBtn = document.getElementById('vnTokenSampleBtn');
  const sentenceEl = document.getElementById('phonemicSentence');
  const tokensContainer = document.getElementById('phonemicTokens');
  const metricTokens = document.getElementById('metricTokenCount');
  const metricIpa = document.getElementById('metricIpaCount');
  const metricLatent = document.getElementById('metricLatentDim');

  if (!sentenceEl || !tokensContainer) return;

  const SAMPLES = [
    {
      text: "Mô hình ngôn ngữ tự nhiên không phân đoạn từ",
      stage: "BƯỚC 1: PHÂN TÁCH ÂM TIẾT & NGỮ ÂM IPA",
      tokens: [
        { surface: "Mô", ipa: "/moː¹/", type: "Onset-Nucleus" },
        { surface: "hình", ipa: "/hiɲ²/", type: "Onset-Nucleus-Coda" },
        { surface: "ngôn", ipa: "/ŋon¹/", type: "Onset-Nucleus-Coda" },
        { surface: "ngữ", ipa: "/ŋɨ⁴/", type: "Onset-Nucleus" },
        { surface: "tự", ipa: "/tɨ⁶/", type: "Onset-Nucleus" },
        { surface: "nhiên", ipa: "/ɲiən¹/", type: "Onset-Nucleus-Coda" },
        { surface: "không", ipa: "/xəwŋ¹/", type: "Onset-Nucleus-Coda" },
        { surface: "phân", ipa: "/fən¹/", type: "Onset-Nucleus-Coda" },
        { surface: "đoạn", ipa: "/ɗwaːn⁶/", type: "Glide-Nucleus-Coda" },
        { surface: "từ", ipa: "/tɨ²/", type: "Onset-Nucleus" }
      ],
      tokensCount: 10,
      ipaTriplets: 26,
      latentDim: "768d"
    },
    {
      text: "Đánh giá tính bền vững đối kháng của hệ thống OCR",
      stage: "BƯỚC 2: ADVERSARIAL EMBEDDING & LATENT TRIPLET",
      tokens: [
        { surface: "Đánh", ipa: "/ɗajŋ⁵/", type: "Robustness" },
        { surface: "giá", ipa: "/zaː⁵/", type: "Onset-Nucleus" },
        { surface: "tính", ipa: "/tin⁵/", type: "Onset-Nucleus" },
        { surface: "bền", ipa: "/ben²/", type: "Acoustic" },
        { surface: "vững", ipa: "/vɨŋ⁴/", type: "Tone-Glottal" },
        { surface: "đối", ipa: "/ɗoj⁵/", type: "Adversarial" },
        { surface: "kháng", ipa: "/xaːŋ⁵/", type: "Perturbation" },
        { surface: "của", ipa: "/kuə³/", type: "Nucleus" },
        { surface: "hệ", ipa: "/he⁶/", type: "Onset-Nucleus" },
        { surface: "thống", ipa: "/tʰəwŋ⁵/", type: "Aspiration" },
        { surface: "OCR", ipa: "/oʊ-siː-ɑːr/", type: "Char-Seq" }
      ],
      tokensCount: 11,
      ipaTriplets: 31,
      latentDim: "1024d"
    },
    {
      text: "Truy xuất thực thể tối ưu cho đa phương thức ROOMELSA",
      stage: "BƯỚC 3: HIERARCHICAL ONTOLOGY & RETRIEVAL DYNAMICS",
      tokens: [
        { surface: "Truy", ipa: "/ʈwi¹/", type: "Retroflex" },
        { surface: "xuất", ipa: "/swət⁵/", type: "Nucleus-Coda" },
        { surface: "thực", ipa: "/tʰɨk⁶/", type: "Aspiration" },
        { surface: "thể", ipa: "/tʰe³/", type: "Glottal" },
        { surface: "tối", ipa: "/toj⁵/", type: "Diphthong" },
        { surface: "ưu", ipa: "/iəw¹/", type: "Vocalic" },
        { surface: "cho", ipa: "/tɕɔ¹/", type: "Palatal" },
        { surface: "đa", ipa: "/ɗaː¹/", type: "Implosive" },
        { surface: "phương", ipa: "/fɨəŋ¹/", type: "Labiodental" },
        { surface: "thức", ipa: "/tʰɨk⁵/", type: "Aspiration" }
      ],
      tokensCount: 10,
      ipaTriplets: 29,
      latentDim: "1536d"
    }
  ];

  let currentIndex = 0;

  function renderSample(index) {
    const data = SAMPLES[index];
    sentenceEl.textContent = `"${data.text}"`;
    
    tokensContainer.innerHTML = '';
    data.tokens.forEach((tok, i) => {
      const pill = document.createElement('div');
      pill.className = `tok-pill ${i === 0 ? 'active' : ''}`;
      pill.innerHTML = `
        <span class="tok-surface">${tok.surface}</span>
        <span class="tok-ipa">${tok.ipa}</span>
        <span class="tok-type">${tok.type}</span>
      `;
      pill.addEventListener('click', () => {
        document.querySelectorAll('.tok-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
      });
      tokensContainer.appendChild(pill);
    });

    if (metricTokens) metricTokens.textContent = data.tokensCount;
    if (metricIpa) metricIpa.textContent = data.ipaTriplets;
    if (metricLatent) metricLatent.textContent = data.latentDim;
  }

  renderSample(0);

  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % SAMPLES.length;
      renderSample(currentIndex);
    });
  }
}

/* ============================================================
   4. BibTeX Citation Toggle & Copy
   ============================================================ */
function initBibtexToggles() {
  document.querySelectorAll('.pub-bibtex-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const block = document.getElementById(targetId);
      if (block) {
        block.classList.toggle('is-visible');
        btn.textContent = block.classList.contains('is-visible') ? '[Close BibTeX]' : '[BibTeX]';
      }
    });
  });

  document.querySelectorAll('.copy-bibtex-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const preEl = document.querySelector(`#${targetId} pre`);
      if (preEl) {
        navigator.clipboard.writeText(preEl.innerText).then(() => {
          const origText = btn.textContent;
          btn.textContent = 'COPIED!';
          setTimeout(() => {
            btn.textContent = origText;
          }, 2000);
        }).catch(err => {
          console.warn('Clipboard copy error:', err);
        });
      }
    });
  });
}

/* ============================================================
   5. Bi-directional Scroll-Reveal Observer
   (Cuộn tới đâu bay ra tới đó - Kể cả khi cuộn ngược lại)
   ============================================================ */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      el.classList.add('is-revealed');
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      } else {
        // Bi-directional: re-triggers animation when user scrolls in reverse!
        entry.target.classList.remove('is-revealed');
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.08
  });

  document.querySelectorAll('.scroll-reveal').forEach(el => {
    observer.observe(el);
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('is-revealed');
    }
  });
}

/* ============================================================
   6. Mobile Navigation Toggle
   ============================================================ */
function initMobileNav() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navPanel = document.getElementById('mobileNavPanel');

  if (menuBtn && navPanel) {
    menuBtn.addEventListener('click', () => {
      const isOpen = navPanel.classList.toggle('is-open');
      menuBtn.textContent = isOpen ? '[CLOSE]' : '[MENU]';
    });

    navPanel.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navPanel.classList.remove('is-open');
        menuBtn.textContent = '[MENU]';
      });
    });
  }
}
