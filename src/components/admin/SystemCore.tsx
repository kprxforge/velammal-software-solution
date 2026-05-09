import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, QrCode, Trash2, Save, CheckCircle2, 
  CreditCard, Globe, Shield, Zap, AlertTriangle, Settings 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function SystemCore() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [upiId, setUpiId] = useState('');
  const [qrActive, setQrActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('config')
        .select('*')
        .eq('id', 'payment')
        .single();
      
      if (data && data.value) {
        const config = data.value;
        setQrUrl(config.qrUrl || null);
        setUpiId(config.upiId || '');
        setQrActive(config.qrActive ?? true);
      }
    };

    fetchConfig();

    const subscription = supabase
      .channel('config_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'config', filter: "id=eq.payment" }, fetchConfig)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      alert("Image is too large. Please upload an image smaller than 800KB.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(50); // Simulate progress for the reader

    const reader = new FileReader();
    reader.onloadend = () => {
      setQrUrl(reader.result as string);
      setIsUploading(false);
      setUploadProgress(0);
    };
    reader.onerror = () => {
      console.error("Failed to read file");
      setIsUploading(false);
      setUploadProgress(0);
    };
    reader.readAsDataURL(file);
  };

  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('config')
        .upsert({
          id: 'payment',
          value: {
            qrUrl,
            upiId,
            qrActive,
            updatedAt: new Date().toISOString()
          }
        });
      
      if (error) throw error;
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving config:", error);
    }
    setIsSaving(false);
  };

  const deleteQr = async () => {
    if (!qrUrl) return;
    if (confirm('Permanently delete this QR code?')) {
      try {
        // Note: Realistically we'd need the storage path. 
        // For simplicity, we just clear the URL in Firestore.
        setQrUrl(null);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-display text-4xl font-bold text-white uppercase tracking-tighter mb-2">System Core</h2>
          <p className="text-white/40 text-sm max-w-xl">
            Configure global network protocols, payment gateways, and neural link configurations.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-400/10 border border-emerald-400/20 rounded-full">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="font-display text-[10px] font-black text-emerald-400 uppercase tracking-widest">Mainframe Secured</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* QR Management Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="glass rounded-[3rem] p-12 border border-white/5 relative overflow-hidden group"
        >
          <div className="relative z-10 space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[1.5rem] bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white uppercase tracking-tight">QR Payment Node</h3>
                <p className="font-sans text-xs text-white/20 uppercase tracking-widest">Central Payment Gateway</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="aspect-square w-full max-w-[320px] mx-auto glass rounded-3xl border border-white/10 relative flex items-center justify-center overflow-hidden group/qr">
                {qrUrl ? (
                  <>
                    <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain p-8 group-hover/qr:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm gap-4">
                      <button 
                        onClick={deleteQr}
                        className="p-4 bg-red-500/20 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                      >
                        <Trash2 className="w-6 h-6" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center space-y-4 px-8">
                    <div className="w-20 h-20 bg-white/5 border border-dashed border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload className="w-8 h-8 text-white/20" />
                    </div>
                    <p className="font-display text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Ready for Uplink</p>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
                    <p className="font-display text-[10px] font-black text-cyan-400 uppercase tracking-widest">{Math.round(uploadProgress)}% Uploaded</p>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <label className="flex-1">
                  <div className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 cursor-pointer hover:bg-white/10 hover:border-cyan-400/30 transition-all font-display text-[10px] font-black text-white uppercase tracking-widest group/btn">
                    <Upload className="w-4 h-4 group-hover/btn:text-cyan-400 transition-colors" />
                    Upload New QR
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={isUploading} />
                </label>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-400/5 rounded-full blur-[80px] group-hover:bg-cyan-400/10 transition-all" />
        </motion.div>

        {/* Global Settings Card */}
        <div className="space-y-8">
          <div className="glass rounded-[3rem] p-10 border border-white/5 space-y-8">
            <h3 className="font-display text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
              <Settings className="w-5 h-5 text-purple-400" />
              Gateway Protocols
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Universal UPI ID</label>
                <div className="relative group">
                  <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400/40 group-focus-within:text-purple-400 transition-colors" />
                  <input 
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-16 pr-6 py-5 text-white font-sans focus:outline-none focus:border-purple-400 transition-all text-lg"
                    placeholder="velammal@upi"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] group hover:bg-white/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-bold text-white uppercase tracking-tight">QR Visibility</h4>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest">Toggle across all client portals</p>
                  </div>
                </div>
                <button 
                  onClick={() => setQrActive(!qrActive)}
                  className={cn(
                    "w-14 h-8 rounded-full transition-all relative",
                    qrActive ? "bg-emerald-500" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-6 h-6 rounded-full bg-white shadow-xl transition-all",
                    qrActive ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            </div>

            <button 
              onClick={saveConfig}
              disabled={isSaving}
              className="w-full py-5 bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-display text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(0,240,255,0.2)] flex items-center justify-center gap-3 group"
            >
              <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {isSaving ? 'Synching Mainframe...' : 'Commit System Changes'}
            </button>
          </div>

          <div className="glass rounded-[3rem] p-8 border border-white/5 bg-red-500/5 border-red-500/10 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
            <div>
              <h4 className="font-display text-sm font-bold text-red-500 uppercase tracking-tight">Critical Warning</h4>
              <p className="text-xs text-white/40 font-sans leading-relaxed mt-1">
                Modifying these protocols affects live transaction gateways. Ensure all Uplink IDs are verified before committing to the production environment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 right-12 z-[200] glass px-8 py-5 rounded-[2rem] border border-emerald-400/30 flex items-center gap-4 bg-emerald-400/[0.05]"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center text-black shadow-[0_0_20px_rgba(52,211,153,0.4)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-display text-[10px] font-black text-emerald-400 uppercase tracking-widest">Protocol Sync Success</p>
              <p className="text-white/60 text-[10px] font-sans">Mainframe database has been updated globally.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}