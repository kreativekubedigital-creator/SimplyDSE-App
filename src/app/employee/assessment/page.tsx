import React from 'react';
import { AssessmentEngine } from '@/components/assessment/AssessmentEngine';

export const metadata = {
  title: 'Workstation Assessment | SimplyDSE',
  description: 'Complete your DSE workstation assessment.',
};

export default async function AssessmentPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const id = typeof params.id === 'string' ? params.id : undefined;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* We can include a simplified header here if needed, or let the layout handle it */}
      <main className="container mx-auto px-4 py-8">
        <AssessmentEngine assessmentId={id} />
      </main>
    </div>
  );
}
