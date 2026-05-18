import { motion } from 'framer-motion';
import { ArrowLeft, Star, MapPin, CheckCircle2, Shield, Calendar, BadgeCheck } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ProfileData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  role?: 'client' | 'provider' | 'both' | null;
  rating?: number | null;
  reviews_count?: number | null;
  missions_completed?: number | null;
  skills?: string[] | null;
  address?: string | null;
  is_available?: boolean | null;
  created_at: string;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: {
    first_name?: string | null;
    last_name?: string | null;
    avatar_url?: string | null;
  };
}

function getRoleLabel(role?: ProfileData['role']) {
  if (role === 'provider') return 'Realisateur';
  if (role === 'client') return 'Client';
  return 'Hybride';
}

export function PublicProfileScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!id) return;

      const [{ data: profileData, error: profileError }, { data: reviewsData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('reviews')
          .select('id, rating, comment, created_at, reviewer:profiles!reviews_reviewer_id_fkey(first_name, last_name, avatar_url)')
          .eq('reviewee_id', id)
          .order('created_at', { ascending: false }),
      ]);

      if (!profileError && profileData) {
        setProfile(profileData as ProfileData);
      }

      if (reviewsData) {
        setReviews(reviewsData as ReviewData[]);
      }

      setLoading(false);
    }
    loadProfile();
  }, [id]);

  if (loading) {
    return <div className="flex h-full items-center justify-center bg-slate-50">Chargement...</div>;
  }

  if (!profile) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-slate-50 gap-4">
        <p>Profil introuvable</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium">Retour</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-slate-50 relative overflow-y-auto"
    >
      <div className="absolute top-0 left-0 w-full h-48 bg-slate-200 z-0 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 opacity-90"></div>
      </div>

      <div className="px-6 pt-12 pb-4 z-10 relative">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center -ml-2 text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 relative z-10 -mt-2">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 mb-6 relative">
           <div className="absolute -top-12 left-6 w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-slate-200 shadow-sm">
             <img
               src={profile.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.id}`}
               alt="avatar"
               className="w-full h-full object-cover"
             />
           </div>
           
           <div className="flex justify-end mb-2 pt-2">
             <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-blue-100">
               <BadgeCheck className="w-3.5 h-3.5" /> Profil public
             </div>
           </div>

           <h1 className="text-2xl font-bold text-slate-900 mt-2">
             {profile.first_name || 'Voisin'} {profile.last_name || ''}
           </h1>
           
           <div className="flex items-center gap-4 mt-3">
             <div className="flex items-center gap-1 font-bold text-slate-900 border border-slate-200 px-2 py-1 rounded-md shadow-sm">
               <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
               {(profile.rating || 0).toFixed(1)} <span className="text-slate-500 font-medium ml-1">({profile.reviews_count || 0} avis)</span>
             </div>
             <div className="flex items-center gap-1 text-sm text-slate-600 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
               {profile.missions_completed || 0} missions
             </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
             <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
               <div className="flex items-center gap-2 text-slate-500">
                 <Shield className="w-4 h-4" />
                 <span className="text-xs font-semibold uppercase tracking-wide">Mode</span>
               </div>
               <p className="mt-2 text-sm font-semibold text-slate-900">{getRoleLabel(profile.role)}</p>
             </div>
             <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
               <div className="flex items-center gap-2 text-slate-500">
                 <MapPin className="w-4 h-4" />
                 <span className="text-xs font-semibold uppercase tracking-wide">Zone</span>
               </div>
               <p className="mt-2 text-sm font-semibold text-slate-900">{profile.address || 'Non renseignée'}</p>
             </div>
             <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
               <div className="flex items-center gap-2 text-slate-500">
                 <Calendar className="w-4 h-4" />
                 <span className="text-xs font-semibold uppercase tracking-wide">Disponibilité</span>
               </div>
               <p className="mt-2 text-sm font-semibold text-slate-900">
                 {profile.is_available !== false ? 'Disponible' : 'Indisponible'}
               </p>
             </div>
           </div>

           <div className="mt-6 pt-6 border-t border-slate-100">
             <h3 className="text-sm font-bold text-slate-900 mb-2">À propos</h3>
             <p className="text-sm text-slate-600 leading-relaxed">
               {profile.bio || "Ce voisin n'a pas encore ajouté de description, mais il est prêt à vous rendre service !"}
             </p>
           </div>
           
           <div className="mt-6">
             <h3 className="text-sm font-bold text-slate-900 mb-2">Compétences</h3>
             <div className="flex flex-wrap gap-2">
               {(profile.skills && profile.skills.length > 0 ? profile.skills : ['Aucune compétence renseignée']).map((skill, index) => (
                 <span key={index} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200">
                   {skill}
                 </span>
               ))}
             </div>
           </div>

           <div className="mt-6 pt-6 border-t border-slate-100">
             <h3 className="text-sm font-bold text-slate-900 mb-2">Membre depuis</h3>
             <p className="text-sm text-slate-600">
               {profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR') : 'Non disponible'}
             </p>
           </div>
        </div>
        
        <div className="mb-8">
           <h3 className="text-lg font-bold text-slate-900 mb-4 px-2">Avis récents</h3>
           {reviews.length === 0 ? (
             <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-sm text-slate-500 font-medium shadow-sm">
               Pas encore d'avis
             </div>
           ) : (
             <div className="space-y-4">
               {reviews.map((review) => (
                 <div key={review.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                         <img
                           src={review.reviewer?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${review.reviewer?.first_name || 'reviewer'}`}
                           alt="avatar"
                         />
                       </div>
                       <div>
                         <div className="font-bold text-slate-900 text-sm">
                           {[review.reviewer?.first_name, review.reviewer?.last_name].filter(Boolean).join(' ') || 'Voisin'}
                         </div>
                         <div className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</div>
                       </div>
                     </div>
                     <div className="flex items-center gap-0.5">
                       {[...Array(5)].map((_, i) => (
                         <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200'}`} />
                       ))}
                     </div>
                   </div>
                   <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                     {review.comment}
                   </p>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </motion.div>
  );
}
