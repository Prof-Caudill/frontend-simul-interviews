import React, { useState, useEffect, useRef } from "react";
import "./App.css"; // ✅ Styles

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [persona, setPersona] = useState("");
  const [personas, setPersonas] = useState([]);
  const chatEndRef = useRef(null);

  // Use environment variable for backend URL
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Load personas from backend
    fetch(`${API_BASE_URL}/`)
      .then((res) => res.json())
      .then((data) => setPersonas(data.available_personas || []))
      .catch((err) => console.error("Error fetching personas:", err));
  }, [API_BASE_URL]);

  useEffect(() => {
    // Auto-scroll to the latest message
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!message || !persona) return;

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, persona }),
      });
      const data = await response.json();

      setChatHistory([
        ...chatHistory,
        { sender: "user", text: message },
        { sender: "bot", text: data.response },
      ]);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-container">
      <h2>Simulated Interview Chat</h2>
      <select onChange={(e) => setPersona(e.target.value)} value={persona}>
        <option value="">Select Persona</option>
        {personas.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <div className="chat-history">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <input
        type="text"
        value={message}
        placeholder="Type your message..."
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress} // ✅ Enter key works
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
