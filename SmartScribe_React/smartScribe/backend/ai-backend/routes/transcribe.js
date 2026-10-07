import express from "express";
import multer from "multer";
import { DeepgramError, transcribeWithDeepgram } from "../services/deepgram.js";

export function createTranscribeRouter({ transcribe = transcribeWithDeepgram } = {}) {
  const router = express.Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }
  });

  router.post("/", (req, res, next) => {
    upload.single("audio")(req, res, async (uploadError) => {
      if (uploadError) {
        const tooLarge = uploadError.code === "LIMIT_FILE_SIZE";
        return res.status(tooLarge ? 413 : 400).json({
          error: tooLarge ? "Recording is too large to transcribe." : "Audio upload could not be processed."
        });
      }
      if (!req.file) return res.status(400).json({ error: "No audio file uploaded." });

      try {
        const transcription = await transcribe(req.file);
        return res.json({ transcription });
      } catch (error) {
        if (error instanceof DeepgramError) {
          return res.status(error.statusCode).json({ error: error.message });
        }
        return next(error);
      }
    });
  });

  return router;
}
