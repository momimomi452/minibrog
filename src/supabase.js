import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://njmifdipjemqdvqzzrsy.supabase.co";

const supabaseKey =
  "sb_publishable_46Ol6jCk6Tc1d8U9qwyKOA_W_JHn_2E";

export const supabase =
  createClient(supabaseUrl, supabaseKey);