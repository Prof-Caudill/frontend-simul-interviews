import React, { useState, useEffect, useRef } from "react";
import "./App.css"; // ✅ This is correct — it imports your styles

function App() {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [persona, setPersona] = useState("");
  const [personas, setPersonas] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetch("https://backend-simul-interviews-10092025.onrender.com/") // replace with your backend URL
      .then(res => res.json())
      .then(data => setPersonas(data.available_personas || []));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!message || !persona) return;
    const response = await fetch("https://backend-simul-interviews-10092025.onrender.com/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, persona }),
    });
    const data = await response.json();
    setChatHistory([...chatHistory, { sender: "user", text: message }, { sender: "bot", text: data.response }]);
    setMessage("");
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
        onKeyDown={handleKeyPress}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default App;
