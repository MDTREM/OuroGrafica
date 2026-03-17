import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('products').select('id, title, image, images, variations');
    if (error) {
        console.error(error);
        return;
    }

    console.log(`Found ${data.length} products`);
    if (data.length > 0) {
        data.forEach(p => {
            if (p.variations && p.variations.some(v => v.images && Object.keys(v.images).length > 0)) {
                console.log("-------");
                console.log(`Product: ${p.title}`);
                const varsWithImages = p.variations.filter(v => v.images && Object.keys(v.images).length > 0);
                console.log(JSON.stringify(varsWithImages, null, 2));
            }
        });
    }
}

check();
