import { motion } from 'framer-motion';
import { Search, PenTool, Truck, Sprout, Monitor, ShoppingBag, Map, Plus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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

  const normalizeCategory = (value?: string) =>
    (value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

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
      className="h-full overflow-hidden bg-slate-50 relative"
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
      className="flex flex-col h-full bg-slate-50 pb-24 relative overflow-y-auto"
      style={{ zIndex: 10 }}
    >
      <div className="bg-white px-6 pt-12 pb-6 border-b border-slate-200 z-10 sticky top-0 shrink-0">
        <div className="flex justify-between items-center">
           <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bonjour, {user?.email?.split('@')[0] || 'Voisin'}</h1>
              <p className="text-sm text-slate-500 mt-1">De quoi avez-vous besoin aujourd'hui ?</p>
           </div>
           
           <button onClick={() => navigate('/map')} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 active:scale-95 transition-transform border border-slate-200">
              <Map className="w-5 h-5" />
           </button>
        </div>
        
        <div className="mt-6 flex items-center bg-white rounded-xl px-4 py-3 border border-slate-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Rechercher un service, un artisan..." 
            className="bg-transparent border-none outline-none ml-3 w-full text-sm font-medium text-slate-900 placeholder:text-slate-400"
            onClick={() => navigate('/search')}
          />
        </div>
      </div>

      <div className="px-6 mt-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Catégories</h2>
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
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-50 text-blue-700 border-blue-100'
                  : 'bg-white text-slate-600 border-slate-200 shadow-sm'
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
      
      <div className="px-6 mt-8">
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {selectedCategory ? `Missions - ${categories.find((cat) => cat.id === selectedCategory)?.name}` : 'Missions a proximite'}
          </h2>
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className="text-sm font-bold text-blue-600 active:opacity-70"
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
               const missionImages = [
                 ...((mission as { images?: string[] }).images || []),
                 ...(mission.photos || []),
               ].filter(Boolean);

               return (
               <div key={mission.id} onClick={() => navigate(`/mission/${mission.id}`)} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow">
                 {missionImages.length > 0 && (
                   <div className="w-full h-44 overflow-hidden rounded-xl bg-slate-100">
                     <img
                       src={missionImages[0]}
                       alt={mission.title}
                       className="w-full h-full object-cover"
                     />
                   </div>
                 )}
                 <div className="flex justify-between items-start">
                    <span className={`px-2.5 py-1 ${mission.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'} text-[10px] font-bold rounded-full uppercase tracking-tight`}>
                       {mission.status === 'open' ? 'Ouvert' : mission.status}
                    </span>
                    <span className="text-lg font-bold text-slate-900">
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
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${mission.client_id}`} alt="avatar" className="w-full h-full object-cover" />
                       </div>
                       <span className="text-xs text-slate-600 font-medium capitalize flex items-center gap-1">
                          <Map className="w-3 h-3 text-slate-400" />
                          {(mission as { address?: string }).address || mission.location || 'Non specifie'}
                       </span>
                    </div>
                    <button className="text-blue-600 text-xs font-bold">Voir les détails</button>
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
         className="fixed bottom-24 right-6 w-14 h-14 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-center z-20 md:absolute"
      >
         <Plus className="w-6 h-6" />
      </motion.button>
    </motion.div>
    </div>
  );
}
