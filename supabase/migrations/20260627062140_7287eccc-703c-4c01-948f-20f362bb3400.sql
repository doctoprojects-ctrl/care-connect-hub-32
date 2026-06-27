
CREATE TABLE public.app_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin','doctor','reception','cashier','supervisor','marketing','patient')),
  pin TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(first_name, pin)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_users TO authenticated;
GRANT ALL ON public.app_users TO service_role;

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Since this app uses PIN auth (not Supabase auth), allow anon to manage users from the admin UI.
CREATE POLICY "Anon can read app_users" ON public.app_users FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert app_users" ON public.app_users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update app_users" ON public.app_users FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete app_users" ON public.app_users FOR DELETE TO anon USING (true);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_users TO anon;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_app_users_updated
BEFORE UPDATE ON public.app_users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed default users
INSERT INTO public.app_users (first_name, last_name, email, role, pin) VALUES
  ('Elton','Admin','elton@clinic.com','admin','E301277'),
  ('Sarah','Johnson','sarah.johnson@clinic.com','doctor','1234'),
  ('Mary','Smith','mary.smith@clinic.com','reception','5678'),
  ('Cathy','Cashier','cathy@clinic.com','cashier','9999'),
  ('Sam','Supervisor','sam@clinic.com','supervisor','7777'),
  ('Mona','Marketing','mona@clinic.com','marketing','4321')
ON CONFLICT DO NOTHING;
