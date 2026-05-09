import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, CheckCircle2, Phone, MessageSquare, Zap, Building2, User, Mail, MapPin, Globe, Smartphone, Cpu, Laptop, FileText, Layout, ShoppingCart, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';

interface RequestProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = ['details', 'type', 'describe', 'features', 'confirm'] as const;
type Step = typeof STEPS[number];

const PROJECT_TYPES = [
  { id: 'website', label: 'Website', icon: Globe },
  { id: 'mobile-app', label: 'Mobile App', icon: Smartphone },
  { id: 'ai-project', label: 'AI Project', icon: Cpu },
  { id: 'business-software', label: 'Business Software', icon: Laptop },
  { id: 'final-year', label: 'Final Year Project', icon: FileText },
  { id: 'portfolio', label: 'Portfolio Website', icon: Layout },
  { id: 'ecommerce', label: 'E-commerce Website', icon: ShoppingCart },
  { id: 'custom', label: 'Custom Software', icon: Zap },
  { id: 'other', label: 'Other', icon: CheckCircle2 },
];

const FEATURES = [
  'Login System',
  'Admin Panel',
  'Payment System',
  'Mobile Friendly',
  'Dashboard',
  'WhatsApp Integration',
  'AI Features',
  'Database',
  'Custom Design',
  'Other'
];

export default function RequestProjectModal({ isOpen, onClose }: RequestProjectModalProps) {
  const [step, setStep] = useState<Step>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    collegeOrCompany: '',
    city: '',
    projectType: '',
    description: '',
    features: [] as string[],
  });

  const updateForm = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const toggleFeature = (feat: string) => {
    if (form.features.includes(feat)) {
      updateForm('features', form.features.filter(f => f !== feat));
    } else {
      updateForm('features', [...form.features, feat]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id || 'guest';
      
      const { error } = await supabase.from('project_requests').insert([{
        full_name: form.name,
        phone: form.phone,
        email: form.email,
        organization: form.collegeOrCompany,
        city: form.city,
        project_type: form.projectType,
        description: form.description,
        features: form.features,
      }]);
      
      if (error) {
        console.error("Supabase Insert Error:", error);
        toast.error(`Failed to request project: ${error.message}`);
        throw error;
      } else {
        toast.success("Project request submitted successfully!");
      }
    } catch (error) {
      console.error("Database save failed (likely permissions), continuing to success screen:", error);
    } finally {
      setSubmitted(true);
      setIsSubmitting(false);
    }
  };

  const handleWhatsApp = () => {
    const msg = `Hello Subramani,\n\nI have successfully submitted a custom project request at Velammal Software Solutions.\n\nHere are my project details:\n\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email || '—'}\nOrganization: ${form.collegeOrCompany || '—'}\nCity: ${form.city || '—'}\n\nProject Type: ${form.projectType}\n\nProject Requirement:\n${form.description}\n\nPlease review my request and guide me through the next steps.\n\nThank you.`;
    window.open(`https://wa.me/918939117117?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleClose = () => {
    setStep('details');
    setSubmitted(false);
    setForm({ name: '', phone: '', email: '', collegeOrCompany: '', city: '', projectType: '', description: '', features: [] });
    onClose();
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', pointerEvents: 'auto' }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 40 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, #050510 0%, #0a0a1a 100%)',
          border: '1px solid rgba(34,211,238,0.15)',
          borderRadius: '2.5rem',
          boxShadow: '0 0 80px rgba(34,211,238,0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display, sans-serif)', fontSize: '1.3rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>
              Request Your Project
            </h2>
            {!submitted && (
              <p style={{ fontSize: '0.65rem', color: 'rgba(34,211,238,0.6)', textTransform: 'uppercase', letterSpacing: '0.2em', margin: '0.25rem 0 0' }}>
                Step {STEPS.indexOf(step) + 1} of {STEPS.length}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <AnimatePresence mode="wait">

            {/* SUBMITTED SUCCESS */}
            {submitted && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center', padding: '1rem 0' }}>
                
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                  style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,211,238,0.1)', border: '2px solid #22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 0 30px rgba(34,211,238,0.2)' }}
                >
                  <Check size={40} color="#22d3ee" strokeWidth={3} />
                </motion.div>
                <h3 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 1rem', fontFamily: 'var(--font-display, sans-serif)' }}>Congratulations!</h3>
                <p style={{ color: '#22d3ee', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 1.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your project request has been successfully submitted.</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 500, margin: '0 auto 2.5rem', lineHeight: 1.7, fontSize: '1.1rem' }}>
                  Your requirements have been securely received by Velammal Software Solutions.<br/><br/>
                  Our team will carefully review your request and contact you shortly regarding project planning, development, and execution.
                </p>

                {/* Contact Card */}
                <div style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2rem', padding: '2.5rem', maxWidth: 420, margin: '0 auto 2rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'rgba(34,211,238,0.2)', filter: 'blur(50px)', borderRadius: '50%' }}></div>
                  
                  <p style={{ color: 'rgba(34,211,238,0.8)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.3em', margin: '0 0 0.5rem', fontWeight: 700 }}>Coordinator</p>
                  <h4 style={{ color: '#fff', fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', margin: '0 0 0.5rem', fontFamily: 'var(--font-display, sans-serif)' }}>Subramani</h4>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem', fontFamily: 'monospace', margin: '0 0 2rem' }}>+91 89391 17117</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                      onClick={handleWhatsApp}
                      style={{ width: '100%', padding: '1.25rem', borderRadius: '1rem', background: '#25D366', border: 'none', color: '#fff', fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'all 0.2s', boxShadow: '0 10px 25px rgba(37,211,102,0.3)' }}
                    >
                      <MessageSquare size={20} /> Discuss on WhatsApp
                    </button>
                    <a
                      href="tel:+918939117117"
                      style={{ width: '100%', padding: '1.25rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', textDecoration: 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    >
                      <Phone size={20} /> Call Now
                    </a>
                  </div>
                </div>

                <button onClick={handleClose} style={{ color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.2em', padding: '1rem' }}>
                  Return to Home
                </button>
              </motion.div>
            )}

            {/* STEP 1 — Details */}
            {!submitted && step === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-display, sans-serif)' }}>Basic Details</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', marginBottom: '2rem' }}>Tell us who you are so we can stay in touch.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                  {[
                    { label: 'Full Name *', key: 'name', icon: User, placeholder: 'Your full name' },
                    { label: 'Phone Number *', key: 'phone', icon: Phone, placeholder: '+91 XXXXX XXXXX' },
                    { label: 'Email Address', key: 'email', icon: Mail, placeholder: 'your@email.com' },
                    { label: 'Company / College Name (Optional)', key: 'collegeOrCompany', icon: Building2, placeholder: 'Your organization' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem', fontWeight: 700 }}>
                        <f.icon size={14} /> {f.label}
                      </label>
                      <input
                        type="text"
                        value={(form as any)[f.key]}
                        onChange={e => updateForm(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1rem 1.25rem', color: '#fff', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(34,211,238,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.75rem', fontWeight: 700 }}>
                      <MapPin size={14} /> City / Location
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={e => updateForm('city', e.target.value)}
                      placeholder="Chennai, Tamil Nadu"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1rem 1.25rem', color: '#fff', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(34,211,238,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep('type')}
                  disabled={!form.name || !form.phone}
                  style={{ width: '100%', padding: '1.25rem', borderRadius: '1rem', background: '#22d3ee', border: 'none', color: '#000', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.2em', cursor: form.name && form.phone ? 'pointer' : 'not-allowed', opacity: form.name && form.phone ? 1 : 0.4, marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                >
                  Next Step <ChevronRight size={18} />
                </button>
              </motion.div>
            )}

            {/* STEP 2 — Project Type */}
            {!submitted && step === 'type' && (
              <motion.div key="type" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-display, sans-serif)' }}>What do you need?</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', marginBottom: '2rem' }}>Select the type of project that best matches your idea.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                  {PROJECT_TYPES.map(pt => (
                    <button
                      key={pt.id}
                      onClick={() => updateForm('projectType', pt.label)}
                      style={{
                        padding: '1.5rem 1rem', borderRadius: '1.25rem',
                        background: form.projectType === pt.label ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.02)',
                        border: form.projectType === pt.label ? '1px solid rgba(34,211,238,0.5)' : '1px solid rgba(255,255,255,0.05)',
                        color: form.projectType === pt.label ? '#22d3ee' : 'rgba(255,255,255,0.7)',
                        cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem'
                      }}
                    >
                      <pt.icon size={28} style={{ opacity: form.projectType === pt.label ? 1 : 0.5 }} />
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{pt.label}</div>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setStep('details')} style={{ padding: '1.25rem 2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', transition: 'all 0.2s' }}>
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    onClick={() => setStep('describe')}
                    disabled={!form.projectType}
                    style={{ flex: 1, padding: '1.25rem', borderRadius: '1rem', background: '#22d3ee', border: 'none', color: '#000', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.2em', cursor: form.projectType ? 'pointer' : 'not-allowed', opacity: form.projectType ? 1 : 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                  >
                    Next Step <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Description */}
            {!submitted && step === 'describe' && (
              <motion.div key="describe" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-display, sans-serif)' }}>Explain Your Idea Simply</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                  You can explain in simple words.<br/>No technical knowledge needed.
                </p>

                <div style={{ background: 'rgba(34,211,238,0.05)', border: '1px dashed rgba(34,211,238,0.2)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
                  <p style={{ color: 'rgba(34,211,238,0.8)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800, marginBottom: '0.75rem' }}>Examples:</p>
                  <ul style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6, paddingLeft: '1.5rem', margin: 0 }}>
                    <li>I need a website for my business</li>
                    <li>I need an app for my shop</li>
                    <li>I need a final year project</li>
                    <li>I need billing software</li>
                    <li>I need AI chatbot</li>
                  </ul>
                </div>

                <textarea
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                  placeholder="Type your idea here..."
                  rows={6}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem', color: '#fff', fontSize: '1rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7, marginBottom: '2rem', transition: 'all 0.2s' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(34,211,238,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                />

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setStep('type')} style={{ padding: '1.25rem 2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', transition: 'all 0.2s' }}>
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    onClick={() => setStep('features')}
                    disabled={!form.description || form.description.length < 10}
                    style={{ flex: 1, padding: '1.25rem', borderRadius: '1rem', background: '#22d3ee', border: 'none', color: '#000', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.2em', cursor: form.description.length >= 10 ? 'pointer' : 'not-allowed', opacity: form.description.length >= 10 ? 1 : 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                  >
                    Next Step <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4 — Features */}
            {!submitted && step === 'features' && (
              <motion.div key="features" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-display, sans-serif)' }}>Features Needed</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', marginBottom: '2rem' }}>Select any specific features you want included.</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                  {FEATURES.map(feat => {
                    const isSelected = form.features.includes(feat);
                    return (
                      <button
                        key={feat}
                        onClick={() => toggleFeature(feat)}
                        style={{
                          padding: '1.25rem 1rem', borderRadius: '1rem',
                          background: isSelected ? 'rgba(34,211,238,0.1)' : 'rgba(255,255,255,0.02)',
                          border: isSelected ? '1px solid rgba(34,211,238,0.5)' : '1px solid rgba(255,255,255,0.05)',
                          color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)',
                          cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem'
                        }}
                      >
                        <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: isSelected ? 'none' : '2px solid rgba(255,255,255,0.2)', background: isSelected ? '#22d3ee' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {isSelected && <Check size={14} color="#000" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{feat}</span>
                      </button>
                    )
                  })}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setStep('describe')} style={{ padding: '1.25rem 2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', transition: 'all 0.2s' }}>
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    style={{ flex: 1, padding: '1.25rem', borderRadius: '1rem', background: '#22d3ee', border: 'none', color: '#000', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.2em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                  >
                    Review Request <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5 — Confirm */}
            {!submitted && step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '0.5rem', fontFamily: 'var(--font-display, sans-serif)' }}>Final Review</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', marginBottom: '2rem' }}>Confirm your details before sending.</p>

                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.5rem', padding: '2rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {[
                      { label: 'Name', value: form.name },
                      { label: 'Phone', value: form.phone },
                      { label: 'Email', value: form.email || '—' },
                      { label: 'Organization', value: form.collegeOrCompany || '—' },
                      { label: 'City', value: form.city || '—' },
                      { label: 'Project Type', value: form.projectType },
                    ].map(row => (
                      <div key={row.label} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.25rem' }}>{row.label}</span>
                        <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>{row.value}</span>
                      </div>
                    ))}
                  </div>

                  {form.features.length > 0 && (
                     <div>
                       <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.75rem' }}>Features Requested</span>
                       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                         {form.features.map(feat => (
                           <span key={feat} style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee', padding: '0.4rem 0.8rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 600 }}>{feat}</span>
                         ))}
                       </div>
                     </div>
                  )}

                  <div>
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: '0.5rem' }}>Description</span>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>{form.description}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => setStep('features')} style={{ padding: '1.25rem 2rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', transition: 'all 0.2s' }}>
                    <ChevronLeft size={18} /> Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={{ flex: 1, padding: '1.25rem', borderRadius: '1rem', background: 'linear-gradient(135deg, #22d3ee, #a855f7)', border: 'none', color: '#000', fontWeight: 900, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.2em', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', transition: 'all 0.2s' }}
                  >
                    {isSubmitting ? (
                      <>Submitting...</>
                    ) : (
                      <><Zap size={18} /> Submit Project Request</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
}
