import { create } from 'zustand';
import { supabase, isSupabaseEnabled } from '@/lib/supabase';
import { usePlayer } from './player';

type AuthStatus = 'loading' | 'guest' | 'authed';

interface AuthStore {
  status: AuthStatus;
  email: string | null;
  userId: string | null;
  backendEnabled: boolean;
  init: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ ok: boolean; message: string }>;
  signInWithGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthStore>((set) => ({
  status: 'loading',
  email: null,
  userId: null,
  backendEnabled: isSupabaseEnabled,

  init: async () => {
    if (!isSupabaseEnabled || !supabase) {
      // Guest mode: an id is minted lazily when the user enters the dojo.
      set({ status: 'guest' });
      return;
    }
    const { data } = await supabase.auth.getSession();
    const session = data.session;
    if (session?.user) {
      usePlayer.getState().setUserId(session.user.id);
      set({ status: 'authed', email: session.user.email ?? null, userId: session.user.id });
    } else {
      set({ status: 'guest' });
    }
    supabase.auth.onAuthStateChange((_event, s) => {
      if (s?.user) {
        usePlayer.getState().setUserId(s.user.id);
        set({ status: 'authed', email: s.user.email ?? null, userId: s.user.id });
      } else {
        set({ status: 'guest', email: null, userId: null });
      }
    });
  },

  signInWithEmail: async (email) => {
    if (!isSupabaseEnabled || !supabase) {
      // Guest fallback: pretend to "sign in" locally.
      set({ status: 'authed', email });
      return { ok: true, message: 'Signed in (local guest mode).' };
    }
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: 'Check your email for a magic link.' };
  },

  signInWithGoogle: async () => {
    if (!isSupabaseEnabled || !supabase) {
      set({ status: 'authed', email: 'guest@dojo.local' });
      return;
    }
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  },

  continueAsGuest: () => set({ status: 'guest' }),

  signOut: async () => {
    if (isSupabaseEnabled && supabase) await supabase.auth.signOut();
    set({ status: 'guest', email: null, userId: null });
  },
}));
