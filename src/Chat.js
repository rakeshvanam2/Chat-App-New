import React, { useState, useEffect, useRef } from "react";
import { Picker } from "emoji-mart";
import "./App.css";
import io from "socket.io-client";

const user_list = [
  {
    name: "Alan",
    profilePic:
      "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?size=626&ext=jpg"
  },
  {
    name: "Bob",
    profilePic:
      "https://img.freepik.com/free-photo/portrait-white-man-isolated_53876-40306.jpg?size=626&ext=jpg"
  },
  {
    name: "Carol",
    profilePic:
      "https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg?size=626&ext=jpg"
  },
  {
    name: "Dean",
    profilePic:
      "https://t3.ftcdn.net/jpg/06/14/47/88/240_F_614478832_qnDFma11Q7leSlOGLqOSiqgkKYGfpPKf.jpg"
  },
  {
    name: "Elin",
    profilePic:
      "https://img.freepik.com/free-photo/close-up-portrait-curly-handsome-european-male_176532-8133.jpg?size=626&ext=jpg&ga=GA1.2.907501171.1690892617&semt=ais"
  }
];

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionList, setMentionList] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
    socketRef.current.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const handleInputChange = (event) => {
    const inputMessage = event.target.value;
    setMessageInput(inputMessage);

    if (inputMessage.endsWith("@")) {
      const mentionTag = inputMessage.slice(inputMessage.lastIndexOf("@") + 1);
      const mentionedUsers = user_list.filter((user) =>
        user.name.toLowerCase().includes(mentionTag.toLowerCase())
      );
      setMentionList(mentionedUsers);
    } else {
      setMentionList([]);
    }
  };

  const handleSendMessage = () => {
    if (messageInput.trim() === "") return;

    const randomUsername =
      activeUser || user_list[Math.floor(Math.random() * user_list.length)];
    const newMessage = {
      id: Date.now(),
      username: randomUsername.name,
      message: messageInput,
      likes: 0
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessageInput("");

    socketRef.current.emit("newMessage", newMessage);
  };

  const handleLikeMessage = (id) => {
    setMessages((prevMessages) =>
      prevMessages.map((message) =>
        message.id === id ? { ...message, likes: message.likes + 1 } : message
      )
    );
  };

  const handleUserSelect = (user) => {
    setActiveUser(user);
  };

  const handleMentionSelect = (user) => {
    setMentionList([]);
    const mentionTag = `@${user.name} `;
    setMessageInput((prevMessageInput) => prevMessageInput + mentionTag);
  };

  const handleEmojiSelect = (emoji) => {
    setMessageInput((prevMessageInput) => prevMessageInput + emoji.native);
    setShowEmojiPicker(false);
  };

  return (
    <div className="app">
      <div className="chat-box">
        <div className="user-list">
          <h3>ExactSpace</h3>
          <ul>
            {user_list.map((user, index) => (
              <li
                key={index}
                className={`user ${activeUser === user ? "active" : ""}`}
                onClick={() => handleUserSelect(user)}
              >
                <img src={user.profilePic} alt="Profile" />
                <span>{user.name}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="message-board">
          {activeUser && (
            <div className="user-profile">
              <img src={activeUser.profilePic} alt="Profile" />
              <span>{activeUser.name}</span>
            </div>
          )}
          <div className="message-thread">
            {messages
              .filter((message) => message.username === activeUser?.name)
              .map((message) => (
                <div key={message.id} className="message">
                  {/* Show sender's profile image in the message content */}
                  <div className="message-content">
                    <img
                      src="https://images.yourstory.com/cs/images/companies/download281-1646133436752.jpg?fm=auto&ar=1:1&mode=fill&fill=solid&fill-color=fff"
                      alt="Profile"
                    />
                    <span className="username">ExactSpace</span>
                    <span className="message-text">{message.message}</span>
                  </div>
                  <div className="message-actions">
                    <button onClick={() => handleLikeMessage(message.id)}>
                      Like ({message.likes})
                    </button>
                  </div>
                </div>
              ))}
          </div>
          <div className="input-box">
            <input
              type="text"
              placeholder="Type your message..."
              value={messageInput}
              onChange={handleInputChange}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
          {/* Show the emoji picker */}
          {showEmojiPicker && (
            <div className="emoji-picker">
              <Picker onSelect={handleEmojiSelect} />
            </div>
          )}
          {/* Show the mention list */}
          {mentionList.length > 0 && (
            <div className="mention-list">
              {mentionList.map((user) => (
                <div
                  key={user.name}
                  className="mention-user"
                  onClick={() => handleMentionSelect(user)}
                >
                  {user.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
