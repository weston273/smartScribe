import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Load API keys from environment (comma-separated in .env)
const apiKeys = process.env.OPENROUTER_KEYS
  ? process.env.OPENROUTER_KEYS.split(",").map(k => k.trim())
  : [];

let currentKeyIndex = 0;

// Ensure model is chosen correctly
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

// Rotate through API keys on failure
async function fetchWithFallback(messages, task) {
  const model = getModel(task);

  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[currentKeyIndex];
    console.log(`🧠 Using model: ${model} with key ${currentKeyIndex + 1}`);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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

      if (res.status === 429 || res.status === 401) {
        console.warn(`⚠️ API Key ${currentKeyIndex + 1} failed (rate limit or unauthorized). Trying next...`);
        currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`🚨 Error from OpenRouter: ${errorText}`);
      }

      const data = await res.json();
      console.log(`✅ Model ${model} responded successfully`);
      return data;
    } catch (err) {
      console.error(`❌ Error with key ${currentKeyIndex + 1}:`, err.message);
      currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    }
  }

  throw new Error("All API keys failed or were exhausted.");
}

// Main AI proxy endpoint
app.post("/api/chat", async (req, res) => {
  const { messages, task } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "❌ Messages array is required." });
  }

  try {
    const data = await fetchWithFallback(messages, task);
    res.json(data);
  } catch (error) {
    console.error("🔥 All keys failed:", error.message);
    res.status(500).json({ error: "All API keys exhausted or failed." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ AI backend proxy server running on port ${PORT}`);
});
