import { useEffect, useState } from "react";

import {
  connectSocket,
  sendMessage
} from "../services/websocket";

function ChatScreen({ username, roomId }) {

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  useEffect(() => {

    connectSocket(roomId, (incomingMessage) => {

      setMessages((prev) => [...prev, incomingMessage]);

    });

  }, [roomId]);

  function handleSend() {

    if (message.trim() === "") return;

    sendMessage({
      sender: username,
      content: message,
      roomId: roomId
    });

    setMessage("");
  }

  return (

    <div className="screen">

      <div className="top-bar">

        <h2>Connected 😏🔥</h2>

        <button className="report-btn">
          Report
        </button>

      </div>

      <div className="chat-box">

        {messages.map((msg, index) => (

          <div className="message" key={index}>

            <strong>{msg.sender}</strong>: {msg.content}

          </div>

        ))}

      </div>

      <input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      <button onClick={handleSend}>
        Send
      </button>

    </div>

  );
}

export default ChatScreen;