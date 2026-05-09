import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const { data, error } = await supabase.from('internship_applications').select('*').limit(1);
if (error) console.error(error);
else if (data.length > 0) console.log('COLUMNS:', Object.keys(data[0]));
else console.log('Empty table');
