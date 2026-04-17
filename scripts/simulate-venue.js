const admin = require('firebase-admin');
const path = require('path');

const serviceAccount = require(path.join(process.cwd(), 'firebase-key.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const VENUE_ID = 'wankhede';

const SIMULATION_CONFIG = [
  { time: "10'", score: "0 - 0", momentum: "medium", wait1: 5, wait2: 12 },
  { time: "24'", score: "0 - 1", momentum: "high", wait1: 8, wait2: 15 },
  { time: "38'", score: "1 - 1", momentum: "high", wait1: 12, wait2: 20 },
  { time: "45+2'", score: "1 - 1", momentum: "low", wait1: 25, wait2: 30 }, // Halftime
  { time: "60'", score: "2 - 1", momentum: "medium", wait1: 10, wait2: 18 },
  { time: "85'", score: "2 - 2", momentum: "high", wait1: 5, wait2: 12 },
];

async function simulate() {
  console.log("🚀 Starting CrowdGo Real-Time Simulation...");
  console.log("📍 Target: Wankhede Stadium");
  
  let step = 0;
  
  while (true) {
    const config = SIMULATION_CONFIG[step % SIMULATION_CONFIG.length];
    
    console.log(`\n--- [STEP ${step + 1}] ---`);
    console.log(`Match Time: ${config.time} | Score: ${config.score}`);
    
    try {
      await db.collection('venues').doc(VENUE_ID).update({
        'activeMatch.time': config.time,
        'activeMatch.score': config.score,
        'activeMatch.momentum': config.momentum,
        'services': [
          {
            id: "food-1",
            name: "Garware Snacks",
            type: "food",
            wait: config.wait1,
            walk: 4,
            status: config.wait1 > 20 ? 'busy' : config.wait1 > 10 ? 'locked-in' : 'optimal',
            reason: config.wait1 > 20 ? "Halftime Peak" : "Stable flow detected",
            range: `${config.wait1}-${config.wait1 + 3} mins`,
          },
          {
            id: "rest-1",
            name: "Gate A Restrooms",
            type: "restroom",
            wait: 2,
            walk: 2,
            status: "locked-in",
            reason: "Clear queue",
            range: "1-3 mins",
          },
          {
            id: "food-2",
            name: "Tendulkar Concessions",
            type: "food",
            wait: config.wait2,
            walk: 6,
            status: config.wait2 > 25 ? 'busy' : 'locked-in',
            reason: "Moderate traffic",
            range: `${config.wait2}-${config.wait2 + 5} mins`,
          }
        ],
        'notifications': step % 3 === 0 ? [
            {
              id: `alert-${Date.now()}`,
              title: "Momentum Shift",
              message: config.momentum === 'high' ? "High stadium energy detected. Use Gate B for faster exit." : "Game pace steadying.",
              type: config.momentum === 'high' ? 'warning' : 'info'
            }
        ] : []
      });
      
      console.log("✅ Firestore Updated.");
    } catch (error) {
      console.error("❌ Simulation Error:", error);
    }
    
    step++;
    await new Promise(resolve => setTimeout(resolve, 8000));
  }
}

simulate().catch(err => {
  console.error("❌ Simulation failed:", err);
  process.exit(1);
});
