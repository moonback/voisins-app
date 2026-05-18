ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS photos TEXT[];

ALTER TABLE missions 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS photos TEXT[];

ALTER TABLE public.missions 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS date TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS photos JSONB;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'mission-images',
  'mission-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Mission images are publicly readable'
  ) THEN
    CREATE POLICY "Mission images are publicly readable"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'mission-images');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Authenticated users can upload mission images'
  ) THEN
    CREATE POLICY "Authenticated users can upload mission images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'mission-images'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS reviews_unique_per_mission_reviewer
ON public.reviews (mission_id, reviewer_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reviews'
      AND policyname = 'Reviews are publicly readable'
  ) THEN
    CREATE POLICY "Reviews are publicly readable"
    ON public.reviews FOR SELECT
    USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'reviews'
      AND policyname = 'Authenticated users can create mission reviews'
  ) THEN
    CREATE POLICY "Authenticated users can create mission reviews"
    ON public.reviews FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = reviewer_id
      AND reviewer_id <> reviewee_id
      AND EXISTS (
        SELECT 1
        FROM public.missions m
        WHERE m.id = mission_id
          AND m.status = 'completed'
          AND (
            (m.client_id = reviewer_id AND m.provider_id = reviewee_id)
            OR (m.provider_id = reviewer_id AND m.client_id = reviewee_id)
          )
      )
    );
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.refresh_profile_review_stats(target_profile_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  avg_rating NUMERIC(3,2);
  total_reviews INTEGER;
BEGIN
  IF target_profile_id IS NULL THEN
    RETURN;
  END IF;

  SELECT
    COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0),
    COUNT(*)
  INTO avg_rating, total_reviews
  FROM public.reviews r
  WHERE r.reviewee_id = target_profile_id;

  UPDATE public.profiles
  SET rating = avg_rating,
      reviews_count = total_reviews,
      updated_at = NOW()
  WHERE id = target_profile_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.refresh_profile_missions_completed(target_profile_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  completed_count INTEGER;
BEGIN
  IF target_profile_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COUNT(*)
  INTO completed_count
  FROM public.missions m
  WHERE m.provider_id = target_profile_id
    AND m.status = 'completed';

  UPDATE public.profiles
  SET missions_completed = completed_count,
      updated_at = NOW()
  WHERE id = target_profile_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_metrics_from_reviews()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_profile_review_stats(OLD.reviewee_id);
    RETURN OLD;
  END IF;

  PERFORM public.refresh_profile_review_stats(NEW.reviewee_id);

  IF TG_OP = 'UPDATE' AND OLD.reviewee_id IS DISTINCT FROM NEW.reviewee_id THEN
    PERFORM public.refresh_profile_review_stats(OLD.reviewee_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_metrics_from_missions()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.refresh_profile_missions_completed(OLD.provider_id);
    RETURN OLD;
  END IF;

  PERFORM public.refresh_profile_missions_completed(NEW.provider_id);

  IF TG_OP = 'UPDATE' AND OLD.provider_id IS DISTINCT FROM NEW.provider_id THEN
    PERFORM public.refresh_profile_missions_completed(OLD.provider_id);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_profile_metrics_from_reviews ON public.reviews;
CREATE TRIGGER trigger_sync_profile_metrics_from_reviews
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_metrics_from_reviews();

DROP TRIGGER IF EXISTS trigger_sync_profile_metrics_from_missions ON public.missions;
CREATE TRIGGER trigger_sync_profile_metrics_from_missions
AFTER INSERT OR UPDATE OR DELETE ON public.missions
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_metrics_from_missions();

UPDATE public.profiles p
SET rating = review_stats.avg_rating,
    reviews_count = review_stats.total_reviews,
    missions_completed = mission_stats.completed_count,
    updated_at = NOW()
FROM (
  SELECT
    pr.id,
    COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS avg_rating,
    COUNT(r.id) AS total_reviews
  FROM public.profiles pr
  LEFT JOIN public.reviews r ON r.reviewee_id = pr.id
  GROUP BY pr.id
) AS review_stats
JOIN (
  SELECT
    pr.id,
    COUNT(m.id) FILTER (WHERE m.status = 'completed' AND m.provider_id = pr.id) AS completed_count
  FROM public.profiles pr
  LEFT JOIN public.missions m ON m.provider_id = pr.id
  GROUP BY pr.id
) AS mission_stats
ON mission_stats.id = review_stats.id
WHERE p.id = review_stats.id;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can update their own mission images'
  ) THEN
    CREATE POLICY "Users can update their own mission images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'mission-images'
      AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
      bucket_id = 'mission-images'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Users can delete their own mission images'
  ) THEN
    CREATE POLICY "Users can delete their own mission images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'mission-images'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;
