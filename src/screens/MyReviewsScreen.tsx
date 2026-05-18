import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquareQuote, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/useAuth';

type ReviewProfile = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
};

type ReviewMission = {
  id: string;
  title?: string | null;
};

type ReviewItem = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer?: ReviewProfile | null;
  reviewee?: ReviewProfile | null;
  mission?: ReviewMission | null;
};

type RawReviewItem = Omit<ReviewItem, 'reviewer' | 'reviewee' | 'mission'> & {
  reviewer?: ReviewProfile[] | ReviewProfile | null;
  reviewee?: ReviewProfile[] | ReviewProfile | null;
  mission?: ReviewMission[] | ReviewMission | null;
};

function renderStars(rating: number) {
  return [...Array(5)].map((_, index) => (
    <Star
      key={index}
      className={`h-4 w-4 ${index < rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-200'}`}
    />
  ));
}

function getPersonName(profile?: ReviewProfile | null) {
  return `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Voisin';
}

function getSingleRelation<T>(value?: T[] | T | null) {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function normalizeReview(review: RawReviewItem): ReviewItem {
  return {
    ...review,
    reviewer: getSingleRelation(review.reviewer),
    reviewee: getSingleRelation(review.reviewee),
    mission: getSingleRelation(review.mission),
  };
}

export function MyReviewsScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'received' | 'given'>('received');
  const [receivedReviews, setReceivedReviews] = useState<ReviewItem[]>([]);
  const [givenReviews, setGivenReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    async function loadReviews() {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const [receivedResult, givenResult] = await Promise.all([
        supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            reviewer:profiles!reviews_reviewer_id_fkey(id, first_name, last_name, avatar_url),
            mission:missions(id, title)
          `)
          .eq('reviewee_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('reviews')
          .select(`
            id,
            rating,
            comment,
            created_at,
            reviewee:profiles!reviews_reviewee_id_fkey(id, first_name, last_name, avatar_url),
            mission:missions(id, title)
          `)
          .eq('reviewer_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      setReceivedReviews(((receivedResult.data || []) as RawReviewItem[]).map(normalizeReview));
      setGivenReviews(((givenResult.data || []) as RawReviewItem[]).map(normalizeReview));
      setLoading(false);
    }

    loadReviews();
  }, [user]);

  const summary = useMemo(() => {
    if (receivedReviews.length === 0) {
      return { average: 0, total: 0, given: givenReviews.length };
    }

    const total = receivedReviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      average: total / receivedReviews.length,
      total: receivedReviews.length,
      given: givenReviews.length,
    };
  }, [givenReviews.length, receivedReviews]);

  const displayedReviews = tab === 'received' ? receivedReviews : givenReviews;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex h-full flex-col overflow-y-auto bg-slate-50 pb-8"
    >
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 pb-5 pt-12">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 transition-colors hover:bg-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mes avis</h1>
            <p className="mt-1 text-sm text-slate-500">Consultez les avis recus et ceux que vous avez laisses.</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-4 py-6">
        <section className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Note moyenne</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.average.toFixed(1)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Recus</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.total}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Laisses</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{summary.given}</p>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTab('received')}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                tab === 'received' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Avis recus
            </button>
            <button
              type="button"
              onClick={() => setTab('given')}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${
                tab === 'given' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Avis laisses
            </button>
          </div>
        </section>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
                <div className="h-4 w-1/3 rounded bg-slate-200" />
                <div className="mt-3 h-5 w-1/2 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-full rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : displayedReviews.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <MessageSquareQuote className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Aucun avis a afficher</h2>
            <p className="mt-2 text-sm text-slate-500">
              {tab === 'received'
                ? "Les avis recus apres vos missions apparaitront ici."
                : "Les avis que vous avez laisses apparaitront ici."}
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {displayedReviews.map((review) => {
              const person = tab === 'received' ? review.reviewer : review.reviewee;

              return (
                <div key={review.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                        <img
                          src={person?.avatar_url || `https://api.dicebear.com/7.x/notionists/svg?seed=${person?.id || review.id}`}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{getPersonName(person)}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {review.mission?.title || 'Mission sans titre'} · {new Date(review.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  </div>

                  <p className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                    {review.comment || 'Aucun commentaire laisse.'}
                  </p>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </motion.div>
  );
}
