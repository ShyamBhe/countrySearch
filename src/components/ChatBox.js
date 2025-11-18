import React, { useState, useRef, useEffect } from "react";

const ChatBox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hello! 👋 Type any country name and ask me questions I’ll give you insights about it, based on my knowledge",
    },
  ]);

  const messagesEndRef = useRef(null);

  // Auto-scroll whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { type: "user", text: userMessage }]);
    setInput("");

    try {
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userMessage }),
      });

      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't find info on that country.";

      setMessages((prev) => [...prev, { type: "bot", text: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "⚠️ Error fetching response. Try again later." },
      ]);
    }
  };

  return (
    <>
      {!isOpen && (
        <div className="chat-float-btn" onClick={() => setIsOpen(true)}>
          💬
        </div>
      )}

      {isOpen && (
        <div className="chatgpt-box">
          <div className="chat-header">
            Country Assistant Chatbot
            <span className="close-btn" onClick={() => setIsOpen(false)}>
              ✖
            </span>
          </div>

          <div className="chat-messages" style={{ maxHeight: "300px", overflowY: "auto" }}>
            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.type}`}>
                <div className="bubble">{msg.text}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={sendMessage} className="chat-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type the country related questions.."
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBox;
