importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Register event handlers at top level (required by service worker spec)
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Push event handler - must be at top level
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  try {
    const payload = event.data.json();
    const notificationTitle = payload.notification?.title || 'New notification';
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/icons/vibe-alert.png',
      badge: '/icons/badge.png',
      data: payload.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  } catch (error) {
    console.error('Push event error:', error);
  }
});

// Push subscription change handler - must be at top level
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        // Send new subscription to server
        return fetch('/api/v1/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription)
        });
      })
  );
});

// Notification click handler - must be at top level
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if no existing window
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Receive Firebase config from the main thread
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    try {
      firebase.initializeApp(event.data.config);
      const messaging = firebase.messaging();
      
      messaging.onBackgroundMessage((payload) => {
        const notificationTitle = payload.notification?.title || 'New notification';
        const notificationOptions = {
          body: payload.notification?.body || '',
          icon: '/icons/vibe-alert.png',
        };
        self.registration.showNotification(notificationTitle, notificationOptions);
      });
    } catch (error) {
      // Silent error handling in production
    }
  }
});
