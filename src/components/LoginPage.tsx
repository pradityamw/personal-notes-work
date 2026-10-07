'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FolderKanban, ShieldCheck, Mail, Lock, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function LoginPage() {
  const { loginWithEmail, signUpWithEmail, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!email.trim()) return;

    if (isSignUp) {
      const res = await signUpWithEmail(email, password);
      if (res.error) {
        setStatusMessage({ text: res.error, isError: true });
      } else {
        setStatusMessage({ text: res.message || 'Akun berhasil dibuat!', isError: false });
      }
    } else {
      const res = await loginWithEmail(email, password);
      if (res.error) {
        setStatusMessage({ text: res.error, isError: true });
      } else {
        setStatusMessage({ text: res.message || 'Login berhasil!', isError: false });
      }
    }
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand */}
        <div className="text-center mb-8 relative">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-3">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Project Memory & Task Manager</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Private Personal Knowledge Base & Task Workspace
          </p>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800 text-[11px] font-medium text-indigo-300 mt-3">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>{configured ? 'Supabase Auth Protected' : 'Private Owner Gatekeeper'}</span>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl mb-5 text-xs flex items-center gap-2 border ${
              statusMessage.isError
                ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Email Pribadi Anda</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 focus:border-indigo-500 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-zinc-300">
                Password {configured ? '' : '(Opsional)'}
              </label>
              {!configured && (
                <span className="text-[10px] text-zinc-500">Mode Owner Lokal</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
              <input
                type="password"
                required={configured}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/80 focus:border-indigo-500 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50"
          >
            <span>{isLoading ? 'Memproses...' : isSignUp ? 'Daftar Akun Baru' : 'Masuk ke Workspace'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Switch mode */}
        {configured && (
          <div className="mt-5 text-center text-xs text-zinc-400">
            {isSignUp ? (
              <p>
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-indigo-400 hover:underline font-semibold"
                >
                  Masuk di sini
                </button>
              </p>
            ) : (
              <p>
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-indigo-400 hover:underline font-semibold"
                >
                  Buat akun baru
                </button>
              </p>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-zinc-800 text-center text-[11px] text-zinc-500">
          Hanya email yang Anda masukkan yang dapat mengakses dan memodifikasi data task, screenshot, dan prompt AI.
        </div>
      </div>
    </div>
  );
}
