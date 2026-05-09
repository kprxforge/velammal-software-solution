import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, MessageSquare, Phone, Mail, Clock, 
  ChevronRight, Filter, Search, CheckCircle2, 
  XCircle, MoreVertical, Building2, MapPin, 
  Cpu, Layout, Shield, Palette, Database, Smartphone
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function ProjectRequestOps() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('project_requests')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (!error && data) {
        setRequests(data);
      }
      setLoading(false);
    };

    fetchRequests();

    const subscription = supabase
      .channel('project_requests_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_requests' }, payload => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await supabase.from('project_requests').update({ status: newStatus }).eq('id', id);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.projectType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || req.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="font-display text-4xl font-black text-white uppercase tracking-tighter mb-2">Project Forge Inbox</h2>
          <p className="text-white/40 text-sm">Managing custom project requests from the neural grid.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-all"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-cyan-400/50 transition-all appearance-none cursor-pointer"
          >
            <option value="all">All Cycles</option>
            <option value="Pending Review">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredRequests.map((req, idx) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
              className="glass rounded-[3rem] border border-white/5 overflow-hidden group hover:border-cyan-400/20 transition-all p-8 md:p-12 relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/5 rounded-full blur-[80px] -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex flex-col lg:flex-row gap-12 relative z-10">
                {/* User Info */}
                <div className="lg:w-80 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-cyan-400/20 to-purple-600/20 flex items-center justify-center border border-white/10 shadow-xl">
                      <span className="font-display text-2xl font-black text-white">{req.fullName?.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-black text-white tracking-tight leading-none mb-2">{req.fullName}</h3>
                      <div className={cn(
                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border w-fit",
                        req.status === 'Accepted' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        req.status === 'Pending Review' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                        "bg-red-500/10 border-red-500/20 text-red-400"
                      )}>
                        {req.status}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-4 text-white/40 hover:text-white transition-colors group/link">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${req.phone}`} className="font-mono text-sm">{req.phone}</a>
                    </div>
                    <div className="flex items-center gap-4 text-white/40 hover:text-white transition-colors">
                      <Mail className="w-4 h-4" />
                      <span className="font-sans text-sm truncate">{req.email}</span>
                    </div>
                    {req.collegeOrCompany && (
                      <div className="flex items-center gap-4 text-white/40">
                        <Building2 className="w-4 h-4" />
                        <span className="font-sans text-sm">{req.collegeOrCompany}</span>
                      </div>
                    )}
                    {req.city && (
                      <div className="flex items-center gap-4 text-white/40">
                        <MapPin className="w-4 h-4" />
                        <span className="font-sans text-sm">{req.city}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => {
                        const message = `Hello ${req.fullName}, this is Subramani from Velammal Software Solutions. I am contacting you regarding your project request for a ${req.projectType}.`;
                        window.open(`https://wa.me/${req.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="flex-1 py-4 rounded-2xl bg-[#07d98b]/10 border border-[#07d98b]/20 text-[#07d98b] font-display text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#07d98b] hover:text-black transition-all"
                    >
                      <MessageSquare className="w-4 h-4 fill-current" />
                      WhatsApp
                    </button>
                    <button 
                      onClick={() => updateStatus(req.id, 'Accepted')}
                      className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all"
                      title="Accept Request"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => updateStatus(req.id, 'Rejected')}
                      className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-red-500 hover:text-black hover:border-red-500 transition-all"
                      title="Reject Request"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Project Details */}
                <div className="flex-1 space-y-10">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-cyan-400" />
                        <span className="font-display text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Project Manifest</span>
                      </div>
                      <h4 className="font-display text-4xl font-black text-white uppercase tracking-tight">{req.projectType}</h4>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-white/30 font-mono text-xs">
                      <Clock className="w-4 h-4" />
                      {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>

                  <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-10 relative group/box">
                    <p className="font-sans text-lg text-white/70 leading-relaxed italic">
                      "{req.description}"
                    </p>
                    <div className="absolute -top-4 -left-4 w-12 h-12 bg-black flex items-center justify-center rounded-2xl border border-white/5">
                      <MessageSquare className="w-6 h-6 text-white/10" />
                    </div>
                  </div>

                  {req.features && req.features.length > 0 && (
                    <div className="space-y-6">
                      <h5 className="font-display text-[10px] font-black text-white/30 uppercase tracking-[0.4em] ml-1">Features Needed</h5>
                      <div className="flex flex-wrap gap-3">
                        {req.features.map((feat: string) => (
                          <div key={feat} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 group/feat hover:border-cyan-400/30 transition-all">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                            <span className="font-display text-[10px] font-black text-white/60 uppercase tracking-widest">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {filteredRequests.length === 0 && !loading && (
            <div className="py-40 text-center space-y-6 opacity-20">
              <Zap className="w-20 h-20 mx-auto" />
              <p className="font-display text-xs font-black uppercase tracking-[0.5em]">No Data Transmission Detected</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
