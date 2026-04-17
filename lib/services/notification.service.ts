import { adminMessaging } from '../firebase-admin';

/**
 * Service to handle Firebase Cloud Messaging (FCM) operations
 * This is used server-side (Next.js API routes or Server Actions)
 */
export const NotificationService = {
  /**
   * Sends a simple push notification to a specific device token
   */
  async sendToDevice(token: string, title: string, body: string, data?: any) {
    try {
      const response = await adminMessaging().send({
        token,
        notification: {
          title,
          body,
        },
        data: data || {},
        webpush: {
          notification: {
            icon: '/icons/vibe-alert.png', // Add a custom icon if available
            badge: '/icons/badge.png',
          },
        },
      });
      console.log('Successfully sent message:', response);
      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Sends a notification to a topic (e.g., 'vibe-alerts')
   */
  async sendToTopic(topic: string, title: string, body: string, data?: any) {
    try {
      const response = await adminMessaging().send({
        topic,
        notification: {
          title,
          body,
        },
        data: data || {},
      });
      console.log('Successfully sent topic message:', response);
      return response;
    } catch (error) {
      console.error('Error sending topic message:', error);
      throw error;
    }
  },

  /**
   * Subscribes a token to a topic
   */
  async subscribeToTopic(tokens: string | string[], topic: string) {
    try {
      const response = await adminMessaging().subscribeToTopic(tokens, topic);
      console.log('Successfully subscribed to topic:', response);
      return response;
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      throw error;
    }
  }
};
