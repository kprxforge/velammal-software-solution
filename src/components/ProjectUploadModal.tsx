import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, CheckCircle2, ChevronRight, Zap, Target, Laptop, Github, Link as LinkIcon, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ProjectUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectUploadModal({ isOpen, onClose }: ProjectUploadModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Web Development',
    description: '',
    tech: '',
    teamType: 'Individual',
    githubLink: '',
    demoLink: '',
    expectedPrice: 0,
    videoDemoLink: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    'AI', 'Web Development', 'Mobile Apps', 'IoT', 
    'Cybersecurity', 'Data Science', 'Blockchain', 
    'Final Year Projects', 'Startup Products'
  ];

  const uploadScreenshot = async (userId: string): Promise<string> => {
    if (!file) return 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop';
    
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('projects').upload(filePath, file);
    
    if (error) {
      console.error("Storage upload error:", error);
      return 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop';
    }
    
    const { data: { publicUrl } } = supabase.storage.from('projects').getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    
    setIsUploading(true);
    try {
      const imageUrl = await uploadScreenshot(userData.user.id);
      
      const projectData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        tech: formData.tech.split(',').map(t => t.trim()).filter(Boolean),
        teamType: formData.teamType,
        githubLink: formData.githubLink,
        demoLink: formData.demoLink,
        price: Number(formData.expectedPrice), // User's expected selling price
        videoDemoLink: formData.videoDemoLink,
        imageUrl: imageUrl,
        userId: userData.user.id,
        userEmail: userData.user.email,
        active: false, // Needs admin approval to appear in marketplace
        status: 'pending_approval', // Status of the upload
      };

      const { error } = await supabase.from('projects').insert([projectData]);
      if (error) throw error;
      
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting project:", error);
      alert("Failed to submit project.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#020205]/95 backdrop-blur-2xl"
        />

        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           className="relative w-full max-w-4xl max-h-[90vh] glass border border-purple-500/20 rounded-[3rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(168,85,247,0.1)]"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5 relative z-10 bg-white/[0.02]">
            <button onClick={onClose} className="absolute right-8 top-8 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 text-white/50 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Upload className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-black text-white uppercase tracking-tight">Deploy Project to Universe</h2>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                   <p className="font-display text-[10px] font-black text-purple-400/60 uppercase tracking-[0.2em]">List Your Innovation</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 lg:p-12 hide-scrollbar relative z-10">
            {isSubmitted ? (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="flex flex-col items-center justify-center text-center py-20"
               >
                 <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.2)] text-emerald-400">
                   <CheckCircle2 className="w-12 h-12" />
                 </div>
                 <h3 className="font-display text-4xl font-black text-white uppercase tracking-tighter mb-4">Transmission Successful</h3>
                 <p className="text-white/50 max-w-md font-sans mb-10">
                   Your project has been securely uploaded to the verification queue. Admin will review and authorize marketplace deployment shortly.
                 </p>
                 <button
                   onClick={onClose}
                   className="px-10 py-4 rounded-full font-display text-[11px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all shadow-xl"
                 >
                   Return to Universe
                 </button>
               </motion.div>
            ) : (
               <form onSubmit={handleSubmit} className="space-y-12">
                 {/* Step 1: Core Details */}
                 {step === 1 && (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                     <div className="space-y-3">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Target className="w-3 h-3 text-purple-400" /> Project Title
                       </label>
                       <input 
                         required
                         value={formData.title}
                         onChange={e => setFormData({...formData, title: e.target.value})}
                         placeholder="e.g. Neural Vision AI"
                         className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-400 focus:bg-purple-400/5 transition-all font-display text-lg tracking-wide"
                       />
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Domain</label>
                         <select
                           value={formData.category}
                           onChange={e => setFormData({...formData, category: e.target.value})}
                           className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-400 transition-all font-sans"
                         >
                           {categories.map(cat => <option key={cat} value={cat} className="bg-[#050508]">{cat}</option>)}
                         </select>
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Users className="w-3 h-3 text-purple-400" /> Ownership
                         </label>
                         <select
                           value={formData.teamType}
                           onChange={e => setFormData({...formData, teamType: e.target.value})}
                           className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-400 transition-all font-sans"
                         >
                           <option value="Individual" className="bg-[#050508]">Solo Creator</option>
                           <option value="Team" className="bg-[#050508]">Team / Squad</option>
                           <option value="Startup" className="bg-[#050508]">Startup Entity</option>
                         </select>
                       </div>
                     </div>

                     <div className="space-y-3">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Architectural Overview</label>
                       <textarea 
                         required
                         value={formData.description}
                         onChange={e => setFormData({...formData, description: e.target.value})}
                         placeholder="Detail the core functionality, problem solved, and impact..."
                         className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-400 transition-all font-sans min-h-[120px] resize-none"
                       />
                     </div>
                     <div className="space-y-3">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Laptop className="w-3 h-3 text-purple-400" /> Technology Stack (Comma Separated)
                       </label>
                       <input 
                         required
                         value={formData.tech}
                         onChange={e => setFormData({...formData, tech: e.target.value})}
                         placeholder="React, Python, TensorFlow, Firebase..."
                         className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-400 transition-all font-sans"
                       />
                     </div>

                     <button 
                       type="button" 
                       onClick={() => setStep(2)}
                       className="w-full py-5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-black font-display text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative group overflow-hidden"
                     >
                       <span className="relative z-10">Proceed to Link Matrix</span>
                       <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                     </button>
                   </motion.div>
                 )}

                 {/* Step 2: Links & Market */}
                 {step === 2 && (
                   <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                           <Github className="w-3 h-3 text-purple-400" /> Repository URL
                         </label>
                         <input 
                           value={formData.githubLink}
                           onChange={e => setFormData({...formData, githubLink: e.target.value})}
                           placeholder="https://github.com/..."
                           className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-400 transition-all font-mono text-sm"
                         />
                       </div>
                       <div className="space-y-3">
                         <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1 flex items-center gap-2">
                           <LinkIcon className="w-3 h-3 text-purple-400" /> Demo URL
                         </label>
                         <input 
                           value={formData.demoLink}
                           onChange={e => setFormData({...formData, demoLink: e.target.value})}
                           placeholder="https://..."
                           className="w-full bg-black/20 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-400 transition-all font-mono text-sm"
                         />
                       </div>
                     </div>

                     <div className="space-y-3">
                       <label className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest ml-1 flex items-center gap-2">
                         <Zap className="w-3 h-3 text-emerald-400" /> Expected Selling Price (₹)
                       </label>
                       <input 
                         type="number"
                         required
                         value={formData.expectedPrice}
                         onChange={e => setFormData({...formData, expectedPrice: Number(e.target.value)})}
                         placeholder="0 for free"
                         className="w-full bg-black/20 border border-emerald-500/20 rounded-2xl px-6 py-4 text-emerald-400 focus:outline-none focus:border-emerald-400 transition-all font-display text-2xl font-bold"
                       />
                       <p className="text-[10px] font-sans text-white/30 ml-2">Note: Platform fee of 20% applies to successfully sold projects.</p>
                     </div>

                     <div className="space-y-4">
                       <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Asset Upload (Hero Screenshot)</label>
                       <div 
                         className="w-full border-2 border-dashed border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 bg-black/20 hover:bg-white/5 hover:border-purple-400/30 transition-all cursor-pointer group"
                         onClick={() => document.getElementById('file-upload')?.click()}
                       >
                         <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                           <Upload className="w-6 h-6 text-purple-400" />
                         </div>
                         <div className="text-center">
                           <p className="font-display font-bold text-sm text-white">{file ? file.name : "Select visual asset"}</p>
                           <p className="font-sans text-[10px] text-white/40 mt-1 uppercase tracking-widest">PNG, JPG up to 10MB</p>
                         </div>
                         <input 
                           id="file-upload" 
                           type="file" 
                           accept="image/*" 
                           className="hidden" 
                           onChange={(e) => setFile(e.target.files?.[0] || null)}
                         />
                       </div>
                     </div>

                     <div className="flex gap-4 pt-4">
                       <button 
                         type="button" 
                         onClick={() => setStep(1)}
                         className="px-8 py-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-display text-[11px] font-black uppercase tracking-[0.2em] transition-all"
                       >
                         Back
                       </button>
                       <button 
                         type="submit" 
                         disabled={isUploading}
                         className="flex-1 py-5 rounded-2xl bg-purple-500 hover:bg-purple-400 disabled:opacity-50 text-black font-display text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all relative overflow-hidden"
                       >
                         {isUploading ? (
                           <div className="flex items-center gap-3">
                             <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                             <span>Transmitting...</span>
                           </div>
                         ) : (
                           <span>Deploy Blueprint</span>
                         )}
                       </button>
                     </div>
                   </motion.div>
                 )}
               </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
