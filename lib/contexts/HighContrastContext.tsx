"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { updateUserSetting } from '@/lib/db';

interface HighContrastContextType {
  highContrast: boolean;
  toggleHighContrast: () => Promise<void>;
}

const HighContrastContext = createContext<HighContrastContextType | undefined>(undefined);

export function HighContrastProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [highContrast, setHighContrast] = useState(false);

  // Sync with user profile
  useEffect(() => {
    if (profile?.settings?.accessibility?.highContrast) {
      setHighContrast(profile.settings.accessibility.highContrast);
    }
  }, [profile]);

  // Apply high contrast class to document
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const toggleHighContrast = async () => {
    const newValue = !highContrast;
    setHighContrast(newValue);

    // Persist to user profile if logged in
    if (user) {
      try {
        await updateUserSetting(user.uid, 'settings.accessibility.highContrast', newValue);
      } catch (error) {
        console.error('Failed to save high contrast setting:', error);
      }
    } else {
      // Store in localStorage for anonymous users
      localStorage.setItem('highContrast', String(newValue));
    }
  };

  return (
    <HighContrastContext.Provider value={{ highContrast, toggleHighContrast }}>
      {children}
    </HighContrastContext.Provider>
  );
}

export function useHighContrast() {
  const context = useContext(HighContrastContext);
  if (context === undefined) {
    throw new Error('useHighContrast must be used within a HighContrastProvider');
  }
  return context;
}
