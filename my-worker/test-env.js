import dotenv from "dotenv";

// Load .env
dotenv.config();

// Print one value to console
console.log("R2_BUCKET_NAME:", process.env.R2_BUCKET_NAME);
