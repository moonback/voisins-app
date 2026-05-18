import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormValues } from '@/lib/validations';
import { supabase } from '@/lib/supabase';

export function LoginScreen() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError) {
      setError(signInError.message);
    } else {
      // auth state listener in App.tsx will handle the redirect
      navigate('/');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="relative flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_26%),linear-gradient(180deg,_#ffffff_0%,_#f8fbff_45%,_#eef4ff_100%)]"
    >
      <div className="px-6 pt-12 pb-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/75 text-slate-600 shadow-sm backdrop-blur transition-colors hover:bg-white">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Se connecter</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="rounded-[28px] border border-white/80 bg-white/82 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.08)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Bon retour</p>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">Accedez a vos missions et conversations.</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Connectez-vous pour consulter vos voisins, vos offres et vos notifications.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6 rounded-[28px] border border-slate-200/90 bg-white p-5 shadow-sm">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email</label>
            <input 
              required 
              type="email" 
              {...register('email')}
              placeholder="marc@exemple.com" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all shadow-sm" 
            />
            {errors.email && <p className="mt-1 text-xs text-red-500 font-medium">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mot de passe</label>
            <input 
              required 
              type="password" 
              {...register('password')}
              placeholder="••••••••" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all shadow-sm" 
            />
            {errors.password && <p className="mt-1 text-xs text-red-500 font-medium">{errors.password.message}</p>}
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="mt-8 flex w-full items-center justify-center rounded-2xl bg-slate-900 py-4 text-sm font-bold text-white shadow-[0_18px_36px_rgba(15,23,42,0.16)] active:scale-[0.98] transition-transform disabled:opacity-70"
          >
            {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
