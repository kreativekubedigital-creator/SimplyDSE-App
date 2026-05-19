import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// --- SECURITY SAFEGUARDS ---
if (!supabaseUrl || !serviceRoleKey) {
  console.error('⛔ ERROR: Missing Supabase URL or service role key in env.');
  process.exit(1);
}

// 1. Block production url
const isProduction = !supabaseUrl.includes('localhost') && !supabaseUrl.includes('127.0.0.1');
if (isProduction) {
  console.error('⛔ SECURITY ALERT: Individual auth update operations via CLI are strictly blocked on non-local environments!');
  process.exit(1);
}

// 2. Require confirmation phrase
if (process.argv[2] !== 'CONFIRM_INDIVIDUAL_RESET_OPERATION') {
  console.error('⛔ ERROR: You must pass the confirmation phrase "CONFIRM_INDIVIDUAL_RESET_OPERATION" as the first argument.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('Resetting passwords for testing...');

  const emails = ['edimevergouk@gmail.com', 'abahjohnakor@gmail.com', 'kreativekubedigital@gmail.com'];
  
  // NEVER use a single hardcoded shared password in production or commit sensitive credentials.
  const newPassword = process.env.TEST_DEVELOPMENT_PASSWORD;
  if (!newPassword || newPassword.length < 12) {
    console.error('⛔ ERROR: Please define a secure TEST_DEVELOPMENT_PASSWORD (at least 12 chars) in your .env.local first.');
    process.exit(1);
  }

  for (const email of emails) {
    console.log(`Processing: ${email}`);
    // Get user by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }
    
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log(`User not found for: ${email}`);
      continue;
    }
    
    // Update user password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );
    
    if (updateError) {
      console.error(`Failed to update password for ${email}:`, updateError);
    } else {
      console.log(`Successfully updated password for ${email}`);
    }
  }
}

main();
