import express from "express";
import multer from "multer";
import fetch from "node-fetch";

const router = express.Router();
const upload = multer();

router.post("/", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const deepgramApiKey = process.env.DEEPGRAM_API_KEY;
    if (!deepgramApiKey) {
      return res.status(500).json({ error: "Missing Deepgram API key." });
    }

    const response = await fetch("https://api.deepgram.com/v1/listen", {
      method: "POST",
      headers: {
        "Authorization": `Token ${deepgramApiKey}`,
        "Content-Type": "audio/webm"
      },
      body: req.file.buffer
    });

    if (!response.ok) {
      const errorMsg = await response.text();
      return res.status(500).json({ error: errorMsg });
    }

    const data = await response.json();
    const transcription = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    return res.json({ transcription });

  } catch (err) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: "Transcription failed." });
  }
});

export default router;
