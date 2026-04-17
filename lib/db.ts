import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";

// --- Types ---
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  aura: number;
  matchStreak: number;
  timeSaved: number;
  ticket?: {
    gate: string;
    section: string;
    row: string;
    seat: string;
  };
  settings: {
    notifications: boolean;
    accessibility: {
      stepFree: boolean;
      highContrast: boolean;
    };
  };
}

export interface VenueState {
  id: string;
  name: string;
  activeMatch: {
    home: string;
    away: string;
    score: string;
    time: string;
    nextBreak: string;
    momentum: 'low' | 'medium' | 'high';
  };
  services: Array<{
    id: string;
    name: string;
    type: string;
    status: 'optimal' | 'locked-in' | 'busy';
    wait: number;
    walk: number;
    reason: string;
    range: string;
  }>;
  notifications?: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'emergency';
  }>;
}

// --- Data Operations ---

/**
 * Ensures the global venue data exists. 
 * This fulfills the requirement to "add the collections" programmatically.
 */
export const seedVenueData = async () => {
  const venueRef = doc(db, "venues", "wankhede");
  const venueSnap = await getDoc(venueRef);

  if (!venueSnap.exists()) {
    console.log("Seeding Venue Data: Wankhede...");
    await setDoc(venueRef, {
      name: "Wankhede Stadium",
      activeMatch: {
        home: "Mumbai Indians",
        away: "Chennai Super Kings",
        score: "0 - 0",
        time: "0'",
        nextBreak: "19:30",
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
    console.log("Initializing New User Profile:", uid);
    const newProfile: UserProfile = {
      uid,
      email,
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
        notifications: true,
        accessibility: {
          stepFree: false,
          highContrast: false
        }
      }
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }

  return userSnap.data() as UserProfile;
};

export const updateUserSetting = async (uid: string, path: string, value: any) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { [path]: value });
};
