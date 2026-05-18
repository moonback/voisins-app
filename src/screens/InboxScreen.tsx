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
      className="flex flex-col h-full overflow-y-auto bg-[linear-gradient(180deg,_#f8fbff_0%,_#f8fafc_32%,_#f8fafc_100%)] pb-28"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/80 bg-white/88 px-6 pb-4 pt-12 backdrop-blur-xl">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Conversation</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">Messages</h1>
        </div>
        <button onClick={() => navigate('/notifications')} className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-600 rounded-full border border-white"></span>
          )}
        </button>
      </div>

      <div className="flex-1 w-full px-6 py-6">
        {loading ? (
           <div className="text-center text-slate-500 py-8 text-sm">Chargement...</div>
        ) : conversations.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center space-y-4 text-slate-400 shadow-sm">
             <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
               <MessageCircle className="w-8 h-8 opacity-50 text-slate-400" />
             </div>
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
                  className="flex items-center gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                 >
                   <div className="h-12 w-12 rounded-full border border-slate-200 bg-slate-200 overflow-hidden shrink-0">
                       <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${otheruser.id || 'default'}`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h3 className="font-bold text-slate-900 truncate">{otheruser.first_name || 'Voisin'} {otheruser.last_name || ''}</h3>
                       <p className="mt-1 text-sm text-slate-500 truncate">Appuyez pour voir la conversation</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                 </div>
               );
             })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
