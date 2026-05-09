import { motion } from 'motion/react';

export default function Logo({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <motion.div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Global Rotation for Energy feel */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {/* Swirl Paths - Recreating the technical segmented look */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.path
              key={i}
              d="M50 25 L65 25 L75 35 L55 35 Z"
              fill="url(#logo-gradient)"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 1 }}
              transform={`rotate(${angle} 50 50)`}
              className="drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
            />
          ))}
          
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <motion.path
              key={`inner-${i}`}
              d="M50 30 L60 30 L68 38 L53 38 Z"
              fill="white"
              fillOpacity="0.3"
              transform={`rotate(${angle + 30} 50 50)`}
            />
          ))}
        </motion.g>

        {/* Center V */}
        <text
          x="50"
          y="58"
          textAnchor="middle"
          fill="white"
          fontSize="24"
          fontWeight="900"
          className="font-display tracking-widest"
        >
          V
        </text>

        {/* Circular Text Arcs */}
        <defs>
          <path id="top-arc" d="M 20,50 A 30,30 0 1,1 80,50" />
          <path id="bottom-arc" d="M 20,50 A 30,30 0 1,0 80,50" />
        </defs>

        <text className="font-display text-[6px] font-black uppercase tracking-[0.2em] fill-white/80">
          <textPath href="#top-arc" startOffset="50%" textAnchor="middle">
            VELAMMAL
          </textPath>
        </text>

        <text className="font-display text-[3.5px] font-black uppercase tracking-[0.05em] fill-white/40">
          <textPath href="#bottom-arc" startOffset="50%" textAnchor="middle">
            GROUP OF INSTITUTIONS
          </textPath>
        </text>
      </svg>
    </motion.div>
  );
}
