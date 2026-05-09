import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, X, Briefcase, Loader2, Upload, MessageSquare, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function ApplicationOps() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'Pending Review' | 'accepted' | 'rejected'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setIsLoading(true);

      // 1. Internship Applications
      const { data: interData, error: interErr } = await supabase
        .from('internship_applications')
        .select('*')
        .order('createdAt', { ascending: false });
      if (interErr) console.error('internship_applications error:', interErr.message);

      // 2. Custom Project Requests
      const { data: projData, error: projErr } = await supabase
        .from('project_requests')
        .select('*')
        .order('createdAt', { ascending: false });
      if (projErr) console.error('project_requests error:', projErr.message);

      // 3. Project Uploads
      const { data: uploadData, error: uploadErr } = await supabase
        .from('projects')
        .select('*')
        .order('createdAt', { ascending: false });
      if (uploadErr) console.error('projects error:', uploadErr.message);

      const interList = (interData || []).map(d => ({
        ...d,
        type: 'internship',
        displayName: d.fullName || d.full_name || 'Unknown',
        displayTitle: d.internshipTitle || d.internship_title || 'Internship Application',
        displayContact: d.phone || d.email || '',
        displaySub: d.college || d.learningMode || '',
      }));

      const projList = (projData || []).map(d => ({
        ...d,
        type: 'project_request',
        status: d.status || 'Pending Review',
        displayName: d.fullName || d.full_name || 'Unknown',
        displayTitle: d.projectType || 'Custom Project',
        displayContact: d.phone || d.email || '',
        displaySub: d.city || d.collegeOrCompany || '',
      }));

      const uploadList = (uploadData || []).map(d => ({
        ...d,
        type: 'project_upload',
        status: d.status === 'pending_approval' ? 'Pending Review' : (d.status || 'Pending Review'),
        displayName: d.userEmail || 'Unknown',
        displayTitle: d.title || 'Project Upload',
        displayContact: d.userEmail || '',
        displaySub: d.category || '',
      }));

      const combined = [...interList, ...projList, ...uploadList].sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

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

  const filteredApps = filter === 'all' ? applications : applications.filter(a => {
    if (filter === 'Pending Review') return isPending(a.status);
    return a.status === filter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="font-display text-3xl font-black text-white uppercase tracking-tighter">Application Registry</h2>
          <p className="text-white/40 text-sm mt-1">All internship applications, project requests & uploads — realtime.</p>
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

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Internship Apps', count: applications.filter(a => a.type === 'internship').length, color: 'text-cyan-400' },
          { label: 'Project Requests', count: applications.filter(a => a.type === 'project_request').length, color: 'text-purple-400' },
          { label: 'Project Uploads', count: applications.filter(a => a.type === 'project_upload').length, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-4 border border-white/5 flex items-center gap-4">
            <span className={cn("font-display text-3xl font-black", s.color)}>{s.count}</span>
            <span className="font-display text-[10px] font-black text-white/40 uppercase tracking-widest leading-tight">{s.label}</span>
          </div>
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
              key={app.id}
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
                    {app.createdAt ? new Date(app.createdAt).toLocaleString() : 'N/A'}
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
              <Zap className="w-10 h-10 text-white/10" />
            </div>
            <div className="space-y-2">
              <p className="font-display text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">No Requests Yet</p>
              <p className="font-sans text-sm text-white/10">
                {filter === 'all'
                  ? 'No submissions received yet. They will appear here in realtime.'
                  : `No applications with status "${filter}" found.`}
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
