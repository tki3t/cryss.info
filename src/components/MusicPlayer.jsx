import { useEffect, useRef, useState, useCallback } from 'react'

// Playlist — add songs here
const PLAYLIST = [
  { title: 'Kha - Hư Không', src: '/assets/music/1.MP3' },
  { title: 'Lil Shady - Rain In 7', src: '/assets/music/2.MP3' },
  { title: 'Sau Đôi Mắt Cười - Hoà Minzy x Rhyder', src: '/assets/music/3.MP3' },
]

const FADE_SEC = 3
const SS_KEY = 'mp_session'

function fmt(s) {
  if (!isFinite(s) || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = String(Math.floor(s % 60)).padStart(2, '0')
  return `${m}:${sec}`
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveSession(vol, muted, shuffle) {
  try { sessionStorage.setItem(SS_KEY, JSON.stringify({ vol, muted, shuffle })) } catch {}
}

// Props:
//  shouldPlay: bool — set true when loader exits (user gesture allows autoplay)
export default function MusicPlayer({ shouldPlay }) {
  const audioRef      = useRef(null)
  const progressBarRef = useRef(null)
  const volBarRef     = useRef(null)

  // ── State
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying,    setIsPlaying]    = useState(false)
  const [isShuffle,    setIsShuffle]    = useState(false)
  const [isMuted,      setIsMuted]      = useState(false)
  const [prevVol,      setPrevVol]      = useState(0.7)
  const [currentTime,  setCurrentTime]  = useState(0)
  const [duration,     setDuration]     = useState(0)
  const [title,        setTitle]        = useState(PLAYLIST[0]?.title ?? '—')
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [titleScrolling, setTitleScrolling] = useState(false)
  const [titleDur,       setTitleDur]       = useState(10)
  const titleSpanRef = useRef(null)

  // Detect title overflow → enable scroll animation
  useEffect(() => {
    const span = titleSpanRef.current
    if (!span) return
    const parent = span.parentElement
    if (!parent) return
    const id = setTimeout(() => {
      const overflow = span.scrollWidth - parent.clientWidth
      if (overflow > 4) {
        setTitleScrolling(true)
        setTitleDur(Math.min(30, Math.max(10, span.scrollWidth / 30)))
      } else {
        setTitleScrolling(false)
      }
    }, 50)
    return () => clearTimeout(id)
  }, [title])

  // Mutable refs to avoid stale closures in event handlers
  const stateRef = useRef({ currentIndex: 0, isPlaying: false, isShuffle: false, isMuted: false, prevVol: 0.7 })
  const dragging    = useRef(false)
  const fadeInStart = useRef(null)
  const initTimeSaved = useRef(null)

  // ── Sync stateRef on state changes
  useEffect(() => {
    stateRef.current = { currentIndex, isPlaying, isShuffle, isMuted, prevVol }
  }, [currentIndex, isPlaying, isShuffle, isMuted, prevVol])

  // ── Init: restore session
  useEffect(() => {
    if (PLAYLIST.length === 0) return
    const saved = loadSession()
    const vol     = saved?.vol   ?? 0.7
    const muted   = saved?.muted ?? false
    const shuffle = saved?.shuffle ?? false
    setPrevVol(vol)
    setIsMuted(muted)
    setIsShuffle(shuffle)
    const audio = audioRef.current
    if (audio) {
      audio.src = PLAYLIST[0].src
      audio.volume = muted ? 0 : vol
      audio.load()
    }
  }, [])

  // ── Play when loader exits (shouldPlay becomes true)
  useEffect(() => {
    if (!shouldPlay) return
    const audio = audioRef.current
    if (!audio) return
    setCurrentIndex(0)
    audio.src = PLAYLIST[0].src
    setTitle(PLAYLIST[0].title)
    fadeInStart.current = Date.now()
    audio.volume = 0
    const p = audio.play()
    if (p !== undefined) {
      p.then(() => setIsPlaying(true)).catch(() => {})
    } else {
      setIsPlaying(true)
    }
    saveSession(stateRef.current.prevVol, stateRef.current.isMuted, stateRef.current.isShuffle)
  }, [shouldPlay])

  // ── applyFadeVolume (called on timeupdate)
  const applyFadeVolume = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !stateRef.current.isPlaying) return
    const { isMuted: muted, prevVol: vol } = stateRef.current
    const target = muted ? 0 : vol
    const cur  = audio.currentTime
    const dur  = audio.duration
    let ratio = 1

    if (fadeInStart.current !== null) {
      const elapsed = (Date.now() - fadeInStart.current) / 1000
      if (elapsed < FADE_SEC) {
        ratio = elapsed / FADE_SEC
      } else {
        fadeInStart.current = null
      }
    }

    if (fadeInStart.current === null && isFinite(dur) && dur > FADE_SEC * 2) {
      const remaining = dur - cur
      if (remaining < FADE_SEC) {
        ratio = Math.min(ratio, Math.max(0, remaining) / FADE_SEC)
      }
    }

    audio.volume = Math.max(0, Math.min(1, target * ratio))
  }, [])

  // ── Load a track
  const loadTrack = useCallback((idx, seekTime, doLoad) => {
    const audio = audioRef.current
    if (!audio || !PLAYLIST[idx]) return
    audio.src = PLAYLIST[idx].src
    setTitle(PLAYLIST[idx].title)
    setCurrentTime(0)
    setDuration(0)
    initTimeSaved.current = (typeof seekTime === 'number' && seekTime > 0) ? seekTime : null
    if (doLoad) audio.load()
  }, [])

  // ── Play
  const playTrack = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.currentTime < 0.5) {
      fadeInStart.current = Date.now()
      audio.volume = 0
    } else {
      fadeInStart.current = null
      const { isMuted: muted, prevVol: vol } = stateRef.current
      audio.volume = Math.max(0, Math.min(1, muted ? 0 : vol))
    }
    const p = audio.play()
    if (p !== undefined) p.catch(() => {})
    setIsPlaying(true)
    saveSession(stateRef.current.prevVol, stateRef.current.isMuted, stateRef.current.isShuffle)
  }, [])

  // ── Pause
  const pauseTrack = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.pause()
    setIsPlaying(false)
    saveSession(stateRef.current.prevVol, stateRef.current.isMuted, stateRef.current.isShuffle)
  }, [])

  // ── Random index
  const randomIndex = useCallback((cur) => {
    let i
    do { i = Math.floor(Math.random() * PLAYLIST.length) }
    while (i === cur && PLAYLIST.length > 1)
    return i
  }, [])

  // ── Prev
  const prevTrack = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.currentTime > 3) { audio.currentTime = 0; return }
    const { isShuffle: sh, isPlaying: playing } = stateRef.current
    setCurrentIndex(cur => {
      const next = sh ? randomIndex(cur) : (cur - 1 + PLAYLIST.length) % PLAYLIST.length
      loadTrack(next, null, !playing)
      if (playing) {
        requestAnimationFrame(() => playTrack())
      }
      return next
    })
    saveSession(stateRef.current.prevVol, stateRef.current.isMuted, stateRef.current.isShuffle)
  }, [loadTrack, playTrack, randomIndex])

  // ── Next
  const nextTrack = useCallback(() => {
    const { isShuffle: sh, isPlaying: playing } = stateRef.current
    setCurrentIndex(cur => {
      const next = sh ? randomIndex(cur) : (cur + 1) % PLAYLIST.length
      loadTrack(next, null, !playing)
      if (playing) {
        requestAnimationFrame(() => playTrack())
      }
      return next
    })
    saveSession(stateRef.current.prevVol, stateRef.current.isMuted, stateRef.current.isShuffle)
  }, [loadTrack, playTrack, randomIndex])

  // ── Audio events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTimeUpdate = () => {
      if (!dragging.current) setCurrentTime(audio.currentTime)
      if (isFinite(audio.duration)) setDuration(audio.duration)
      applyFadeVolume()
    }

    const onLoadedMetadata = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration)
      if (initTimeSaved.current !== null) {
        audio.currentTime = Math.min(initTimeSaved.current, Math.max(0, audio.duration - 0.5))
        initTimeSaved.current = null
      }
    }

    const onEnded = () => {
      // repeatMode = 1 (repeat all) always
      nextTrack()
    }

    const onError = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
    }
  }, [applyFadeVolume, nextTrack])

  // ── Progress seek
  useEffect(() => {
    const bar = progressBarRef.current
    if (!bar) return

    function seekTo(e) {
      const audio = audioRef.current
      if (!audio) return
      const rect = bar.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      if (isFinite(audio.duration)) {
        audio.currentTime = pct * audio.duration
        setCurrentTime(audio.currentTime)
      }
    }

    function onMouseDown(e) {
      dragging.current = true
      bar.classList.add('dragging')
      seekTo(e)
      function onMove(e) { seekTo(e) }
      function onUp() {
        dragging.current = false
        bar.classList.remove('dragging')
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }

    function onTouchStart(e) {
      dragging.current = true
      seekTo(e)
      function onMove(e) { seekTo(e) }
      function onEnd() {
        dragging.current = false
        window.removeEventListener('touchmove', onMove)
        window.removeEventListener('touchend', onEnd)
      }
      window.addEventListener('touchmove', onMove, { passive: true })
      window.addEventListener('touchend', onEnd)
    }

    bar.addEventListener('mousedown', onMouseDown)
    bar.addEventListener('touchstart', onTouchStart, { passive: true })
    return () => {
      bar.removeEventListener('mousedown', onMouseDown)
      bar.removeEventListener('touchstart', onTouchStart)
    }
  }, [])

  // ── Volume seek
  useEffect(() => {
    const bar = volBarRef.current
    if (!bar) return

    function setVolume(e) {
      const rect = bar.getBoundingClientRect()
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      if (pct > 0) {
        setPrevVol(pct)
        setIsMuted(false)
        stateRef.current.prevVol = pct
        stateRef.current.isMuted = false
      } else {
        setIsMuted(true)
        stateRef.current.isMuted = true
      }
      const audio = audioRef.current
      if (audio) applyFadeVolume()
      saveSession(stateRef.current.prevVol, stateRef.current.isMuted, stateRef.current.isShuffle)
    }

    function onMouseDown(e) {
      setVolume(e)
      function onMove(e) { setVolume(e) }
      function onUp() {
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('mouseup', onUp)
      }
      window.addEventListener('mousemove', onMove)
      window.addEventListener('mouseup', onUp)
    }

    function onTouchStart(e) {
      setVolume(e)
      function onMove(e) { setVolume(e) }
      function onEnd() {
        window.removeEventListener('touchmove', onMove)
        window.removeEventListener('touchend', onEnd)
      }
      window.addEventListener('touchmove', onMove, { passive: true })
      window.addEventListener('touchend', onEnd)
    }

    bar.addEventListener('mousedown', onMouseDown)
    bar.addEventListener('touchstart', onTouchStart, { passive: true })
    return () => {
      bar.removeEventListener('mousedown', onMouseDown)
      bar.removeEventListener('touchstart', onTouchStart)
    }
  }, [applyFadeVolume])

  // ── Session save on page leave
  useEffect(() => {
    const handler = () => saveSession(prevVol, isMuted, isShuffle)
    window.addEventListener('pagehide', handler)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') handler()
    })
    return () => {
      window.removeEventListener('pagehide', handler)
    }
  }, [prevVol, isMuted, isShuffle])

  // ── Derived UI values
  const pct    = duration > 0 ? (currentTime / duration) * 100 : 0
  const volPct = isMuted ? 0 : prevVol
  const volIcon = volPct === 0 ? 'volume-mute-outline' : volPct < 0.4 ? 'volume-low-outline' : 'volume-medium-outline'
  const playIcon = isPlaying ? 'pause-outline' : 'play-outline'

  // ── Mobile open/close
  function openPlayer() {
    setMobileOpen(true)
    document.body.style.overflow = 'hidden'
  }

  function closePlayer() {
    const player = document.getElementById('music-player')
    const overlay = document.getElementById('music-overlay')
    if (!player) return
    player.classList.add('mp-closing')
    if (overlay) overlay.classList.add('closing')
    player.addEventListener('animationend', function onEnd() {
      player.removeEventListener('animationend', onEnd)
      player.classList.remove('mp-closing')
      setMobileOpen(false)
      if (overlay) overlay.classList.remove('active', 'closing')
      document.body.style.overflow = ''
    }, { once: true })
  }

  if (PLAYLIST.length === 0) return null

  return (
    <>
      <div
        className={`music-player${mobileOpen ? ' mobile-open' : ''}`}
        id="music-player"
        data-music-player
      >
        <button className="mp-close" id="mp-close" aria-label="Đóng player" onClick={closePlayer}>
          <ion-icon name="chevron-down-outline"></ion-icon>
        </button>

        <div className="mp-info">
          <div className="mp-title-scroll">
            <span
              className={`mp-title${titleScrolling && isPlaying ? ' mp-title--scrolling' : ''}`}
              id="mp-title"
              ref={titleSpanRef}
              style={titleScrolling ? { '--mp-title-dur': `${titleDur}s` } : {}}
            >{title}</span>
          </div>
        </div>

        <div className="mp-progress-section">
          <span className="mp-time-current">{fmt(currentTime)}</span>
          <div
            className="mp-progress-bar"
            id="mp-progress-bar"
            ref={progressBarRef}
            role="slider"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.round(pct)}
            aria-label="Tiến trình bài hát"
          >
            <div className="mp-progress-fill" style={{ width: pct + '%' }}></div>
            <div className="mp-progress-thumb" style={{ left: pct + '%' }}></div>
          </div>
          <span className="mp-time-total">{fmt(duration)}</span>
        </div>

        <div className="mp-controls">
          <button
            className={`mp-ctrl mp-ctrl-sm${isShuffle ? ' active' : ''}`}
            id="mp-shuffle"
            aria-label="Phát ngẫu nhiên"
            title={isShuffle ? 'Shuffle on' : 'Shuffle off'}
            onClick={() => {
              setIsShuffle(s => {
                saveSession(stateRef.current.prevVol, stateRef.current.isMuted, !s)
                return !s
              })
            }}
          >
            <ion-icon name="shuffle-outline"></ion-icon>
          </button>

          <button className="mp-ctrl" id="mp-prev" aria-label="Bài trước" onClick={prevTrack}>
            <ion-icon name="play-skip-back-outline"></ion-icon>
          </button>

          <button
            className="mp-ctrl mp-ctrl-main"
            id="mp-play"
            aria-label="Phát / Tạm dừng"
            onClick={() => isPlaying ? pauseTrack() : playTrack()}
          >
            <ion-icon name={playIcon} id="mp-play-icon"></ion-icon>
          </button>

          <button className="mp-ctrl" id="mp-next" aria-label="Bài tiếp theo" onClick={nextTrack}>
            <ion-icon name="play-skip-forward-outline"></ion-icon>
          </button>

          <div className="mp-vol-wrap">
            <button
              className="mp-ctrl mp-ctrl-sm mp-vol-btn"
              id="mp-mute"
              aria-label="Âm lượng"
              onClick={() => {
                if (isMuted) {
                  setIsMuted(false)
                  stateRef.current.isMuted = false
                } else {
                  setIsMuted(true)
                  stateRef.current.isMuted = true
                }
                const audio = audioRef.current
                if (audio) applyFadeVolume()
                saveSession(stateRef.current.prevVol, stateRef.current.isMuted, stateRef.current.isShuffle)
              }}
            >
              <ion-icon name={volIcon} id="mp-vol-icon"></ion-icon>
            </button>

            <div className="mp-vol-popup">
              <div
                className="mp-vol-bar"
                id="mp-vol-bar"
                ref={volBarRef}
                role="slider"
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={Math.round(volPct * 100)}
                aria-label="Âm lượng"
              >
                <div className="mp-vol-fill" style={{ width: (volPct * 100) + '%' }}></div>
                <div className="mp-vol-thumb" style={{ left: (volPct * 100) + '%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <audio id="mp-audio" ref={audioRef} preload="none"></audio>
      </div>

      {/* Music overlay + FAB (mobile) */}
      <div
        className={`music-overlay${mobileOpen ? ' active' : ''}`}
        id="music-overlay"
        aria-hidden={mobileOpen ? 'false' : 'true'}
        onClick={closePlayer}
      ></div>

      <button className="music-fab" id="music-fab" aria-label="Mở nhạc nền" title="Music Player" onClick={openPlayer}>
        <ion-icon name="musical-notes-outline"></ion-icon>
        <span className={`fab-dot${isPlaying ? ' active' : ''}`} id="fab-dot" aria-hidden="true"></span>
      </button>
    </>
  )
}
