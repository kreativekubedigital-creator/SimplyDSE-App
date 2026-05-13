const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function totalReset() {
  const email = 'kreativekubedigital@gmail.com';
  console.log(`--- TOTAL ACCOUNT RECONSTRUCTION ---`);

  // 1. Delete existing user from Auth and Public
  const { data: { users } } = await supabase.auth.admin.listUsers();
  const user = users.find(u => u.email === email);
  
  if (user) {
    console.log('Deleting existing user...');
    await supabase.auth.admin.deleteUser(user.id);
    await supabase.from('profiles').delete().eq('id', user.id);
  }

  // 2. Create fresh user
  console.log('Creating fresh Super Admin account...');
  const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: 'SimplyDSE2026!',
    email_confirm: true,
    user_metadata: { role: 'super_admin' }
  });

  if (createError) {
    console.error('Error:', createError.message);
    return;
  }

  // 3. Ensure profile exists with correct role
  console.log('Setting up profile...');
  await supabase.from('profiles').upsert({
    id: newUser.id,
    email: email,
    full_name: 'System Admin',
    role: 'super_admin'
  });

  // 4. Generate Magic Magic Recovery Link
  console.log('Generating Magic Recovery Link...');
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email,
    options: {
      redirectTo: 'https://admin.simplydse.online/admin'
    }
  });

  if (linkError) {
    console.error('Link Error:', linkError.message);
  } else {
    console.log('\n=========================================');
    console.log('SUCCESS! CLICK THE LINK BELOW TO LOGIN:');
    console.log(linkData.properties.action_link);
    console.log('=========================================\n');
  }
}

totalReset();
