const { getSecret } = require('./lib/gcp-secrets');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function test() {
  try {
    console.log("Testing getSecret('MAPS_API_KEY')...");
    const val = await getSecret('MAPS_API_KEY');
    console.log("Value found:", val ? "REDACTED" : "NULL");
  } catch (err) {
    console.error("Error:", err.message);
  }

  try {
    console.log("\nTesting getSecret('GOOGLE_MAPS_API_KEY')...");
    const val = await getSecret('GOOGLE_MAPS_API_KEY');
    console.log("Value found:", val ? "REDACTED" : "NULL");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
