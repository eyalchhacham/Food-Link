import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rfhpenquqfjmbjriwtvr.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmaHBlbnF1cWZqbWJqcml3dHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1MDM2MjgsImV4cCI6MjA2MTA3OTYyOH0.StF0AWxpzwFHnGekY-KMZVsIR0idEozgI6NGWkXd-I8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
