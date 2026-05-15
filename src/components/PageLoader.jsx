import { useEffect, useRef, useState } from 'react'
import ShinyText from '../bits/ShinyText.jsx'
import CurvedLoop from '../bits/CurvedLoop.jsx'

const MARQUEE_TEXT = 'CRYSS\u00a0\u00a0·\u00a0\u00a0CONTENT CREATOR\u00a0\u00a0·\u00a0\u00a0VIDEO EDITOR\u00a0\u00a0·\u00a0\u00a0GRAPHIC DESIGNER\u00a0\u00a0·\u00a0\u00a0PHOTOGRAPHER\u00a0\u00a0·\u00a0\u00a0HANOI, VN\u00a0\u00a0·\u00a0\u00a0'
export default function PageLoader({ onEntered }) {
  const loaderRef = useRef(null)
  const [state, setState] = useState('loading') // 'loading' | 'ready' | 'entered'

  useEffect(() => {
    const loader = loaderRef.current
    if (!loader) return

    const MIN_DISPLAY = 1500
    const startTime = Date.now()

    // Block scrolling while loading
    document.documentElement.style.overflow = 'hidden'

    let readyToEnter = false
    let entering = false

    function showClickToEnter() {
      if (readyToEnter || entering) return
      const fill = loader.querySelector('.loader-bar-fill')
      if (fill) {
        fill.style.animation = 'none'
        fill.style.width = '100%'
      }
      setTimeout(() => {
        loader.classList.add('ready-to-enter')
        readyToEnter = true
        setState('ready')
      }, 250)
    }

    function enterSite() {
      if (!readyToEnter || entering) return
      entering = true
      readyToEnter = false
      document.removeEventListener('click', enterSite)
      document.removeEventListener('touchstart', enterSite)

      document.body.classList.add('page-entering')
      setTimeout(() => { document.body.classList.remove('page-entering') }, 1100)

      loader.classList.add('loaded')
      document.documentElement.style.overflow = ''
      window.scrollTo(0, 0)

      setState('entered')

      // Notify App so music can start
      if (onEntered) onEntered()
    }

    document.addEventListener('click', enterSite)
    document.addEventListener('touchstart', enterSite, { passive: true })

    function scheduleShow() {
      const elapsed = Date.now() - startTime
      const remaining = MIN_DISPLAY - elapsed
      setTimeout(showClickToEnter, remaining > 0 ? remaining : 0)
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scheduleShow)
    } else {
      scheduleShow()
    }

    // Hard fallback
    const hardTimer = setTimeout(showClickToEnter, 8000)

    return () => {
      document.removeEventListener('click', enterSite)
      document.removeEventListener('touchstart', enterSite)
      clearTimeout(hardTimer)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Remove from DOM once animation finishes
  useEffect(() => {
    if (state !== 'entered') return
    const loader = loaderRef.current
    if (!loader) return
    const timer = setTimeout(() => {
      if (loader.parentNode) loader.parentNode.removeChild(loader)
    }, 1450)
    return () => clearTimeout(timer)
  }, [state])

  return (
    <div id="page-loader" aria-hidden="true" ref={loaderRef}>
      {/* Dark reveal strips — bottom layer (z-index: 0) */}
      <div className="loader-strip" />
      <div className="loader-strip" />
      <div className="loader-strip" />
      <div className="loader-strip" />
      <div className="loader-strip" />

      <div className="loader-marquee-top" aria-hidden="true">
        <div className="loader-marquee-track">
          <span>{MARQUEE_TEXT}</span>
          <span>{MARQUEE_TEXT}</span>
          <span>{MARQUEE_TEXT}</span>
          <span>{MARQUEE_TEXT}</span>
        </div>
      </div>
      {/* Ambient golden glow — sits above strips */}
      <div className="loader-bg" aria-hidden="true" />

      {/* Center content */}
      <div className="loader-inner">
        <div className="loader-eyebrow">
          <ShinyText text="content creator · video editor" color="rgba(201,165,90,0.55)" shineColor="#ffe8a3" speed={4} direction="left" />
        </div>
        <div className="loader-logo">
          <ShinyText text="CRYSSISME" color="rgba(255, 186, 38, 0.55)" shineColor="#ffd24a" speed={4} direction="left" />
        </div>
        <div className="loader-bar">
          <div className="loader-bar-fill" />
        </div>
        <div className="loader-click-enter">
          <ShinyText text="> CLICK TO ENTER <" color="rgba(201,165,90,0.55)" shineColor="#ffe8a3" speed={4} direction="left" />
        </div>
      </div>

      {/* Bottom scrolling tag marquee (decorative) */}
      <div className="loader-marquee" aria-hidden="true">
        <div className="loader-marquee-track">
          <span>{MARQUEE_TEXT}</span>
          <span>{MARQUEE_TEXT}</span>
          <span>{MARQUEE_TEXT}</span>
          <span>{MARQUEE_TEXT}</span>
        </div>
      </div>
    </div>
  )
}
