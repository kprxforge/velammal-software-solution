import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Github, Search, Filter, Play, Users, Maximize2, Sparkles, Code2, Cpu, Clock, Layers, Zap, Info, Bell, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProjectModal from '@/components/ProjectModal';
import ProjectUploadModal from '@/components/ProjectUploadModal';
import { supabase } from '@/lib/supabase';

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [myUploadedProjects, setMyUploadedProjects] = useState<any[]>([]);
  const [creatorSales, setCreatorSales] = useState<any[]>([]);

  const categories = ['All', 'AI', 'Web Development', 'Mobile Apps', 'IoT', 'Cybersecurity', 'Data Science', 'Blockchain', 'Final Year Projects', 'Startup Products'];

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').order('createdAt', { ascending: false });
      if (data) {
        setProjects(data.filter((p: any) => p.active));
        
        supabase.auth.getUser().then(({ data: userData }) => {
          if (userData.user) {
            setMyUploadedProjects(data.filter((p: any) => p.userId === userData.user?.id));
          }
        });
      }
      setIsLoading(false);
    };

    fetchProjects();

    const subscription = supabase.channel('public_projects_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchProjects)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      const { data: appsData, error } = await supabase
        .from('project_requests')
        .select('id,user_id,client_name,email,project_name,description,budget,status,payment_status,payment_screenshot_url,type,created_at')
        .eq('userId', userData.user.id);
      if (error) console.error('Failed to fetch project requests:', error.message);
      if (appsData) setApplications(appsData);

      const { data: txData } = await supabase.from('transactions').select('*').eq('sellerId', userData.user.id);
      if (txData) setCreatorSales(txData);
    };
    
    fetchUserData();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
    const matchesSearch = project.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleProjectClick = (project: any) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020205]">
        <div className="w-16 h-16 rounded-full border-4 border-purple-400/20 border-t-purple-400 animate-spin shadow-[0_0_20px_rgba(168,85,247,0.2)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 mb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-4 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="font-display text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Neural Forge Repository</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.9]"
          >
            Project <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-white to-cyan-400">Universe</span>
          </motion.h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex p-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl shrink-0"
          >
            {['browse', 'my-projects'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-8 py-3 rounded-full font-display text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden',
                  activeTab === tab ? 'text-black' : 'text-white/40 hover:text-white'
                )}
              >
                <span className="relative z-10">{tab === 'browse' ? 'Archive' : 'Dashboard'}</span>
                {activeTab === tab && (
                  <motion.div 
                    layoutId="proj-tab-bg"
                    className="absolute inset-0 bg-purple-400 shadow-[0_0_20px_#a855f750]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </motion.div>
          
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsUploadModalOpen(true)}
              className="px-8 py-4 bg-purple-500/10 text-purple-400 border border-purple-500/20 font-display text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center gap-3 hover:bg-purple-500/20 transition-all group"
            >
              <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Upload Project
            </motion.button>
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'browse' ? (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="relative flex-1 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-purple-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Query the database..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-5 pl-16 pr-6 text-white font-sans focus:border-purple-400/50 outline-none transition-all"
                />
              </div>
              
              <div className="flex p-2 bg-white/[0.03] rounded-3xl border border-white/10 overflow-x-auto whitespace-nowrap hide-scrollbar">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={cn(
                      'px-8 py-3 rounded-2xl font-display text-[10px] font-black uppercase tracking-[0.2em] transition-all',
                      activeCategory === category
                        ? 'bg-white/10 text-purple-400'
                        : 'text-white/30 hover:text-white'
                    )}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {filteredProjects.map((project, index) => (
                <motion.div
                  layout
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleProjectClick(project)}
                  className="group cursor-pointer relative"
                >
                  <div className="glass rounded-[4rem] overflow-hidden border border-white/5 bg-[#05050a]/40 transition-all duration-700 hover:border-purple-400/30 hover:shadow-[0_0_80px_rgba(168,85,247,0.1)] flex flex-col h-full">
                    <div className="relative h-96 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent z-10" />
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute top-8 left-8 z-20 flex flex-col gap-2">
                        <span className="px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase bg-purple-400 text-black shadow-2xl inline-block w-fit">
                          {project.category}
                        </span>
                        {project.featured && (
                          <span className="px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase bg-amber-400 text-black shadow-[0_0_30px_rgba(251,191,36,0.6)] inline-flex items-center gap-2 w-fit">
                            <Sparkles className="w-3 h-3" /> Featured
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-12 space-y-8 flex-1 flex flex-col">
                      <div>
                        <h3 className="font-display text-4xl font-bold text-white uppercase tracking-tighter mb-3 group-hover:text-purple-400 transition-colors">
                          {project.title}
                        </h3>
                        <p className="font-sans text-sm text-white/40 line-clamp-3 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      <div className="mt-auto pt-8 border-t border-white/5 flex items-center justify-between">
                         <div className="flex gap-3">
                           {project.tech?.slice(0, 3).map((t: string) => (
                             <span key={t} className="px-4 py-1.5 rounded-xl bg-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest border border-white/5">
                               {t}
                             </span>
                           ))}
                         </div>
                         <div className="flex items-center gap-3 text-purple-400/60 font-display text-[10px] font-black uppercase tracking-widest">
                           <Clock className="w-4 h-4" />
                           {project.completionTime || 'Protocol'}
                         </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="py-40 text-center space-y-4 opacity-20">
                 <Zap className="w-16 h-16 mx-auto" />
                 <p className="font-display text-[12px] font-black uppercase tracking-[0.5em]">System Archive Empty</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            {/* Sidebar Overview */}
            <div className="space-y-8">
               <div className="glass rounded-[4rem] p-10 border-l-4 border-l-purple-500 relative overflow-hidden">
                  <div className="space-y-8 relative z-10">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-tr from-purple-500 to-cyan-400 p-[2px]">
                          <div className="w-full h-full rounded-[1.9rem] bg-black flex items-center justify-center">
                            <Users className="w-10 h-10 text-white/20" />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-display font-black text-2xl text-white uppercase tracking-tight">Active Node</h3>
                          <p className="text-purple-400 font-mono text-[10px] uppercase tracking-widest font-bold">VSS-IDENTITY-SECURED</p>
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                           <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1">Queue</p>
                           <p className="text-2xl font-display font-bold text-white">{applications.length}</p>
                        </div>
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                           <p className="text-white/20 text-[9px] font-black uppercase tracking-widest mb-1">Phase</p>
                           <p className="text-2xl font-display font-bold text-purple-400">Alpha</p>
                        </div>
                     </div>
                  </div>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-[100px]" />
               </div>

               <div className="glass rounded-[3.5rem] p-10 space-y-8">
                 <h4 className="font-display font-black text-xs text-white uppercase tracking-[0.3em] flex items-center gap-3">
                   <Bell className="w-5 h-5 text-cyan-400" />
                   Neural Updates
                 </h4>
                 <div className="space-y-8">
                   <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-cyan-400/20 transition-all group">
                     <p className="text-white/50 text-sm font-sans leading-relaxed group-hover:text-white transition-colors">VSS-Core: Project application in audit phase.</p>
                     <p className="text-[10px] font-black text-cyan-400/60 uppercase mt-4 tracking-widest">Priority Node</p>
                   </div>
                 </div>
               </div>
            </div>

            {/* Dashboard Applications */}
            <div className="lg:col-span-2 space-y-12">
               {/* Creator Earnings Panel */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="glass rounded-[3rem] p-10 border border-white/5 bg-gradient-to-br from-emerald-400/5 to-transparent">
                     <p className="font-display text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Creator Earnings</p>
                     <h3 className="font-display text-4xl font-bold text-white tracking-tighter">
                       ₹{creatorSales.filter(tx => tx.status === 'verified').reduce((acc, curr) => acc + (curr.sellerEarnings || 0), 0).toLocaleString()}
                     </h3>
                  </div>
                  <div className="glass rounded-[3rem] p-10 border border-white/5 bg-gradient-to-br from-purple-400/5 to-transparent">
                     <p className="font-display text-[10px] font-black text-purple-400 uppercase tracking-widest mb-2">Total Sales</p>
                     <h3 className="font-display text-4xl font-bold text-white tracking-tighter">
                       {creatorSales.filter(tx => tx.status === 'verified').length} Licenses
                     </h3>
                  </div>
               </div>

               {myUploadedProjects.length > 0 && (
                 <div className="glass rounded-[5rem] p-16 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                    <h3 className="font-display font-black text-4xl text-white uppercase tracking-tighter mb-4">My Uploaded Projects</h3>
                    <p className="text-white/40 font-sans mb-12">Track the status of your marketplace deployments.</p>

                    <div className="space-y-8">
                      {myUploadedProjects.map((p) => (
                        <div key={p.id} className="bg-white/5 border border-white/5 rounded-[3.5rem] p-10 group hover:border-emerald-400/30 transition-all duration-500">
                           <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                              <div className="flex items-center gap-8">
                                <div className="w-20 h-20 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.15)] group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                  <Layers className="w-10 h-10" />
                                </div>
                                <div>
                                  <h4 className="font-display font-black text-3xl text-white tracking-tighter uppercase mb-2">{p.title}</h4>
                                  <div className="flex items-center gap-4 text-white/30 font-mono text-[10px] tracking-widest uppercase">
                                    <span>Selling Price: ₹{p.price}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                    <span>{p.category}</span>
                                  </div>
                                </div>
                              </div>
                              <div className={cn(
                                 "px-8 py-3 rounded-full font-display text-[11px] font-black uppercase tracking-widest shadow-xl",
                                 p.active ? "bg-emerald-500 text-black border border-emerald-400" : "bg-white/10 text-white/50 border border-white/20"
                              )}>
                                 {p.active ? 'Market Live' : 'Pending Review'}
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>
               )}

               <div className="glass rounded-[5rem] p-16 border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent">
                  <h3 className="font-display font-black text-4xl text-white uppercase tracking-tighter mb-12">Project Sync Matrix</h3>
                  
                  <div className="space-y-8">
                    {applications.map((app) => (
                      <div key={app.id} className="bg-white/5 border border-white/5 rounded-[3.5rem] p-10 group hover:border-purple-400/30 transition-all duration-500">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                          <div className="flex items-center gap-8">
                             <div className="w-20 h-20 rounded-[2.5rem] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-glow-purple shadow-[0_0_30px_rgba(168,85,247,0.15)] group-hover:bg-purple-500 group-hover:text-black transition-all">
                               <Layers className="w-10 h-10" />
                             </div>
                             <div>
                               <h4 className="font-display font-black text-3xl text-white tracking-tighter uppercase mb-2">{app.projectTitle}</h4>
                               <div className="flex items-center gap-4 text-white/30 font-mono text-[10px] tracking-widest uppercase">
                                 <span>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}</span>
                                 <span className="w-1 h-1 rounded-full bg-white/20" />
                                 <span>Uplink ID: {app.id}</span>
                               </div>
                             </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-4">
                             <div className={cn(
                               "px-8 py-3 rounded-full font-display text-[11px] font-black uppercase tracking-widest shadow-xl",
                               app.status === 'accepted' ? "bg-emerald-500 text-black" :
                               app.status === 'Pending Review' ? "bg-blue-500 text-white" :
                               "bg-red-500 text-white"
                             )}>
                               {app.status}
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {applications.length === 0 && (
                      <div className="text-center py-32 space-y-4 opacity-20">
                         <Zap className="w-20 h-20 mx-auto" />
                         <p className="font-display text-[11px] font-black uppercase tracking-[0.5em]">No Neutral Links Established</p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        project={selectedProject} 
      />

      <ProjectUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}

