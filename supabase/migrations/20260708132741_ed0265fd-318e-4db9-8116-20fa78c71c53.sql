
-- 1) Favorites flag on projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS is_favorite boolean NOT NULL DEFAULT false;

-- 2) Roles: enum + user_roles + has_role
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 3) project_views
CREATE TABLE IF NOT EXISTS public.project_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS project_views_project_id_idx ON public.project_views (project_id);
CREATE INDEX IF NOT EXISTS project_views_viewed_at_idx ON public.project_views (viewed_at DESC);

GRANT INSERT ON public.project_views TO anon, authenticated;
GRANT SELECT ON public.project_views TO authenticated;
GRANT ALL ON public.project_views TO service_role;

ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can log a view" ON public.project_views;
CREATE POLICY "Anyone can log a view"
  ON public.project_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can read views" ON public.project_views;
CREATE POLICY "Admins can read views"
  ON public.project_views FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
