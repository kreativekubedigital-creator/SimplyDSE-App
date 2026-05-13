'use client';

import { useState } from 'react';
import Navbar from './Navbar';
import LoginModal from './LoginModal';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <>
      <Navbar onLoginClick={() => setIsLoginOpen(true)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      {children}
    </>
  );
}
