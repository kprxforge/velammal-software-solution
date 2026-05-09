import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Sparkles, Code2, Cpu, Atom, Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import RequestProjectModal from '@/components/RequestProjectModal';

const letterVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring" as const,
      damping: 12,
      stiffness: 100
    }
  },
};

const softwareLetterVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring" as const,
      damping: 15,
      stiffness: 90
    }
  },
};

const wordVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const AnimatedWord = ({ 
  word, 
  className, 
  delay = 0, 
  customLetterVariants = letterVariants,
  stagger = 0.08
}: { 
  word: string; 
  className?: string; 
  delay?: number;
  customLetterVariants?: any;
  stagger?: number;
}) => {
  return (
    <motion.div
      variants={{
        ...wordVariants,
        visible: {
          ...wordVariants.visible,
          transition: {
            ...wordVariants.visible.transition,
            staggerChildren: stagger,
            delayChildren: delay
          }
        }
      }}
      initial="hidden"
      animate="visible"
      className={cn("flex overflow-hidden", className)}
    >
      {Array.from(word).map((letter, i) => (
        <motion.span
          key={i}
          variants={customLetterVariants}
          className="inline-block hover:text-cyan-400 transition-colors duration-300 cursor-default"
        >
          {letter === " " ? "\u00A0" : letter}
        </motion.span>
      ))}
    </motion.div>
  );
};

const FloatingParticle = ({ delay = 0, size = 4 }: { delay?: number; size?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 0, x: 0 }}
    animate={{ 
      opacity: [0, 0.5, 0],
      y: [-20, -100],
      x: [Math.random() * 20 - 10, Math.random() * 20 - 10],
    }}
    transition={{ 
      duration: 3 + Math.random() * 5,
      repeat: Infinity,
      delay: delay,
      ease: "linear"
    }}
    className="absolute rounded-full bg-cyan-400/30 blur-[2px] pointer-events-none"
    style={{ 
      width: size, 
      height: size,
      left: `${Math.random() * 100}%`,
      top: `${60 + Math.random() * 40}%`
    }}
  />
);

export default function Home() {
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-between overflow-hidden bg-[#020205]">
      
      {/* Background ambient glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-cyan-900/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none animate-pulse" />

      {/* Floating Particles */}
      {[...Array(30)].map((_, i) => (
        <FloatingParticle key={i} delay={i * 0.2} size={Math.random() * 4 + 2} />
      ))}

      {/* Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="flex-1 w-full flex flex-col items-center justify-center py-12 md:py-16">
        <main className="relative z-10 flex flex-col items-center text-center w-full px-6 max-w-7xl">


          <div className="font-display text-[64px] sm:text-[90px] md:text-[130px] font-black leading-[0.9] tracking-tight uppercase mb-2 flex flex-col items-center select-none perspective-1000">
            <AnimatedWord 
              word="Velammal" 
              className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" 
              delay={0.2}
            />
            <AnimatedWord 
              word="Software" 
              className="text-white/80 relative drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
              delay={1.0}
              stagger={0.12}
              customLetterVariants={softwareLetterVariants}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 1 }}
              className="relative"
            >
              <h1 className="text-[28px] sm:text-[44px] md:text-[72px] font-bold tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mt-2 drop-shadow-[0_0_20px_rgba(34,211,238,0.7)] drop-shadow-[0_0_40px_rgba(34,211,238,0.4)] drop-shadow-[0_0_60px_rgba(168,85,247,0.2)]">
                Solutions
              </h1>
              {/* Metallic Light Sweep */}
              <motion.div 
                animate={{ left: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-[45deg] pointer-events-none"
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 2.2 }}
            className="relative mt-8 mb-20"
          >
            <motion.p
              className="font-sans max-w-xl text-white/40 text-sm md:text-lg font-light tracking-[0.45em] italic uppercase leading-relaxed text-center"
            >
              {Array.from("Innovating Future Developers Through Technology").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 + i * 0.03 }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.p>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '60%' }}
              transition={{ delay: 3, duration: 1.5, ease: "easeOut" }}
              className="h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent mx-auto mt-4"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 3.0 }}
            className="my-20 w-full max-w-4xl px-6 text-center"
          >
            <div className="glass p-12 rounded-[3rem] border border-white/10 bg-white/5 shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/10 via-transparent to-purple-900/10 pointer-events-none" />
              <h2 className="font-display text-5xl font-black text-white uppercase tracking-tighter mb-4 relative z-10">Need a Custom Project?</h2>
              <p className="font-display text-xl text-cyan-400 font-bold uppercase tracking-widest mb-6 relative z-10">We Will Guide You From Idea to Execution.</p>
              <p className="font-sans text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-10 relative z-10">
                Share your project requirements, features, technologies, and expectations. 
                Our team at Velammal Software Solutions will help build your project professionally.
              </p>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(34,211,238,0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsRequestModalOpen(true)}
                className="relative z-10 px-10 py-5 rounded-full bg-cyan-400 text-black font-display font-black text-xs uppercase tracking-[0.3em] transition-all cursor-pointer flex items-center justify-center gap-3 mx-auto"
              >
                <Zap size={18} /> Request Your Project
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 3.5, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-5xl"
          >
            <Link to="/internships" className="group block h-full">
              <motion.div
                whileHover={{ y: -12, scale: 1.02 }}
                className="relative h-[300px] rounded-[3rem] overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-10 flex flex-col justify-between cursor-pointer transition-all duration-700 shadow-2xl hover:border-cyan-500/40 hover:shadow-[0_30px_100px_rgba(0,240,255,0.1)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all duration-500 text-glow-cyan shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                    <Code2 className="w-7 h-7 text-cyan-400" />
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <motion.div 
                      animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_20px_#22d3ee]"
                    />
                    <div className="w-6 h-6 rounded-xl border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-400 group-hover:bg-cyan-500/10 transition-all duration-300">
                      <motion.div 
                        initial={false}
                        animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1] }}
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <Check className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" strokeWidth={3} />
                      </motion.div>
                    </div>
                  </div>
                </div>
                <div className="text-left relative z-10">
                  <motion.h3 
                    animate={{ 
                      textShadow: [
                        "0 0 5px rgba(34,211,238,0.1)",
                        "0 0 15px rgba(34,211,238,0.4)",
                        "0 0 5px rgba(34,211,238,0.1)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="font-display text-[11px] font-black tracking-[0.5em] text-cyan-400 uppercase mb-4"
                  >
                    SELECT OPTION // 01
                  </motion.h3>
                  <h2 className="font-display text-6xl font-bold text-white tracking-tight uppercase leading-none mb-2">Internship</h2>
                  <p className="font-sans text-[11px] text-white/40 uppercase font-black tracking-[0.3em] group-hover:text-cyan-400 transition-colors">Career Acceleration Hub</p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <span className="font-display text-[10px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-cyan-400 transition-colors">Initialize Link</span>
                  <div className="flex-1 h-[1px] bg-white/5 overflow-hidden">
                    <motion.div 
                      className="h-full bg-cyan-400/40 w-full"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-cyan-400 transition-all group-hover:translate-x-1.5" />
                </div>
              </motion.div>
            </Link>

            <Link to="/projects" className="group block h-full">
              <motion.div
                whileHover={{ y: -12, scale: 1.02 }}
                className="relative h-[300px] rounded-[3rem] overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-10 flex flex-col justify-between cursor-pointer transition-all duration-700 shadow-2xl hover:border-purple-500/40 hover:shadow-[0_30px_100px_rgba(168,85,247,0.1)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="flex justify-between items-start relative z-10">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-500 text-glow-purple shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                    <Cpu className="w-7 h-7 text-purple-400" />
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <motion.div 
                      animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_20px_#c084fc]"
                    />
                    <div className="w-6 h-6 rounded-xl border border-purple-500/30 flex items-center justify-center group-hover:border-purple-400 group-hover:bg-purple-500/10 transition-all duration-300">
                      <motion.div 
                        initial={false}
                        animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1] }}
                        className="opacity-0 group-hover:opacity-100"
                      >
                        <Check className="w-4 h-4 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" strokeWidth={3} />
                      </motion.div>
                    </div>
                  </div>
                </div>
                <div className="text-left relative z-10">
                  <motion.h3 
                    animate={{ 
                      textShadow: [
                        "0 0 5px rgba(168,85,247,0.1)",
                        "0 0 15px rgba(168,85,247,0.4)",
                        "0 0 5px rgba(168,85,247,0.1)"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="font-display text-[11px] font-black tracking-[0.5em] text-purple-400 uppercase mb-4"
                  >
                    SELECT OPTION // 02
                  </motion.h3>
                  <h2 className="font-display text-6xl font-bold text-white tracking-tight uppercase leading-none mb-2">Projects</h2>
                  <p className="font-sans text-[11px] text-white/40 uppercase font-black tracking-[0.3em] group-hover:text-purple-400 transition-colors">Innovation Core Access</p>
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <span className="font-display text-[10px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-purple-400 transition-colors">View Vault</span>
                  <div className="flex-1 h-[1px] bg-white/5 overflow-hidden">
                    <motion.div 
                      className="h-full bg-purple-400/40 w-full"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-purple-400 transition-all group-hover:translate-x-1.5" />
                </div>
              </motion.div>
            </Link>
          </motion.div>
        </main>
      </div>

      {/* Decorative Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.5, duration: 1 }}
        className="relative w-full px-8 md:px-16 py-8 md:py-12 flex flex-col md:flex-row justify-between items-center z-20 gap-8 md:gap-0 border-t border-white/5"
      >
        <div className="flex items-center gap-6 group">
          <div className="flex items-center gap-4">
            <Atom className="w-8 h-8 text-cyan-400/50 animate-spin-slow" />
            <div className="flex flex-col">
              <div className="flex gap-1.5 mb-1">
                <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-6 h-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></motion.div>
                <div className="w-2 h-1 bg-white/10"></div>
                <div className="w-2 h-1 bg-white/10"></div>
              </div>
              <span className="font-mono text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">
                System Status: Optimized
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-12 md:gap-24">
          <div className="flex flex-col items-center md:items-end">
            <span className="font-display text-[9px] font-black uppercase tracking-[0.5em] text-white/10 mb-2">Location Node</span>
            <span className="font-sans text-[11px] font-black text-white/60 uppercase tracking-widest whitespace-nowrap">Kundrathur</span>
          </div>
          <div className="flex flex-col items-center md:items-end">
            <span className="font-display text-[9px] font-black uppercase tracking-[0.5em] text-white/10 mb-2">Grid Coordinates</span>
            <span className="font-mono text-[11px] font-black text-white/60 tracking-[0.2em] whitespace-nowrap">13.08° N // 80.27° E</span>
          </div>
        </div>
      </motion.footer>

      {/* Static Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_4px] opacity-20" />
      
      <AnimatePresence>
        {isRequestModalOpen && (
          <RequestProjectModal 
            isOpen={isRequestModalOpen} 
            onClose={() => setIsRequestModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
