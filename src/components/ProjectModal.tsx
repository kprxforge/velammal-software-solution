import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Github, ExternalLink, Users, Cpu, Layers, Calendar, Info, ShieldCheck, Zap, Briefcase, FileCode2, MessagesSquare, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
}

export default function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const [purchaseStep, setPurchaseStep] = useState<'details' | 'checkout' | 'success'>('details');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return alert('Session expired. Please re-authenticate.');
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('transactions').insert([{
        projectid: project.id,
        projecttitle: project.title,
        buyeremail: userData.user.email,
        price: project.price,
        status: 'pending_verification'
      }]);
      if (error) throw error;
      setPurchaseStep('success');
    } catch (e) {
      console.error(e);
      alert('Transaction initiation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setPurchaseStep('details');
    onClose();
  };

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto glass border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] hide-scrollbar"
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-6 right-6 z-50 p-3 rounded-full glass hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/10 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <AnimatePresence mode="wait">
              {purchaseStep === 'details' && (
                <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Media Section */}
                  <div className="relative h-[300px] lg:h-auto overflow-hidden bg-black/40">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/50 to-transparent z-10" />
                    <img 
                      src={project.imageUrl || project.image || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?text=Project+Preview'} 
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-8 left-8 z-20 space-y-4">
                      <span className="px-4 py-2 rounded-full text-xs font-display font-black tracking-widest uppercase bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                        {project.category}
                      </span>
                      {project.price > 0 && (
                        <div className="glass p-4 rounded-3xl border border-white/10 backdrop-blur-md inline-block">
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Base License</p>
                           <p className="font-display text-4xl font-black text-white leading-none mt-1">₹{project.price}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8 lg:p-12 space-y-10">
                    <div>
                      <h2 className="font-display text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter uppercase leading-[0.9]">
                        {project.title}
                      </h2>
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 text-white/40 font-display text-[10px] font-bold uppercase tracking-widest">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span>{project.teamType || 'Creator Profile Verified'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-purple-400 font-display text-xs font-black uppercase tracking-widest">
                        <Info className="w-4 h-4" />
                        <span>Intelligence Overview</span>
                      </div>
                      <p className="font-sans text-lg text-white/70 leading-relaxed font-light">
                        {project.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-cyan-400 font-display text-xs font-black uppercase tracking-widest">
                          <Cpu className="w-4 h-4" />
                          <span>Tech Stack</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.tech?.map((t: string) => (
                            <span key={t} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/60 font-sans text-xs hover:border-cyan-400/50 transition-colors">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-display text-xs font-black uppercase tracking-widest">
                          <ShieldCheck className="w-4 h-4" />
                          <span>Deliverables</span>
                        </div>
                        <ul className="space-y-2 text-xs font-sans text-white/60">
                           <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Complete Source Code</li>
                           <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Setup Documentation</li>
                           <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Architecture Blueprint</li>
                        </ul>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-8 border-t border-white/5 flex gap-4">
                      {project.price > 0 ? (
                        <button 
                          onClick={() => setPurchaseStep('checkout')}
                          className="flex-1 py-5 bg-white text-black font-display font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:bg-purple-400 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <Briefcase className="w-5 h-5" /> Acquire Project License
                        </button>
                      ) : (
                         <div className="flex-1 flex gap-3">
                            <button className="flex-1 py-4 glass text-white font-display text-[10px] font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 transition-all">
                               <Github className="w-4 h-4" /> View Source
                            </button>
                            <button className="flex-1 py-4 bg-purple-500 text-white font-display text-[10px] font-bold uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-105 transition-all">
                               <ExternalLink className="w-4 h-4" /> Live Demo
                            </button>
                         </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {purchaseStep === 'checkout' && (
                <motion.div key="checkout" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-12 lg:p-16 relative">
                  <div className="max-w-2xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-purple-500/10 border border-purple-500/20 rounded-[2rem] flex items-center justify-center mx-auto text-purple-400 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                        <Zap className="w-10 h-10" />
                      </div>
                      <h2 className="font-display text-4xl font-black text-white uppercase tracking-tighter">Secure Acquisition</h2>
                      <p className="text-white/40 font-sans">You are about to securely acquire licensing rights for <br/><span className="text-white font-bold">{project.title}</span></p>
                    </div>

                    {/* Invoice */}
                    <div className="glass rounded-[3rem] p-10 border border-white/10 space-y-8">
                       <div className="flex justify-between items-center pb-8 border-b border-white/5">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">License Type</p>
                            <p className="font-display text-2xl font-bold text-white mt-1">Commercial & Source</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Investment</p>
                            <p className="font-display text-4xl font-black text-purple-400 mt-1">₹{project.price}</p>
                         </div>
                       </div>
                       
                       <div className="space-y-4">
                         <div className="flex items-center gap-4 text-white/60 font-sans text-sm bg-white/5 p-4 rounded-2xl border border-white/5">
                            <FileCode2 className="w-5 h-5 text-emerald-400" />
                            <span>Instant Access to entire source code repository</span>
                         </div>
                         <div className="flex items-center gap-4 text-white/60 font-sans text-sm bg-white/5 p-4 rounded-2xl border border-white/5">
                            <MessagesSquare className="w-5 h-5 text-blue-400" />
                            <span>7 Days of direct technical support from creator</span>
                         </div>
                       </div>

                       <div className="pt-8 border-t border-white/5 flex flex-col items-center justify-center space-y-4">
                          <p className="font-display text-[10px] font-black uppercase tracking-widest text-white/40">Secure Payment Gateway</p>
                          <div className="w-40 h-40 bg-white p-2 rounded-2xl">
                             <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=pay_to_vss_${project.id}`} alt="QR Code" className="w-full h-full object-contain" />
                          </div>
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <button 
                         onClick={() => setPurchaseStep('details')}
                         className="px-8 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-display text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                       >
                         Back to Detail
                       </button>
                       <button 
                         onClick={handlePurchase}
                         disabled={isProcessing}
                         className="flex-1 py-5 rounded-2xl bg-purple-500 hover:bg-white disabled:opacity-50 text-white hover:text-black font-display text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                       >
                         {isProcessing ? 'Verifying Link...' : 'Confirm Transaction'}
                       </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {purchaseStep === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-12 lg:p-20 text-center flex flex-col items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-[0_0_80px_rgba(52,211,153,0.3)] text-emerald-400">
                    <CheckCircle2 className="w-16 h-16" />
                  </div>
                  <h2 className="font-display text-5xl font-black text-white uppercase tracking-tighter mb-4">Acquisition Pending</h2>
                  <p className="text-white/50 max-w-lg font-sans mx-auto mb-12 text-lg">
                    The transaction has been recorded. Admin review is underway. Once verified, your access link will be dispatched to your encrypted dashboard.
                  </p>
                  <button 
                    onClick={closeModal}
                    className="px-12 py-5 rounded-full font-display text-[11px] font-black uppercase tracking-widest bg-white text-black hover:bg-purple-400 hover:text-white transition-all shadow-xl"
                  >
                    Acknowledge
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
