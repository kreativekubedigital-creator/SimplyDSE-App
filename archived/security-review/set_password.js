import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

let env = '';
try {
  env = fs.readFileSync('.env.local', 'utf8');
} catch (e) {
  console.error('⛔ ERROR: Missing .env.local file.');
  process.exit(1);
}

const lines = env.split('\n');
const envVars = {};
for (const line of lines) {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    envVars[key.trim()] = rest.join('=').trim();
  }
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY || '';

// --- SECURITY SAFEGUARDS ---
if (!supabaseUrl || !supabaseKey) {
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
if (process.argv[2] !== 'CONFIRM_SET_PASSWORD_OPERATION') {
  console.error('⛔ ERROR: You must pass the confirmation phrase "CONFIRM_SET_PASSWORD_OPERATION" as the first argument.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setPassword() {
  console.log('Fetching users...');
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error.message);
    process.exit(1);
  }
  
  const user = users.find(u => u.email === 'kreativekubedigital@gmail.com');
  
  // NEVER use a single hardcoded shared password in production or commit sensitive credentials.
  const newPassword = envVars.TEST_DEVELOPMENT_PASSWORD;
  if (!newPassword || newPassword.length < 12) {
    console.error('⛔ ERROR: Please define a secure TEST_DEVELOPMENT_PASSWORD (at least 12 chars) in your .env.local first.');
    process.exit(1);
  }

  if (user) {
    console.log('Updating password for user:', user.id);
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(user.id, { 
      password: newPassword 
    });
    
    if (updateError) {
      console.error('Failed to update:', updateError.message);
    } else {
      console.log('Password updated successfully!');
      
      // Also ensure profile exists
      await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        role: 'super_admin',
        full_name: 'Platform Administrator'
      });
      console.log('Profile ensured.');
    }
  } else {
    console.log('User not found!');
  }
  process.exit(0);
}
setPassword();
