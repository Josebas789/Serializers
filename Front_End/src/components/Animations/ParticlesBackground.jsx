import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function ParticlesBackground() {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Generamos 20 partículas con posiciones y tamaños aleatorios
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // %
      y: Math.random() * 100, // %
      size: Math.random() * 4 + 1, // 1px a 5px
      duration: Math.random() * 20 + 10, // 10s a 30s
      delay: Math.random() * 5,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-indigo-500/20"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -100, 0], // Flotar arriba y abajo
            x: [0, Math.random() * 50 - 25, 0], // Movimiento lateral sutil
            opacity: [0, 1, 0], // Aparecer y desaparecer
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
        />
      ))}
      
      {/* Capa de ruido o gradiente extra para profundidad */}
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-transparent to-indigo-900/20 opacity-60" />
    </div>
  )
}