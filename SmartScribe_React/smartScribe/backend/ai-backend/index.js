import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { Deepgram } from "@deepgram/sdk";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Streaming keys (e.g., from OpenRouter)
const apiKeys = process.env.OPENROUTER_KEYS?.split(",") || [];
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
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: getModel(task),
          messages,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        rotateKey();
      }
    } catch (err) {
      console.error(`Key ${currentKeyIndex + 1} failed:`, err.message);
      rotateKey();
    }
  }

  throw new Error("All API keys failed.");
}

// ✅ Main chat endpoint (handles streaming and non-streaming)
app.post("/api/chat", async (req, res) => {
  const { messages, stream = false, task = "chat" } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "'messages' must be an array." });
  }

  const model = getModel(task);
  const key = apiKeys[currentKeyIndex];
  const url = "https://openrouter.ai/api/v1/chat/completions";

  if (!stream) {
    try {
      const data = await fetchWithFallback(messages, task);
      const content = data?.choices?.[0]?.message?.content || "AI did not reply.";
      return res.json({ choices: [{ message: { content } }] });
    } catch (err) {
      return res.status(500).json({ error: "All keys failed or exhausted." });
    }
  }

  // Streaming mode
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        stream: true
      })
    });

    if (!response.ok || !response.body) {
      throw new Error("Streaming failed to start.");
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      res.write(chunk);
    }

    res.write("data: [DONE]\n\n");
    res.end();

  } catch (err) {
    console.error("Streaming error:", err.message);
    res.status(500).send("data: [DONE]\n\n");
  }
});

// ✅ Transcription via Deepgram
app.post("/api/transcribe", async (req, res) => {
  const { audioUrl } = req.body;

  if (!audioUrl) {
    return res.status(400).json({ error: "Missing audioUrl" });
  }

  try {
    const deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);
    const response = await deepgram.transcription.preRecorded(
      { url: audioUrl },
      { punctuate: true }
    );

    const transcript = response.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
    res.json({ transcript });
  } catch (err) {
    console.error("Transcription error:", err.message);
    res.status(500).json({ error: "Transcription failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
