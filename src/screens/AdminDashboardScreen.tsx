import { motion } from 'framer-motion';
import { ArrowLeft, Users, Briefcase, TrendingUp, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function AdminDashboardScreen() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, missions: 0, revenue: 0 });
  const [recentMissions, setRecentMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminData() {
      // Fetch users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch missions count
      const { count: missionsCount } = await supabase
        .from('missions')
        .select('*', { count: 'exact', head: true });

      // Fetch sum of completed missions budget (theoretical revenue, 10% fee)
      const { data: completedMissions } = await supabase
        .from('missions')
        .select('budget')
        .eq('status', 'completed');
        
      const totalBudget = completedMissions?.reduce((sum, m) => sum + (m.budget || 0), 0) || 0;
      const revenue = totalBudget * 0.10; // 10% platform fee

      setStats({
        users: usersCount || 0,
        missions: missionsCount || 0,
        revenue
      });

      // Fetch recent missions for moderation
      const { data: missions } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (missions) {
        setRecentMissions(missions);
      }

      setLoading(false);
    }
    fetchAdminData();
  }, []);

  const handleDeleteMission = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cette mission (Modération) ?')) {
       await supabase.from('missions').delete().eq('id', id);
       setRecentMissions(recentMissions.filter(m => m.id !== id));
       setStats(s => ({ ...s, missions: Math.max(0, s.missions - 1) }));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-slate-50 relative overflow-y-auto"
    >
      <div className="bg-slate-900 px-6 pt-12 pb-24 z-0 text-white rounded-b-[40px]">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-100 rounded-full text-xs font-bold border border-red-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin Panel
          </div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
        <p className="text-slate-400 text-sm">Vue d'ensemble et modération</p>
      </div>

      <div className="px-6 -mt-16 relative z-10 space-y-6 pb-12">
         {/* KPIs */}
         <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
               <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                 <Users className="w-5 h-5" />
               </div>
               <div className="text-2xl font-bold text-slate-900">{loading ? '-' : stats.users}</div>
               <div className="text-xs text-slate-500 font-medium">Utilisateurs inscrits</div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
               <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
                 <Briefcase className="w-5 h-5" />
               </div>
               <div className="text-2xl font-bold text-slate-900">{loading ? '-' : stats.missions}</div>
               <div className="text-xs text-slate-500 font-medium">Missions totales</div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 col-span-2 flex items-center justify-between">
               <div>
                 <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-3">
                   <TrendingUp className="w-5 h-5" />
                 </div>
                 <div className="text-xs text-slate-500 font-medium">Chiffre d'affaires (10%)</div>
               </div>
               <div className="text-3xl font-bold text-slate-900">{loading ? '-' : `${stats.revenue.toFixed(2)}€`}</div>
            </div>
         </div>

         {/* Moderation */}
         <div>
            <div className="flex items-center gap-2 mb-4 px-1">
               <AlertTriangle className="w-5 h-5 text-amber-500" />
               <h3 className="font-bold text-slate-900">Modération récente</h3>
            </div>
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
               {loading ? (
                 <div className="p-6 text-center text-slate-500 text-sm">Chargement...</div>
               ) : recentMissions.length === 0 ? (
                 <div className="p-6 text-center text-slate-500 text-sm">Aucune mission trouvée.</div>
               ) : (
                 <div className="divide-y divide-slate-100">
                    {recentMissions.map((mission) => (
                      <div key={mission.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                         <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-bold text-slate-900 text-sm truncate">{mission.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                               <span className={`px-2 py-0.5 rounded-full ${mission.status === 'open' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                                 {mission.status}
                               </span>
                               <span>• {mission.budget}€</span>
                            </div>
                         </div>
                         <button 
                           onClick={() => handleDeleteMission(mission.id)}
                           className="w-10 h-10 text-red-500 bg-red-50 rounded-xl flex items-center justify-center hover:bg-red-100 active:scale-95 transition-all shrink-0"
                         >
                            <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                    ))}
                 </div>
               )}
               <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                 <button className="text-sm font-bold text-slate-600 hover:text-slate-900">Voir tout l'historique</button>
               </div>
            </div>
         </div>

         {/* KYC Identity Verification */}
         <div>
            <div className="flex items-center gap-2 mb-4 px-1">
               <ShieldCheck className="w-5 h-5 text-emerald-500" />
               <h3 className="font-bold text-slate-900">Validation KYC (Identités)</h3>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 text-center">
               <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
               </div>
               <h4 className="font-bold text-slate-900 mb-1">Aucune validation en attente</h4>
               <p className="text-xs text-slate-500 mb-4">Tous les utilisateurs récemment inscrits ont une identité confirmée.</p>
               <button className="bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                  Configurer prestataire KYC
               </button>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
