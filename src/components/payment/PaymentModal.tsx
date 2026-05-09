import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, QrCode, CreditCard, Upload, Send, CheckCircle2, 
  ShieldCheck, AlertCircle, Info, ArrowRight, Zap,
  Loader2, IndianRupee
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  applicationType: 'internship' | 'project';
  fee: number;
}

export default function PaymentModal({ isOpen, onClose, applicationId, applicationType, fee }: PaymentModalProps) {
  const [config, setConfig] = useState<any>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(1); // 1: Pay, 2: Upload, 3: Success

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setScreenshot(null);
      return;
    }
    const fetchConfig = async () => {
      const { data } = await supabase.from('config').select('*').eq('id', 'payment').single();
      if (data) setConfig(data);
    };
    fetchConfig();

    const channel = supabase.channel('payment_config_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'config', filter: "id=eq.payment" }, fetchConfig)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen]);

  const handleUpload = async () => {
    if (!screenshot) return;
    
    if (screenshot.size > 800 * 1024) {
      alert("Image is too large. Please upload an image smaller than 800KB.");
      return;
    }

    setIsUploading(true);
    setProgress(10);

    try {
      const fileExt = screenshot.name.split('.').pop();
      const fileName = `${applicationId}-${Date.now()}.${fileExt}`;
      const filePath = `payments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('projects') // Using 'projects' bucket as general storage, or I should create 'payments'
        .upload(filePath, screenshot);

      if (uploadError) throw uploadError;
      setProgress(60);

      const { data: { publicUrl } } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath);

      const table = applicationType === 'internship' ? 'internship_applications' : 'project_requests';
      const { error: updateError } = await supabase
        .from(table)
        .update({
          paymentScreenshotUrl: publicUrl,
          paymentStatus: 'pending'
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      setProgress(100);
      setIsUploading(false);
      setStep(3);
    } catch (err) {
      console.error("Upload error:", err);
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl"
        />

        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className="relative w-full max-w-lg glass border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.2)]"
        >
          {/* Header */}
          <div className="p-8 pb-4 flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white uppercase tracking-tight">Secure Payment</h3>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Protocol Version 4.0</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-8 space-y-8 relative z-10">
            {step === 1 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 text-center space-y-6">
                  <div className="w-full max-w-[320px] mx-auto relative group">
                    {config?.qrUrl ? (
                      <img src={config.qrUrl} alt="Payment QR" className="w-full h-auto object-contain rounded-2xl" />
                    ) : (
                      <div className="w-full aspect-square flex flex-col items-center justify-center space-y-3 opacity-20 bg-white/5 rounded-2xl">
                        <QrCode className="w-12 h-12" />
                        <span className="text-[10px] font-black uppercase">Loading QR...</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-white font-display text-4xl font-bold tracking-tighter">₹{fee}</p>
                    <p className="text-cyan-400/60 font-mono text-xs uppercase tracking-widest">{config?.upiId || 'velammal@upi'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                    <Info className="w-5 h-5 text-purple-400 shrink-0" />
                    <p className="text-[11px] text-white/50 font-sans leading-relaxed">
                      Please ensure the payment is made for <span className="text-purple-400 font-bold uppercase tracking-tight">Velammal Software Solutions</span>. Take a screenshot after the transaction.
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full py-5 bg-cyan-400 text-black font-display text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                  >
                    I have Paid
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h4 className="font-display text-2xl font-bold text-white uppercase tracking-tight">Verify Payment</h4>
                  <p className="text-white/40 text-xs mt-1">Upload the transaction receipt for neural verification.</p>
                </div>

                <div className="aspect-video w-full glass border border-dashed border-white/20 rounded-[2.5rem] flex flex-col items-center justify-center p-8 group relative overflow-hidden">
                   {screenshot ? (
                     <div className="relative w-full h-full">
                       <img src={URL.createObjectURL(screenshot)} className="w-full h-full object-contain rounded-2xl" />
                       <button 
                         onClick={() => setScreenshot(null)}
                         className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white/60 hover:text-white"
                       >
                         <X className="w-4 h-4" />
                       </button>
                     </div>
                   ) : (
                     <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:bg-cyan-400/10 transition-all">
                          <Upload className="w-8 h-8 text-white/20 group-hover:text-cyan-400" />
                        </div>
                        <p className="font-display text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-white transition-colors">Select Visual Proof</p>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => setScreenshot(e.target.files?.[0] || null)} />
                     </label>
                   )}
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleUpload}
                    disabled={!screenshot || isUploading}
                    className="w-full py-5 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-display text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uplinking {Math.round(progress)}%
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit for Audit
                      </>
                    )}
                  </button>
                  <button 
                    onClick={() => setStep(1)}
                    className="w-full py-2 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Back to Scan
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12 space-y-8"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(52,211,153,0.4)] relative z-10">
                    <CheckCircle2 className="w-12 h-12 text-black" />
                  </div>
                  <div className="absolute inset-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl -top-4 -left-4 mx-auto animate-pulse" />
                </div>

                <div className="space-y-2">
                  <h4 className="font-display text-3xl font-bold text-white uppercase tracking-tight">Protocol Success</h4>
                  <p className="text-white/40 text-xs font-sans max-w-[240px] mx-auto">
                    Your payment proof has been reached the revenue vault. Verification usually takes 2-4 hours.
                  </p>
                </div>

                <button 
                  onClick={onClose}
                  className="px-12 py-4 border border-white/10 rounded-2xl font-display text-[10px] font-black text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all"
                >
                  Close Secure Link
                </button>
              </motion.div>
            )}
          </div>

          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-[80px] pointer-events-none" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
