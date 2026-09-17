/** Server-only Groq client. Never import this from a client component — it
 * reads GROQ_API_KEY, which must not reach the browser. */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Models are tried in order. Groq retires models on a published schedule —
 * llama-3.1-8b-instant was shut down on 2026-08-16 and every request to it
 * started failing — so a fallback chain means the next deprecation degrades
 * to a slower model instead of taking the guide offline.
 *
 * Override with GROQ_MODEL to pin a specific one.
 * Current list: https://console.groq.com/docs/models
 */
const MODEL_CHAIN = [
  process.env.GROQ_MODEL,
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
].filter((m): m is string => Boolean(m));

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

/** Carries the upstream status so the route can explain what actually went
 * wrong instead of showing one opaque "try again". */
export class GroqRequestError extends Error {
  constructor(
    readonly status: number,
    readonly detail: string,
    readonly model: string
  ) {
    super(`Groq request failed (${status}) for ${model}: ${detail}`);
    this.name = "GroqRequestError";
  }
}

/** A model that no longer exists, so the next candidate is worth trying. */
function isModelUnavailable(status: number, detail: string): boolean {
  if (status === 404) return true;
  if (status !== 400) return false;
  return /model|decommission|deprecat|does not exist/i.test(detail);
}

async function callOnce(
  model: string,
  messages: ChatMessage[],
  systemPrompt: string,
  apiKey: string
): Promise<string> {
  const body: Record<string, unknown> = {
    model,
    temperature: 0.6,
    max_completion_tokens: 700,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  };
  // gpt-oss models are reasoning models; keeping the effort low keeps the
  // guide conversational and fast rather than verbose.
  if (model.startsWith("openai/gpt-oss")) body.reasoning_effort = "low";

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let detail = await res.text();
    try {
      const parsed = JSON.parse(detail);
      detail = parsed?.error?.message ?? detail;
    } catch {
      // keep the raw body
    }
    throw new GroqRequestError(res.status, detail.slice(0, 300), model);
  }

  const data = await res.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || reply.trim() === "") {
    throw new GroqRequestError(502, "Model returned an empty reply", model);
  }
  return reply;
}

export async function callGroqChat(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new GroqNotConfiguredError();

  let lastError: GroqRequestError | null = null;

  for (const model of MODEL_CHAIN) {
    try {
      return await callOnce(model, messages, systemPrompt, apiKey);
    } catch (err) {
      if (!(err instanceof GroqRequestError)) throw err;
      lastError = err;
      // Only a missing model is worth retrying; a bad key or a rate limit
      // would fail identically on every candidate.
      if (!isModelUnavailable(err.status, err.detail)) throw err;
      console.warn(
        `Groq model ${model} unavailable (${err.status}), trying the next one`
      );
    }
  }

  throw (
    lastError ?? new GroqRequestError(500, "No models configured", "none")
  );
}
