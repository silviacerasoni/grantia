const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('organizations').select('*').limit(5);
    if (error) {
        console.error("Error fetching organizations:", error);
    } else {
        console.log("Organizations found:", data);
        if (data.length === 0) {
            console.log("No organizations found! Seed script needs to be run.");
        }
    }
}

check();
