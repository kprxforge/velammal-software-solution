import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Phone, Mail, User, School, Globe, Briefcase, Loader2, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function ApplicationOps() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'Pending Review' | 'accepted' | 'rejected'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: interData } = await supabase.from('internship_applications').select('*').order('createdAt', { ascending: false });
      const { data: projData } = await supabase.from('project_requests').select('*').order('createdAt', { ascending: false });
      
      const interList = (interData || []).map(d => ({ ...d, type: 'internship' }));
      const projList = (projData || []).map(d => ({ ...d, type: 'project' }));
      
      const combined = [...interList, ...projList].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setApplications(combined);
    };

    fetchApplications();

    // Setup realtime
    const interSub = supabase.channel('inter_apps').on('postgres_changes', { event: '*', schema: 'public', table: 'internship_applications' }, fetchApplications).subscribe();
    const projSub = supabase.channel('proj_reqs').on('postgres_changes', { event: '*', schema: 'public', table: 'project_requests' }, fetchApplications).subscribe();

    return () => {
      supabase.removeChannel(interSub);
      supabase.removeChannel(projSub);
    };
  }, []);

  const handleUpdateStatus = async (appId: string, type: 'internship' | 'project', status: 'accepted' | 'rejected') => {
    setProcessingId(appId);
    try {
      const coll = type === 'internship' ? 'internship_applications' : 'project_requests';
      
      // Update locally first for immediate UI feedback
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));

      // Use match() for Supabase updates when 'id' is present
      await supabase.from(coll).update({ status }).eq('id', appId);
      
      if (status === 'accepted') {
          // Trigger WhatsApp
          const app = applications.find(a => a.id === appId);
          if (app) {
              const message = `Hello ${app.fullName}, congratulations! Your application for ${app.internshipTitle || app.projectTitle} has been accepted. Please contact coordinator Subramani at +91 89391 17117 for next steps.`;
              window.open(`https://wa.me/${app.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
          }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApps = filter === 'all' ? applications : applications.filter(a => a.status === filter);

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl font-black text-white uppercase tracking-tighter">Application Registry</h2>
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl">
          {(['all', 'Pending Review', 'accepted', 'rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={cn("px-6 py-2 rounded-xl font-display text-[10px] font-black uppercase tracking-widest transition-all", filter === f ? "bg-cyan-400 text-black" : "text-white/30 hover:text-white")}>{f}</button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredApps.map((app) => (
          <motion.div layout key={app.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-white/[0.07] transition-all">
            <div className="flex items-center gap-6 flex-1 w-full">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", app.type === 'internship' ? "bg-cyan-400/10" : "bg-purple-500/10")}>
                {app.type === 'internship' ? <Briefcase className="w-8 h-8 text-cyan-400" /> : <Globe className="w-8 h-8 text-purple-400" />}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-white">{app.fullName}</h4>
                <p className="text-white/40 font-mono text-xs">{app.internshipTitle || app.projectTitle} • {app.email}</p>
                <div className="flex gap-4 mt-2">
                    <span className="text-white/30 text-xs flex items-center gap-1"><Phone className="w-3 h-3"/> {app.phone}</span>
                    <span className="text-white/30 text-xs flex items-center gap-1"><School className="w-3 h-3"/> {app.college}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {app.status === 'Pending Review' ? (
                <>
                  <button onClick={() => handleUpdateStatus(app.id, app.type, 'accepted')} className="p-4 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black transition-all">
                    {processingId === app.id ? <Loader2 className="animate-spin w-5 h-5"/> : <Check className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleUpdateStatus(app.id, app.type, 'rejected')} className="p-4 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <span className={cn("px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest", app.status === 'accepted' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>{app.status}</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
