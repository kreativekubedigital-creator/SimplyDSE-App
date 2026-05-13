import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const envVars = {};
for (const line of lines) {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    envVars[key.trim()] = rest.join('=').trim();
  }
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function setPassword() {
  console.log('Fetching users...');
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error.message);
    process.exit(1);
  }
  
  const user = users.find(u => u.email === 'kreativekubedigital@gmail.com');
  if (user) {
    console.log('Updating password for user:', user.id);
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(user.id, { 
      password: 'Arilex@2846??' 
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
