
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
    try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
                if (key && val) process.env[key] = val;
            }
        });
    } catch (e) {
        console.error("Error reading env:", e);
    }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars. Found keys:", Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    console.log("--- Categories ---");
    const { data: cats, error: cErr } = await supabase.from('categories').select('*');
    if (cErr) console.error(JSON.stringify(cErr));
    else console.log(JSON.stringify(cats, null, 2));

    console.log("\n--- Products (id, title, category) ---");
    const { data: prods, error: pErr } = await supabase.from('products').select('id, title, category');
    if (pErr) console.error(JSON.stringify(pErr));
    else console.log(JSON.stringify(prods, null, 2));
}

debug();
