/**
 * Thai Bao Huynh — Personal Academic Homepage Script
 * Inspired by NLP_UIT Architecture
 * Features:
 * - Dual Light/Dark Theme Switcher with Persistence
 * - Official YouTube IFrame API for "2h - MCK (ft. Nger)" (mbEZ_9dhM_Y, 02:59)
 * - Auto-resume & Viewability Protection (Fixes the 5-second pausing issue)
 * - Rotating Vinyl Record Widget with 2h.png Center Disc
 * - Mini MV Picture-in-Picture Video Drawer
 * - Hero 2H MCK Animated Visualizer & Tab Switcher with Audio Sync
 * - Phonemic & Segmentation-Free LM Interactive Visualizer
 * - Bi-directional Scroll-Reveal Animation
 * - BibTeX Citation Toggle & 1-Click Copy
 * - Mobile Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeManager();
  initHeroVisualizerTabs();
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
   2. Hero Visualizer Tab Switcher & 2H Sync
   ============================================================ */
function initHeroVisualizerTabs() {
  const tabBtn2h = document.getElementById('tabBtn2h');
  const tabBtnNlp = document.getElementById('tabBtnNlp');
  const card2h = document.getElementById('hero2hCard');
  const cardNlp = document.getElementById('phonemicLabCard');
  const statusLabel = document.getElementById('heroTabStatusLabel');

  if (tabBtn2h && tabBtnNlp && card2h && cardNlp) {
    tabBtn2h.addEventListener('click', () => {
      tabBtn2h.classList.add('active');
      tabBtnNlp.classList.remove('active');
      card2h.style.display = 'flex';
      cardNlp.style.display = 'none';
      if (statusLabel) statusLabel.textContent = 'AESTHETIC VIBE';
    });

    tabBtnNlp.addEventListener('click', () => {
      tabBtnNlp.classList.add('active');
      tabBtn2h.classList.remove('active');
      card2h.style.display = 'none';
      cardNlp.style.display = 'block';
      if (statusLabel) statusLabel.textContent = 'RESEARCH LAB';
    });
  }

  // Hero Card Quick Play/Sync Button
  const heroSyncBtn = document.getElementById('hero2hSyncBtn');
  if (heroSyncBtn) {
    heroSyncBtn.addEventListener('click', () => {
      if (window.toggleSpotifyPlayback) {
        window.toggleSpotifyPlayback();
      }
    });
  }
}

/* ============================================================
   3. Spotify Music Player Widget with Official YouTube IFrame API
   Song: 2h - MCK (ft. Nger)
   YouTube ID: mbEZ_9dhM_Y
   Duration: 179s (02:59)
   ============================================================ */
let ytPlayer = null;
let ytApiReady = false;
let pendingPlayRequest = false;

window.onYouTubeIframeAPIReady = function() {
  ytApiReady = true;
  initYouTubePlayerInstance();
};

function initYouTubePlayerInstance() {
  const container = document.getElementById('spotifyYtPlayer');
  if (!container || ytPlayer) return;

  try {
    ytPlayer = new YT.Player('spotifyYtPlayer', {
      height: '100%',
      width: '100%',
      videoId: 'mbEZ_9dhM_Y',
      playerVars: {
        autoplay: 0,
        controls: 1,
        disablekb: 0,
        enablejsapi: 1,
        fs: 0,
        loop: 1,
        modestbranding: 1,
        playlist: 'mbEZ_9dhM_Y',
        playsinline: 1,
        rel: 0
      },
      events: {
        onReady: (event) => {
          if (pendingPlayRequest) {
            pendingPlayRequest = false;
            event.target.playVideo();
          }
        },
        onStateChange: onYouTubeStateChange,
        onError: (err) => {
          console.warn('YouTube Player notice:', err);
        }
      }
    });
  } catch (e) {
    console.warn('Failed to construct YT.Player:', e);
  }
}

let userWantsPlaying = false;

function onYouTubeStateChange(event) {
  const dock = document.getElementById('spotifyMusicDock');
  const playBtnIcon = document.getElementById('spotifyPlayBtnIcon');
  const heroSyncIcon = document.getElementById('hero2hSyncIcon');
  const heroSyncBtn = document.getElementById('hero2hSyncBtn');

  if (event.data === YT.PlayerState.PLAYING) {
    userWantsPlaying = true;
    if (dock) dock.classList.add('is-playing');
    if (playBtnIcon) playBtnIcon.textContent = '❚❚';
    if (heroSyncIcon) heroSyncIcon.textContent = '❚❚';
    if (heroSyncBtn) {
      heroSyncBtn.innerHTML = '<span>❚❚</span> ĐANG PHÁT';
      heroSyncBtn.style.background = '#be123c';
    }
  } else if (event.data === YT.PlayerState.PAUSED) {
    // If YouTube paused unexpectedly (e.g. background viewability check after 5s) while user wants play, auto-resume!
    if (userWantsPlaying) {
      setTimeout(() => {
        if (userWantsPlaying && ytPlayer && typeof ytPlayer.playVideo === 'function') {
          ytPlayer.playVideo();
        }
      }, 250);
    } else {
      if (dock) dock.classList.remove('is-playing');
      if (playBtnIcon) playBtnIcon.textContent = '▶';
      if (heroSyncIcon) heroSyncIcon.textContent = '▶';
      if (heroSyncBtn) {
        heroSyncBtn.innerHTML = '<span>▶</span> BẬT NHẠC';
        heroSyncBtn.style.background = '#e11d48';
      }
    }
  } else if (event.data === YT.PlayerState.ENDED) {
    // Loop track seamlessly
    if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
      ytPlayer.seekTo(0);
      ytPlayer.playVideo();
    }
  }
}

function initSpotifyPlayer() {
  const dock = document.getElementById('spotifyMusicDock');
  if (!dock) return;

  const playPauseBtn = document.getElementById('spotifyPlayPauseBtn');
  const vinylWrapper = document.getElementById('vinylRecordWrapper');
  const minimizeBtn = document.getElementById('spotifyMinimizeBtn');
  const minIcon = document.getElementById('spotifyMinIcon');
  const progressTrack = document.getElementById('spotifyProgressTrack');
  const progressBar = document.getElementById('spotifyProgressBar');
  const currentTimeEl = document.getElementById('spotifyCurrentTime');
  const mvToggleBtn = document.getElementById('spotifyMvToggleBtn');
  const videoDrawer = document.getElementById('spotifyVideoDrawer');
  const videoCloseBtn = document.getElementById('spotifyVideoCloseBtn');

  const TRACK_TOTAL_SECONDS = 179; // 02:59 for 2h - MCK

  let isMinimized = false;
  let syncTimer = null;

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function startSyncTicker() {
    if (!syncTimer) {
      syncTimer = setInterval(() => {
        if (ytPlayer && typeof ytPlayer.getCurrentTime === 'function' && userWantsPlaying) {
          const curTime = ytPlayer.getCurrentTime();
          if (curTime !== undefined && !isNaN(curTime)) {
            updateProgress(curTime);
          }
        }
      }, 500);
    }
  }

  function stopSyncTicker() {
    if (syncTimer) {
      clearInterval(syncTimer);
      syncTimer = null;
    }
  }

  function updateProgress(seconds) {
    if (currentTimeEl) {
      currentTimeEl.textContent = formatTime(seconds);
    }
    if (progressBar) {
      const pct = Math.min(100, Math.max(0, (seconds / TRACK_TOTAL_SECONDS) * 100));
      progressBar.style.width = `${pct}%`;
    }
  }

  function togglePlayback() {
    userWantsPlaying = !userWantsPlaying;

    if (!ytPlayer) {
      if (ytApiReady) {
        initYouTubePlayerInstance();
        pendingPlayRequest = userWantsPlaying;
      } else {
        pendingPlayRequest = userWantsPlaying;
      }
      return;
    }

    if (userWantsPlaying) {
      if (typeof ytPlayer.playVideo === 'function') {
        ytPlayer.playVideo();
      }
      startSyncTicker();
    } else {
      if (typeof ytPlayer.pauseVideo === 'function') {
        ytPlayer.pauseVideo();
      }
      stopSyncTicker();
    }
  }

  // Expose global hook for the hero sync button
  window.toggleSpotifyPlayback = togglePlayback;

  // Toggle on Play/Pause button
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlayback();
    });
  }

  // Toggle on Vinyl Disc click
  if (vinylWrapper) {
    vinylWrapper.addEventListener('click', () => {
      togglePlayback();
    });
  }

  // Scrubber Seek
  if (progressTrack) {
    progressTrack.addEventListener('click', (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, clickX / rect.width));
      const targetSec = Math.floor(pct * TRACK_TOTAL_SECONDS);
      
      updateProgress(targetSec);
      if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
        ytPlayer.seekTo(targetSec, true);
      }

      if (!userWantsPlaying) {
        togglePlayback();
      }
    });
  }

  // Mini MV Picture-in-Picture Drawer Toggle
  if (mvToggleBtn && videoDrawer) {
    mvToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = videoDrawer.classList.toggle('is-open');
      mvToggleBtn.style.color = isOpen ? '#ffffff' : '#fb7185';
      mvToggleBtn.style.background = isOpen ? '#e11d48' : 'rgba(225, 29, 72, 0.14)';
    });
  }

  if (videoCloseBtn && videoDrawer) {
    videoCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      videoDrawer.classList.remove('is-open');
      if (mvToggleBtn) {
        mvToggleBtn.style.color = '#fb7185';
        mvToggleBtn.style.background = 'rgba(225, 29, 72, 0.14)';
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
   4. Phonemic & Segmentation-Free LM Interactive Visualizer
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
   5. BibTeX Citation Toggle & Copy
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
   6. Bi-directional Scroll-Reveal Observer
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
   7. Mobile Navigation Toggle
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
