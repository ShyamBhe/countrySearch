import React, { useState } from "react";

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hello! 👋 Type any country name and ask me questions I’ll give you insights about it, based on my knowledge" }
  ]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { type: "user", text: input }]);
    const userMessage = input;
    setInput("");

    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userMessage }),
      });

      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't find info on that country.";

      setMessages(prev => [...prev, { type: "bot", text: reply }]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        { type: "bot", text: "⚠️ Error fetching response. Try again later." }
      ]);
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
      {!isOpen && (
        <div className="chat-float-btn" onClick={() => setIsOpen(true)}>
          💬
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatgpt-box">
          <div className="chat-header">
            AI Country Assistant
            <span className="close-btn" onClick={() => setIsOpen(false)}>✖</span>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.type}`}>
                <div className="bubble">{msg.text}</div>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a country name..."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBox;
