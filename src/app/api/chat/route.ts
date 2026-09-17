import {
  callGroqChat,
  GroqNotConfiguredError,
  type ChatMessage,
} from "@/lib/groq";
import { buildSystemPrompt, type SceneContext } from "@/lib/sceneContext";

const MAX_MESSAGES = 12;
const MAX_CHARS = 2000;

export async function POST(request: Request) {
  let body: { messages?: unknown; context?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : null;
  if (!messages || messages.length === 0) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  const clean: ChatMessage[] = [];
  for (const m of messages.slice(-MAX_MESSAGES)) {
    if (
      typeof m !== "object" ||
      m === null ||
      typeof (m as ChatMessage).content !== "string"
    ) {
      return Response.json({ error: "Malformed message" }, { status: 400 });
    }
    const role = (m as ChatMessage).role;
    if (role !== "user" && role !== "assistant") {
      return Response.json({ error: "Malformed message role" }, { status: 400 });
    }
    clean.push({ role, content: (m as ChatMessage).content.slice(0, MAX_CHARS) });
  }

  const context = (body.context ?? { mode: "stars" }) as SceneContext;

  try {
    const reply = await callGroqChat(clean, buildSystemPrompt(context));
    return Response.json({ reply });
  } catch (err) {
    if (err instanceof GroqNotConfiguredError) {
      return Response.json(
        {
          error:
            "The AI guide isn't configured yet. Add a free GROQ_API_KEY from console.groq.com to .env.local and restart the dev server.",
        },
        { status: 503 }
      );
    }
    console.error("Chat request failed:", err);
    return Response.json(
      { error: "The AI guide couldn't answer right now. Try again." },
      { status: 502 }
    );
  }
}
