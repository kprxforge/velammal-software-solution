import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Edit2, Trash2, Check, X, Shield, Clock, IndianRupee, 
  ToggleLeft, ToggleRight, Search, LayoutGrid, List
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function InternshipOps() {
  const [internships, setInternships] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    domain: '',
    duration: '',
    originalPrice: 3000,
    fee: 2500,
    badge: '',
    level: '',
    onlineAvailable: true,
    offlineAvailable: true,
    description: '',
    modules: '',
    tools: '',
    features: '',
    skills: '',
    status: 'Open',
    active: true,
    color: '#22d3ee',
    iconName: 'Code'
  });

  useEffect(() => {
    const fetchInternships = async () => {
      const { data, error } = await supabase.from('internships').select('*').order('createdAt', { ascending: false });
      if (data) {
        setInternships(data);
        // Auto-seed if empty
        if (data.length === 0) {
          seedCourses();
        }
      }
    };

    fetchInternships();

    const subscription = supabase.channel('internships_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'internships' }, fetchInternships)
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, []);

  const seedCourses = async () => {
    const seedData = [
      {
        title: "Python for Development",
        domain: "Programming / Software Development",
        originalPrice: 3000,
        fee: 2500,
        badge: "Most Popular",
        duration: "2 Months",
        onlineAvailable: true,
        offlineAvailable: true,
        level: "Beginner to Intermediate",
        description: "Learn Python programming from scratch and build real-world development skills including automation, APIs, backend fundamentals, and mini-project development.",
        modules: [
          "Python Fundamentals", "Variables & Data Types", "Loops & Conditions", "Functions & Modules", 
          "OOP Concepts", "File Handling", "Exception Handling", "APIs & JSON", 
          "Database Basics", "Python Mini Projects", "Final Real-Time Project"
        ],
        tools: ["Python", "VS Code", "GitHub", "SQLite"],
        features: [
          "Live mentorship", "Practice tasks", "Internship certificate", "Placement guidance"
        ],
        skills: ["Python", "VS Code", "GitHub", "SQLite"],
        status: "Open",
        active: true,
        color: "#eab308"
      },
      {
        title: "Full Stack Web Development",
        domain: "Web Development",
        originalPrice: 3000,
        fee: 2500,
        badge: "Trending",
        duration: "3 Months",
        onlineAvailable: true,
        offlineAvailable: true,
        level: "Beginner to Advanced",
        description: "Master frontend and backend development using modern technologies and build complete full-stack applications.",
        modules: [
          "HTML5", "CSS3", "JavaScript", "Tailwind CSS", "React Basics",
          "Node.js", "Express.js", "REST APIs", "Authentication", "MongoDB"
        ],
        tools: ["VS Code", "GitHub", "Postman", "MongoDB Atlas"],
        features: [
          "Live coding sessions", "Deployment training", "Internship certificate", "Resume support"
        ],
        skills: ["React", "Node.js", "MongoDB", "Tailwind"],
        status: "Open",
        active: true,
        color: "#22d3ee"
      },
      {
        title: "Data Analytics Internship",
        domain: "Analytics / AI",
        originalPrice: 3000,
        fee: 2500,
        badge: "Future Tech",
        duration: "2 Months",
        onlineAvailable: true,
        offlineAvailable: true,
        level: "Beginner to Advanced",
        description: "Learn data analysis, visualization, dashboards, and business insights using modern analytics tools.",
        modules: [
          "Introduction to Data Analytics", "Excel Fundamentals", "Data Cleaning", 
          "Data Visualization", "SQL Basics", "Python for Analytics", "Pandas & NumPy", 
          "Power BI Basics", "Dashboard Creation", "Business Insights", "Analytics Final Project"
        ],
        tools: ["Excel", "Power BI", "Python", "Pandas", "NumPy"],
        features: [
          "Industry datasets", "Dashboard projects", "Analytics case studies", 
          "Internship certificate", "AI learning support"
        ],
        skills: ["Python", "SQL", "Power BI", "Excel"],
        status: "Open",
        active: true,
        color: "#c084fc"
      }
    ];

    for (const course of seedData) {
      // Check if course exists first to avoid duplicates
      const { data: existing } = await supabase.from('internships').select('id').eq('title', course.title).single();
      if (!existing) {
        await supabase.from('internships').insert({ ...course, createdAt: new Date().toISOString() });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      skills: typeof formData.skills === 'string' ? formData.skills.split(',').map(s => s.trim()).filter(s => s) : formData.skills,
      modules: typeof formData.modules === 'string' ? formData.modules.split(',').map(s => s.trim()).filter(s => s) : formData.modules,
      tools: typeof formData.tools === 'string' ? formData.tools.split(',').map(s => s.trim()).filter(s => s) : formData.tools,
      features: typeof formData.features === 'string' ? formData.features.split(',').map(s => s.trim()).filter(s => s) : formData.features,
    };

    try {
      if (editingId) {
        await supabase.from('internships').update(data).eq('id', editingId);
        setEditingId(null);
      } else {
        await supabase.from('internships').insert({ ...data, createdAt: new Date().toISOString() });
        setIsAdding(false);
      }
      setFormData({
        title: '',
        domain: '',
        duration: '',
        originalPrice: 3000,
        fee: 2500,
        badge: '',
        level: '',
        onlineAvailable: true,
        offlineAvailable: true,
        description: '',
        modules: '',
        tools: '',
        features: '',
        skills: '',
        status: 'Open',
        active: true,
        color: '#22d3ee',
        iconName: 'Code'
      });
    } catch (error) {
      console.error("Error saving internship:", error);
    }
  };

  const deleteInternship = async (id: string) => {
    await supabase.from('internships').delete().eq('id', id);
    setDeletingId(null);
  };

  const toggleStatus = async (id: string, current: boolean) => {
    await supabase.from('internships').update({ active: !current }).eq('id', id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-2xl font-bold text-white uppercase tracking-tight">Internship Operations</h2>
          <p className="text-white/40 text-sm">Deploy and manage the next generation of talent.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={seedCourses}
            className="flex items-center gap-2 px-6 py-3 bg-purple-400/10 text-purple-400 border border-purple-400/20 font-display text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-purple-400/20 transition-all"
          >
            Seed Advanced Data
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-6 py-3 bg-cyan-400 text-black font-display text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
          >
            <Plus className="w-4 h-4" />
            Deploy New Program
          </button>
        </div>
      </div>

      {isAdding || editingId ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-[3rem] p-10 border border-white/10"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Program Title</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans"
                  placeholder="e.g. Frontend AI Architect"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Domain Network</label>
                <input 
                  required
                  value={formData.domain}
                  onChange={e => setFormData({...formData, domain: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans"
                  placeholder="e.g. Neural Networks / Web3"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Duration</label>
                <input 
                  required
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans"
                  placeholder="e.g. 6 Months"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Online Mode</label>
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all">
                    <input 
                      type="checkbox"
                      checked={formData.onlineAvailable}
                      onChange={e => setFormData({...formData, onlineAvailable: e.target.checked})}
                      className="w-5 h-5 accent-cyan-400"
                    />
                    <span className="font-sans text-white text-sm">Online Available</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Offline Mode</label>
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all">
                    <input 
                      type="checkbox"
                      checked={formData.offlineAvailable}
                      onChange={e => setFormData({...formData, offlineAvailable: e.target.checked})}
                      className="w-5 h-5 accent-cyan-400"
                    />
                    <span className="font-sans text-white text-sm">Offline Available</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Protocol Fee (₹)</label>
                  <input 
                    required
                    type="number"
                    value={formData.fee}
                    onChange={e => setFormData({...formData, fee: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Original Price (₹)</label>
                  <input 
                    required
                    type="number"
                    value={formData.originalPrice}
                    onChange={e => setFormData({...formData, originalPrice: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Badge</label>
                  <input 
                    value={formData.badge}
                    onChange={e => setFormData({...formData, badge: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Level</label>
                  <input 
                    value={formData.level}
                    onChange={e => setFormData({...formData, level: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans"
                  />
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Description</label>
                 <textarea 
                   rows={3}
                   value={formData.description}
                   onChange={e => setFormData({...formData, description: e.target.value})}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans"
                 />
              </div>

            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Tech Stack (comma separated)</label>
                <input 
                  required
                  value={formData.skills}
                  onChange={e => setFormData({...formData, skills: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans"
                  placeholder="React, PyTorch, Node.js"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Modules (comma separated)</label>
                <input 
                  value={formData.modules}
                  onChange={e => setFormData({...formData, modules: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans"
                  placeholder="Module 1, Module 2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Tools (comma separated)</label>
                <input 
                  value={formData.tools}
                  onChange={e => setFormData({...formData, tools: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans"
                  placeholder="Tool 1, Tool 2"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Features (comma separated)</label>
                <input 
                  value={formData.features}
                  onChange={e => setFormData({...formData, features: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans"
                  placeholder="Feature 1, Feature 2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Node Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans appearance-none"
                  >
                    <option value="Open">Open</option>
                    <option value="Closing Soon">Closing Soon</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Aesthetic Sync</label>
                  <input 
                    type="color"
                    value={formData.color}
                    onChange={e => setFormData({...formData, color: e.target.value})}
                    className="w-full h-[60px] bg-white/5 border border-white/10 rounded-2xl cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4 pt-6">
                <button 
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingId(null); }}
                  className="px-8 py-4 border border-white/10 rounded-2xl text-white/40 font-display text-[10px] font-black uppercase hover:text-white transition-all"
                >
                  Terminate
                </button>
                <button 
                  type="submit"
                  className="px-8 py-4 bg-cyan-400 text-black rounded-2xl font-display text-[10px] font-black uppercase hover:bg-white transition-all"
                >
                  {editingId ? 'Update Node' : 'Initialize Node'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.map((job) => (
          <div key={job.id} className="glass rounded-[2rem] p-8 border border-white/5 group hover:border-white/10 transition-all relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 text-glow-cyan"
                style={{ borderColor: `${job.color}30` }}
              >
                <Clock className="w-7 h-7" style={{ color: job.color }} />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setEditingId(job.id);
                    setFormData({
                      title: job.title || '',
                      domain: job.domain || '',
                      duration: job.duration || '',
                      originalPrice: job.originalPrice || 3000,
                      fee: job.fee || 2500,
                      badge: job.badge || '',
                      level: job.level || '',
                      onlineAvailable: job.onlineAvailable !== undefined ? job.onlineAvailable : true,
                      offlineAvailable: job.offlineAvailable !== undefined ? job.offlineAvailable : true,
                      description: job.description || '',
                      modules: Array.isArray(job.modules) ? job.modules.join(', ') : job.modules || '',
                      tools: Array.isArray(job.tools) ? job.tools.join(', ') : job.tools || '',
                      features: Array.isArray(job.features) ? job.features.join(', ') : job.features || '',
                      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || '',
                      status: job.status || 'Open',
                      active: job.active ?? true,
                      color: job.color || '#22d3ee',
                      iconName: job.iconName || 'Code'
                    });
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {deletingId === job.id ? (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => deleteInternship(job.id)}
                      className="p-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all font-display text-[10px] font-black uppercase tracking-widest"
                    >
                      Confirm
                    </button>
                    <button 
                      onClick={() => setDeletingId(null)}
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white transition-all font-display text-[10px] font-black uppercase tracking-widest"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setDeletingId(job.id)}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <h3 className="font-display text-xl font-bold text-white mb-1">{job.title}</h3>
            <p className="font-sans text-xs text-white/30 uppercase tracking-widest mb-6">{job.domain}</p>
            
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex items-center gap-2">
                {job.active ? (
                  <ToggleRight className="w-6 h-6 text-emerald-400 cursor-pointer" onClick={() => toggleStatus(job.id, job.active)} />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-white/20 cursor-pointer" onClick={() => toggleStatus(job.id, job.active)} />
                )}
                <span className={cn("text-[10px] font-black uppercase tracking-widest", job.active ? "text-emerald-400" : "text-white/20")}>
                  {job.active ? 'Active' : 'Offline'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-white font-bold text-lg">₹{job.fee}</span>
              </div>
            </div>

            <div 
              className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full opacity-5 blur-[60px]"
              style={{ backgroundColor: job.color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
