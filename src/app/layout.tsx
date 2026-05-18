import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../index.css';
import AuthHashHandler from '@/components/AuthHashHandler';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SimplyDSE | Enterprise Compliance Management',
  description: 'The production-grade operational control center for enterprise DSE assessment and compliance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthHashHandler />
        {children}
      </body>
    </html>
  );
}
