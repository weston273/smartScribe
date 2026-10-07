import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import { createChatRouter } from "./routes/chat.js";
import { createTranscribeRouter } from "./routes/transcribe.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-scribe-thz3.vercel.app"
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "5mb" }));

// Keep the existing per-IP limit across all API routes.
app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: "Too many requests, please try again after a minute."
}));

app.use("/api/chat", createChatRouter());
app.use("/api/transcribe", createTranscribeRouter());

app.get("/", (req, res) => {
  res.send("SmartScribe AI backend is running.");
});

// Normalize malformed JSON bodies without returning Express internals.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  if (error?.type === "entity.too.large") {
    return res.status(413).json({ error: "The transcript is too large to process in one request." });
  }
  return res.status(500).json({ error: "Request could not be processed." });
});

app.listen(PORT, () => {
  console.log(`SmartScribe AI backend listening on port ${PORT}`);
});
