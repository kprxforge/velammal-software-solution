import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit2, Trash2, Check, X, Clock, Zap,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Rocket, Database
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const DEFAULT_COURSES = [
  {
    title: "Python for Development",
    domain: "Programming / Software Development",
    duration: "2 Months",
    online_available: true,
    offline_available: true,
    level: "Beginner to Intermediate",
    original_price: 3000,
    fee: 2500,
    badge: "Most Popular",
    description: "Learn Python programming from scratch and build real-world development skills including automation, APIs, backend fundamentals, and mini-project development.",
    modules: ["Python Fundamentals","Variables & Data Types","Loops & Conditions","Functions & Modules","OOP Concepts","File Handling","APIs & JSON","Database Basics","Final Project"],
    tools: ["Python","VS Code","GitHub","SQLite"],
    features: ["Live mentorship","Practice tasks","Internship certificate","Placement guidance"],
    skills: ["Python","VS Code","GitHub","SQLite"],
    status: "Open",
    active: true,
    color: "#eab308",
  },
  {
    title: "Full Stack Web Development",
    domain: "Web Development",
    duration: "3 Months",
    online_available: true,
    offline_available: true,
    level: "Beginner to Advanced",
    original_price: 3000,
    fee: 2500,
    badge: "Trending",
    description: "Master frontend and backend development using modern technologies and build complete full-stack applications.",
    modules: ["HTML5","CSS3","JavaScript","Tailwind CSS","React Basics","Node.js","Express.js","REST APIs","MongoDB","Authentication"],
    tools: ["VS Code","GitHub","Postman","MongoDB Atlas"],
    features: ["Live coding sessions","Deployment training","Internship certificate","Resume support"],
    skills: ["React","Node.js","MongoDB","Tailwind"],
    status: "Open",
    active: true,
    color: "#22d3ee",
  },
  {
    title: "Data Analytics Internship",
    domain: "Analytics / AI",
    duration: "2 Months",
    online_available: true,
    offline_available: true,
    level: "Beginner to Advanced",
    original_price: 3000,
    fee: 2500,
    badge: "Future Tech",
    description: "Learn data analysis, visualization, dashboards, and business insights using modern analytics tools.",
    modules: ["Excel Fundamentals","Data Cleaning","Data Visualization","SQL Basics","Python for Analytics","Pandas & NumPy","Power BI Basics","Dashboard Creation","Analytics Final Project"],
    tools: ["Excel","Power BI","Python","Pandas","NumPy"],
    features: ["Industry datasets","Dashboard projects","Analytics case studies","Internship certificate"],
    skills: ["Python","SQL","Power BI","Excel"],
    status: "Open",
    active: true,
    color: "#c084fc",
  },
];

const emptyForm = {
  title: '', domain: '', duration: '', original_price: 3000, fee: 2500,
  badge: '', level: '', online_available: true, offline_available: true,
  description: '', modules: '', tools: '', features: '', skills: '',
  status: 'Open', active: true, color: '#22d3ee', iconName: 'Code',
};

export default function InternshipOps() {
  const [internships, setInternships] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<any>(emptyForm);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetch = async () => {
      // Try with created_at ordering first, fall back to no ordering
      let { data, error } = await supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Order by created_at failed, retrying without order:', error.message);
        // Fallback: fetch without ordering
        const res = await supabase.from('internships').select('*');
        data = res.data;
        if (res.error) {
          console.error('Internships fetch error:', res.error.message, res.error.details);
        }
      }

      console.log('Fetched internships:', data?.length ?? 0, data);
      setInternships(data || []);
    };
    fetch();
    const sub = supabase.channel('internships_ops')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'internships' }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, []);

  // Deploy New Program — auto-seeds 3 default courses
  const handleDeployNewProgram = async () => {
    setIsDeploying(true);
    try {
      let inserted = 0, skipped = 0;
      for (const course of DEFAULT_COURSES) {
        const { data: existing, error: fetchErr } = await supabase
          .from('internships').select('id').eq('title', course.title).maybeSingle();
        if (fetchErr) {
          console.error('Fetch check error:', fetchErr.message, fetchErr.details);
        }
        if (!existing) {
          // Do NOT send createdAt — let Supabase use created_at DEFAULT NOW()
          const { error } = await supabase.from('internships').insert({ ...course });
          if (error) {
            console.error('Insert error:', error.message, error.details, error.hint);
            throw new Error(error.message);
          }
          console.log('✅ Inserted:', course.title);
          inserted++;
        } else {
          console.log('⏭️ Already exists:', course.title);
          skipped++;
        }
      }
      if (inserted > 0) {
        showToast('success', `✅ ${inserted} program(s) deployed successfully!${skipped > 0 ? ` (${skipped} already existed)` : ''}`);
      } else {
        showToast('success', 'ℹ️ Programs already deployed — all 3 courses exist.');
      }
    } catch (err: any) {
      console.error('Deploy failed:', err);
      showToast('error', `❌ Deploy failed: ${err?.message || 'Unknown error'}. Check browser console.`);
    } finally {
      setIsDeploying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toArr = (v: any) => Array.isArray(v) ? v : (v || '').split(',').map((s: string) => s.trim()).filter(Boolean);
    const data = { ...formData, skills: toArr(formData.skills), modules: toArr(formData.modules), tools: toArr(formData.tools), features: toArr(formData.features) };
    try {
      if (editingId) {
        const { error } = await supabase.from('internships').update(data).eq('id', editingId);
        if (error) throw new Error(error.message);
        showToast('success', '✅ Course updated!');
        setEditingId(null);
      } else {
        // No createdAt — let Supabase handle created_at automatically
        const { error } = await supabase.from('internships').insert({ ...data });
        if (error) throw new Error(error.message);
        showToast('success', '✅ New course deployed!');
        setIsAdding(false);
      }
      setFormData(emptyForm);
    } catch (err: any) {
      showToast('error', `❌ Save failed: ${err?.message}`);
    }
  };

  const deleteCourse = async (id: string) => {
    await supabase.from('internships').delete().eq('id', id);
    setDeletingId(null);
    showToast('success', 'Course removed.');
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('internships').update({ active: !current }).eq('id', id);
  };

  const startEdit = (job: any) => {
    setEditingId(job.id);
    setFormData({
      ...emptyForm, ...job,
      modules: Array.isArray(job.modules) ? job.modules.join(', ') : job.modules || '',
      tools: Array.isArray(job.tools) ? job.tools.join(', ') : job.tools || '',
      features: Array.isArray(job.features) ? job.features.join(', ') : job.features || '',
      skills: Array.isArray(job.skills) ? job.skills.join(', ') : job.skills || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const field = (label: string, node: React.ReactNode) => (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">{label}</label>
      {node}
    </div>
  );

  const inp = (props: any) => (
    <input {...props} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans text-sm" />
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-black text-white uppercase tracking-tighter">Internship Operations</h2>
          <p className="text-white/40 text-sm mt-1">Deploy and manage internship programs. Auto-synced with user pages.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={cn("px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border",
                  toast.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                )}
              >
                {toast.text}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex items-center gap-3">
            {/* Deploy New Program — auto-seeds 3 courses */}
            <button
              onClick={handleDeployNewProgram}
              disabled={isDeploying}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-display text-[10px] font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 shadow-[0_0_25px_rgba(34,211,238,0.3)]"
            >
              {isDeploying ? (
                <><span className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Deploying...</>
              ) : (
                <><Rocket className="w-4 h-4" /> Deploy New Program</>
              )}
            </button>
            {/* Add Custom Course */}
            <button
              onClick={() => { setIsAdding(true); setEditingId(null); setFormData(emptyForm); }}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white font-display text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
            >
              <Plus className="w-4 h-4" /> Custom Course
            </button>
          </div>
        </div>
      </div>

      {/* Info banner when no courses */}
      {internships.length === 0 && !isAdding && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-[2rem] border border-dashed border-cyan-400/20 bg-cyan-400/5 p-10 text-center space-y-4"
        >
          <Database className="w-12 h-12 text-cyan-400/30 mx-auto" />
          <p className="font-display text-sm font-black text-white/30 uppercase tracking-widest">No Programs Deployed Yet</p>
          <p className="text-white/20 text-sm">Click <span className="text-cyan-400 font-bold">Deploy New Program</span> to instantly add the 3 default courses to the database.</p>
        </motion.div>
      )}

      {/* Form Panel */}
      <AnimatePresence>
        {(isAdding || editingId) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="glass rounded-[2.5rem] p-8 md:p-10 border border-white/10"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="font-display text-xl font-black text-white uppercase tracking-tight">
                {editingId ? 'Edit Course' : 'New Custom Course'}
              </h3>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                {field('Course Title', inp({ required: true, value: formData.title, onChange: (e: any) => setFormData({ ...formData, title: e.target.value }), placeholder: 'e.g. Python for Development' }))}
                {field('Category / Domain', inp({ required: true, value: formData.domain, onChange: (e: any) => setFormData({ ...formData, domain: e.target.value }), placeholder: 'e.g. Web Development' }))}
                {field('Duration', inp({ required: true, value: formData.duration, onChange: (e: any) => setFormData({ ...formData, duration: e.target.value }), placeholder: '2 Months' }))}
                {field('Level', inp({ value: formData.level, onChange: (e: any) => setFormData({ ...formData, level: e.target.value }), placeholder: 'Beginner to Advanced' }))}
                {field('Badge', inp({ value: formData.badge, onChange: (e: any) => setFormData({ ...formData, badge: e.target.value }), placeholder: 'Most Popular' }))}
                <div className="grid grid-cols-2 gap-4">
                  {field('Offer Price (₹)', inp({ type: 'number', required: true, value: formData.fee, onChange: (e: any) => setFormData({ ...formData, fee: Number(e.target.value) }) }))}
                  {field('Original Price (₹)', inp({ type: 'number', value: formData.originalPrice, onChange: (e: any) => setFormData({ ...formData, originalPrice: Number(e.target.value) }) }))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <input type="checkbox" checked={formData.online_available} onChange={e => setFormData({ ...formData, online_available: e.target.checked })} className="w-4 h-4 accent-cyan-400" />
                    <span className="text-white text-sm font-sans">Online</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3.5 rounded-2xl bg-white/5 border border-white/10">
                    <input type="checkbox" checked={formData.offline_available} onChange={e => setFormData({ ...formData, offline_available: e.target.checked })} className="w-4 h-4 accent-cyan-400" />
                    <span className="text-white text-sm font-sans">Offline</span>
                  </label>
                </div>
              </div>
              <div className="space-y-5">
                {field('Description', <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans text-sm resize-none" />)}
                {field('Syllabus / Modules (comma-separated)', inp({ value: formData.modules, onChange: (e: any) => setFormData({ ...formData, modules: e.target.value }), placeholder: 'Module 1, Module 2, ...' }))}
                {field('Tools (comma-separated)', inp({ value: formData.tools, onChange: (e: any) => setFormData({ ...formData, tools: e.target.value }), placeholder: 'Python, VS Code, GitHub' }))}
                {field('Skills (comma-separated)', inp({ value: formData.skills, onChange: (e: any) => setFormData({ ...formData, skills: e.target.value }), placeholder: 'React, Node.js' }))}
                {field('Features (comma-separated)', inp({ value: formData.features, onChange: (e: any) => setFormData({ ...formData, features: e.target.value }), placeholder: 'Certificate, Mentorship' }))}
                <div className="grid grid-cols-2 gap-4">
                  {field('Status', (
                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:outline-none focus:border-cyan-400 transition-all font-sans text-sm">
                      <option value="Open">Open</option>
                      <option value="Closing Soon">Closing Soon</option>
                      <option value="Closed">Closed</option>
                    </select>
                  ))}
                  {field('Color', <input type="color" value={formData.color} onChange={e => setFormData({ ...formData, color: e.target.value })} className="w-full h-[52px] bg-white/5 border border-white/10 rounded-2xl cursor-pointer" />)}
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-7 py-3 border border-white/10 rounded-2xl text-white/40 font-display text-[10px] font-black uppercase hover:text-white transition-all">
                    Cancel
                  </button>
                  <button type="submit" className="px-7 py-3 bg-cyan-400 text-black rounded-2xl font-display text-[10px] font-black uppercase hover:bg-white transition-all">
                    {editingId ? 'Update Course' : 'Deploy Course'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {internships.map((job) => (
            <motion.div
              key={job.id} layout
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass rounded-[2rem] border border-white/5 hover:border-white/10 transition-all relative overflow-hidden flex flex-col"
            >
              {/* Color accent */}
              <div className="h-1 w-full rounded-t-[2rem]" style={{ background: `linear-gradient(90deg, ${job.color}80, transparent)` }} />

              <div className="p-7 flex flex-col flex-1">
                {/* Top row */}
                <div className="flex justify-between items-start mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border" style={{ borderColor: `${job.color}30` }}>
                    <Clock className="w-6 h-6" style={{ color: job.color }} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(job)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-cyan-400 transition-all">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {deletingId === job.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => deleteCourse(job.id)} className="px-3 py-1.5 rounded-xl bg-red-500 text-white text-[10px] font-black uppercase">Confirm</button>
                        <button onClick={() => setDeletingId(null)} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase">Cancel</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeletingId(job.id)} className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Badge */}
                {job.badge && (
                  <div className="inline-flex mb-3">
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border"
                      style={{ color: job.color, borderColor: `${job.color}30`, backgroundColor: `${job.color}10` }}>
                      {job.badge}
                    </span>
                  </div>
                )}

                <h3 className="font-display text-lg font-bold text-white mb-1 leading-tight">{job.title}</h3>
                <p className="font-sans text-[10px] text-white/30 uppercase tracking-widest mb-1">{job.domain}</p>
                <p className="text-white/20 text-xs mb-4">{job.duration} • {job.level}</p>

                {/* Pricing */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-display text-2xl font-black text-white">₹{job.fee?.toLocaleString()}</span>
                  {job.originalPrice && job.originalPrice > job.fee && (
                    <span className="font-sans text-sm text-white/30 line-through">₹{job.original_price?.toLocaleString()}</span>
                  )}
                </div>

                {/* Mode badges */}
                <div className="flex gap-2 mb-4">
                  {job.online_available && <span className="px-2.5 py-1 rounded-lg bg-cyan-400/10 text-cyan-400 text-[10px] font-black uppercase tracking-wider">Online</span>}
                  {job.offline_available && <span className="px-2.5 py-1 rounded-lg bg-purple-400/10 text-purple-400 text-[10px] font-black uppercase tracking-wider">Offline</span>}
                </div>

                {/* Syllabus expand */}
                {job.modules?.length > 0 && (
                  <div className="mb-4">
                    <button
                      onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
                      className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                    >
                      {expandedId === job.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      Syllabus ({job.modules.length} modules)
                    </button>
                    <AnimatePresence>
                      {expandedId === job.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {job.modules.map((m: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-white/50 text-[10px] font-sans">{m}</span>
                            ))}
                          </div>
                          {job.tools?.length > 0 && (
                            <div className="mt-3">
                              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1.5">Tools</p>
                              <div className="flex flex-wrap gap-1.5">
                                {job.tools.map((t: string, i: number) => (
                                  <span key={i} className="px-2.5 py-1 rounded-lg text-[10px] font-sans" style={{ backgroundColor: `${job.color}15`, color: job.color }}>{t}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                  <button onClick={() => toggleActive(job.id, job.active)} className="flex items-center gap-2 group">
                    {job.active
                      ? <ToggleRight className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                      : <ToggleLeft className="w-6 h-6 text-white/20 group-hover:scale-110 transition-transform" />}
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", job.active ? "text-emerald-400" : "text-white/20")}>
                      {job.active ? 'Live' : 'Hidden'}
                    </span>
                  </button>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    job.status === 'Open' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                    job.status === 'Closing Soon' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                    "bg-red-500/10 border-red-500/20 text-red-400"
                  )}>
                    {job.status}
                  </span>
                </div>
              </div>

              {/* Glow */}
              <div className="absolute -bottom-16 -right-16 w-40 h-40 rounded-full opacity-5 blur-[60px] pointer-events-none" style={{ backgroundColor: job.color }} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
