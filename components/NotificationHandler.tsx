'use client';

import { useNotifications } from '@/lib/hooks/use-notifications';

export function NotificationHandler() {
  useNotifications();
  return null; // This component doesn't render anything
}
