import { useState, useCallback } from 'react'
import FloatingLines from './bits/FloatingLines.jsx'
import PageLoader   from './components/PageLoader.jsx'
import Sidebar      from './components/Sidebar.jsx'
import MusicPlayer  from './components/MusicPlayer.jsx'
import Navbar       from './components/Navbar.jsx'
import About        from './components/sections/About.jsx'
import Resume       from './components/sections/Resume.jsx'
import Contact      from './components/sections/Contact.jsx'
import Footer       from './components/Footer.jsx'
import ClickSpark   from './bits/ClickSpark.jsx'

// Stable constants — defined outside component so FloatingLines
// receives the same object references on every render, preventing
// Three.js scene teardown + restart on page switch.
const FL_GRADIENT = ['#514c35', '#645837', '#5b4b25', '#695825']

export default function App() {
  const [activePage,   setActivePage]   = useState('about')
  const [loaderExited, setLoaderExited] = useState(false)

  const handleLoaderExited = useCallback(() => {
    setLoaderExited(true)
  }, [])

  return (
    <ClickSpark
      sparkColor='#44381c'
      sparkSize={12}
      sparkRadius={20}
      sparkCount={10}
      duration={420}
      extraScale={1.1}
    >
      {/* Background — FloatingLines, subtle amber accent.
          isolation+willChange+translateZ(0) keeps this in its own GPU
          compositing layer so backdrop-filter redraws on article
          visibility changes never cause the canvas to flash/restart. */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'auto',
        opacity: 0.58,
        isolation: 'isolate',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}>
        <FloatingLines
          linesGradient={FL_GRADIENT}
          animationSpeed={1}
          interactive
          bendRadius={5}
          bendStrength={-0.5}
          mouseDamping={0.02}
          parallax
          parallaxStrength={0.1}
          mixBlendMode="screen"
        />
      </div>

      {/* Intro loader — removed from DOM after animation */}
      <PageLoader onEntered={handleLoaderExited} />

      {/* ── Main layout ─────────────────────────────────────── */}
      <main>
        {/* ── Sidebar col: profile info + music player */}
        <div className="sidebar-col">
          <Sidebar />
          <MusicPlayer shouldPlay={loaderExited} />
        </div>

        {/* ── Content col */}
        <div className="main-content">
          <Navbar activePage={activePage} onNavigate={setActivePage} />

          <About   isActive={activePage === 'about'}   />
          <Resume  isActive={activePage === 'resume'}  />
          <Contact isActive={activePage === 'contact'} />
        </div>
      </main>

      <Footer />
    </ClickSpark>
  )
}
