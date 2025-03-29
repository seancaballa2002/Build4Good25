import { supabase } from '@/utils/supabase'; // Assuming utils/supabase.ts path

// 4.1 Insert a User
export async function insertUser(userData: { name: string; email?: string; phone?: string }) {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select() // Optionally return the inserted data
    .single(); // Assuming you insert one user and want it back

  if (error) {
    console.error('Error inserting user:', error);
    return { data: null, error };
  }
  console.log('Inserted user:', data);
  return { data, error: null };
}

// 4.2 Insert a Request
export async function insertRequest(requestData: {
  user_id: string; // Should be the UUID of an existing user
  issue: string;
  description?: string;
  address?: string;
  times_available?: string; // Or string[] if you stringify before insert
  desired_price_range?: string;
}) {
  const { data, error } = await supabase
    .from('requests')
    .insert([requestData])
    .select()
    .single();

  if (error) {
    console.error('Error inserting request:', error);
    return { data: null, error };
  }
  console.log('Inserted request:', data);
  return { data, error: null };
}

// 4.3 Insert a Quote
export async function insertQuote(quoteData: {
  request_id: string; // Should be the UUID of an existing request
  provider_name?: string;
  quote_price?: string;
  available_time?: string;
  duration?: string;
  included_in_quote?: string;
  contact_info?: string;
}) {
  const { data, error } = await supabase
    .from('quotes')
    .insert([quoteData])
    .select()
    .single();

  if (error) {
    console.error('Error inserting quote:', error);
    return { data: null, error };
  }
  console.log('Inserted quote:', data);
  return { data, error: null };
}

// 5.1 Fetching Requests & Their Quotes
export async function fetchRequestsWithQuotes(userId?: string) {
  let query = supabase
    .from('requests')
    .select(`
      id,
      issue,
      description,
      address,
      times_available,
      desired_price_range,
      created_at,
      quotes (
        id,
        provider_name,
        quote_price,
        available_time,
        duration,
        included_in_quote,
        contact_info,
        created_at
      )
    `)
    .order('created_at', { ascending: false }); // Example: order by newest request

  // Optionally filter by user ID if provided
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching requests with quotes:', error);
    return { data: null, error };
  }

  console.log('Fetched Requests with quotes:', data);
  return { data, error: null };
} 