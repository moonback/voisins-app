import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export function OnboardingScreen() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      <div className="flex-1 flex flex-col justify-end px-8 pb-12 z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
        >
          <div className="w-16 h-16 bg-blue-600 rounded-xl mb-8 flex items-center justify-center shadow-lg shadow-blue-600/30">
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
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }} 
           className="mt-12 flex flex-col gap-3"
        >
          <button 
            onClick={() => navigate('/register')}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-base active:scale-[0.98] transition-transform shadow-lg shadow-slate-200">
            Créer un compte
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="w-full bg-white border border-slate-200 text-slate-900 py-4 rounded-xl font-bold text-base active:scale-[0.98] transition-transform hover:bg-slate-50 shadow-sm">
            Se connecter
          </button>
        </motion.div>
      </div>
      
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
      <div className="absolute top-1/3 left-0 -ml-20 w-64 h-64 bg-cyan-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
    </div>
  );
}
