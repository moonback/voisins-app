import { motion } from 'framer-motion';
import { Search as SearchIcon, MapPin, Grid } from 'lucide-react';

export function SearchScreen() {
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
              placeholder="Que recherchez-vous ?" 
              className="bg-transparent border-none outline-none ml-3 w-full text-sm font-medium text-slate-900 placeholder:text-slate-400"
              autoFocus
            />
          </div>
          <button className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm text-slate-600 transition-colors hover:bg-slate-50">
            <MapPin className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 mt-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Recherches récentes</h3>
        <div className="flex flex-wrap gap-2">
          {['Montage meuble IKEA', 'Plomberie', 'Baby-sitting', 'Jardinage'].map((tag) => (
            <span key={tag} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 shadow-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>

    </motion.div>
  );
}
