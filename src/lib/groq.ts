/** Server-only Groq client. Never import this from a client component — it
 * reads GROQ_API_KEY, which must not reach the browser. */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.1-8b-instant";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export class GroqNotConfiguredError extends Error {
  constructor() {
    super("GROQ_API_KEY is not set");
    this.name = "GroqNotConfiguredError";
  }
}

export async function callGroqChat(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new GroqNotConfiguredError();

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.6,
      max_tokens: 500,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Groq request failed (${res.status}): ${detail}`);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (typeof reply !== "string") {
    throw new Error("Groq returned no message content");
  }
  return reply;
}
