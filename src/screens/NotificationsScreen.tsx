import { motion } from 'framer-motion';
import { ArrowLeft, Bell, CheckCheck, ChevronRight, MessageCircle, BriefcaseBusiness, Clock3 } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore, type Notification } from '@/store/useNotificationStore';

function formatNotificationDate(date: string) {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getNotificationTarget(notification: Notification) {
  const data = notification.data && typeof notification.data === 'object' ? notification.data : {};

  if (typeof data.conversation_id === 'string' && data.conversation_id) {
    return `/chat/${data.conversation_id}`;
  }

  if (typeof data.mission_id === 'string' && data.mission_id) {
    return `/mission/${data.mission_id}`;
  }

  return null;
}

function getNotificationIcon(type?: string) {
  if (type === 'message') return MessageCircle;
  if (type === 'mission' || type === 'offer') return BriefcaseBusiness;
  return Bell;
}

export function NotificationsScreen() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    subscribeToNotifications,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    const unsub = subscribeToNotifications();
    return unsub;
  }, [fetchNotifications, subscribeToNotifications]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex h-full flex-col overflow-y-auto bg-slate-50 pb-8"
    >
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 pb-5 pt-12">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
              <p className="mt-1 text-sm text-slate-500">Retrouvez vos alertes liees aux missions et messages.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" />
            Tout lire
          </button>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6">
        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{notifications.length}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Non lues</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{unreadCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Lues</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{Math.max(0, notifications.length - unreadCount)}</p>
          </div>
        </section>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
                <div className="h-4 w-1/3 rounded bg-slate-200" />
                <div className="mt-3 h-5 w-2/3 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-full rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Bell className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Aucune notification</h2>
            <p className="mt-2 text-sm text-slate-500">Les prochains evenements importants apparaitront ici.</p>
          </section>
        ) : (
          <section className="space-y-4">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const target = getNotificationTarget(notification);

              return (
                <div
                  key={notification.id}
                  className={`rounded-3xl border p-5 shadow-sm transition-colors ${
                    notification.is_read
                      ? 'border-slate-200 bg-white'
                      : 'border-blue-100 bg-blue-50/60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                      notification.is_read
                        ? 'border-slate-100 bg-slate-50 text-slate-600'
                        : 'border-blue-100 bg-white text-blue-700'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{notification.title}</p>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            <span>{formatNotificationDate(notification.created_at)}</span>
                          </div>
                        </div>
                        {!notification.is_read && (
                          <span className="rounded-full bg-blue-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                            Nouveau
                          </span>
                        )}
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{notification.body}</p>

                      <div className="mt-4 flex gap-2">
                        {!notification.is_read && (
                          <button
                            type="button"
                            onClick={() => markAsRead(notification.id)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                          >
                            Marquer comme lue
                          </button>
                        )}

                        {target && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!notification.is_read) {
                                await markAsRead(notification.id);
                              }
                              navigate(target);
                            }}
                            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                          >
                            Ouvrir
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </motion.div>
  );
}
