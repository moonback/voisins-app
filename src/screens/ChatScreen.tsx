import { motion } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { useAuth } from '@/store/useAuth';

export function ChatScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, fetchMessages, sendMessage, subscribeToMessages } = useChatStore();
  
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const displayMessages = id ? (messages[id] || []) : [];

  useEffect(() => {
    if (id) {
      fetchMessages(id);
      const unsubscribe = subscribeToMessages(id);
      return () => {
        unsubscribe();
      };
    }
  }, [id, fetchMessages, subscribeToMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !id) return;

    const text = inputText;
    setInputText(""); // optimistic clear
    await sendMessage(id, text);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col h-full bg-slate-50 relative"
    >
      <div className="px-6 pt-12 pb-4 bg-white border-b border-slate-200 z-10 sticky top-0 shrink-0 flex items-center gap-4 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
               {/* the avatar will just be generic for now */}
               <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${id}`} alt="avatar" className="w-full h-full object-cover" />
           </div>
           <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">Voisin</h2>
              <p className="text-xs text-green-600 font-medium">En ligne</p>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 content-end">
        <div className="space-y-4 flex flex-col justify-end min-h-full">
           {displayMessages.map((msg) => {
             const isMe = msg.sender_id === user?.id;
             return (
               <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-medium ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-slate-900 border border-slate-200 rounded-bl-sm shadow-sm'}`}>
                   {msg.content}
                 </div>
               </div>
             )
           })}
           <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="px-6 py-4 bg-white border-t border-slate-200 shrink-0 sticky bottom-0">
         <form onSubmit={handleSend} className="flex items-center gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Votre message..." 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-3 text-sm font-medium focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all shadow-sm"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 disabled:opacity-50 disabled:bg-slate-300 shadow-md shadow-blue-600/20 active:scale-95 transition-transform"
            >
               <Send className="w-5 h-5 -ml-1 mt-1" />
            </button>
         </form>
      </div>
    </motion.div>
  );
}
