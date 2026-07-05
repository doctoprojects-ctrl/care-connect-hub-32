
CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL,
  patient_name TEXT NOT NULL,
  doctor_name TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMPTZ,
  paid_by TEXT,
  dispensed_at TIMESTAMPTZ,
  dispensed_by TEXT,
  total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.prescriptions TO anon, authenticated;
GRANT ALL ON public.prescriptions TO service_role;

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public access prescriptions" ON public.prescriptions FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER prescriptions_updated_at BEFORE UPDATE ON public.prescriptions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.prescriptions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prescriptions;
