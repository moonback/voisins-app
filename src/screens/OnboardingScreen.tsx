import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function OnboardingScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_34%),linear-gradient(180deg,_#ffffff_0%,_#f8fbff_38%,_#eef4ff_100%)] relative">
      <div className="px-8 pt-14 z-10">
        <div className="inline-flex items-center rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700 shadow-sm backdrop-blur">
          Voisins App
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end px-8 pb-12 z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <div className="mb-8 flex h-18 w-18 items-center justify-center rounded-[24px] bg-slate-900 text-white shadow-[0_20px_40px_rgba(15,23,42,0.24)]">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Vos voisins ont du talent.
          </h1>
          <p className="mt-4 text-slate-500 font-medium text-lg leading-snug">
            Trouvez la bonne personne pour vos petits travaux du quotidien, juste à côté de chez vous.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {['Missions locales', 'Profils verifies', 'Messagerie rapide'].map((item) => (
              <span key={item} className="rounded-full border border-white/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur">
                {item}
              </span>
            ))}
          </div>
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }} 
           className="mt-12 flex flex-col gap-3"
        >
          <button 
            onClick={() => navigate('/register')}
            className="w-full rounded-2xl bg-slate-900 py-4 text-base font-bold text-white active:scale-[0.98] transition-transform shadow-[0_18px_36px_rgba(15,23,42,0.18)]">
            Créer un compte
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="w-full rounded-2xl border border-white/80 bg-white/85 py-4 text-base font-bold text-slate-900 active:scale-[0.98] transition-transform hover:bg-white shadow-sm backdrop-blur">
            Se connecter
          </button>
        </motion.div>
      </div>
      
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-80 w-80 rounded-full bg-blue-100 blur-3xl opacity-70 pointer-events-none"></div>
      <div className="absolute top-1/3 left-0 -ml-20 h-64 w-64 rounded-full bg-cyan-50 blur-3xl opacity-70 pointer-events-none"></div>
      <div className="absolute bottom-16 right-8 h-28 w-28 rounded-full bg-indigo-100 blur-3xl opacity-70 pointer-events-none"></div>
    </div>
  );
}
