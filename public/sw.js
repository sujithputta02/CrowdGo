/**
 * Main Service Worker Wrapper
 * 
 * Imports the Firebase Messaging Service Worker to avoid 404 errors 
 * and allow for future custom worker logic.
 */
importScripts('/firebase-messaging-sw.js');
