import { motion } from 'framer-motion';
import { Settings, LogOut, ChevronRight, Star, Bell, LayoutDashboard, ShieldCheck, BriefcaseBusiness, MapPin, BadgeCheck, CalendarDays } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/store/useNotificationStore';

type ProfileData = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  role?: 'client' | 'provider' | 'both' | null;
  rating?: number | null;
  reviews_count?: number | null;
  missions_completed?: number | null;
  skills?: string[] | null;
  address?: string | null;
  is_available?: boolean | null;
  created_at?: string | null;
};

function getRoleLabel(role?: ProfileData['role']) {
  if (role === 'provider') return 'Realisateur';
  if (role === 'client') return 'Client';
  return 'Hybride';
}

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { unreadCount, fetchNotifications } = useNotificationStore();
  
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data as ProfileData);
    }
    loadProfile();
    fetchNotifications();
  }, [fetchNotifications, user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Mon profil public', value: '', action: () => navigate(`/user/${user?.id}`) },
    { icon: BriefcaseBusiness, label: 'Mes missions postees', value: '', action: () => navigate('/profile/missions') },
    { icon: Star, label: 'Mes avis', value: profile ? `${(profile.rating || 0).toFixed(1)}/5` : 'N/A', action: () => navigate('/profile/reviews') },
    { icon: Bell, label: 'Notifications', value: unreadCount > 0 ? `${unreadCount} non lue(s)` : 'A jour', action: () => navigate('/notifications') },
    { icon: ShieldCheck, label: 'Administration', value: 'Admin', action: () => navigate('/admin') },
    { icon: Settings, label: 'Paramètres', value: '', action: () => navigate('/profile/settings') },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full overflow-y-auto bg-slate-50 pb-24"
    >
      <div className="bg-white px-6 pt-12 pb-8 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 p-1 cursor-pointer relative border border-blue-200 overflow-hidden">
             <img src={profile?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.id}`} alt="avatar" className="w-full h-full object-cover" />
             <div className="absolute bottom-0 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur' : 'Utilisateur'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <div className="inline-flex border border-slate-200 rounded-lg px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-50">
                Mode {getRoleLabel(profile?.role)}
              </div>
              <div className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold border ${
                profile?.is_available !== false
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-100 text-slate-600'
              }`}>
                {profile?.is_available !== false ? 'Disponible' : 'Indisponible'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 px-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wide">Note</span>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">{(profile?.rating || 0).toFixed(1)}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <BadgeCheck className="w-4 h-4 text-blue-600" />
              <span className="text-[11px] font-bold uppercase tracking-wide">Avis</span>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">{profile?.reviews_count || 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-slate-500">
              <BriefcaseBusiness className="w-4 h-4 text-indigo-600" />
              <span className="text-[11px] font-bold uppercase tracking-wide">Missions</span>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">{profile?.missions_completed || 0}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 px-4 space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">A propos</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-700">
            {profile?.bio || "Ajoutez une bio pour presenter votre experience et rassurer les voisins."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Informations du profil</h2>

          <div className="grid grid-cols-1 gap-3">
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Adresse</span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900">{profile?.address || 'Non renseignee'}</p>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <CalendarDays className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">Membre depuis</span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : 'Non disponible'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">Competences</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(profile?.skills && profile.skills.length > 0 ? profile.skills : ['Aucune competence renseignee']).map((skill, index) => (
              <span key={`${skill}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {menuItems.map((item, index) => (
             <div key={item.label} onClick={item.action} className={`flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 ${index !== menuItems.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                     <item.icon className="w-5 h-5 text-slate-600" />
                  </div>
                  <span className="font-medium text-slate-900 text-sm">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.value && <span className="text-sm font-semibold text-slate-500">{item.value}</span>}
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
             </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 px-4">
         <button onClick={handleLogout} className="w-full bg-white border border-slate-200 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 shadow-sm transition-colors text-sm">
            <LogOut className="w-4 h-4" />
            Déconnexion
         </button>
      </div>

    </motion.div>
  );
}
