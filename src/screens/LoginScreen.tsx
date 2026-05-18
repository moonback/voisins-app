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
      className="flex flex-col h-full bg-white relative"
    >
      <div className="px-6 pt-12 pb-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center -ml-2 text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Se connecter</h1>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-transform text-sm mt-8 flex items-center justify-center disabled:opacity-70"
          >
            {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
