'use client';

import React, { useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '@/context/AuthContext';
import { FullPageSpinner } from '@/components/ui/Spinner';

interface AppLayoutProps {
  children: ReactNode;
}

const publicPaths = ['/', '/login', '/register', '/forgot-password'];

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  const isPublicPage = publicPaths.includes(pathname);
  const showSidebar = isAuthenticated && !isPublicPage;

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <div className="min-h-screen">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      
      {showSidebar && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          showSidebar ? 'lg:pl-64' : ''
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default AppLayout;


