// ---------------------------
// TEST-ENV.JS
// ---------------------------

// Imports
import fs from "fs";
import path from "path";

// ---------------------------
// 1️⃣ Check environment variables
// ---------------------------
console.log("🔎 Checking environment variables...");
console.log("R2_BUCKET_NAME:", process.env.R2_BUCKET_NAME || "❌ Not set");
console.log("STRIPE_SECRET_KEY:", process.env.STRIPE_SECRET_KEY ? "✅ Loaded" : "❌ Missing");
console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "✅ Loaded" : "❌ Missing");

// ---------------------------
// 2️⃣ Entitlements file path
// ---------------------------
const PROJECT_ROOT = path.resolve(process.cwd(), "..");
const ENTITLEMENTS_PATH = path.join(PROJECT_ROOT, "data", "entitlements.json");
console.log("📁 Entitlements file path:", ENTITLEMENTS_PATH);

// ---------------------------
// 3️⃣ Load existing entitlements (if file exists)
// ---------------------------
let entitlements = {};

if (fs.existsSync(ENTITLEMENTS_PATH)) {
  try {
    entitlements = JSON.parse(
      fs.readFileSync(ENTITLEMENTS_PATH, "utf-8")
    );
    console.log("✅ Entitlements file loaded successfully");
  } catch (err) {
    console.error("❌ Failed to parse entitlements.json:", err);
  }
} else {
  console.log("⚠️ entitlements.json does not exist yet");
}

// ---------------------------
// 4️⃣ Helper: grantEntitlement
// ---------------------------
function grantEntitlement(customerId, email) {
  entitlements[customerId] = {
    customerId,
    email,
    status: "active",
    plan: "premium",
    grantedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    ENTITLEMENTS_PATH,
    JSON.stringify(entitlements, null, 2),
    "utf-8"
  );

  console.log(`✅ Entitlement granted for ${email} (${customerId})`);
}

// ---------------------------
// 5️⃣ Optional test entitlement
// ---------------------------
if (process.env.TEST_ENTITLEMENT === "true") {
  console.log("🧪 TEST_ENTITLEMENT enabled — creating test user...");
  grantEntitlement("cus_TEST12345", "test@example.com");
  console.log("📄 Current entitlements:", entitlements);
} else {
  console.log("ℹ️ TEST_ENTITLEMENT not enabled");
}
