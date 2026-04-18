import { adminMessaging } from '../firebase-admin';
import { logger } from '../logger';

/**
 * Service to handle Firebase Cloud Messaging (FCM) operations
 * This is used server-side (Next.js API routes or Server Actions)
 */
export const NotificationService = {
  /**
   * Sends a simple push notification to a specific device token
   */
  async sendToDevice(
    token: string, 
    title: string, 
    body: string, 
    data?: Record<string, string>
  ) {
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
      logger.info('Push notification sent successfully', { messageId: response });
      return response;
    } catch (error) {
      logger.error('Failed to send push notification', error);
      throw error;
    }
  },

  /**
   * Sends a notification to a topic (e.g., 'vibe-alerts')
   */
  async sendToTopic(
    topic: string, 
    title: string, 
    body: string, 
    data?: Record<string, string>
  ) {
    try {
      const response = await adminMessaging().send({
        topic,
        notification: {
          title,
          body,
        },
        data: data || {},
      });
      logger.info('Topic notification sent successfully', { topic, messageId: response });
      return response;
    } catch (error) {
      logger.error('Failed to send topic notification', error, { topic });
      throw error;
    }
  },

  /**
   * Subscribes a token to a topic
   */
  async subscribeToTopic(tokens: string | string[], topic: string) {
    try {
      const response = await adminMessaging().subscribeToTopic(tokens, topic);
      logger.info('Successfully subscribed to topic', { topic });
      return response;
    } catch (error) {
      logger.error('Failed to subscribe to topic', error, { topic });
      throw error;
    }
  }
};
