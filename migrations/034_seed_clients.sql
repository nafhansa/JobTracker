-- Seed 55 clients for freelance/client tracker
-- Run manually in Supabase SQL Editor

-- Generate 55 clients using INSERT with random data
INSERT INTO freelance_jobs (
  id, user_id, client_name, client_contact, service_type, product,
  potential_price, actual_price, currency, start_date, end_date,
  duration_days, status, created_at, updated_at
)
SELECT
  -- Random 20-char ID
  substr(md5(random()::text || clock_timestamp()::text || i::text), 1, 20),
  'I3ExR752hpbPljCHHiukl1eayI72',
  -- Client name (cycling through array)
  (ARRAY[
    'Tokopedia', 'Gojek', 'Bukalapak', 'Traveloka', 'OVO',
    'Dana Indonesia', 'Shopee Indonesia', 'Blibli', 'Kopi Kenangan', 'Ruangguru',
    'Halodoc', 'Kredivo', 'Flip Indonesia', 'Xendit', 'Midtrans',
    'Kata.ai', 'Pintaria', 'Sirclo', 'TaniHub', 'Sayurbox',
    'Warung Pintar', 'Grab Indonesia', 'GoTo Financial', 'BukaWarung', 'Moka POS',
    'Qris Indonesia', 'Doku', 'LinkAja', 'Jenius', 'Bank Jago',
    'Ajaib', 'Bibit Indonesia', 'Pluang', 'Indodax', 'Tokocrypto',
    'Kulina', 'Farmasi.id', 'Alodokter', 'KlikDokter', 'Prodia',
    'Pegadaian Digital', 'Pos Indonesia', 'JNE Express', 'SiCepat', 'Anteraja',
    'Ninja Express', 'J&T Express', 'Wahana', 'ID Express', 'GoSend',
    'Kurio', 'Dana Desa', 'Cermati', 'Investree', 'Amartha'
  ])[1 + ((i - 1) % 55)],
  -- Client contact email
  (ARRAY[
    'contact@tokopedia.com', 'hello@gojek.com', 'info@bukalapak.com', 'admin@traveloka.com', 'team@ovo.id',
    'support@dana.id', 'sales@shopee.co.id', 'business@blibli.com', 'partnership@kopikenangan.com', 'dev@ruangguru.com',
    'contact@halodoc.com', 'hello@kredivo.com', 'info@flip.co.id', 'admin@xendit.co', 'team@midtrans.com',
    'support@kata.ai', 'sales@pintaria.com', 'business@sirclo.io', 'partnership@tanihub.com', 'dev@sayurbox.com',
    'contact@warungpintar.com', 'hello@grab.com', 'info@goto.go.id', 'admin@bukawarung.id', 'team@moka.id',
    'support@qris.id', 'sales@doku.com', 'business@linkaja.id', 'partnership@jenius.com', 'dev@bankjago.com',
    'contact@ajaib.co.id', 'hello@bibit.id', 'info@pluang.com', 'admin@indodax.com', 'team@tokocrypto.com',
    'support@kulina.id', 'sales@farmasi.id', 'business@alodokter.com', 'partnership@klikdokter.com', 'dev@prodia.co.id',
    'contact@pegadaian.co.id', 'hello@posindonesia.co.id', 'info@jne.co.id', 'admin@sicepat.com', 'team@anteraja.id',
    'support@ninja.co.id', 'sales@jtexpress.co.id', 'business@wahana.com', 'partnership@idexpress.com', 'dev@gosend.co.id',
    'contact@kurio.id', 'hello@danadesa.id', 'info@cermati.com', 'admin@investree.id', 'team@amartha.com'
  ])[1 + ((i - 1) % 55)],
  -- Service type (random)
  (ARRAY[
    'Web Development', 'Mobile App Development', 'UI/UX Design', 'Data Analytics',
    'Cloud Infrastructure', 'DevOps & CI/CD', 'API Integration', 'E-commerce Setup',
    'Digital Marketing', 'SEO Optimization', 'Cybersecurity Audit', 'QA Testing',
    'Technical Consulting', 'System Architecture', 'Database Optimization',
    'Automation Scripts', 'Chatbot Development', 'Payment Integration',
    'CRM Setup', 'ERP Implementation'
  ])[1 + floor(random() * 20)::integer],
  -- Product (random)
  (ARRAY[
    'Landing Page Redesign', 'Mobile App MVP', 'Dashboard Analytics',
    'E-commerce Platform', 'API Gateway Setup', 'CI/CD Pipeline',
    'Customer Portal', 'Inventory System', 'Payment Gateway Integration',
    'Admin Dashboard', 'Reporting System', 'Notification Service',
    'User Authentication System', 'Search Engine Optimization',
    'Data Migration Tool', 'Microservices Architecture',
    'Real-time Chat System', 'Booking System', 'Subscription Management',
    'Document Management System'
  ])[1 + floor(random() * 20)::integer],
  -- Random price between 2,000,000 and 50,000,000
  (2000000 + floor(random() * 48000000))::integer,
  -- Actual price (only for completed)
  NULL,
  'IDR',
  -- Start date (within last 6 months)
  CURRENT_DATE - (floor(random() * 180)::integer),
  -- End date (14-74 days after start)
  CURRENT_DATE - (floor(random() * 180)::integer) + (14 + floor(random() * 60)::integer),
  -- Duration days
  14 + floor(random() * 60)::integer,
  -- Status (random, but will be adjusted below)
  (ARRAY['ongoing', 'completed', 'cancelled'])[1 + floor(random() * 3)::integer],
  -- Created at (within last 6 months)
  NOW() - (floor(random() * 180)::integer || ' days')::interval,
  -- Updated at (within last 30 days)
  NOW() - (floor(random() * 30)::integer || ' days')::interval
FROM generate_series(1, 55) AS i
ON CONFLICT (id) DO NOTHING;

-- Update status based on end date (completed if ended > 30 days ago)
UPDATE freelance_jobs
SET status = 'completed'
WHERE user_id = 'I3ExR752hpbPljCHHiukl1eayI72'
  AND end_date < CURRENT_DATE - 30;

-- Set actual_price for completed jobs (90% of potential)
UPDATE freelance_jobs
SET actual_price = (potential_price * 0.9)::integer
WHERE user_id = 'I3ExR752hpbPljCHHiukl1eayI72'
  AND status = 'completed'
  AND actual_price IS NULL;

-- Verify
SELECT COUNT(*) as total_clients FROM freelance_jobs WHERE user_id = 'I3ExR752hpbPljCHHiukl1eayI72';
SELECT status, COUNT(*) as count FROM freelance_jobs WHERE user_id = 'I3ExR752hpbPljCHHiukl1eayI72' GROUP BY status;
