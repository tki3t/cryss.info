'use strict';

(function () {
  // ── Playlist ─────────────────────────────────────────────
  // Add songs here: { title: "Song Name", src: "./assets/music/song.mp3" }
  const playlist = [
    { title: "Kha - Hư Không", src: "assets/music/1.MP3" },
    { title: "2Kha - Hư Không", src: "assets/music/1.MP3" },
  ];

  // ── DOM ──────────────────────────────────────────────────
  const player        = document.getElementById('music-player');
  const audio         = document.getElementById('mp-audio');
  const playBtn       = document.getElementById('mp-play');
  const playIcon      = document.getElementById('mp-play-icon');
  const prevBtn       = document.getElementById('mp-prev');
  const nextBtn       = document.getElementById('mp-next');
  const shuffleBtn    = document.getElementById('mp-shuffle');
  const repeatBtn     = document.getElementById('mp-repeat');
  const progressBar   = document.getElementById('mp-progress-bar');
  const progressFill  = document.getElementById('mp-progress-fill');
  const progressThumb = document.getElementById('mp-progress-thumb');
  const currentTimeEl = document.getElementById('mp-current');
  const durationEl    = document.getElementById('mp-duration');
  const titleEl       = document.getElementById('mp-title');
  const volBar        = document.getElementById('mp-vol-bar');
  const volFill       = document.getElementById('mp-vol-fill');
  const volThumb      = document.getElementById('mp-vol-thumb');
  const volBtn        = document.getElementById('mp-mute');
  const volIcon       = document.getElementById('mp-vol-icon');
  const fab           = document.getElementById('music-fab');
  const fabDot        = document.getElementById('fab-dot');
  const overlay       = document.getElementById('music-overlay');
  const closeBtn      = document.getElementById('mp-close');

  if (!player || !audio) return;

  // ── State ─────────────────────────────────────────────────
  let currentIndex  = 0;
  let isPlaying     = false;
  let isShuffle     = false;
  let repeatMode    = 0;   // 0=off 1=all 2=one
  let isMuted       = false;
  let prevVol       = 0.7; // user's chosen target volume (0–1)
  let dragging      = false;
  let initTimeSaved   = null;  // time to seek once metadata is loaded
  let fadeInStart     = null;  // wall-clock ms when current track started playing
  let pendingAutoplay = false; // guard against ghost-play when user pauses during autoplay load
  let autoplayDone    = false; // ensure attemptAutoplay runs at most once

  // ── Session Storage ────────────────────────────────────────
  const SS_KEY = 'mp_session';

  function saveSession() {
    try {
      sessionStorage.setItem(SS_KEY, JSON.stringify({
        idx:     currentIndex,
        vol:     prevVol,
        muted:   isMuted,
        shuffle: isShuffle,
        repeat:  repeatMode,
        playing: isPlaying,
      }));
    } catch (e) {}
  }

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(SS_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  // ── Empty playlist guard ──────────────────────────────────
  if (playlist.length === 0) {
    if (titleEl) titleEl.textContent = 'Chưa có bài hát';
    if (playBtn) playBtn.disabled = true;
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  // ── Helpers ───────────────────────────────────────────────
  function fmt(s) {
    if (!isFinite(s) || isNaN(s)) return '0:00';
    const m   = Math.floor(s / 60);
    const sec = String(Math.floor(s % 60)).padStart(2, '0');
    return `${m}:${sec}`;
  }

  function updateProgressUI(cur, total) {
    const pct = total > 0 ? (cur / total) * 100 : 0;
    if (progressFill)  progressFill.style.width  = pct + '%';
    if (progressThumb) progressThumb.style.left   = pct + '%';
    if (progressBar)   progressBar.setAttribute('aria-valuenow', Math.round(pct));
    if (currentTimeEl) currentTimeEl.textContent  = fmt(cur);
  }

  function setPlayState(playing) {
    isPlaying = playing;
    if (playIcon) playIcon.setAttribute('name', playing ? 'pause-outline' : 'play-outline');
    fabDot && fabDot.classList.toggle('active', playing);
  }

  // Only updates the visual slider + icon; does NOT touch audio.volume
  function updateVolUI(pct) {
    if (volFill)  volFill.style.width  = (pct * 100) + '%';
    if (volThumb) volThumb.style.left   = (pct * 100) + '%';
    if (volBar)   volBar.setAttribute('aria-valuenow', Math.round(pct * 100));
    const iconName = pct === 0  ? 'volume-mute-outline'
                   : pct < 0.4 ? 'volume-low-outline'
                   :              'volume-medium-outline';
    if (volIcon) volIcon.setAttribute('name', iconName);
  }

  // ── Fade volume (in/out 3 s) ──────────────────────────────
  const FADE_SEC = 3;

  function applyFadeVolume() {
    if (!isPlaying) return;
    const target = isMuted ? 0 : prevVol;
    const cur    = audio.currentTime;
    const dur    = audio.duration;

    let ratio = 1;

    // Fade in: wall-clock time since playback started (avoids metadata-timing race)
    if (fadeInStart !== null) {
      const elapsed = (Date.now() - fadeInStart) / 1000;
      if (elapsed < FADE_SEC) {
        ratio = elapsed / FADE_SEC;
      } else {
        fadeInStart = null; // fade-in complete
      }
    }

    // Fade out: use remaining audio time
    if (fadeInStart === null && isFinite(dur) && dur > FADE_SEC * 2) {
      const remaining = dur - cur;
      if (remaining < FADE_SEC) {
        ratio = Math.min(ratio, Math.max(0, remaining) / FADE_SEC);
      }
    }

    audio.volume = Math.max(0, Math.min(1, target * ratio));
  }

  // ── Load / play track ─────────────────────────────────────
  // doLoad=true: call audio.load() (use when not auto-playing, e.g. init)
  function loadTrack(idx, seekTime, doLoad) {
    const track = playlist[idx];
    audio.src = track.src;
    if (titleEl)    titleEl.textContent    = track.title;
    if (durationEl) durationEl.textContent = '0:00';
    updateProgressUI(0, 0);
    if (progressBar) progressBar.setAttribute('aria-valuenow', '0');
    // Will seek once loadedmetadata fires
    initTimeSaved = (typeof seekTime === 'number' && seekTime > 0) ? seekTime : null;
    if (doLoad) audio.load();
  }

  function playTrack() {
    // Fade in from start whenever playing from near-beginning
    if (audio.currentTime < 0.5) {
      fadeInStart = Date.now();
      audio.volume = 0;
    } else {
      // Resuming mid-track: no fade-in, jump to target volume
      fadeInStart = null;
      audio.volume = Math.max(0, Math.min(1, isMuted ? 0 : prevVol));
    }
    const p = audio.play();
    if (p !== undefined) p.catch(() => {});
    setPlayState(true);
    saveSession();
  }

  function pauseTrack() {
    pendingAutoplay = false; // cancel in-flight autoplay promise
    audio.pause();
    setPlayState(false);
    saveSession();
  }

  function randomIndex() {
    let i;
    do { i = Math.floor(Math.random() * playlist.length); }
    while (i === currentIndex && playlist.length > 1);
    return i;
  }

  function prevTrack() {
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    currentIndex = isShuffle
      ? randomIndex()
      : (currentIndex - 1 + playlist.length) % playlist.length;
    loadTrack(currentIndex, null, !isPlaying);
    if (isPlaying) playTrack(); // playTrack sets audio.volume=0 + fadeInStart
    saveSession();
  }

  function nextTrack() {
    currentIndex = isShuffle
      ? randomIndex()
      : (currentIndex + 1) % playlist.length;
    loadTrack(currentIndex, null, !isPlaying);
    if (isPlaying) playTrack(); // playTrack sets audio.volume=0 + fadeInStart
    saveSession();
  }

  // ── Audio events ──────────────────────────────────────────
  audio.addEventListener('timeupdate', () => {
    if (!dragging) updateProgressUI(audio.currentTime, audio.duration);
    if (durationEl && isFinite(audio.duration))
      durationEl.textContent = fmt(audio.duration);
    applyFadeVolume(); // smooth fade-in / fade-out every tick
  });

  audio.addEventListener('loadedmetadata', () => {
    if (durationEl) durationEl.textContent = fmt(audio.duration);
    if (initTimeSaved !== null) {
      audio.currentTime = Math.min(initTimeSaved, Math.max(0, audio.duration - 0.5));
      initTimeSaved = null;
    }
  });

  audio.addEventListener('ended', () => {
    if (repeatMode === 2) {
      audio.currentTime = 0;
      playTrack();
    } else if (repeatMode === 1 || currentIndex < playlist.length - 1) {
      nextTrack();
    } else {
      setPlayState(false);
      audio.currentTime = 0;
      updateProgressUI(0, audio.duration);
      saveSession();
    }
  });

  audio.addEventListener('error', () => setPlayState(false));

  // ── Control buttons ───────────────────────────────────────
  playBtn && playBtn.addEventListener('click', () => isPlaying ? pauseTrack() : playTrack());
  prevBtn && prevBtn.addEventListener('click', prevTrack);
  nextBtn && nextBtn.addEventListener('click', nextTrack);

  shuffleBtn && shuffleBtn.addEventListener('click', () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
    shuffleBtn.title = isShuffle ? 'Shuffle on' : 'Shuffle off';
    saveSession();
  });

  repeatBtn && repeatBtn.addEventListener('click', () => {
    repeatMode = (repeatMode + 1) % 3;
    const icons  = ['repeat-outline', 'repeat-outline', 'repeat-1-outline'];
    const titles = ['Repeat off', 'Repeat all', 'Repeat one'];
    const icon = repeatBtn.querySelector('ion-icon');
    if (icon) icon.setAttribute('name', icons[repeatMode]);
    repeatBtn.classList.toggle('active', repeatMode > 0);
    repeatBtn.title = titles[repeatMode];
    saveSession();
  });

  // ── Progress seek ─────────────────────────────────────────
  function seekTo(e) {
    const rect    = progressBar.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct     = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    if (isFinite(audio.duration)) {
      audio.currentTime = pct * audio.duration;
      updateProgressUI(audio.currentTime, audio.duration);
    }
  }

  if (progressBar) {
    progressBar.addEventListener('mousedown', (e) => {
      dragging = true;
      progressBar.classList.add('dragging');
      seekTo(e);
      const up = () => {
        dragging = false;
        progressBar.classList.remove('dragging');
        window.removeEventListener('mousemove', seekTo);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', seekTo);
      window.addEventListener('mouseup', up);
    });

    progressBar.addEventListener('touchstart', (e) => {
      dragging = true;
      seekTo(e);
      const end = () => {
        dragging = false;
        window.removeEventListener('touchmove', seekTo);
        window.removeEventListener('touchend', end);
      };
      window.addEventListener('touchmove', seekTo, { passive: true });
      window.addEventListener('touchend', end);
    }, { passive: true });
  }

  // ── Volume ────────────────────────────────────────────────
  function setVolume(e) {
    if (!volBar) return;
    const rect    = volBar.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct     = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    if (pct > 0) { prevVol = pct; isMuted = false; }
    else          { isMuted = true; }
    updateVolUI(pct);
    applyFadeVolume(); // immediate feedback while dragging
    saveSession();
  }

  if (volBar) {
    volBar.addEventListener('mousedown', (e) => {
      setVolume(e);
      const up = () => {
        window.removeEventListener('mousemove', setVolume);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', setVolume);
      window.addEventListener('mouseup', up);
    });

    volBar.addEventListener('touchstart', (e) => {
      setVolume(e);
      const end = () => {
        window.removeEventListener('touchmove', setVolume);
        window.removeEventListener('touchend', end);
      };
      window.addEventListener('touchmove', setVolume, { passive: true });
      window.addEventListener('touchend', end);
    }, { passive: true });
  }

  volBtn && volBtn.addEventListener('click', () => {
    if (isMuted) {
      isMuted = false;
      updateVolUI(prevVol || 0.7);
    } else {
      isMuted = true;
      updateVolUI(0);
    }
    applyFadeVolume();
    saveSession();
  });

  // ── Mobile FAB / bottom-sheet ─────────────────────────────
  function openPlayer() {
    player.classList.add('mobile-open');
    if (overlay) { overlay.classList.add('active'); overlay.setAttribute('aria-hidden', 'false'); }
    document.body.style.overflow = 'hidden';
  }

  function closePlayer() {
    player.classList.add('mp-closing');
    player.addEventListener('animationend', function onEnd() {
      player.removeEventListener('animationend', onEnd);
      player.classList.remove('mobile-open', 'mp-closing');
      if (overlay) { overlay.classList.remove('active'); overlay.setAttribute('aria-hidden', 'true'); }
      document.body.style.overflow = '';
    }, { once: true });
  }

  fab      && fab.addEventListener('click', openPlayer);
  closeBtn && closeBtn.addEventListener('click', closePlayer);
  overlay  && overlay.addEventListener('click', closePlayer);

  // ── Persist session on page leave ────────────────────────
  window.addEventListener('pagehide', saveSession);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') saveSession();
  });

  // ── Init: restore session ─────────────────────────────────
  const saved        = loadSession();
  const isFirstVisit = saved === null;

  if (saved) {
    currentIndex = (Number.isInteger(saved.idx) && saved.idx >= 0 && saved.idx < playlist.length)
      ? saved.idx : 0;
    prevVol    = typeof saved.vol   === 'number' ? Math.max(0, Math.min(1, saved.vol)) : 0.7;
    isMuted    = !!saved.muted;
    isShuffle  = !!saved.shuffle;
    repeatMode = (saved.repeat === 0 || saved.repeat === 1 || saved.repeat === 2) ? saved.repeat : 0;
  }

  loadTrack(currentIndex, null, true); // doLoad=true: preload without playing
  audio.volume = isMuted ? 0 : prevVol;
  updateVolUI(isMuted ? 0 : prevVol);

  // Restore shuffle UI
  if (isShuffle && shuffleBtn) {
    shuffleBtn.classList.add('active');
    shuffleBtn.title = 'Shuffle on';
  }

  // Restore repeat UI
  if (repeatMode > 0 && repeatBtn) {
    const icons  = ['repeat-outline', 'repeat-outline', 'repeat-1-outline'];
    const titles = ['Repeat off', 'Repeat all', 'Repeat one'];
    const icon   = repeatBtn.querySelector('ion-icon');
    if (icon) icon.setAttribute('name', icons[repeatMode]);
    repeatBtn.classList.add('active');
    repeatBtn.title = titles[repeatMode];
  }

  // ── Auto-play after loader hides ──────────────────────────
  function attemptAutoplay() {
    if (autoplayDone) return; // safety guard — prevent double-call
    autoplayDone = true;
    // First visit → always try; return visit → only if was playing
    if (!isFirstVisit && !saved.playing) return;

    // Start silent; fade-in kicks in via timeupdate
    fadeInStart     = Date.now();
    pendingAutoplay = true;
    audio.volume    = 0;
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        if (pendingAutoplay) setPlayState(true);
        else audio.pause(); // user paused while browser was loading — enforce it
        pendingAutoplay = false;
      }).catch(() => { pendingAutoplay = false; });
    } else {
      if (pendingAutoplay) setPlayState(true);
      pendingAutoplay = false;
    }
  }

  // Wait for #page-loader to get class "loaded" (loader done)
  function waitForLoader(callback) {
    const loader = document.getElementById('page-loader');
    if (!loader || loader.classList.contains('loaded')) {
      callback();
      return;
    }
    const obs = new MutationObserver(() => {
      if (loader.classList.contains('loaded')) {
        obs.disconnect();
        clearTimeout(fallback); // prevent double-fire
        setTimeout(callback, 350); // wait for loader CSS fade to finish
      }
    });
    obs.observe(loader, { attributes: true, attributeFilter: ['class'] });
    // Hard fallback after 10 s (cleared if observer fires first)
    const fallback = setTimeout(() => { obs.disconnect(); callback(); }, 10000);
  }

  waitForLoader(attemptAutoplay);
})();