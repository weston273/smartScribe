//index.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
// For Node 18+, fetch is global. For older Node, uncomment the next line:
// import fetch from "node-fetch";
// Optional: rate limiting
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  "http://localhost:5173",
  "https://smart-scribe-thz3.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like curl)
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

// Rate limiting: 60 requests/min/IP (adjust as needed)
app.use(rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: "Too many requests, please try again after a minute."
}));

// Load API keys from .env
const apiKeys = process.env.OPENROUTER_KEYS
  ? process.env.OPENROUTER_KEYS.split(",").map(k => k.trim())
  : [];

let currentKeyIndex = 0;

// Model selection
function getModel(task = "general") {
  switch (task) {
    case "chat":
    case "notes":
      return "mistralai/mistral-7b-instruct";
    case "summarize":
    case "recap":
      return "deepseek/deepseek-r1";
    case "quiz":
    case "video":
      return "deepseek/deepseek-v3-0324:free";
    case "ultralong":
      return "openai/gpt-4o";
    default:
      return "mistralai/mistral-7b-instruct";
  }
}

// Cycle through API keys with fallback
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
      // Do NOT log keys, only safe info
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

    // --- Normalize response ---
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

// Ping/test endpoint
app.get("/", (req, res) => {
  res.send("✅ SmartScribe AI backend is running.");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// If running Node <18 and using node-fetch, uncomment below
// globalThis.fetch = fetch;

