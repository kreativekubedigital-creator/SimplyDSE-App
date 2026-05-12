'use client';

import React from 'react';
import { EmployeeSidebar } from '@/components/employee/EmployeeSidebar';
import { EmployeeNavbar } from '@/components/employee/EmployeeNavbar';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <EmployeeSidebar />
      <div className="pl-[280px] flex flex-col min-h-screen">
        <EmployeeNavbar />
        <main className="flex-1 p-10 pb-20">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
