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
      className="flex flex-col h-full overflow-y-auto bg-slate-50 pb-24"
    >
      <div className="px-6 pt-12 pb-4 border-b border-slate-200 z-10 sticky top-0 bg-white">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recherche</h1>

        <div className="mt-4 flex gap-2">
          <div className="flex-1 flex items-center bg-white rounded-xl px-4 py-3 border border-slate-200 shadow-sm focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600 transition-all">
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
            className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm text-slate-600 transition-colors hover:bg-slate-50"
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
                ? 'bg-blue-50 text-blue-700 border-blue-100'
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
                  ? 'bg-blue-50 text-blue-700 border-blue-100'
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
          <h3 className="text-sm font-bold text-slate-900">Resultats</h3>
          <span className="text-xs font-medium text-slate-500">{filteredMissions.length} mission(s)</span>
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
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4 cursor-pointer hover:shadow-md transition-shadow"
                >
                  {missionImages.length > 0 && (
                    <div className="w-full h-44 overflow-hidden rounded-xl bg-slate-100">
                      <img src={missionImages[0]} alt={mission.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{mission.title}</h4>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{mission.description}</p>
                    </div>
                    <span className="text-lg font-bold text-slate-900">{mission.budget}€</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600 font-medium">
                    <span>{mission.address || mission.location || 'Lieu non specifie'}</span>
                    <span className="capitalize">{mission.category}</span>
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
