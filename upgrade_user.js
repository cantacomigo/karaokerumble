
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function upgradeToPro(email) {
    console.log(`Looking up user by email: ${email}`);

    // First find the user's profile by email
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email);

    if (error) {
        console.error('Error fetching profile:', error.message);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log('No profile found with that email. Available profiles:');
        const { data: all } = await supabase.from('profiles').select('id, email, plan');
        console.log(JSON.stringify(all, null, 2));
        return;
    }

    const profile = profiles[0];
    console.log(`Found profile: ${JSON.stringify(profile, null, 2)}`);
    console.log(`Current plan: ${profile.plan}`);

    // Update to pro
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ plan: 'pro' })
        .eq('id', profile.id);

    if (updateError) {
        console.error('Error updating plan:', updateError.message);
    } else {
        console.log(`✅ Successfully upgraded ${email} to Pro!`);
    }
}

upgradeToPro('joaquimcarlosdacruz@gmail.com');
