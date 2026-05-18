import { motion } from 'framer-motion';
import { MessageCircle, Bell, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useAuth } from '@/store/useAuth';
import { useNotificationStore } from '@/store/useNotificationStore';

export function InboxScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { conversations, loading, fetchConversations } = useChatStore();
  const { unreadCount, fetchNotifications, subscribeToNotifications } = useNotificationStore();

  useEffect(() => {
    fetchConversations();
    fetchNotifications();
    const unsub = subscribeToNotifications();
    return unsub;
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col h-full overflow-y-auto bg-slate-50 pb-24"
    >
      <div className="px-6 pt-12 pb-4 border-b border-slate-200 z-10 sticky top-0 bg-white flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Messages</h1>
        <button onClick={() => navigate('/notifications')} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center relative hover:bg-slate-200 transition-colors">
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-600 rounded-full border border-white"></span>
          )}
        </button>
      </div>

      <div className="flex-1 w-full px-6 py-4">
        {loading ? (
           <div className="text-center text-slate-500 py-8 text-sm">Chargement...</div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-slate-400">
             <MessageCircle className="w-16 h-16 opacity-30 text-slate-400" />
             <p className="font-medium text-slate-500">Pas de messages pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
             {conversations.map((conv) => {
               // Find the other participant
               const otheruser = conv.participants?.find(p => p.id !== user?.id) || { id: 'default', first_name: 'Voisin', last_name: '' };
               return (
                 <div 
                   key={conv.id} 
                   onClick={() => navigate(`/chat/${conv.id}`)}
                   className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                 >
                    <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden shrink-0">
                       <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${otheruser.id || 'default'}`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h3 className="font-bold text-slate-900 truncate">{otheruser.first_name || 'Voisin'} {otheruser.last_name || ''}</h3>
                       <p className="text-sm text-slate-500 truncate mt-0.5">Appuyez pour voir la conversation</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                 </div>
               );
             })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
