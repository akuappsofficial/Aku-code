import http from "node:http";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

const PORT = Number(process.env.PORT || 3000);
const MAX_BODY = 2_000_000;
const MAX_FILES = 80;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "*";

const gemini = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

const headers = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Content-Type": "application/json; charset=utf-8"
};

function send(res, status, data) {
  res.writeHead(status, headers);
  res.end(JSON.stringify(data));
}

function systemPrompt() {
  return [
    "You are Aku Code, an AI coding assistant.",
    "Help users understand, debug, refactor, design, and improve software.",
    "Use supplied project files as context when present.",
    "When suggesting a change, name the file and explain the change.",
    "Never claim that you edited or executed code unless the backend actually did it.",
    "Prefer concise, practical answers with code when useful."
  ].join(" ");
}

async function readBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error("Request too large.");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function chat({ prompt, files = [] }) {
  const safeFiles = Array.isArray(files)
    ? files.slice(0, MAX_FILES).filter(
        f => f && typeof f.path === "string" && typeof f.content === "string"
      )
    : [];

  const context = safeFiles.length
    ? "\n\nPROJECT CONTEXT:\n" +
      safeFiles.map(f => `FILE: ${f.path}\n${f.content.slice(0, 120000)}`).join("\n\n---\n\n")
    : "";

  const user = prompt + context;
  let lastError;

  if (gemini) {
    try {
      const response = await gemini.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.8-flash",
        contents: user,
        config: { systemInstruction: systemPrompt() }
      });
      return { provider: "gemini", answer: response.text || "No response." };
    } catch (error) {
      lastError = error;
    }
  }

  if (groq) {
    try {
      const response = await groq.chat.completions.create({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt() },
          { role: "user", content: user }
        ]
      });
      return {
        provider: "groq",
        answer: response.choices[0]?.message?.content || "No response."
      };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) throw lastError;
  throw new Error("No AI provider configured.");
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    return res.end();
  }

  if (req.method === "GET" && req.url === "/health") {
    return send(res, 200, {
      ok: true,
      service: "aku-code-backend",
      providers: {
        gemini: Boolean(gemini),
        groq: Boolean(groq)
      }
    });
  }

  if (req.method === "POST" && req.url === "/api/chat") {
    try {
      const body = JSON.parse(await readBody(req));
      if (typeof body.prompt !== "string" || !body.prompt.trim()) {
        return send(res, 400, { error: "Prompt is required." });
      }

      const result = await chat({
        prompt: body.prompt.trim(),
        files: body.files
      });

      return send(res, 200, result);
    } catch (error) {
      console.error(error);
      const message = error?.message || "AI request failed.";
      const status = message === "No AI provider configured." ? 503 : 500;
      return send(res, status, { error: message });
    }
  }

  return send(res, 404, { error: "Not found." });
});

server.listen(PORT, () => {
  console.log(`Aku Code backend listening on port ${PORT}`);
});
