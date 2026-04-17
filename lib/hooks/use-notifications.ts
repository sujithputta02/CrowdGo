import { useState, useEffect } from 'react';
import { getToken, onMessage, Messaging } from 'firebase/messaging';
import { messaging } from '@/lib/firebase';

export function useNotifications() {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !messaging) return;
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported in this browser');
      return;
    }

    const setupNotifications = async () => {
      try {
        // Wait for page to be fully loaded
        if (document.readyState !== 'complete') {
          await new Promise(resolve => window.addEventListener('load', resolve));
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.log('Notification permission not granted');
          return;
        }

        // Check if service worker is already registered
        let registration = await navigator.serviceWorker.getRegistration('/');
        
        if (!registration) {
          // Register service worker if not already registered
          registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });
          console.log('[useNotifications] Service Worker registered:', registration);
        } else {
          console.log('[useNotifications] Service Worker already registered:', registration);
        }

        // Wait for service worker to be active
        if (registration.installing) {
          await new Promise<void>((resolve) => {
            registration!.installing!.addEventListener('statechange', function() {
              if (this.state === 'activated') {
                resolve();
              }
            });
          });
        } else if (registration.waiting) {
          // If there's a waiting worker, activate it
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          await new Promise<void>((resolve) => {
            navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
          });
        }

        // Ensure service worker is active before getting token
        if (!registration.active) {
          throw new Error('Service Worker is not active');
        }

        // Send Firebase config to service worker securely
        registration.active.postMessage({
          type: 'FIREBASE_CONFIG',
          config: {
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
            measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
          }
        });

        // Get registration token using the registered worker
        const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
        const tokenOptions: any = {
          serviceWorkerRegistration: registration,
        };
        
        // Only add VAPID key if it's configured
        if (vapidKey) {
          tokenOptions.vapidKey = vapidKey;
        }

        const currentToken = await getToken(messaging as Messaging, tokenOptions);

        if (currentToken) {
          console.log('✅ FCM Token obtained:', currentToken);
          setToken(currentToken);
          // In a real app, you'd send this token to your server to store it
        } else {
          console.warn('No registration token available. Request permission to generate one.');
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
