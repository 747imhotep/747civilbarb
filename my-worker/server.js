// ---------------------------
// server.js
// ---------------------------

// Imports
import dotenv from "dotenv";
import express from "express";
import Stripe from "stripe";
import fs from "fs";
import path from "path";
import session from "express-session";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------
// 1️⃣ JSON parser
// ---------------------------
app.use(express.json());

// ---------------------------
// 2️⃣ CORS
// ---------------------------
app.use(cors({
  origin: "https://deadanglesinstitute.org",
  credentials: true
}));

// ---------------------------
// 3️⃣ Session
// ---------------------------
app.use(session({
  secret: process.env.SESSION_SECRET || "supersecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  }
}));

// ---------------------------
// 4️⃣ Static files
// ---------------------------
app.use(express.static(path.join(process.cwd(), 'public')));

// ---------------------------
// 5️⃣ Start server
// ---------------------------
app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});

