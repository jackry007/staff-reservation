import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://whbbsarqmrgzupmjhshe.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndoYmJzYXJxbXJnenVwbWpoc2hlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTU3MjcsImV4cCI6MjA2OTQ3MTcyN30.nVP-xWxhU6tsaWY9W05nZD2TcBrXVoR8zt_g607AWco";

export const supabase = createClient(supabaseUrl, supabaseKey);