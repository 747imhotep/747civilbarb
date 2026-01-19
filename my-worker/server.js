// ---------------------------
// server.js
// ---------------------------

// 1️⃣ Import dependencies and load environment variables
import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

dotenv.config();

// 2️⃣ Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// 3️⃣ Log Stripe key loading (diagnostic)
console.log("Stripe key loaded:", !!process.env.STRIPE_SECRET_KEY);

// 4️⃣ Initialize Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------------------
// 5️⃣ Entitlements file path
// ---------------------------
const ENTITLEMENTS_FILE = path.join(process.cwd(), "data", "entitlements.json");

// ---------------------------
// 6️⃣ Safe helper: grantEntitlement
// ---------------------------
function grantEntitlement(customerId, email) {
  try {
    // 6.1️⃣ Load existing entitlements (or empty object)
    let entitlements = {};
    if (fs.existsSync(ENTITLEMENTS_FILE)) {
      const raw = fs.readFileSync(ENTITLEMENTS_FILE, "utf-8");
      entitlements = JSON.parse(raw);
    }

    // 6.2️⃣ Add new entitlement only if not already present
    if (!entitlements[customerId]) {
      entitlements[customerId] = {
        email,
        grantedAt: new Date().toISOString(),
      };
      console.log(`✅ Granted entitlement for ${email}`);
    } else {
      console.log(`ℹ️ Entitlement already exists for ${email}`);
    }

    // 6.3️⃣ Write updated entitlements safely
    fs.writeFileSync(
      ENTITLEMENTS_FILE,
      JSON.stringify(entitlements, null, 2),
      "utf-8"
    );
  } catch (err) {
    console.error("❌ Error granting entitlement:", err);
  }
}

// ---------------------------
// 7️⃣ Stripe Webhook endpoint
// ---------------------------

// Important: use express.raw() **only on this route**.  
// Do NOT use app.use(express.json()) before this route
app.post(
  "/webhook",
  express.raw({ type: "application/json" }), // raw body middleware required for signature
  (req, res) => {
    console.log("🚨 /webhook endpoint HIT"); // confirm request reached server

    const sig = req.headers["stripe-signature"];
    console.log("Stripe signature header present:", !!sig);

    // Check webhook secret exists
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("❌ STRIPE_WEBHOOK_SECRET is missing");
      return res.status(500).send("Webhook misconfigured");
    }

    let event;

    try {
      // ✅ Verify the Stripe webhook signature
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error(
        "❌ Webhook signature verification failed:",
        err.message
      );
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("✅ Stripe event received:", event.type);

    // ---------------------------
    // 8️⃣ Handle events (STEP 7.2.C)
    // ---------------------------
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;

        // Stripe may provide email in customer_details or customer_email
        const email = session.customer_details?.email || session.customer_email;
        const customerId =   session.customer || email; // ⬅️ test-safe fallback (after testing, remove ||etc)

        if (!customerId || !email) {
          console.warn("⚠️ Missing customer ID or email, skipping entitlement");
        } else {
          grantEntitlement(customerId, email);
        }

        console.log(`🎉 Payment success for email: ${email}`);
        break;

      default:
        console.log("⚠️ Unhandled event type:", event.type);
    }

    // Respond quickly to Stripe
    res.status(200).send("Received");
  }
);

// ---------------------------
// 9️⃣ Health check endpoint
// ---------------------------
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ---------------------------
// 9️⃣.1️⃣ Read-only entitlement check (STEP 7.3.1)
// ---------------------------
app.get("/entitlement", (req, res) => {
  const email = req.query.email;

  // Always return a safe response
  if (!email) {
    return res.status(200).json({
      email: null,
      entitled: false,
    });
  }

  try {
    // If entitlements file does not exist yet
    if (!fs.existsSync(ENTITLEMENTS_FILE)) {
      return res.status(200).json({
        email,
        entitled: false,
      });
    }

    const raw = fs.readFileSync(ENTITLEMENTS_FILE, "utf-8");
    const entitlements = JSON.parse(raw);

    const entitled = Boolean(entitlements[email]);

    return res.status(200).json({
      email,
      entitled,
    });
  } catch (err) {
    console.error("❌ Error checking entitlement:", err);
    return res.status(200).json({
      email,
      entitled: false,
    });
  }
});


// ---------------------------
// 🔟 Start server
// ---------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
