import { seedVenueData, syncUserProfile, updateUserSetting } from '@/lib/db';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  onSnapshot: jest.fn(),
}));

jest.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('Database Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('seedVenueData', () => {
    it('should seed venue data when venue does not exist', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      await seedVenueData();

      expect(setDoc).toHaveBeenCalled();
      const setDocCall = (setDoc as jest.Mock).mock.calls[0][1];
      expect(setDocCall.name).toBe('Wankhede Stadium');
      expect(setDocCall.services).toBeDefined();
      expect(setDocCall.services.length).toBeGreaterThan(0);
    });

    it('should not seed venue data when venue already exists', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
      });

      await seedVenueData();

      expect(setDoc).not.toHaveBeenCalled();
    });

    it('should include active match data in seeded venue', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      await seedVenueData();

      const setDocCall = (setDoc as jest.Mock).mock.calls[0][1];
      expect(setDocCall.activeMatch).toBeDefined();
      expect(setDocCall.activeMatch.home).toBe('Mumbai Indians');
      expect(setDocCall.activeMatch.away).toBe('Chennai Super Kings');
    });

    it('should include notifications in seeded venue', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      await seedVenueData();

      const setDocCall = (setDoc as jest.Mock).mock.calls[0][1];
      expect(setDocCall.notifications).toBeDefined();
      expect(Array.isArray(setDocCall.notifications)).toBe(true);
    });
  });

  describe('syncUserProfile', () => {
    it('should create new user profile when user does not exist', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await syncUserProfile('test-uid', 'test@example.com');

      expect(setDoc).toHaveBeenCalled();
      expect(result.uid).toBe('test-uid');
      expect(result.email).toBe('test@example.com');
      expect(result.aura).toBe(100);
      expect(result.matchStreak).toBe(0);
      expect(result.timeSaved).toBe(0);
    });

    it('should return existing user profile when user exists', async () => {
      const existingProfile = {
        uid: 'existing-uid',
        email: 'existing@example.com',
        aura: 150,
        matchStreak: 5,
        timeSaved: 30,
        settings: {
          notifications: true,
          accessibility: {
            stepFree: false,
            highContrast: false,
          },
        },
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => existingProfile,
      });

      const result = await syncUserProfile('existing-uid', 'existing@example.com');

      expect(setDoc).not.toHaveBeenCalled();
      expect(result).toEqual(existingProfile);
    });

    it('should initialize user with default ticket information', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await syncUserProfile('test-uid', 'test@example.com');

      expect(result.ticket).toBeDefined();
      expect(result.ticket?.gate).toBe('A');
      expect(result.ticket?.section).toBe('104');
      expect(result.ticket?.row).toBe('K');
      expect(result.ticket?.seat).toBe('12');
    });

    it('should initialize user with default settings', async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false,
      });

      const result = await syncUserProfile('test-uid', 'test@example.com');

      expect(result.settings).toBeDefined();
      expect(result.settings.notifications).toBe(true);
      expect(result.settings.accessibility.stepFree).toBe(false);
      expect(result.settings.accessibility.highContrast).toBe(false);
    });
  });

  describe('updateUserSetting', () => {
    it('should update user setting with correct path and value', async () => {
      await updateUserSetting('test-uid', 'settings.notifications', false);

      expect(updateDoc).toHaveBeenCalled();
      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall['settings.notifications']).toBe(false);
    });

    it('should handle nested path updates', async () => {
      await updateUserSetting('test-uid', 'settings.accessibility.highContrast', true);

      expect(updateDoc).toHaveBeenCalled();
      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall['settings.accessibility.highContrast']).toBe(true);
    });

    it('should handle numeric value updates', async () => {
      await updateUserSetting('test-uid', 'aura', 200);

      expect(updateDoc).toHaveBeenCalled();
      const updateCall = (updateDoc as jest.Mock).mock.calls[0][1];
      expect(updateCall['aura']).toBe(200);
    });
  });
});
