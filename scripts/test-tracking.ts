import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const { data, error } = await supabase.from('partner_activities').insert({
        partner_id: 'ORGANIC',
        session_id: 'test_session',
        visitor_id: 'test_visitor',
        activity_type: 'page_view',
        page_url: 'http://localhost/test',
    });

    console.log('Insert with ORGANIC: ', { data, error });

    const { data: d2, error: e2 } = await supabase.from('partner_activities').insert({
        partner_id: null,
        session_id: 'test_session',
        visitor_id: 'test_visitor',
        activity_type: 'page_view',
        page_url: 'http://localhost/test',
    });
    console.log('Insert with null: ', { data: d2, error: e2 });
}

testInsert();
