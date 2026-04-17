// scripts/verify-ingest.ts
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");
const dotenv = require("dotenv");
const path = require("path");

// Load the environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkStatus() {
  console.log("🔍 Checking Firestore State for Wankhede...");
  const venueRef = doc(db, "venues", "wankhede");
  const snap = await getDoc(venueRef);
  
  if (snap.exists()) {
    const data = snap.data();
    console.log("Match Status:", data.activeMatch.score, "at", data.activeMatch.time);
    console.log("Services Wait Times:");
    data.services.forEach((s: any) => {
      console.log(` - ${s.name}: ${s.wait} mins (${s.status})`);
    });
  } else {
    console.log("❌ Venue document not found.");
  }
}

checkStatus().catch(console.error);
