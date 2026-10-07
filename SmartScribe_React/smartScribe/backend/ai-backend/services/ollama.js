import fetch from "node-fetch";

const OLLAMA_CHAT_URL = "https://ollama.com/api/chat";
const DEFAULT_MODEL = "gemma4:31b-cloud";
const DEFAULT_LONG_CONTEXT_MODEL = "nemotron-3-nano:30b-cloud";
const DEFAULT_TIMEOUT_MS = 120_000;

export class OllamaProviderError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "OllamaProviderError";
    this.statusCode = statusCode;
  }
}

function providerErrorForStatus(status) {
  if (status === 401 || status === 403) {
    return new OllamaProviderError(502, "AI service authentication failed.");
  }
  if (status === 429) {
    return new OllamaProviderError(429, "AI service is busy. Please try again shortly.");
  }
  if (status === 404) {
    return new OllamaProviderError(502, "The configured AI model is unavailable.");
  }
  if (status >= 500) {
    return new OllamaProviderError(503, "AI service is temporarily unavailable.");
  }
  return new OllamaProviderError(502, "AI service could not process the request.");
}

function invalidResponseError() {
  return new OllamaProviderError(502, "AI service returned an invalid response.");
}

function parseStreamLine(line) {
  if (!line.trim()) return null;

  let event;
  try {
    event = JSON.parse(line);
  } catch {
    throw invalidResponseError();
  }

  if (!event || typeof event !== "object" || Array.isArray(event)) {
    throw invalidResponseError();
  }
  if (event.error) {
    throw new OllamaProviderError(502, "AI service could not complete the response.");
  }

  const content = event.message?.content;
  if (content !== undefined && typeof content !== "string") {
    throw invalidResponseError();
  }

  return { content: content || "", done: event.done === true };
}

export function createOllamaProvider({
  env = process.env,
  fetchImpl = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS
} = {}) {
  async function startRequest({ messages, task, stream }) {
    const apiKey = env.OLLAMA_API_KEY?.trim();
    if (!apiKey) {
      throw new OllamaProviderError(503, "AI service is not configured.");
    }

    const model = task === "ultralong"
      ? (env.OLLAMA_LONG_CONTEXT_MODEL?.trim() || DEFAULT_LONG_CONTEXT_MODEL)
      : (env.OLLAMA_MODEL?.trim() || DEFAULT_MODEL);
    const requestBody = { model, messages, stream };
    if (task === "quiz") requestBody.format = "json";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    let response;
    try {
      response = await fetchImpl(OLLAMA_CHAT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
    } catch {
      clearTimeout(timeout);
      if (controller.signal.aborted) {
        throw new OllamaProviderError(504, "AI service request timed out. Please try again.");
      }
      throw new OllamaProviderError(503, "AI service is temporarily unavailable.");
    }

    if (!response.ok) {
      clearTimeout(timeout);
      throw providerErrorForStatus(response.status);
    }

    return { response, timeout, controller };
  }

  return {
    async chat({ messages, task }) {
      const { response, timeout, controller } = await startRequest({ messages, task, stream: false });
      try {
        let data;
        try {
          data = await response.json();
        } catch {
          if (controller.signal.aborted) {
            throw new OllamaProviderError(504, "AI service request timed out. Please try again.");
          }
          throw invalidResponseError();
        }

        const content = data?.message?.content;
        if (typeof content !== "string" || !content.trim()) {
          throw invalidResponseError();
        }
        return content;
      } finally {
        clearTimeout(timeout);
      }
    },

    async *stream({ messages, task }) {
      const { response, timeout, controller } = await startRequest({ messages, task, stream: true });
      let contentReceived = false;
      let pending = "";
      const decoder = new TextDecoder();
      let completionReceived = false;

      try {
        if (!response.body || typeof response.body[Symbol.asyncIterator] !== "function") {
          throw invalidResponseError();
        }

        for await (const chunk of response.body) {
          pending += decoder.decode(chunk, { stream: true });
          let newlineIndex = pending.indexOf("\n");

          while (newlineIndex >= 0) {
            const line = pending.slice(0, newlineIndex).replace(/\r$/, "");
            pending = pending.slice(newlineIndex + 1);
            const event = parseStreamLine(line);
            if (event?.done) completionReceived = true;
            if (event?.content) {
              contentReceived = true;
              yield event.content;
            }
            newlineIndex = pending.indexOf("\n");
          }
        }

        pending += decoder.decode();
        const finalEvent = parseStreamLine(pending.replace(/\r$/, ""));
        if (finalEvent?.done) completionReceived = true;
        if (finalEvent?.content) {
          contentReceived = true;
          yield finalEvent.content;
        }

        if (!contentReceived || !completionReceived) {
          throw invalidResponseError();
        }
      } catch (error) {
        if (error instanceof OllamaProviderError) throw error;
        if (controller.signal.aborted) {
          throw new OllamaProviderError(504, "AI service request timed out. Please try again.");
        }
        throw invalidResponseError();
      } finally {
        clearTimeout(timeout);
      }
    }
  };
}

export const ollamaProvider = createOllamaProvider();
