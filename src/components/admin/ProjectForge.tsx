import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Edit2, Trash2, Code2, Rocket, Layout, 
  ExternalLink, Sparkles, Filter, MoreVertical,
  CheckCircle2, Globe, Laptop
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default function ProjectForge() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    imageUrl: '',
    tech: '',
    active: true,
    featured: false,
  });

  useEffect(() => {
    const fetchProjects = async () => {
      let result = await supabase.from('projects').select('*').order('createdat', { ascending: false });
      if (result.error) {
        result = await supabase.from('projects').select('*').order('createdAt', { ascending: false });
      }

      if (result.data) {
        const normalized = result.data.map((prj: any) => ({
          ...prj,
          imageUrl: prj.imageurl || prj.imageUrl || '',
          createdAt: prj.createdat || prj.createdAt,
          tech: Array.isArray(prj.tech)
            ? prj.tech
            : typeof prj.tech === 'string'
            ? prj.tech.split(',').map((t: string) => t.trim()).filter(Boolean)
            : []
        }));
        setProjects(normalized);
      }
    };

    fetchProjects();

    const channel = supabase.channel('project_forge_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchProjects)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      imageurl: formData.imageUrl,
      tech: typeof formData.tech === 'string' ? formData.tech.split(',').map(t => t.trim()).filter(t => t) : formData.tech,
      active: formData.active,
      featured: formData.featured,
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('projects').update(data).eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase.from('projects').insert([data]);
        if (error) throw error;
        setIsAdding(false);
      }
      setFormData({
        title: '',
        description: '',
        price: 0,
        imageUrl: '',
        tech: '',
        active: true,
        featured: false,
      });
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display text-4xl font-bold text-white uppercase tracking-tighter mb-2">Project Forge</h2>
          <p className="text-white/40 text-sm">Orchestrate and deploy mission-critical innovation showcases.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-3 px-8 py-4 bg-purple-600 text-white font-display text-[10px] font-black uppercase tracking-widest rounded-3xl hover:bg-white hover:text-black transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] group"
        >
          <Rocket className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          Forge New Project
        </button>
      </div>

      {isAdding || editingId ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-[4rem] p-12 border border-white/10 shadow-[0_0_50px_rgba(168,85,247,0.1)]"
        >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Project Concept Name</label>
                <input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white focus:outline-none focus:border-purple-400 transition-all font-display font-bold text-lg"
                  placeholder="e.g. Project Orion"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Architectural Brief</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white focus:outline-none focus:border-purple-400 transition-all font-sans text-sm resize-none"
                  placeholder="Describe the neural framework..."
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Protocol Price (₹)</label>
                  <input 
                    required
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white focus:outline-none focus:border-purple-400 transition-all font-mono"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Deployment URL</label>
                  <input 
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white focus:outline-none focus:border-purple-400 transition-all font-sans text-xs"
                    placeholder="Visual Asset URL"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                 <button 
                    type="button" 
                    onClick={() => setFormData({...formData, featured: !formData.featured})}
                    className={cn("px-6 py-3 rounded-2xl flex items-center gap-3 font-display text-[10px] font-black uppercase tracking-widest transition-all", formData.featured ? "bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)]" : "bg-white/5 border border-white/10 text-white/50")}
                 >
                    <Sparkles className="w-4 h-4" />
                    Featured Protocol
                 </button>
              </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Tech Matrix (comma separated)</label>
                <input 
                  required
                  value={formData.tech}
                  onChange={e => setFormData({...formData, tech: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-5 text-white focus:outline-none focus:border-purple-400 transition-all font-sans"
                  placeholder="Solidity, Rust, React, WebGL"
                />
              </div>

              <div className="aspect-video w-full glass rounded-[2.5rem] border border-white/10 overflow-hidden relative group/preview">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <Layout className="w-12 h-12 text-white/10" />
                    <p className="font-display text-[10px] font-black text-white/20 uppercase tracking-widest">Asset Preview Required</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-6">
                <button 
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingId(null); }}
                  className="px-8 py-5 border border-white/10 rounded-3xl text-white/40 font-display text-[11px] font-black uppercase hover:text-white transition-all shadow-xl"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="px-12 py-5 bg-purple-600 text-white rounded-3xl font-display text-[11px] font-black uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                >
                  {editingId ? 'Update Blueprint' : 'Commit Blueprint'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {projects.map((prj) => (
          <motion.div 
            key={prj.id}
            whileHover={{ y: -10 }}
            className="glass rounded-[3rem] border border-white/5 overflow-hidden group hover:border-purple-400/30 transition-all flex flex-col"
          >
            <div className="aspect-[16/10] relative overflow-hidden">
              <img src={prj.imageUrl || 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop'} alt={prj.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020205] to-transparent opacity-60" />
              <div className="absolute top-6 right-6 flex gap-2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                <button 
                  onClick={() => {
                    setEditingId(prj.id);
                    setFormData({
                      title: prj.title,
                      description: prj.description,
                      price: prj.price,
                      imageUrl: prj.imageUrl || prj.imageurl || '',
                      tech: prj.tech.join(', '),
                      active: prj.active,
                      featured: prj.featured || false
                    });
                  }}
                  className="p-3 glass rounded-2xl border border-white/10 text-white/60 hover:text-purple-400 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                   onClick={async () => {
                     if (confirm('Erase this project blueprint?')) {
                       await supabase.from('projects').delete().eq('id', prj.id);
                     }
                   }}
                   className="p-3 glass rounded-2xl border border-white/10 text-white/60 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="p-10 flex-1 flex flex-col space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Laptop className="w-4 h-4 text-purple-400" />
                  <span className="font-display text-[10px] font-black text-purple-400 uppercase tracking-widest">Protocol Showcased</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">{prj.title}</h3>
                <p className="font-sans text-sm text-white/40 line-clamp-3 leading-relaxed">{prj.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {prj.tech?.slice(0, 3).map((t: string) => (
                  <span key={t} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg font-mono text-[10px] text-white/60">
                    {t}
                  </span>
                ))}
                {prj.tech?.length > 3 && (
                  <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg font-mono text-[10px] text-white/30">
                    +{prj.tech.length - 3}
                  </span>
                )}
              </div>

              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <div>
                   <p className="font-display text-[10px] font-black text-white/20 uppercase tracking-widest leading-none mb-1">Pricing Node</p>
                   <p className="font-display text-2xl font-bold text-white">₹{prj.price.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                   <button
                      onClick={async () => await supabase.from('projects').update({ featured: !prj.featured }).eq('id', prj.id)}
                      className={cn("p-2 rounded-full flex items-center transition-transform",
                        prj.featured ? "bg-amber-400/20 text-amber-400" : "bg-white/5 text-white/20"
                      )}
                   >
                      <Sparkles className="w-3.5 h-3.5" />
                   </button>
                   <button
                      onClick={async () => await supabase.from('projects').update({ active: !prj.active }).eq('id', prj.id)}
                      className={cn("px-4 py-1.5 rounded-full flex items-center gap-2 transition-transform",
                        prj.active ? "bg-emerald-400/10 border border-emerald-400/20" : "bg-white/5 border border-white/10"
                      )}
                   >
                      <div className={cn("w-1.5 h-1.5 rounded-full", prj.active ? "bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" : "bg-white/20")} />
                      <span className={cn("font-display text-[9px] font-black uppercase tracking-widest", prj.active ? "text-emerald-400" : "text-white/40")}>
                        {prj.active ? 'Live' : 'Authorize'}
                      </span>
                   </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
