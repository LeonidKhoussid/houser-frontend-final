// pages/Messages.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMessages, sendMessage } from "../services/message";

export default function Messages() {
  const { propertyId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const load = async () => {
      const res = await getMessages(propertyId);
      setMessages(res.data);
    };
    load();
  }, [propertyId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(propertyId, {
      content: input,
      receiver_id: messages[0]?.sender_id, // simplified for demo
    });
    setInput("");
    const res = await getMessages(propertyId);
    setMessages(res.data);
  };

  return (
    <div className="flex h-screen">
      <aside className="w-1/4 bg-slate-800 text-white p-4 space-y-2 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        {messages.map((m, i) => (
          <div key={i} className="bg-slate-700 rounded p-2">
            <div className="font-bold">{m.sender?.name || "User"}</div>
            <div className="text-sm text-gray-300 truncate">{m.content}</div>
          </div>
        ))}
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="p-4 border-b text-xl font-bold">
          Chat with {messages[0]?.receiver?.name || "User"}
        </header>

        <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`max-w-lg p-3 rounded-lg ${
                msg.sender_id === messages[0]?.sender_id
                  ? "bg-teal-600 text-white self-start"
                  : "bg-orange-400 text-white self-end ml-auto"
              }`}>
              {msg.content}
              {msg.image && (
                <img src={msg.image} alt="" className="mt-2 rounded-md" />
              )}
            </div>
          ))}
        </div>

        <footer className="p-4 flex gap-2 border-t">
          <input
            className="border p-2 w-full rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message"
          />
          <button
            className="bg-teal-700 text-white px-4 py-2 rounded"
            onClick={handleSend}>
            ➤
          </button>
        </footer>
      </main>
    </div>
  );
}
