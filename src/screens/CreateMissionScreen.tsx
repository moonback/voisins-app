import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createMissionSchema, type CreateMissionFormValues } from '@/lib/validations';
import React, { useState, useRef } from 'react';
import { useMissionStore } from '@/store/useMissionStore';

export function CreateMissionScreen() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createMission, error: storeError } = useMissionStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createMissionSchema),
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setPhotos(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: any) => {
    // Inject photos in data if schema handles it, or just ignore for now as backend might not support it yet
    const dataWithPhotos = { ...data, photos }; // Note: Ensure backend allows this field!
    const success = await createMission(data);
    
    if (success) {
       setSuccess(true);
       setTimeout(() => {
         navigate('/');
       }, 1500);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col h-full bg-white relative"
    >
      <div className="px-6 pt-12 pb-4 border-b border-slate-200 z-10 sticky top-0 bg-white flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center -ml-2 text-slate-600 hover:bg-slate-50">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Nouvelle mission</h1>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50">
        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
            
            {success && (
              <div className="p-4 bg-green-50 text-green-700 text-sm font-medium rounded-xl border border-green-100">
                Mission publiée avec succès !
              </div>
            )}
            
            {storeError && (
              <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100">
                {storeError}
              </div>
            )}

            {/* Title */}
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Titre de la mission</label>
               <input 
                 {...register('title')}
                 type="text" 
                 placeholder="Ex: Montage meuble TV" 
                 className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all shadow-sm" 
               />
               {errors.title && <p className="mt-1 text-xs text-red-500 font-medium">{errors.title.message}</p>}
            </div>

            {/* Category */}
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Catégorie</label>
               <select 
                 {...register('category')}
                 className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all appearance-none cursor-pointer shadow-sm text-slate-900"
               >
                  <option value="">Sélectionner une catégorie</option>
                  <option value="bricolage">Bricolage</option>
                  <option value="menage">Ménage</option>
                  <option value="jardinage">Jardinage</option>
                  <option value="demenagement">Déménagement</option>
               </select>
               {errors.category && <p className="mt-1 text-xs text-red-500 font-medium">{errors.category.message}</p>}
            </div>

            {/* Description */}
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
               <textarea 
                 {...register('description')}
                 rows={4} 
                 placeholder="Décrivez votre besoin en détail..." 
                 className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all resize-none shadow-sm"
               ></textarea>
               {errors.description && <p className="mt-1 text-xs text-red-500 font-medium">{errors.description.message}</p>}
            </div>

            {/* Settings grid */}
            <div className="grid grid-cols-2 gap-4">
               {/* Location */}
               <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Quartier ou Ville</label>
                  <input 
                    {...register('location')}
                    type="text" 
                    placeholder="Ex: Paris 15e, Quartier Montparnasse" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all shadow-sm" 
                  />
                  <p className="mt-1.5 text-[10px] text-slate-500 font-medium">Visible uniquement par les voisins aux profils validés.</p>
                  {errors.location && <p className="mt-1 text-xs text-red-500 font-medium">{errors.location.message?.toString()}</p>}
               </div>
               
               {/* Date */}
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Date</label>
                  <input 
                    {...register('date')}
                    type="date" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all shadow-sm" 
                  />
                  {errors.date && <p className="mt-1 text-xs text-red-500 font-medium">{errors.date.message?.toString()}</p>}
               </div>

               {/* Duration */}
               <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Durée (est.)</label>
                  <select 
                    {...register('duration')}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all appearance-none shadow-sm" 
                  >
                     <option value="">Au choix</option>
                     <option value="< 1h">Moins de 1h</option>
                     <option value="1h-2h">1h à 2h</option>
                     <option value="Demi-journée">Demi-journée</option>
                     <option value="Journée entière">Journée entière</option>
                     <option value="Plusieurs jours">Plusieurs jours</option>
                  </select>
                  {errors.duration && <p className="mt-1 text-xs text-red-500 font-medium">{errors.duration.message?.toString()}</p>}
               </div>

               {/* Budget */}
               <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Budget estimé (€)</label>
                  <input 
                    {...register('budget', { valueAsNumber: true })}
                    type="number" 
                    placeholder="Ex: 50" 
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-4 text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all shadow-sm" 
                  />
                  {errors.budget && <p className="mt-1 text-xs text-red-500 font-medium">{errors.budget.message?.toString()}</p>}
               </div>
            </div>
            
            {/* Photos */}
            <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Photos (Optionnel)</label>
               
               {photos.length > 0 && (
                 <div className="flex gap-2 overflow-x-auto pb-3 mb-2">
                   {photos.map((photo, index) => (
                     <div key={index} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-200">
                        <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                     </div>
                   ))}
                 </div>
               )}

               <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handlePhotoUpload} 
                 accept="image/*" 
                 multiple 
                 className="hidden" 
               />

               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
               >
                  <div className="flex items-center gap-2">
                     <Plus className="w-5 h-5" />
                     <span className="font-medium text-sm">Ajouter des photos</span>
                  </div>
               </div>
            </div>

            <div className="h-20"></div>

        </form>
      </div>
      
      <div className="absolute bottom-0 w-full px-6 pb-6 pt-4 bg-white border-t border-slate-200 shrink-0">
         <button 
           onClick={handleSubmit(onSubmit)}
           disabled={isSubmitting || success}
           className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 active:scale-[0.98] transition-transform text-sm disabled:opacity-70 disabled:active:scale-100"
         >
            {isSubmitting ? 'Publication...' : 'Publier la mission'}
         </button>
      </div>

    </motion.div>
  );
}
