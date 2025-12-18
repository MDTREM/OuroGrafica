
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Or service role

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log("--- Categories ---");
    const { data: cats, error: cErr } = await supabase.from('categories').select('*');
    if (cErr) console.error(cErr);
    else console.log(cats);

    console.log("\n--- Products (id, title, category) ---");
    const { data: prods, error: pErr } = await supabase.from('products').select('id, title, category');
    if (pErr) console.error(pErr);
    else console.log(prods);
}

debug();
