import { useState, useEffect } from 'react';
import { getToken, onMessage, Messaging } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';

export function useNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !messaging) return;

    const setupNotifications = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Manual Service Worker Registration for Next.js reliability
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
          
          console.log('[useNotifications] Custom SW Registration Success:', registration);

          // Get registration token using the registered worker
          const currentToken = await getToken(messaging as Messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: registration,
          });

          if (currentToken) {
            console.log('FCM Token:', currentToken);
            setToken(currentToken);
            // In a real app, you'd send this token to your server to store it
          } else {
            console.warn('No registration token available. Request permission to generate one.');
          }
        }
      } catch (err) {
        console.error('An error occurred while retrieving token:', err);
        setError((err as Error).message);
      }
    };

    setupNotifications();

    // Listen for foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[useNotifications] Message received in foreground:', payload);
      // In a real app, you'd trigger a custom UI Alert or Toast here
      if (payload.notification) {
        alert(`${payload.notification.title}\n${payload.notification.body}`);
      }
    });

    return () => unsubscribe();
  }, []);

  return { token, error };
}
