import { createClient } from '@supabase/supabase-js';

// --- Supabase Initialization ---
// Use environment variables for production secrets
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Corrected env variable name

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables. Application may not function correctly.');

  // Handle the error gracefully in production.
  // Returning null or a default object might be suitable, depending on your app's logic.
  // Avoid throwing an error that crashes the entire application.
  // You might also want to log to an error monitoring service.
  if (!supabaseUrl) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!supabaseServiceKey){
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  //Return a dummy supabase object that will throw errors when used.
  const dummySupabase = {
    from: () => {
      throw new Error("Supabase is not configured correctly");
    },
    // Add other relevant supabase functions that you use and make them throw errors.
    auth: {
      getUser: ()=>{
        throw new Error("Supabase is not configured correctly");
      },
      getSession: ()=>{
        throw new Error("Supabase is not configured correctly");
      }
    }
  }

  return dummySupabase;
}

// Create a single Supabase client instance (can be reused)
// Use Service Role key for admin-level access from the backend
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default supabaseAdmin;