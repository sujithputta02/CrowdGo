importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in your configuration
// These values should match your .env.local (but must be hardcoded here since .env is not accessible to SW)
// SECURITY: Hardcoded keys removed for public submission. 
// Populate these locally with values from your .env.local
firebase.initializeApp({
  apiKey: "SET_IN_LOCAL_ENV",
  authDomain: "SET_IN_LOCAL_ENV.firebaseapp.com",
  projectId: "SET_IN_LOCAL_ENV",
  storageBucket: "SET_IN_LOCAL_ENV.firebasestorage.app",
  messagingSenderId: "SET_IN_LOCAL_ENV",
  appId: "SET_IN_LOCAL_ENV",
  measurementId: "SET_IN_LOCAL_ENV"
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/vibe-alert.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
