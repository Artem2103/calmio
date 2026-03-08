import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ffcswdfgtwhougwgvprn.supabase.co";
const SUPABASE_KEY = "sb_publishable_K4MwWNyAdgKfQ0MmbGwlww_FuWursQH";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
