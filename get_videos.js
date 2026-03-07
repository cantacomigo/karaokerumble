
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgdheylfoodxjhhsuyuf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnZGhleWxmb29keGpoaHN1eXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NDczMzQsImV4cCI6MjA4ODQyMzMzNH0.vOj0X3-FvzsizOP-wWsWXsq3-rUit5Gst_cpSvsMLdo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function getVideos() {
    const { data, error } = await supabase.from('videos').select('*');
    if (error) {
        console.error(error);
        return;
    }
    console.log(JSON.stringify(data, null, 2));
}

getVideos();
