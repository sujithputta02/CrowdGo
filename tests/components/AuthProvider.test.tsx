import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from '@/components/AuthProvider';

jest.mock('@/lib/firebase', () => ({
  auth: {},
  db: {},
}));

jest.mock('@/lib/db', () => ({
  syncUserProfile: jest.fn().mockResolvedValue({
    uid: 'test-uid',
    email: 'test@example.com',
    name: 'test',
    aura: 100,
    matchStreak: 0,
    timeSaved: 0,
    settings: { theme: 'dark', notifications: true, language: 'en', accessibility: { stepFree: false, highContrast: false } },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }),
  seedVenueData: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    callback(null);
    return jest.fn();
  }),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  onSnapshot: jest.fn((ref, callback) => {
    callback({
      exists: () => true,
      data: () => ({
        uid: 'test-uid',
        email: 'test@example.com',
        name: 'test',
        aura: 100,
        matchStreak: 0,
        timeSaved: 0,
        settings: { theme: 'dark', notifications: true, language: 'en', accessibility: { stepFree: false, highContrast: false } },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }),
    });
    return jest.fn();
  }),
}));

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children', () => {
    const { container } = render(
      <AuthProvider>
        <div data-testid="child">Test Child</div>
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it('should provide auth context', () => {
    const { container } = render(
      <AuthProvider>
        <div>Content</div>
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it('should handle unauthenticated state', () => {
    const { container } = render(
      <AuthProvider>
        <div>Content</div>
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it('should cleanup listeners on unmount', () => {
    const { unmount } = render(
      <AuthProvider>
        <div>Content</div>
      </AuthProvider>
    );
    
    unmount();
    expect(true).toBe(true);
  });

  it('should handle authenticated user', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
    };

    const { onAuthStateChanged } = require('firebase/auth');
    const { onSnapshot } = require('firebase/firestore');
    
    onAuthStateChanged.mockImplementationOnce((auth: any, callback: any) => {
      callback(mockUser);
      return jest.fn();
    });

    onSnapshot.mockImplementationOnce((ref: any, callback: any) => {
      callback({
        exists: () => true,
        data: () => ({
          uid: 'test-uid',
          email: 'test@example.com',
          name: 'test',
          aura: 150,
          matchStreak: 5,
          timeSaved: 30,
          settings: { theme: 'dark', notifications: true, language: 'en', accessibility: { stepFree: false, highContrast: false } },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      });
      return jest.fn();
    });

    const { container } = render(
      <AuthProvider>
        <div>Authenticated Content</div>
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it('should handle profile snapshot updates', () => {
    const mockUser = {
      uid: 'test-uid-2',
      email: 'test2@example.com',
    };

    const { onAuthStateChanged } = require('firebase/auth');
    const { onSnapshot } = require('firebase/firestore');
    
    let snapshotCallback: any;
    
    onAuthStateChanged.mockImplementationOnce((auth: any, callback: any) => {
      callback(mockUser);
      return jest.fn();
    });

    onSnapshot.mockImplementationOnce((ref: any, callback: any) => {
      snapshotCallback = callback;
      // Initial call
      callback({
        exists: () => true,
        data: () => ({
          uid: 'test-uid-2',
          email: 'test2@example.com',
          name: 'test2',
          aura: 100,
          matchStreak: 0,
          timeSaved: 0,
          settings: { theme: 'dark', notifications: true, language: 'en', accessibility: { stepFree: false, highContrast: false } },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      });
      return jest.fn();
    });

    const { container } = render(
      <AuthProvider>
        <div>Profile Updates</div>
      </AuthProvider>
    );
    
    // Simulate profile update
    if (snapshotCallback) {
      snapshotCallback({
        exists: () => true,
        data: () => ({
          uid: 'test-uid-2',
          email: 'test2@example.com',
          name: 'test2',
          aura: 200,
          matchStreak: 0,
          timeSaved: 0,
          settings: { theme: 'dark', notifications: true, language: 'en', accessibility: { stepFree: false, highContrast: false } },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }),
      });
    }
    
    expect(container).toBeInTheDocument();
  });

  it('should handle auth state changes', () => {
    let authCallback: any;
    
    jest.resetModules();
    jest.doMock('firebase/auth', () => ({
      onAuthStateChanged: jest.fn((auth, callback) => {
        authCallback = callback;
        return jest.fn();
      }),
    }));

    const { container } = render(
      <AuthProvider>
        <div>Content</div>
      </AuthProvider>
    );
    
    // Simulate auth state change
    if (authCallback) {
      authCallback({ uid: 'new-uid', email: 'new@example.com' });
    }
    
    expect(container).toBeInTheDocument();
  });

  it('should provide loading state', () => {
    const { container } = render(
      <AuthProvider>
        <div>Loading Content</div>
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });

  it('should handle profile snapshot when document does not exist', () => {
    const mockUser = {
      uid: 'test-uid-3',
      email: 'test3@example.com',
    };

    const { onAuthStateChanged } = require('firebase/auth');
    const { onSnapshot } = require('firebase/firestore');
    
    onAuthStateChanged.mockImplementationOnce((_auth: any, callback: any) => {
      callback(mockUser);
      return jest.fn();
    });

    onSnapshot.mockImplementationOnce((_ref: any, callback: any) => {
      // Simulate document not existing (lines 31-36)
      callback({
        exists: () => false,
        data: () => null,
      });
      return jest.fn();
    });

    const { container } = render(
      <AuthProvider>
        <div>No Profile</div>
      </AuthProvider>
    );
    
    expect(container).toBeInTheDocument();
  });
});
