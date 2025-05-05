"use client"
import React, { useState, useRef } from "react";

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! I'm your Latvia travel assistant. Ask me anything about traveling in Latvia!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      if (data.reply) {
        setMessages((msgs) => [...msgs, { from: "bot", text: data.reply }]);
      } else {
        setMessages((msgs) => [...msgs, { from: "bot", text: "Sorry, I couldn't get an answer right now." }]);
      }
    } catch {
      setMessages((msgs) => [...msgs, { from: "bot", text: "Sorry, something went wrong." }]);
    }
    setLoading(false);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div>
      {/* Floating Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-3xl focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat bot"
      >
        💬
      </button>
      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 max-w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-blue-600 dark:bg-blue-800 rounded-t-xl">
            <span className="text-white font-semibold">Latvia Travel Chat</span>
            <button className="text-white text-xl" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2" style={{ maxHeight: 350 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[80%] ${msg.from === "user" ? "bg-blue-100 dark:bg-blue-800 text-blue-900 dark:text-blue-100" : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex items-center border-t border-gray-200 dark:border-gray-700 px-2 py-2 bg-gray-50 dark:bg-gray-800 rounded-b-xl">
            <input
              className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-900 dark:text-white"
              type="text"
              placeholder="Ask about Latvia..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              disabled={loading || !input.trim()}
            >
              {loading ? "..." : "Send"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 