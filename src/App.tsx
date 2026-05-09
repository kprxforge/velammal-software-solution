import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Internships from './pages/Internships';
import Projects from './pages/Projects';
import Admin from './pages/Admin';
import StarsCanvas from './components/canvas/StarsCanvas';
import { Toaster } from 'react-hot-toast';
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setAuthChecking(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#020205] flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-cyan-400/20 border-t-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="relative z-0 bg-primary w-screen min-h-screen cursor-default">
        <div className="fixed inset-0 z-[-1]">
          <StarsCanvas />
        </div>
        <Toaster position="top-right" toastOptions={{ 
          style: { background: '#09090b', color: '#fff', border: '1px solid #27272a' }
        }} />
        <Navbar />
        <main className="pt-20 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route 
              path="/login" 
              element={<Login onLogin={() => setIsLoggedIn(true)} />} 
            />
            <Route 
              path="/internships" 
              element={isLoggedIn ? <Internships /> : <Login guest onLogin={() => setIsLoggedIn(true)} />} 
            />
            <Route 
              path="/projects" 
              element={isLoggedIn ? <Projects /> : <Login guest onLogin={() => setIsLoggedIn(true)} />} 
            />
            <Route 
              path="/admin" 
              element={isLoggedIn ? <Admin /> : <Login guest onLogin={() => setIsLoggedIn(true)} />} 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
