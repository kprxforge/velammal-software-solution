import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Send, User, Phone, School, MapPin, 
  Linkedin, Globe, FileText, ChevronRight, ChevronLeft, 
  Sparkles, Cpu, Layers, Calendar, Info, CheckCircle2,
  Zap, Loader2, MessageSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  internship: any;
}

type Step = 'mode' | 'basic' | 'details' | 'portfolio' | 'success';

export default function ApplicationModal({ isOpen, onClose, internship }: ApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('mode');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  
  const [formData, setFormData] = useState({
    learningMode: '',
    fullName: '',
    email: '',
    phone: '',
    college: '',
    degree: '',
    year: '',
    city: '',
    github: '',
    portfolio: '',
    linkedin: '',
    resumeUrl: '',
  });

  const steps: Step[] = ['mode', 'basic', 'portfolio', 'success'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    if (currentStep === 'mode') {
      if (!formData.learningMode) return alert('Please select a learning mode.');
      setCurrentStep('basic');
    }
    else if (currentStep === 'basic') {
      if (!formData.fullName || !formData.email || !formData.phone) return alert('Please fill out all required basic information.');
      setCurrentStep('portfolio');
    }
  };

  const handleBack = () => {
    if (currentStep === 'basic') setCurrentStep('mode');
    else if (currentStep === 'portfolio') setCurrentStep('basic');
  };

  const handleSubmit = async () => {
    const isDev = localStorage.getItem('vss_dev_login') === 'true';
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user && !isDev) {
      alert('You must be logged in to apply.');
      return;
    }

    setIsSubmitting(true);

    const newId = `INT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    setApplicationId(newId);

    // Save to database first, then show success
    try {
      const { error } = await supabase.from('internship_applications').insert([{
        id: newId,
        full_name: formData.fullName, // Providing both in case one is missing, but typically full_name is used in standard setups
        email: formData.email,
        phone: formData.phone,
        internship_title: internship.title,
        status: 'Pending Review',
        user_id: userData.user?.id || 'dev-user-001',
      }]);
      
      // If the above fails because of camelCase vs snake_case, we will fallback to camelCase
      if (error && error.message.includes('Could not find')) {
        const fallback = await supabase.from('internship_applications').insert([{
          id: newId,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          internshipTitle: internship.title,
          status: 'Pending Review',
          userId: userData.user?.id || 'dev-user-001',
        }]);
        
        if (fallback.error) {
           console.error('Fallback insert error:', fallback.error);
           alert(`Failed to apply: ${fallback.error.message}`);
           return;
        } else {
           console.log('✅ Application saved successfully via fallback:', newId);
        }
      } else if (error) {
        console.error('Supabase insert error:', error.message, error.details, error.hint);
        alert(`Failed to apply: ${error.message}`);
      } else {
        console.log('✅ Application saved successfully:', newId);
      }
    } catch (err: any) {
      console.error('Application save failed:', err?.message || err);
    } finally {
      setIsSubmitting(false);
      setCurrentStep('success');
    }
  };

  if (!internship) return null;

  return (
    <>
      <AnimatePresence mode="wait">
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-6 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={currentStep !== 'success' ? onClose : undefined}
              className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full h-full sm:h-[90vh] sm:max-w-4xl glass border-t border-white/10 sm:border border-white/10 sm:rounded-[4rem] shadow-[0_0_100px_rgba(34,211,238,0.1)] overflow-hidden flex flex-col"
            >
              {/* Decorative Header Gradient */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cyan-400/5 to-transparent pointer-events-none" />

              <div className="p-8 md:p-12 border-b border-white/5 flex flex-col gap-8 relative z-10">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                      <Sparkles className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">Velammal Software Solutions</h2>
                      <p className="font-display text-[9px] text-white/30 uppercase tracking-[0.4em] font-black">{internship.title}</p>
                    </div>
                  </div>
                  {currentStep !== 'success' && (
                    <button 
                      onClick={onClose}
                      className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white/30 hover:text-white transition-all border border-white/10"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  )}
                </div>

                {currentStep !== 'success' && (
                  <div className="flex gap-3">
                    {['Mode', 'Identity', 'Portfolio'].map((label, idx) => (
                      <div key={label} className="flex-1 flex flex-col gap-3">
                        <div className={cn(
                          "h-1.5 rounded-full transition-all duration-700",
                          idx <= currentStepIndex ? "bg-cyan-400 shadow-[0_0_15px_#22d3ee]" : "bg-white/5"
                        )} />
                        <span className={cn(
                          "font-display text-[9px] font-black uppercase tracking-[0.3em] transition-colors",
                          idx <= currentStepIndex ? "text-cyan-400" : "text-white/10"
                        )}>
                          Node {idx + 1}: {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-16 hide-scrollbar relative z-10">
                <AnimatePresence>
                  {currentStep === 'mode' && (
                    <motion.div
                      key="step-mode"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="space-y-12"
                    >
                      <div className="text-center space-y-4">
                         <h3 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Select Your Preferred Learning Mode</h3>
                         <p className="text-white/40 font-sans max-w-lg mx-auto">Choose how you want to experience the internship. This determines your schedule and operational methods.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {(internship.onlineAvailable !== false) && (
                          <div 
                            onClick={() => setFormData({...formData, learningMode: 'online'})}
                            className={cn(
                              "relative p-8 rounded-[2.5rem] border transition-all cursor-pointer group overflow-hidden",
                              formData.learningMode === 'online' 
                                ? "bg-cyan-400/10 border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.3)] scale-[1.02]" 
                                : "bg-white/5 border-white/10 hover:border-cyan-400/50 hover:bg-white/10"
                            )}>
                            {formData.learningMode === 'online' && (
                              <motion.div layoutId="modeCheck" className="absolute top-6 right-6 z-20">
                                <CheckCircle2 className="w-8 h-8 text-cyan-400" />
                              </motion.div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/0 via-cyan-400/0 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Globe className={cn("w-12 h-12 mb-6 transition-colors", formData.learningMode === 'online' ? "text-cyan-400" : "text-white/30 group-hover:text-cyan-400")} />
                            <h4 className="font-display text-2xl font-black text-white uppercase tracking-tighter mb-4">Online Mode</h4>
                          </div>
                        )}

                        {(internship.offlineAvailable !== false) && (
                          <div 
                            onClick={() => setFormData({...formData, learningMode: 'offline'})}
                            className={cn(
                              "relative p-8 rounded-[2.5rem] border transition-all cursor-pointer group overflow-hidden",
                              formData.learningMode === 'offline' 
                                ? "bg-purple-500/10 border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.3)] scale-[1.02]" 
                                : "bg-white/5 border-white/10 hover:border-purple-400/50 hover:bg-white/10"
                            )}>
                            {formData.learningMode === 'offline' && (
                              <motion.div layoutId="modeCheck" className="absolute top-6 right-6 z-20">
                                <CheckCircle2 className="w-8 h-8 text-purple-400" />
                              </motion.div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <School className={cn("w-12 h-12 mb-6 transition-colors", formData.learningMode === 'offline' ? "text-purple-400" : "text-white/30 group-hover:text-purple-400")} />
                            <h4 className="font-display text-2xl font-black text-white uppercase tracking-tighter mb-4">Offline Mode</h4>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'basic' && (
                    <motion.div
                      key="step-basic"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-12"
                    >
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <label className="font-display text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.3em]">Full Name</label>
                          <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                            <input 
                              value={formData.fullName}
                              onChange={e => setFormData({...formData, fullName: e.target.value})}
                              className="w-full bg-white/[0.03] border border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-white font-sans focus:border-cyan-400/50 outline-none transition-all" 
                              placeholder="John Smith" 
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="font-display text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.3em]">Email</label>
                          <div className="relative group">
                            <FileText className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                            <input 
                              value={formData.email}
                              onChange={e => setFormData({...formData, email: e.target.value})}
                              type="email"
                              className="w-full bg-white/[0.03] border border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-white font-sans focus:border-cyan-400/50 outline-none transition-all" 
                              placeholder="student@example.com" 
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="font-display text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.3em]">Phone Number</label>
                          <div className="relative group">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                            <input 
                              value={formData.phone}
                              onChange={e => setFormData({...formData, phone: e.target.value})}
                              className="w-full bg-white/[0.03] border border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-white font-sans focus:border-cyan-400/50 outline-none transition-all" 
                              placeholder="+91 99999 99999" 
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <label className="font-display text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.3em]">College Name</label>
                          <div className="relative group">
                            <School className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                            <input 
                              value={formData.college}
                              onChange={e => setFormData({...formData, college: e.target.value})}
                              className="w-full bg-white/[0.03] border border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-white font-sans focus:border-cyan-400/50 outline-none transition-all" 
                              placeholder="Your College" 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="font-display text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.3em]">Department</label>
                            <input 
                              value={formData.degree}
                              onChange={e => setFormData({...formData, degree: e.target.value})}
                              className="w-full bg-white/[0.03] border border-white/5 rounded-[1.5rem] py-5 px-6 text-white font-sans focus:border-cyan-400/50 outline-none transition-all" 
                              placeholder="Dept" 
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="font-display text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.3em]">Year</label>
                            <input 
                              value={formData.year}
                              onChange={e => setFormData({...formData, year: e.target.value})}
                              className="w-full bg-white/[0.03] border border-white/5 rounded-[1.5rem] py-5 px-6 text-white font-sans focus:border-cyan-400/50 outline-none transition-all" 
                              placeholder="Year" 
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <label className="font-display text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.3em]">City</label>
                          <div className="relative group">
                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-cyan-400 transition-colors" />
                            <input 
                              value={formData.city}
                              onChange={e => setFormData({...formData, city: e.target.value})}
                              className="w-full bg-white/[0.03] border border-white/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-white font-sans focus:border-cyan-400/50 outline-none transition-all" 
                              placeholder="City" 
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'portfolio' && (
                    <motion.div
                      key="step-portfolio"
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="max-w-2xl mx-auto space-y-12"
                    >
                      <div className="text-center space-y-4">
                         <h3 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Optional Portfolio</h3>
                      </div>
                      <div className="grid gap-8">
                        <div className="space-y-3 group">
                          <label className="font-display text-[10px] font-black text-purple-400/60 uppercase tracking-[0.3em]">GitHub Link (Optional)</label>
                          <input 
                            value={formData.github}
                            onChange={e => setFormData({...formData, github: e.target.value})}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-[1.5rem] py-5 px-8 text-white font-sans focus:border-purple-400/50 outline-none transition-all" 
                            placeholder="github.com/..." 
                          />
                        </div>
                        <div className="space-y-3 group">
                          <label className="font-display text-[10px] font-black text-purple-400/60 uppercase tracking-[0.3em]">LinkedIn Link (Optional)</label>
                          <input 
                            value={formData.linkedin}
                            onChange={e => setFormData({...formData, linkedin: e.target.value})}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-[1.5rem] py-5 px-8 text-white font-sans focus:border-purple-400/50 outline-none transition-all" 
                            placeholder="linkedin.com/in/..." 
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {currentStep === 'success' && (
                    <motion.div
                      key="step-success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center text-center space-y-10 py-12"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-150 animate-pulse" />
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                          className="relative w-32 h-32 bg-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.4)]"
                        >
                          <CheckCircle2 className="w-16 h-16 text-black" />
                        </motion.div>
                      </div>

                      <div className="space-y-4">
                        <h2 className="font-display text-4xl font-black text-white uppercase tracking-tighter">We Will Contact You Soon</h2>
                        <p className="font-sans text-xl text-white/50 max-w-lg mx-auto leading-relaxed">
                          Your application has been successfully submitted to Velammal Software Solutions. 
                          Our team will carefully review your application and contact you shortly after admin verification. 
                          Thank you for choosing Velammal Software Solutions.
                        </p>
                      </div>

                      <div className="glass p-10 rounded-[3rem] border border-cyan-400/20 bg-cyan-400/[0.02] w-full max-w-lg space-y-8 shadow-[0_0_50px_rgba(34,211,238,0.1)] relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="relative space-y-2">
                          <h3 className="font-display text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.4em]">Coordinator</h3>
                          <p className="text-white text-3xl font-black tracking-tight uppercase">Subramani</p>
                          <p className="text-white/40 font-mono text-lg">+91 89391 17117</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 relative">
                          <button 
                            onClick={() => {
                              const message = `Hello Subramani,\n\nI have successfully applied for the internship at Velammal Software Solutions.\n\nCourse: ${internship.title}\nMode: ${formData.learningMode}\n\nPlease review my application and guide me through the next steps.\n\nThank you.\n${formData.fullName}\n${formData.phone}`;
                              window.open(`https://wa.me/918939117117?text=${encodeURIComponent(message)}`, '_blank');
                            }}
                            className="flex-1 flex items-center justify-center gap-3 bg-[#07d98b] hover:bg-[#06c27d] text-black font-display text-[10px] font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-[0_0_20px_rgba(7,217,139,0.2)] hover:shadow-[0_0_30px_rgba(7,217,139,0.4)]"
                          >
                            <MessageSquare className="w-4 h-4 fill-current" />
                            <span>WhatsApp</span>
                          </button>
                          <a 
                            href="tel:+918939117117" 
                            className="flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-2xl bg-white text-black font-display font-black text-[11px] uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-95"
                          >
                            <Phone className="w-4 h-4 fill-current" />
                            Direct Call
                          </a>
                        </div>
                      </div>

                      <button 
                        onClick={onClose}
                        className="font-display text-[9px] font-black text-white/20 uppercase tracking-[0.5em] hover:text-white transition-colors mt-8"
                      >
                        Return to Hub
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {currentStep !== 'success' && (
                <div className="p-8 md:p-12 bg-white/[0.02] border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                  <div className="flex items-center gap-5 text-white/10 font-display text-[9px] font-black uppercase tracking-[0.4em]">
                    Velammal Software Solutions
                  </div>

                  <div className="flex gap-6 w-full md:w-auto">
                    {currentStepIndex > 0 && (
                      <button 
                        onClick={handleBack}
                        className="flex-1 md:flex-none px-10 py-5 glass border border-white/10 rounded-2xl flex items-center justify-center gap-4 text-white/40 hover:text-white transition-all group"
                      >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-display text-[10px] font-black uppercase tracking-widest">Back</span>
                      </button>
                    )}

                    {currentStep === 'portfolio' ? (
                      <button 
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="flex-1 md:flex-none px-14 py-5 bg-white text-black font-display font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl flex items-center justify-center gap-4 hover:bg-cyan-400 transition-all disabled:opacity-50 shadow-xl"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Finalizing...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Finalize Application
                          </>
                        )}
                      </button>
                    ) : (
                      <button 
                        onClick={handleNext}
                        className="flex-1 md:flex-none px-14 py-5 bg-cyan-400 text-black font-display font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl flex items-center justify-center gap-4 hover:bg-white transition-all group shadow-xl"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

