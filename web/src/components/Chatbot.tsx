"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";

const API_URL =
  process.env.NEXT_PUBLIC_CHAT_API_URL ??
  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5154"}/api/chat`;

const FALLBACK_MSG =
  "Bot dang ban, vui long goi Hotline 1900-xxxx de duoc ho tro.";

interface Message {
  role: "user" | "bot";
  text: string;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Xin chao! Toi la tro ly CemeteryIQ. Ban can ho tro gi?\n\nBan co the hoi ve:\n- Cach dat mo phan\n- Tra cuu nguoi da mat\n- Phi dich vu & bao tri\n- Thanh toan",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "user", text }]);
    setMessages((prev) => [...prev, { role: "bot", text: "" }]);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok || !res.body) throw new Error("Bad response");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        // SSE spec: collect data lines, join with \n on empty line
        let dataLines: string[] = [];
        let isDone = false;

        for (const line of lines) {
          const trimmed = line.trim();

          if (trimmed === "event: done" || trimmed.includes("[DONE]")) {
            isDone = true;
            break;
          }

          if (trimmed.startsWith("event: error")) continue;

          if (trimmed.startsWith("data:")) {
            dataLines.push(trimmed.slice("data:".length).trimStart());
            continue;
          }

          // Empty line = end of SSE event, flush accumulated data
          if (trimmed === "" && dataLines.length > 0) {
            const chunk = dataLines.join("\n");
            dataLines = [];
            if (!chunk || chunk === "[DONE]") continue;

            setMessages((prev) => {
              const updated = [...prev];
              const last = updated[updated.length - 1];
              if (last.role === "bot") {
                updated[updated.length - 1] = {
                  ...last,
                  text: last.text + chunk,
                };
              }
              return updated;
            });
          }
        }

        if (isDone) {
          reader.cancel();
          break;
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "bot", text: FALLBACK_MSG };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg
                   flex items-center justify-center text-white text-2xl
                   transition-all hover:scale-110 active:scale-95"
        style={{ backgroundColor: "#1A3C34" }}
        aria-label={open ? "Dong chat" : "Mo chat"}
      >
        {open ? (
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="28" height="28" fill="currentColor" viewBox="0 0 24 24">
            {/* Robot head */}
            <rect x="5" y="7" width="14" height="10" rx="2" />
            {/* Antenna */}
            <line x1="12" y1="7" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="3" r="1.5" />
            {/* Eyes */}
            <circle cx="9" cy="12" r="1.5" fill="#1A3C34" />
            <circle cx="15" cy="12" r="1.5" fill="#1A3C34" />
            {/* Mouth */}
            <rect x="9" y="14.5" width="6" height="1" rx="0.5" fill="#1A3C34" />
            {/* Ears */}
            <rect x="2.5" y="10" width="2" height="4" rx="1" />
            <rect x="19.5" y="10" width="2" height="4" rx="1" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)]
                     flex flex-col rounded-2xl shadow-2xl overflow-hidden
                     border border-gray-200 bg-white"
          style={{ height: "520px" }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 text-white shrink-0"
            style={{ backgroundColor: "#1A3C34" }}
          >
            <span className="text-2xl">💬</span>
            <div className="flex-1">
              <p className="font-semibold text-sm leading-tight">
                Tro ly CemeteryIQ
              </p>
              <p className="text-xs opacity-75">
                Ho tro dat mo phan & tra cuu
              </p>
            </div>
            {isLoading && (
              <span className="text-xs opacity-75 animate-pulse">
                Dang tra loi...
              </span>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === "user" ? "whitespace-pre-wrap" : ""}
                    ${
                      msg.role === "user"
                        ? "text-white rounded-br-sm"
                        : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
                    }`}
                  style={
                    msg.role === "user"
                      ? { backgroundColor: "#1A3C34" }
                      : undefined
                  }
                >
                  {msg.role === "bot" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-1">{children}</ol>,
                        li: ({ children }) => <li className="mb-0.5">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        a: ({ href, children }) => (
                          <a href={href} className="underline text-blue-600" target="_blank" rel="noopener noreferrer">{children}</a>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                  {msg.role === "bot" &&
                    isLoading &&
                    i === messages.length - 1 && (
                      <span className="inline-block w-0.5 h-4 bg-gray-500 ml-0.5 animate-pulse" />
                    )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="flex items-end gap-2 px-3 py-3 border-t border-gray-200 bg-white shrink-0"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Nhap cau hoi... (Enter de gui)"
              disabled={isLoading}
              className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2
                         text-sm outline-none focus:border-[#1A3C34] transition
                         disabled:bg-gray-100 leading-relaxed max-h-24 overflow-y-auto"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="shrink-0 text-white rounded-xl px-4 py-2 text-sm font-medium
                         transition disabled:bg-gray-300 hover:opacity-90"
              style={
                isLoading || !input.trim()
                  ? undefined
                  : { backgroundColor: "#1A3C34" }
              }
            >
              Gui
            </button>
          </form>
        </div>
      )}
    </>
  );
}
