import { useEffect, useRef } from 'react'

// Faithfully ports liquid-ether.js to a React component
const ORBS = [
  { cx: 0.20, cy: 0.50, ax: 0.90, ay: 0.75, r: 0.65, rgb: '210,120,0',  spd: 0.00028, phi: 0.00 },
  { cx: 0.15, cy: 0.30, ax: 1.30, ay: 0.90, r: 0.55, rgb: '255,160,10', spd: 0.00021, phi: 1.10 },
  { cx: 0.22, cy: 0.70, ax: 0.65, ay: 1.40, r: 0.50, rgb: '160,65,0',   spd: 0.00033, phi: 2.20 },
  { cx: 0.12, cy: 0.50, ax: 0.75, ay: 0.55, r: 0.42, rgb: '255,100,0',  spd: 0.00031, phi: 0.75 },
  { cx: 0.25, cy: 0.82, ax: 0.40, ay: 0.80, r: 0.40, rgb: '255,210,60', spd: 0.00014, phi: 4.10 },
  { cx: 0.10, cy: 0.22, ax: 0.30, ay: 1.70, r: 0.28, rgb: '255,220,80', spd: 0.00042, phi: 3.20 },
  { cx: 0.80, cy: 0.50, ax: 1.60, ay: 0.70, r: 0.65, rgb: '240,150,0',  spd: 0.00017, phi: 3.40 },
  { cx: 0.85, cy: 0.30, ax: 0.55, ay: 1.15, r: 0.55, rgb: '200,85,0',   spd: 0.00024, phi: 4.60 },
  { cx: 0.78, cy: 0.70, ax: 1.10, ay: 1.60, r: 0.48, rgb: '255,195,35', spd: 0.00019, phi: 5.80 },
  { cx: 0.88, cy: 0.50, ax: 1.45, ay: 1.25, r: 0.38, rgb: '180,100,10', spd: 0.00026, phi: 2.85 },
  { cx: 0.75, cy: 0.82, ax: 1.20, ay: 0.45, r: 0.35, rgb: '220,90,5',   spd: 0.00037, phi: 1.60 },
  { cx: 0.90, cy: 0.22, ax: 1.80, ay: 0.35, r: 0.28, rgb: '255,140,20', spd: 0.00029, phi: 5.10 },
]

export default function LiquidEther() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = 0, H = 0
    let mx = -9999, my = -9999
    let rafId = null

    function resize() {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()

    const onResize = () => resize()
    const onMouseMove = (e) => { mx = e.clientX; my = e.clientY }
    const onTouchMove = (e) => { mx = e.touches[0].clientX; my = e.touches[0].clientY }
    const onMouseLeave = () => { mx = -9999; my = -9999 }

    window.addEventListener('resize', onResize, { passive: true })
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('mouseleave', onMouseLeave)

    function draw(now) {
      const minDim = Math.min(W, H)

      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, W, H)

      ctx.globalCompositeOperation = 'screen'

      for (let i = 0; i < ORBS.length; i++) {
        const o = ORBS[i]
        const t = now * o.spd
        const phi = o.phi

        let bx = (o.cx
          + Math.sin(t * o.ax + phi) * 0.12
          + Math.cos(t * 0.63 + phi * 1.3) * 0.05) * W
        let by = (o.cy
          + Math.cos(t * o.ay + phi * 0.7) * 0.27
          + Math.sin(t * 0.57 + phi * 1.7) * 0.10) * H

        if (mx > -9000) {
          const dx = bx - mx
          const dy = by - my
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          const push = Math.max(0, 380 - dist) / 380 * 110
          bx += (dx / dist) * push
          by += (dy / dist) * push
        }

        const radius = o.r * minDim
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, radius)
        g.addColorStop(0,    `rgba(${o.rgb},0.14)`)
        g.addColorStop(0.25, `rgba(${o.rgb},0.06)`)
        g.addColorStop(0.55, `rgba(${o.rgb},0.02)`)
        g.addColorStop(0.80, `rgba(${o.rgb},0.005)`)
        g.addColorStop(1,    `rgba(${o.rgb},0)`)

        ctx.beginPath()
        ctx.arc(bx, by, radius, 0, 6.2832)
        ctx.fillStyle = g
        ctx.fill()
      }

      ctx.globalCompositeOperation = 'source-over'

      const vigTB = ctx.createLinearGradient(0, 0, 0, H)
      vigTB.addColorStop(0,    'rgba(0,0,0,0.70)')
      vigTB.addColorStop(0.18, 'rgba(0,0,0,0)')
      vigTB.addColorStop(0.82, 'rgba(0,0,0,0)')
      vigTB.addColorStop(1,    'rgba(0,0,0,0.70)')
      ctx.fillStyle = vigTB
      ctx.fillRect(0, 0, W, H)

      const vigC = ctx.createLinearGradient(0, 0, W, 0)
      vigC.addColorStop(0,    'rgba(0,0,0,0)')
      vigC.addColorStop(0.28, 'rgba(0,0,0,0)')
      vigC.addColorStop(0.42, 'rgba(0,0,0,0.30)')
      vigC.addColorStop(0.58, 'rgba(0,0,0,0.30)')
      vigC.addColorStop(0.72, 'rgba(0,0,0,0)')
      vigC.addColorStop(1,    'rgba(0,0,0,0)')
      ctx.fillStyle = vigC
      ctx.fillRect(0, 0, W, H)

      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  )
}
