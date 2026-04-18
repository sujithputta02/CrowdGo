import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { logger } from "./logger.client";

import { UserProfile, VenueState } from "./types";

// --- Data Operations ---

/**
 * Ensures the global venue data exists. 
 * This fulfills the requirement to "add the collections" programmatically.
 */
export const seedVenueData = async () => {
  const venueRef = doc(db, "venues", "wankhede");
  const venueSnap = await getDoc(venueRef);

  if (!venueSnap.exists()) {
    logger.info("Seeding Venue Data: Wankhede");
    await setDoc(venueRef, {
      name: "Wankhede Stadium",
      activeMatch: {
        home: "Mumbai Indians",
        away: "Chennai Super Kings",
        score: "0 - 0",
        time: "0'",
        nextBreak: "19:30",
        nextSafeWindowIn: 15,
        momentum: "low",
      },
      services: [
        {
          id: "food-1",
          name: "Garware Snacks",
          type: "food",
          wait: 5,
          walk: 4,
          status: "optimal",
          reason: "Stable flow detected",
          range: "4-6 mins",
        },
        {
          id: "rest-1",
          name: "Gate 1 Restrooms",
          type: "restroom",
          wait: 0,
          walk: 2,
          status: "locked-in",
          reason: "Clear queue",
          range: "0-1 mins",
        },
        {
          id: "food-2",
          name: "Tendulkar Concessions",
          type: "food",
          wait: 10,
          walk: 6,
          status: "busy",
          reason: "High traffic",
          range: "8-12 mins",
        }
      ],
      notifications: [
        {
          id: "n1",
          title: "Gate Flow Alert",
          message: "Moderate flow detected at Gate 1. Predictable entry time: 4 mins.",
          type: "info"
        }
      ]
    });
  }
};

/**
 * Syncs the user's profile on login.
 */
export const syncUserProfile = async (uid: string, email: string) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    logger.info("Initializing New User Profile", { uid });
    const newProfile: UserProfile = {
      uid,
      email,
      name: email.split('@')[0],
      aura: 100,
      matchStreak: 0,
      timeSaved: 0,
      ticket: {
        gate: "A",
        section: "104",
        row: "K",
        seat: "12"
      },
      settings: {
        theme: 'dark',
        notifications: true,
        language: 'en',
        accessibility: {
          stepFree: false,
          highContrast: false
        }
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }

  return userSnap.data() as UserProfile;
};

export const updateUserSetting = async (
  uid: string, 
  path: string, 
  value: string | number | boolean | Record<string, unknown>
) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { [path]: value });
};
