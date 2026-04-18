import { NotificationService } from '@/lib/services/notification.service';

jest.mock('@/lib/firebase-admin', () => ({
  adminMessaging: jest.fn(() => ({
    send: jest.fn().mockResolvedValue('message-id'),
    subscribeToTopic: jest.fn().mockResolvedValue({}),
  })),
}));

describe('NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send notification to device with valid data', async () => {
    const result = await NotificationService.sendToDevice(
      'device-token-123',
      'Queue Update',
      'Your queue position has changed'
    );

    expect(result).toBeDefined();
  });

  it('should send notification to topic', async () => {
    const result = await NotificationService.sendToTopic(
      'vibe-alerts',
      'Stadium Alert',
      'Crowd surge detected'
    );

    expect(result).toBeDefined();
  });

  it('should subscribe token to topic', async () => {
    const result = await NotificationService.subscribeToTopic(
      'device-token-123',
      'vibe-alerts'
    );

    expect(result).toBeDefined();
  });

  it('should handle multiple tokens subscription', async () => {
    const tokens = ['token-1', 'token-2', 'token-3'];
    
    const result = await NotificationService.subscribeToTopic(
      tokens,
      'vibe-alerts'
    );

    expect(result).toBeDefined();
  });

  it('should include custom data in notification', async () => {
    const customData = {
      facilityId: 'gate-1',
      waitTime: '15',
    };

    const result = await NotificationService.sendToDevice(
      'device-token-123',
      'Queue Update',
      'Wait time changed',
      customData
    );

    expect(result).toBeDefined();
  });

  it('should handle notification errors gracefully', async () => {
    // Create a new mock that rejects
    jest.resetModules();
    jest.doMock('@/lib/firebase-admin', () => ({
      adminMessaging: jest.fn(() => ({
        send: jest.fn().mockRejectedValue(new Error('Send failed')),
        subscribeToTopic: jest.fn().mockResolvedValue({}),
      })),
    }));

    // Re-import to get the new mock
    const { NotificationService: NS } = require('@/lib/services/notification.service');

    await expect(NS.sendToDevice(
      'test-token',
      'Test Title',
      'Test Body'
    )).rejects.toThrow('Send failed');
  });

  it('should handle topic notification errors gracefully', async () => {
    // Create a new mock that rejects
    jest.resetModules();
    jest.doMock('@/lib/firebase-admin', () => ({
      adminMessaging: jest.fn(() => ({
        send: jest.fn().mockRejectedValue(new Error('Topic send failed')),
        subscribeToTopic: jest.fn().mockResolvedValue({}),
      })),
    }));

    // Re-import to get the new mock
    const { NotificationService: NS } = require('@/lib/services/notification.service');

    await expect(NS.sendToTopic(
      'test-topic',
      'Test Title',
      'Test Body'
    )).rejects.toThrow('Topic send failed');
  });

  it('should handle subscription errors gracefully', async () => {
    // Create a new mock that rejects
    jest.resetModules();
    jest.doMock('@/lib/firebase-admin', () => ({
      adminMessaging: jest.fn(() => ({
        send: jest.fn().mockResolvedValue('message-id'),
        subscribeToTopic: jest.fn().mockRejectedValue(new Error('Subscription failed')),
      })),
    }));

    // Re-import to get the new mock
    const { NotificationService: NS } = require('@/lib/services/notification.service');

    await expect(NS.subscribeToTopic(
      'test-token',
      'test-topic'
    )).rejects.toThrow('Subscription failed');
  });
});
