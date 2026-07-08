
-- Revoke public/anon access and require authenticated users for projects
REVOKE ALL ON public.projects FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;

DROP POLICY IF EXISTS "Anyone can view projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can update projects" ON public.projects;
DROP POLICY IF EXISTS "Anyone can delete projects" ON public.projects;

CREATE POLICY "Authenticated users can view projects"
  ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert projects"
  ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects"
  ON public.projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete projects"
  ON public.projects FOR DELETE TO authenticated USING (true);
