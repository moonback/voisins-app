import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/useAuth';
import { supabase } from '@/lib/supabase';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { BottomTabs } from '@/components/layout/BottomTabs';
import { HomeScreen } from '@/screens/HomeScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';
import { SearchScreen } from '@/screens/SearchScreen';
import { InboxScreen } from '@/screens/InboxScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { NearbyMapScreen } from '@/screens/NearbyMapScreen';
import { CreateMissionScreen } from '@/screens/CreateMissionScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { MissionDetailScreen } from '@/screens/MissionDetailScreen';
import { ChatScreen } from '@/screens/ChatScreen';
import { PublicProfileScreen } from '@/screens/PublicProfileScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';

import { AdminDashboardScreen } from '@/screens/AdminDashboardScreen';

function AppLayout() {
  const { user, setUser } = useAuth();
  const location = useLocation();
  
  // Real check for auth state via Zustand store (updated by useEffect below)
  const isAuthenticated = !!user;

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  if (!isAuthenticated) {
    return (
      <MobileContainer>
        <Routes>
          <Route path="/" element={<OnboardingScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MobileContainer>
    );
  }

  const showTabs = ['/', '/search', '/inbox', '/profile'].includes(location.pathname);

  return (
    <MobileContainer>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/search" element={<SearchScreen />} />
        <Route path="/inbox" element={<InboxScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/profile/settings" element={<SettingsScreen />} />
        
        {/* Detail Screens */}
        <Route path="/map" element={<NearbyMapScreen />} />
        <Route path="/create" element={<CreateMissionScreen />} />
        <Route path="/mission/:id" element={<MissionDetailScreen />} />
        <Route path="/chat/:id" element={<ChatScreen />} />
        <Route path="/user/:id" element={<PublicProfileScreen />} />
        <Route path="/admin" element={<AdminDashboardScreen />} />
        
        {/* Fallbacks */}
        <Route path="*" element={
          <div className="p-8 text-center mt-20 flex flex-col items-center">
            <h2 className="text-xl font-bold">Bientôt disponible</h2>
            <button onClick={() => window.history.back()} className="mt-4 px-4 py-2 bg-gray-100 rounded-full font-medium">Retour</button>
          </div>
        } />
      </Routes>
      {showTabs && <BottomTabs />}
    </MobileContainer>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
