import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  profile: any | null; // We'll type this better later based on DB schema
  setUser: (user: User | null) => void;
  setProfile: (profile: any | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  logout: () => set({ user: null, profile: null }),
}));
