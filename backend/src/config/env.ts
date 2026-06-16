import dotenv from "dotenv";

dotenv.config();

// Required environment variables - app will fail to start if missing
const NODE_ENV = process.env.NODE_ENV;

const PORT = Number(process.env.PORT);
if (!PORT) throw new Error("PORT environment variable is required");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL)
  throw new Error("DATABASE_URL environment variable is required");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
if (!ADMIN_TOKEN)
  throw new Error("ADMIN_TOKEN environment variable is required");

// Pinata
const PINATA_JWT = process.env.PINATA_JWT;
if (!PINATA_JWT) throw new Error("PINATA_JWT environment variable is required");

const PINATA_GATEWAY = process.env.PINATA_GATEAWAY || ""; // Note: typo in source, keeping for backwards compatibility
const PINATA_URL = process.env.PINATA_URL || "";
const PINATA_GROUP_PRIVATE = process.env.PINATA_GROUP_PRIVATE || "";

// Cloudinary
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || "";
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || "";
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "";

export {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  JWT_SECRET,
  ADMIN_TOKEN,
  PINATA_GATEWAY,
  PINATA_JWT,
  PINATA_URL,
  PINATA_GROUP_PRIVATE,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
};
