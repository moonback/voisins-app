import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
}

export interface Conversation {
  id: string;
  mission_id: string;
  participant1_id: string;
  participant2_id: string;
  created_at: string;
  // joined info
  participants?: Profile[];
  last_message?: Message;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  is_read: boolean;
  created_at: string;
}

interface ChatState {
  conversations: Conversation[];
  messages: Record<string, Message[]>; // by conversation_id
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<boolean>;
  subscribeToMessages: (conversationId: string) => () => void;
  createOrGetConversation: (missionId: string, participantId: string) => Promise<string | null>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: {},
  loading: false,
  error: null,

  fetchConversations: async () => {
    set({ loading: true, error: null });
    try {
      const auth = await supabase.auth.getUser();
      const userId = auth.data.user?.id;
      if (!userId) throw new Error("Non authentifié");

      // We need to fetch conversations where user is participant1 or participant2
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant1:profiles!conversations_participant1_id_fkey(id, first_name, last_name, avatar_url),
          participant2:profiles!conversations_participant2_id_fkey(id, first_name, last_name, avatar_url)
        `)
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data as any[]).map(c => ({
        ...c,
        participants: [c.participant1, c.participant2].filter(Boolean)
      }));

      set({ conversations: formatted as Conversation[], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchMessages: async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: data as Message[]
        }
      }));
    } catch (err: any) {
      console.error("Error fetching messages", err);
    }
  },

  sendMessage: async (conversationId: string, content: string) => {
    try {
      const auth = await supabase.auth.getUser();
      const userId = auth.data.user?.id;
      if (!userId) return false;

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: userId,
          content
        }])
        .select()
        .single();

      if (error) throw error;

      // Optimistically add to state (or rely on subscription)
      // Usually better to let subscription handle it if we are subscribed,
      // but optimistic update is snappier. Subscription will just re-add it or be deduplicated if handled.
      // For simplicity, we just insert it.
      set((state) => {
        const msgs = state.messages[conversationId] || [];
        // prevent duplicate if subscription already caught it
        if (msgs.find(m => m.id === data.id)) return state;
        return {
          messages: {
           ...state.messages,
           [conversationId]: [...msgs, data]
          }
        };
      });

      return true;
    } catch (err: any) {
      console.error("Error sending message", err);
      return false;
    }
  },

  subscribeToMessages: (conversationId: string) => {
    const channel = supabase
      .channel(`chat_${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        set((state) => {
          const msgs = state.messages[conversationId] || [];
          if (msgs.find(m => m.id === newMessage.id)) return state;
          return {
            messages: {
              ...state.messages,
              [conversationId]: [...msgs, newMessage]
            }
          };
        });
      })
      .subscribe();
      
    // return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  },

  createOrGetConversation: async (missionId: string, participantId: string) => {
    const auth = await supabase.auth.getUser();
    const userId = auth.data.user?.id;
    if (!userId) return null;

    try {
      // Check if conversation exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('mission_id', missionId)
        .or(`and(participant1_id.eq.${userId},participant2_id.eq.${participantId}),and(participant1_id.eq.${participantId},participant2_id.eq.${userId})`)
        .maybeSingle();

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          mission_id: missionId,
          participant1_id: userId,
          participant2_id: participantId
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data.id;
    } catch (err) {
      console.error("Error creating conversation", err);
      return null;
    }
  }
}));
