# Aku Code

Aku Code is an open-source AI coding workspace by Aku Apps.

## Demo

This repository includes a working demo UI with project ZIP upload, file indexing, and AI chat. If no AI API key is configured, the chat falls back to demo mode so the site can still be previewed.

## Run locally

1. Copy `.env.example` to `.env.local`.
2. Add `GEMINI_API_KEY` or `GROQ_API_KEY` for real AI responses.
3. Run `npm install`.
4. Run `npm run dev`.

Never commit API keys. `.env.local` is ignored by Git.

## Roadmap

Repository indexing, semantic code search, file editing, diffs, tests, GitHub integration, authentication, and project memory.

## License

MIT
