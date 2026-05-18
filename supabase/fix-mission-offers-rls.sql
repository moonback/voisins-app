-- Quick fix for mission_offers RLS policies
-- Run this in Supabase SQL Editor if you haven't run fix-1.sql yet

-- Policy for reading offers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'mission_offers'
      AND policyname = 'Mission participants can read offers'
  ) THEN
    CREATE POLICY "Mission participants can read offers"
    ON public.mission_offers FOR SELECT
    USING (
      auth.uid() = provider_id
      OR EXISTS (
        SELECT 1
        FROM public.missions m
        WHERE m.id = mission_id
          AND m.client_id = auth.uid()
      )
    );
  END IF;
END $$;

-- Policy for creating offers (THIS IS THE ONE YOU NEED)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'mission_offers'
      AND policyname = 'Providers can create offers on open missions'
  ) THEN
    CREATE POLICY "Providers can create offers on open missions"
    ON public.mission_offers FOR INSERT
    TO authenticated
    WITH CHECK (
      auth.uid() = provider_id
      AND EXISTS (
        SELECT 1
        FROM public.missions m
        WHERE m.id = mission_id
          AND m.status = 'open'
          AND m.client_id <> provider_id
      )
    );
  END IF;
END $$;

-- Policy for updating offers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'mission_offers'
      AND policyname = 'Mission owners can update offers'
  ) THEN
    CREATE POLICY "Mission owners can update offers"
    ON public.mission_offers FOR UPDATE
    TO authenticated
    USING (
      auth.uid() = provider_id
      OR EXISTS (
        SELECT 1
        FROM public.missions m
        WHERE m.id = mission_id
          AND m.client_id = auth.uid()
      )
    )
    WITH CHECK (
      auth.uid() = provider_id
      OR EXISTS (
        SELECT 1
        FROM public.missions m
        WHERE m.id = mission_id
          AND m.client_id = auth.uid()
      )
    );
  END IF;
END $$;
