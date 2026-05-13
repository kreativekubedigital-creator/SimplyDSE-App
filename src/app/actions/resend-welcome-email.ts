'use server';

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

interface ResendRequest {
  adminEmail: string;
  orgName: string;
  orgSlug: string;
  tempPassword?: string;
}

export async function resendWelcomeEmail(data: ResendRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const loginLink = `https://${data.orgSlug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'simplydse.online'}/login`;

  try {
    const { error } = await resend.emails.send({
      from: 'SimplyDSE <onboarding@simplydse.online>',
      to: data.adminEmail,
      subject: `Resending Your SimplyDSE Credentials - ${data.orgName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px;">
          <h1 style="color: #1e293b; font-size: 24px; margin-bottom: 24px;">Your SimplyDSE Credentials</h1>
          <p style="color: #64748b; font-size: 16px; line-height: 24px;">
            Hello, we are resending the access credentials for your <strong>${data.orgName}</strong> workspace. 
            You can use the details below to log in to your HR dashboard.
          </p>
          
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 24px; margin: 32px 0;">
            <p style="margin: 0 0 12px 0;"><strong>Dashboard Link:</strong> <a href="${loginLink}" style="color: #2563eb;">${loginLink}</a></p>
            <p style="margin: 0 0 12px 0;"><strong>Email:</strong> ${data.adminEmail}</p>
            <p style="margin: 0;"><strong>Temporary Password:</strong> ${data.tempPassword || 'SimplyDSE2024!'}</p>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 20px;">
            If you have already changed your password, the temporary one above will no longer work. 
            In that case, please use the "Forgot Password" link on the login page.
          </p>

          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">
            This is an automated message from SimplyDSE.
          </p>
        </div>
      `
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Failed to resend email:', error);
    return { success: false, error: error.message };
  }
}
