'use client';

import { useNotifications } from '@/lib/hooks/use-notifications';
import { useEffect } from 'react';

export function NotificationHandler() {
  const { token, error } = useNotifications();

  useEffect(() => {
    if (token) {
      console.log('✅ FCM Notification Token Ready:', token);
      // In a real implementation, you would post this token to an API
      // fetch('/api/register-token', { method: 'POST', body: JSON.stringify({ token }) });
    }
  }, [token]);

  useEffect(() => {
    if (error) {
      // Log error but don't show to user - notifications are optional
      console.warn('⚠️ Notifications unavailable:', error);
    }
  }, [error]);

  return null; // This component doesn't render anything
}
