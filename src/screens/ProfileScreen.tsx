import { motion } from 'framer-motion';
import { Settings, LogOut, ChevronRight, Star, Shield, CreditCard, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/store/useAuth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    }
    loadProfile();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Mon profil public', value: '', action: () => navigate(`/user/${user?.id}`) },
    { icon: Star, label: 'Mes avis', value: profile ? `${profile.rating?.toFixed(1)}/5` : 'N/A', action: () => {} },
    { icon: CreditCard, label: 'Paiements & Stripe', value: '', action: () => {} },
    { icon: Shield, label: 'Confiance & Sécurité', value: '', action: () => {} },
    { icon: ShieldCheck, label: 'Administration', value: 'Admin', action: () => navigate('/admin') },
    { icon: Settings, label: 'Paramètres', value: '', action: () => {} },
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
             <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.id}`} alt="avatar" className="w-full h-full object-cover" />
             <div className="absolute bottom-0 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {profile ? `${profile.first_name || ''} ${profile.last_name || ''}` : 'Utilisateur'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
            <div className="mt-2 inline-flex border border-slate-200 rounded-lg px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-50">
               Mode {profile?.role === 'provider' ? 'Réalisateur' : (profile?.role === 'client' ? 'Client' : 'Hybride')}
            </div>
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
