import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import rateLimit from "express-rate-limit";
import fetch from "node-fetch";
import { createChatRouter } from "./routes/chat.js";

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

app.use(express.json());

// Keep the existing per-IP limit across all API routes.
app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: "Too many requests, please try again after a minute."
}));

const upload = multer();

app.use("/api/chat", createChatRouter());

// --- Deepgram transcription endpoint ---
app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      return res.status(500).json({ error: "Missing Deepgram API key." });
    }

    // Send audio buffer directly to Deepgram's REST API
    const response = await fetch("https://api.deepgram.com/v1/listen", {
      method: "POST",
      headers: {
        "Authorization": `Token ${deepgramApiKey}`,
        "Content-Type": "audio/webm" // assuming your frontend sends webm audio format
      },
      body: req.file.buffer
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      return res.status(500).json({ error: errorMsg });
    }

    const data = await response.json();
    // Extract transcript from Deepgram response structure
    const transcription = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    return res.json({ transcription });
  } catch (err) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: "Transcription failed." });
  }
});

app.get("/", (req, res) => {
  res.send("SmartScribe AI backend is running.");
});

// Normalize malformed JSON bodies without returning Express internals.
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON." });
  }
  return res.status(500).json({ error: "Request could not be processed." });
});

app.listen(PORT, () => {
  console.log(`SmartScribe AI backend listening on port ${PORT}`);
});
