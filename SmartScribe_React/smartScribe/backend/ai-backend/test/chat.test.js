import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { createChatRouter } from "../routes/chat.js";
import { createOllamaProvider } from "../services/ollama.js";

async function withChatServer(provider, run) {
  const app = express();
  app.use(express.json());
  app.use("/api/chat", createChatRouter(provider));
  const server = app.listen(0);

  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();

  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

const validMessages = [
  { role: "system", content: "Be concise." },
  { role: "user", content: "Hello." }
];

test("chat route preserves the existing non-streaming response contract", async () => {
  const provider = {
    async chat({ messages, task }) {
      assert.deepEqual(messages, validMessages);
      assert.equal(task, "chat");
      return "Hello from the AI.";
    },
    async *stream() {}
  };

  await withChatServer(provider, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: validMessages, task: "chat" })
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      choices: [{ message: { content: "Hello from the AI." } }]
    });
  });
});

test("chat route rejects malformed message arrays", async () => {
  await withChatServer({ chat: async () => "unused", async *stream() {} }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "visitor", content: "Hello" }] })
    });

    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /messages array/i);
  });
});

test("chat route adapts streaming chunks to the existing SSE response format", async () => {
  const provider = {
    async chat() { return "unused"; },
    async *stream() {
      yield "Hello";
      yield " there";
    }
  };

  await withChatServer(provider, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: validMessages, stream: true })
    });
    const body = await response.text();

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /text\/event-stream/);
    assert.match(body, /"delta":\{"content":"Hello"\}/);
    assert.match(body, /"delta":\{"content":" there"\}/);
    assert.match(body, /data: \[DONE\]/);
  });
});

test("missing Ollama key returns a safe configuration error without calling the network", async () => {
  const provider = createOllamaProvider({
    env: {},
    fetchImpl: async () => {
      throw new Error("Network should not be called");
    }
  });

  await withChatServer(provider, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: validMessages })
    });

    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "AI service is not configured." });
  });
});

test("streaming provider response is normalized from fragmented Ollama NDJSON", async () => {
  const provider = createOllamaProvider({
    env: { OLLAMA_API_KEY: "test-only-key" },
    fetchImpl: async (_url, options) => {
      assert.equal(JSON.parse(options.body).stream, true);
      return {
        ok: true,
        status: 200,
        body: (async function* () {
          yield Buffer.from('{"message":{"content":"Hello"},');
          yield Buffer.from('"done":false}\n{"message":{"content":" world"},"done":false}\n');
          yield Buffer.from('{"message":{"content":""},"done":true}\n');
        })()
      };
    }
  });

  const chunks = [];
  for await (const chunk of provider.stream({ messages: validMessages })) chunks.push(chunk);
  assert.deepEqual(chunks, ["Hello", " world"]);
});

test("Ollama chat uses the cloud endpoint and safely handles malformed or unauthorized responses", async () => {
  let capturedRequest;
  const provider = createOllamaProvider({
    env: { OLLAMA_API_KEY: "test-only-key", OLLAMA_MODEL: "gemma4:31b-cloud" },
    fetchImpl: async (url, options) => {
      capturedRequest = { url, options };
      return { ok: true, status: 200, json: async () => ({ message: { content: "A useful answer." } }) };
    }
  });

  assert.equal(await provider.chat({ messages: validMessages, task: "summarize" }), "A useful answer.");
  assert.equal(capturedRequest.url, "https://ollama.com/api/chat");
  assert.equal(capturedRequest.options.headers.Authorization, "Bearer test-only-key");
  assert.deepEqual(JSON.parse(capturedRequest.options.body), {
    model: "gemma4:31b-cloud",
    messages: validMessages,
    stream: false
  });

  await provider.chat({ messages: validMessages, task: "quiz" });
  assert.equal(JSON.parse(capturedRequest.options.body).format, "json");

  await provider.chat({ messages: validMessages, task: "ultralong" });
  assert.equal(JSON.parse(capturedRequest.options.body).model, "nemotron-3-nano:30b-cloud");

  const unauthorized = createOllamaProvider({
    env: { OLLAMA_API_KEY: "test-only-key" },
    fetchImpl: async () => ({
      ok: false,
      status: 401,
      text: async () => "provider response containing sensitive details"
    })
  });
  await assert.rejects(unauthorized.chat({ messages: validMessages }), (error) => {
    assert.equal(error.statusCode, 502);
    assert.equal(error.message, "AI service authentication failed.");
    assert.doesNotMatch(error.message, /sensitive details|test-only-key/i);
    return true;
  });

  const malformed = createOllamaProvider({
    env: { OLLAMA_API_KEY: "test-only-key" },
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ message: { content: 4 } }) })
  });
  await assert.rejects(malformed.chat({ messages: validMessages }), (error) => {
    assert.equal(error.statusCode, 502);
    assert.equal(error.message, "AI service returned an invalid response.");
    return true;
  });

  const throttled = createOllamaProvider({
    env: { OLLAMA_API_KEY: "test-only-key" },
    fetchImpl: async () => ({ ok: false, status: 429 })
  });
  await assert.rejects(throttled.chat({ messages: validMessages }), (error) => {
    assert.equal(error.statusCode, 429);
    assert.equal(error.message, "AI service is busy. Please try again shortly.");
    return true;
  });

  const unavailable = createOllamaProvider({
    env: { OLLAMA_API_KEY: "test-only-key" },
    fetchImpl: async () => ({ ok: false, status: 404 })
  });
  await assert.rejects(unavailable.chat({ messages: validMessages }), (error) => {
    assert.equal(error.statusCode, 502);
    assert.equal(error.message, "The configured AI model is unavailable.");
    return true;
  });
});

test("network failures and request timeouts return controlled errors", async () => {
  const networkFailure = createOllamaProvider({
    env: { OLLAMA_API_KEY: "test-only-key" },
    fetchImpl: async () => {
      throw new Error("private transport detail");
    }
  });
  await assert.rejects(networkFailure.chat({ messages: validMessages }), (error) => {
    assert.equal(error.statusCode, 503);
    assert.equal(error.message, "AI service is temporarily unavailable.");
    assert.doesNotMatch(error.message, /private transport detail|test-only-key/i);
    return true;
  });

  const timeout = createOllamaProvider({
    env: { OLLAMA_API_KEY: "test-only-key" },
    timeoutMs: 5,
    fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener("abort", () => {
        const error = new Error("aborted");
        error.name = "AbortError";
        reject(error);
      }, { once: true });
    })
  });
  await assert.rejects(timeout.chat({ messages: validMessages }), (error) => {
    assert.equal(error.statusCode, 504);
    assert.equal(error.message, "AI service request timed out. Please try again.");
    return true;
  });
});
