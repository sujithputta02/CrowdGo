"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, AppNavigation } from '@/app/components/AppNavigation';
import { useAuth } from '@/components/AuthProvider';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop */}
      <Sidebar />
      
      {/* Mobile Bottom Navigation */}
      <AppNavigation />

      {/* Main Content Area */}
      <div className="md:pl-64 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
