import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Briefcase, Loader2, Upload, MessageSquare, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type AppType = 'internship' | 'project_request' | 'project_upload';

export default function ApplicationOps() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'Pending Review' | 'accepted' | 'rejected'>('all');
  const [activeTab, setActiveTab] = useState<AppType>('internship');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);

      const fetchTable = async (table: string) => {
        let res = await supabase.from(table).select('*').order('created_at', { ascending: false });
        if (res.error) {
          console.warn(`[${table}] created_at failed, trying createdAt:`, res.error.message);
          res = await supabase.from(table).select('*').order('createdAt', { ascending: false });
          if (res.error) {
            console.warn(`[${table}] createdAt failed, trying unordered:`, res.error.message);
            res = await supabase.from(table).select('*');
          }
        }
        return res.data || [];
      };

      // 1. Internship Applications
      const interData = await fetchTable('internship_applications');

      // 2. Custom Project Requests
      const projData = await fetchTable('project_requests');

      // 3. Project Uploads
      const uploadData = await fetchTable('projects');

      const interList = interData.map(d => ({
        ...d,
        type: 'internship',
        displayName: d.fullName || d.full_name || 'Unknown',
        displayTitle: d.internshipTitle || d.internship_title || 'Internship Application',
        displayContact: d.phone || d.email || '',
        displaySub: d.college || d.learningMode || '',
      }));

      const projList = projData.map(d => ({
        ...d,
        type: 'project_request',
        status: d.status || 'Pending Review',
        displayName: d.fullName || d.full_name || 'Unknown',
        displayTitle: d.projectType || 'Custom Project',
        displayContact: d.phone || d.email || '',
        displaySub: d.city || d.collegeOrCompany || '',
      }));

      const uploadList = uploadData.map(d => ({
        ...d,
        type: 'project_upload',
        status: d.status === 'pending_approval' ? 'Pending Review' : (d.status || 'Pending Review'),
        displayName: d.userEmail || 'Unknown',
        displayTitle: d.title || 'Project Upload',
        displayContact: d.userEmail || '',
        displaySub: d.category || '',
      }));

      const combined = [...interList, ...projList, ...uploadList].sort((a, b) => {
        const timeA = new Date(a.created_at || a.createdAt || 0).getTime();
        const timeB = new Date(b.created_at || b.createdAt || 0).getTime();
        return timeB - timeA;
      });

      setApplications(combined);
      setIsLoading(false);
    };

    fetchApplications();

    const interSub = supabase.channel('admin_inter_apps')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'internship_applications' }, fetchApplications)
      .subscribe();

    const projSub = supabase.channel('admin_proj_reqs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_requests' }, fetchApplications)
      .subscribe();

    const uploadSub = supabase.channel('admin_proj_uploads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchApplications)
      .subscribe();

    return () => {
      supabase.removeChannel(interSub);
      supabase.removeChannel(projSub);
      supabase.removeChannel(uploadSub);
    };
  }, []);

  const handleUpdateStatus = async (appId: string, type: string, status: 'accepted' | 'rejected') => {
    setProcessingId(appId);
    try {
      const tableMap: Record<string, string> = {
        internship: 'internship_applications',
        project_request: 'project_requests',
        project_upload: 'projects',
      };
      const table = tableMap[type] || 'internship_applications';

      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
      const { error } = await supabase.from(table).update({ status }).eq('id', appId);
      if (error) throw error;

      if (status === 'accepted') {
        const app = applications.find(a => a.id === appId);
        if (app?.phone) {
          const message = `Hello ${app.displayName}, congratulations! Your ${type === 'internship' ? 'internship application' : 'request'} has been accepted by Velammal Software Solutions. Please contact coordinator Subramani at +91 89391 17117 for next steps.`;
          window.open(`https://wa.me/${app.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
        }
      }
    } catch (err: any) {
      console.error('Status update error:', err?.message || err);
      alert(`Update failed: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const typeIcon = (type: string) => {
    if (type === 'internship') return <Briefcase className="w-8 h-8 text-cyan-400" />;
    if (type === 'project_request') return <MessageSquare className="w-8 h-8 text-purple-400" />;
    return <Upload className="w-8 h-8 text-amber-400" />;
  };

  const typeBg = (type: string) => {
    if (type === 'internship') return 'bg-cyan-400/10';
    if (type === 'project_request') return 'bg-purple-500/10';
    return 'bg-amber-400/10';
  };

  const typeLabel = (type: string) => {
    if (type === 'internship') return 'Internship';
    if (type === 'project_request') return 'Project Request';
    return 'Project Upload';
  };

  const isPending = (status: string) =>
    !status || status === 'Pending Review' || status === 'pending_approval';

  const tabApps = applications.filter(a => a.type === activeTab);
  const filteredApps = filter === 'all' ? tabApps : tabApps.filter(a => {
    if (filter === 'Pending Review') return isPending(a.status);
    return a.status === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-3xl font-black text-white uppercase tracking-tighter">Application Registry</h2>
          <p className="text-white/40 text-sm mt-1">Manage Realtime Submissions</p>
        </div>
        <div className="flex flex-wrap gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
          {(['all', 'Pending Review', 'accepted', 'rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2 rounded-xl font-display text-[10px] font-black uppercase tracking-widest transition-all",
                filter === f ? "bg-cyan-400 text-black" : "text-white/30 hover:text-white"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs / Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'internship', label: 'Total Internship Applications', count: applications.filter(a => a.type === 'internship').length, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
          { id: 'project_request', label: 'Custom Project Requests', count: applications.filter(a => a.type === 'project_request').length, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
          { id: 'project_upload', label: 'Project Uploads', count: applications.filter(a => a.type === 'project_upload').length, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setActiveTab(s.id as AppType)}
            className={cn(
              "rounded-2xl p-6 border text-left transition-all relative overflow-hidden group",
              activeTab === s.id ? `${s.bg} ${s.border}` : "glass border-white/5 hover:border-white/20 hover:bg-white/[0.02]"
            )}
          >
            {activeTab === s.id && (
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
            )}
            <div className="flex items-center gap-4">
              <span className={cn("font-display text-4xl font-black", s.color)}>{s.count}</span>
              <span className="font-display text-[10px] font-black text-white/40 uppercase tracking-widest leading-tight w-24">
                {s.label}
              </span>
            </div>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Check className={cn("w-5 h-5", s.color)} />
            </div>
          </button>
        ))}
      </div>

      {/* Application List */}
      <div className="space-y-4">
        {isLoading && (
          <div className="py-20 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {!isLoading && filteredApps.map((app) => (
            <motion.div
              layout
              key={app.id || Math.random().toString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white/5 border border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:bg-white/[0.07] transition-all"
            >
              <div className="flex items-center gap-6 flex-1 w-full">
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0", typeBg(app.type))}>
                  {typeIcon(app.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h4 className="text-xl font-bold text-white">{app.displayName}</h4>
                    <span className="px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-white/40">
                      {typeLabel(app.type)}
                    </span>
                  </div>
                  <p className="text-white/40 font-mono text-xs truncate">{app.displayTitle} • {app.displayContact}</p>
                  {app.displaySub && (
                    <p className="text-white/20 font-sans text-xs mt-1">{app.displaySub}</p>
                  )}
                  <p className="text-white/20 font-mono text-[10px] mt-1">
                    {app.created_at || app.createdAt ? new Date(app.created_at || app.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {isPending(app.status) ? (
                  <>
                    <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      Pending
                    </span>
                    <button
                      onClick={() => handleUpdateStatus(app.id, app.type, 'accepted')}
                      className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black transition-all"
                      title="Accept"
                    >
                      {processingId === app.id
                        ? <Loader2 className="animate-spin w-5 h-5"/>
                        : <Check className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(app.id, app.type, 'rejected')}
                      className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black transition-all"
                      title="Reject"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <span className={cn(
                    "px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest border",
                    (app.status === 'accepted' || app.status === 'Accepted')
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  )}>
                    {app.status}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {!isLoading && filteredApps.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 text-center space-y-6"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 border border-dashed border-white/10 flex items-center justify-center mx-auto">
              {activeTab === 'internship' ? <Briefcase className="w-10 h-10 text-cyan-400/20" /> :
               activeTab === 'project_request' ? <MessageSquare className="w-10 h-10 text-purple-400/20" /> :
               <Upload className="w-10 h-10 text-amber-400/20" />}
            </div>
            <div className="space-y-2">
              <p className="font-display text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">
                0 {typeLabel(activeTab)}s
              </p>
              <p className="font-sans text-sm text-white/40">
                {filter === 'all'
                  ? `No ${typeLabel(activeTab).toLowerCase()}s received yet. They will appear here in realtime.`
                  : `No ${typeLabel(activeTab).toLowerCase()}s with status "${filter}" found.`}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
