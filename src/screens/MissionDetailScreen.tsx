import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Clock, Navigation, MessageCircle, Star } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMissionStore, type Mission } from '@/store/useMissionStore';
import { useAuth } from '@/store/useAuth';
import { supabase } from '@/lib/supabase';
import { useChatStore } from '@/store/useChatStore';

export function MissionDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createOrGetConversation } = useChatStore();
  
  const [mission, setMission] = useState<Mission | null>(null);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  
  const [offerText, setOfferText] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerStatus, setOfferStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadMission() {
      if (!id) return;
      
      const { data, error } = await supabase.from('missions').select('*').eq('id', id).single();
      if (!error && data) {
        setMission(data as Mission);
        
        // If owner, fetch offers for this mission
        if (user && data.client_id === user.id) {
          const { data: offersData } = await supabase
            .from('mission_offers')
            .select('*, provider:profiles!mission_offers_provider_id_fkey(id, first_name, last_name, avatar_url)')
            .eq('mission_id', id)
            .order('created_at', { ascending: false });
            
          if (offersData) {
            setOffers(offersData);
          }
        }
        
        if (user && data.status === 'completed') {
           const { data: existingReview } = await supabase
             .from('reviews')
             .select('id')
             .eq('mission_id', id)
             .eq('reviewer_id', user.id)
             .maybeSingle();
           if (existingReview) {
             setHasReviewed(true);
           }
        }
      }
      setLoading(false);
    }
    loadMission();
  }, [id, user]);

  const handleSubmitOffer = async () => {
    if (!user) {
      setErrorMsg("Veuillez vous connecter pour faire une offre.");
      return;
    }
    if (!offerText || !offerPrice) {
      setErrorMsg("Veuillez remplir tous les champs.");
      return;
    }

    setOfferStatus("submitting");
    setErrorMsg("");

    const { error } = await supabase.from('mission_offers').insert([
      {
        mission_id: id,
        provider_id: user.id,
        message: offerText,
        proposed_price: parseFloat(offerPrice),
      }
    ]);

    if (error) {
      setOfferStatus("error");
      setErrorMsg(error.message);
    } else {
      setOfferStatus("success");
    }
  };

  const handleStartChat = async (providerId: string) => {
    if (!id || !user) return;
    const conversationId = await createOrGetConversation(id, providerId);
    if (conversationId) {
      navigate(`/chat/${conversationId}`);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center bg-slate-50">Chargement...</div>;
  }

  if (!mission) {
    return <div className="flex h-full flex-col items-center justify-center bg-slate-50 gap-4">
      <p>Mission introuvable</p>
      <button onClick={() => navigate(-1)} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium">Retour</button>
    </div>;
  }

  const isOwner = user?.id === mission.client_id;
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-slate-50 relative"
    >
      <div className="absolute top-0 left-0 w-full h-64 bg-slate-200 z-0 overflow-hidden">
        {/* Placeholder for map or image */}
        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center opacity-60">
           <MapPin className="w-16 h-16 text-blue-200" />
        </div>
      </div>

      <div className="px-6 pt-12 pb-4 flex justify-between items-center z-10 relative">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center -ml-2 text-slate-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-tight bg-white border border-slate-200 shadow-sm ${mission.status === 'open' ? 'text-blue-700' : 'text-slate-600'}`}>
           {mission.status}
        </span>
      </div>

      <div className="flex-1 bg-white rounded-t-3xl mt-16 z-10 relative px-6 py-8 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] overflow-y-auto">
        <div className="flex justify-between items-start gap-4 mb-6">
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug flex-1">
              {mission.title}
           </h1>
           <div className="text-xl font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shrink-0">
             {mission.budget}€
           </div>
        </div>

        <div className="flex items-center gap-3 pb-6 mb-6 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors rounded-xl p-2 -ml-2" onClick={() => navigate(`/user/${mission.client_id}`)}>
           <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shadow-inner">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${mission.client_id}`} alt="avatar" className="w-full h-full object-cover" />
           </div>
           <div>
              <div className="font-bold text-slate-900 text-sm">Posté par un Voisin</div>
              <div className="text-xs text-slate-500 font-medium">Voir le profil</div>
           </div>
        </div>

        <div className="space-y-6 pb-24">
           <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{mission.description}</p>
           </div>
           
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                 <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><MapPin className="w-4 h-4" /></div>
                 <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Lieu</div>
                    <div className="text-xs font-bold text-slate-700">
                      {(user && user.user_metadata?.role !== 'pending') || isOwner ? (mission.location || 'Lieu non spécifié') : '📍 Visible par profils vérifiés max'}
                    </div>
                 </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                 <div className="bg-green-100 p-2 rounded-lg text-green-600"><Calendar className="w-4 h-4" /></div>
                 <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Date</div>
                    <div className="text-xs font-bold text-slate-700">{mission.date ? new Date(mission.date).toLocaleDateString('fr-FR') : 'Dès que possible'}</div>
                 </div>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                 <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Clock className="w-4 h-4" /></div>
                 <div>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Durée estimée</div>
                    <div className="text-xs font-bold text-slate-700">{mission.duration || 'Non spécifiée'}</div>
                 </div>
              </div>
           </div>
           
           {isOwner && mission.status === 'assigned' && (
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-6 text-center">
                <h3 className="font-bold text-blue-900 text-sm mb-2">Mission en cours</h3>
                <p className="text-blue-700 text-xs mb-4">L'argent est bloqué sur notre compte sécurisé. Validez la mission pour payer votre voisin.</p>
                <button
                  onClick={async () => {
                    await supabase.from('missions').update({ status: 'completed' }).eq('id', mission.id);
                    setMission({...mission, status: 'completed'});
                  }}
                  className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md cursor-pointer hover:bg-blue-700 transition-colors active:scale-95 text-sm"
                >
                  Valider la mission
                </button>
             </div>
           )}

           {mission.status === 'completed' && (
             <div className="bg-green-50 border border-green-100 rounded-xl p-5 mt-6 flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <h3 className="font-bold text-green-900 text-sm mb-1 text-center">Mission terminée</h3>
                <p className="text-green-700 text-xs text-center mb-6">Le voisin a été payé avec succès !</p>
                
                {isOwner && !hasReviewed && (
                   <div className="w-full bg-white p-4 rounded-xl border border-green-200">
                     <h4 className="font-bold text-slate-900 text-sm mb-3">Laisser un avis</h4>
                     <div className="flex gap-2 mb-3">
                        {[1,2,3,4,5].map((star) => (
                           <Star 
                             key={star} 
                             onClick={() => setReviewRating(star)} 
                             className={`w-6 h-6 cursor-pointer ${star <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200'}`} 
                           />
                        ))}
                     </div>
                     <textarea 
                       value={reviewText}
                       onChange={(e) => setReviewText(e.target.value)}
                       placeholder="Un petit mot sur ce voisin ?"
                       className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none mb-3 resize-none"
                     ></textarea>
                     <button
                       onClick={async () => {
                         if(!user || !mission.provider_id) return;
                         await supabase.from('reviews').insert([{
                            mission_id: mission.id,
                            reviewer_id: user.id,
                            reviewee_id: mission.provider_id,
                            rating: reviewRating,
                            comment: reviewText
                         }]);
                         setHasReviewed(true);
                       }}
                       className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-lg text-sm active:scale-95 transition-transform"
                     >
                       Publier l'avis
                     </button>
                   </div>
                )}
                {isOwner && hasReviewed && (
                   <div className="text-sm font-medium text-green-700 bg-green-100/50 px-4 py-2 rounded-lg mt-2">
                      Avis publié. Merci !
                   </div>
                )}
             </div>
           )}
           
           {isOwner && offers.length > 0 && (
             <div className="mt-8">
                <h3 className="font-bold text-slate-900 mb-4 text-sm mt-8 border-t border-slate-100 pt-6">Propositions reçues ({offers.length})</h3>
                <div className="space-y-4">
                   {offers.map((offer) => (
                     <div key={offer.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 disabled:opacity-70 transition-opacity" onClick={() => navigate(`/user/${offer.provider_id}`)}>
                            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${offer.provider?.id || 'provider'}`} alt="avatar" />
                            </div>
                            <span className="font-bold text-slate-900 text-sm">{offer.provider?.first_name || 'Voisin'}</span>
                          </div>
                          <div className="text-sm font-bold text-blue-600 bg-white px-2 py-1 rounded shadow-sm border border-slate-200">{offer.proposed_price}€</div>
                        </div>
                        <p className="text-slate-600 text-sm mb-4 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">{offer.message}</p>
                        
                        {mission.status === 'open' && (
                           <div className="flex gap-2">
                             <button 
                               onClick={() => handleStartChat(offer.provider_id)}
                               className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 font-bold py-3 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors active:scale-95 text-sm"
                             >
                               <MessageCircle className="w-4 h-4" />
                               Message
                             </button>
                             <button 
                               onClick={async () => {
                                 // Simulate Accept + Escrow Pay
                                 await supabase.from('missions').update({ status: 'assigned', provider_id: offer.provider_id }).eq('id', mission.id);
                                 await supabase.from('mission_offers').update({ status: 'accepted' }).eq('id', offer.id);
                                 setMission({...mission, status: 'assigned', provider_id: offer.provider_id});
                               }}
                               className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md cursor-pointer hover:bg-blue-700 transition-colors active:scale-95 text-sm"
                             >
                               Accepter & Payer
                             </button>
                           </div>
                        )}
                        {mission.status === 'assigned' && mission.provider_id === offer.provider_id && (
                           <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                              <span className="font-bold text-green-700 text-sm">Voisin sélectionné !</span>
                              <button 
                               onClick={() => handleStartChat(offer.provider_id)}
                               className="w-full flex items-center justify-center gap-2 bg-white text-slate-700 font-bold py-2 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors active:scale-95 text-sm"
                              >
                               <MessageCircle className="w-4 h-4" /> Message
                              </button>
                           </div>
                        )}
                     </div>
                   ))}
                </div>
             </div>
           )}

           {!isOwner && mission.status === 'open' && (
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mt-8">
                 <h3 className="font-bold text-slate-900 mb-4 text-sm">Faire une offre</h3>
                 
                 {offerStatus === 'success' ? (
                   <div className="p-4 bg-green-50 text-green-700 text-sm font-medium rounded-xl border border-green-100 text-center">
                     Votre offre a été envoyée au voisin !
                   </div>
                 ) : (
                   <div className="space-y-4">
                     {errorMsg && <p className="text-xs text-red-500 font-medium">{errorMsg}</p>}
                     <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mon prix (€)</label>
                       <input 
                         type="number" 
                         value={offerPrice}
                         onChange={(e) => setOfferPrice(e.target.value)}
                         placeholder={mission.budget.toString()}
                         className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all shadow-sm" 
                       />
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Mon petit mot</label>
                       <textarea 
                         rows={2}
                         value={offerText}
                         onChange={(e) => setOfferText(e.target.value)}
                         placeholder="Bonjour, je suis disponible pour vous aider avec..." 
                         className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all resize-none shadow-sm"
                       ></textarea>
                     </div>
                     <button 
                       onClick={handleSubmitOffer}
                       disabled={offerStatus === 'submitting'}
                       className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-200 active:scale-[0.98] transition-transform text-sm disabled:opacity-70 disabled:active:scale-100"
                     >
                       {offerStatus === 'submitting' ? 'Envoi...' : 'Envoyer ma proposition'}
                     </button>
                   </div>
                 )}
              </div>
           )}
        </div>
      </div>
    </motion.div>
  );
}
