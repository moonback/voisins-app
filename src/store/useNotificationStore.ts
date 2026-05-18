import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/useAuth';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  subscribeToNotifications: () => () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const auth = await supabase.auth.getUser();
      const userId = auth.data.user?.id;
      if (!userId) {
        set({ loading: false });
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const unreadCount = data.filter(n => !n.is_read).length;
      set({ notifications: data as Notification[], unreadCount, loading: false });
    } catch (err) {
      console.error(err);
      set({ loading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (err) {
      console.error(err);
    }
  },

  subscribeToNotifications: () => {
    const userId = useAuth.getState().user?.id;
    if (!userId) return () => {};

    const channelName = `notifications-${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const channel = supabase.channel(channelName);

    channel
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const newNotif = payload.new as Notification;
        set((state) => ({
          notifications: [newNotif, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}));
