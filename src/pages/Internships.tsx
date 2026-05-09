import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Code, Terminal, Clock, CheckCircle2, ChevronRight, FileCheck, BookOpen, Bell, Cpu, Zap, Globe, Plus, Sparkles, Layout } from 'lucide-react';
import { cn } from '@/lib/utils';
import ApplicationModal from '@/components/ApplicationModal';
import CourseDetailsModal from '@/components/CourseDetailsModal';
import { supabase } from '@/lib/supabase';

// A simple 3D Tilt Wrapper component
const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, rotateY: 2, rotateX: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
};

const InternshipCard = ({ job, index, handleViewDetails, handleApply }: any) => {
  const [syllabusExpanded, setSyllabusExpanded] = useState(false);

  return (
    <TiltCard>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="h-full glass rounded-[3rem] p-8 group border border-white/5 hover:border-white/10 transition-all relative overflow-hidden flex flex-col shadow-2xl hover:shadow-[0_0_50px_rgba(255,255,255,0.05)]"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
        
        {/* Glowing Particles inside card */}
        <div className="absolute top-10 right-10 w-2 h-2 rounded-full blur-[2px] opacity-0 group-hover:opacity-100 group-hover:animate-ping" style={{ backgroundColor: job.color || '#22d3ee' }} />
        <div className="absolute bottom-20 left-10 w-1 h-1 rounded-full blur-[1px] opacity-0 group-hover:opacity-50 group-hover:animate-ping" style={{ backgroundColor: job.color || '#c084fc', animationDelay: '500ms' }} />

        <div className="flex justify-between items-start mb-8 relative z-10">
          <div
            className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center bg-white/5 border border-white/10 shadow-[inner_0_0_15px_rgba(255,255,255,0.05)] text-glow-cyan"
            style={{ borderColor: `${job.color}30` }}
          >
            <Layout className="w-8 h-8" style={{ color: job.color || '#22d3ee' }} />
          </div>
          {job.badge && (
            <div className="px-4 py-2 rounded-full border border-white/5 bg-white/5 text-[9px] font-black uppercase tracking-widest transition-all"
                 style={{ color: job.color || '#22d3ee', borderColor: `${job.color}30` }}>
              {job.badge}
            </div>
          )}
        </div>
        
        <h3 className="relative z-10 font-display text-2xl font-bold text-white mb-2 leading-tight group-hover:translate-x-2 transition-transform duration-500 line-clamp-2">
          {job.title}
        </h3>
        <p className="relative z-10 font-display text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">
          {job.domain}
        </p>
        
        <div className="relative z-10 flex flex-col gap-3 mb-8 bg-black/20 p-4 rounded-3xl border border-white/5">
          <div className="flex items-center gap-3 text-white/50 font-sans text-sm">
            <Clock className="w-4 h-4 text-white/30" />
            <span>{job.duration || 'Flexible'} • {(job.onlineAvailable !== false) && (job.offlineAvailable !== false) ? 'Online & Offline' : (job.onlineAvailable !== false) ? 'Online Only' : (job.offlineAvailable !== false) ? 'Offline Only' : ''}</span>
          </div>
          <div className="flex items-center gap-3 text-white/50 font-sans text-sm">
            <Sparkles className="w-4 h-4 text-white/30" />
            <span>{job.level || 'Beginner to Advanced'}</span>
          </div>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2 mb-6 mt-auto">
          {(Array.isArray(job.skills) ? job.skills : []).slice(0, 4).map((skill: string) => (
            <span key={skill} className="px-3 py-1.5 text-[10px] font-mono rounded-xl bg-white/5 text-white/40 border border-white/5 group-hover:text-white/60 transition-colors">
              {skill}
            </span>
          ))}
          {job.skills?.length > 4 && (
            <span className="px-3 py-1.5 text-[10px] font-mono rounded-xl bg-white/5 text-white/20 border border-white/5">
              +{job.skills.length - 4}
            </span>
          )}
        </div>

        {/* Expandable Syllabus */}
        {job.modules && job.modules.length > 0 && (
          <div className="relative z-10 mb-8 border border-white/5 rounded-2xl overflow-hidden bg-black/20">
            <button
              onClick={() => setSyllabusExpanded(!syllabusExpanded)}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" style={{ color: job.color || '#22d3ee' }} />
                <span className="font-display text-[10px] font-black text-white/60 uppercase tracking-widest">Syllabus Overview</span>
              </div>
              <motion.div
                animate={{ rotate: syllabusExpanded ? 180 : 0 }}
                className="text-white/40"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </motion.div>
            </button>
            <AnimatePresence>
              {syllabusExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-4 overflow-hidden"
                >
                  <ul className="space-y-2 mt-4">
                    {(Array.isArray(job.modules) ? job.modules : []).slice(0, 4).map((mod: string, i: number) => (
                      <li key={i} className="flex gap-3 text-white/50 font-sans text-xs items-start">
                        <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <span className="line-clamp-1">{mod}</span>
                      </li>
                    ))}
                    {job.modules.length > 4 && (
                      <li className="text-[10px] text-white/30 font-mono italic mt-2 ml-7">
                        + {job.modules.length - 4} more modules...
                      </li>
                    )}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="relative z-10 grid grid-cols-2 gap-3 pb-2 pt-4 border-t border-white/5">
          <button
            onClick={() => handleViewDetails(job)}
            className="py-4 rounded-2xl font-display text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/10"
          >
            View Details
          </button>
          <button
            onClick={() => handleApply(job)}
            className="py-4 rounded-2xl font-display text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all group/apply shadow-lg hover:shadow-xl"
            style={{
              backgroundColor: `${job.color || '#22d3ee'}20`,
              color: job.color || '#22d3ee',
              borderColor: `${job.color || '#22d3ee'}40`
            }}
          >
            <span>Apply Now</span>
            <ChevronRight className="w-3 h-3 group-hover/apply:translate-x-1 transition-transform" />
          </button>
        </div>
        
        {/* Decorative Gradient Blob */}
        <div className="absolute -bottom-20 -right-20 w-56 h-56 rounded-full opacity-5 blur-[60px] group-hover:opacity-[0.15] transition-opacity duration-700" style={{ backgroundColor: job.color || '#22d3ee' }} />
      </motion.div>
    </TiltCard>
  );
};


export default function Internships() {
  const [internships, setInternships] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Application form
  const [isDetailsOpen, setIsDetailsOpen] = useState(false); // Details modal
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInternships = async () => {
      const { data } = await supabase.from('internships').select('*').order('createdAt', { ascending: false });
      if (data) {
        setInternships(data.filter((i: any) => i.active));
      }
      setIsLoading(false);
    };
    
    fetchInternships();

    const subscription = supabase.channel('public_internships_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'internships' }, fetchInternships)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  const handleApply = (job: any) => {
    setSelectedInternship(job);
    setIsDetailsOpen(false);
    setIsModalOpen(true);
  };

  const handleViewDetails = (job: any) => {
    setSelectedInternship(job);
    setIsDetailsOpen(true);
  };

  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    const fetchApplications = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      const { data } = await supabase.from('internship_applications')
        .select('*')
        .eq('userId', userData.user.id);
        
      if (data) setApplications(data);
    };

    fetchApplications();
  }, []);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020205]">
        <div className="w-16 h-16 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin shadow-[0_0_20px_rgba(34,211,238,0.2)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-[2px] bg-cyan-400" />
            <span className="font-display text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">Neural Career portal</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl font-bold text-white tracking-tighter"
          >
            Shape the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Future.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-white/40 max-w-lg"
          >
            Access elite internship protocols and collaborative neural frameworks at Velammal Software Solutions.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex p-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl"
        >
          {['browse', 'dashboard'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-8 py-3 rounded-full font-display text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden',
                activeTab === tab
                  ? 'text-black'
                  : 'text-white/40 hover:text-white'
              )}
            >
              <span className="relative z-10">{tab === 'browse' ? 'Browse Internships' : 'My Dashboard'}</span>
              {activeTab === tab && (
                <motion.div 
                  layoutId="active-tab-bg"
                  className="absolute inset-0 bg-cyan-400"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'browse' ? (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {internships.map((job, index) => (
              <InternshipCard 
                key={job.id} 
                job={job} 
                index={index} 
                handleViewDetails={handleViewDetails} 
                handleApply={handleApply} 
              />
            ))}
            
            {internships.length === 0 && (
              <div className="col-span-full py-32 text-center space-y-4">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-dashed border-white/10">
                   <Zap className="w-8 h-8 text-white/10" />
                 </div>
                 <p className="font-display text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">No active nodes found in the network.</p>
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
            {/* Sidebar Stats */}
            <div className="space-y-8">
              <div className="glass rounded-[3rem] p-10 border-l-4 border-l-cyan-400 relative overflow-hidden group">
                <div className="relative z-10 space-y-8">
                   <div className="flex items-center gap-6">
                     <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-purple-600 p-[2px] shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=student" alt="Avatar" className="w-full h-full rounded-[1.4rem] bg-black" />
                     </div>
                     <div>
                       <h3 className="font-display font-black text-2xl text-white uppercase tracking-tight leading-none mb-2">User 2401</h3>
                       <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full w-fit border border-white/5">
                         <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_#22d3ee]" />
                         <span className="font-mono text-[9px] text-cyan-400 uppercase tracking-widest font-bold">Node Sync Active</span>
                       </div>
                     </div>
                   </div>
                   
                   <div className="space-y-4 pt-4">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span className="text-white/30">Profile Calibration</span>
                       <span className="text-cyan-400">85% Complete</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 w-[85%] rounded-full shadow-[0_0_15px_#22d3ee50]" />
                     </div>
                   </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 rounded-full blur-3xl" />
              </div>

              <div className="glass rounded-[3rem] p-10 space-y-8">
                <h4 className="font-display font-black text-xs text-white uppercase tracking-[0.3em] flex items-center gap-3">
                  <Bell className="w-4 h-4 text-purple-400" />
                  System Notifications
                </h4>
                <div className="space-y-8">
                  <div className="flex gap-5 items-start group">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 shadow-[0_0_8px_#22d3ee] shrink-0" />
                    <div>
                      <p className="font-sans text-sm text-white/60 leading-relaxed group-hover:text-white transition-colors">Your application for <span className="text-cyan-400">Frontend AI Engineer</span> is currently undergoing neural audit.</p>
                      <span className="text-[10px] text-white/20 font-mono uppercase tracking-widest mt-2 block">2 cycles ago</span>
                    </div>
                  </div>
                  <div className="flex gap-5 items-start group opacity-40 hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 shadow-[0_0_8px_#c084fc] shrink-0" />
                    <div>
                      <p className="font-sans text-sm text-white/60 leading-relaxed">System architecture update released. New learning protocols added.</p>
                      <span className="text-[10px] text-white/20 font-mono uppercase tracking-widest mt-2 block">1 solar day ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              <div className="glass rounded-[4rem] p-12 border border-white/5 relative overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent">
                <h3 className="font-display font-black text-3xl text-white uppercase tracking-tighter mb-10">Application Matrix</h3>
                
                <div className="space-y-6">
                  {applications.map((app) => (
                    <div key={app.id} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 group hover:border-cyan-400/20 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-glow-cyan">
                          <Cpu className="w-8 h-8 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-xl text-white tracking-tight">{app.internshipTitle}</h4>
                          <p className="font-mono text-xs text-white/20 uppercase tracking-widest mt-1">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'} • Node: {app.id}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-center gap-4">

                        <div className={cn(
                          "flex items-center gap-3 px-6 py-2.5 rounded-full border",
                          app.status === 'accepted' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                          app.status === 'Pending Review' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                          "bg-red-500/10 border-red-500/20 text-red-400"
                        )}>
                          <span className="font-display text-[10px] font-black uppercase tracking-widest">{app.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {applications.length === 0 && (
                    <div className="py-20 text-center opacity-20">
                      <Zap className="w-12 h-12 mx-auto mb-4" />
                      <p className="font-display text-[10px] font-black uppercase tracking-[0.3em]">No Active Logs Found</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="glass rounded-[3rem] p-10 group cursor-pointer border border-white/5 hover:border-cyan-400/20 transition-all flex flex-col justify-between h-[280px]">
                  <div className="p-4 bg-cyan-400/10 rounded-2xl w-fit">
                    <BookOpen className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-2xl text-white tracking-tight mb-2 uppercase">Neural Track</h4>
                    <p className="font-sans text-sm text-white/30 leading-relaxed">Continue your Three.js Fiber & Shaders sequence.</p>
                  </div>
                </div>
                
                <div className="glass rounded-[3rem] p-10 group cursor-pointer border border-white/5 hover:border-purple-400/20 transition-all flex flex-col justify-between h-[280px]">
                  <div className="p-4 bg-purple-400/10 rounded-2xl w-fit">
                    <FileCheck className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-2xl text-white tracking-tight mb-2 uppercase">Credentials</h4>
                    <p className="font-sans text-sm text-white/30 leading-relaxed">Access your cryptographically signed certificates.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ApplicationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        internship={selectedInternship} 
      />
      <CourseDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        course={selectedInternship}
        onApply={() => handleApply(selectedInternship)}
      />
    </div>
  );
}

