import { motion } from 'framer-motion';
import { MapPin, Search as SearchIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMissionImageUrls, normalizeCategory } from '@/lib/utils';
import { useMissionStore } from '@/store/useMissionStore';

const categories = [
  { id: 'bricolage', name: 'Bricolage' },
  { id: 'demenagement', name: 'Demenagement' },
  { id: 'jardinage', name: 'Jardinage' },
  { id: 'informatique', name: 'Informatique' },
  { id: 'menage', name: 'Menage' },
];

export function SearchScreen() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { missions, loading, fetchMissions } = useMissionStore();

  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSelectedCategory(searchParams.get('category') || '');
  }, [searchParams]);

  const filteredMissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return missions.filter((mission) => {
      const matchesCategory = !selectedCategory || normalizeCategory(mission.category) === selectedCategory;
      const matchesQuery =
        !normalizedQuery ||
        mission.title.toLowerCase().includes(normalizedQuery) ||
        mission.description.toLowerCase().includes(normalizedQuery) ||
        (mission.location || '').toLowerCase().includes(normalizedQuery) ||
        (mission.address || '').toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [missions, query, selectedCategory]);

  const updateFilters = (nextQuery: string, nextCategory: string) => {
    const params = new URLSearchParams();
    if (nextQuery.trim()) params.set('q', nextQuery.trim());
    if (nextCategory) params.set('category', nextCategory);
    setSearchParams(params);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full overflow-y-auto bg-[linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_26%,_#f8fafc_100%)] pb-28"
    >
      <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/88 px-6 pb-4 pt-12 backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Explorer</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">Recherche</h1>
        <p className="mt-1 text-sm text-slate-500">Affinez vos resultats par mot-cle et categorie.</p>

        <div className="mt-4 flex gap-2">
          <div className="flex-1 flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
            <SearchIcon className="w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                setQuery(value);
                updateFilters(value, selectedCategory);
              }}
              placeholder="Que recherchez-vous ?"
              className="bg-transparent border-none outline-none ml-3 w-full text-sm font-medium text-slate-900 placeholder:text-slate-400"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={() => navigate('/map')}
            className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center border border-slate-200 shadow-sm text-slate-600 transition-colors hover:bg-slate-50"
          >
            <MapPin className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto hide-scroll">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('');
              updateFilters(query, '');
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap ${
              !selectedCategory
                ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            Tout
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                const nextCategory = selectedCategory === category.id ? '' : category.id;
                setSelectedCategory(nextCategory);
                updateFilters(query, nextCategory);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-blue-50 text-blue-700 border-blue-100 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Resultats</p>
            <h3 className="mt-2 text-sm font-bold text-slate-900">Missions trouvees</h3>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 shadow-sm">
            {filteredMissions.length} mission(s)
          </span>
        </div>

        {loading ? (
          <div className="text-center text-slate-500 py-8 text-sm">Chargement...</div>
        ) : filteredMissions.length === 0 ? (
          <div className="text-center text-slate-500 py-8 text-sm bg-white rounded-xl border border-dashed border-slate-300">
            Aucune mission ne correspond a votre recherche.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMissions.map((mission) => {
              const missionImages = getMissionImageUrls(mission);

              return (
                <div
                  key={mission.id}
                  onClick={() => navigate(`/mission/${mission.id}`)}
                  className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-200 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  {missionImages.length > 0 && (
                    <div className="w-full h-44 overflow-hidden rounded-2xl bg-slate-100">
                      <img src={missionImages[0]} alt={mission.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-slate-600">
                        {mission.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-lg">{mission.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{mission.description}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-700">
                        {`${mission.client?.first_name || ''} ${mission.client?.last_name || ''}`.trim() || 'Voisin'}
                      </p>
                    </div>
                    <span className="rounded-2xl bg-slate-50 px-3 py-1.5 text-lg font-bold text-slate-900 border border-slate-200">{mission.budget}€</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                    <span>{mission.address || mission.location || 'Lieu non specifie'}</span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-700 border border-blue-100">Voir detail</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
