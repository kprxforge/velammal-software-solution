import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, Users, Briefcase, FileText, Settings, 
  Search, Bell, LogOut, ChevronRight, Menu, X, 
  Terminal, Shield, Zap, Globe, Cpu, Activity, MessageSquare
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// Sub-components
import NeuralInsights from '@/components/admin/NeuralInsights';
import InternshipOps from '@/components/admin/InternshipOps';
import ProjectForge from '@/components/admin/ProjectForge';
import ProjectRequestOps from '@/components/admin/ProjectRequestOps';
import RevenueVault from '@/components/admin/RevenueVault';
import SystemCore from '@/components/admin/SystemCore';
import ApplicationOps from '@/components/admin/ApplicationOps';

export default function Admin() {
  const [activeView, setActiveView] = useState('insights');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async (currentUser: any) => {
      const isDev = localStorage.getItem('vss_dev_login') === 'true';
      
      if (isDev) {
        setIsAdmin(true);
        setUser({ email: 'admin@vss.com', id: 'dev-user-001' });
        setIsLoading(false);
        return;
      }

      if (currentUser) {
        let isUserAdmin = false;
        if (currentUser.email === 'sit24am005@sairamtap.edu.in') {
          isUserAdmin = true;
          // You might want to save to an 'admins' table in Supabase instead if needed:
          // await supabase.from('admins').upsert({ id: currentUser.id, email: currentUser.email, role: 'super_admin' });
        } else {
          const { data } = await supabase.from('admins').select('*').eq('id', currentUser.id).single();
          if (data) isUserAdmin = true;
        }

        setIsAdmin(isUserAdmin);
        setUser(currentUser);
      } else {
        navigate('/login');
      }
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAdmin(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdmin(session?.user || null);
    });

    // Check immediately for dev bypass
    if (localStorage.getItem('vss_dev_login') === 'true') {
      checkAdmin(null);
    }

    return () => subscription.unsubscribe();
  }, [navigate]);

  const sidebarItems = [
    { id: 'insights', label: 'Neural Insights', icon: Activity, color: 'text-cyan-400' },
    { id: 'internships', label: 'Internship Ops', icon: Zap, color: 'text-amber-400' },
    { id: 'requests', label: 'Project Requests', icon: MessageSquare, color: 'text-amber-400' },
    { id: 'projects', label: 'Project Forge', icon: Cpu, color: 'text-purple-400' },
    { id: 'applications', label: 'Applications', icon: FileText, color: 'text-amber-400' },
    { id: 'revenue', label: 'Revenue Vault', icon: Shield, color: 'text-emerald-400' },
    { id: 'system', label: 'System Core', icon: Settings, color: 'text-blue-400' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020205] flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
             <Terminal className="w-8 h-8 text-cyan-400 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020205] flex items-center justify-center text-center p-6">
        <div className="space-y-6">
          <div className="w-24 h-24 rounded-full glass border border-red-500/20 flex items-center justify-center mx-auto text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
            <Shield className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className="font-display text-4xl font-black text-white uppercase tracking-tighter">Access Denied</h1>
          <p className="text-white/40 font-sans max-w-sm mx-auto">Your current identity array is not authorized for Core-Level privileges. Please contact system architect.</p>
          <button onClick={() => navigate('/')} className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-display text-[10px] uppercase font-black tracking-widest hover:bg-white hover:text-black transition-all mt-4">
            Return to Surface
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020205] text-white flex font-sans selection:bg-cyan-400/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:relative z-[100] h-screen bg-[#050508]/80 backdrop-blur-2xl border-r border-white/5 transition-all duration-500 flex flex-col",
          isSidebarOpen ? "w-80" : "w-0 lg:w-24 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-8 pb-12 flex items-center gap-4 overflow-hidden h-32 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div className={cn("transition-opacity duration-300", isSidebarOpen ? "opacity-100" : "opacity-0 invisible")}>
            <h1 className="font-display font-black text-xl leading-none tracking-tighter">VSS <span className="text-cyan-400">CORE</span></h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 mt-1">Admin OS v2.4.0</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-3 overflow-y-auto hide-scrollbar">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={cn(
                "w-full group relative flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all duration-300",
                activeView === item.id 
                  ? "bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.02)]" 
                  : "text-white/40 hover:text-white"
              )}
            >
              {activeView === item.id && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute inset-0 bg-white/5 border border-white/10 rounded-[2rem]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <item.icon className={cn(
                "w-6 h-6 transition-all duration-300 relative z-10",
                activeView === item.id ? item.color : "group-hover:scale-110 font-bold"
              )} />
              <span className={cn(
                "font-display text-[11px] font-black uppercase tracking-[0.2em] relative z-10 transition-opacity whitespace-nowrap",
                isSidebarOpen ? "opacity-100" : "opacity-0 invisible"
              )}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-white/5 shrink-0 overflow-hidden">
          <button 
            onClick={() => {
              localStorage.removeItem('vss_dev_login');
              supabase.auth.signOut();
            }}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 text-white/40 hover:bg-red-500 hover:text-white transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className={cn("font-display text-[10px] font-black uppercase tracking-widest", isSidebarOpen ? "block" : "hidden")}>Eject Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-32 border-b border-white/5 flex items-center justify-between px-12 bg-transparent shrink-0">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-3 bg-white/5 rounded-xl border border-white/10"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
               <p className="text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.3em] mb-1">Current Node</p>
               <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                 {sidebarItems.find(i => i.id === activeView)?.label}
               </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-6 py-3 bg-white/5 rounded-3xl border border-white/10">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
              <div className="text-right">
                <p className="font-display text-[10px] font-black uppercase tracking-widest leading-none mb-1">Admin Identity</p>
                <p className="text-sm font-sans text-white/60">{user?.email}</p>
              </div>
            </div>
            <button className="p-4 rounded-[1.5rem] bg-white/5 border border-white/10 hover:border-cyan-400/30 transition-all group relative">
               <Bell className="w-6 h-6 text-white/40 group-hover:text-cyan-400" />
               <div className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full border border-black" />
            </button>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-12 hide-scrollbar">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeView === 'insights' && <NeuralInsights key="insights" />}
              {activeView === 'internships' && <InternshipOps key="internships" />}
              {activeView === 'requests' && <ProjectRequestOps key="requests" />}
              {activeView === 'projects' && <ProjectForge key="projects" />}
              {activeView === 'applications' && <ApplicationOps key="applications" />}
              {activeView === 'revenue' && <RevenueVault key="revenue" />}
              {activeView === 'system' && <SystemCore key="system" />}
            </AnimatePresence>
          </div>
        </section>

        {/* Global UI Decoration */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 px-6 py-2 glass rounded-full border border-white/10 opacity-40 pointer-events-none">
           <Zap className="w-3 h-3 text-cyan-400" />
           <span className="font-mono text-[8px] uppercase tracking-widest">Neural Link Synchronized</span>
        </div>
      </main>
    </div>
  );
}
