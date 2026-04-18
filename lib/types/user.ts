export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  displayName?: string; // Standardize on name but keep this for compatibility
  photoURL?: string;
  aura: number;
  matchStreak: number;
  timeSaved: number;
  ticket?: {
    gate: string;
    section: string;
    row: string;
    seat: string;
  };
  settings: UserSettings;
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
  accessibility: {
    stepFree: boolean;
    highContrast: boolean;
  };
}
