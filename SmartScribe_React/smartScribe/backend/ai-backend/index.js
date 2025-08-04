import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import rateLimit from "express-rate-limit";
import fetch from "node-fetch"; // Use only if your Node.js version < 18 (optional)

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-scribe-thz3.vercel.app"
];

// CORS middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Rate limiting: 60 requests per minute per IP
app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: "Too many requests, please try again after a minute."
}));

// Multer middleware for file upload handling (multipart/form-data)
const upload = multer();

// Load OpenRouter API keys from environment variables
const apiKeys = process.env.OPENROUTER_KEYS
  ? process.env.OPENROUTER_KEYS.split(",").map(k => k.trim())
  : [];

let currentKeyIndex = 0;

// Function to select model based on task
function getModel(task = "general") {
  switch (task) {
    case "chat":
    case "notes":
      return "mistralai/mistral-7b-instruct";
    case "summarize":
    case "recap":
      return "z-ai/glm-4.5-air:free";
    case "quiz":
    case "video":
      return "z-ai/glm-4.5-air:free";
    case "ultralong":
      return "openai/gpt-4o";
    default:
      return "mistralai/mistral-7b-instruct";
  }
}

// Cycle through API keys with fallback for OpenRouter
async function fetchWithFallback(messages, task) {
  const model = getModel(task);

  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[currentKeyIndex];
    console.log(`🧠 Trying key #${currentKeyIndex + 1} with model: ${model}`);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7
        })
      });

      if (response.status === 429 || response.status === 401) {
        console.warn(`⚠️ Key #${currentKeyIndex + 1} failed (rate limit or unauthorized). Switching...`);
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`❌ OpenRouter error: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Success from OpenRouter for model:", model);
      return data;

    } catch (err) {
      console.error(`❌ Key #${currentKeyIndex + 1} error:`, err.message);
      currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    }
  }

  throw new Error("🚫 All API keys failed or exhausted.");
}

// Main chat endpoint
app.post("/api/chat", async (req, res) => {
  const { messages, task } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "❌ 'messages' must be an array." });
  }

  try {
    const data = await fetchWithFallback(messages, task);

    // Normalize AI response content
    let content =
      data?.choices?.[0]?.message?.content
      || data?.choices?.[0]?.content
      || null;

    if (!content) {
      content = "AI did not reply (malformed response).";
    }

    res.status(200).json({
      choices: [
        { message: { content } }
      ]
    });

  } catch (error) {
    console.error("🔥 Critical failure:", error.message);
    res.status(500).json({ error: "All keys failed or exhausted." });
  }
});

// --- New Deepgram transcription endpoint ---

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

// Simple health check / root endpoint
app.get("/", (req, res) => {
  res.send("✅ SmartScribe AI backend is running.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
