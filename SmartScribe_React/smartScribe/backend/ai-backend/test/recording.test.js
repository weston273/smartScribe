import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { createTranscribeRouter } from "../routes/transcribe.js";
import { createDeepgramTranscriber, DeepgramError } from "../services/deepgram.js";
import { createOllamaProvider } from "../services/ollama.js";

const deepgramPayload = {
  results: { channels: [{ alternatives: [{ transcript: "Class notes about photosynthesis." }] }] }
};

test("Deepgram sends the uploaded audio bytes and MIME type using the server credential", async () => {
  let request;
  const transcribe = createDeepgramTranscriber({
    env: { DEEPGRAM_API_KEY: "test-server-key" },
    fetchImpl: async (url, options) => {
      request = { url: new URL(url), ...options };
      return { ok: true, json: async () => deepgramPayload };
    }
  });
  const transcript = await transcribe({
    buffer: Buffer.from("audio bytes"),
    mimetype: "audio/webm;codecs=opus"
  });

  assert.equal(transcript, "Class notes about photosynthesis.");
  assert.equal(request.headers.Authorization, "Token test-server-key");
  assert.equal(request.headers["Content-Type"], "audio/webm");
  assert.equal(request.url.searchParams.get("model"), "nova-3");
  assert.equal(request.body.toString(), "audio bytes");
});

test("Deepgram configuration and provider errors are sanitized", async () => {
  const missingKey = createDeepgramTranscriber({ env: {} });
  await assert.rejects(missingKey({ buffer: Buffer.from("audio"), mimetype: "audio/webm" }), error => {
    assert.ok(error instanceof DeepgramError);
    assert.equal(error.statusCode, 503);
    assert.doesNotMatch(error.message, /key/i);
    return true;
  });

  const denied = createDeepgramTranscriber({
    env: { DEEPGRAM_API_KEY: "test-server-key" },
    fetchImpl: async () => ({ ok: false, status: 401, text: async () => "secret test-server-key" })
  });
  await assert.rejects(denied({ buffer: Buffer.from("audio"), mimetype: "audio/webm" }), error => {
    assert.equal(error.statusCode, 502);
    assert.doesNotMatch(error.message, /test-server-key|secret/i);
    return true;
  });
});

test("transcription route accepts multipart audio and returns the transcript", async () => {
  const app = express();
  app.use("/api/transcribe", createTranscribeRouter({
    transcribe: async file => {
      assert.equal(file.mimetype, "audio/webm");
      assert.equal(file.buffer.toString(), "fake audio data");
      return "recognized speech";
    }
  }));
  const server = app.listen(0);
  await new Promise(resolve => server.once("listening", resolve));
  const address = server.address();
  try {
    const form = new FormData();
    form.append("audio", new Blob(["fake audio data"], { type: "audio/webm" }), "recording.webm");
    const response = await fetch(`http://127.0.0.1:${address.port}/api/transcribe`, { method: "POST", body: form });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { transcription: "recognized speech" });

    const missing = await fetch(`http://127.0.0.1:${address.port}/api/transcribe`, { method: "POST", body: new FormData() });
    assert.equal(missing.status, 400);
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test("recording tasks use the selected reasoning model and long-context fallback", async () => {
  const bodies = [];
  const provider = createOllamaProvider({
    env: {
      OLLAMA_API_KEY: "test-server-key",
      OLLAMA_RECORDING_MODEL: "gpt-oss:120b-cloud",
      OLLAMA_LONG_CONTEXT_MODEL: "nemotron-3-nano:30b-cloud"
    },
    fetchImpl: async (_url, options) => {
      bodies.push(JSON.parse(options.body));
      return { ok: true, json: async () => ({ message: { content: "{}" } }) };
    }
  });
  await provider.chat({ messages: [{ role: "user", content: "short transcript" }], task: "recording" });
  await provider.chat({ messages: [{ role: "user", content: "x".repeat(400_001) }], task: "recording" });

  assert.equal(bodies[0].model, "gpt-oss:120b-cloud");
  assert.equal(bodies[0].format, "json");
  assert.equal(bodies[1].model, "nemotron-3-nano:30b-cloud");
  assert.equal(bodies[1].format, "json");
});
