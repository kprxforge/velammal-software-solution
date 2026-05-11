import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, LogOut, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Logo from '../ui/Logo';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('vss_dev_login');
    await supabase.auth.signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Internships', path: '/internships' },
    { name: 'Projects', path: '/projects' },
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={cn(
        'fixed w-full z-50 transition-all duration-300 top-0',
        isScrolled ? 'bg-[#050508]/80 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-5 md:py-6'
      )}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <Logo 
                size={isScrolled ? 64 : 88} 
                className="relative z-10 transition-all duration-300" 
              />
              <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            <div className="flex flex-col justify-center">
              <span className="font-display text-lg sm:text-2xl font-black tracking-[0.4em] uppercase text-white group-hover:text-cyan-400 transition-colors leading-none">
                Velammal
              </span>
              <span className="font-display text-[11px] sm:text-[13px] font-medium tracking-[0.2em] uppercase text-white/40 group-hover:text-white/60 transition-colors mt-1 hidden sm:block">
                Group of Institutions
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10 font-display text-xs sm:text-sm font-bold tracking-[0.2em] uppercase">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'transition-colors relative py-2 hover:text-cyan-400',
                  location.pathname === link.path ? 'text-cyan-400' : 'text-white'
                )}
              >
                {link.name}
              </Link>
            ))}
            
            {/* Login/Logout Button */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-6 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white font-display text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link to="/login">
                <button className="px-6 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400 hover:text-black font-display text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full bg-[#050508]/95 backdrop-blur-xl border-b border-white/10 flex flex-col py-6 px-6 gap-6 font-display text-xs font-bold tracking-widest uppercase"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  'transition-colors',
                  location.pathname === link.path ? 'text-cyan-400' : 'text-white/70 hover:text-white'
                )}
              >
                {link.name}
              </Link>
            ))}
            {isLoggedIn ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="inline-flex mt-2 px-6 py-2 border border-red-500/30 rounded-full text-red-400 hover:bg-red-500 hover:text-white transition-colors items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="inline-flex mt-2 px-6 py-2 border border-cyan-400/30 rounded-full text-cyan-400 hover:bg-cyan-400 hover:text-black transition-colors items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </div>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
