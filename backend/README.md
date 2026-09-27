# Aku Code Backend

Small Node.js backend for the Aku Code static frontend.

## Endpoints

- `GET /health` — backend/provider status
- `POST /api/chat` — AI coding chat

Request:

```json
{
  "prompt": "Explain this project",
  "files": [
    { "path": "src/app.js", "content": "..." }
  ]
}
```

## Local run

1. Copy `.env.example` to `.env`.
2. Add a Gemini or Groq API key.
3. Run `npm install`.
4. Run `npm start`.

Keep API keys only in server environment variables. Never commit them.
