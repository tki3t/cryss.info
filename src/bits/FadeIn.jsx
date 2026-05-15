import { motion } from 'motion/react'

/**
 * Lightweight scroll-triggered fade-in wrapper using Framer Motion.
 * Animates from opacity 0 + offset to fully visible when element enters viewport.
 */
export default function FadeIn({
  children,
  delay = 0,
  y = 24,
  x = 0,
  duration = 0.55,
  className = '',
  style = {}
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
