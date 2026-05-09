import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, LogIn, Github, Command, ShieldCheck, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, supabase } from '@/lib/supabase';

interface LoginProps {
  onLogin: () => void;
  guest?: boolean;
}

export default function Login({ onLogin, guest = false }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // Handle OAuth callback — if user is already authenticated when this page loads,
  // call onLogin and redirect to internships (this fires after Google OAuth redirect-back)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        onLogin();
        navigate('/internships', { replace: true });
      }
    });
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await signInWithGoogle();
      // Supabase OAuth redirects away, so the rest of the flow is handled upon callback.
      // But we call onLogin() just in case they're using a popup strategy (if configured).
      onLogin();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Developer Bypass for unauthorized domains
    const target = e.target as any;
    const email = target.querySelector('input[type="email"]')?.value;
    
    if (email === 'admin@vss.com') {
      setIsLoading(true);
      setTimeout(() => {
        localStorage.setItem('vss_dev_login', 'true');
        onLogin();
        navigate('/internships', { replace: true });
        setIsLoading(false);
      }, 1000);
      return;
    }

    setErrorMsg('Email/Password login is currently disabled by admin. Use admin@vss.com for dev bypass.');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050508]/60 backdrop-blur-2xl overflow-hidden p-6">
      {/* Dynamic Background Particles */}
      <div className="absolute inset-0 z-[-1] overflow-hidden opacity-30">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-100, 1000],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
            className="absolute w-[1px] h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
            style={{ left: `${Math.random() * 100}%` }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        className="w-full max-w-[480px] perspective-1000"
      >
        <div className="glass rounded-[2rem] p-10 md:p-14 relative overflow-hidden group border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
          {/* Holographic scanner effect */}
          <motion.div 
            animate={{ top: ['-100%', '200%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[100px] bg-gradient-to-b from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 pointer-events-none z-10"
          />
          
          <div className="text-center mb-12 relative">
            <motion.div
              animate={{ 
                rotateY: [0, 360],
                boxShadow: ['0 0 20px rgba(0,240,255,0.2)', '0 0 40px rgba(0,240,255,0.4)', '0 0 20px rgba(0,240,255,0.2)']
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto glass rounded-[1.5rem] flex items-center justify-center mb-8 border border-cyan-400/40 relative"
            >
              <ShieldCheck className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_10px_#00f0ff]" />
              <div className="absolute -inset-2 border border-white/5 rounded-[2rem] animate-pulse" />
            </motion.div>
            
            <h2 className="font-display text-4xl font-black text-white mb-3 tracking-tighter uppercase">
              {isLoading ? 'Decrypting...' : isLogin ? 'System Access' : 'Create Node'}
            </h2>
            <p className="font-sans text-white/40 uppercase tracking-[0.2em] text-[10px] font-bold">
              {guest ? 'Authentication Required to Proceed' : 'Secure Core Interface v3.0'}
            </p>
            {errorMsg && (
              <p className="font-sans text-red-400 uppercase tracking-[0.1em] text-[10px] font-bold mt-4 bg-red-400/10 py-2 px-4 rounded-xl border border-red-400/20">
                {errorMsg}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 relative z-20">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="font-display text-[10px] font-black uppercase tracking-widest text-cyan-400 ml-1">Identity Chain</label>
                  <input
                    type="text"
                    required
                    placeholder="FULL NAME"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-sans text-sm outline-none focus:border-cyan-400/50 transition-all placeholder:text-white/20 uppercase tracking-widest"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-2">
              <label className="font-display text-[10px] font-black uppercase tracking-widest text-cyan-400 ml-1">Communication ID</label>
              <div className="relative">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  required
                  placeholder="EMAIL@VELAMMAL.EDU"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-sans text-sm outline-none focus:border-cyan-400/50 transition-all placeholder:text-white/20 uppercase tracking-widest"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="font-display text-[10px] font-black uppercase tracking-widest text-cyan-400">Access Key</label>
                {isLogin && (
                  <button type="button" className="font-display text-[8px] font-bold text-purple-400 uppercase tracking-widest hover:text-white transition-colors">
                    Recovery Module
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-sans text-sm outline-none focus:border-cyan-400/50 transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(0,240,255,0.3)' }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="w-full bg-white text-[#050508] font-display font-black text-xs uppercase tracking-[0.3em] rounded-2xl py-5 flex items-center justify-center gap-3 transition-all relative overflow-hidden"
            >
              {isLoading ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Cpu className="w-4 h-4" />
                  </motion.div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{isLogin ? 'Initiate Login' : 'Register Node'}</span>
                </>
              )}
            </motion.button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-white/10" />
              <span className="font-display text-[8px] font-bold text-white/20 uppercase tracking-widest">Or Secure Link</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleGoogleLogin}
              className="w-full glass border border-white/10 rounded-2xl py-5 flex items-center justify-center gap-3 transition-all group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
              </svg>
              <span className="font-display text-[10px] font-bold text-white/70 group-hover:text-white uppercase tracking-[0.2em]">Continue with Google</span>
            </motion.button>
          </form>

          <p className="mt-10 text-center font-display text-[8px] font-bold text-white/30 uppercase tracking-[0.3em]">
            {isLogin ? "New user? " : "Existing node? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-400 hover:text-white transition-colors"
            >
              [{isLogin ? 'Register' : 'Login'}]
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
