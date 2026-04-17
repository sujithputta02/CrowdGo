importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Handle service worker activation
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

// Activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
