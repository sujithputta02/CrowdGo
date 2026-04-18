"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ArrowRight, 
  Mail, 
  Lock, 
  UserPlus, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  signInAnonymously, 
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/main');
    }
  }, [user, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/main');
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/wrong-password') {
        setError('Wrong password. Check your aura.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No fan found with this email. Sign up?');
      } else {
        setError(error.message || 'Failed to sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      router.push('/main');
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code === 'auth/account-exists-with-different-credential') {
        setError('Email already linked to another method. Try Email login.');
      } else {
        setError('Google sync failed. Try manual login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email first to reset aura.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Reset link sent! Check your inbox.');
    } catch (err: unknown) {
      setError('Failed to send reset email. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInAnonymously(auth);
      router.push('/main');
    } catch (err: unknown) {
      setError('Aura too low to enter anonymously. Try email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <main className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30">
              <Zap className="text-white w-7 h-7" fill="currentColor" />
            </div>
            <span className="text-4xl font-black tracking-tighter">Crowd<span className="gradient-text">Go</span></span>
          </div>
          <h1 className="text-5xl font-black mb-4 tracking-tighter leading-none uppercase">Get Your Aura Up.</h1>
          <p className="text-text-muted text-lg">Lock in to the ultimate match-day flow.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 border-white/5 shadow-2xl relative"
        >
          {error && (
             <motion.div 
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="mb-8 p-4 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-widest text-center"
               role="alert"
               aria-live="polite"
               aria-atomic="true"
             >
                {error}
             </motion.div>
          )}

          {message && (
             <motion.div 
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className="mb-8 p-4 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest text-center"
               role="status"
               aria-live="polite"
               aria-atomic="true"
             >
                {message}
             </motion.div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="email" className="sr-only">Email address</label>
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm"
                  required
                  aria-label="Email address"
                  aria-required="true"
                />
              </div>
              <div className="relative">
                <label htmlFor="password" className="sr-only">Password</label>
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" size={18} aria-hidden="true" />
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm"
                  required
                  aria-label="Password"
                  aria-required="true"
                />
              </div>
              <div className="text-right px-2">
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] font-black uppercase text-text-muted hover:text-primary transition-colors tracking-widest"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
              aria-busy={loading}
            >
              {loading ? 'LOCKING IN...' : 'CONTINUE W FLOW'}
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 bg-white text-black rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-background"
              aria-busy={loading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Login with Google
            </button>
            <button 
              onClick={handleAnonymousLogin}
              disabled={loading}
              className="w-full py-4 glass-card border-white/10 flex items-center justify-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-white/5 transition-all active:scale-[0.98] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-background"
              aria-busy={loading}
            >
              <UserPlus size={18} aria-hidden="true" />
              Experience Anonymously
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
             <p className="text-text-muted text-xs font-medium">
                New fan? <Link href="/signup" className="text-primary font-black hover:underline underline-offset-4">Join the W Flow</Link>
             </p>
          </div>

          <div className="mt-8 flex justify-center items-center gap-2 opacity-30">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secured by Firebase</span>
          </div>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-[10px] font-black uppercase text-text-muted tracking-[0.4em]"
        >
          {/* VERSION 1.1 // NO CAP */}
          VERSION 1.1 // NO CAP
        </motion.p>
      </main>
    </div>
  );
}
