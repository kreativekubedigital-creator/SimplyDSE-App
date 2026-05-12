'use client';

import React from 'react';
import { HRDashboardSidebar } from '@/components/dashboard/HRDashboardSidebar';
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <HRDashboardSidebar />
      <div className="pl-[280px] flex flex-col min-h-screen">
        <DashboardNavbar />
        <main className="flex-1 p-8 pb-20">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
