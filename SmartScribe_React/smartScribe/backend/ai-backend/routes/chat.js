import express from "express";
import { ollamaProvider, OllamaProviderError } from "../services/ollama.js";

const VALID_ROLES = new Set(["system", "user", "assistant", "tool"]);

function getSafeError(error) {
  if (error instanceof OllamaProviderError) {
    return { status: error.statusCode, message: error.message };
  }
  return { status: 503, message: "AI service is temporarily unavailable." };
}

function writeOpenAIChunk(res, content) {
  res.write(`data: ${JSON.stringify({
    choices: [{ index: 0, delta: { content }, finish_reason: null }]
  })}\n\n`);
}

export function createChatRouter(provider = ollamaProvider) {
  const router = express.Router();

  router.post("/", async (req, res) => {
    const { messages, task = "general", stream = false } = req.body || {};
    const validMessages = Array.isArray(messages)
      && messages.length > 0
      && messages.every((message) => (
        message
        && typeof message === "object"
        && VALID_ROLES.has(message.role)
        && typeof message.content === "string"
      ));

    if (!validMessages || typeof task !== "string" || typeof stream !== "boolean") {
      return res.status(400).json({
        error: "Provide a non-empty messages array with valid roles and string content."
      });
    }

    if (!stream) {
      try {
        const content = await provider.chat({ messages, task });
        if (typeof content !== "string" || !content.trim()) {
          throw new OllamaProviderError(502, "AI service returned an invalid response.");
        }
        return res.status(200).json({
          choices: [{ message: { content } }]
        });
      } catch (error) {
        const safeError = getSafeError(error);
        return res.status(safeError.status).json({ error: safeError.message });
      }
    }

    let iterator;
    try {
      iterator = provider.stream({ messages, task })[Symbol.asyncIterator]();
      const first = await iterator.next();
      if (first.done || typeof first.value !== "string" || !first.value) {
        throw new OllamaProviderError(502, "AI service returned an invalid response.");
      }

      res.status(200);
      res.set({
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no"
      });
      res.flushHeaders?.();
      writeOpenAIChunk(res, first.value);

      while (true) {
        const next = await iterator.next();
        if (next.done) break;
        if (typeof next.value !== "string" || !next.value) continue;
        writeOpenAIChunk(res, next.value);
      }

      res.write(`data: ${JSON.stringify({
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }]
      })}\n\n`);
      res.write("data: [DONE]\n\n");
      return res.end();
    } catch (error) {
      const safeError = getSafeError(error);
      if (!res.headersSent) {
        return res.status(safeError.status).json({ error: safeError.message });
      }

      res.write(`data: ${JSON.stringify({ error: { message: safeError.message } })}\n\n`);
      res.write("data: [DONE]\n\n");
      return res.end();
    }
  });

  return router;
}
