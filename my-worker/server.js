// ---------------------------
// server.js
// ---------------------------

// 1️⃣ Import dependencies and load environment variables
import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";
import fs from "fs";
import path from "path";

dotenv.config(); // Load .env file

// 2️⃣ Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------
// 3️⃣ Serve static files for assets
// ---------------------------
app.use(express.static(path.join(process.cwd(), 'public')));



// ---------------------------
// 4️⃣ Diagnostic: log Stripe key loading
// ---------------------------
console.log("Stripe key loaded:", !!process.env.STRIPE_SECRET_KEY);

// ---------------------------
// 5️⃣ Initialize Stripe client
// ---------------------------
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ---------------------------
// 6️⃣ Entitlements file path
// ---------------------------
const ENTITLEMENTS_FILE = path.join(process.cwd(), "data", "entitlements.json");

// ---------------------------
// 7️⃣ Helper: grantEntitlement safely
// ---------------------------
function grantEntitlement(customerId, email) {
  try {
    let entitlements = {};

    if (fs.existsSync(ENTITLEMENTS_FILE)) {
      const raw = fs.readFileSync(ENTITLEMENTS_FILE, "utf-8");
      entitlements = JSON.parse(raw);
    }

    if (!entitlements[customerId]) {
      entitlements[customerId] = {
        customerId,
        email,
        grantedAt: new Date().toISOString(),
      };
      console.log(`✅ Granted entitlement for ${email}`);
    } else {
      console.log(`ℹ️ Entitlement already exists for ${email}`);
    }

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
// 8️⃣ Stripe Webhook endpoint
// ---------------------------
// express.raw() ONLY for this route
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    console.log("🚨 /webhook HIT");

    const sig = req.headers["stripe-signature"];
    console.log("Stripe signature header present:", !!sig);

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("❌ STRIPE_WEBHOOK_SECRET is missing");
      return res.status(500).send("Webhook misconfigured");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log("✅ Stripe event received:", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      const email = session.customer_details?.email || session.customer_email;
      const customerId = session.customer || email; // fallback for testing

      if (!customerId || !email) {
        console.warn("⚠️ Missing customer ID or email, skipping entitlement");
      } else {
        grantEntitlement(customerId, email);
      }

      console.log(`🎉 Payment success for email: ${email}`);
    } else {
      console.log("⚠️ Unhandled event type:", event.type);
    }

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
// 🔟 Read-only entitlement check
// ---------------------------
app.get("/entitlement", (req, res) => {
  const email = req.query.email;

  if (!email) return res.json({ email: null, entitled: false });

  try {
    if (!fs.existsSync(ENTITLEMENTS_FILE)) {
      return res.json({ email, entitled: false });
    }

    const raw = fs.readFileSync(ENTITLEMENTS_FILE, "utf-8");
    const entitlements = JSON.parse(raw);

    const entitled = Object.values(entitlements).some(r => r.email === email);

    return res.json({ email, entitled });
  } catch (err) {
    console.error("❌ Error checking entitlement:", err);
    return res.json({ email, entitled: false });
  }
});

// ---------------------------
// 11️⃣ GET /api/me — read-only backend identity
// ---------------------------
app.get("/api/me", (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ authenticated: false, error: "Missing email parameter" });
  }

  try {
    let entitlements = {};
    if (fs.existsSync(ENTITLEMENTS_FILE)) {
      entitlements = JSON.parse(fs.readFileSync(ENTITLEMENTS_FILE, "utf-8"));
    }

    const record = Object.values(entitlements).find(r => r.email === email);

    if (!record) {
      return res.json({
        authenticated: true,
        email,
        customerId: null,
        entitled: false,
        source: null,
      });
    }

    return res.json({
      authenticated: true,
      email,
      customerId: record.customerId || null,
      entitled: true,
      source: "stripe",
    });
  } catch (err) {
    console.error("❌ Error reading entitlements.json", err);
    return res.status(500).json({ authenticated: false, error: "Server error" });
  }
});

// ---------------------------
// 🔐 Protected premium files
// ---------------------------
app.get("/premium/files/:filename", (req, res) => {
  const email = req.query.email;
  const { filename } = req.params;

  if (!email) {
    return res.status(401).send("Email required");
  }

  try {
    if (!fs.existsSync(ENTITLEMENTS_FILE)) {
      return res.status(403).send("Access denied");
    }

    const raw = fs.readFileSync(ENTITLEMENTS_FILE, "utf-8");
    const entitlements = JSON.parse(raw);

    const entitled = Object.values(entitlements).some(
      r => r.email === email
    );

    if (!entitled) {
      return res.status(403).send("Access denied");
    }

    const filePath = path.join(process.cwd(), "premium-files", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File not found");
    }

    return res.sendFile(filePath);

  } catch (err) {
    console.error("❌ Error serving premium file:", err);
    return res.status(500).send("Server error");
  }
});


// ---------------------------
// 🔹 Start server
// ---------------------------
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
