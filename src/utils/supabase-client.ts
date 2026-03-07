import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "../config";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);