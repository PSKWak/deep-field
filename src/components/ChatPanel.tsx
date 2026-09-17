"use client";

import { useEffect, useRef, useState } from "react";
import { suggestedQuestions, type SceneContext } from "@/lib/sceneContext";

type Message = { role: "user" | "assistant"; content: string };

type ChatPanelProps = {
  context: SceneContext;
  onClose: () => void;
};

export default function ChatPanel({ context, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pending]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const next: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setPending(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, context }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Couldn't reach the AI guide. Check your connection.");
    } finally {
      setPending(false);
    }
  }

  const starters = suggestedQuestions(context.mode);

  return (
    <div className="flex h-[26rem] w-80 max-w-[85vw] flex-col rounded-xl border border-white/10 bg-black/70 backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-sm font-medium text-neutral-200">Ask the guide</h2>
        <button
          onClick={onClose}
          aria-label="Close chat"
          className="text-xs text-neutral-500 hover:text-neutral-300"
        >
          Close
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3"
      >
        {messages.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-neutral-500">
              I can see what you&apos;re looking at. Ask me anything about it.
            </p>
            {starters.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-left text-xs text-neutral-300 hover:bg-white/10"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[90%] whitespace-pre-wrap rounded-lg px-2.5 py-1.5 text-xs leading-relaxed ${
              m.role === "user"
                ? "self-end bg-indigo-500/80 text-white"
                : "self-start bg-white/5 text-neutral-300"
            }`}
          >
            {m.content}
          </div>
        ))}

        {pending && (
          <div className="self-start rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-neutral-500">
            Thinking…
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs text-amber-300">
            {error}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-white/10 px-3 py-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this scene…"
          className="min-w-0 flex-1 rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-600 focus:border-indigo-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          className="rounded-md bg-indigo-500 px-3 py-1.5 text-xs text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
