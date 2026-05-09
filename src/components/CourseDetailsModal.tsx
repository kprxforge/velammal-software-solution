import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ChevronRight, Zap, Target, BookOpen, Wrench, Layers } from 'lucide-react';

interface CourseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: any;
  onApply: () => void;
}

export default function CourseDetailsModal({ isOpen, onClose, course, onApply }: CourseDetailsModalProps) {
  if (!course) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020205]/95 backdrop-blur-3xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-5xl max-h-[90vh] glass border border-white/10 rounded-[3rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(34,211,238,0.1)]"
          >
            {/* Header Effects */}
            <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none opacity-20"
                 style={{ background: `linear-gradient(180deg, ${course.color || '#22d3ee'} 0%, transparent 100%)` }} />
            
            <div className="flex justify-end p-6 relative z-10">
              <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/50 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-10 hide-scrollbar relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Col: Info */}
                <div className="lg:col-span-2 space-y-12">
                  <div className="space-y-6">
                    {course.badge && (
                      <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest" style={{ color: course.color }}>
                        {course.badge}
                      </span>
                    )}
                    <h2 className="font-display text-4xl sm:text-5xl font-black text-white uppercase tracking-tighter leading-none">
                      {course.title}
                    </h2>
                    <p className="font-sans text-lg text-white/50 leading-relaxed max-w-2xl">
                      {course.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-4 pt-4">
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-3 text-white/60 items-center">
                         <Target className="w-5 h-5" style={{ color: course.color }} />
                         <div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Level</div>
                           <div className="font-sans text-sm font-bold">{course.level || 'Beginner to Advanced'}</div>
                         </div>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex gap-3 text-white/60 items-center">
                         <Layers className="w-5 h-5" style={{ color: course.color }} />
                         <div>
                           <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Mode</div>
                           <div className="font-sans text-sm font-bold">
                             {(course.onlineAvailable !== false) && (course.offlineAvailable !== false) ? 'Online & Offline' : (course.onlineAvailable !== false) ? 'Online Only' : (course.offlineAvailable !== false) ? 'Offline Only' : 'Varied'}
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Modules */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6" style={{ color: course.color }} />
                      <h3 className="font-display text-2xl font-bold text-white tracking-tight uppercase">Syllabus Timeline</h3>
                    </div>
                    {course.modules && course.modules.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {course.modules.map((mod: string, i: number) => (
                          <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 items-center">
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-mono font-bold text-white/30 shrink-0">
                              {i + 1 < 10 ? `0${i+1}` : i+1}
                            </div>
                            <span className="font-sans text-sm text-white/80">{mod}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white/30 font-sans text-sm">Syllabus details unavailable.</p>
                    )}
                  </div>

                  {/* Tools */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Wrench className="w-6 h-6" style={{ color: course.color }} />
                      <h3 className="font-display text-2xl font-bold text-white tracking-tight uppercase">Tools Covered</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {course.tools?.map((tool: string, i: number) => (
                        <div key={i} className="bg-white/5 border border-white/10 px-5 py-2.5 rounded-xl font-display text-sm font-bold text-white/60 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          {tool}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Col: Pricing & CTA */}
                <div className="space-y-8">
                  <div className="glass p-8 rounded-[2.5rem] border border-white/10 space-y-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    <div className="space-y-2 text-center">
                      {course.originalPrice && (
                        <div className="font-mono text-white/30 line-through decoration-white/20 text-lg">
                          ₹{course.originalPrice}
                        </div>
                      )}
                      <div className="font-display text-5xl font-black text-white tracking-tighter" style={{ textShadow: `0 0 20px ${course.color}` }}>
                        ₹{course.fee}
                      </div>
                      <div className="inline-block bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 font-display text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                        Limited Offer
                      </div>
                    </div>

                    <ul className="space-y-4 pt-4 border-t border-white/10">
                      {course.features?.map((f: string, i: number) => (
                        <li key={i} className="flex gap-3 text-white/60 font-sans text-sm">
                           <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: course.color }} />
                           {f}
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => {
                        onClose();
                        onApply();
                      }}
                      className="w-full py-5 rounded-2xl font-display text-xs font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all relative overflow-hidden group shadow-xl"
                      style={{ backgroundColor: course.color, color: 'black' }}
                    >
                      <span className="relative z-10">Enroll Now</span>
                      <Zap className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
