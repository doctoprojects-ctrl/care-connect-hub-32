
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  date_of_birth DATE, gender TEXT, phone TEXT, email TEXT, address TEXT,
  emergency_contact JSONB DEFAULT '{}'::jsonb,
  medical_history JSONB DEFAULT '{"allergies":[],"currentMedications":[],"chronicConditions":[],"pastSurgeries":[]}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO anon, authenticated;
GRANT ALL ON public.patients TO service_role;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER patients_updated BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL, last_name TEXT NOT NULL,
  specialization TEXT, email TEXT, phone TEXT,
  working_hours JSONB DEFAULT '{"start":"09:00","end":"17:00","workingDays":[1,2,3,4,5]}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doctors TO anon, authenticated;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access doctors" ON public.doctors FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER doctors_updated BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL, appointment_time TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 30,
  type TEXT NOT NULL DEFAULT 'consultation',
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO anon, authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER appointments_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

CREATE TABLE public.queue_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dept TEXT NOT NULL, number INTEGER NOT NULL, code TEXT NOT NULL,
  patient_id UUID, patient_name TEXT NOT NULL, appointment_id UUID,
  status TEXT NOT NULL DEFAULT 'waiting', room TEXT, called_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  called_at TIMESTAMPTZ, served_at TIMESTAMPTZ, done_at TIMESTAMPTZ
);
CREATE INDEX queue_tickets_dept_created ON public.queue_tickets (dept, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.queue_tickets TO anon, authenticated;
GRANT ALL ON public.queue_tickets TO service_role;
ALTER TABLE public.queue_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access queue_tickets" ON public.queue_tickets FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.queue_tickets REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.queue_tickets;

CREATE OR REPLACE FUNCTION public.issue_queue_ticket(
  p_dept TEXT, p_patient_name TEXT, p_patient_id UUID, p_appointment_id UUID
) RETURNS public.queue_tickets
LANGUAGE plpgsql SET search_path = public AS $$
DECLARE v_next INT; v_prefix TEXT; v_row public.queue_tickets;
BEGIN
  v_prefix := CASE p_dept WHEN 'doctor' THEN 'DR' WHEN 'pharmacy' THEN 'PH' WHEN 'triage' THEN 'TR' ELSE upper(substr(p_dept,1,2)) END;
  SELECT COALESCE(MAX(number),0)+1 INTO v_next FROM public.queue_tickets
    WHERE dept = p_dept AND created_at >= date_trunc('day', now()) AND created_at < date_trunc('day', now()) + interval '1 day';
  INSERT INTO public.queue_tickets(dept, number, code, patient_id, patient_name, appointment_id)
  VALUES (p_dept, v_next, v_prefix || '-' || lpad(v_next::text,2,'0'), p_patient_id, p_patient_name, p_appointment_id)
  RETURNING * INTO v_row;
  RETURN v_row;
END; $$;
GRANT EXECUTE ON FUNCTION public.issue_queue_ticket(TEXT,TEXT,UUID,UUID) TO anon, authenticated;

CREATE TABLE public.pharmacy_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT, name TEXT NOT NULL, category TEXT,
  unit_price NUMERIC NOT NULL DEFAULT 0, stock INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 0, supplier TEXT, expiry_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pharmacy_items TO anon, authenticated;
GRANT ALL ON public.pharmacy_items TO service_role;
ALTER TABLE public.pharmacy_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access pharmacy_items" ON public.pharmacy_items FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER pharmacy_items_updated BEFORE UPDATE ON public.pharmacy_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_number TEXT NOT NULL, cashier_id TEXT, customer_name TEXT,
  lines JSONB NOT NULL DEFAULT '[]'::jsonb, total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO anon, authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access sales" ON public.sales FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT, name TEXT NOT NULL, serial_number TEXT, location TEXT,
  purchase_date DATE, status TEXT NOT NULL DEFAULT 'operational', notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.equipment TO anon, authenticated;
GRANT ALL ON public.equipment TO service_role;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access equipment" ON public.equipment FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER equipment_updated BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.service_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL, name TEXT NOT NULL, category TEXT,
  price NUMERIC NOT NULL DEFAULT 0, description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_prices TO anon, authenticated;
GRANT ALL ON public.service_prices TO service_role;
ALTER TABLE public.service_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access service_prices" ON public.service_prices FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER service_prices_updated BEFORE UPDATE ON public.service_prices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL, patient_id UUID, patient_name TEXT,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE, due_date DATE,
  lines JSONB NOT NULL DEFAULT '[]'::jsonb, total NUMERIC NOT NULL DEFAULT 0,
  amount_paid NUMERIC NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'unpaid', notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO anon, authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER invoices_updated BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.patient_credits (
  patient_id UUID PRIMARY KEY, patient_name TEXT,
  balance NUMERIC NOT NULL DEFAULT 0, last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.patient_credits TO anon, authenticated;
GRANT ALL ON public.patient_credits TO service_role;
ALTER TABLE public.patient_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access patient_credits" ON public.patient_credits FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.cash_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_number TEXT NOT NULL, cashier_id TEXT, cashier_name TEXT,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(), closed_at TIMESTAMPTZ,
  opening_float NUMERIC NOT NULL DEFAULT 0,
  expected_cash NUMERIC NOT NULL DEFAULT 0, expected_card NUMERIC NOT NULL DEFAULT 0, expected_mobile NUMERIC NOT NULL DEFAULT 0,
  counted_cash NUMERIC NOT NULL DEFAULT 0, counted_card NUMERIC NOT NULL DEFAULT 0, counted_mobile NUMERIC NOT NULL DEFAULT 0,
  variance NUMERIC NOT NULL DEFAULT 0, notes TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cash_ups TO anon, authenticated;
GRANT ALL ON public.cash_ups TO service_role;
ALTER TABLE public.cash_ups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access cash_ups" ON public.cash_ups FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID, doctor_id UUID, doctor_name TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  chief_complaint TEXT, diagnosis TEXT, treatment TEXT, prescription TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.consultations TO anon, authenticated;
GRANT ALL ON public.consultations TO service_role;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access consultations" ON public.consultations FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID, recorded_by TEXT, recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  blood_pressure TEXT, heart_rate INTEGER, temperature NUMERIC,
  respiratory_rate INTEGER, oxygen_saturation INTEGER,
  weight NUMERIC, height NUMERIC, bmi NUMERIC, notes TEXT
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vitals TO anon, authenticated;
GRANT ALL ON public.vitals TO service_role;
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access vitals" ON public.vitals FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.medical_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID, patient_name TEXT, doctor_name TEXT,
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE, from_date DATE, to_date DATE,
  reason TEXT, recommendation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_certificates TO anon, authenticated;
GRANT ALL ON public.medical_certificates TO service_role;
ALTER TABLE public.medical_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access medical_certificates" ON public.medical_certificates FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, media_type TEXT NOT NULL, media_url TEXT NOT NULL,
  uploaded_by TEXT, uploaded_by_id TEXT, duration_seconds INTEGER DEFAULT 8,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads TO anon, authenticated;
GRANT ALL ON public.ads TO service_role;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access ads" ON public.ads FOR ALL USING (true) WITH CHECK (true);
ALTER TABLE public.ads REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ads;

INSERT INTO public.doctors (first_name, last_name, specialization, email, phone) VALUES
  ('Sarah','Johnson','General Medicine','sarah.johnson@clinic.com','+1-555-0123'),
  ('Michael','Brown','Cardiology','michael.brown@clinic.com','+1-555-0124');

INSERT INTO public.patients (first_name, last_name, date_of_birth, gender, phone, email, address) VALUES
  ('John','Doe','1985-06-15','male','+1-555-0101','john.doe@email.com','123 Main St'),
  ('Alice','Wilson','1992-03-22','female','+1-555-0103','alice.wilson@email.com','456 Oak Ave');

INSERT INTO public.service_prices (code, name, category, price, description) VALUES
  ('CONS-GEN','General Consultation','Consultation',350,'Standard 30-min consult'),
  ('CONS-FUP','Follow-up Visit','Consultation',200,NULL),
  ('PROC-ECG','ECG','Procedure',450,NULL),
  ('PROC-NEB','Nebulization','Procedure',180,NULL),
  ('LAB-BLD','Blood Test (CBC)','Laboratory',280,NULL),
  ('INJ-VAC','Vaccination','Procedure',320,NULL);

INSERT INTO public.pharmacy_items (barcode, name, category, unit_price, stock, reorder_level, supplier, expiry_date) VALUES
  ('6001234500017','Paracetamol 500mg (20 tabs)','Analgesic',25,120,30,'MediSupply','2027-06-30'),
  ('6001234500024','Amoxicillin 250mg (15 caps)','Antibiotic',65,40,20,'PharmaCo','2026-12-15'),
  ('6001234500031','Ibuprofen 400mg (10 tabs)','Analgesic',35,15,25,'MediSupply','2026-09-01'),
  ('6001234500048','Cough Syrup 100ml','Cold & Flu',55,60,15,'PharmaCo','2026-11-20');

INSERT INTO public.equipment (barcode, name, serial_number, location, purchase_date, status) VALUES
  ('EQ-1000001','ECG Machine','SN-ECG-001','Consult Room 1','2024-03-15','operational'),
  ('EQ-1000002','Defibrillator','SN-DEF-002','Emergency','2023-08-01','maintenance'),
  ('EQ-1000003','Blood Pressure Monitor','SN-BPM-003','Reception','2025-01-10','operational'),
  ('EQ-1000004','Nebulizer','SN-NEB-004','Consult Room 2','2024-09-22','faulty');
