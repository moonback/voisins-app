import { motion } from 'framer-motion';
import { ArrowLeft, BriefcaseBusiness, Calendar, ChevronRight, CircleDollarSign, Clock3, Eye, Plus, RotateCcw, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/useAuth';
import { type Mission } from '@/store/useMissionStore';

type OfferCountMap = Record<string, number>;

const statusConfig: Record<Mission['status'], { label: string; badgeClass: string }> = {
  draft: {
    label: 'Brouillon',
    badgeClass: 'bg-slate-100 text-slate-600',
  },
  open: {
    label: 'Ouverte',
    badgeClass: 'bg-blue-50 text-blue-700',
  },
  assigned: {
    label: 'Assignee',
    badgeClass: 'bg-amber-50 text-amber-700',
  },
  completed: {
    label: 'Terminee',
    badgeClass: 'bg-green-50 text-green-700',
  },
  cancelled: {
    label: 'Annulee',
    badgeClass: 'bg-rose-50 text-rose-700',
  },
};

function formatMissionDate(date?: string) {
  if (!date) return 'Des que possible';
  return new Date(date).toLocaleDateString('fr-FR');
}

export function MyPostedMissionsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [offersCount, setOffersCount] = useState<OfferCountMap>({});
  const [loading, setLoading] = useState(true);
  const [updatingMissionId, setUpdatingMissionId] = useState<string | null>(null);

  useEffect(() => {
    async function loadPostedMissions() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) {
        setMissions([]);
        setOffersCount({});
        setLoading(false);
        return;
      }

      const missionList = data as Mission[];
      setMissions(missionList);

      if (missionList.length === 0) {
        setOffersCount({});
        setLoading(false);
        return;
      }

      const missionIds = missionList.map((mission) => mission.id);
      const { data: offers } = await supabase
        .from('mission_offers')
        .select('mission_id')
        .in('mission_id', missionIds);

      const nextOfferCounts = (offers || []).reduce<OfferCountMap>((acc, offer) => {
        const missionId = offer.mission_id as string;
        acc[missionId] = (acc[missionId] || 0) + 1;
        return acc;
      }, {});

      setOffersCount(nextOfferCounts);
      setLoading(false);
    }

    loadPostedMissions();
  }, [user]);

  const stats = useMemo(() => {
    return missions.reduce(
      (acc, mission) => {
        acc.total += 1;
        if (mission.status === 'open') acc.open += 1;
        if (mission.status === 'assigned') acc.assigned += 1;
        if (mission.status === 'completed') acc.completed += 1;
        return acc;
      },
      { total: 0, open: 0, assigned: 0, completed: 0 }
    );
  }, [missions]);

  const updateMissionStatus = async (mission: Mission, nextStatus: Mission['status']) => {
    setUpdatingMissionId(mission.id);

    const payload: Partial<Mission> = {
      status: nextStatus,
    };

    if (nextStatus === 'open') {
      payload.provider_id = undefined;
    }

    const { error } = await supabase.from('missions').update(payload).eq('id', mission.id);

    if (!error) {
      setMissions((current) =>
        current.map((item) =>
          item.id === mission.id
            ? {
                ...item,
                status: nextStatus,
                provider_id: nextStatus === 'open' ? undefined : item.provider_id,
              }
            : item
        )
      );
    }

    setUpdatingMissionId(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex h-full flex-col overflow-y-auto bg-slate-50 pb-8"
    >
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 pb-5 pt-12">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mes missions</h1>
              <p className="mt-1 text-sm text-slate-500">Consultez et gerez les missions que vous avez publiees.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/create')}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm transition-transform active:scale-95"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6">
        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ouvertes</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.open}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">En cours</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.assigned}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Terminees</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{stats.completed}</p>
          </div>
        </section>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
                <div className="h-4 w-24 rounded bg-slate-200" />
                <div className="mt-4 h-5 w-2/3 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-full rounded bg-slate-200" />
                <div className="mt-5 h-10 w-full rounded-2xl bg-slate-200" />
              </div>
            ))}
          </div>
        ) : missions.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <BriefcaseBusiness className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Aucune mission postee</h2>
            <p className="mt-2 text-sm text-slate-500">Publiez votre premiere mission pour commencer a recevoir des propositions.</p>
            <button
              type="button"
              onClick={() => navigate('/create')}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Publier une mission
            </button>
          </section>
        ) : (
          <section className="space-y-4">
            {missions.map((mission) => {
              const status = statusConfig[mission.status];
              const isUpdating = updatingMissionId === mission.id;
              const offerCount = offersCount[mission.id] || 0;

              return (
                <div key={mission.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-tight ${status.badgeClass}`}>
                        {status.label}
                      </span>
                      <h2 className="mt-3 text-lg font-bold text-slate-900">{mission.title}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{mission.description}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-right">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Budget</p>
                      <p className="mt-1 text-base font-bold text-slate-900">{mission.budget}€</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Date</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">{formatMissionDate(mission.date)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock3 className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Duree</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">{mission.duration || 'Non precisee'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <CircleDollarSign className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Offres</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-slate-900">{offerCount} proposition(s)</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <BriefcaseBusiness className="h-4 w-4" />
                        <span className="text-xs font-semibold uppercase tracking-wide">Lieu</span>
                      </div>
                      <p className="mt-2 truncate text-sm font-medium text-slate-900">{mission.address || mission.location || 'Non precise'}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/mission/${mission.id}`)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                    >
                      <Eye className="h-4 w-4" />
                      Voir details
                    </button>

                    {mission.status === 'open' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => updateMissionStatus(mission, 'cancelled')}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-rose-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700 disabled:opacity-70"
                      >
                        <XCircle className="h-4 w-4" />
                        {isUpdating ? 'Mise a jour...' : 'Annuler'}
                      </button>
                    )}

                    {mission.status === 'cancelled' && (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => updateMissionStatus(mission, 'open')}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 disabled:opacity-70"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {isUpdating ? 'Mise a jour...' : 'Reouvrir'}
                      </button>
                    )}

                    {(mission.status === 'assigned' || mission.status === 'completed') && (
                      <button
                        type="button"
                        onClick={() => navigate(`/mission/${mission.id}`)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
                      >
                        Gerer
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
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
