import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  console.log('Ensuring assessment-reports bucket exists...');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError);
    return;
  }
  
  const exists = buckets.some(b => b.name === 'assessment-reports');
  if (!exists) {
    const { data, error } = await supabase.storage.createBucket('assessment-reports', {
      public: false,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 10485760 // 10MB
    });
    if (error) {
      console.error('Error creating bucket:', error);
    } else {
      console.log('Bucket assessment-reports created successfully.');
    }
  } else {
    console.log('Bucket already exists.');
  }

  // Also verify if we need an assessments pdf_url column
  // We can't easily alter table with just standard supabase client, but we can check.
}

setup().catch(console.error);
