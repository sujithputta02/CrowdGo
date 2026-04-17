const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(process.cwd(), 'firebase-key.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function seed() {
  const venueRef = db.collection('venues').doc('wankhede');
  
  await venueRef.set({
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
        name: "Gate A Restrooms",
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
        message: "Moderate flow detected at Gate A. Predictable entry time: 4 mins.",
        type: "info"
      }
    ]
  });
  
  console.log("✅ Seeded Wankhede Stadium data.");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
