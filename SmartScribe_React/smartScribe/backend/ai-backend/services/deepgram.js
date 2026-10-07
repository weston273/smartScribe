import fetch from "node-fetch";

const DEEPGRAM_LISTEN_URL = "https://api.deepgram.com/v1/listen";

export class DeepgramError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "DeepgramError";
    this.statusCode = statusCode;
  }
}

export function createDeepgramTranscriber({
  env = process.env,
  fetchImpl = fetch,
  timeoutMs = 180_000
} = {}) {
  return async function transcribe(file) {
    const apiKey = env.DEEPGRAM_API_KEY?.trim();
    if (!apiKey) throw new DeepgramError(503, "Transcription service is not configured.");
    if (!file?.buffer?.length || !file.mimetype?.startsWith("audio/")) {
      throw new DeepgramError(400, "A valid audio recording is required.");
    }

    const url = new URL(DEEPGRAM_LISTEN_URL);
    url.searchParams.set("model", "nova-3");
    url.searchParams.set("smart_format", "true");
    url.searchParams.set("punctuate", "true");
    url.searchParams.set("paragraphs", "true");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": file.mimetype.split(";")[0].trim()
        },
        body: file.buffer,
        signal: controller.signal
      });
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new DeepgramError(502, "Transcription service authentication failed.");
        }
        if (response.status === 429) {
          throw new DeepgramError(429, "Transcription service is busy. Please try again shortly.");
        }
        throw new DeepgramError(502, "Transcription service could not process this recording.");
      }

      let data;
      try {
        data = await response.json();
      } catch {
        throw new DeepgramError(502, "Transcription service returned an invalid response.");
      }
      const transcription = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
      if (typeof transcription !== "string") {
        throw new DeepgramError(502, "Transcription service returned an invalid response.");
      }
      return transcription.trim();
    } catch (error) {
      if (error instanceof DeepgramError) throw error;
      if (controller.signal.aborted) {
        throw new DeepgramError(504, "Transcription timed out. Please try again.");
      }
      throw new DeepgramError(503, "Transcription service is temporarily unavailable.");
    } finally {
      clearTimeout(timeout);
    }
  };
}

export const transcribeWithDeepgram = createDeepgramTranscriber();
