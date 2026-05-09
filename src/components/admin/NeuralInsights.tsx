import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, Users, Briefcase, CreditCard, Code2, 
  ArrowUpRight, ArrowDownRight, Activity, Zap, Globe 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const mockData = [
  { name: 'Mon', apps: 4, revenue: 2400 },
  { name: 'Tue', apps: 7, revenue: 1398 },
  { name: 'Wed', apps: 5, revenue: 9800 },
  { name: 'Thu', apps: 9, revenue: 3908 },
  { name: 'Fri', apps: 12, revenue: 4800 },
  { name: 'Sat', apps: 15, revenue: 3800 },
  { name: 'Sun', apps: 20, revenue: 4300 },
];

export default function NeuralInsights() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeInternships: 0,
    projectRequests: 0,
    totalRevenue: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      // Total Students (Internship Applications)
      const { count: studentCount } = await supabase
        .from('internship_applications')
        .select('*', { count: 'exact', head: true });

      // Active Internships
      const { count: internshipCount } = await supabase
        .from('internships')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      // Project Requests
      const { count: projectCount } = await supabase
        .from('project_requests')
        .select('*', { count: 'exact', head: true });

      // Total Revenue (Verified Internships + Verified Transactions)
      const { data: verifiedInt } = await supabase
        .from('internship_applications')
        .select('internshipFee')
        .eq('paymentStatus', 'verified');
      
      const { data: verifiedTx } = await supabase
        .from('transactions')
        .select('price')
        .eq('status', 'verified');

      const intRevenue = (verifiedInt || []).reduce((acc, curr) => acc + (curr.internshipFee || 0), 0);
      const txRevenue = (verifiedTx || []).reduce((acc, curr) => acc + (curr.price || 0), 0);

      setStats({
        totalStudents: studentCount || 0,
        activeInternships: internshipCount || 0,
        projectRequests: projectCount || 0,
        totalRevenue: intRevenue + txRevenue,
      });
    };

    fetchStats();

    const channel = supabase.channel('insights_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'internship_applications' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'internships' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'project_requests' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-4xl font-bold text-white uppercase tracking-tighter mb-2">Neural Insights</h2>
          <p className="text-white/40 text-sm">Real-time telemetry and predictive performance metrics.</p>
        </div>
        <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
          <button className="px-5 py-2 rounded-xl bg-white/10 text-white text-[10px] font-black uppercase tracking-widest">Real-time</button>
          <button className="px-5 py-2 rounded-xl text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Historical</button>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Network Entities', value: stats.totalStudents, icon: Users, color: '#22d3ee', trend: '+12%', up: true },
          { label: 'Active Protocols', value: stats.activeInternships, icon: Zap, color: '#fbbf24', trend: '+4%', up: true },
          { label: 'Project Blueprints', value: stats.projectRequests, icon: Code2, color: '#c084fc', trend: '+18%', up: true },
          { label: 'Revenue Vault', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: CreditCard, color: '#10b981', trend: '+32%', up: true },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-[2.5rem] p-8 border border-white/5 hover:border-white/10 transition-all relative overflow-hidden group"
          >
            <div className="relative z-10 space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div className={cn("flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full", stat.up ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10")}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.trend}
                </div>
              </div>
              <div>
                <p className="font-display text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">{stat.label}</p>
                <h3 className="font-display text-4xl font-bold text-white tracking-tighter">{stat.value}</h3>
              </div>
            </div>
            <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full opacity-5 blur-[60px]" style={{ backgroundColor: stat.color }} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Main Chart */}
        <div className="glass rounded-[3rem] p-10 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-display text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Application Velocity
            </h3>
            <select className="bg-transparent text-[10px] font-black text-white/40 uppercase tracking-widest border-none focus:ring-0 cursor-pointer">
              <option>Last 7 Cycles</option>
              <option>Last 30 Cycles</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0a0a10', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="apps" 
                  stroke="#22d3ee" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorApps)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distributed Load */}
        <div className="glass rounded-[3rem] p-10 border border-white/5 bg-gradient-to-br from-white/[0.01] to-transparent">
          <div className="flex items-center justify-between mb-10">
            <h3 className="font-display text-xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
              <Activity className="w-5 h-5 text-purple-400" />
              Node Distribution
            </h3>
          </div>

          <div className="space-y-8">
            {[
              { label: 'Blockchain Core', percentage: 72, color: '#c084fc' },
              { label: 'Neural Web Architect', percentage: 48, color: '#f472b6' },
              { label: 'Quantum DevSecOps', percentage: 35, color: '#2dd4bf' },
              { label: 'Cyber Security Node', percentage: 64, color: '#fbbf24' },
            ].map((item, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="font-display text-[10px] font-black text-white uppercase tracking-widest">{item.label}</span>
                  <span className="font-mono text-[10px] text-white/40">{item.percentage}% Load</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1.5, delay: i * 0.2 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color, boxShadow: `0 0 15px ${item.color}40` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 animate-pulse">
              <Globe className="w-8 h-8" />
            </div>
            <div>
              <p className="font-display text-sm font-bold text-white uppercase tracking-tight">AI Optimization Active</p>
              <p className="text-xs text-white/30 font-sans">The system is automatically rebalancing client traffic across high-performance zones.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
