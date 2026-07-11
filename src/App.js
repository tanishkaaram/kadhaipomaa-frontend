import {
  useState,
  useEffect,
  useRef
} from "react";

import "./App.css";

import socket from "./services/socket";

import Login from "./components/Login";
import AdminPage from "./components/AdminPage";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const messageSound =
  new Audio(
    "https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3"
  );

const adjectives = [
  "pink",
  "midnight",
  "ghost",
  "silent",
  "dark",
  "lost",
  "velvet",
  "neon",
  "broken",
  "lonely"
];

const nouns = [
  "fox",
  "pixel",
  "cat",
  "soul",
  "berry",
  "dream",
  "star",
  "heart",
  "cloud",
  "shadow"
];

function App() {

  const [interestInput, setInterestInput] =
    useState("");
  
  const [user, setUser] = useState(null);
  const [guestMode, setGuestMode] = useState(false);
  const [guestStartTime, setGuestStartTime] = useState(null);

useEffect(() => {

  const visited = localStorage.getItem("hasVisited");
  if (!visited) {
    localStorage.setItem("hasVisited", "true");
    setGuestMode(true);
  }

  const unsubscribe = onAuthStateChanged(
    auth,
    (currentUser) => {
      setUser(currentUser);
    }
  );

  return unsubscribe;

}, []);

useEffect(() => {

  if (!guestMode || user)
    return;

  setGuestStartTime(Date.now());

}, [guestMode, user]); 

  const [interests, setInterests] =
    useState([]);

  const [matchedInterests, setMatchedInterests] =
    useState([]);

  const [matching, setMatching] =
    useState(false);

  const [chatStarted, setChatStarted] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [isTyping, setIsTyping] =
    useState(false);

  const [strangerName, setStrangerName] =
    useState("Waiting...");

  const [isBanned, setIsBanned] = useState(false);
  const [banMessage, setBanMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  const [roomId, setRoomId] =
    useState("");

  const [reportCount, setReportCount] =
    useState(0);

  const messagesEndRef =
    useRef(null);

  const typingTimeoutRef =
    useRef(null);

  const [onlineUsers] = useState(

    Math.floor(
      15000 + Math.random() * 25000
    )

  );

  const [randomUsername] = useState(

    `${
      adjectives[
        Math.floor(
          Math.random() *
          adjectives.length
        )
      ]
    }-${
      nouns[
        Math.floor(
          Math.random() *
          nouns.length
        )
      ]
    }-${
      Math.floor(Math.random() * 999)
    }`

  );

  function addInterest(e) {

    if (e.key === "Enter") {

      e.preventDefault();

      if (
        interestInput.trim() !== "" &&
        !interests.includes(
          interestInput
        )
      ) {

        setInterests([
          ...interests,
          interestInput
        ]);

        setInterestInput("");

      }

    }

  }

  function removeInterest(item) {

    setInterests(

      interests.filter(
        (interest) =>
          interest !== item
      )

    );

  }

  function findMatch() {

    socket.emit(

      "find-match",

      {

        username:
          randomUsername,

        interests:
          interests

      }

    );

  }

  function sendMessage() {

    if (message.trim() === "")
      return;

    const newMessage = {

      id: Date.now(),

      roomId: roomId,

      content: message,

      sender: randomUsername,

      seen: false,

      time: new Date()
        .toLocaleTimeString([], {

          hour: "2-digit",

          minute: "2-digit"

        })

    };

    socket.emit(
      "send-message",
      newMessage
    );

    setMessage("");

  }

  useEffect(() => {

    socket.on(

      "matched",

      (data) => {

        setRoomId(
          data.roomId
        );

        setStrangerName(
          data.stranger
        );

        setMatchedInterests(
          data.matchedInterests
        );

        setMatching(false);

        setChatStarted(true);

      }

    );

    socket.on(

      "receive-message",

      (data) => {

        if (
          data.sender !==
          randomUsername
        ) {

          messageSound.play();

          setTimeout(() => {

            socket.emit(

              "message-seen",

              {

                roomId:
                  data.roomId,

                messageId:
                  data.id

              }

            );

          }, 300);

        }

        setMessages((prev) => [
          ...prev,
          data
        ]);

      }

    );

    socket.on(

      "message-seen-update",

      (messageId) => {

        setMessages((prev) =>

          [...prev].map((msg) =>

            msg.id === messageId

              ? {

                  ...msg,

                  seen: true

                }

              : msg

          )

        );

      }

    );

    socket.on(

      "stranger-disconnected",

      () => {

        if (chatStarted) {

          setMessages((prev) => [

            ...prev,

            {

              sender: "System",

              content:
                "⚠ Stranger disconnected"

            }

          ]);

        }

      }

    );

    let typingTimer;

    socket.on(

      "stranger-typing",

      () => {

        setIsTyping(true);

        clearTimeout(
          typingTimer
        );

        typingTimer =
          setTimeout(() => {

            setIsTyping(false);

          }, 1500);

      }

    );

    socket.on("warning", (data) => {
      setWarningMessage(data.message);
      setTimeout(() => setWarningMessage(""), 5000);
    });

    socket.on("banned", (data) => {
      setIsBanned(true);
      setBanMessage(data.message);
      setGuestMode(false);
      setUser(null);
      setChatStarted(false);
      setRoomId("");
      socket.disconnect();
    });
 

    return () => {

      socket.off("matched");

      socket.off(
        "receive-message"
      );

      socket.off(
        "message-seen-update"
      );

      socket.off(
        "stranger-disconnected"
      );

      socket.off(
        "stranger-typing"
      );

      socket.off("warning");
      socket.off("banned");

    };

  }, [chatStarted]);

  useEffect(() => {

    messagesEndRef.current
      ?.scrollIntoView({

        behavior: "smooth"

      });

  }, [messages]);

  useEffect(() => {

    const handleEsc = (e) => {

      if (
        e.key === "Escape" &&
        chatStarted
      ) {

        socket.emit(

          "skip",

          {

            roomId

          }

        );

        setMessages([]);

        setRoomId("");

        setStrangerName(
          "Searching..."
        );

        setMatchedInterests([]);

        setIsTyping(false);

        setChatStarted(false);

        setMatching(true);

        setTimeout(() => {

          findMatch();

        }, 1200);

      }

    };

    window.addEventListener(
      "keydown",
      handleEsc
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleEsc
      );

    };

  }, [chatStarted]);

if (window.location.pathname.startsWith("/admin")) {
  return <AdminPage />;
}

if (isBanned) {
  return (
    <div className="app" style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", color: "white" }}>
      <h1 style={{ color: "#ff4444", fontSize: "3rem", marginBottom: "1rem" }}>BANNED</h1>
      <p style={{ fontSize: "1.2rem", textAlign: "center", maxWidth: "80%" }}>{banMessage}</p>
    </div>
  );
}

if (!user && !guestMode) {

  return (
    <Login
      setUser={setUser}
      setGuestMode={setGuestMode}
    />
  );

}
  return (

    <div className="app">

      {warningMessage && (
        <div style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#ff4444", color: "white", padding: "10px 20px", borderRadius: "8px", zIndex: 1000, fontWeight: "bold" }}>
          {warningMessage}
        </div>
      )}

      <div className="pink-blur blur1"></div>

      <div className="pink-blur blur2"></div>

      <div className="main-card">

        {!matching && !chatStarted ? (

          <>

            <div className="online-count">

              🔥 {onlineUsers}
              {" "}
              online now

            </div>

            <h1 className="logo">
              Kadhaipomaa
            </h1>

            <p className="subtitle">
              404 social life not found.
            </p>

            <div className="chat-icon">
              💬
            </div>

            <h2 className="heading">
              Start Text Chat
            </h2>

            <p className="small-text">
              add interests to find better matches
            </p>

            <div className="interest-box">

              {interests.map(

                (
                  item,
                  index
                ) => (

                  <div
                    className="interest-tag"
                    key={index}
                  >

                    {item}

                    <span
                      onClick={() =>
                        removeInterest(item)
                      }
                    >
                      ✕
                    </span>

                  </div>

                )

              )}

              <input
                type="text"
                placeholder={
                  interests.length === 0
                    ? "type interest..."
                    : ""
                }
                value={
                  interestInput
                }
                onChange={(e) =>
                  setInterestInput(
                    e.target.value
                  )
                }
                onKeyDown={
                  addInterest
                }
              />

            </div>

            <button
              className="start-btn"
              onClick={() => {

                setMatching(true);

                findMatch();

              }}
            >
              Start Chatting
            </button>

          </>

        ) : !chatStarted ? (

          <div className="matching-screen">

            <div className="loader"></div>

            <h2 className="matching-title">
              Finding people...
            </h2>

            <p className="matching-name">

              you are chatting as

              <span>
                {randomUsername}
              </span>

            </p>

          </div>

        ) : (

          <div className="chat-layout">

            <div className="sidebar">

              <h2 className="sidebar-logo">
                Kadhaipomaaa
              </h2>

              <button
                className="new-chat-btn"
                onClick={() => {

                  socket.emit(

                    "skip",

                    {

                      roomId

                    }

                  );

                  setMessages([]);

                  setRoomId("");

                  setStrangerName(
                    "Searching..."
                  );

                  setMatchedInterests([]);

                  setIsTyping(false);

                  setMatching(true);

                  setChatStarted(false);

                  setTimeout(() => {

                    findMatch();

                  }, 1200);

                }}
              >
                + New Chat
              </button>

              <div className="active-chat">

                <div className="active-dot"></div>

                <span>
                  {randomUsername}
                </span>

              </div>

            </div>

            <div className="chat-area">

              <div className="chat-header">

                <div>

                  <h3>
                    {strangerName}
                  </h3>

                  <p>

                    matched on:

                    {

                      matchedInterests
                        .length > 0

                        ? matchedInterests.join(", ")

                        : "random chat"

                    }

                  </p>

                </div>

                <div>

                  <button
                    className="report-btn"
                    onClick={() => {

                      const newCount =
                        reportCount + 1;

                      setReportCount(
                        newCount
                      );

                      if (
                        newCount >= 3
                      ) {

                        alert(
                          "🚫 User blocked after 3 reports"
                        );

                        socket.emit(

                          "skip",

                          {

                            roomId

                          }

                        );

                        setMessages([]);

                        setRoomId("");

                        setStrangerName(
                          "Searching..."
                        );

                        setMatchedInterests([]);

                        setIsTyping(false);

                        setChatStarted(false);

                        setMatching(true);

                        setTimeout(() => {

                          findMatch();

                        }, 1200);

                      } else {

                        alert(

                          `🚨 Report sent (${newCount}/3)`

                        );

                      }

                    }}
                  >
                    Report
                  </button>

                  <button
                    className="leave-btn"
                    onClick={() => {

                      socket.emit(

                        "skip",

                        {

                          roomId

                        }

                      );

                      setMessages([]);

                      setRoomId("");

                      setStrangerName(
                        "Searching..."
                      );

                      setMatchedInterests([]);

                      setIsTyping(false);

                      setChatStarted(false);

                      setMatching(true);

                      setTimeout(() => {

                        findMatch();

                      }, 1200);

                    }}
                  >
                    Skip
                  </button>

                </div>

              </div>

              <div className="messages">

                {messages.map(

                  (
                    msg,
                    index
                  ) => (

                    <div
                      key={index}
                      className={

                        msg.sender ===
                        "System"

                          ? "system-message"

                          : msg.sender ===
                            randomUsername

                            ? "my-message"

                            : "other-message"

                      }
                    >

                      <div>

                        <p>
                          {msg.content}
                        </p>

                        {

                          msg.time && (

                            <span className="msg-time">

                              {msg.time}

                              {

                                msg.sender ===
                                randomUsername && (

                                  <span>

                                    {

                                      msg.seen

                                        ? " ✓✓"

                                        : " ✓"

                                    }

                                  </span>

                                )

                              }

                            </span>

                          )

                        }

                      </div>

                    </div>

                  )

                )}

                {

                  isTyping && (

                    <div className="typing-wrapper">

                      <p className="typing-text">

                        Stranger is typing...

                      </p>

                    </div>

                  )

                }

                <div
                  ref={messagesEndRef}
                ></div>

              </div>

              <div className="message-input-area">

                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => {

                    setMessage(
                      e.target.value
                    );

                    if (
                      !typingTimeoutRef.current
                    ) {

                      socket.emit(

                        "typing",

                        {

                          roomId

                        }

                      );

                    }

                    clearTimeout(

                      typingTimeoutRef.current

                    );

                    typingTimeoutRef.current =
                      setTimeout(() => {

                        typingTimeoutRef.current =
                          null;

                      }, 1500);

                  }}
                  onKeyDown={(e) => {

                    if (
                      e.key === "Enter"
                    ) {

                      sendMessage();

                    }

                  }}
                />

                <button
                  onClick={
                    sendMessage
                  }
                >
                  Send
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}

export default App;