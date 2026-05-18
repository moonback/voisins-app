import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

const MISSION_IMAGES_BUCKET = 'mission-images';

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  status: 'draft' | 'open' | 'assigned' | 'completed' | 'cancelled';
  client_id: string;
  provider_id?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  photos?: string[];
  date?: string;
  mission_date?: string;
  duration?: string;
  created_at: string;
}

export interface CreateMissionInput {
  title: string;
  category: string;
  description: string;
  budget: number;
  location: string;
  date: string;
  duration: string;
  latitude?: number;
  longitude?: number;
  imageFiles?: File[];
}

interface MissionState {
  missions: Mission[];
  loading: boolean;
  error: string | null;
  fetchMissions: () => Promise<void>;
  createMission: (mission: CreateMissionInput) => Promise<boolean>;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: [],
  loading: false,
  error: null,
  fetchMissions: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ missions: data as Mission[], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
  createMission: async (missionArgs) => {
    set({ loading: true, error: null });
    try {
      const auth = await supabase.auth.getUser();
      if (!auth.data.user) {
         throw new Error("Vous devez être connecté pour publier une mission");
      }
      
      // Ensure profile exists to avoid 409 FK violation
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', auth.data.user.id).maybeSingle();
      if (!profile) {
         await supabase.from('profiles').insert([{ 
           id: auth.data.user.id, 
           first_name: auth.data.user.user_metadata?.full_name?.split(' ')[0] || 'Voisin', 
           role: 'client' 
         }]);
      }

      const imageUrls: string[] = [];
      for (const file of missionArgs.imageFiles || []) {
        const extension = file.name.split('.').pop() || 'jpg';
        const filePath = `${auth.data.user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(MISSION_IMAGES_BUCKET)
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from(MISSION_IMAGES_BUCKET)
          .getPublicUrl(filePath);

        imageUrls.push(publicUrlData.publicUrl);
      }

      const { imageFiles, ...missionData } = missionArgs;
      const { error } = await supabase.from('missions').insert([
        {
          ...missionData,
          client_id: auth.data.user.id,
          status: 'open',
          photos: imageUrls
        }
      ]);

      if (error) throw error;
      
      // Refresh
      await get().fetchMissions();
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return false;
    }
  }
}));
