ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.projects ALTER COLUMN url DROP NOT NULL;