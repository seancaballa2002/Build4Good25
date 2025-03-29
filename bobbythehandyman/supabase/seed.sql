-- Seed file for Supabase

-- Clear existing data (if needed for testing)
DELETE FROM public.quotes;
DELETE FROM public.requests;
DELETE FROM public.users;

-- Insert test users
INSERT INTO public.users (id, name, email, phone)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'John Doe', 'john@example.com', '+19876543210'),
  ('00000000-0000-0000-0000-000000000002', 'Jane Smith', 'jane@example.com', '+12345678901'),
  ('00000000-0000-0000-0000-000000000003', 'Alex Johnson', 'alex@example.com', '+15551234567');

-- Insert test requests
INSERT INTO public.requests (id, user_id, issue, description, address, times_available, desired_price_range, text_input)
VALUES 
  (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'Leaky Faucet',
    'The kitchen faucet has been leaking consistently for about a week.',
    '123 Main St, Anytown, TX 75001',
    '["Monday 9am-12pm", "Tuesday 1pm-5pm", "Friday 9am-5pm"]',
    '$50-$150',
    'I need help with a leaky kitchen faucet that started about a week ago. It''s dripping constantly and wasting water.'
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000002',
    'Broken Light Switch',
    'Light switch in the master bedroom doesn''t work at all.',
    '456 Oak Dr, Somecity, TX 75002',
    '["Wednesday 10am-2pm", "Thursday 9am-12pm"]',
    '$75-$200',
    'The light switch in my master bedroom isn''t working at all. I tried changing the bulb but that didn''t help.'
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000003',
    'AC Not Cooling',
    'Air conditioner is running but not cooling the house. It''s getting very hot inside.',
    '789 Pine Ave, Othercity, TX 75003',
    '["Monday 12pm-6pm", "Saturday 9am-2pm"]',
    '$100-$300',
    'My air conditioner is running but not cooling the house. The temperature has been rising and it''s getting uncomfortable.'
  );

-- Insert test quotes (including some with Retell call data)
INSERT INTO public.quotes (id, request_id, provider_name, quote_price, available_time, duration, included_in_quote, contact_info, call_id, call_status)
VALUES 
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000101',
    'Joe''s Plumbing',
    '$85',
    'Tuesday at 2pm',
    '1 hour',
    'Diagnostic and standard faucet repair. Parts may cost extra if replacement is needed.',
    '+19729035634',
    'call_sim_1234567890',
    'completed'
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000101',
    'A-1 Repairs',
    '$120',
    'Monday at 10am',
    '1-2 hours',
    'Full faucet repair with parts and labor included. 30-day warranty on work.',
    '+14693445871',
    'call_sim_2345678901',
    'pending'
  );

-- Insert failed quotes with error messages
INSERT INTO public.quotes (id, request_id, provider_name, quote_price, available_time, duration, included_in_quote, contact_info, call_id, call_status, call_error)
VALUES 
  (
    '00000000-0000-0000-0000-000000000203',
    '00000000-0000-0000-0000-000000000102',
    'Elite Handyman Services',
    '$95',
    'Thursday at 10am',
    '30-45 minutes',
    'Diagnosis and repair of the light switch. Replacement switch included if needed.',
    '+18322486814',
    'call_sim_3456789012',
    'failed',
    'Provider did not answer the call'
  ),
  (
    '00000000-0000-0000-0000-000000000204',
    '00000000-0000-0000-0000-000000000103',
    'Cool Air Solutions',
    '$189',
    'Saturday at 11am',
    '2-3 hours',
    'Full AC diagnostic, refrigerant check, and basic repairs. Major parts not included.',
    '+15551234567',
    'call_sim_4567890123',
    'failed',
    'Network error during call connection'
  ); 