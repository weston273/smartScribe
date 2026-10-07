# SmartScribe AI backend

This Express service proxies SmartScribe AI requests from the Vercel frontend to Ollama Cloud. It does not run Ollama locally or download models.

## Run locally

From this directory, copy `.env.example` to `.env`, set `OLLAMA_API_KEY`, then run:

```sh
npm install
npm start
```

The server listens on `PORT` or `3001` by default. Keep real credentials out of source control and client-side code.

## Render configuration

Set `OLLAMA_API_KEY` in the Render service environment. `OLLAMA_MODEL` is optional and defaults to `gemma4:31b-cloud`; the existing `ultralong` task defaults to `nemotron-3-nano:30b-cloud` and can be changed with `OLLAMA_LONG_CONTEXT_MODEL`. Keep `DEEPGRAM_API_KEY` configured for transcription. The existing start command (`npm start`, which runs `node index.js`) remains valid.

## API routes

- `POST /api/chat` accepts `{ "messages": [{ "role": "user", "content": "..." }], "task": "chat" }` and returns the existing `choices[0].message.content` response shape. Requests with `stream: true` receive OpenAI-style server-sent events, adapted from Ollama's newline-delimited stream.
- `POST /api/transcribe` accepts multipart form data with an `audio` file and continues to use Deepgram.

The chat route keeps the API key on the backend, retains the existing CORS allowlist and request rate limit, uses Ollama's JSON response mode for quiz-generation tasks, and returns sanitized provider errors.
