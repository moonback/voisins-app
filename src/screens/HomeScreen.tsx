import { motion } from 'framer-motion';
import { Search, PenTool, Truck, Sprout, Monitor, ShoppingBag, Map, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getMissionImageUrls, normalizeCategory } from '@/lib/utils';
import { useMissionStore } from '@/store/useMissionStore';
import { useAuth } from '@/store/useAuth';

const categories = [
  { id: 'bricolage', name: 'Bricolage', icon: PenTool },
  { id: 'demenagement', name: 'Demenagement', icon: Truck },
  { id: 'jardinage', name: 'Jardinage', icon: Sprout },
  { id: 'informatique', name: 'Informatique', icon: Monitor },
  { id: 'menage', name: 'Menage', icon: ShoppingBag },
];

export function HomeScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { missions, loading, fetchMissions } = useMissionStore();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const startY = useRef<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMissions();
  }, []);

  const filteredMissions = useMemo(() => {
    if (!selectedCategory) return missions;
    return missions.filter((mission) => normalizeCategory(mission.category) === selectedCategory);
  }, [missions, selectedCategory]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (contentRef.current && contentRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY.current !== null && !isRefreshing) {
      const y = e.touches[0].clientY;
      const pull = Math.max(0, (y - startY.current) * 0.5); // Resistance
      
      if (pull > 0 && pull < 100) {
        setPullProgress(pull);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullProgress > 60 && !isRefreshing) {
      setIsRefreshing(true);
      setPullProgress(50);
      await fetchMissions();
      setIsRefreshing(false);
      setPullProgress(0);
    } else {
      setPullProgress(0);
    }
    startY.current = null;
  };

  return (
    <div 
      className="h-full overflow-hidden bg-[linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_28%,_#f8fafc_100%)] relative"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-4 left-0 right-0 flex justify-center z-0">
         <motion.div 
           initial={{ scale: 0, opacity: 0 }}
           animate={(pullProgress > 0 || isRefreshing) ? { scale: 1, opacity: 1, rotate: isRefreshing ? 360 : pullProgress * 3 } : { scale: 0, opacity: 0 }}
           transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: 'linear' } : { type: 'spring' }}
           className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-blue-600"
         >
           <RefreshCw className="w-4 h-4" />
         </motion.div>
      </div>

    <motion.div 
      ref={contentRef}
      animate={{ y: pullProgress }}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex flex-col h-full bg-transparent pb-28 relative overflow-y-auto"
      style={{ zIndex: 10 }}
    >
      <div className="z-10 sticky top-0 shrink-0 border-b border-slate-200/80 bg-white/88 px-6 pb-6 pt-12 backdrop-blur-xl">
        <div className="flex justify-between items-center">
           <div>
              <span className="inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
                Autour de vous
              </span>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 tracking-tight">Bonjour, {user?.email?.split('@')[0] || 'Voisin'}</h1>
              <p className="text-sm text-slate-500 mt-1">De quoi avez-vous besoin aujourd'hui ?</p>
           </div>
           
           <button onClick={() => navigate('/map')} className="h-11 w-11 rounded-2xl border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-600 active:scale-95 transition-transform">
              <Map className="w-5 h-5" />
           </button>
        </div>
        
        <div className="mt-6 flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un service, un artisan..." 
            className="bg-transparent border-none outline-none ml-3 w-full text-sm font-medium text-slate-900 placeholder:text-slate-400"
            onClick={() => navigate('/search')}
          />
        </div>
      </div>

      <div className="mt-6 px-6">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Explorer</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900 tracking-tight">Catégories</h2>
          </div>
          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              Tout voir
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {categories.map((cat, i) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={cat.id} 
              onClick={() => setSelectedCategory((current) => current === cat.id ? null : cat.id)}
              className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <span className={`text-[11px] font-medium text-center leading-tight ${
                selectedCategory === cat.id ? 'text-blue-700' : 'text-slate-700'
              }`}>
                {cat.name}
              </span>
            </motion.div>
          ))}
        </div>
        </div>
      </div>
      
      <div className="px-6 mt-8">
        <div className="flex justify-between items-end mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Selection</p>
            <h2 className="mt-2 text-lg font-bold text-slate-900 tracking-tight">
              {selectedCategory ? `Missions - ${categories.find((cat) => cat.id === selectedCategory)?.name}` : 'Missions a proximite'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate(selectedCategory ? `/search?category=${selectedCategory}` : '/search')}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-blue-600 shadow-sm active:opacity-70"
          >
            Voir tout
          </button>
        </div>
        
        <div className="flex flex-col gap-4">
           {loading ? (
             [...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4 animate-pulse">
                   <div className="flex justify-between items-start">
                      <div className="w-16 h-5 bg-slate-200 rounded-full"></div>
                      <div className="w-12 h-6 bg-slate-200 rounded-md"></div>
                   </div>
                   <div>
                     <div className="w-3/4 h-5 bg-slate-200 rounded-md mb-2"></div>
                     <div className="w-full h-4 bg-slate-200 rounded-md mb-1"></div>
                     <div className="w-2/3 h-4 bg-slate-200 rounded-md"></div>
                   </div>
                   <div className="flex gap-4 mt-2">
                     <div className="w-24 h-4 bg-slate-200 rounded-md"></div>
                     <div className="w-24 h-4 bg-slate-200 rounded-md"></div>
                   </div>
                </div>
             ))
           ) : filteredMissions.length === 0 ? (
             <div className="text-center text-slate-500 py-8 text-sm bg-white rounded-xl border border-dashed border-slate-300">
               {selectedCategory ? 'Aucune mission dans cette categorie pour le moment.' : 'Aucune mission a proximite pour le moment.'}
             </div>
           ) : (
             filteredMissions.map((mission) => {
               const missionImages = getMissionImageUrls(mission);

               return (
               <div key={mission.id} onClick={() => navigate(`/mission/${mission.id}`)} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-200 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow">
                 {missionImages.length > 0 && (
                   <div className="w-full h-44 overflow-hidden rounded-2xl bg-slate-100">
                     <img
                       src={missionImages[0]}
                       alt={mission.title}
                       className="w-full h-full object-cover"
                     />
                   </div>
                 )}
                 <div className="flex justify-between items-start">
                    <span className={`px-3 py-1.5 ${mission.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-200'} text-[10px] font-bold rounded-full uppercase tracking-tight border`}>
                       {mission.status === 'open' ? 'Ouvert' : mission.status}
                    </span>
                    <span className="rounded-2xl bg-slate-50 px-3 py-1.5 text-lg font-bold text-slate-900 border border-slate-200">
                       {mission.budget}€
                    </span>
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900 text-lg mb-1">
                      {mission.title}
                   </h4>
                   <p className="text-slate-500 text-sm line-clamp-2">{mission.description}</p>
                 </div>
                 <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 min-w-0">
                       <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-200">
                          <img
                            src={mission.client?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${mission.client_id}`}
                            alt="avatar"
                            className="w-full h-full object-cover"
                          />
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-semibold text-slate-800 truncate">
                           {`${mission.client?.first_name || ''} ${mission.client?.last_name || ''}`.trim() || 'Voisin'}
                         </p>
                         <span className="text-xs text-slate-500 font-medium capitalize flex items-center gap-1">
                           <Map className="w-3 h-3 text-slate-400" />
                           {(mission as { address?: string }).address || mission.location || 'Non specifie'}
                         </span>
                       </div>
                    </div>
                    <button className="rounded-full bg-slate-900 px-3 py-1.5 text-white text-xs font-bold shadow-sm">Voir</button>
                 </div>
               </div>
             )})
           )}
        </div>
      </div>

      {/* FAB Floating action button for creating mission */}
      <motion.button 
         whileTap={{ scale: 0.9 }}
         onClick={() => navigate('/create')}
         className="fixed bottom-24 right-6 h-14 w-14 rounded-2xl bg-slate-900 text-white shadow-[0_18px_34px_rgba(15,23,42,0.22)] flex items-center justify-center z-20 md:absolute"
      >
         <Plus className="w-6 h-6" />
      </motion.button>
    </motion.div>
    </div>
  );
}
