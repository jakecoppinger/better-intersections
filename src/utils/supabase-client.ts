import { createClient} from "@supabase/supabase-js";

const supabaseUrl = "https://wcwrjovyjkqowlnsjtnl.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indjd3Jqb3Z5amtxb3dsbnNqdG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ3ODI3NTAsImV4cCI6MjAxMDM1ODc1MH0.DXAFXyYR9umg-GygCHOvwG1xXQI9Fxom9lkooQJWJE4";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);