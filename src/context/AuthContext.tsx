'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, password?: string) => Promise<{ error?: string; message?: string }>;
  signUpWithEmail: (email: string, password?: string) => Promise<{ error?: string; message?: string }>;
  logout: () => Promise<void>;
  localUserEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [localUserEmail, setLocalUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. If Supabase configured, listen to real Supabase auth
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setIsLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // 2. Offline / Local fallback: check local storage auth session
      try {
        const storedUser = localStorage.getItem('pmtm_auth_user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setLocalUserEmail(parsed.email);
          setUser({
            id: parsed.id || 'owner-user-id',
            email: parsed.email,
            app_metadata: {},
            user_metadata: { name: parsed.name || parsed.email.split('@')[0] },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as unknown as User);
        }
      } catch {
        // no-op
      }
      setIsLoading(false);
    }
  }, []);

  const loginWithEmail = async (email: string, password?: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      if (password) {
        // Email + Password login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        setIsLoading(false);
        if (error) return { error: error.message };
        setUser(data.user);
        return { message: 'Login berhasil!' };
      } else {
        // Magic Link OTP
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
        });
        setIsLoading(false);
        if (error) return { error: error.message };
        return { message: 'Link login (Magic Link) telah dikirim ke email Anda!' };
      }
    } else {
      // Local Auth Mode (Owner access lock)
      const mockUser = {
        id: 'owner-user-' + Date.now(),
        email: email.trim().toLowerCase(),
        name: email.split('@')[0],
      };
      localStorage.setItem('pmtm_auth_user', JSON.stringify(mockUser));
      setLocalUserEmail(mockUser.email);
      setUser({
        id: mockUser.id,
        email: mockUser.email,
        app_metadata: {},
        user_metadata: { name: mockUser.name },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User);
      setIsLoading(false);
      return { message: 'Berhasil masuk sebagai Owner Workspace!' };
    }
  };

  const signUpWithEmail = async (email: string, password?: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured() && password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      setIsLoading(false);
      if (error) return { error: error.message };
      if (data.user && !data.session) {
        return { message: 'Silakan cek email Anda untuk konfirmasi aktivasi akun.' };
      }
      setUser(data.user);
      return { message: 'Registrasi berhasil!' };
    } else {
      return loginWithEmail(email, password);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('pmtm_auth_user');
    setUser(null);
    setLocalUserEmail(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithEmail,
        signUpWithEmail,
        logout,
        localUserEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
