import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Send, User, School, GraduationCap, MapPin, 
  ChevronRight, ChevronLeft, CreditCard, QrCode, Upload, CheckCircle2, 
  Sparkles, Cpu, Layers, Info, MessageSquare, Users, Phone, Mail
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import PaymentModal from './payment/PaymentModal';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProjectApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: any;
}

type Step = 'basic' | 'project' | 'payment';

export default function ProjectApplicationModal({ isOpen, onClose, project }: ProjectApplicationModalProps) {
  const [currentStep, setCurrentStep] = useState<Step>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    domain: project?.category || '',
    type: 'Individual',
    teamSize: '1',
    techPreference: '',
    description: '',
    screenshotUrl: '',
  });

  if (showPayment) {
    return (
      <PaymentModal
        isOpen={showPayment}
        onClose={onClose}
        applicationId={applicationId}
        applicationType="project"
        fee={2999}
      />
    );
  }

  const steps: Step[] = ['basic', 'project', 'payment'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = () => {
    if (currentStep === 'basic') {
      if (!formData.fullName || !formData.email || !formData.phone || !formData.college) {
        return alert('Please fill out all basic details (Name, Email, Phone, College).');
      }
      setCurrentStep('project');
    }
    else if (currentStep === 'project') {
      if (!formData.description) {
        return alert('Please write a brief description of what you plan to build.');
      }
      setCurrentStep('payment');
    }
  };

  const handleBack = () => {
    if (currentStep === 'project') setCurrentStep('basic');
    else if (currentStep === 'payment') setCurrentStep('project');
  };

  const handleSubmit = async () => {
    const isDev = localStorage.getItem('vss_dev_login') === 'true';
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user && !isDev) {
      alert('You must be logged in to apply.');
      return;
    }
    setIsSubmitting(true);
    
    const newId = `PRJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const { error } = await supabase.from('project_requests').insert([{
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        organization: formData.college,
        city: 'Not Provided',
        project_type: formData.type || 'Standard Project',
        description: formData.description || `Inquiry for project: ${project?.title}`,
        features: [formData.domain, formData.techPreference].filter(Boolean),
      }]);
      
      if (error) {
        console.error("Supabase Insert Error:", error);
        toast.error(`Failed to apply: ${error.message}`);
        throw error;
      }
      toast.success("Application submitted successfully!");
      setApplicationId(newId);
      setShowPayment(true);
    } catch (error: any) {
      console.error(error);
      alert('Error submitting application: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-0 sm:p-6 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="relative w-full h-full sm:h-[90vh] sm:max-w-4xl glass border-t border-white/10 sm:border border-white/10 sm:rounded-[3rem] shadow-[0_0_100px_rgba(168,85,247,0.15)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-white/5 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-white uppercase tracking-tight">Project Request Hub</h2>
                    <p className="font-sans text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Innovation Repository Access</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2.5 rounded-full glass hover:bg-white/10 text-white/50 hover:text-white transition-all border border-white/10 group"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Progress */}
              <div className="flex gap-2">
                  {['Personal', 'Project Specs', 'Payment'].map((label, idx) => (
                    <div key={label} className="flex-1 flex flex-col gap-2">
                      <div className={cn(
                        "h-1 rounded-full transition-all duration-500",
                        idx <= currentStepIndex ? "bg-purple-400 shadow-[0_0_10px_#c084fc]" : "bg-white/5"
                      )} />
                      <span className={cn(
                        "font-display text-[8px] font-black uppercase tracking-[0.2em] transition-colors",
                        idx <= currentStepIndex ? "text-purple-400" : "text-white/20"
                      )}>
                        {label}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 hide-scrollbar">
              <AnimatePresence mode="wait">
                {currentStep === 'basic' && (
                  <motion.div
                    key="p-basic"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="font-display text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em]">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                          <input 
                            value={formData.fullName}
                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                            type="text" 
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-sans focus:border-purple-400/50 outline-none transition-all" 
                            placeholder="Student Name" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="font-display text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em]">Contact Email</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                          <input 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            type="email" 
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-sans focus:border-purple-400/50 outline-none transition-all" 
                            placeholder="email@college.edu" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="font-display text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em]">Communication Line</label>
                        <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                          <input 
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                            type="tel" 
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-sans focus:border-purple-400/50 outline-none transition-all" 
                            placeholder="Phone Number" 
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="font-display text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em]">College HQ</label>
                        <div className="relative group">
                          <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                          <input 
                            value={formData.college}
                            onChange={e => setFormData({...formData, college: e.target.value})}
                            type="text" 
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-sans focus:border-purple-400/50 outline-none transition-all" 
                            placeholder="College Name" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="font-display text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em]">Department</label>
                        <div className="relative group">
                          <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                          <input 
                            value={formData.department}
                            onChange={e => setFormData({...formData, department: e.target.value})}
                            type="text" 
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-sans focus:border-purple-400/50 outline-none transition-all" 
                            placeholder="CSE / IT / ECE" 
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'project' && (
                  <motion.div
                    key="p-project"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="font-display text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em]">Project Domain</label>
                          <input 
                            value={formData.domain}
                            onChange={e => setFormData({...formData, domain: e.target.value})}
                            className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-4 text-white font-sans focus:border-purple-400/50 outline-none transition-all" 
                            placeholder="AI / Web Dev / IoT" 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="font-display text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em]">Team Size</label>
                            <select 
                              value={formData.teamSize}
                              onChange={e => setFormData({...formData, teamSize: e.target.value})}
                              className="w-full bg-[#0a0a10] border border-white/5 rounded-2xl py-4 px-4 text-white font-sans focus:border-purple-400/50 outline-none transition-all appearance-none"
                            >
                              <option value="1">Individual</option>
                              <option value="2">2 Members</option>
                              <option value="3">3 Members</option>
                              <option value="4">4+ Members</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="font-display text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em]">Tech Pref</label>
                            <input 
                              value={formData.techPreference}
                              onChange={e => setFormData({...formData, techPreference: e.target.value})}
                              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 px-4 text-white font-sans focus:border-purple-400/50 outline-none transition-all" 
                              placeholder="React / Python" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="font-display text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em]">Project Blueprint (Description)</label>
                        <div className="relative group h-full">
                          <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                          <textarea 
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            required
                            className="w-full h-[calc(100%-24px)] min-h-[160px] bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white font-sans focus:border-purple-400/50 outline-none transition-all resize-none" 
                            placeholder="Describe your vision, features expected, and the problem it solves..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-purple-500/5 border border-purple-500/10 p-6 rounded-3xl flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Info className="w-5 h-5 text-purple-400" />
                      </div>
                      <p className="font-sans text-[11px] text-white/40 leading-relaxed uppercase tracking-wider">
                        Each project request is reviewed by our core architecture team. Expect high-performance implementation including mentorship and complete documentation.
                      </p>
                    </div>
                  </motion.div>
                )}

                {currentStep === 'payment' && (
                  <motion.div
                    key="p-payment"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="max-w-2xl mx-auto space-y-12"
                  >
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto border border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
                        <ShieldCheck className="w-10 h-10 text-purple-400" />
                      </div>
                      <h3 className="font-display text-3xl font-bold text-white uppercase tracking-tight">Final Verification</h3>
                      <p className="text-white/40 font-sans text-sm max-w-md mx-auto">
                        Your project architecture is ready for uplink. After broadcasting the link, you will be redirected to the secure payment portal to finalize the request.
                      </p>
                    </div>

                    <div className="p-8 bg-white/5 rounded-3xl border border-white/10 space-y-6">
                      <div className="flex justify-between items-center py-4 border-b border-white/5">
                        <span className="text-white/30 text-xs uppercase tracking-widest font-black font-display">Protocol Fee</span>
                        <span className="text-white font-mono text-xl font-bold">₹2,999</span>
                      </div>
                      <div className="flex items-center gap-3 text-amber-400/80">
                         <Info className="w-4 h-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Awaiting sub-atomic transmission</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 bg-black/40 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-4 text-white/20 font-display text-[9px] font-black uppercase tracking-[0.4em]">
                  <div className="flex gap-1.5 h-1">
                    <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="w-3 h-1 bg-purple-400"></motion.div>
                    <div className="w-1.5 h-1 bg-white/10"></div>
                  </div>
                  System Stable
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                  {currentStepIndex > 0 && (
                    <button 
                      onClick={handleBack}
                      className="flex-1 md:flex-none px-8 py-4 glass border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-white/60 hover:text-white transition-all group"
                    >
                      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                      <span className="font-display text-[10px] font-black uppercase tracking-widest">Re-calculate</span>
                    </button>
                  )}

                  {currentStep === 'payment' ? (
                    <button 
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                      className="flex-1 md:flex-none px-12 py-4 bg-white text-black font-display font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl flex items-center justify-center gap-3 hover:bg-purple-400 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Broadcast Link</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={handleNext}
                      className="flex-1 md:flex-none px-12 py-4 bg-purple-400 text-black font-display font-black text-[10px] uppercase tracking-[0.4em] rounded-2xl flex items-center justify-center gap-3 hover:bg-white transition-all group"
                    >
                      <span>Proceed</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
