ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY country ORDER BY created_at ASC) - 1 AS rn
  FROM public.projects
)
UPDATE public.projects p SET position = o.rn FROM ordered o WHERE p.id = o.id;

CREATE INDEX IF NOT EXISTS projects_country_position_idx ON public.projects (country, position);