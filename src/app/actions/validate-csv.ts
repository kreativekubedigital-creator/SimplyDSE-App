'use server';

import { createClient } from '@supabase/supabase-js';

interface ValidationResult {
  firstName: string;
  lastName: string;
  email: string;
  dept?: string;
  status: 'valid' | 'error' | 'warning';
  error?: string;
  isSSOEligible: boolean;
  domain: string;
}

export async function validateCSVEmployees(organizationId: string, employees: any[]) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    // 1. Fetch verified domains
    const { data: domains } = await supabaseAdmin
      .from('organization_domains')
      .select('domain')
      .eq('organization_id', organizationId)
      .eq('verified', true);
    
    const verifiedDomains = domains?.map(d => d.domain.toLowerCase()) || [];

    const validatedData: ValidationResult[] = employees.map(emp => {
      const email = (emp.email || '').toLowerCase().trim();
      const domain = email.split('@')[1] || '';
      const isSSOEligible = verifiedDomains.includes(domain);
      
      let status: 'valid' | 'error' | 'warning' = 'valid';
      let error = '';

      if (!emp.firstName || !emp.lastName) {
        status = 'error';
        error = 'Missing name fields';
      } else if (!email || !email.includes('@')) {
        status = 'error';
        error = 'Invalid email format';
      } else if (domain && !isSSOEligible) {
        // Not necessarily an error, but a warning for "External" user
        status = 'warning';
        error = 'External domain (Email/Password login)';
      }

      return {
        firstName: emp.firstName || 'Unknown',
        lastName: emp.lastName || 'User',
        email: email,
        dept: emp.department || emp.dept || 'General',
        status,
        error,
        isSSOEligible,
        domain
      };
    });

    return { success: true, data: validatedData };
  } catch (error: any) {
    console.error('Validation Error:', error);
    return { success: false, error: error.message };
  }
}
